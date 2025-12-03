import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { supabase, seedDatabase, getSetupSQL, initializeDatabase, checkTablesExist } from "./database.tsx";

const app = new Hono();

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7af4432d/health", (c) => {
  return c.json({ status: "ok", message: "Servidor funcionando! Configure o banco de dados executando o SQL disponível em /setup-sql" });
});

// Endpoint para obter o SQL de setup
app.get("/make-server-7af4432d/setup-sql", (c) => {
  return c.text(getSetupSQL());
});

// ========== ROTAS DE AUTENTICAÇÃO ==========

// Registrar novo usuário
app.post("/make-server-7af4432d/auth/register", async (c) => {
  try {
    console.log('🔵 Iniciando registro de novo usuário...');
    const body = await c.req.json();
    const { nome, email, senha, telefone, tipo } = body;
    
    console.log('📝 Dados recebidos:', { nome, email, tipo, telefone });

    // Criar usuário no Supabase Auth (método público)
    console.log('🔐 Criando usuário no Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { 
          nome, 
          telefone, 
          tipo: tipo || 'estudante' 
        }
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário no Auth:', authError);
      return c.json({ error: authError.message || 'Erro ao criar conta' }, 400);
    }

    if (!authData.user) {
      console.error('❌ Nenhum usuário retornado pelo Auth');
      return c.json({ error: 'Erro ao criar usuário' }, 400);
    }

    console.log('✅ Usuário criado no Auth:', authData.user.id);

    // Criar registro na tabela usuarios
    console.log('💾 Criando registro na tabela usuarios...');
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios_7af4432d')
      .insert({
        id: authData.user.id,
        nome,
        email,
        senha_hash: 'managed_by_supabase_auth',
        telefone,
        tipo: tipo || 'estudante'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Erro ao criar usuário no banco:', dbError);
      return c.json({ error: dbError.message || 'Erro ao salvar dados do usuário' }, 400);
    }

    // Se o tipo for embaixador, criar registro na tabela embaixadores
    if (tipo === 'embaixador') {
      console.log('👤 Criando registro de embaixador...');
      const codigo_embaixador = `EMB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const { error: embError } = await supabase
        .from('embaixadores_7af4432d')
        .insert({
          usuario_id: authData.user.id,
          codigo_embaixador,
          status: 'ativo',
          total_coletas_validadas: 0
        });

      if (embError) {
        console.error('⚠️ Erro ao criar registro de embaixador:', embError);
        // Não retornar erro, apenas logar
      } else {
        console.log('✅ Registro de embaixador criado com código:', codigo_embaixador);
      }
    }

    console.log('✅ Usuário registrado com sucesso!');
    return c.json({ 
      success: true, 
      user: usuario,
      message: 'Usuário registrado com sucesso!' 
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao registrar usuário:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Erro ao registrar usuário' 
    }, 500);
  }
});

// Login
app.post("/make-server-7af4432d/auth/login", async (c) => {
  try {
    console.log('🔵 Iniciando login...');
    const { email, senha } = await c.req.json();
    console.log('📝 Email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      console.error('❌ Erro ao fazer login:', error.message);
      return c.json({ error: error.message || 'Email ou senha incorretos' }, 401);
    }

    if (!data.user) {
      console.error('❌ Nenhum usuário retornado');
      return c.json({ error: 'Erro ao fazer login' }, 401);
    }

    console.log('✅ Login bem-sucedido, buscando dados do usuário...');

    // Buscar dados completos do usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios_7af4432d')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('⚠️ Erro ao buscar dados do usuário:', userError);
      // Retornar dados do Auth mesmo se não encontrar no banco
      return c.json({
        success: true,
        access_token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          nome: data.user.user_metadata?.nome || 'Usuário',
          chaves_impacto: 0,
          nivel: 1
        }
      });
    }

    console.log('✅ Login completo com sucesso!');
    return c.json({
      success: true,
      access_token: data.session.access_token,
      user: usuario
    });
  } catch (error) {
    console.error('❌ Erro inesperado no login:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Erro ao fazer login' 
    }, 500);
  }
});

// ========== ROTAS DE USUÁRIOS ==========

// Obter perfil do usuário autenticado
app.get("/make-server-7af4432d/users/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data: usuario, error } = await supabase
      .from('usuarios_7af4432d')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(usuario);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return c.json({ error: 'Erro ao obter perfil' }, 500);
  }
});

// Atualizar chaves de impacto do usuário
app.put("/make-server-7af4432d/users/:id/chaves", async (c) => {
  try {
    const userId = c.req.param('id');
    const { chaves } = await c.req.json();

    const { data, error } = await supabase
      .from('usuarios_7af4432d')
      .update({ 
        chaves_impacto: chaves,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar chaves:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.error('Erro ao atualizar chaves:', error);
    return c.json({ error: 'Erro ao atualizar chaves' }, 500);
  }
});

// ========== ROTAS DE ESTAÇÕES ==========

// Listar todas as estações ativas
app.get("/make-server-7af4432d/estacoes", async (c) => {
  try {
    const { data, error } = await supabase
      .from('estacoes_7af4432d')
      .select(`
        *,
        instituicoes_7af4432d (
          nome,
          tipo
        )
      `)
      .eq('ativa', true)
      .order('nome');

    if (error) {
      console.error('Erro ao listar estações:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Erro ao listar estações:', error);
    return c.json({ error: 'Erro ao listar estações' }, 500);
  }
});

// Criar nova estação
app.post("/make-server-7af4432d/estacoes", async (c) => {
  try {
    const estacao = await c.req.json();

    const { data, error } = await supabase
      .from('estacoes_7af4432d')
      .insert(estacao)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar estação:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data);
  } catch (error) {
    console.error('Erro ao criar estação:', error);
    return c.json({ error: 'Erro ao criar estação' }, 500);
  }
});

// ========== ROTAS DE COLETAS ==========

// Taxas de chaves por material
const TAXAS_MATERIAL: Record<string, number> = {
  'papel': 2,
  'plástico': 3,
  'plastico': 3,
  'vidro': 4,
  'metal': 5,
  'eletrônico': 10,
  'eletronico': 10
};

// Registrar nova coleta
app.post("/make-server-7af4432d/coletas", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { estacao_id, peso_kg, material_tipo, observacoes } = await c.req.json();

    // Calcular chaves ganhas baseado no material
    const taxa = TAXAS_MATERIAL[material_tipo.toLowerCase()] || 1;
    const chaves_ganhas = Math.floor(peso_kg * taxa);

    // Criar coleta
    const { data: coleta, error: coletaError } = await supabase
      .from('coletas_7af4432d')
      .insert({
        usuario_id: user.id,
        estacao_id,
        peso_kg,
        material_tipo,
        chaves_ganhas,
        status: 'pendente',
        observacoes
      })
      .select()
      .single();

    if (coletaError) {
      console.error('Erro ao criar coleta:', coletaError);
      return c.json({ error: coletaError.message }, 400);
    }

    // Atualizar chaves do usuário (apenas quando validada)
    // Por enquanto, vamos adicionar direto para fins de demonstração
    const { error: updateError } = await supabase
      .from('usuarios_7af4432d')
      .update({ 
        chaves_impacto: supabase.raw(`chaves_impacto + ${chaves_ganhas}`)
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar chaves do usuário:', updateError);
    }

    return c.json({ 
      success: true, 
      coleta,
      chaves_ganhas 
    });
  } catch (error) {
    console.error('Erro ao registrar coleta:', error);
    return c.json({ error: 'Erro ao registrar coleta' }, 500);
  }
});

// Validar coleta pelo embaixador (com QR code)
app.post("/make-server-7af4432d/coletas/validar", async (c) => {
  try {
    console.log('🔵 Iniciando validação de coleta...');
    
    const { usuario_id, estacao_id, peso_kg, material_tipo, embaixador_id, observacoes } = await c.req.json();
    
    console.log('📝 Dados recebidos:', { usuario_id, peso_kg, material_tipo });

    // Calcular chaves ganhas baseado no material
    const taxa = TAXAS_MATERIAL[material_tipo.toLowerCase()] || 1;
    const chaves_ganhas = Math.floor(peso_kg * taxa);
    
    console.log('💎 Chaves calculadas:', chaves_ganhas, `(${peso_kg}kg × ${taxa})`);

    // Criar coleta com status validada
    const { data: coleta, error: coletaError } = await supabase
      .from('coletas_7af4432d')
      .insert({
        usuario_id,
        estacao_id,
        embaixador_id,
        peso_kg,
        material_tipo,
        chaves_ganhas,
        status: 'validada',
        observacoes
      })
      .select()
      .single();

    if (coletaError) {
      console.error('❌ Erro ao criar coleta:', coletaError);
      return c.json({ error: coletaError.message }, 400);
    }

    console.log('✅ Coleta registrada:', coleta.id);

    // Buscar usuário atual
    const { data: usuario, error: userError } = await supabase
      .from('usuarios_7af4432d')
      .select('chaves_impacto, nivel')
      .eq('id', usuario_id)
      .single();

    if (userError) {
      console.error('⚠️ Erro ao buscar usuário:', userError);
    }

    const chaves_anteriores = usuario?.chaves_impacto || 0;
    const novas_chaves = chaves_anteriores + chaves_ganhas;

    // Atualizar chaves do usuário
    const { error: updateError } = await supabase
      .from('usuarios_7af4432d')
      .update({ 
        chaves_impacto: novas_chaves,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', usuario_id);

    if (updateError) {
      console.error('❌ Erro ao atualizar chaves do usuário:', updateError);
      return c.json({ error: 'Erro ao atualizar chaves' }, 500);
    }

    console.log('💰 Chaves atualizadas:', `${chaves_anteriores} → ${novas_chaves}`);

    // Atualizar contador de validações do embaixador
    if (embaixador_id) {
      const { error: embError } = await supabase
        .from('embaixadores_7af4432d')
        .update({
          total_coletas_validadas: supabase.raw('total_coletas_validadas + 1')
        })
        .eq('id', embaixador_id);

      if (embError) {
        console.error('⚠️ Erro ao atualizar contador do embaixador:', embError);
      } else {
        console.log('✅ Contador do embaixador atualizado');
      }
    }

    console.log('🎉 Validação concluída com sucesso!');

    return c.json({ 
      success: true, 
      coleta,
      chaves_ganhas,
      chaves_totais: novas_chaves
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao validar coleta:', error);
    return c.json({ error: 'Erro ao validar coleta' }, 500);
  }
});

// Verificar dados do usuário via QR code
app.post("/make-server-7af4432d/usuarios/verificar-qr", async (c) => {
  try {
    const { usuario_id } = await c.req.json();
    
    const { data: usuario, error } = await supabase
      .from('usuarios_7af4432d')
      .select('id, nome, email, chaves_impacto, nivel, tipo, foto_url')
      .eq('id', usuario_id)
      .single();

    if (error || !usuario) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    return c.json(usuario);
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return c.json({ error: 'Erro ao verificar usuário' }, 500);
  }
});

// Listar coletas do usuário
app.get("/make-server-7af4432d/coletas/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data, error } = await supabase
      .from('coletas_7af4432d')
      .select(`
        *,
        estacoes_7af4432d (
          nome,
          endereco
        )
      `)
      .eq('usuario_id', user.id)
      .order('data_coleta', { ascending: false });

    if (error) {
      console.error('Erro ao listar coletas:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Erro ao listar coletas:', error);
    return c.json({ error: 'Erro ao listar coletas' }, 500);
  }
});

// Ranking de usuários por chaves
app.get("/make-server-7af4432d/ranking", async (c) => {
  try {
    const { data, error } = await supabase
      .from('usuarios_7af4432d')
      .select('id, nome, chaves_impacto, nivel, foto_url')
      .order('chaves_impacto', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao buscar ranking:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    return c.json({ error: 'Erro ao buscar ranking' }, 500);
  }
});

// ========== ROTAS DE COMÉRCIOS E VANTAGENS ==========

// Listar todos os comércios ativos
app.get("/make-server-7af4432d/comercios", async (c) => {
  try {
    const { data, error } = await supabase
      .from('comercios_7af4432d')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao listar comércios:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Erro ao listar comércios:', error);
    return c.json({ error: 'Erro ao listar comércios' }, 500);
  }
});

// Listar todas as vantagens ativas
app.get("/make-server-7af4432d/vantagens", async (c) => {
  try {
    const { data, error } = await supabase
      .from('vantagens_7af4432d')
      .select(`
        *,
        comercios_7af4432d (
          nome,
          categoria,
          endereco
        )
      `)
      .eq('ativa', true)
      .order('custo_chaves');

    if (error) {
      console.error('Erro ao listar vantagens:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Erro ao listar vantagens:', error);
    return c.json({ error: 'Erro ao listar vantagens' }, 500);
  }
});

// Resgatar vantagem
app.post("/make-server-7af4432d/resgates", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { vantagem_id } = await c.req.json();

    // Buscar vantagem
    const { data: vantagem, error: vantagemError } = await supabase
      .from('vantagens_7af4432d')
      .select('*')
      .eq('id', vantagem_id)
      .single();

    if (vantagemError || !vantagem) {
      return c.json({ error: 'Vantagem não encontrada' }, 404);
    }

    // Buscar usuário
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_7af4432d')
      .select('*')
      .eq('id', user.id)
      .single();

    if (usuarioError || !usuario) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    // Verificar se tem chaves suficientes
    if (usuario.chaves_impacto < vantagem.custo_chaves) {
      return c.json({ error: 'Chaves insuficientes' }, 400);
    }

    // Verificar nível mínimo
    if (usuario.nivel < vantagem.nivel_minimo) {
      return c.json({ error: 'Nível insuficiente' }, 400);
    }

    // Gerar código único de resgate
    const codigo_resgate = `CJS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calcular data de validade
    const data_validade = vantagem.validade_dias 
      ? new Date(Date.now() + vantagem.validade_dias * 24 * 60 * 60 * 1000)
      : null;

    // Criar resgate
    const { data: resgate, error: resgateError } = await supabase
      .from('resgates_7af4432d')
      .insert({
        usuario_id: user.id,
        vantagem_id,
        codigo_resgate,
        data_validade,
        status: 'ativo'
      })
      .select()
      .single();

    if (resgateError) {
      console.error('Erro ao criar resgate:', resgateError);
      return c.json({ error: resgateError.message }, 400);
    }

    // Deduzir chaves do usuário
    const { error: updateError } = await supabase
      .from('usuarios_7af4432d')
      .update({ 
        chaves_impacto: usuario.chaves_impacto - vantagem.custo_chaves,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar chaves do usuário:', updateError);
      return c.json({ error: 'Erro ao processar resgate' }, 500);
    }

    return c.json({ 
      success: true, 
      resgate,
      chaves_restantes: usuario.chaves_impacto - vantagem.custo_chaves
    });
  } catch (error) {
    console.error('Erro ao resgatar vantagem:', error);
    return c.json({ error: 'Erro ao resgatar vantagem' }, 500);
  }
});

// Listar resgates do usuário
app.get("/make-server-7af4432d/resgates/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data, error } = await supabase
      .from('resgates_7af4432d')
      .select(`
        *,
        vantagens_7af4432d (
          titulo,
          descricao,
          comercios_7af4432d (
            nome,
            categoria,
            endereco
          )
        )
      `)
      .eq('usuario_id', user.id)
      .order('data_resgate', { ascending: false });

    if (error) {
      console.error('Erro ao listar resgates:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Erro ao listar resgates:', error);
    return c.json({ error: 'Erro ao listar resgates' }, 500);
  }
});

// ========== ROTAS DE EMBAIXADORES ==========

// Obter dados do embaixador
app.get("/make-server-7af4432d/embaixadores/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data, error } = await supabase
      .from('embaixadores_7af4432d')
      .select(`
        *,
        embaixadores_estacoes_7af4432d (
          estacao_id,
          estacoes_7af4432d (
            id,
            nome,
            endereco
          )
        )
      `)
      .eq('usuario_id', user.id)
      .single();

    if (error) {
      return c.json({ error: 'Embaixador não encontrado' }, 404);
    }

    return c.json(data);
  } catch (error) {
    console.error('Erro ao buscar embaixador:', error);
    return c.json({ error: 'Erro ao buscar embaixador' }, 500);
  }
});

// Listar coletas pendentes da estação do embaixador
app.get("/make-server-7af4432d/embaixadores/coletas-pendentes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Buscar estações do embaixador
    const { data: embaixador } = await supabase
      .from('embaixadores_7af4432d')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (!embaixador) {
      return c.json({ error: 'Embaixador não encontrado' }, 404);
    }

    const { data: estacoes } = await supabase
      .from('embaixadores_estacoes_7af4432d')
      .select('estacao_id')
      .eq('embaixador_id', embaixador.id);

    if (!estacoes || estacoes.length === 0) {
      return c.json([]);
    }

    const estacao_ids = estacoes.map(e => e.estacao_id);

    // Buscar coletas pendentes dessas estações
    const { data, error } = await supabase
      .from('coletas_7af4432d')
      .select(`
        *,
        usuarios_7af4432d (
          nome,
          email,
          foto_url
        ),
        estacoes_7af4432d (
          nome,
          endereco
        )
      `)
      .in('estacao_id', estacao_ids)
      .eq('status', 'pendente')
      .order('data_coleta', { ascending: false });

    if (error) {
      console.error('Erro ao listar coletas pendentes:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json(data || []);
  } catch (error) {
    console.error('Erro ao listar coletas pendentes:', error);
    return c.json({ error: 'Erro ao listar coletas pendentes' }, 500);
  }
});

// Utilizar resgate (para comércios)
app.post("/make-server-7af4432d/resgates/:codigo/utilizar", async (c) => {
  try {
    const codigo = c.req.param('codigo');
    
    console.log('🔵 Utilizando resgate:', codigo);

    // Buscar resgate
    const { data: resgate, error: resgateError } = await supabase
      .from('resgates_7af4432d')
      .select(`
        *,
        usuarios_7af4432d (
          nome,
          email,
          chaves_impacto,
          nivel
        ),
        vantagens_7af4432d (
          titulo,
          descricao,
          custo_chaves,
          comercios_7af4432d (
            nome,
            categoria
          )
        )
      `)
      .eq('codigo_resgate', codigo)
      .single();

    if (resgateError || !resgate) {
      console.error('❌ Resgate não encontrado');
      return c.json({ error: 'Código de resgate inválido' }, 404);
    }

    // Verificar se já foi utilizado
    if (resgate.status === 'utilizado') {
      console.error('❌ Resgate já utilizado');
      return c.json({ error: 'Este resgate já foi utilizado' }, 400);
    }

    // Verificar se está expirado
    if (resgate.data_validade && new Date(resgate.data_validade) < new Date()) {
      console.error('❌ Resgate expirado');
      return c.json({ error: 'Este resgate expirou' }, 400);
    }

    // Marcar como utilizado
    const { error: updateError } = await supabase
      .from('resgates_7af4432d')
      .update({
        status: 'utilizado',
        data_utilizacao: new Date().toISOString()
      })
      .eq('id', resgate.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar resgate:', updateError);
      return c.json({ error: 'Erro ao processar resgate' }, 500);
    }

    console.log('✅ Resgate utilizado com sucesso!');

    return c.json({
      success: true,
      resgate,
      mensagem: 'Resgate utilizado com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao utilizar resgate:', error);
    return c.json({ error: 'Erro ao utilizar resgate' }, 500);
  }
});

// ========== ROTAS DE FOTO DE PERFIL ==========

// Atualizar foto de perfil
app.post("/make-server-7af4432d/usuarios/atualizar-foto", async (c) => {
  try {
    console.log('🔵 Atualizando foto de perfil...');
    const { usuario_id, foto_base64 } = await c.req.json();

    if (!usuario_id || !foto_base64) {
      return c.json({ error: 'ID do usuário e foto são obrigatórios' }, 400);
    }

    // Atualizar foto no banco de dados
    const { data, error } = await supabase
      .from('usuarios_7af4432d')
      .update({ 
        foto_url: foto_base64,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', usuario_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar foto:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ Foto atualizada com sucesso!');
    return c.json({ 
      success: true, 
      usuario: data,
      message: 'Foto atualizada com sucesso!' 
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar foto:', error);
    return c.json({ error: 'Erro ao atualizar foto' }, 500);
  }
});

// Remover foto de perfil
app.post("/make-server-7af4432d/usuarios/remover-foto", async (c) => {
  try {
    console.log('🔵 Removendo foto de perfil...');
    const { usuario_id } = await c.req.json();

    if (!usuario_id) {
      return c.json({ error: 'ID do usuário é obrigatório' }, 400);
    }

    // Remover foto do banco de dados (setar como null)
    const { data, error } = await supabase
      .from('usuarios_7af4432d')
      .update({ 
        foto_url: null,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', usuario_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao remover foto:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ Foto removida com sucesso!');
    return c.json({ 
      success: true, 
      usuario: data,
      message: 'Foto removida com sucesso!' 
    });
  } catch (error) {
    console.error('❌ Erro ao remover foto:', error);
    return c.json({ error: 'Erro ao remover foto' }, 500);
  }
});

// ========== ROTAS AUXILIARES ==========

// Verificar se o banco de dados está inicializado
app.get("/make-server-7af4432d/check-database", async (c) => {
  try {
    const exists = await checkTablesExist();
    return c.json({ initialized: exists });
  } catch (error) {
    return c.json({ initialized: false, error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
});

// Inicializar banco de dados automaticamente
app.post("/make-server-7af4432d/init-database", async (c) => {
  try {
    // Verificar se já está inicializado
    const exists = await checkTablesExist();
    if (exists) {
      return c.json({ 
        success: true, 
        message: 'Banco de dados já está inicializado',
        already_initialized: true
      });
    }
    
    // Inicializar tabelas e dados
    const result = await initializeDatabase();
    
    if (result.success) {
      return c.json({ 
        success: true, 
        message: 'Banco de dados inicializado com sucesso!',
        already_initialized: false
      });
    } else {
      return c.json({ 
        success: false, 
        needsManualSetup: result.needsManualSetup || false,
        error: result.message || 'Erro ao inicializar banco de dados' 
      }, 500);
    }
  } catch (error) {
    return c.json({ 
      success: false,
      needsManualSetup: true,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao inicializar banco' 
    }, 500);
  }
});

// Popular banco com dados de exemplo
app.post("/make-server-7af4432d/seed", async (c) => {
  try {
    const result = await seedDatabase();
    return c.json(result);
  } catch (error) {
    console.error('Erro ao popular banco:', error);
    return c.json({ error: 'Erro ao popular banco' }, 500);
  }
});

Deno.serve(app.fetch);

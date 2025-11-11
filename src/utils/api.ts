import { createClient } from './supabase/client';

// Cliente Supabase
const supabase = createClient();

// ============================================
// API - USUÁRIOS
// ============================================

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  curso?: string;
  periodo?: string;
  chaves_impacto: number;
  nivel: number;
  tipo: string;
  foto_url?: string;
  criado_em: string;
  atualizado_em: string;
}

// ============================================
// API - EMBAIXADORES
// ============================================

export interface Embaixador {
  id: string;
  usuario_id: string;
  codigo_embaixador: string;
  status: string;
  total_coletas_validadas: number;
  criado_em: string;
}

// ============================================
// API - QR CODE SEGURO
// ============================================

/**
 * Gera um token QR Code seguro para o usuário
 * O token expira em 5 minutos e só pode ser usado uma vez
 */
export async function gerarTokenQRCode(usuario_id: string) {
  try {
    const { data, error } = await supabase.rpc('gerar_token_qrcode', {
      p_usuario_id: usuario_id
    });

    if (error) throw error;
    return { token: data, success: true };
  } catch (error: any) {
    console.error('Erro ao gerar token QR Code:', error);
    return { error: error.message, success: false };
  }
}

/**
 * Valida um token QR Code escaneado
 * Retorna os dados do usuário se válido, ou erro se inválido/expirado
 */
export async function validarTokenQRCode(token: string) {
  try {
    const { data, error } = await supabase.rpc('validar_token_qrcode', {
      p_token: token
    });

    if (error) throw error;
    
    if (!data || !data.valido) {
      return { 
        success: false, 
        error: data?.mensagem || 'Token inválido ou expirado' 
      };
    }

    return { 
      success: true, 
      usuario: data.usuario 
    };
  } catch (error: any) {
    console.error('Erro ao validar token QR Code:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar QR Code' 
    };
  }
}

export async function buscarEmbaixadorPorUsuario(usuario_id: string) {
  const { data, error } = await supabase
    .from('embaixadores')
    .select('*')
    .eq('usuario_id', usuario_id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return { embaixador: data };
}

export async function criarEmbaixador(usuario_id: string) {
  // Gerar código único de embaixador
  const codigo = `EMB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('embaixadores')
    .insert({
      usuario_id,
      codigo_embaixador: codigo,
      status: 'ativo',
      total_coletas_validadas: 0
    })
    .select()
    .single();
  
  if (error) throw error;
  return { embaixador: data };
}

// ============================================
// API - INSTITUIÇÕES
// ============================================

export interface Instituicao {
  id: string;
  nome: string;
  tipo?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  criado_em: string;
}

export async function listarInstituicoes() {
  const { data, error } = await supabase
    .from('instituicoes')
    .select('*')
    .order('nome');
  
  if (error) throw error;
  return { instituicoes: data };
}

// ============================================
// API - ESTAÇÕES
// ============================================

export interface Estacao {
  id: string;
  instituicao_id?: string;
  nome: string;
  endereco?: string;
  lat?: number;
  lng?: number;
  materiais_aceitos?: string[];
  horario_funcionamento?: string;
  ativa: boolean;
  criado_em: string;
}

export async function listarEstacoes() {
  const { data, error } = await supabase
    .from('estacoes')
    .select('*')
    .eq('ativa', true)
    .order('nome');
  
  if (error) throw error;
  return { estacoes: data };
}

export async function buscarEstacao(id: string) {
  const { data, error } = await supabase
    .from('estacoes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { estacao: data };
}

// ============================================
// API - COLETAS
// ============================================

export interface Coleta {
  id: string;
  usuario_id: string;
  estacao_id: string;
  embaixador_id?: string;
  peso_kg: number;
  material_tipo: string;
  chaves_ganhas: number;
  data_coleta: string;
  status: 'pendente' | 'validada' | 'rejeitada';
  observacoes?: string;
  criado_em: string;
}

export async function criarColeta(dados: {
  usuario_id: string;
  estacao_id: string;
  material_tipo: string;
  peso_kg: number;
}) {
  // Calcular chaves ganhas (10 chaves por kg)
  const chaves_ganhas = Math.floor(dados.peso_kg * 10);
  
  const { data, error } = await supabase
    .from('coletas')
    .insert({
      usuario_id: dados.usuario_id,
      estacao_id: dados.estacao_id,
      material_tipo: dados.material_tipo,
      peso_kg: dados.peso_kg,
      chaves_ganhas,
      status: 'pendente',
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return { coleta: data };
}

export async function validarColeta(
  coleta_id: string,
  embaixador_id: string,
  aprovado: boolean
) {
  if (!aprovado) {
    const { data, error } = await supabase
      .from('coletas')
      .update({ 
        status: 'rejeitada',
        embaixador_id
      })
      .eq('id', coleta_id)
      .select()
      .single();
    
    if (error) throw error;
    return { coleta: data };
  }

  // Buscar a coleta
  const { data: coleta, error: coletaError } = await supabase
    .from('coletas')
    .select('*')
    .eq('id', coleta_id)
    .single();
  
  if (coletaError) throw coletaError;

  // Atualizar coleta como validada
  const { data: coletaAtualizada, error: updateError } = await supabase
    .from('coletas')
    .update({ 
      status: 'validada',
      embaixador_id
    })
    .eq('id', coleta_id)
    .select()
    .single();
  
  if (updateError) throw updateError;

  // Adicionar chaves ao usuário
  const { error: userError } = await supabase.rpc('increment_chaves', {
    user_id: coleta.usuario_id,
    chaves: coleta.chaves_ganhas
  });
  
  // Se a function não existir, fazer update manual
  if (userError && userError.message.includes('function')) {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('chaves_impacto')
      .eq('id', coleta.usuario_id)
      .single();
    
    if (usuario) {
      await supabase
        .from('usuarios')
        .update({ chaves_impacto: usuario.chaves_impacto + coleta.chaves_ganhas })
        .eq('id', coleta.usuario_id);
    }
  } else if (userError) {
    throw userError;
  }

  return { coleta: coletaAtualizada };
}

export async function listarColetasUsuario(usuario_id: string) {
  const { data, error } = await supabase
    .from('coletas')
    .select(`
      *,
      estacoes (
        id,
        nome,
        endereco
      )
    `)
    .eq('usuario_id', usuario_id)
    .order('data_coleta', { ascending: false });
  
  if (error) throw error;
  return { coletas: data };
}

export async function listarColetasPendentes() {
  const { data, error } = await supabase
    .from('coletas')
    .select(`
      *,
      usuarios (
        id,
        nome,
        email
      ),
      estacoes (
        id,
        nome
      )
    `)
    .eq('status', 'pendente')
    .order('data_coleta', { ascending: false });
  
  if (error) throw error;
  return { coletas: data };
}

// ============================================
// API - COMÉRCIOS
// ============================================

export interface Comercio {
  id: string;
  nome: string;
  categoria?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logo_url?: string;
  descricao?: string;
  ativo: boolean;
  criado_em: string;
}

export async function listarComercios() {
  const { data, error } = await supabase
    .from('comercios')
    .select('*')
    .eq('ativo', true)
    .order('nome');
  
  if (error) throw error;
  return { comercios: data };
}

// ============================================
// API - VANTAGENS
// ============================================

export interface Vantagem {
  id: string;
  comercio_id: string;
  titulo: string;
  descricao?: string;
  custo_chaves: number;
  nivel_minimo: number;
  validade_dias?: number;
  categoria?: string;
  ativa: boolean;
  criado_em: string;
  comercios?: Comercio;
}

export async function listarVantagens() {
  const { data, error } = await supabase
    .from('vantagens')
    .select(`
      *,
      comercios (
        id,
        nome,
        categoria,
        logo_url
      )
    `)
    .eq('ativa', true)
    .order('custo_chaves');
  
  if (error) throw error;
  return { vantagens: data };
}

export async function buscarVantagem(id: string) {
  const { data, error } = await supabase
    .from('vantagens')
    .select(`
      *,
      comercios (
        id,
        nome,
        categoria,
        endereco,
        logo_url
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { vantagem: data };
}

// ============================================
// API - RESGATES
// ============================================

export interface Resgate {
  id: string;
  usuario_id: string;
  vantagem_id: string;
  codigo_resgate: string;
  data_resgate: string;
  data_validade?: string;
  data_utilizacao?: string;
  status: 'ativo' | 'utilizado' | 'expirado';
  criado_em: string;
  vantagens?: Vantagem;
}

export async function resgatarVantagem(usuario_id: string, vantagem_id: string) {
  // Buscar dados do usuário e vantagem
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('chaves_impacto, nivel')
    .eq('id', usuario_id)
    .single();
  
  if (userError) throw userError;

  const { data: vantagem, error: vantagemError } = await supabase
    .from('vantagens')
    .select('*')
    .eq('id', vantagem_id)
    .single();
  
  if (vantagemError) throw vantagemError;

  // Validações
  if (usuario.chaves_impacto < vantagem.custo_chaves) {
    throw new Error('Chaves insuficientes');
  }

  if (usuario.nivel < vantagem.nivel_minimo) {
    throw new Error('Nível insuficiente');
  }

  // Gerar código de resgate único
  const codigo_resgate = `CJS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Calcular data de validade
  let data_validade = null;
  if (vantagem.validade_dias) {
    const validade = new Date();
    validade.setDate(validade.getDate() + vantagem.validade_dias);
    data_validade = validade.toISOString();
  }

  // Criar resgate
  const { data: resgate, error: resgateError } = await supabase
    .from('resgates')
    .insert({
      usuario_id,
      vantagem_id,
      codigo_resgate,
      data_validade,
      status: 'ativo'
    })
    .select()
    .single();
  
  if (resgateError) throw resgateError;

  // Deduzir chaves do usuário
  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ 
      chaves_impacto: usuario.chaves_impacto - vantagem.custo_chaves 
    })
    .eq('id', usuario_id);
  
  if (updateError) throw updateError;

  return { resgate };
}

export async function listarResgatesUsuario(usuario_id: string) {
  const { data, error } = await supabase
    .from('resgates')
    .select(`
      *,
      vantagens (
        id,
        titulo,
        descricao,
        categoria,
        comercio_id,
        comercios (
          id,
          nome,
          categoria,
          endereco,
          telefone,
          logo_url
        )
      )
    `)
    .eq('usuario_id', usuario_id)
    .order('data_resgate', { ascending: false });
  
  if (error) throw error;
  return { resgates: data };
}

export async function utilizarResgate(resgate_id: string) {
  const { data, error } = await supabase
    .from('resgates')
    .update({ 
      status: 'utilizado',
      data_utilizacao: new Date().toISOString()
    })
    .eq('id', resgate_id)
    .select()
    .single();
  
  if (error) throw error;
  return { resgate: data };
}

// ============================================
// API - RANKING
// ============================================

export interface RankingUsuario {
  posicao?: number;
  id: string;
  nome: string;
  chaves_impacto: number;
  nivel: number;
  foto_url?: string;
}

export async function buscarRanking(limit: number = 10) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, chaves_impacto, nivel, foto_url')
    .order('chaves_impacto', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  // Adicionar posição
  const ranking = data.map((user, index) => ({
    ...user,
    posicao: index + 1
  }));
  
  return { ranking };
}

// ============================================
// API - ESTATÍSTICAS
// ============================================

export interface Estatisticas {
  total_usuarios: number;
  total_coletas: number;
  total_kg_reciclados: number;
  total_estacoes: number;
  total_resgates: number;
  total_chaves_distribuidas: number;
  coletas_pendentes: number;
}

export async function buscarEstatisticas() {
  // Buscar contagens em paralelo
  const [usuarios, coletas, estacoes, resgates] = await Promise.all([
    supabase.from('usuarios').select('id, chaves_impacto', { count: 'exact' }),
    supabase.from('coletas').select('id, peso_kg, status', { count: 'exact' }),
    supabase.from('estacoes').select('id', { count: 'exact' }),
    supabase.from('resgates').select('id', { count: 'exact' })
  ]);

  const total_kg_reciclados = coletas.data?.reduce((sum, c) => sum + (c.peso_kg || 0), 0) || 0;
  const total_chaves_distribuidas = usuarios.data?.reduce((sum, u) => sum + (u.chaves_impacto || 0), 0) || 0;
  const coletas_pendentes = coletas.data?.filter(c => c.status === 'pendente').length || 0;

  return {
    estatisticas: {
      total_usuarios: usuarios.count || 0,
      total_coletas: coletas.count || 0,
      total_kg_reciclados,
      total_estacoes: estacoes.count || 0,
      total_resgates: resgates.count || 0,
      total_chaves_distribuidas,
      coletas_pendentes
    }
  };
}

// ============================================
// AUTH HELPER
// ============================================

export const auth = {
  async signIn(email: string, password: string) {
    // Buscar usuário pelo email
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase())
      .limit(1);
    
    if (error) {
      console.error('Login error:', error);
      throw new Error('Erro ao buscar usuário');
    }

    if (!usuarios || usuarios.length === 0) {
      throw new Error('Email ou senha incorretos');
    }

    const user = usuarios[0];

    // Verificar senha (comparação simples - em produção use bcrypt)
    const senhaHash = btoa(password); // Base64 simples
    if (user.senha_hash !== senhaHash) {
      throw new Error('Email ou senha incorretos');
    }

    // Buscar se é embaixador
    const { data: embaixador } = await supabase
      .from('embaixadores')
      .select('*')
      .eq('usuario_id', user.id)
      .single();

    const userData = {
      ...user,
      is_embaixador: !!embaixador,
      embaixador_id: embaixador?.id
    };

    // Salvar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    return { user: userData };
  },

  async signUp(dados: {
    email: string;
    password: string;
    nome: string;
    telefone?: string;
    universidade?: string;
    curso?: string;
    tipo?: string;
  }) {
    // Verificar se email já existe
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', dados.email.toLowerCase())
      .single();

    if (existente) {
      throw new Error('User already registered');
    }

    // Hash simples da senha (em produção use bcrypt)
    const senha_hash = btoa(dados.password);

    // Criar usuário
    const { data: user, error } = await supabase
      .from('usuarios')
      .insert({
        nome: dados.nome,
        email: dados.email.toLowerCase(),
        senha_hash,
        telefone: dados.telefone,
        curso: dados.curso,
        tipo: dados.tipo || 'estudante',
        chaves_impacto: 0,
        nivel: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    // Se for embaixador, criar registro na tabela embaixadores
    if (dados.tipo === 'embaixador') {
      try {
        const codigo = `EMB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        await supabase
          .from('embaixadores')
          .insert({
            usuario_id: user.id,
            codigo_embaixador: codigo,
            status: 'ativo',
            total_coletas_validadas: 0
          });
        console.log('✅ Embaixador criado com código:', codigo);
      } catch (embError) {
        console.error('⚠️ Erro ao criar embaixador:', embError);
        // Não falhar o cadastro se der erro ao criar embaixador
      }
    }

    // Salvar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return { user };
  },

  async signOut() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Carregar foto do localStorage se existir
    const savedPhoto = localStorage.getItem(`profile_photo_${user.id || 'default'}`);
    if (savedPhoto) {
      user.foto_url = savedPhoto;
    }
    
    return user;
  },

  updateCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  async resetPassword(email: string) {
    try {
      // Verificar se o email existe no banco
      const { data: usuarios, error: searchError } = await supabase
        .from('usuarios')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (searchError) {
        console.error('Error checking email:', searchError);
        throw new Error('Erro ao verificar email');
      }

      // Mesmo se não encontrar, retornamos sucesso por segurança (não revelar se email existe)
      // Mas só enviamos email se existir
      if (usuarios && usuarios.length > 0) {
        // Usar Supabase Auth para enviar email de recuperação
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (resetError) {
          console.error('Password reset error:', resetError);
          throw new Error('Erro ao enviar email de recuperação');
        }
      }

      // Sempre retornar sucesso para não revelar se o email existe
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};
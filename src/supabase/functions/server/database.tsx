import { createClient } from "jsr:@supabase/supabase-js@2";

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Retorna o SQL completo para criação das tabelas
 * Este SQL deve ser executado manualmente no painel do Supabase
 */
export function getSetupSQL(): string {
  return `
-- ============================================
-- CIRCUITO JOVEM SUSTENTÁVEL - DATABASE SETUP
-- Execute este SQL no painel do Supabase (SQL Editor)
-- ============================================

-- 1. USUARIOS - Entidade Central
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  curso VARCHAR(255),
  periodo VARCHAR(50),
  chaves_impacto INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  tipo VARCHAR(50) DEFAULT 'estudante',
  foto_url TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- 2. INSTITUICOES
CREATE TABLE IF NOT EXISTS instituicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 3. ESTACOES - Relacionamento N:1 com INSTITUICOES
CREATE TABLE IF NOT EXISTS estacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instituicao_id UUID REFERENCES instituicoes(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  endereco TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  materiais_aceitos TEXT[],
  horario_funcionamento TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estacoes_instituicao ON estacoes(instituicao_id);

-- 4. EMBAIXADORES - Relacionamento 1:1 com USUARIOS
CREATE TABLE IF NOT EXISTS embaixadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  codigo_embaixador VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'ativo',
  total_coletas_validadas INTEGER DEFAULT 0,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embaixadores_usuario ON embaixadores(usuario_id);

-- 5. EMBAIXADORES_ESTACOES - Tabela Associativa N:N
CREATE TABLE IF NOT EXISTS embaixadores_estacoes (
  embaixador_id UUID REFERENCES embaixadores(id) ON DELETE CASCADE,
  estacao_id UUID REFERENCES estacoes(id) ON DELETE CASCADE,
  data_atribuicao TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (embaixador_id, estacao_id)
);

CREATE INDEX IF NOT EXISTS idx_emb_est_embaixador ON embaixadores_estacoes(embaixador_id);
CREATE INDEX IF NOT EXISTS idx_emb_est_estacao ON embaixadores_estacoes(estacao_id);

-- 6. COLETAS - Relacionamentos com USUARIO, EMBAIXADOR e ESTACAO
CREATE TABLE IF NOT EXISTS coletas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estacao_id UUID NOT NULL REFERENCES estacoes(id) ON DELETE CASCADE,
  embaixador_id UUID REFERENCES embaixadores(id) ON DELETE SET NULL,
  peso_kg DECIMAL(10, 2) NOT NULL,
  material_tipo VARCHAR(100) NOT NULL,
  chaves_ganhas INTEGER DEFAULT 0,
  data_coleta TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pendente',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coletas_usuario ON coletas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_coletas_estacao ON coletas(estacao_id);
CREATE INDEX IF NOT EXISTS idx_coletas_status ON coletas(status);

-- 7. COMERCIOS
CREATE TABLE IF NOT EXISTS comercios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 8. VANTAGENS - Relacionamento N:1 com COMERCIOS
CREATE TABLE IF NOT EXISTS vantagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  custo_chaves INTEGER NOT NULL,
  nivel_minimo INTEGER DEFAULT 1,
  validade_dias INTEGER,
  categoria VARCHAR(100),
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vantagens_comercio ON vantagens(comercio_id);
CREATE INDEX IF NOT EXISTS idx_vantagens_ativa ON vantagens(ativa);

-- 9. RESGATES - Tabela Associativa N:N entre USUARIOS e VANTAGENS
CREATE TABLE IF NOT EXISTS resgates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  vantagem_id UUID NOT NULL REFERENCES vantagens(id) ON DELETE CASCADE,
  codigo_resgate VARCHAR(100) UNIQUE NOT NULL,
  data_resgate TIMESTAMP DEFAULT NOW(),
  data_validade TIMESTAMP,
  data_utilizacao TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resgates_usuario ON resgates(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resgates_vantagem ON resgates(vantagem_id);
CREATE INDEX IF NOT EXISTS idx_resgates_status ON resgates(status);

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- Inserir instituição de exemplo
INSERT INTO instituicoes (nome, tipo, endereco, telefone)
VALUES 
  ('UNINASSAU Graças', 'Universidade', 'Rua das Graças, 123 - Recife/PE', '(81) 3333-4444'),
  ('UFPE', 'Universidade', 'Av. Prof. Moraes Rego, 1235 - Recife/PE', '(81) 2126-8000')
ON CONFLICT DO NOTHING;

-- Inserir estações de exemplo
INSERT INTO estacoes (instituicao_id, nome, endereco, lat, lng, materiais_aceitos, horario_funcionamento)
SELECT 
  i.id,
  'Estação Central - ' || i.nome,
  i.endereco,
  -8.0476,
  -34.8770,
  ARRAY['plástico', 'papel', 'metal', 'vidro'],
  'Segunda a Sexta: 8h às 18h'
FROM instituicoes i
WHERE NOT EXISTS (SELECT 1 FROM estacoes)
LIMIT 2;

-- Inserir comércios de exemplo
INSERT INTO comercios (nome, categoria, endereco, descricao)
VALUES 
  ('Café Sustentável', 'Alimentação', 'Rua do Café, 100 - Recife/PE', 'Café orgânico e sustentável'),
  ('Livraria Verde', 'Cultura', 'Av. dos Livros, 200 - Recife/PE', 'Livros e produtos eco-friendly'),
  ('Academia EcoFit', 'Saúde', 'Rua Fitness, 300 - Recife/PE', 'Academia com práticas sustentáveis')
ON CONFLICT DO NOTHING;

-- Inserir vantagens de exemplo
INSERT INTO vantagens (comercio_id, titulo, descricao, custo_chaves, nivel_minimo)
SELECT 
  c.id,
  CASE 
    WHEN c.categoria = 'Alimentação' THEN 'Café Grátis'
    WHEN c.categoria = 'Cultura' THEN '20% de Desconto em Livros'
    ELSE '1 Semana Grátis'
  END,
  CASE 
    WHEN c.categoria = 'Alimentação' THEN 'Um café expresso grátis'
    WHEN c.categoria = 'Cultura' THEN 'Desconto em qualquer livro da loja'
    ELSE 'Acesso gratuito à academia por uma semana'
  END,
  CASE 
    WHEN c.categoria = 'Alimentação' THEN 50
    WHEN c.categoria = 'Cultura' THEN 100
    ELSE 200
  END,
  1
FROM comercios c
WHERE NOT EXISTS (SELECT 1 FROM vantagens);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores_estacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE vantagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates ENABLE ROW LEVEL SECURITY;

-- Drop políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Qualquer um pode criar usuário" ON usuarios;
DROP POLICY IF EXISTS "Permitir leitura de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir criação de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir atualização de usuários" ON usuarios;
DROP POLICY IF EXISTS "Instituições são públicas" ON instituicoes;
DROP POLICY IF EXISTS "Estações são públicas" ON estacoes;
DROP POLICY IF EXISTS "Comércios são públicos" ON comercios;
DROP POLICY IF EXISTS "Vantagens são públicas" ON vantagens;
DROP POLICY IF EXISTS "Usuários podem ver próprias coletas" ON coletas;
DROP POLICY IF EXISTS "Usuários podem criar coletas" ON coletas;
DROP POLICY IF EXISTS "Usuários podem ver próprios resgates" ON resgates;
DROP POLICY IF EXISTS "Usuários podem criar resgates" ON resgates;

-- Políticas para USUARIOS
-- IMPORTANTE: A aplicação não usa Supabase Auth (auth.uid() sempre null)
-- Por isso, usamos políticas permissivas que funcionam com service role key
CREATE POLICY "Permitir leitura de usuários" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Permitir criação de usuários" ON usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de usuários" ON usuarios
  FOR UPDATE USING (true);

-- Políticas para leitura pública
CREATE POLICY "Instituições são públicas" ON instituicoes
  FOR SELECT USING (true);

CREATE POLICY "Estações são públicas" ON estacoes
  FOR SELECT USING (true);

CREATE POLICY "Comércios são públicos" ON comercios
  FOR SELECT USING (true);

CREATE POLICY "Vantagens são públicas" ON vantagens
  FOR SELECT USING (true);

-- Políticas para COLETAS
CREATE POLICY "Usuários podem ver próprias coletas" ON coletas
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar coletas" ON coletas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Políticas para RESGATES
CREATE POLICY "Usuários podem ver próprios resgates" ON resgates
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar resgates" ON resgates
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- ============================================
-- CONFIRMAÇÃO
-- ============================================
SELECT 
  'Setup completo! Todas as tabelas foram criadas com sucesso.' as mensagem,
  (SELECT COUNT(*) FROM instituicoes) as total_instituicoes,
  (SELECT COUNT(*) FROM estacoes) as total_estacoes,
  (SELECT COUNT(*) FROM comercios) as total_comercios,
  (SELECT COUNT(*) FROM vantagens) as total_vantagens;
`;
}

/**
 * Verifica se as tabelas do banco já existem
 */
export async function checkTablesExist(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
    
    // Se não houver erro, a tabela existe
    return !error || !error.message.includes('does not exist');
  } catch (error) {
    return false;
  }
}

/**
 * Tenta criar as tabelas automaticamente
 * Nota: Isso pode falhar devido a restrições do Supabase
 * Se falhar, o usuário precisará executar o SQL manualmente
 */
export async function initializeDatabase() {
  try {
    // Como não podemos executar SQL arbitrário via API por segurança,
    // vamos tentar popular o banco. Se as tabelas não existirem,
    // o erro será capturado e retornaremos instruções
    const result = await seedDatabase();
    
    if (result.success) {
      return { success: true, stats: result.stats };
    }
    
    return result;
  } catch (error) {
    return { 
      success: false, 
      error,
      needsManualSetup: true,
      message: 'As tabelas precisam ser criadas manualmente no Supabase Dashboard'
    };
  }
}

/**
 * Popula o banco com dados de exemplo para demonstração
 */
export async function seedDatabase() {
  try {
    // Verificar se já existem dados
    const { data: existingInst } = await supabase
      .from('instituicoes')
      .select('id')
      .limit(1);
    
    if (existingInst && existingInst.length > 0) {
      return { success: true, message: 'Dados já existem' };
    }

    // Inserir instituições
    const { data: instituicoes, error: instError } = await supabase
      .from('instituicoes')
      .insert([
        { nome: 'UNINASSAU Graças', tipo: 'Universidade', endereco: 'Rua das Graças, 123 - Recife/PE', telefone: '(81) 3333-4444' },
        { nome: 'UFPE', tipo: 'Universidade', endereco: 'Av. Prof. Moraes Rego, 1235 - Recife/PE', telefone: '(81) 2126-8000' },
        { nome: 'UNICAP', tipo: 'Universidade', endereco: 'Rua do Príncipe, 526 - Boa Vista, Recife - PE', telefone: '(81) 2119-4000' }
      ])
      .select();

    if (instError) {
      return { success: false, error: instError, needsManualSetup: true };
    }

    // Inserir estações (usar IDs das instituições criadas)
    if (instituicoes && instituicoes.length > 0) {
      const { data: estacoes, error: estError } = await supabase
        .from('estacoes')
        .insert([
          { instituicao_id: instituicoes[0].id, nome: 'Estação Central - UNINASSAU', endereco: 'Rua das Graças, 123', lat: -8.0476, lng: -34.8770, materiais_aceitos: ['plástico', 'papel', 'metal', 'vidro'], horario_funcionamento: 'Segunda a Sexta: 8h às 18h' },
          { instituicao_id: instituicoes[1].id, nome: 'Estação Central - UFPE', endereco: 'Av. Prof. Moraes Rego, 1235', lat: -8.0536, lng: -34.9511, materiais_aceitos: ['plástico', 'papel', 'vidro', 'metal'], horario_funcionamento: 'Segunda a Sexta: 7h às 20h' },
          { instituicao_id: instituicoes[2].id, nome: 'Estação UNICAP', endereco: 'Rua do Príncipe, 526', lat: -8.0506, lng: -34.8823, materiais_aceitos: ['plástico', 'papel'], horario_funcionamento: 'Segunda a Sexta: 8h às 17h' }
        ])
        .select();

      if (estError) {
        return { success: false, error: estError, needsManualSetup: true };
      }
    }

    // Inserir comércios
    const { data: comercios, error: comError } = await supabase
      .from('comercios')
      .insert([
        { nome: 'Café Sustentável', categoria: 'Alimentação', endereco: 'Rua do Café, 100 - Recife/PE', descricao: 'Café orgânico e sustentável' },
        { nome: 'Livraria Verde', categoria: 'Cultura', endereco: 'Av. dos Livros, 200 - Recife/PE', descricao: 'Livros e produtos eco-friendly' },
        { nome: 'Academia EcoFit', categoria: 'Saúde', endereco: 'Rua Fitness, 300 - Recife/PE', descricao: 'Academia com práticas sustentáveis' }
      ])
      .select();

    if (comError) {
      return { success: false, error: comError, needsManualSetup: true };
    }

    // Inserir vantagens
    if (comercios && comercios.length > 0) {
      const { data: vantagens, error: vantError } = await supabase
        .from('vantagens')
        .insert([
          { comercio_id: comercios[0].id, titulo: 'Café Grátis', descricao: 'Um café expresso grátis', custo_chaves: 50, nivel_minimo: 1 },
          { comercio_id: comercios[1].id, titulo: '20% de Desconto em Livros', descricao: 'Desconto em qualquer livro da loja', custo_chaves: 100, nivel_minimo: 1 },
          { comercio_id: comercios[2].id, titulo: '1 Semana Grátis', descricao: 'Acesso gratuito à academia por uma semana', custo_chaves: 200, nivel_minimo: 1 }
        ])
        .select();

      if (vantError) {
        return { success: false, error: vantError, needsManualSetup: true };
      }
    }

    return { 
      success: true,
      stats: {
        institutions: instituicoes?.length || 0,
        stations: 3,
        stores: comercios?.length || 0,
        rewards: 3
      }
    };
  } catch (error) {
    return { success: false, error, needsManualSetup: true };
  }
}
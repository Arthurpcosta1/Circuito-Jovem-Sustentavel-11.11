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

-- Inserir instituições de exemplo
INSERT INTO instituicoes (nome, tipo, endereco, telefone)
VALUES 
  ('UNINASSAU Graças', 'Universidade', 'Rua das Graças, 123 - Recife/PE', '(81) 3333-4444'),
  ('UFPE', 'Universidade', 'Av. Prof. Moraes Rego, 1235 - Recife/PE', '(81) 2126-8000'),
  ('UFRPE', 'Universidade', 'Rua Dom Manoel de Medeiros - Recife/PE', '(81) 3320-6000')
ON CONFLICT DO NOTHING;

-- Inserir estações de exemplo
INSERT INTO estacoes (instituicao_id, nome, endereco, lat, lng, materiais_aceitos, horario_funcionamento)
SELECT 
  i.id,
  'Estação Central - ' || i.nome,
  i.endereco,
  CASE 
    WHEN i.nome LIKE '%UNINASSAU%' THEN -8.0476
    WHEN i.nome LIKE '%UFPE%' THEN -8.0522
    ELSE -8.0410
  END,
  CASE 
    WHEN i.nome LIKE '%UNINASSAU%' THEN -34.8770
    WHEN i.nome LIKE '%UFPE%' THEN -34.9523
    ELSE -34.9516
  END,
  ARRAY['plástico', 'papel', 'metal', 'vidro'],
  'Segunda a Sexta: 8h às 18h'
FROM instituicoes i
WHERE NOT EXISTS (SELECT 1 FROM estacoes);

-- Inserir comércios de exemplo
INSERT INTO comercios (nome, categoria, endereco, descricao)
VALUES 
  ('Café Sustentável', 'Alimentação', 'Rua do Café, 100 - Recife/PE', 'Café orgânico e sustentável'),
  ('Livraria Verde', 'Cultura', 'Av. dos Livros, 200 - Recife/PE', 'Livros e produtos eco-friendly'),
  ('Academia EcoFit', 'Saúde', 'Rua Fitness, 300 - Recife/PE', 'Academia com práticas sustentáveis'),
  ('Pizza Eco', 'Alimentação', 'Av. Boa Viagem, 400 - Recife/PE', 'Pizzaria com ingredientes orgânicos')
ON CONFLICT DO NOTHING;

-- Inserir vantagens de exemplo
INSERT INTO vantagens (comercio_id, titulo, descricao, custo_chaves, nivel_minimo, validade_dias)
SELECT 
  c.id,
  CASE 
    WHEN c.categoria = 'Alimentação' AND c.nome LIKE '%Café%' THEN 'Café Grátis'
    WHEN c.categoria = 'Alimentação' AND c.nome LIKE '%Pizza%' THEN '20% de Desconto em Pizza'
    WHEN c.categoria = 'Cultura' THEN '20% de Desconto em Livros'
    ELSE '1 Semana Grátis'
  END,
  CASE 
    WHEN c.categoria = 'Alimentação' AND c.nome LIKE '%Café%' THEN 'Um café expresso grátis'
    WHEN c.categoria = 'Alimentação' AND c.nome LIKE '%Pizza%' THEN 'Desconto de 20% em qualquer pizza'
    WHEN c.categoria = 'Cultura' THEN 'Desconto em qualquer livro da loja'
    ELSE 'Acesso gratuito à academia por uma semana'
  END,
  CASE 
    WHEN c.categoria = 'Alimentação' AND c.nome LIKE '%Café%' THEN 50
    WHEN c.categoria = 'Alimentação' AND c.nome LIKE '%Pizza%' THEN 150
    WHEN c.categoria = 'Cultura' THEN 100
    ELSE 200
  END,
  1,
  30
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
DROP POLICY IF EXISTS "Permitir leitura de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir criação de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir atualização de usuários" ON usuarios;
DROP POLICY IF EXISTS "Instituições são públicas" ON instituicoes;
DROP POLICY IF EXISTS "Estações são públicas" ON estacoes;
DROP POLICY IF EXISTS "Embaixadores são públicos" ON embaixadores;
DROP POLICY IF EXISTS "Embaixadores-Estações são públicas" ON embaixadores_estacoes;
DROP POLICY IF EXISTS "Coletas são públicas para leitura" ON coletas;
DROP POLICY IF EXISTS "Coletas podem ser criadas" ON coletas;
DROP POLICY IF EXISTS "Coletas podem ser atualizadas" ON coletas;
DROP POLICY IF EXISTS "Comércios são públicos" ON comercios;
DROP POLICY IF EXISTS "Comércios podem ser criados" ON comercios;
DROP POLICY IF EXISTS "Comércios podem ser atualizados" ON comercios;
DROP POLICY IF EXISTS "Vantagens são públicas" ON vantagens;
DROP POLICY IF EXISTS "Vantagens podem ser criadas" ON vantagens;
DROP POLICY IF EXISTS "Vantagens podem ser atualizadas" ON vantagens;
DROP POLICY IF EXISTS "Resgates são públicos para leitura" ON resgates;
DROP POLICY IF EXISTS "Resgates podem ser criados" ON resgates;
DROP POLICY IF EXISTS "Resgates podem ser atualizados" ON resgates;

-- Políticas PERMISSIVAS (usando service_role key ou anon key)
-- Estas políticas permitem todas as operações porque não usamos auth.uid()

CREATE POLICY "Permitir leitura de usuários" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Permitir criação de usuários" ON usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de usuários" ON usuarios
  FOR UPDATE USING (true);

CREATE POLICY "Instituições são públicas" ON instituicoes
  FOR SELECT USING (true);

CREATE POLICY "Estações são públicas" ON estacoes
  FOR SELECT USING (true);

CREATE POLICY "Embaixadores são públicos" ON embaixadores
  FOR ALL USING (true);

CREATE POLICY "Embaixadores-Estações são públicas" ON embaixadores_estacoes
  FOR ALL USING (true);

CREATE POLICY "Coletas são públicas para leitura" ON coletas
  FOR SELECT USING (true);

CREATE POLICY "Coletas podem ser criadas" ON coletas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Coletas podem ser atualizadas" ON coletas
  FOR UPDATE USING (true);

CREATE POLICY "Comércios são públicos" ON comercios
  FOR SELECT USING (true);

CREATE POLICY "Comércios podem ser criados" ON comercios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Comércios podem ser atualizados" ON comercios
  FOR UPDATE USING (true);

CREATE POLICY "Vantagens são públicas" ON vantagens
  FOR SELECT USING (true);

CREATE POLICY "Vantagens podem ser criadas" ON vantagens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Vantagens podem ser atualizadas" ON vantagens
  FOR UPDATE USING (true);

CREATE POLICY "Resgates são públicos para leitura" ON resgates
  FOR SELECT USING (true);

CREATE POLICY "Resgates podem ser criados" ON resgates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Resgates podem ser atualizados" ON resgates
  FOR UPDATE USING (true);

-- ============================================
-- CONFIRMAÇÃO
-- ============================================
SELECT 
  'Setup completo! Todas as tabelas foram criadas com sucesso.' as mensagem,
  (SELECT COUNT(*) FROM instituicoes) as total_instituicoes,
  (SELECT COUNT(*) FROM estacoes) as total_estacoes,
  (SELECT COUNT(*) FROM comercios) as total_comercios,
  (SELECT COUNT(*) FROM vantagens) as total_vantagens;

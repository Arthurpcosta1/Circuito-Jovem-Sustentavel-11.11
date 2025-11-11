import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Database, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './ui/sonner';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7af4432d`;

// SQL de configuração do banco de dados
const getSetupSQL = () => `-- ============================================
-- CIRCUITO JOVEM SUSTENTÁVEL - SETUP AUTOMÁTICO
-- Execute este SQL apenas UMA VEZ no Supabase SQL Editor
-- ============================================

-- 1. USUARIOS - Entidade Central
CREATE TABLE IF NOT EXISTS usuarios_7af4432d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  chaves_impacto INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  tipo VARCHAR(50) DEFAULT 'estudante',
  foto_url TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios_7af4432d(email);

-- 2. INSTITUICOES
CREATE TABLE IF NOT EXISTS instituicoes_7af4432d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 3. ESTACOES - Relacionamento N:1 com INSTITUICOES
CREATE TABLE IF NOT EXISTS estacoes_7af4432d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instituicao_id UUID REFERENCES instituicoes_7af4432d(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  endereco TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  materiais_aceitos TEXT[],
  horario_funcionamento TEXT,
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estacoes_instituicao ON estacoes_7af4432d(instituicao_id);

-- 4. EMBAIXADORES - Relacionamento 1:1 com USUARIOS
CREATE TABLE IF NOT EXISTS embaixadores_7af4432d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios_7af4432d(id) ON DELETE CASCADE,
  codigo_embaixador VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'ativo',
  total_coletas_validadas INTEGER DEFAULT 0,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embaixadores_usuario ON embaixadores_7af4432d(usuario_id);

-- 5. EMBAIXADORES_ESTACOES - Tabela Associativa N:N
CREATE TABLE IF NOT EXISTS embaixadores_estacoes_7af4432d (
  embaixador_id UUID REFERENCES embaixadores_7af4432d(id) ON DELETE CASCADE,
  estacao_id UUID REFERENCES estacoes_7af4432d(id) ON DELETE CASCADE,
  data_atribuicao TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (embaixador_id, estacao_id)
);

CREATE INDEX IF NOT EXISTS idx_emb_est_embaixador ON embaixadores_estacoes_7af4432d(embaixador_id);
CREATE INDEX IF NOT EXISTS idx_emb_est_estacao ON embaixadores_estacoes_7af4432d(estacao_id);

-- 6. COLETAS - Relacionamentos com USUARIO, EMBAIXADOR e ESTACAO
CREATE TABLE IF NOT EXISTS coletas_7af4432d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios_7af4432d(id) ON DELETE CASCADE,
  estacao_id UUID NOT NULL REFERENCES estacoes_7af4432d(id) ON DELETE CASCADE,
  embaixador_id UUID REFERENCES embaixadores_7af4432d(id) ON DELETE SET NULL,
  peso_kg DECIMAL(10, 2) NOT NULL,
  material_tipo VARCHAR(100) NOT NULL,
  chaves_ganhas INTEGER DEFAULT 0,
  data_coleta TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pendente',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coletas_usuario ON coletas_7af4432d(usuario_id);
CREATE INDEX IF NOT EXISTS idx_coletas_estacao ON coletas_7af4432d(estacao_id);
CREATE INDEX IF NOT EXISTS idx_coletas_status ON coletas_7af4432d(status);

-- 7. COMERCIOS
CREATE TABLE IF NOT EXISTS comercios_7af4432d (
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
CREATE TABLE IF NOT EXISTS vantagens_7af4432d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id UUID NOT NULL REFERENCES comercios_7af4432d(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  custo_chaves INTEGER NOT NULL,
  nivel_minimo INTEGER DEFAULT 1,
  validade_dias INTEGER,
  categoria VARCHAR(100),
  ativa BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vantagens_comercio ON vantagens_7af4432d(comercio_id);
CREATE INDEX IF NOT EXISTS idx_vantagens_ativa ON vantagens_7af4432d(ativa);

-- 9. RESGATES - Tabela Associativa N:N entre USUARIOS e VANTAGENS
CREATE TABLE IF NOT EXISTS resgates_7af4432d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios_7af4432d(id) ON DELETE CASCADE,
  vantagem_id UUID NOT NULL REFERENCES vantagens_7af4432d(id) ON DELETE CASCADE,
  codigo_resgate VARCHAR(100) UNIQUE NOT NULL,
  data_resgate TIMESTAMP DEFAULT NOW(),
  data_validade TIMESTAMP,
  data_utilizacao TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resgates_usuario ON resgates_7af4432d(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resgates_vantagem ON resgates_7af4432d(vantagem_id);
CREATE INDEX IF NOT EXISTS idx_resgates_status ON resgates_7af4432d(status);

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- Inserir instituições de exemplo
INSERT INTO instituicoes_7af4432d (nome, tipo, endereco, telefone)
VALUES 
  ('UNINASSAU Graças', 'Universidade', 'Rua das Graças, 123 - Recife/PE', '(81) 3333-4444'),
  ('UFPE', 'Universidade', 'Av. Prof. Moraes Rego, 1235 - Recife/PE', '(81) 2126-8000'),
  ('UNICAP', 'Universidade', 'Rua do Príncipe, 526 - Boa Vista, Recife - PE', '(81) 2119-4000')
ON CONFLICT DO NOTHING;

-- Inserir estações de exemplo
INSERT INTO estacoes_7af4432d (instituicao_id, nome, endereco, lat, lng, materiais_aceitos, horario_funcionamento)
SELECT 
  i.id,
  'Estação Central - ' || i.nome,
  i.endereco,
  CASE 
    WHEN i.nome LIKE '%UNINASSAU%' THEN -8.0476
    WHEN i.nome LIKE '%UFPE%' THEN -8.0536
    ELSE -8.0506
  END,
  CASE 
    WHEN i.nome LIKE '%UNINASSAU%' THEN -34.8770
    WHEN i.nome LIKE '%UFPE%' THEN -34.9511
    ELSE -34.8823
  END,
  ARRAY['plástico', 'papel', 'metal', 'vidro'],
  'Segunda a Sexta: 8h às 18h'
FROM instituicoes_7af4432d i
WHERE NOT EXISTS (SELECT 1 FROM estacoes_7af4432d);

-- Inserir comércios de exemplo
INSERT INTO comercios_7af4432d (nome, categoria, endereco, descricao)
VALUES 
  ('Café Sustentável', 'Alimentação', 'Rua do Café, 100 - Recife/PE', 'Café orgânico e sustentável'),
  ('Livraria Verde', 'Cultura', 'Av. dos Livros, 200 - Recife/PE', 'Livros e produtos eco-friendly'),
  ('Academia EcoFit', 'Saúde', 'Rua Fitness, 300 - Recife/PE', 'Academia com práticas sustentáveis')
ON CONFLICT DO NOTHING;

-- Inserir vantagens de exemplo
INSERT INTO vantagens_7af4432d (comercio_id, titulo, descricao, custo_chaves, nivel_minimo)
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
FROM comercios_7af4432d c
WHERE NOT EXISTS (SELECT 1 FROM vantagens_7af4432d);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE usuarios_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE instituicoes_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE estacoes_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores_estacoes_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE coletas_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE vantagens_7af4432d ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates_7af4432d ENABLE ROW LEVEL SECURITY;

-- Drop políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios_7af4432d;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios_7af4432d;
DROP POLICY IF EXISTS "Qualquer um pode criar usuário" ON usuarios_7af4432d;
DROP POLICY IF EXISTS "Instituições são públicas" ON instituicoes_7af4432d;
DROP POLICY IF EXISTS "Estações são públicas" ON estacoes_7af4432d;
DROP POLICY IF EXISTS "Comércios são públicos" ON comercios_7af4432d;
DROP POLICY IF EXISTS "Vantagens são públicas" ON vantagens_7af4432d;
DROP POLICY IF EXISTS "Usuários podem ver próprias coletas" ON coletas_7af4432d;
DROP POLICY IF EXISTS "Usuários podem criar coletas" ON coletas_7af4432d;
DROP POLICY IF EXISTS "Usuários podem ver próprios resgates" ON resgates_7af4432d;
DROP POLICY IF EXISTS "Usuários podem criar resgates" ON resgates_7af4432d;

-- Políticas para USUARIOS
CREATE POLICY "Usuários podem ver próprio perfil" ON usuarios_7af4432d
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON usuarios_7af4432d
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Qualquer um pode criar usuário" ON usuarios_7af4432d
  FOR INSERT WITH CHECK (true);

-- Políticas para leitura pública
CREATE POLICY "Instituições são públicas" ON instituicoes_7af4432d
  FOR SELECT USING (true);

CREATE POLICY "Estações são públicas" ON estacoes_7af4432d
  FOR SELECT USING (true);

CREATE POLICY "Comércios são públicos" ON comercios_7af4432d
  FOR SELECT USING (true);

CREATE POLICY "Vantagens são públicas" ON vantagens_7af4432d
  FOR SELECT USING (true);

-- Políticas para COLETAS
CREATE POLICY "Usuários podem ver próprias coletas" ON coletas_7af4432d
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar coletas" ON coletas_7af4432d
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Políticas para RESGATES
CREATE POLICY "Usuários podem ver próprios resgates" ON resgates_7af4432d
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar resgates" ON resgates_7af4432d
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- ============================================
-- CONFIRMAÇÃO
-- ============================================
SELECT 
  '✅ Setup completo! Todas as tabelas foram criadas com sucesso.' as mensagem,
  (SELECT COUNT(*) FROM instituicoes_7af4432d) as total_instituicoes,
  (SELECT COUNT(*) FROM estacoes_7af4432d) as total_estacoes,
  (SELECT COUNT(*) FROM comercios_7af4432d) as total_comercios,
  (SELECT COUNT(*) FROM vantagens_7af4432d) as total_vantagens;
`;

interface AutoDatabaseInitProps {
  onComplete: () => void;
}

export function AutoDatabaseInit({ onComplete }: AutoDatabaseInitProps) {
  const [status, setStatus] = useState<'checking' | 'initializing' | 'ready' | 'error' | 'manual-setup'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('Verificando banco de dados...');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  useEffect(() => {
    checkAndInitialize();
  }, []);

  const checkAndInitialize = async () => {
    try {
      setStatus('checking');
      setProgress('Verificando se o banco de dados está configurado...');

      // Verificar se o banco está inicializado
      const checkResponse = await fetch(`${API_BASE_URL}/check-database`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!checkResponse.ok) {
        throw new Error(`Erro HTTP: ${checkResponse.status}`);
      }

      const checkText = await checkResponse.text();
      let checkData;
      
      try {
        checkData = JSON.parse(checkText);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', checkText);
        throw new Error('Resposta inválida do servidor');
      }

      if (checkData.initialized) {
        setStatus('ready');
        setProgress('Banco de dados pronto!');
        setTimeout(() => onComplete(), 1000);
        return;
      }

      // Se não estiver inicializado, tentar inicializar automaticamente
      setStatus('initializing');
      setProgress('Inicializando banco de dados pela primeira vez...');

      const initResponse = await fetch(`${API_BASE_URL}/init-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!initResponse.ok) {
        throw new Error(`Erro HTTP: ${initResponse.status}`);
      }

      const initText = await initResponse.text();
      let initData;
      
      try {
        initData = JSON.parse(initText);
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', initText);
        throw new Error('Resposta inválida do servidor');
      }

      if (initData.success || initData.already_initialized) {
        setStatus('ready');
        setProgress('Banco de dados inicializado com sucesso!');
        setTimeout(() => onComplete(), 1500);
      } else if (initData.needsManualSetup) {
        setStatus('manual-setup');
        setError('As tabelas do banco de dados precisam ser criadas manualmente');
      } else {
        throw new Error(initData.error || 'Erro ao inicializar banco');
      }
    } catch (err) {
      console.error('Erro na auto-inicialização:', err);
      setStatus('manual-setup');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const openSupabaseDashboard = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank');
  };

  const openSetupSQLFile = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank');
    // Tentar copiar o SQL também
    copySQL();
  };

  const copySQL = async () => {
    try {
      const sql = getSetupSQL();
      
      // Verificar se a API de clipboard está disponível
      if (!navigator.clipboard) {
        setShowSQL(true);
        toast.error('Copiar automático não disponível. Use o botão "Ver SQL" para copiar manualmente.');
        return;
      }
      
      await navigator.clipboard.writeText(sql);
      setCopiedSQL(true);
      toast.success('SQL copiado para a área de transferência!');
      setTimeout(() => setCopiedSQL(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar SQL:', error);
      setShowSQL(true);
      toast.error('Erro ao copiar. Use o botão "Ver SQL" para copiar manualmente.');
    }
  };

  const skipSetup = () => {
    // Mesmo se houver erro, permitir que o usuário continue
    onComplete();
  };

  if (status === 'checking' || status === 'initializing') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-purple-300/20">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Database className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-white text-center">Circuito Jovem Sustentável</CardTitle>
              <CardDescription className="text-purple-200 text-center">
                Preparando o ambiente...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <p className="text-purple-100">{progress}</p>
              </div>
              
              <div className="w-full bg-purple-900/40 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{ width: status === 'checking' ? '50%' : '80%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  if (status === 'ready') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-purple-300/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-xl">Tudo pronto!</p>
                <p className="text-purple-200 text-center text-sm">{progress}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  if (status === 'manual-setup') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-purple-300/20">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-white text-center">Configuração do Banco de Dados</CardTitle>
              <CardDescription className="text-purple-200 text-center">
                É necessário executar o SQL de configuração no Supabase Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <Alert className="bg-amber-950/30 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertTitle className="text-amber-200">Setup Manual Necessário</AlertTitle>
              <AlertDescription className="text-amber-100/70">
                O banco de dados precisa ser configurado manualmente uma única vez.
              </AlertDescription>
            </Alert>

            <div className="bg-purple-950/50 rounded-lg p-4 space-y-3">
              <h3 className="text-purple-100 font-semibold">Passos para configurar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-purple-200 text-sm">
                <li>Clique no botão <span className="text-cyan-300 font-medium">"Copiar SQL"</span> abaixo</li>
                <li>Clique em <span className="text-cyan-300 font-medium">"Abrir SQL Editor"</span> (abrirá nova aba)</li>
                <li>Cole o SQL copiado no editor do Supabase <span className="text-cyan-300">(Ctrl+V)</span></li>
                <li>Clique em <span className="text-cyan-300 font-medium">"Run"</span> ou pressione <span className="text-cyan-300">Ctrl+Enter</span></li>
                <li>Volte aqui e clique em <span className="text-cyan-300 font-medium">"Tentar Novamente"</span></li>
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={copySQL}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                >
                  {copiedSQL ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      SQL Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar SQL
                    </>
                  )}
                </Button>

                <Button
                  onClick={openSetupSQLFile}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir SQL Editor
                </Button>
              </div>

              <Button
                onClick={() => setShowSQL(!showSQL)}
                variant="outline"
                className="w-full bg-white/10 border-purple-300/30 text-purple-100 hover:bg-white/20"
              >
                {showSQL ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showSQL ? 'Ocultar SQL' : 'Ver SQL Completo'}
              </Button>

              {showSQL && (
                <div className="relative">
                  <textarea
                    readOnly
                    value={getSetupSQL()}
                    className="w-full h-64 p-3 bg-slate-900 text-green-400 font-mono text-xs rounded border border-purple-500/30 resize-none"
                    onClick={(e) => {
                      e.currentTarget.select();
                      copySQL();
                    }}
                  />
                  <div className="text-purple-300 text-xs mt-1 text-center">
                    👆 Clique no texto acima para selecionar e copiar
                  </div>
                </div>
              )}

              <Button
                onClick={checkAndInitialize}
                variant="outline"
                className="w-full bg-green-950/30 border-green-500/30 text-green-300 hover:bg-green-950/50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>

              <Button
                onClick={skipSetup}
                variant="ghost"
                className="w-full text-purple-300 hover:text-purple-100 hover:bg-white/5"
              >
                Pular (testar sem banco)
              </Button>
            </div>

            {error && (
              <Alert className="bg-red-950/30 border-red-500/30">
                <XCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster position="top-center" />
    </>
    );
  }

  return null;
}

-- ============================================
-- SETUP: Funções PostgreSQL para QR Code Seguro
-- ============================================
-- 
-- IMPORTANTE: Execute estas funções no SQL Editor do Supabase
-- para habilitar o sistema de QR Code seguro.
--
-- Como executar:
-- 1. Acesse seu projeto no Supabase
-- 2. Vá em "SQL Editor"
-- 3. Cole e execute cada função abaixo
-- ============================================

-- ============================================
-- TABELA: tokens_qrcode
-- Armazena tokens temporários de QR Code
-- ============================================

CREATE TABLE IF NOT EXISTS tokens_qrcode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT NOW(),
  expira_em TIMESTAMP NOT NULL,
  usado_em TIMESTAMP NULL,
  ip_origem TEXT NULL,
  user_agent TEXT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tokens_qrcode_usuario ON tokens_qrcode(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tokens_qrcode_token ON tokens_qrcode(token);
CREATE INDEX IF NOT EXISTS idx_tokens_qrcode_expira ON tokens_qrcode(expira_em);

-- Limpar tokens expirados automaticamente (executar diariamente)
CREATE OR REPLACE FUNCTION limpar_tokens_expirados()
RETURNS void AS $$
BEGIN
  DELETE FROM tokens_qrcode
  WHERE expira_em < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- FUNÇÃO: gerar_token_qrcode
-- Gera um token seguro e único para o QR Code
-- ============================================

CREATE OR REPLACE FUNCTION gerar_token_qrcode(p_usuario_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_expira_em TIMESTAMP;
  v_usuario JSONB;
BEGIN
  -- Verificar se usuário existe
  SELECT row_to_json(u)::JSONB INTO v_usuario
  FROM usuarios u
  WHERE u.id = p_usuario_id;

  IF v_usuario IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Gerar token único (formato: CJS-[timestamp]-[random]-[userid_hash])
  v_token := 'CJS-' || 
             EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || 
             encode(gen_random_bytes(16), 'base64')::TEXT || '-' ||
             encode(digest(p_usuario_id::TEXT, 'sha256'), 'hex')::TEXT;
  
  -- Remover caracteres problemáticos do token
  v_token := REPLACE(v_token, '/', '_');
  v_token := REPLACE(v_token, '+', '-');
  v_token := REPLACE(v_token, '=', '');

  -- Token expira em 5 minutos
  v_expira_em := NOW() + INTERVAL '5 minutes';

  -- Invalidar tokens anteriores não usados deste usuário
  UPDATE tokens_qrcode
  SET usado = TRUE, usado_em = NOW()
  WHERE usuario_id = p_usuario_id 
    AND usado = FALSE 
    AND expira_em > NOW();

  -- Inserir novo token
  INSERT INTO tokens_qrcode (usuario_id, token, expira_em)
  VALUES (p_usuario_id, v_token, v_expira_em);

  -- Retornar token
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- FUNÇÃO: validar_token_qrcode
-- Valida um token escaneado e retorna dados do usuário
-- ============================================

CREATE OR REPLACE FUNCTION validar_token_qrcode(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_token_record RECORD;
  v_usuario JSONB;
  v_resultado JSONB;
BEGIN
  -- Buscar token
  SELECT * INTO v_token_record
  FROM tokens_qrcode
  WHERE token = p_token;

  -- Token não encontrado
  IF v_token_record IS NULL THEN
    RETURN jsonb_build_object(
      'valido', FALSE,
      'mensagem', 'QR Code inválido'
    );
  END IF;

  -- Token já foi usado
  IF v_token_record.usado = TRUE THEN
    RETURN jsonb_build_object(
      'valido', FALSE,
      'mensagem', 'QR Code já foi utilizado. Gere um novo código.'
    );
  END IF;

  -- Token expirado
  IF v_token_record.expira_em < NOW() THEN
    RETURN jsonb_build_object(
      'valido', FALSE,
      'mensagem', 'QR Code expirado. Gere um novo código.'
    );
  END IF;

  -- Buscar dados do usuário
  SELECT jsonb_build_object(
    'id', u.id,
    'nome', u.nome,
    'email', u.email,
    'nivel', u.nivel,
    'chaves_impacto', u.chaves_impacto,
    'tipo', u.tipo,
    'foto_url', u.foto_url
  ) INTO v_usuario
  FROM usuarios u
  WHERE u.id = v_token_record.usuario_id;

  -- Marcar token como usado
  UPDATE tokens_qrcode
  SET usado = TRUE, usado_em = NOW()
  WHERE token = p_token;

  -- Retornar sucesso com dados do usuário
  RETURN jsonb_build_object(
    'valido', TRUE,
    'usuario', v_usuario,
    'mensagem', 'QR Code válido'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE tokens_qrcode ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios tokens
CREATE POLICY "Usuários podem ver seus próprios tokens"
  ON tokens_qrcode FOR SELECT
  USING (auth.uid() = usuario_id);

-- Apenas embaixadores podem validar tokens (chamando a função)
-- A função SECURITY DEFINER bypass RLS quando necessário


-- ============================================
-- GRANTS (Permissões)
-- ============================================

-- Permitir que funções sejam executadas
GRANT EXECUTE ON FUNCTION gerar_token_qrcode(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validar_token_qrcode(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION limpar_tokens_expirados() TO postgres;


-- ============================================
-- TESTE DAS FUNÇÕES
-- ============================================

-- Para testar, execute (substitua o UUID por um usuário real):
-- SELECT gerar_token_qrcode('seu-usuario-id-aqui');
-- SELECT validar_token_qrcode('token-gerado-aqui');


-- ============================================
-- MANUTENÇÃO
-- ============================================

-- Limpar tokens expirados manualmente:
-- SELECT limpar_tokens_expirados();

-- Ver tokens ativos:
-- SELECT * FROM tokens_qrcode WHERE usado = FALSE AND expira_em > NOW();

-- Ver estatísticas:
-- SELECT 
--   COUNT(*) as total,
--   COUNT(*) FILTER (WHERE usado = TRUE) as usados,
--   COUNT(*) FILTER (WHERE expira_em < NOW()) as expirados,
--   COUNT(*) FILTER (WHERE usado = FALSE AND expira_em > NOW()) as ativos
-- FROM tokens_qrcode;

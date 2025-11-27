-- ============================================
-- LIMPEZA AUTOMÁTICA DE RESGATES EXPIRADOS
-- Execute este SQL para configurar limpeza automática
-- ============================================

-- OPÇÃO 1: Marcar como expirado (RECOMENDADO - mantém histórico)
-- Execute esta query manualmente quando quiser limpar os resgates expirados
UPDATE resgates 
SET status = 'expirado' 
WHERE status = 'ativo' 
AND data_validade < NOW();

-- OPÇÃO 2: Deletar resgates muito antigos (> 30 dias expirados)
-- ATENÇÃO: Isso apaga permanentemente os dados!
-- Só execute se tiver certeza que não precisa do histórico
DELETE FROM resgates 
WHERE status = 'expirado' 
AND data_validade < NOW() - INTERVAL '30 days';

-- ============================================
-- CONSULTAS ÚTEIS
-- ============================================

-- Ver quantos resgates expirados existem
SELECT 
  COUNT(*) as total_expirados,
  COUNT(*) FILTER (WHERE status = 'ativo') as ativos_expirados,
  COUNT(*) FILTER (WHERE status = 'expirado') as ja_marcados
FROM resgates 
WHERE data_validade < NOW();

-- Ver espaço ocupado pelos resgates
SELECT 
  COUNT(*) as total_resgates,
  COUNT(*) FILTER (WHERE status = 'ativo') as ativos,
  COUNT(*) FILTER (WHERE status = 'expirado') as expirados,
  COUNT(*) FILTER (WHERE status = 'utilizado') as utilizados,
  pg_size_pretty(pg_total_relation_size('resgates')) as tamanho_tabela
FROM resgates;

-- Ver resgates por usuário (últimos 7 dias)
SELECT 
  u.nome,
  COUNT(r.id) as total_resgates,
  COUNT(*) FILTER (WHERE r.status = 'ativo') as ativos,
  COUNT(*) FILTER (WHERE r.status = 'utilizado') as utilizados
FROM usuarios u
LEFT JOIN resgates r ON u.id = r.usuario_id
WHERE r.data_resgate > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.nome
ORDER BY total_resgates DESC
LIMIT 10;

-- ============================================
-- INFORMAÇÕES SOBRE LIMITES SUPABASE
-- ============================================

/*
PLANO GRATUITO SUPABASE:
- Banco de dados: 500 MB
- Linhas não têm limite fixo, depende do tamanho dos dados
- Uma linha de resgate ocupa ~200-300 bytes

ESTIMATIVA:
- 500 MB ÷ 300 bytes ≈ 1.700.000 resgates
- Ou seja: você pode ter mais de 1 MILHÃO de resgates!

RECOMENDAÇÕES:
1. NÃO SE PREOCUPE no início - o app suporta MILHARES de usuários
2. Use a OPÇÃO 1 (marcar como expirado) para manter histórico
3. Só delete resgates muito antigos se realmente precisar de espaço
4. O app já faz limpeza automática ao carregar (marca expirados)

MONITORAMENTO:
- Acesse: Supabase Dashboard > Settings > Database
- Veja o uso em "Database size"
- Configure alertas se passar de 400 MB (80%)
*/

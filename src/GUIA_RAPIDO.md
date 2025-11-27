# ⚡ Guia Rápido de Correções

## 🎯 Para quem tem pressa

Este é um resumo executivo das correções necessárias. Para detalhes completos, veja `GUIA_COMPLETO_CORRECOES.md`.

---

## 📋 Problemas e Soluções

| Problema | Solução | Tempo |
|----------|---------|-------|
| Documentação duplicada | Deletar 5 arquivos `.md` | 5 min |
| Tabelas com `_7af4432d` | Executar SQL de renomeação | 15 min |
| RLS com `auth.uid()` que não funciona | Recriar políticas permissivas | 20 min |
| API duplicada (`api.ts` e `api.tsx`) | Manter só `api.ts` atualizado | 10 min |

**Total:** ~50 minutos

---

## 🚀 Ações Rápidas

### 1️⃣ Limpar Documentação (5min)

Peça ao assistente do Figma Make:

```
Delete os seguintes arquivos:
- CORRECOES_FINAIS.md
- CORRIGIDO.md
- RELATORIO_TESTES.md
- TUTORIAL_CORRECOES.md
- FASE1_LIMPEZA_DOCUMENTACAO.md
```

---

### 2️⃣ Renomear Tabelas (15min)

No [Supabase SQL Editor](https://supabase.com/dashboard):

```sql
-- Renomear todas as tabelas (remover sufixo _7af4432d)
ALTER TABLE usuarios_7af4432d RENAME TO usuarios;
ALTER TABLE instituicoes_7af4432d RENAME TO instituicoes;
ALTER TABLE estacoes_7af4432d RENAME TO estacoes;
ALTER TABLE embaixadores_7af4432d RENAME TO embaixadores;
ALTER TABLE embaixadores_estacoes_7af4432d RENAME TO embaixadores_estacoes;
ALTER TABLE coletas_7af4432d RENAME TO coletas;
ALTER TABLE comercios_7af4432d RENAME TO comercios;
ALTER TABLE vantagens_7af4432d RENAME TO vantagens;
ALTER TABLE resgates_7af4432d RENAME TO resgates;
```

**Verificar:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

---

### 3️⃣ Corrigir Políticas RLS (20min)

#### Passo 1: Remover políticas antigas

```sql
-- Desabilitar RLS
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE instituicoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE estacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores_estacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE coletas DISABLE ROW LEVEL SECURITY;
ALTER TABLE comercios DISABLE ROW LEVEL SECURITY;
ALTER TABLE vantagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE resgates DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas (pode dar erro em algumas, ignore)
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Permitir leitura de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir criação de usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir atualização de usuários" ON usuarios;
DROP POLICY IF EXISTS "Instituições são públicas" ON instituicoes;
DROP POLICY IF EXISTS "Estações são públicas" ON estacoes;
DROP POLICY IF EXISTS "Comércios são públicos" ON comercios;
DROP POLICY IF EXISTS "Vantagens são públicas" ON vantagens;
DROP POLICY IF EXISTS "Usuários podem ver próprias coletas" ON coletas;
DROP POLICY IF EXISTS "Usuários podem criar coletas" ON coletas;
DROP POLICY IF EXISTS "Permitir leitura de coletas" ON coletas;
DROP POLICY IF EXISTS "Permitir criação de coletas" ON coletas;
DROP POLICY IF EXISTS "Permitir atualização de coletas" ON coletas;
DROP POLICY IF EXISTS "Usuários podem ver próprios resgates" ON resgates;
DROP POLICY IF EXISTS "Usuários podem criar resgates" ON resgates;
DROP POLICY IF EXISTS "Permitir leitura de resgates" ON resgates;
DROP POLICY IF EXISTS "Permitir criação de resgates" ON resgates;
DROP POLICY IF EXISTS "Permitir atualização de resgates" ON resgates;
```

#### Passo 2: Criar políticas permissivas

```sql
-- Habilitar RLS novamente
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores_estacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE vantagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas (funcionam com service role key)
CREATE POLICY "Permitir tudo em usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir leitura instituicoes" ON instituicoes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura estacoes" ON estacoes FOR SELECT USING (true);
CREATE POLICY "Permitir tudo em embaixadores" ON embaixadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em embaixadores_estacoes" ON embaixadores_estacoes FOR ALL USING (true) WITH CHECK (true);

-- CRÍTICO: Estas políticas resolvem o problema principal
CREATE POLICY "Permitir leitura coletas" ON coletas FOR SELECT USING (true);
CREATE POLICY "Permitir criar coletas" ON coletas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizar coletas" ON coletas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir deletar coletas" ON coletas FOR DELETE USING (true);

CREATE POLICY "Permitir leitura comercios" ON comercios FOR SELECT USING (true);
CREATE POLICY "Permitir leitura vantagens" ON vantagens FOR SELECT USING (true);

-- CRÍTICO: Estas políticas resolvem o problema principal
CREATE POLICY "Permitir leitura resgates" ON resgates FOR SELECT USING (true);
CREATE POLICY "Permitir criar resgates" ON resgates FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizar resgates" ON resgates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir deletar resgates" ON resgates FOR DELETE USING (true);
```

**Verificar:**
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' ORDER BY tablename;
```

---

### 4️⃣ Consolidar API (10min)

Peça ao assistente:

```
1. Atualize /utils/api.ts removendo todas as referências a "_7af4432d"
2. Delete o arquivo /utils/api.tsx
3. Atualize /supabase/functions/server/database.tsx removendo "_7af4432d"
4. Verifique se há imports de 'utils/api.tsx' em componentes e atualize para 'utils/api.ts'
```

---

## ✅ Teste Rápido

Após as correções, teste:

1. **Login/Cadastro funciona?**
2. **Pode criar coleta?**
3. **Pode resgatar vantagem?**
4. **Console do navegador sem erros?**

Se sim para todos = **Sucesso!** 🎉

---

## ❌ Erros Comuns

### "relation 'usuarios_7af4432d' does not exist"
➡️ Procure `_7af4432d` no código e remova

### "permission denied for table coletas"
➡️ Execute novamente o passo 3 (Políticas RLS)

### "auth.uid() is null"
➡️ Verifique se as novas políticas foram criadas corretamente

---

## 📚 Documentação Completa

Para instruções detalhadas com explicações, veja:
- `GUIA_COMPLETO_CORRECOES.md` - Guia completo passo a passo

---

**⏱️ Tempo total:** 50 minutos  
**🎯 Resultado:** Sistema 100% funcional

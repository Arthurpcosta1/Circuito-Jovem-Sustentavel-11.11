# 🔧 Guia Completo de Correções - Circuito Jovem Sustentável

## 📋 Índice

1. [Visão Geral dos Problemas](#visão-geral-dos-problemas)
2. [Antes de Começar](#antes-de-começar)
3. [Fase 1: Limpeza da Documentação](#fase-1-limpeza-da-documentação)
4. [Fase 2: Renomeação das Tabelas](#fase-2-renomeação-das-tabelas)
5. [Fase 3: Correção das Políticas RLS](#fase-3-correção-das-políticas-rls)
6. [Fase 4: Consolidação da API](#fase-4-consolidação-da-api)
7. [Teste Final](#teste-final)

---

## 🎯 Visão Geral dos Problemas

### Problemas Identificados

1. **❌ Tabelas com sufixo aleatório `_7af4432d`**
   - Todas as tabelas têm este sufixo desnecessário
   - Dificulta manutenção e leitura do código
   - Precisa ser removido

2. **❌ Políticas RLS conflitantes**
   - Usam `auth.uid()` mas o app não usa Supabase Auth
   - `auth.uid()` sempre retorna `null`
   - Impede que coletas e resgates funcionem

3. **❌ Documentação redundante**
   - 3 arquivos `.md` duplicados: `CORRECOES_FINAIS.md`, `CORRIGIDO.md`, `RELATORIO_TESTES.md`
   - Outros arquivos de tutorial antigos podem ser consolidados
   - Confunde o desenvolvedor

4. **❌ Arquivos API duplicados**
   - `/utils/api.ts` e `/utils/api.tsx` fazem coisas similares
   - Causam confusão sobre qual usar
   - Alguns componentes importam de um, outros de outro

---

## ⚠️ Antes de Começar

### Checklist de Preparação

- [ ] Tenha acesso ao [Painel do Supabase](https://supabase.com/dashboard)
- [ ] Abra o SQL Editor do seu projeto
- [ ] Faça backup do banco de dados (opcional mas recomendado)
- [ ] Tenha este guia aberto em uma aba separada
- [ ] Reserve cerca de 1 hora para completar todas as fases

### ⚡ Importante

> **NÃO pule etapas!** As fases dependem umas das outras.
> 
> **Teste após cada fase** para garantir que tudo está funcionando.

---

## 🗂️ Fase 1: Limpeza da Documentação

### Objetivo
Remover arquivos `.md` duplicados e organizar a documentação.

### ⏱️ Tempo estimado: 5 minutos

### O que vai ser deletado:

```
❌ CORRECOES_FINAIS.md      - Informações já aplicadas
❌ CORRIGIDO.md             - Status antigo
❌ RELATORIO_TESTES.md      - Relatório temporário
❌ TUTORIAL_CORRECOES.md    - Será substituído por este guia
❌ FASE1_LIMPEZA_DOCUMENTACAO.md - Será consolidado aqui
```

### O que vai permanecer:

```
✅ README.md                 - Documentação principal
✅ START_HERE.md             - Guia de início rápido
✅ Attributions.md           - Créditos obrigatórios
✅ GUIA_COMPLETO_CORRECOES.md (este arquivo)
```

### Passo a passo:

1. **No Figma Make**, peça ao assistente:
   ```
   Delete os arquivos: CORRECOES_FINAIS.md, CORRIGIDO.md, 
   RELATORIO_TESTES.md, TUTORIAL_CORRECOES.md, 
   FASE1_LIMPEZA_DOCUMENTACAO.md
   ```

2. **Verifique** que apenas os arquivos essenciais permanecem na raiz.

### ✅ Checklist:

- [ ] Deletei os 5 arquivos redundantes
- [ ] `README.md` ainda existe
- [ ] `START_HERE.md` ainda existe
- [ ] `Attributions.md` ainda existe

---

## 🗄️ Fase 2: Renomeação das Tabelas

### Objetivo
Remover o sufixo `_7af4432d` de todas as tabelas do banco de dados.

### ⏱️ Tempo estimado: 15-20 minutos

### Lista de Tabelas a Renomear:

```
usuarios_7af4432d                → usuarios
instituicoes_7af4432d            → instituicoes
estacoes_7af4432d                → estacoes
embaixadores_7af4432d            → embaixadores
embaixadores_estacoes_7af4432d   → embaixadores_estacoes
coletas_7af4432d                 → coletas
comercios_7af4432d               → comercios
vantagens_7af4432d               → vantagens
resgates_7af4432d                → resgates
```

### Passo a passo:

#### 2.1. Abrir o SQL Editor do Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto "Circuito Jovem Sustentável"
3. No menu lateral, clique em **SQL Editor**
4. Clique em **+ New query**

#### 2.2. Execute o SQL de Renomeação

Cole o seguinte SQL e clique em **Run**:

```sql
-- ============================================
-- RENOMEAR TABELAS - Remover sufixo _7af4432d
-- ============================================

-- 1. Renomear tabelas principais
ALTER TABLE usuarios_7af4432d RENAME TO usuarios;
ALTER TABLE instituicoes_7af4432d RENAME TO instituicoes;
ALTER TABLE estacoes_7af4432d RENAME TO estacoes;
ALTER TABLE embaixadores_7af4432d RENAME TO embaixadores;
ALTER TABLE embaixadores_estacoes_7af4432d RENAME TO embaixadores_estacoes;
ALTER TABLE coletas_7af4432d RENAME TO coletas;
ALTER TABLE comercios_7af4432d RENAME TO comercios;
ALTER TABLE vantagens_7af4432d RENAME TO vantagens;
ALTER TABLE resgates_7af4432d RENAME TO resgates;

-- 2. Renomear índices (se existirem)
ALTER INDEX IF EXISTS idx_usuarios_email RENAME TO idx_usuarios_email_new;
DROP INDEX IF EXISTS idx_usuarios_email_new;
CREATE INDEX idx_usuarios_email ON usuarios(email);

ALTER INDEX IF EXISTS idx_estacoes_instituicao RENAME TO idx_estacoes_instituicao_new;
DROP INDEX IF EXISTS idx_estacoes_instituicao_new;
CREATE INDEX idx_estacoes_instituicao ON estacoes(instituicao_id);

ALTER INDEX IF EXISTS idx_embaixadores_usuario RENAME TO idx_embaixadores_usuario_new;
DROP INDEX IF EXISTS idx_embaixadores_usuario_new;
CREATE INDEX idx_embaixadores_usuario ON embaixadores(usuario_id);

ALTER INDEX IF EXISTS idx_coletas_usuario RENAME TO idx_coletas_usuario_new;
DROP INDEX IF EXISTS idx_coletas_usuario_new;
CREATE INDEX idx_coletas_usuario ON coletas(usuario_id);

ALTER INDEX IF EXISTS idx_coletas_estacao RENAME TO idx_coletas_estacao_new;
DROP INDEX IF EXISTS idx_coletas_estacao_new;
CREATE INDEX idx_coletas_estacao ON coletas(estacao_id);

ALTER INDEX IF EXISTS idx_coletas_status RENAME TO idx_coletas_status_new;
DROP INDEX IF EXISTS idx_coletas_status_new;
CREATE INDEX idx_coletas_status ON coletas(status);

ALTER INDEX IF EXISTS idx_vantagens_comercio RENAME TO idx_vantagens_comercio_new;
DROP INDEX IF EXISTS idx_vantagens_comercio_new;
CREATE INDEX idx_vantagens_comercio ON vantagens(comercio_id);

ALTER INDEX IF EXISTS idx_vantagens_ativa RENAME TO idx_vantagens_ativa_new;
DROP INDEX IF EXISTS idx_vantagens_ativa_new;
CREATE INDEX idx_vantagens_ativa ON vantagens(ativa);

ALTER INDEX IF EXISTS idx_resgates_usuario RENAME TO idx_resgates_usuario_new;
DROP INDEX IF EXISTS idx_resgates_usuario_new;
CREATE INDEX idx_resgates_usuario ON resgates(usuario_id);

ALTER INDEX IF EXISTS idx_resgates_vantagem RENAME TO idx_resgates_vantagem_new;
DROP INDEX IF EXISTS idx_resgates_vantagem_new;
CREATE INDEX idx_resgates_vantagem ON resgates(vantagem_id);

ALTER INDEX IF EXISTS idx_resgates_status RENAME TO idx_resgates_status_new;
DROP INDEX IF EXISTS idx_resgates_status_new;
CREATE INDEX idx_resgates_status ON resgates(status);

-- 3. Verificar se funcionou
SELECT 'Renomeação concluída com sucesso!' as status;
```

#### 2.3. Verificar as Tabelas

Execute este SQL para confirmar:

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver:

```
✅ coletas
✅ comercios
✅ embaixadores
✅ embaixadores_estacoes
✅ estacoes
✅ instituicoes
✅ resgates
✅ usuarios
✅ vantagens
```

❌ NÃO deve ver nenhuma tabela com `_7af4432d`

### ✅ Checklist:

- [ ] Executei o SQL de renomeação
- [ ] Verifiquei que as tabelas foram renomeadas
- [ ] Nenhuma tabela tem mais o sufixo `_7af4432d`
- [ ] Índices foram recriados

---

## 🔐 Fase 3: Correção das Políticas RLS

### Objetivo
Corrigir políticas RLS que usam `auth.uid()` (que não funciona) e criar políticas permissivas corretas.

### ⏱️ Tempo estimado: 20-25 minutos

### O Problema

O código atual usa políticas RLS que verificam `auth.uid()`:

```sql
-- ❌ NÃO FUNCIONA - auth.uid() sempre retorna null
CREATE POLICY "Usuários podem ver próprias coletas" ON coletas
  FOR SELECT USING (auth.uid() = usuario_id);
```

**Por quê não funciona?**
- O app não usa Supabase Auth (não há `signUp()` ou `signIn()` do Supabase)
- O app usa autenticação customizada com localStorage
- `auth.uid()` sempre retorna `null`
- Resultado: **ninguém consegue criar/ver coletas e resgates**

### A Solução

Como o app usa **service role key** (configurada em `/utils/supabase/client.tsx`), vamos criar políticas permissivas que permitam operações quando autenticado via service role.

### Passo a passo:

#### 3.1. Remover Políticas Antigas

No SQL Editor do Supabase, execute:

```sql
-- ============================================
-- REMOVER POLÍTICAS RLS ANTIGAS
-- ============================================

-- Desabilitar RLS temporariamente
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE instituicoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE estacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE embaixadores_estacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE coletas DISABLE ROW LEVEL SECURITY;
ALTER TABLE comercios DISABLE ROW LEVEL SECURITY;
ALTER TABLE vantagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE resgates DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
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
DROP POLICY IF EXISTS "Embaixadores podem validar coletas" ON coletas;
DROP POLICY IF EXISTS "Permitir leitura de coletas" ON coletas;
DROP POLICY IF EXISTS "Permitir criação de coletas" ON coletas;
DROP POLICY IF EXISTS "Permitir atualização de coletas" ON coletas;
DROP POLICY IF EXISTS "Usuários podem ver próprios resgates" ON resgates;
DROP POLICY IF EXISTS "Usuários podem criar resgates" ON resgates;
DROP POLICY IF EXISTS "Comércios podem validar resgates" ON resgates;
DROP POLICY IF EXISTS "Permitir leitura de resgates" ON resgates;
DROP POLICY IF EXISTS "Permitir criação de resgates" ON resgates;
DROP POLICY IF EXISTS "Permitir atualização de resgates" ON resgates;

SELECT 'Políticas antigas removidas com sucesso!' as status;
```

#### 3.2. Criar Novas Políticas Permissivas

Execute este SQL:

```sql
-- ============================================
-- CRIAR NOVAS POLÍTICAS RLS
-- ============================================
-- Como usamos service role key, precisamos de políticas permissivas
-- que funcionem sem auth.uid()

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

-- ==================== USUARIOS ====================
CREATE POLICY "Permitir todas operações em usuarios" ON usuarios
  FOR ALL USING (true) WITH CHECK (true);

-- ==================== INSTITUICOES ====================
CREATE POLICY "Permitir leitura de instituicoes" ON instituicoes
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de instituicoes" ON instituicoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de instituicoes" ON instituicoes
  FOR UPDATE USING (true) WITH CHECK (true);

-- ==================== ESTACOES ====================
CREATE POLICY "Permitir leitura de estacoes" ON estacoes
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de estacoes" ON estacoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de estacoes" ON estacoes
  FOR UPDATE USING (true) WITH CHECK (true);

-- ==================== EMBAIXADORES ====================
CREATE POLICY "Permitir todas operações em embaixadores" ON embaixadores
  FOR ALL USING (true) WITH CHECK (true);

-- ==================== EMBAIXADORES_ESTACOES ====================
CREATE POLICY "Permitir todas operações em embaixadores_estacoes" ON embaixadores_estacoes
  FOR ALL USING (true) WITH CHECK (true);

-- ==================== COLETAS ====================
-- IMPORTANTE: Estas políticas permissivas resolvem o problema de auth.uid()
CREATE POLICY "Permitir leitura de coletas" ON coletas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de coletas" ON coletas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de coletas" ON coletas
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão de coletas" ON coletas
  FOR DELETE USING (true);

-- ==================== COMERCIOS ====================
CREATE POLICY "Permitir leitura de comercios" ON comercios
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de comercios" ON comercios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de comercios" ON comercios
  FOR UPDATE USING (true) WITH CHECK (true);

-- ==================== VANTAGENS ====================
CREATE POLICY "Permitir leitura de vantagens" ON vantagens
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de vantagens" ON vantagens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de vantagens" ON vantagens
  FOR UPDATE USING (true) WITH CHECK (true);

-- ==================== RESGATES ====================
-- IMPORTANTE: Estas políticas permissivas resolvem o problema de auth.uid()
CREATE POLICY "Permitir leitura de resgates" ON resgates
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de resgates" ON resgates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de resgates" ON resgates
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão de resgates" ON resgates
  FOR DELETE USING (true);

SELECT 'Novas políticas RLS criadas com sucesso!' as status;
```

#### 3.3. Verificar as Políticas

Execute para verificar:

```sql
-- Listar todas as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Você deve ver políticas para todas as tabelas.

### ✅ Checklist:

- [ ] Removi as políticas antigas com `auth.uid()`
- [ ] Criei as novas políticas permissivas
- [ ] Verifiquei que todas as tabelas têm políticas
- [ ] RLS está habilitado em todas as tabelas

---

## 📦 Fase 4: Consolidação da API

### Objetivo
Unificar os arquivos API duplicados em um único arquivo consistente.

### ⏱️ Tempo estimado: 10-15 minutos

### O Problema

Existem dois arquivos API:
- `/utils/api.ts` (mais completo, 420 linhas)
- `/utils/api.tsx` (mais simples, 164 linhas)

Isso causa confusão e alguns componentes usam um, outros usam outro.

### A Solução

Manter apenas `/utils/api.ts` com as melhores práticas de ambos, e atualizar todos os imports para usar este arquivo.

### Passo a passo:

#### 4.1. Atualizar `/utils/api.ts`

Peça ao assistente:

```
Atualize o arquivo /utils/api.ts:
1. Remova o sufixo _7af4432d da URL da API
2. Remova todos os tipos de interface que referenciam _7af4432d
3. Adicione comentários explicativos
4. Mantenha toda a funcionalidade existente
```

#### 4.2. Deletar `/utils/api.tsx`

Peça ao assistente:

```
Delete o arquivo /utils/api.tsx
```

#### 4.3. Atualizar `/supabase/functions/server/database.tsx`

Peça ao assistente:

```
Atualize o arquivo /supabase/functions/server/database.tsx:
1. Remova o sufixo _7af4432d de todas as referências às tabelas
2. Atualize o SQL de criação para usar nomes sem sufixo
3. Atualize a função checkTablesExist() para usar 'usuarios' em vez de 'usuarios_7af4432d'
```

#### 4.4. Verificar Imports nos Componentes

Execute uma busca para ver quais componentes precisam ser atualizados:

Peça ao assistente:

```
Procure por todos os arquivos que importam de 'utils/api' ou 'utils/api.tsx' 
e me liste quais precisam ser atualizados
```

### ✅ Checklist:

- [ ] Atualizei `/utils/api.ts` para remover sufixos
- [ ] Deletei `/utils/api.tsx`
- [ ] Atualizei `/supabase/functions/server/database.tsx`
- [ ] Verifiquei os imports nos componentes
- [ ] Todos os componentes importam de `/utils/api.ts`

---

## 🧪 Teste Final

### Objetivo
Verificar que todas as correções funcionaram e o sistema está operacional.

### ⏱️ Tempo estimado: 15-20 minutos

### Testes a Realizar:

#### Teste 1: Login/Cadastro

- [ ] Abra o app no navegador
- [ ] Crie uma nova conta de estudante
- [ ] Faça login com a conta criada
- [ ] Verifique que o Dashboard carrega

#### Teste 2: Verificar Tabelas no Supabase

No SQL Editor, execute:

```sql
-- Verificar dados nas tabelas
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'instituicoes', COUNT(*) FROM instituicoes
UNION ALL
SELECT 'estacoes', COUNT(*) FROM estacoes
UNION ALL
SELECT 'comercios', COUNT(*) FROM comercios
UNION ALL
SELECT 'vantagens', COUNT(*) FROM vantagens
UNION ALL
SELECT 'coletas', COUNT(*) FROM coletas
UNION ALL
SELECT 'resgates', COUNT(*) FROM resgates;
```

Deve retornar contagens sem erros.

#### Teste 3: Criar uma Coleta

- [ ] No app, vá para "Estações"
- [ ] Clique em "Registrar Coleta"
- [ ] Preencha os dados
- [ ] Verifique que a coleta foi criada
- [ ] Confira no Supabase:

```sql
SELECT * FROM coletas ORDER BY criado_em DESC LIMIT 5;
```

#### Teste 4: Resgatar uma Vantagem

- [ ] No app, vá para "Vantagens"
- [ ] Escolha uma vantagem
- [ ] Clique em "Resgatar"
- [ ] Verifique que o resgate foi registrado
- [ ] Confira no Supabase:

```sql
SELECT * FROM resgates ORDER BY criado_em DESC LIMIT 5;
```

#### Teste 5: Verificar Console de Erros

- [ ] Abra o Console do navegador (F12)
- [ ] Navegue pelo app
- [ ] Verifique que NÃO há erros de:
  - "does not exist" (tabela não existe)
  - "permission denied" (sem permissão)
  - "auth.uid() is null" (problema de autenticação)

### ✅ Checklist Final:

- [ ] Login e cadastro funcionam
- [ ] Tabelas sem sufixo `_7af4432d` estão acessíveis
- [ ] Coletas podem ser criadas
- [ ] Resgates podem ser criados
- [ ] Sem erros no console do navegador
- [ ] Políticas RLS não bloqueiam operações

---

## 🎉 Parabéns!

Se você chegou até aqui e todos os testes passaram, o sistema está corrigido!

### O que foi feito:

✅ Documentação limpa e organizada
✅ Tabelas renomeadas sem sufixos
✅ Políticas RLS funcionando corretamente
✅ API consolidada em um único arquivo
✅ Sistema totalmente funcional

### Próximos Passos:

1. **Commitar as mudanças** no Git (se estiver usando)
2. **Documentar** qualquer configuração adicional necessária
3. **Preparar** o app para apresentação ao professor
4. **Testar** com usuários reais (colegas de turma)

---

## 🆘 Problemas Comuns e Soluções

### Problema: "relation 'usuarios_7af4432d' does not exist"

**Causa**: Código ainda referencia tabela antiga com sufixo

**Solução**: Busque no código por `_7af4432d` e remova todas as referências

```bash
# Use a busca do Figma Make ou do seu editor
# Procure por: _7af4432d
```

### Problema: "permission denied for table coletas"

**Causa**: Políticas RLS não foram criadas corretamente

**Solução**: Execute novamente a Fase 3, seção 3.2

### Problema: "Cannot read properties of null (reading 'uid')"

**Causa**: Código ainda usa `auth.uid()` em algum lugar

**Solução**: Procure por `auth.uid()` no código e remova

### Problema: "Failed to fetch" ao fazer login

**Causa**: URL da API ainda tem `_7af4432d`

**Solução**: Verifique `/utils/api.ts` e remova o sufixo da URL

---

## 📞 Suporte

Se encontrar problemas não listados aqui:

1. Verifique o **Console do navegador** (F12) para mensagens de erro
2. Verifique os **Logs do Supabase** (Dashboard > Logs)
3. Execute os **testes SQL** para ver o estado do banco
4. Peça ajuda ao assistente descrevendo o erro específico

---

**Data de criação:** Outubro 2025  
**Versão:** 1.0  
**Autor:** Assistente AI - Figma Make

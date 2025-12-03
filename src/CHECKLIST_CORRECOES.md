# ✅ Checklist de Correções - Circuito Jovem Sustentável

> **Imprima este documento** e marque cada item conforme completa.  
> Ou use-o como guia ao lado da tela.

---

## 📅 Informações da Sessão

- **Data:** _____ / _____ / _____
- **Horário início:** _____ : _____
- **Horário fim:** _____ : _____
- **Desenvolvedor:** _________________________________

---

## 🎯 Preparação (5 minutos)

### Antes de Começar

- [ ] Abri o [Painel do Supabase](https://supabase.com/dashboard)
- [ ] Abri o SQL Editor do meu projeto
- [ ] Tenho acesso ao Figma Make aberto
- [ ] Tenho os guias de correção abertos:
  - [ ] `GUIA_COMPLETO_CORRECOES.md` para detalhes
  - [ ] `GUIA_RAPIDO.md` para referência rápida
  - [ ] Este checklist impresso ou em outra tela
- [ ] _(Opcional)_ Fiz backup do banco de dados
- [ ] Estou preparado para ~1 hora de trabalho

**Problemas na preparação?** ___________________________________________

---

## 📄 FASE 1: Limpeza da Documentação (5 min)

### Objetivo
Deletar arquivos `.md` duplicados e organizar documentação.

### Arquivos a Deletar

- [ ] `CORRECOES_FINAIS.md`
- [ ] `CORRIGIDO.md`
- [ ] `RELATORIO_TESTES.md`
- [ ] `TUTORIAL_CORRECOES.md`
- [ ] `FASE1_LIMPEZA_DOCUMENTACAO.md`

### Comando para o Assistente

```
Delete os arquivos: CORRECOES_FINAIS.md, CORRIGIDO.md, 
RELATORIO_TESTES.md, TUTORIAL_CORRECOES.md, 
FASE1_LIMPEZA_DOCUMENTACAO.md
```

### Verificação

- [ ] Arquivos foram deletados
- [ ] `README.md` ainda existe
- [ ] `START_HERE.md` ainda existe
- [ ] `Attributions.md` ainda existe
- [ ] Apenas ~6 arquivos `.md` na raiz agora

### Status
- [ ] ✅ Fase 1 completa
- [ ] ❌ Problemas encontrados: ___________________________________________

---

## 🗄️ FASE 2: Renomeação das Tabelas (15 min)

### Objetivo
Remover sufixo `_7af4432d` de todas as tabelas.

### 2.1 - Abrir SQL Editor

- [ ] Acessei o Supabase Dashboard
- [ ] Cliquei em "SQL Editor"
- [ ] Cliquei em "+ New query"

### 2.2 - Renomear Tabelas

- [ ] Colei o SQL de renomeação (ver `GUIA_RAPIDO.md` ou `GUIA_COMPLETO_CORRECOES.md`)
- [ ] Cliquei em "Run"
- [ ] ✅ SQL executou sem erros
- [ ] ❌ Erros encontrados: ___________________________________________

### 2.3 - Verificar Renomeação

Execute este SQL:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Marque as tabelas que aparecem **SEM** sufixo:

- [ ] `coletas`
- [ ] `comercios`
- [ ] `embaixadores`
- [ ] `embaixadores_estacoes`
- [ ] `estacoes`
- [ ] `instituicoes`
- [ ] `resgates`
- [ ] `usuarios`
- [ ] `vantagens`

### Status
- [ ] ✅ Todas as 9 tabelas renomeadas
- [ ] ✅ Nenhuma tabela com `_7af4432d`
- [ ] ✅ Fase 2 completa
- [ ] ❌ Problemas: ___________________________________________

---

## 🔐 FASE 3: Correção das Políticas RLS (20 min)

### Objetivo
Remover políticas com `auth.uid()` e criar políticas permissivas.

### 3.1 - Desabilitar RLS e Remover Políticas Antigas

- [ ] Colei o SQL de remoção de políticas (ver `GUIA_RAPIDO.md`)
- [ ] Cliquei em "Run"
- [ ] ✅ Executou (pode ter alguns erros, OK)

### 3.2 - Criar Novas Políticas Permissivas

- [ ] Colei o SQL de criação de políticas (ver `GUIA_RAPIDO.md`)
- [ ] Cliquei em "Run"
- [ ] ✅ Executou sem erros
- [ ] ❌ Erros encontrados: ___________________________________________

### 3.3 - Verificar Políticas Criadas

Execute este SQL:
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' ORDER BY tablename;
```

- [ ] Vejo políticas para `usuarios`
- [ ] Vejo políticas para `instituicoes`
- [ ] Vejo políticas para `estacoes`
- [ ] Vejo políticas para `embaixadores`
- [ ] Vejo políticas para `embaixadores_estacoes`
- [ ] Vejo políticas para `coletas` ⭐ CRÍTICO
- [ ] Vejo políticas para `comercios`
- [ ] Vejo políticas para `vantagens`
- [ ] Vejo políticas para `resgates` ⭐ CRÍTICO

### Teste Específico - Inserir Coleta Teste

Execute este SQL:
```sql
INSERT INTO coletas (usuario_id, estacao_id, peso_kg, material_tipo)
VALUES (
  (SELECT id FROM usuarios LIMIT 1),
  (SELECT id FROM estacoes LIMIT 1),
  1.5,
  'plástico'
);

SELECT * FROM coletas ORDER BY criado_em DESC LIMIT 1;
```

- [ ] ✅ INSERT funcionou
- [ ] ✅ SELECT retornou a coleta
- [ ] ❌ Erros: ___________________________________________

### Status
- [ ] ✅ RLS habilitado em todas as tabelas
- [ ] ✅ Políticas permissivas criadas
- [ ] ✅ Teste de INSERT/SELECT passou
- [ ] ✅ Fase 3 completa
- [ ] ❌ Problemas: ___________________________________________

---

## 📦 FASE 4: Consolidação da API (10 min)

### Objetivo
Unificar arquivos API e remover `_7af4432d` do código.

### 4.1 - Atualizar `/utils/api.ts`

Comando para o assistente:
```
Atualize o arquivo /utils/api.ts removendo todas as 
referências a "_7af4432d" nas URLs e constantes.
```

- [ ] Executei o comando
- [ ] ✅ Arquivo atualizado
- [ ] ❌ Erros: ___________________________________________

### 4.2 - Deletar `/utils/api.tsx`

Comando para o assistente:
```
Delete o arquivo /utils/api.tsx
```

- [ ] Executei o comando
- [ ] ✅ Arquivo deletado
- [ ] Arquivo não existia mais

### 4.3 - Atualizar `/supabase/functions/server/database.tsx`

Comando para o assistente:
```
Atualize /supabase/functions/server/database.tsx 
removendo todas as referências a "_7af4432d" nas 
tabelas e SQL.
```

- [ ] Executei o comando
- [ ] ✅ Arquivo atualizado
- [ ] ❌ Erros: ___________________________________________

### 4.4 - Verificar Imports nos Componentes

Comando para o assistente:
```
Procure por arquivos que importam de 'utils/api.tsx' 
e atualize para 'utils/api.ts'
```

- [ ] Executei a busca
- [ ] Verifiquei quantos arquivos precisam atualizar: _______
- [ ] ✅ Todos os imports atualizados para `/utils/api.ts`

### Status
- [ ] ✅ `/utils/api.ts` atualizado (sem `_7af4432d`)
- [ ] ✅ `/utils/api.tsx` deletado
- [ ] ✅ `/supabase/functions/server/database.tsx` atualizado
- [ ] ✅ Todos os imports corretos
- [ ] ✅ Fase 4 completa
- [ ] ❌ Problemas: ___________________________________________

---

## 🧪 TESTE FINAL (15 min)

### Objetivo
Verificar que todas as correções funcionaram.

### Teste 1: Login/Cadastro

- [ ] Abri o app no navegador
- [ ] Criei uma nova conta de estudante
  - Email usado: ___________________________________________
- [ ] ✅ Cadastro funcionou
- [ ] Fiz login com a conta
- [ ] ✅ Login funcionou
- [ ] Dashboard carregou corretamente

### Teste 2: Verificar Tabelas no Banco

Execute no SQL Editor:
```sql
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL SELECT 'instituicoes', COUNT(*) FROM instituicoes
UNION ALL SELECT 'estacoes', COUNT(*) FROM estacoes
UNION ALL SELECT 'comercios', COUNT(*) FROM comercios
UNION ALL SELECT 'vantagens', COUNT(*) FROM vantagens
UNION ALL SELECT 'coletas', COUNT(*) FROM coletas
UNION ALL SELECT 'resgates', COUNT(*) FROM resgates;
```

- [ ] ✅ Query executou sem erros
- [ ] ✅ Todas as tabelas têm dados

### Teste 3: Criar uma Coleta ⭐ CRÍTICO

- [ ] No app, fui para "Estações"
- [ ] Cliquei em "Registrar Coleta" ou similar
- [ ] Preenchi os dados:
  - Material: ___________________________________________
  - Peso: ___________________________________________
- [ ] ✅ Coleta foi criada sem erros
- [ ] ✅ Coleta aparece no histórico

Verifique no Supabase:
```sql
SELECT * FROM coletas ORDER BY criado_em DESC LIMIT 5;
```

- [ ] ✅ Coleta aparece no banco

### Teste 4: Resgatar uma Vantagem ⭐ CRÍTICO

- [ ] No app, fui para "Vantagens"
- [ ] Escolhi uma vantagem disponível
- [ ] Cliquei em "Resgatar"
- [ ] ✅ Resgate foi criado sem erros
- [ ] ✅ Código de resgate foi gerado

Verifique no Supabase:
```sql
SELECT * FROM resgates ORDER BY criado_em DESC LIMIT 5;
```

- [ ] ✅ Resgate aparece no banco

### Teste 5: Console de Erros

- [ ] Abri o Console do navegador (F12)
- [ ] Naveguei entre todas as telas do app
- [ ] ✅ Não há erros de "does not exist"
- [ ] ✅ Não há erros de "permission denied"
- [ ] ✅ Não há erros de "auth.uid() is null"
- [ ] ❌ Erros encontrados: ___________________________________________

### Status Final dos Testes
- [ ] ✅ Todos os 5 testes passaram
- [ ] ❌ Alguns testes falharam: ___________________________________________

---

## ✅ CHECKLIST FINAL DE VALIDAÇÃO

### Banco de Dados
- [ ] ✅ Tabelas sem sufixo `_7af4432d`
- [ ] ✅ 9 tabelas renomeadas corretamente
- [ ] ✅ Políticas RLS ativas
- [ ] ✅ Políticas permissivas criadas
- [ ] ✅ INSERT em coletas funciona
- [ ] ✅ INSERT em resgates funciona

### Código
- [ ] ✅ Apenas `/utils/api.ts` existe
- [ ] ✅ `/utils/api.tsx` foi deletado
- [ ] ✅ Sem referências a `_7af4432d` no código
- [ ] ✅ Todos os imports usando `/utils/api.ts`

### Documentação
- [ ] ✅ 5 arquivos `.md` redundantes deletados
- [ ] ✅ Apenas documentos essenciais permanecem
- [ ] ✅ `GUIA_COMPLETO_CORRECOES.md` criado
- [ ] ✅ `GUIA_RAPIDO.md` criado
- [ ] ✅ `RELATORIO_TECNICO.md` criado

### Funcionalidade
- [ ] ✅ Login funciona
- [ ] ✅ Cadastro funciona
- [ ] ✅ Coletas podem ser criadas
- [ ] ✅ Resgates podem ser criados
- [ ] ✅ Sem erros críticos no console

---

## 🎉 RESULTADO FINAL

### Status Geral
- [ ] ✅ **SUCESSO** - Todas as correções implementadas e testadas
- [ ] ⚠️ **PARCIAL** - Algumas correções pendentes
- [ ] ❌ **FALHA** - Problemas críticos não resolvidos

### Tempo Total Gasto
- **Previsto:** 50 minutos
- **Real:** _______ minutos

### Observações Finais
```
___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________

___________________________________________________________________________
```

---

## 📞 Próximos Passos

Se tudo passou:
- [ ] Commitar mudanças no Git (se aplicável)
- [ ] Preparar apresentação para o professor
- [ ] Documentar qualquer configuração adicional
- [ ] Compartilhar com equipe

Se houve problemas:
- [ ] Rever o `GUIA_COMPLETO_CORRECOES.md` seção de troubleshooting
- [ ] Consultar o `RELATORIO_TECNICO.md` para entender causas
- [ ] Pedir ajuda detalhando erro específico encontrado

---

**✅ Parabéns por completar as correções!**

**Data de conclusão:** _____ / _____ / _____  
**Assinatura:** _________________________________

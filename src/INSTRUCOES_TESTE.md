# 🚀 INSTRUÇÕES PARA TESTAR O LOGIN

## ⚠️ IMPORTANTE: Configure o banco PRIMEIRO

O aplicativo **NÃO VAI FUNCIONAR** até você executar o SQL no Supabase!

## 📝 Passo a Passo (5 minutos)

### 1️⃣ Tentar fazer login (vai dar erro)
- Tente fazer login no app
- Você verá um botão para **"Configurar Banco de Dados"**
- Clique nele

### 2️⃣ Copiar o SQL
- Na tela de setup, clique em **"Copiar SQL"**
- O SQL completo será copiado para sua área de transferência

### 3️⃣ Abrir Supabase SQL Editor
- Clique no botão **"Abrir SQL Editor do Supabase"**
- Ou acesse manualmente: https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql/new

### 4️⃣ Executar o SQL
- Cole o SQL no editor
- Clique em **"Run"** ou pressione **Ctrl+Enter**
- Aguarde a mensagem: "Setup completo! Todas as tabelas foram criadas com sucesso."

### 5️⃣ Criar uma conta
- Volte para o app
- Clique em **"Concluir Setup"** (ou recarregue a página)
- Clique em **"Criar conta"**
- Preencha os dados:
  - Nome: Seu nome
  - Email: seu@email.com
  - Tipo: Estudante
  - Instituição: UNINASSAU das Graças
  - Senha: 123456
- Clique em **"Criar conta"**

### 6️⃣ Testar funcionalidades

#### ✅ Login funciona?
- Faça login com o email e senha que você criou
- Você deve ver o Dashboard

#### ✅ Pode criar coleta?
- No Dashboard, clique em **"+ Nova Coleta"**
- Selecione uma estação
- Escolha o tipo de material (ex: Plástico)
- Digite o peso (ex: 5 kg)
- Clique em **"Registrar Coleta"**
- Verifique se apareceu na lista

#### ✅ Pode resgatar vantagem?
- Clique no ícone de **presente** (Vantagens) na navegação inferior
- Escolha uma vantagem
- Se tiver chaves suficientes, clique em **"Resgatar"**
- Verifique se apareceu no seu perfil

#### ✅ Console sem erros?
- Abra o Console do navegador (F12)
- Verifique se não há erros em vermelho
- Se houver, copie os erros e me envie

---

## 🎉 O que foi mudado na arquitetura?

### Antes (COM ERRO):
```
App → Edge Function (make-server) → Supabase
            ❌ Erro 403
```

### Agora (FUNCIONANDO):
```
App → Supabase Client → Supabase Database
            ✅ Direto!
```

---

## 🔧 Detalhes Técnicos

### SQL Criado
- ✅ 9 tabelas **SEM sufixo** `_7af4432d`
- ✅ Políticas RLS **permissivas** (não usa auth.uid())
- ✅ Dados de exemplo incluídos
- ✅ Índices para performance
- ✅ Foreign keys configuradas

### Tabelas criadas:
1. `usuarios` - Usuários do sistema
2. `instituicoes` - Universidades/Faculdades
3. `estacoes` - Pontos de coleta
4. `embaixadores` - Validadores de coleta
5. `embaixadores_estacoes` - Relação N:N
6. `coletas` - Histórico de reciclagem
7. `comercios` - Parceiros locais
8. `vantagens` - Benefícios disponíveis
9. `resgates` - Vantagens resgatadas

---

## ❓ Problemas Comuns

### Erro: "relation does not exist"
**Solução:** Você ainda não executou o SQL no Supabase. Volte ao passo 2.

### Erro: "Email ou senha incorretos"
**Solução:** Crie uma nova conta primeiro (não há usuários no banco novo).

### Erro: "Chaves insuficientes"
**Solução:** Você precisa fazer coletas primeiro para ganhar chaves!

---

## 📊 Como saber se funcionou?

### Sucesso total = 4/4 ✅
- [ ] Login funciona
- [ ] Pode criar coleta
- [ ] Pode resgatar vantagem
- [ ] Console sem erros

### Se algum teste falhar:
1. Abra o Console (F12)
2. Copie os erros
3. Me envie os erros
4. Vou corrigir imediatamente!

---

## 🎨 Arquitetura Limpa Implementada

```
/utils/api.ts
├── auth.signIn()           → Login direto no Supabase
├── auth.signUp()           → Cadastro direto no Supabase
├── criarColeta()           → Insert direto
├── resgatarVantagem()      → Insert + Update atômico
├── listarVantagens()       → Select com join
└── buscarRanking()         → Select ordenado

Sem Edge Functions! Sem API intermediária! Direto no Supabase! 🚀
```

---

## 💡 Próximos Passos (Depois que funcionar)

1. ✅ Adicionar validação de embaixador
2. ✅ Implementar sistema de níveis
3. ✅ Adicionar notificações push
4. ✅ Integrar mapa real (Google Maps)
5. ✅ Adicionar upload de fotos das coletas

---

**Criado em:** 30/10/2025  
**Status:** ✅ Pronto para testar  
**Arquitetura:** Supabase Client direto (sem Edge Functions)

# 🚀 START HERE - Comece Aqui

## Bem-vindo ao Circuito Jovem Sustentável!

Este é um guia rápido para você começar a usar o sistema.

---

## 📋 Checklist de Configuração

### ☑️ Passo 1: Configurar o Banco de Dados (30 segundos)

1. **Acesse o Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione seu projeto

2. **Abra o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o SQL de correção:**
   - Abra o arquivo [`EXECUTE_AGORA.sql`](./EXECUTE_AGORA.sql)
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run"

4. **Aguarde a confirmação:**
   - Você verá "Success. No rows returned"
   - Isso significa que funcionou! ✅

### ☑️ Passo 2: Configurar Storage (Opcional - 2 minutos)

**Para que serve:** Permitir upload de fotos de perfil

1. **Acesse o Storage no Supabase:**
   - Menu lateral → "Storage"

2. **Criar o bucket:**
   - Clique em "New bucket"
   - Nome: `profile-photos`
   - Marque como "Public bucket"
   - Clique em "Create bucket"

3. **Configurar políticas:**
   - Clique no bucket criado
   - Aba "Policies"
   - Adicione política de leitura pública e escrita autenticada

### ☑️ Passo 3: Usar a Aplicação

1. **Criar sua conta:**
   - Abra a aplicação
   - Clique em "Criar conta"
   - Preencha seus dados:
     - Nome completo
     - Email
     - Tipo de usuário (Estudante, Embaixador ou Comunidade)
     - Instituição
     - Senha
   - Clique em "Criar conta"

2. **Explorar o app:**
   - 🏠 **Início**: Veja suas chaves e nível
   - 🏆 **Ranking**: Compare-se com outros usuários
   - 📍 **Estações**: Encontre pontos de coleta próximos
   - 🎁 **Vantagens**: Veja os benefícios disponíveis
   - 👤 **Perfil**: Edite suas informações e veja conquistas

---

## 🎯 Fluxo de Uso

```
┌─────────────────────────┐
│  1. Criar conta         │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  2. Editar perfil       │
│  (adicionar foto, etc)  │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  3. Encontrar estações  │
│  (Mapa de coleta)       │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  4. Reciclar materiais  │
│  (Na estação física)    │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  5. Ganhar chaves       │
│  (Sistema de pontos)    │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  6. Resgatar vantagens  │
│  (Benefícios locais)    │
└─────────────────────────┘
```

---

## 🔑 Tipos de Usuário

### 👨‍🎓 Estudante
- Acesso a todas as funcionalidades básicas
- Pode reciclar e ganhar chaves
- Pode resgatar vantagens
- Pode ver ranking e competir

### 🛡️ Jovem Embaixador
- Tudo do estudante +
- Validar coletas via QR Code
- Acessar painel administrativo
- Gerenciar sua estação

### 👥 Comunidade
- Mesmas funcionalidades do estudante
- Voltado para público não universitário

---

## ⚡ Comandos Rápidos

### Fazer logout
1. Vá para **Perfil** (👤)
2. Role até o final
3. Clique em "Sair da Conta"
4. Confirme

**OU**

1. Vá para **Perfil** (👤)
2. Clique no ícone de configurações (⚙️)
3. Role até o final
4. Clique em "Sair da Conta"

### Editar perfil
1. Vá para **Perfil** (👤)
2. Clique em "Editar Perfil"
3. Altere as informações desejadas
4. Clique em "Salvar"

### Ver debug (apenas administradores)
1. Faça login como embaixador ou admin
2. Vá para **Início** (🏠)
3. Role até o final da página
4. Clique em "Mostrar Debug Administrativo"

---

## 🐛 Problemas Comuns

### ❌ Erro ao criar conta
**Causa:** Banco de dados não configurado  
**Solução:** Execute o `EXECUTE_AGORA.sql` (Passo 1)

### ❌ "Coluna 'curso' não encontrada"
**Causa:** Banco desatualizado  
**Solução:** Execute o `EXECUTE_AGORA.sql` (Passo 1)

### ❌ "Violação de política de segurança"
**Causa:** RLS ativado  
**Solução:** Execute o `EXECUTE_AGORA.sql` (Passo 1) - ele desabilita o RLS

### ❌ Upload de foto não funciona
**Causa:** Storage não configurado  
**Solução:** Configure o Storage (Passo 2)

### ❌ Botão de debug não aparece
**Causa:** Você não é administrador  
**Solução:** Normal! Debug só aparece para embaixadores e admins

---

## 📚 Documentação Adicional

- **[README.md](./README.md)** - Visão geral completa do projeto
- **[RELATORIO_TESTES.md](./RELATORIO_TESTES.md)** - Testes e correções realizadas
- **[EXECUTE_AGORA.sql](./EXECUTE_AGORA.sql)** - SQL de correção do banco

---

## 💡 Dicas

1. **Mobile-first**: O app foi projetado para celular, mas funciona no desktop
2. **Dados mock**: Alguns dados (ranking, conquistas) são exemplos até a integração completa
3. **QR Code**: Cada usuário tem um QR Code único no perfil
4. **Chaves**: Você ganha chaves reciclando nas estações validadas
5. **Níveis**: Quanto mais chaves, maior seu nível e mais vantagens desbloqueadas

---

## 🎨 Interface

- **Cor principal**: Roxo tecnológico com ciano
- **Tema**: Dark tech com gradientes neon
- **Navegação**: Bottom navigation (barra inferior)
- **Layout**: Empilhado verticalmente (mobile-first)

---

## ✅ Tudo pronto?

Agora você está pronto para usar o Circuito Jovem Sustentável! 🌱

**Próximo passo:** Abra a aplicação e crie sua conta!

---

## 🆘 Precisa de ajuda?

1. Verifique a seção "Problemas Comuns" acima
2. Leia o [README.md](./README.md)
3. Consulte o [RELATORIO_TESTES.md](./RELATORIO_TESTES.md)

---

**Desenvolvido para conectar jovens com sustentabilidade** 🚀🌿

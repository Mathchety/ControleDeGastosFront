# Exemplos de Comandos CURL para Testes

Este documento contém exemplos de comandos curl para testar os endpoints da API.

**Base URL:** `http://147.185.221.212:61489/api/v1`

---

## 🔐 Autenticação

### 1. Registrar novo usuário
```bash
curl -X POST http://147.185.221.212:61489/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

---

### 2. Login
```bash
curl -X POST http://147.185.221.212:61489/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

---

### 3. Obter perfil do usuário
```bash
# Substitua SEU_TOKEN pelo token recebido no login
curl -X GET http://147.185.221.212:61489/api/v1/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta esperada:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 🔑 Recuperação de Senha

### 4. Esqueci minha senha (envia código de 6 dígitos)
```bash
curl -X POST http://147.185.221.212:61489/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Código de verificação enviado para seu email"
}
```

**⚠️ Importante:** 
- Verifique o email para obter o código de 6 dígitos
- O código tem validade limitada (definida no backend)

---

### 5. Resetar senha com código
```bash
# Substitua 123456 pelo código recebido no email
curl -X POST http://147.185.221.212:61489/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "token": "123456",
    "newPassword": "novaSenha123"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Senha resetada com sucesso"
}
```

---

## 👤 Gerenciamento de Perfil

### 6. Atualizar nome (requer JWT)
```bash
# Substitua SEU_TOKEN pelo token recebido no login
curl -X PATCH http://147.185.221.212:61489/api/v1/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "João Pedro Silva"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Perfil atualizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Pedro Silva",
    "email": "joao@email.com"
  }
}
```

---

## 📧 Troca de Email

### 7. Solicitar troca de email (envia código para NOVO email)
```bash
# Substitua SEU_TOKEN pelo token recebido no login
curl -X POST http://147.185.221.212:61489/api/v1/user/request-email-change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "newEmail": "novo@email.com"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Código de verificação enviado para novo@email.com"
}
```

**⚠️ Importante:** 
- O código é enviado para o NOVO email (não o atual)
- Verifique o novo email para obter o código de 6 dígitos

---

### 8. Confirmar troca de email com código
```bash
# Substitua SEU_TOKEN pelo token e 654321 pelo código recebido
curl -X POST http://147.185.221.212:61489/api/v1/user/confirm-email-change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "newEmail": "novo@email.com",
    "token": "654321"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Email atualizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "novo@email.com"
  }
}
```

---

## 🧪 Fluxo Completo de Teste

### Cenário 1: Registro e Login
```bash
# 1. Registrar
curl -X POST http://147.185.221.212:61489/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste User", "email": "teste@email.com", "password": "senha123"}'

# 2. Login (deve retornar mesmo token)
curl -X POST http://147.185.221.212:61489/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "senha123"}'

# 3. Obter perfil
curl -X GET http://147.185.221.212:61489/api/v1/me \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

### Cenário 2: Recuperação de Senha
```bash
# 1. Solicitar código
curl -X POST http://147.185.221.212:61489/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com"}'

# 2. Verificar email e pegar código

# 3. Resetar senha
curl -X POST http://147.185.221.212:61489/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "token": "CODIGO_6_DIGITOS",
    "newPassword": "novaSenha456"
  }'

# 4. Fazer login com nova senha
curl -X POST http://147.185.221.212:61489/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "novaSenha456"}'
```

---

### Cenário 3: Atualizar Perfil
```bash
# 1. Login
TOKEN=$(curl -X POST http://147.185.221.212:61489/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "senha123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Atualizar nome
curl -X PATCH http://147.185.221.212:61489/api/v1/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Novo Nome"}'

# 3. Verificar alteração
curl -X GET http://147.185.221.212:61489/api/v1/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### Cenário 4: Troca de Email
```bash
# 1. Login
TOKEN=$(curl -X POST http://147.185.221.212:61489/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "senha123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Solicitar troca
curl -X POST http://147.185.221.212:61489/api/v1/user/request-email-change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"newEmail": "novo@email.com"}'

# 3. Verificar NOVO email e pegar código

# 4. Confirmar troca
curl -X POST http://147.185.221.212:61489/api/v1/user/confirm-email-change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "newEmail": "novo@email.com",
    "token": "CODIGO_6_DIGITOS"
  }'

# 5. Verificar alteração
curl -X GET http://147.185.221.212:61489/api/v1/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notas Importantes

### Estrutura da URL
- **Base URL:** `http://147.185.221.212:61489/api/v1`
- **Rotas de autenticação pública:** `/register`, `/login`
- **Rotas de recuperação de senha:** `/auth/forgot-password`, `/auth/reset-password`
- **Rotas protegidas (requerem token):** `/me`, `/user/profile`, `/user/request-email-change`, `/user/confirm-email-change`

### Headers Obrigatórios
- **Content-Type:** `application/json` (todas as requisições POST/PATCH)
- **Authorization:** `Bearer {token}` (rotas protegidas)

### Códigos de Status HTTP
- **200:** Sucesso
- **201:** Criado com sucesso (registro)
- **400:** Dados inválidos
- **401:** Não autenticado ou token inválido
- **404:** Rota não encontrada
- **500:** Erro interno do servidor

### Tratamento de Erros
Todas as respostas de erro seguem o formato:
```json
{
  "error": "Descrição do erro",
  "message": "Mensagem detalhada"
}
```

---

## 🔍 Debugging

### Verificar se API está online
```bash
curl -X GET http://147.185.221.212:61489/api/v1/health
```

### Testar conectividade
```bash
ping 147.185.221.212
```

### Ver logs detalhados (verbose)
```bash
curl -v -X POST http://147.185.221.212:61489/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "senha123"}'
```

### Salvar resposta em arquivo
```bash
curl -X POST http://147.185.221.212:61489/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "senha123"}' \
  -o response.json
```

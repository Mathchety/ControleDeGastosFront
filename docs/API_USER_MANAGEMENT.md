# API - Gerenciamento de Usuário

Este documento descreve os endpoints de gerenciamento de usuário implementados no frontend.

## 📋 Índice
1. [Autenticação](#autenticação)
2. [Recuperação de Senha](#recuperação-de-senha)
3. [Gerenciamento de Perfil](#gerenciamento-de-perfil)
4. [Troca de Email](#troca-de-email)

---

## 🔐 Autenticação

### POST /register
**Descrição:** Registra um novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta:**
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

**Implementado em:**
- `AuthContext.register()`
- `AuthService.register()`

---

### POST /login
**Descrição:** Faz login do usuário

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta:**
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

**Implementado em:**
- `AuthContext.login()`
- `AuthService.login()`

---

### GET /me
**Descrição:** Obtém dados do usuário autenticado

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Implementado em:**
- `AuthContext.validateToken()`
- `AuthService.getMe()`

---

## 🔑 Recuperação de Senha

### POST /auth/forgot-password
**Descrição:** Envia código de recuperação de senha para o email

**Body:**
```json
{
  "email": "joao@email.com"
}
```

**Resposta:**
```json
{
  "message": "Código de verificação enviado para seu email"
}
```

**Fluxo:**
1. Usuário clica em "Esqueci minha senha" na tela de login
2. Digita o email
3. Recebe código de 6 dígitos no email
4. Navega para tela de reset de senha

**Implementado em:**
- `AuthContext.forgotPassword()`
- `AuthService.forgotPassword()`
- `ForgotPasswordScreen`

**Exemplo de uso:**
```javascript
import { useAuth } from '../contexts/AuthContext';

const { forgotPassword } = useAuth();

try {
  await forgotPassword('joao@email.com');
  Alert.alert('Sucesso', 'Código enviado para seu email');
} catch (error) {
  Alert.alert('Erro', error.message);
}
```

---

### POST /auth/reset-password
**Descrição:** Reseta a senha usando código de verificação

**Body:**
```json
{
  "email": "joao@email.com",
  "token": "123456",
  "newPassword": "novaSenha123"
}
```

**Resposta:**
```json
{
  "message": "Senha resetada com sucesso"
}
```

**Validações:**
- Código deve ter 6 dígitos
- Nova senha deve ter no mínimo 6 caracteres
- Confirmação de senha deve coincidir

**Implementado em:**
- `AuthContext.resetPassword()`
- `AuthService.resetPassword()`
- `ResetPasswordScreen`

**Exemplo de uso:**
```javascript
import { useAuth } from '../contexts/AuthContext';

const { resetPassword } = useAuth();

try {
  await resetPassword('joao@email.com', '123456', 'novaSenha123');
  Alert.alert('Sucesso', 'Senha alterada com sucesso');
  navigation.navigate('Auth');
} catch (error) {
  Alert.alert('Erro', error.message);
}
```

---

## 👤 Gerenciamento de Perfil

### PATCH /user/profile
**Descrição:** Atualiza o nome do usuário

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "João Pedro Silva"
}
```

**Resposta:**
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

**Implementado em:**
- `AuthContext.updateProfile()`
- `AuthService.updateProfile()`

**Exemplo de uso:**
```javascript
import { useAuth } from '../contexts/AuthContext';

const { updateProfile, user } = useAuth();

const handleUpdateName = async () => {
  try {
    await updateProfile('João Pedro Silva');
    Alert.alert('Sucesso', 'Nome atualizado com sucesso');
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

**Para implementar no ProfileScreen:**
```javascript
// Adicionar no ProfileScreen.js
const { updateProfile } = useAuth();

const handleEditName = () => {
  Alert.prompt(
    'Editar Nome',
    'Digite seu novo nome:',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salvar',
        onPress: async (newName) => {
          try {
            await updateProfile(newName);
            Alert.alert('Sucesso', 'Nome atualizado com sucesso');
          } catch (error) {
            Alert.alert('Erro', error.message);
          }
        },
      },
    ],
    'plain-text',
    user.name
  );
};
```

---

## 📧 Troca de Email

### POST /user/request-email-change
**Descrição:** Solicita troca de email (envia código para novo email)

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "newEmail": "novo@email.com"
}
```

**Resposta:**
```json
{
  "message": "Código de verificação enviado para novo@email.com"
}
```

**Fluxo:**
1. Usuário clica em editar email
2. Digita novo email
3. Recebe código de 6 dígitos no NOVO email
4. Confirma com código

**Implementado em:**
- `AuthContext.requestEmailChange()`
- `AuthService.requestEmailChange()`

**Exemplo de uso:**
```javascript
import { useAuth } from '../contexts/AuthContext';

const { requestEmailChange } = useAuth();

const handleRequestEmailChange = async () => {
  Alert.prompt(
    'Novo Email',
    'Digite seu novo email:',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar Código',
        onPress: async (newEmail) => {
          try {
            await requestEmailChange(newEmail);
            Alert.alert('Código Enviado', 'Verifique seu novo email');
            // Navegar para tela de confirmação
          } catch (error) {
            Alert.alert('Erro', error.message);
          }
        },
      },
    ],
    'plain-text'
  );
};
```

---

### POST /user/confirm-email-change
**Descrição:** Confirma troca de email com código de verificação

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "newEmail": "novo@email.com",
  "token": "654321"
}
```

**Resposta:**
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

**Validações:**
- Código deve ter 6 dígitos
- Código deve ser válido e não expirado

**Implementado em:**
- `AuthContext.confirmEmailChange()`
- `AuthService.confirmEmailChange()`

**Exemplo de uso:**
```javascript
import { useAuth } from '../contexts/AuthContext';

const { confirmEmailChange } = useAuth();

const handleConfirmEmailChange = async (newEmail, code) => {
  try {
    await confirmEmailChange(newEmail, code);
    Alert.alert('Sucesso', 'Email atualizado com sucesso');
  } catch (error) {
    Alert.alert('Erro', error.message);
  }
};
```

---

## 🔄 Fluxo Completo de Troca de Email

### 1. Componente de Edição de Email
```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const EmailChangeComponent = () => {
  const { requestEmailChange, confirmEmailChange, user } = useAuth();
  const [step, setStep] = useState(1); // 1: input email, 2: input code
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleRequestChange = async () => {
    if (!newEmail.includes('@')) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    try {
      await requestEmailChange(newEmail);
      Alert.alert('Sucesso', 'Código enviado para ' + newEmail);
      setStep(2);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleConfirmChange = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Erro', 'Digite o código de 6 dígitos');
      return;
    }

    try {
      await confirmEmailChange(newEmail, verificationCode);
      Alert.alert('Sucesso', 'Email atualizado com sucesso');
      setStep(1);
      setNewEmail('');
      setCode(['', '', '', '', '', '']);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  if (step === 1) {
    return (
      <View>
        <Text>Email atual: {user.email}</Text>
        <TextInput
          placeholder="Novo email"
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
        />
        <TouchableOpacity onPress={handleRequestChange}>
          <Text>Enviar Código</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text>Digite o código enviado para {newEmail}</Text>
      {/* Implementar inputs de código como no ResetPasswordScreen */}
      <TouchableOpacity onPress={handleConfirmChange}>
        <Text>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## 📊 Status de Implementação

| Endpoint | Serviço | Context | Tela | Status |
|----------|---------|---------|------|--------|
| POST /register | ✅ | ✅ | ✅ | ✅ Completo |
| POST /login | ✅ | ✅ | ✅ | ✅ Completo |
| GET /me | ✅ | ✅ | - | ✅ Completo |
| POST /forgot-password | ✅ | ✅ | ✅ | ✅ Completo |
| POST /reset-password | ✅ | ✅ | ✅ | ✅ Completo |
| PATCH /user/profile | ✅ | ✅ | ⏳ | ⏳ Pendente UI |
| POST /user/request-email-change | ✅ | ✅ | ⏳ | ⏳ Pendente UI |
| POST /user/confirm-email-change | ✅ | ✅ | ⏳ | ⏳ Pendente UI |

**Legenda:**
- ✅ Implementado
- ⏳ Implementado mas sem UI
- ❌ Não implementado

---

## 🚀 Próximos Passos

1. **Implementar UI de edição de nome no ProfileScreen**
   - Adicionar modal ou prompt para editar nome
   - Validar nome (não vazio, tamanho máximo)

2. **Implementar tela de troca de email**
   - Criar `ChangeEmailScreen.js`
   - Seguir padrão do `ResetPasswordScreen`
   - Input de novo email + inputs de código

3. **Melhorias de segurança**
   - Adicionar timeout para códigos de verificação
   - Limitar tentativas de códigos inválidos
   - Adicionar verificação de email antes de trocar

4. **Feedback visual**
   - Loading states
   - Mensagens de sucesso/erro mais descritivas
   - Animações de transição

---

## 📝 Notas Técnicas

### Tratamento de Erros
Todos os endpoints implementados utilizam try-catch e exibem alertas apropriados para o usuário.

### Persistência de Dados
- Token JWT é salvo no AsyncStorage
- Dados do usuário são salvos no AsyncStorage
- Context é sincronizado com AsyncStorage

### Segurança
- Token JWT é enviado no header `Authorization: Bearer {token}`
- Códigos de verificação têm validade limitada (definida no backend)
- Senhas nunca são armazenadas no frontend

### Performance
- Requisições são feitas via httpClient com retry automático
- Loading states previnem múltiplas requisições simultâneas
- Context evita prop drilling

---

## 🐛 Debugging

Para ver logs detalhados:
```javascript
// No AuthContext.js, todos os métodos têm console.log
console.log('[Auth] Token encontrado, validando...');
console.log('[Auth] Login bem-sucedido:', response.user.name);
console.log('[Auth] Código de recuperação enviado para:', email);
```

Para testar endpoints manualmente:
```bash
# Usar os comandos curl fornecidos no início deste documento
# Ou usar Postman/Insomnia
```

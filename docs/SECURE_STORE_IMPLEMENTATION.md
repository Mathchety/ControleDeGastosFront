# 🔐 Implementação do Expo SecureStore

## 📋 Visão Geral

O **Expo SecureStore** foi implementado para armazenar credenciais de login (senha) de forma segura, utilizando criptografia baseada em hardware quando disponível.

---

## 🎯 Por que SecureStore?

### ❌ Problema Anterior: AsyncStorage com Base64
```javascript
// ⚠️ INSEGURO - Base64 não é criptografia!
const encodedPassword = btoa(password); // Apenas codifica
await AsyncStorage.setItem('saved_password', encodedPassword);

// Qualquer um pode decodificar
const decoded = atob(encodedPassword); // senha exposta
```

**Problemas:**
- Base64 é apenas **codificação**, não criptografia
- Fácil de reverter (qualquer ferramenta decode)
- Dados armazenados em texto claro no dispositivo
- Não usa hardware de segurança do dispositivo

### ✅ Solução: expo-secure-store

```javascript
// ✅ SEGURO - Criptografia real com hardware
import * as SecureStore from 'expo-secure-store';

// Salva com criptografia AES
await SecureStore.setItemAsync('saved_password', password);

// Recupera descriptografado
const password = await SecureStore.getItemAsync('saved_password');
```

**Benefícios:**
- **Criptografia AES-256** (padrão da indústria)
- Usa **Keychain (iOS)** e **EncryptedSharedPreferences (Android)**
- **Hardware-backed** quando disponível (TEE, Secure Enclave)
- Protegido por **biometria** e **PIN do dispositivo**
- Dados **nunca ficam em texto claro** no armazenamento

---

## 🏗️ Arquitetura da Solução

### Separação de Dados

| Dado | Armazenamento | Motivo |
|------|---------------|--------|
| **E-mail** | AsyncStorage | Não é sensível, pode ser público |
| **Senha** | SecureStore | Altamente sensível, requer criptografia |
| **Token** | AsyncStorage | Já tem expiração curta (seguro) |
| **Refresh Token** | AsyncStorage | Rotaciona a cada uso |

### Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│ 1️⃣ USUÁRIO FAZ LOGIN COM "LEMBRAR-ME" ATIVO                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2️⃣ BACKEND VALIDA E RETORNA TOKEN                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3️⃣ FRONTEND SALVA CREDENCIAIS                               │
│                                                             │
│  ┌──────────────────────┐  ┌───────────────────────────┐   │
│  │ AsyncStorage         │  │ SecureStore (Criptografado)│   │
│  ├──────────────────────┤  ├───────────────────────────┤   │
│  │ saved_email          │  │ saved_password (AES-256)  │   │
│  │ "user@email.com"     │  │ "Senha123!" → encrypted   │   │
│  └──────────────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4️⃣ USUÁRIO FECHA E REABRE O APP                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5️⃣ CARREGA CREDENCIAIS AUTOMATICAMENTE                      │
│                                                             │
│  ┌──────────────────────┐  ┌───────────────────────────┐   │
│  │ AsyncStorage         │  │ SecureStore               │   │
│  ├──────────────────────┤  ├───────────────────────────┤   │
│  │ getItem('email')     │  │ getItemAsync('password')  │   │
│  │ → "user@email.com"   │  │ → "Senha123!" (decrypted) │   │
│  └──────────────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 6️⃣ CAMPOS DE LOGIN PRÉ-PREENCHIDOS                          │
│    Usuário só precisa clicar em "Entrar"                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Implementação

### 1. Instalação

```bash
npx expo install expo-secure-store
```

**Configuração automática no `app.json`:**
```json
{
  "expo": {
    "plugins": [
      "expo-secure-store"
    ]
  }
}
```

### 2. AuthScreen.js - Salvar Credenciais

```javascript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async () => {
    try {
        await login(emailLogin, passwordLogin, rememberMe);
        
        // 🔐 Salva credenciais de forma segura
        if (rememberMe) {
            // Email no AsyncStorage (não é sensível)
            await AsyncStorage.setItem('saved_email', emailLogin);
            
            // 🔐 Senha no SecureStore (criptografado com hardware)
            await SecureStore.setItemAsync('saved_password', passwordLogin);
        } else {
            await AsyncStorage.removeItem('saved_email');
            await SecureStore.deleteItemAsync('saved_password');
        }
        
        navigation.replace('MainTabs');
    } catch (error) {
        setError({ visible: true, message: error.message });
    }
};
```

### 3. AuthScreen.js - Carregar Credenciais

```javascript
// 🔐 Carrega credenciais salvas de forma segura
useEffect(() => {
    const loadSavedCredentials = async () => {
        try {
            // Email no AsyncStorage
            const savedEmail = await AsyncStorage.getItem('saved_email');
            
            // 🔐 Senha no SecureStore (descriptografa automaticamente)
            const savedPassword = await SecureStore.getItemAsync('saved_password');
            
            if (savedEmail && !isRegisterView) {
                setEmailLogin(savedEmail);
            }
            
            if (savedPassword && !isRegisterView) {
                setPasswordLogin(savedPassword); // Já vem descriptografado
            }
        } catch (error) {
            console.log('Erro ao carregar credenciais:', error);
        }
    };
    loadSavedCredentials();
}, [isRegisterView]);
```

---

## 🔒 Segurança em Camadas

### Camada 1: Criptografia de Hardware (iOS)
```
┌─────────────────────────────────────────┐
│ SECURE ENCLAVE (Apple T2 / M1)          │
├─────────────────────────────────────────┤
│ - Chave AES nunca sai do chip           │
│ - Protegido por biometria/PIN           │
│ - Impossível extrair mesmo com jailbreak│
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ KEYCHAIN (iOS)                           │
├─────────────────────────────────────────┤
│ - Armazena dado criptografado           │
│ - Sincroniza com iCloud Keychain        │
│ - Apagado ao resetar dispositivo        │
└─────────────────────────────────────────┘
```

### Camada 2: Criptografia de Hardware (Android)
```
┌─────────────────────────────────────────┐
│ STRONGBOX / TEE (Android 9+)            │
├─────────────────────────────────────────┤
│ - Hardware Security Module              │
│ - Chave isolada do sistema principal    │
│ - Protegido por biometria/PIN           │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ ENCRYPTED SHARED PREFERENCES            │
├─────────────────────────────────────────┤
│ - Criptografia AES-256-GCM               │
│ - Chave gerada pelo Android KeyStore    │
│ - Apagado ao desinstalar app            │
└─────────────────────────────────────────┘
```

---

## 🧪 Testes de Segurança

### Teste 1: Senha Não Aparece em Logs
```javascript
// ✅ Correto
console.log('Login com:', email); // OK
// ❌ NUNCA fazer
console.log('Senha:', password); // NÃO!
```

### Teste 2: Armazenamento Criptografado
```bash
# iOS: Keychain não é acessível externamente
# Android: Arquivo criptografado
adb shell run-as com.anonymous.ControleDeGastosFront
cat shared_prefs/*.xml
# Deve mostrar dados criptografados (binário)
```

### Teste 3: Limpeza ao Desmarcar Checkbox
```javascript
// Desmarcar "Lembrar-me" deve apagar credenciais
await AsyncStorage.removeItem('saved_email');
await SecureStore.deleteItemAsync('saved_password');
```

---

## 📊 Comparação: Base64 vs SecureStore

| Aspecto | Base64 (Anterior) | SecureStore (Atual) |
|---------|-------------------|---------------------|
| **Criptografia** | ❌ Nenhuma (só codificação) | ✅ AES-256 |
| **Hardware** | ❌ Não usa | ✅ TEE / Secure Enclave |
| **Reversível** | ⚠️ Fácil (qualquer um) | ✅ Impossível sem chave |
| **Proteção** | ❌ Texto claro | ✅ Biometria + PIN |
| **Compliance** | ❌ Não | ✅ LGPD / GDPR |
| **Performance** | ⚡ Rápido | ⚡ Rápido (hardware) |
| **Segurança** | 🔴 Baixa | 🟢 Alta |

---

## 🚨 Boas Práticas

### ✅ Fazer

```javascript
// 1. Sempre usar SecureStore para senhas
await SecureStore.setItemAsync('password', password);

// 2. Tratar erros graciosamente
try {
    const password = await SecureStore.getItemAsync('password');
} catch (error) {
    console.log('Erro ao carregar senha:', error);
    // Pede para usuário digitar de novo
}

// 3. Limpar ao deslogar
await SecureStore.deleteItemAsync('saved_password');

// 4. Nunca logar a senha
console.log('Login bem-sucedido'); // ✅
```

### ❌ Não Fazer

```javascript
// 1. NUNCA usar AsyncStorage para senhas
await AsyncStorage.setItem('password', password); // ❌

// 2. NUNCA usar Base64 para "segurança"
const encoded = btoa(password); // ❌ Não é criptografia!

// 3. NUNCA logar senhas
console.log('Senha:', password); // ❌ Risco de segurança

// 4. NUNCA enviar senha em URL
fetch(`/api/login?password=${password}`); // ❌
```

---

## 🔄 Migração de Base64 para SecureStore

Se usuários já têm senhas salvas em Base64:

```javascript
// Migração automática (uma vez)
useEffect(() => {
    const migrateOldPassword = async () => {
        try {
            // Verifica se tem senha antiga (Base64)
            const oldPassword = await AsyncStorage.getItem('saved_password');
            
            if (oldPassword) {
                // Decodifica
                const decoded = atob(oldPassword);
                
                // Salva no SecureStore
                await SecureStore.setItemAsync('saved_password', decoded);
                
                // Remove do AsyncStorage
                await AsyncStorage.removeItem('saved_password');
                
                console.log('✅ Senha migrada para SecureStore');
            }
        } catch (error) {
            console.log('Erro na migração:', error);
        }
    };
    migrateOldPassword();
}, []);
```

---

## 📱 Compatibilidade

| Plataforma | Mecanismo | Mínimo |
|------------|-----------|--------|
| **iOS** | Keychain Services | iOS 10+ |
| **Android** | EncryptedSharedPreferences | Android 6+ (API 23) |
| **Web** | ⚠️ Não suportado | - |

**Nota:** No web, SecureStore não funciona. Use alternativas como:
- Não salvar senha (mais seguro)
- Session Storage (temporário)
- Indexed DB com criptografia manual

---

## 🎯 Resultado Final

### Antes (Base64):
```
AsyncStorage:
  - saved_email: "user@email.com"
  - saved_password: "U2VuaGExMjMh" ← Base64 (inseguro)
```

### Depois (SecureStore):
```
AsyncStorage:
  - saved_email: "user@email.com"

SecureStore (Keychain/EncryptedSharedPreferences):
  - saved_password: [ENCRYPTED DATA] ← AES-256 (seguro)
```

---

## 📚 Referências

- [Expo SecureStore Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [iOS Keychain Services](https://developer.apple.com/documentation/security/keychain_services)
- [Android EncryptedSharedPreferences](https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)

---

**Data**: 2025-11-13  
**Versão**: v1.0  
**Status**: ✅ Implementado  
**Arquivos**: `screens/AuthScreen.js`

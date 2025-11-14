# 📋 Fluxos do Sistema - FinanSync

## 🔄 1. FLUXO: Editar Item de Nota Fiscal do Histórico

### 📱 Fluxo Completo (Usuário → Backend)

```
┌────────────────────────────────────────────────────────────────┐
│ 1️⃣ USUÁRIO: Abre nota do histórico                            │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 2️⃣ HistoryScreen.js                                           │
│    • Usuário clica no card da nota                            │
│    • Chama: navigation.navigate('Preview', { receiptId })     │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 3️⃣ PreViewScreen.js - Carrega dados                           │
│    • Detecta que recebeu receiptId                            │
│    • Chama: loadReceiptById()                                 │
│       └─> fetchReceiptById(receiptId)                         │
│    • Backend: GET /receipt/{id}                               │
│    • Retorna: { storeName, date, items: [...], total, etc }  │
│                                                                │
│ 🆕 NOVO: Carrega categorias (se não tiver)                    │
│    • useEffect(() => fetchCategoriesComplete())               │
│    • Backend: GET /categories/summary                         │
│    • Retorna: [{ id, name, icon, color, ... }]               │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 4️⃣ EditableReceiptItemCard.js - Usuário edita                │
│    • Usuário muda categoria no Picker                         │
│      └─> setFormCategoryId(newCategoryId)                     │
│    • Usuário edita total/quantidade                           │
│      └─> setFormTotal(newTotal)                               │
│    • Usuário clica "💾 Salvar"                                │
│      └─> handleSave() é chamado                               │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 5️⃣ EditableReceiptItemCard - handleSave()                     │
│    • Calcula unitPrice = total / quantity                     │
│    • Monta objeto updatedItem:                                │
│      {                                                         │
│        ...item,                                               │
│        categoryId: formCategoryId,                            │
│        quantity: parseFloat(formQuantity),                    │
│        total: parseFloat(formTotal),                          │
│        unitPrice: calculatedUnitPrice                         │
│      }                                                         │
│    • Chama: onUpdate(updatedItem, itemIndex)                  │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 6️⃣ PreViewScreen - handleUpdateItem()                         │
│    • Verifica se item tem ID (item já salvo no backend)       │
│    • Se TEM ID:                                               │
│      ├─> Prepara dados: { categoryId, quantity, unitPrice }  │
│      ├─> Chama: updateItem(itemId, itemData)                 │
│      └─> ⚡ Atualização via API                               │
│                                                                │
│    • Se NÃO TEM ID:                                           │
│      └─> Pula API (item novo, será salvo ao confirmar nota)  │
│                                                                │
│    • Atualiza estado local (sempre):                          │
│      └─> setPreviewData({ ...prev, items: updatedItems })    │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 7️⃣ DataContext - updateItem()                                 │
│    • Chama: httpClient.patch(`/item/${itemId}`, itemData)     │
│    • Backend: PATCH /api/v1/item/:id                          │
│    • Body: { "categoryId": 5, "quantity": 3, "unitPrice": 2 }│
│    • Header: Authorization: Bearer {accessToken}              │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 8️⃣ BACKEND - Processa atualização                             │
│    • Valida token JWT (renova automaticamente se expirado)    │
│    • Busca item no banco: SELECT * FROM items WHERE id = :id  │
│    • Atualiza campos:                                         │
│      UPDATE items SET                                         │
│        category_id = :categoryId,                             │
│        quantity = :quantity,                                  │
│        unit_price = :unitPrice,                               │
│        updated_at = NOW()                                     │
│      WHERE id = :id                                           │
│    • Retorna item atualizado                                  │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 9️⃣ SUCESSO - UI Atualizada                                    │
│    • Estado local já foi atualizado (passo 6)                 │
│    • Usuário vê mudança instantaneamente                      │
│    • Marca hasModifications = true                            │
│    • Botão "Salvar Alterações" fica visível                   │
└────────────────────────────────────────────────────────────────┘
```

### 🔌 API Endpoint

```bash
PATCH /api/v1/item/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "categoryId": 5,          # Opcional: Nova categoria
  "quantity": 3.0,          # Opcional: Nova quantidade
  "unitPrice": 2.50         # Opcional: Novo preço unitário
}
```

**Resposta 200 OK:**
```json
{
  "id": 123,
  "name": "Arroz Integral",
  "categoryId": 5,
  "category": {
    "id": 5,
    "name": "Alimentos",
    "icon": "fast-food"
  },
  "quantity": 3.0,
  "unitPrice": 2.50,
  "total": 7.50,
  "updatedAt": "2025-11-13T10:30:00Z"
}
```

---

## 🔐 2. FLUXO: Sistema "Lembrar-me" (Auto-Login)

### 🎯 O QUE VOCÊ QUER:
> "Quero poder selecionar se quero lembrar da minha senha (login fica salvo automaticamente, assim após 8 dias refaz o login sozinho, ou caso caia e volte para a tela de login os dados ainda estejam lá e só apertar o entrar)"

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO:

```
┌────────────────────────────────────────────────────────────────┐
│ 1️⃣ TELA DE LOGIN - LoginForm.js                               │
│                                                                │
│    ┌──────────────────────────────────────┐                   │
│    │  Email: usuario@email.com            │                   │
│    │  Senha: ••••••••                     │                   │
│    │                                      │                   │
│    │  ☑️ Lembrar-me por 7 dias            │ ← CHECKBOX       │
│    │                                      │                   │
│    │  [        ENTRAR        ]            │                   │
│    │                                      │                   │
│    │      Esqueceu a senha?               │                   │
│    └──────────────────────────────────────┘                   │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 2️⃣ USUÁRIO FAZ LOGIN                                          │
│    • Marca checkbox "Lembrar-me por 7 dias"                   │
│    • Aperta "ENTRAR"                                          │
│    • Chama: login(email, password, rememberMe = true)         │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 3️⃣ AuthContext - login()                                      │
│    • Backend: POST /login { email, password }                 │
│    • Resposta: { accessToken, refreshToken, user }            │
│    • Salva tokens no AsyncStorage:                            │
│      └─> @access_token (expira em 15 min)                     │
│      └─> @refresh_token (expira em 7 dias)                    │
│    • Salva preferência:                                       │
│      └─> @rememberMe = "true"                                 │
│      └─> @loginTime = "1731502800000" (timestamp)            │
│    • Chama: setupAutoRefresh(true)                            │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 4️⃣ SISTEMA DE AUTO-REFRESH ATIVO                              │
│    • Timer verifica a cada 12 horas                           │
│    • Verifica tempo desde último login                        │
│    • Se passou mais de 6.5 dias (< 7 dias):                   │
│      └─> Chama httpClient.refreshAccessToken()               │
│         • Backend: POST /refresh-token                        │
│         • Renova accessToken automaticamente                  │
│         • 🔇 SILENCIOSO - Sem alertas ou notificações         │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 5️⃣ APP FECHA OU TRAVA                                         │
│    • Usuário fecha o app                                      │
│    • App trava e fecha                                        │
│    • Sistema reinicia                                         │
└────────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────┐
│ 6️⃣ APP REABRE - AuthContext.initializeAuth()                  │
│    • Busca tokens do AsyncStorage:                            │
│      ├─> @access_token                                        │
│      ├─> @refresh_token                                       │
│      ├─> @rememberMe = "true"                                 │
│      └─> @user = { id, name, email, ... }                     │
│                                                                │
│    • Se tokens existem:                                       │
│      ├─> Valida token: GET /me                                │
│      ├─> Se válido: setIsAuthenticated(true)                 │
│      └─> 🎉 USUÁRIO JÁ ESTÁ LOGADO - Vai direto pro app      │
│                                                                │
│    • Se token expirou (após 7 dias):                          │
│      └─> Mostra tela de login novamente                       │
└────────────────────────────────────────────────────────────────┘
```

### ⚠️ DIFERENÇA DO QUE VOCÊ PEDIU:

#### ❌ O que VOCÊ quer (NÃO IMPLEMENTADO):
- **Salvar email + senha em texto no AsyncStorage**
- **Preencher automaticamente os campos de login**
- **Botão "Entrar" já preenchido**

#### ✅ O que ESTÁ implementado (MAIS SEGURO):
- **Salva apenas os TOKENS (criptografados)**
- **Não salva senha (por segurança)**
- **Login automático sem preencher campos**
- **Duração: 7 dias (não 8)**

---

## 🆕 3. IMPLEMENTAR: Preenchimento Automático de Credenciais

### 💡 Solução Proposta:

```javascript
// 📝 components/auth/LoginForm.js

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [rememberMe, setRememberMe] = useState(false);

// 🆕 Carrega credenciais salvas ao abrir a tela
useEffect(() => {
    const loadSavedCredentials = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('@saved_email');
            const savedRememberMe = await AsyncStorage.getItem('@remember_credentials');
            
            if (savedRememberMe === 'true' && savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
                // 🔒 NÃO carrega senha por segurança
            }
        } catch (error) {
            console.error('Erro ao carregar credenciais:', error);
        }
    };
    
    loadSavedCredentials();
}, []);

// 🆕 Salva email ao fazer login com sucesso
const handleLogin = async () => {
    try {
        await login(email, password, rememberMe);
        
        // 💾 Salva email se usuário marcou "Lembrar-me"
        if (rememberMe) {
            await AsyncStorage.setItem('@saved_email', email);
            await AsyncStorage.setItem('@remember_credentials', 'true');
        } else {
            // 🗑️ Remove email salvo se desmarcou
            await AsyncStorage.removeItem('@saved_email');
            await AsyncStorage.removeItem('@remember_credentials');
        }
    } catch (error) {
        // Erro já tratado pelo AuthContext
    }
};
```

### 🔒 OPÇÃO MAIS SEGURA: Autenticação Biométrica

```javascript
import * as LocalAuthentication from 'expo-local-authentication';

// 🔐 Salva credenciais com criptografia nativa
import * as SecureStore from 'expo-secure-store';

const saveCredentialsSecurely = async (email, password) => {
    // Criptografa e salva em hardware seguro (Keychain/Keystore)
    await SecureStore.setItemAsync('user_email', email);
    await SecureStore.setItemAsync('user_password', password); // Criptografado!
};

const loginWithBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Faça login com sua biometria',
        });
        
        if (result.success) {
            const email = await SecureStore.getItemAsync('user_email');
            const password = await SecureStore.getItemAsync('user_password');
            await login(email, password, true);
        }
    }
};
```

---

## 📊 COMPARAÇÃO: Sistema Atual vs. Solicitado

| Recurso | Sistema Atual ✅ | Sistema Solicitado ❓ |
|---------|------------------|----------------------|
| **Login automático** | ✅ Por 7 dias (tokens) | ✅ Por 8 dias |
| **Sobrevive a crashes** | ✅ Sim | ✅ Sim |
| **Preenche email** | ❌ Não | ✅ Sim |
| **Preenche senha** | ❌ Não | ⚠️ Não recomendado |
| **Segurança** | 🔒 Alta (tokens) | ⚠️ Média (senha salva) |
| **Renovação automática** | ✅ A cada 12h | ✅ Sim |
| **Sem alertas** | ✅ Silencioso | ✅ Silencioso |

---

## 🎯 RECOMENDAÇÃO:

### ✅ Implementar:
1. **Salvar EMAIL no AsyncStorage** (quando "Lembrar-me" ativo)
2. **Preencher campo de email automaticamente**
3. **Manter sistema de tokens** (mais seguro que senha)

### ❌ NÃO Implementar:
- **Salvar senha em texto plano** (risco de segurança)
- **Usar senha sem criptografia**

### 🔐 MELHOR OPÇÃO:
- **Autenticação biométrica** (Face ID / Touch ID)
- **expo-local-authentication + expo-secure-store**
- **Senha criptografada em hardware seguro**

---

## 🚀 Quer que eu implemente qual opção?

1. **Opção 1:** Salvar apenas EMAIL (sem senha) ← RÁPIDO
2. **Opção 2:** Autenticação biométrica completa ← SEGURO
3. **Opção 3:** Salvar email + senha com SecureStore ← INTERMEDIÁRIO

Escolha qual você prefere! 👇

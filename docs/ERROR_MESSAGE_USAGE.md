# 🎨 Componente ErrorMessage - Guia de Uso

## 📋 Visão Geral

O `ErrorMessage` é um componente reutilizável para exibir mensagens de erro amigáveis baseadas nos códigos HTTP da API.

## 🚀 Funcionalidades

- ✅ Mensagens automáticas baseadas em código HTTP
- ✅ 4 tipos visuais: error, warning, info, success
- ✅ Animação de entrada/saída suave
- ✅ Auto-dismiss configurável
- ✅ Ícones contextuais
- ✅ Fechar manual

## 📦 Importação

```javascript
import { ErrorMessage, useErrorMessage } from '../components/common';
```

## 🎯 Uso Básico

### 1. Com Hook (Recomendado)

```javascript
import { ErrorMessage, useErrorMessage } from '../components/common';

function MyScreen() {
    const { getErrorMessage } = useErrorMessage();
    const [error, setError] = useState({ visible: false, message: '', type: 'error' });

    const handleApiCall = async () => {
        try {
            await api.doSomething();
        } catch (err) {
            const errorInfo = getErrorMessage(err);
            setError({
                visible: true,
                message: errorInfo.message,
                type: errorInfo.type
            });
        }
    };

    return (
        <View>
            <ErrorMessage
                visible={error.visible}
                message={error.message}
                type={error.type}
                onDismiss={() => setError({ ...error, visible: false })}
                autoDismiss={5000}
            />
            {/* Resto do conteúdo */}
        </View>
    );
}
```

### 2. Mensagem Manual

```javascript
<ErrorMessage
    visible={true}
    message="Este é um erro customizado"
    type="warning"
    onDismiss={() => console.log('Fechou')}
    autoDismiss={3000}
/>
```

## 🎨 Tipos de Mensagem

### Error (Padrão)
- Fundo vermelho claro
- Ícone de alerta vermelho
- Para erros críticos (500, 503, etc.)

```javascript
<ErrorMessage
    visible={true}
    message="Erro no servidor"
    type="error"
/>
```

### Warning
- Fundo amarelo claro
- Ícone de aviso laranja
- Para validações e avisos (401, 422)

```javascript
<ErrorMessage
    visible={true}
    message="Sessão expirada"
    type="warning"
/>
```

### Info
- Fundo azul claro
- Ícone de informação azul
- Para informações neutras (404, 409)

```javascript
<ErrorMessage
    visible={true}
    message="Recurso não encontrado"
    type="info"
/>
```

### Success
- Fundo verde claro
- Ícone de check verde
- Para confirmações

```javascript
<ErrorMessage
    visible={true}
    message="Operação realizada com sucesso!"
    type="success"
/>
```

## ⚙️ Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `message` | string | - | Mensagem a ser exibida |
| `type` | 'error' \| 'warning' \| 'info' \| 'success' | 'error' | Tipo visual da mensagem |
| `visible` | boolean | false | Controla visibilidade |
| `onDismiss` | function | - | Callback ao fechar |
| `autoDismiss` | number | 0 | Tempo em ms para fechar automaticamente (0 = não fecha) |
| `showIcon` | boolean | true | Mostrar ícone |

## 🔄 Hook useErrorMessage

### Mapeamento Automático de Erros HTTP

O hook `useErrorMessage` converte códigos HTTP em mensagens amigáveis:

```javascript
const { getErrorMessage } = useErrorMessage();

// Retorna: { message: string, type: 'error' | 'warning' | 'info' }
const errorInfo = getErrorMessage(error);
```

### Mapeamento de Códigos

| Código HTTP | Tipo | Mensagem |
|-------------|------|----------|
| 400 | error | "Por favor, verifique os dados informados e tente novamente." |
| 401 | warning | "Sua sessão expirou. Faça login novamente." |
| 403 | error | "Você não tem permissão para realizar esta ação." |
| 404 | info | "Recurso não encontrado. Verifique se o item ainda existe." |
| 409 | info | "Este recurso já existe. Por favor, use outro." |
| 422 | error | "Dados inválidos. Verifique os campos e tente novamente." |
| 429 | warning | "Muitas tentativas. Aguarde alguns instantes e tente novamente." |
| 500 | error | "Erro temporário no servidor. Tente novamente em alguns instantes." |
| 503 | error | "Serviço temporariamente indisponível. Tente novamente em breve." |

## 💡 Exemplos Práticos

### Login com Tratamento de Erro

```javascript
const handleLogin = async () => {
    try {
        setLoading(true);
        setError({ visible: false, message: '', type: 'error' });
        await login(email, password);
    } catch (err) {
        const errorInfo = getErrorMessage(err);
        setError({
            visible: true,
            message: errorInfo.message,
            type: errorInfo.type
        });
    } finally {
        setLoading(false);
    }
};
```

### Criar Recibo com Validação

```javascript
const handleSave = async () => {
    // Validação local
    if (!storeName) {
        setError({
            visible: true,
            message: "Por favor, informe o nome da loja",
            type: 'warning'
        });
        return;
    }

    try {
        await createReceipt(data);
        setError({
            visible: true,
            message: "Recibo criado com sucesso!",
            type: 'success'
        });
    } catch (err) {
        const errorInfo = getErrorMessage(err);
        setError({
            visible: true,
            message: errorInfo.message,
            type: errorInfo.type
        });
    }
};
```

### Deletar Item com Confirmação

```javascript
const handleDelete = async () => {
    try {
        await deleteItem(id);
        setError({
            visible: true,
            message: "Item excluído com sucesso",
            type: 'success'
        });
        setTimeout(() => navigation.goBack(), 2000);
    } catch (err) {
        const errorInfo = getErrorMessage(err);
        setError({
            visible: true,
            message: errorInfo.message,
            type: errorInfo.type
        });
    }
};
```

## 🎯 Boas Práticas

### ✅ Fazer

- Use `autoDismiss` para mensagens informativas
- Sempre limpe o erro antes de nova tentativa
- Use tipos apropriados (error, warning, info, success)
- Forneça `onDismiss` para erros críticos que bloqueiam a UI

```javascript
// Limpar erro antes de nova tentativa
setError({ visible: false, message: '', type: 'error' });
await tryAgain();
```

### ❌ Evitar

- Não use Alert.alert() para erros de API (use ErrorMessage)
- Não deixe mensagens de sucesso sem autoDismiss
- Não mostre erros técnicos ao usuário (use mensagens amigáveis)

## 🔧 Integração com httpClient

O httpClient já adiciona `statusCode` aos erros:

```javascript
// Em httpClient.js
const error = new Error(message);
error.statusCode = response.status; // 400, 401, 404, etc.
error.response = { status, data };
throw error;
```

O hook `useErrorMessage` lê esse statusCode automaticamente:

```javascript
const getErrorMessage = (error) => {
    const statusCode = error?.statusCode || error?.status || 500;
    // Retorna mensagem apropriada
};
```

## 🎨 Customização Visual

As cores e estilos são definidos em `getTypeConfig()`:

```javascript
const configs = {
    error: {
        backgroundColor: '#FEE2E2',    // Vermelho claro
        iconBackground: '#DC2626',     // Vermelho escuro
        iconColor: '#FFFFFF',
        textColor: '#991B1B',
        icon: 'alert-circle',
    },
    // ... outros tipos
};
```

## 📱 Responsividade

O componente usa `moderateScale()` para adaptar a diferentes tamanhos de tela:

```javascript
iconContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    // ...
}
```

## 🧪 Testing

```javascript
// Testar diferentes códigos HTTP
const testErrors = [400, 401, 404, 409, 500, 503];

testErrors.forEach(code => {
    const mockError = { statusCode: code };
    const result = getErrorMessage(mockError);
    console.log(`${code}: ${result.message} (${result.type})`);
});
```

## 🔗 Telas Implementadas

- ✅ AuthScreen (login/registro)
- ⏳ ForgotPasswordScreen
- ⏳ ResetPasswordScreen
- ⏳ ChangePasswordScreen
- ⏳ ManualReceiptScreen
- ⏳ PreViewScreen
- ⏳ CategoryDetailsScreen

## 📚 Referências

- [Material Design - Snackbars](https://material.io/components/snackbars)
- [iOS Human Interface Guidelines - Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

**Criado por:** Equipe de Desenvolvimento  
**Última atualização:** 12/11/2025

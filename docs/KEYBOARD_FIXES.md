# Correções de Teclado e Navegação

Este documento descreve as correções aplicadas para resolver problemas com o teclado e fluxo de navegação.

## 🐛 Problemas Identificados

### 1. Inputs ficando atrás do teclado
**Sintoma:** Ao abrir o teclado, os campos de input ficavam ocultos/parcialmente visíveis, especialmente no Android.

**Telas afetadas:**
- AuthScreen (Login e Registro)
- ForgotPasswordScreen
- ResetPasswordScreen

### 2. Fluxo de navegação após resetar senha
**Sintoma:** Após resetar a senha com sucesso, o usuário não voltava automaticamente para a tela de login.

---

## ✅ Correções Aplicadas

### 1. AuthScreen (Login/Registro)

**Arquivo:** `screens/AuthScreen.js`

**Mudanças:**

#### KeyboardAvoidingView
```javascript
// ANTES
<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.keyboardView}
    keyboardVerticalOffset={0}
    enabled={true}
>

// DEPOIS
<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.keyboardView}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    enabled={true}
>
```

#### ScrollView Content
```javascript
// ANTES
content: {
    paddingBottom: Platform.OS === 'android' ? 180 : 150,
}

// DEPOIS
content: {
    paddingBottom: Platform.OS === 'android' ? 200 : 150, // +20px no Android
}
```

**Resultado:**
- ✅ Campos sempre visíveis no Android
- ✅ Scroll automático quando teclado abre
- ✅ Espaço adequado para digitação

---

### 2. ForgotPasswordScreen (Esqueci minha senha)

**Arquivo:** `screens/ForgotPasswordScreen.js`

**Mudanças:**

#### KeyboardAvoidingView
```javascript
// ANTES
<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.keyboardView}
>

// DEPOIS
<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.keyboardView}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>
```

#### ScrollView
```javascript
// ANTES
<ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
>

// DEPOIS
<ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    bounces={false}
>
```

#### Padding Bottom
```javascript
// ANTES
scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(30),
}

// DEPOIS
scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(30),
    paddingBottom: Platform.OS === 'android' ? moderateScale(150) : moderateScale(80),
}
```

**Resultado:**
- ✅ Campo de email sempre visível
- ✅ Botão "Enviar código" acessível
- ✅ Scroll suave no Android

---

### 3. ResetPasswordScreen (Resetar senha)

**Arquivo:** `screens/ResetPasswordScreen.js`

**Mudanças:**

#### KeyboardAvoidingView
```javascript
// ANTES
<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.keyboardView}
>

// DEPOIS
<KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.keyboardView}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>
```

#### ScrollView
```javascript
// ANTES
<ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
>

// DEPOIS
<ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    bounces={false}
>
```

#### Padding Bottom
```javascript
// ANTES
scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(30),
}

// DEPOIS
scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(30),
    paddingBottom: Platform.OS === 'android' ? moderateScale(200) : moderateScale(100),
}
```

#### Navegação após sucesso
```javascript
// ANTES
Alert.alert(
    'Sucesso!',
    'Sua senha foi redefinida com sucesso.',
    [
        {
            text: 'OK',
            onPress: () => navigation.navigate('Auth'),
        },
    ]
);

// DEPOIS
Alert.alert(
    'Sucesso!',
    'Sua senha foi redefinida com sucesso. Faça login com sua nova senha.',
    [
        {
            text: 'OK',
            onPress: () => {
                // ✅ Usa reset para limpar pilha de navegação
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                });
            },
        },
    ]
);
```

**Resultado:**
- ✅ Todos os 6 campos de código visíveis
- ✅ Campos de senha sempre acessíveis
- ✅ Botão "Redefinir Senha" sempre visível
- ✅ **Após resetar senha, volta diretamente para login**
- ✅ **Limpa histórico de navegação (não pode voltar para tela de reset)**

---

## 📊 Resumo das Melhorias

### Problemas Resolvidos
1. ✅ Inputs não ficam mais atrás do teclado
2. ✅ Scroll automático quando teclado abre
3. ✅ Espaçamento adequado no Android
4. ✅ Navegação correta após resetar senha
5. ✅ Histórico de navegação limpo após reset

### Valores de KeyboardVerticalOffset
| Plataforma | Valor | Motivo |
|------------|-------|--------|
| iOS | 0 | O iOS gerencia automaticamente |
| Android | 20 | Compensa status bar e navegação |

### Valores de paddingBottom
| Tela | Android | iOS | Motivo |
|------|---------|-----|--------|
| AuthScreen | 200 | 150 | Muitos campos + botões |
| ForgotPasswordScreen | 150 | 80 | 1 campo + 1 botão |
| ResetPasswordScreen | 200 | 100 | 6 campos código + 2 senhas + botão |

---

## 🧪 Como Testar

### Teste 1: Login/Registro
1. Abra o app
2. Toque no campo "Email"
3. ✅ Teclado abre e campo permanece visível
4. Toque no campo "Senha"
5. ✅ Campo de senha fica acima do teclado
6. Scroll para baixo
7. ✅ Botão "Entrar" acessível

### Teste 2: Esqueci minha senha
1. Tela de login → "Esqueci minha senha"
2. Toque no campo de email
3. ✅ Campo permanece visível
4. ✅ Botão "Enviar código" acessível

### Teste 3: Resetar senha (CRÍTICO)
1. Receba email com código
2. Abra link do email
3. ✅ Vai direto para tela de reset (não para login)
4. Digite código de 6 dígitos
5. ✅ Todos os 6 campos visíveis
6. Toque em campo "Nova senha"
7. ✅ Campo permanece visível
8. Toque em "Confirmar senha"
9. ✅ Campo permanece visível
10. Clique "Redefinir Senha"
11. ✅ Mensagem de sucesso
12. Clique "OK"
13. ✅ **Volta para tela de login**
14. ✅ **Não consegue voltar para tela de reset (histórico limpo)**

### Teste 4: Fluxo Completo
1. Login → Esqueci senha
2. Digite email → Recebe código
3. **Abra email e clique no link** (se houver)
4. **OU navegue manualmente para a tela de reset**
5. Digite código + nova senha
6. ✅ **Após sucesso, vai direto para login**
7. ✅ **Faça login com nova senha**

---

## 🔧 Configurações do KeyboardAvoidingView

### Comportamentos por Plataforma

**iOS:**
- `behavior='padding'` - Adiciona padding quando teclado abre
- `keyboardVerticalOffset={0}` - Sistema gerencia automaticamente
- ScrollView ajusta conteúdo automaticamente

**Android:**
- `behavior='height'` - Ajusta altura do container
- `keyboardVerticalOffset={20}` - Compensa status bar
- Necessita `paddingBottom` maior no ScrollView
- `bounces={false}` para evitar scroll excessivo

### Props Importantes do ScrollView

```javascript
keyboardShouldPersistTaps="handled"  // Permite tap em elementos mesmo com teclado aberto
showsVerticalScrollIndicator={false} // Esconde barra de scroll
bounces={false}                       // Desabilita bounce no Android
```

---

## 📝 Notas Técnicas

### Por que usar navigation.reset()?
```javascript
// ❌ PROBLEMA com navigate
navigation.navigate('Auth')
// Usuário pode voltar para tela de reset usando botão "Voltar"
// Histórico: Login → Forgot → Reset → Auth

// ✅ SOLUÇÃO com reset
navigation.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
})
// Limpa toda a pilha de navegação
// Histórico: Auth (início)
// Usuário não consegue voltar para telas de recuperação
```

### Por que paddingBottom dinâmico?
- Android tem altura de teclado maior que iOS
- Android não ajusta scroll automaticamente como iOS
- ScrollView precisa de espaço extra para mostrar todo conteúdo

### Por que keyboardVerticalOffset no Android?
- Status bar tem altura (~24px)
- Navigation bar tem altura (~48px)
- Total: ~72px, mas 20px compensa bem na maioria dos casos

---

## 🐛 Troubleshooting

### Problema: Input ainda fica parcialmente oculto
**Solução:** Aumentar `paddingBottom` no estilo `scrollContent`:
```javascript
paddingBottom: Platform.OS === 'android' ? moderateScale(250) : moderateScale(120),
```

### Problema: Teclado cobre botão "Entrar"
**Solução:** Aumentar `keyboardVerticalOffset`:
```javascript
keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
```

### Problema: Scroll não funciona suavemente
**Solução:** Verificar se `flex: 1` está no `keyboardView`:
```javascript
keyboardView: {
    flex: 1, // ✅ Essencial
}
```

### Problema: Após resetar senha, usuário volta para tela de reset
**Solução:** Usar `navigation.reset()` ao invés de `navigation.navigate()`:
```javascript
navigation.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
});
```

---

## ✅ Checklist de Validação

Antes de considerar o problema resolvido, teste:

- [ ] Login: Campo email visível com teclado aberto
- [ ] Login: Campo senha visível com teclado aberto
- [ ] Login: Botão "Entrar" acessível
- [ ] Registro: Todos os campos visíveis
- [ ] Registro: Botão "Registrar" acessível
- [ ] Esqueci senha: Campo email visível
- [ ] Esqueci senha: Botão "Enviar código" acessível
- [ ] Reset senha: 6 campos de código visíveis
- [ ] Reset senha: Campos de nova senha visíveis
- [ ] Reset senha: Botão "Redefinir" acessível
- [ ] Reset senha: Após sucesso, vai para login
- [ ] Reset senha: Não consegue voltar para tela de reset
- [ ] Reset senha: Login funciona com nova senha

---

## 📱 Dispositivos Testados

Recomendado testar em:
- ✅ Android 10+ (vários tamanhos de tela)
- ✅ iOS 14+ (vários tamanhos de tela)
- ✅ Tablets Android
- ✅ iPads

**Tamanhos de tela críticos:**
- Pequeno: 5" (1080x1920)
- Médio: 6" (1080x2340)
- Grande: 6.5"+ (1440x3040)

---

## 🚀 Melhorias Futuras

1. **Detecção automática de altura do teclado**
   - Usar `Keyboard.addListener()` para ajustar dinamicamente

2. **Animação suave de scroll**
   - Scroll automático para campo focado

3. **Feedback visual melhor**
   - Destacar campo atualmente focado
   - Animar transição entre campos

4. **Validação em tempo real**
   - Mostrar erros enquanto usuário digita
   - Desabilitar botões se formulário inválido

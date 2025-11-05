# Sistema de Design Responsivo - Guia de Implementação

## ✅ Componentes Atualizados

### Utilitários
- ✅ `utils/responsive.js` - Funções de escalonamento
- ✅ `utils/theme.js` - Tema com valores responsivos

### Componentes
- ✅ `components/buttons/PrimaryButton.js`
- ✅ `components/home/HomeHeader.js`

## 📋 Como Aplicar nos Componentes Restantes

### 1. Import necessários
```javascript
import { moderateScale, fontScale, verticalScale, scale } from '../../utils/responsive';
import { theme } from '../../utils/theme';
```

### 2. Substituições nos StyleSheet

#### Fontes (fontSize)
```javascript
// Antes
fontSize: 16

// Depois
fontSize: theme.fonts.body
// ou
fontSize: fontScale(16)
```

#### Espaçamentos (padding, margin)
```javascript
// Antes
padding: 20,
marginTop: 10

// Depois
padding: moderateScale(20),
marginTop: theme.spacing.md
// ou
paddingVertical: verticalScale(20),
paddingHorizontal: moderateScale(20)
```

#### Border Radius
```javascript
// Antes
borderRadius: 12

// Depois
borderRadius: theme.radius.md
// ou
borderRadius: moderateScale(12)
```

#### Tamanhos de Ícones
```javascript
// Antes
<Ionicons name="icon" size={24} />

// Depois
<Ionicons name="icon" size={theme.iconSizes.md} />
```

### 3. Tamanhos Padrão do Tema

#### Tipografia
- `theme.fonts.h1` - 28px (Títulos grandes)
- `theme.fonts.h2` - 24px (Títulos médios)
- `theme.fonts.h3` - 20px (Títulos pequenos)
- `theme.fonts.body` - 14px (Texto comum)
- `theme.fonts.bodyLarge` - 16px (Texto destacado)
- `theme.fonts.bodySmall` - 12px (Texto pequeno)
- `theme.fonts.caption` - 11px (Legendas)

#### Espaçamentos
- `theme.spacing.xs` - 4px
- `theme.spacing.sm` - 8px
- `theme.spacing.md` - 12px
- `theme.spacing.lg` - 16px
- `theme.spacing.xl` - 20px
- `theme.spacing.xxl` - 24px

#### Border Radius
- `theme.radius.sm` - 8px
- `theme.radius.md` - 12px
- `theme.radius.lg` - 16px
- `theme.radius.xl` - 20px

#### Ícones
- `theme.iconSizes.sm` - 16px
- `theme.iconSizes.md` - 20px
- `theme.iconSizes.lg` - 24px
- `theme.iconSizes.xl` - 32px

## 🎯 Componentes Prioritários para Atualizar

### Alta Prioridade (Telas Principais)
1. ✅ `components/home/HomeHeader.js`
2. `components/home/StatsSection.js`
3. `components/home/RecentReceiptsSection.js`
4. `components/home/TopCategoriesSection.js`
5. `components/cards/EditableReceiptItemCard.js`
6. `components/cards/ReceiptSummaryCard.js`
7. `screens/AuthScreen.js`
8. `screens/HomeScreen.js`
9. `screens/PreViewScreen.js`

### Média Prioridade
10. `components/auth/LoginForm.js`
11. `components/auth/RegisterForm.js`
12. `components/buttons/SecondaryButton.js`
13. `components/buttons/IconButton.js`
14. `components/cards/StatCard.js`
15. `components/inputs/Input.js`

### Baixa Prioridade
- Demais componentes de botões
- Modais
- Componentes auxiliares

## 🔄 Script de Conversão Rápida

Use find & replace com regex nos arquivos:

1. **Fontes fixas**:
   - Buscar: `fontSize:\s*(\d+)`
   - Substituir: `fontSize: fontScale($1)`

2. **Padding fixo**:
   - Buscar: `padding:\s*(\d+)`
   - Substituir: `padding: moderateScale($1)`

3. **Border Radius**:
   - Buscar: `borderRadius:\s*(\d+)`
   - Substituir: `borderRadius: moderateScale($1)`

## ⚠️ Atenções Especiais

### Android vs iOS
- Use `Platform.OS` para ajustes específicos
- StatusBar: height diferente entre plataformas
- SafeAreaView: Comportamento diferente

### Dispositivos Pequenos
- Teste em telas < 375px de largura
- Use `isSmallDevice()` para ajustes condicionais

### Tablets
- Teste em telas >= 768px
- Use `isTablet()` para layouts especiais

## 📱 Dispositivos de Teste Recomendados

### Android
- Pequeno: Galaxy A10 (360x760)
- Médio: Pixel 5 (393x851)
- Grande: Pixel 6 Pro (412x915)

### iOS
- Pequeno: iPhone SE (375x667)
- Médio: iPhone 13 (390x844)
- Grande: iPhone 13 Pro Max (428x926)

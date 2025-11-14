# 🎨 Sistema de Avatares Genéricos para Perfil

**Data**: 2025-11-13  
**Status**: ✅ Implementado

---

## 📋 Visão Geral

Sistema de avatares genéricos 2D sem copyright para personalização de perfil do usuário. Usa ícones do **Ionicons** com cores personalizadas, armazenados localmente no dispositivo.

---

## 🎯 Funcionalidades

### ✅ 30 Opções de Avatares
- 🎨 **Cores vibrantes** e únicas para cada avatar
- 🖼️ **Ícones 2D** do Ionicons (sem copyright)
- 💾 **Salvos localmente** no AsyncStorage
- 📱 **Responsivo** - adapta ao tamanho da tela

### ✅ Categorias de Avatares

#### Pessoas (6 avatares)
- 👤 Pessoa genérica (roxo)
- 👥 Pessoa com círculo (azul claro)
- 😊 Feliz (verde)
- 👓 Com óculos (laranja)
- 👨 Homem (roxo escuro)
- 👩 Mulher (rosa)

#### Esportes (4 avatares)
- 🏈 Futebol americano (vermelho)
- ⚾ Baseball (laranja)
- 🏀 Basketball (amarelo)
- 🚴 Bicicleta (verde lima)

#### Veículos (2 avatares)
- 🚤 Barco (azul)
- 🏎️ Carro esportivo (azul escuro)

#### Comida (3 avatares)
- ☕ Café (roxo claro)
- 🍕 Pizza (rosa escuro)
- 🍦 Sorvete (rosa)

#### Símbolos (6 avatares)
- ❤️ Coração (vermelho escuro)
- 🔥 Chama (laranja escuro)
- ☀️ Sol (amarelo)
- 🌙 Lua (índigo)
- ⭐ Estrela (amarelo ouro)
- 🏆 Troféu (laranja)

#### Entretenimento (4 avatares)
- 🎮 Game controller (roxo)
- 🎧 Headset (azul claro)
- 🎵 Notas musicais (magenta)
- 📷 Câmera (azul)

#### Arte (3 avatares)
- 🖌️ Pincel (verde)
- 🎨 Paleta de cores (roxo)
- 🚀 Foguete (vermelho)

#### Natureza (2 avatares)
- 🌍 Planeta (índigo)
- 🍃 Folha (verde)

---

## 🏗️ Arquitetura

### Componentes Criados

#### 1. AvatarSelector.js
```
components/profile/AvatarSelector.js
```

**Exports**:
- `AVATAR_OPTIONS` - Array com 30 opções de avatares
- `UserAvatar` - Componente de exibição do avatar
- `AvatarSelectorModal` - Modal de seleção

#### 2. Estrutura de Avatar

```typescript
interface AvatarOption {
  id: string;          // "user-1", "user-2", etc.
  icon: string;        // Nome do ícone Ionicons
  color: string;       // Cor do ícone (hex)
  bgColor: string;     // Cor de fundo (hex claro)
}
```

**Exemplo**:
```javascript
{
  id: 'user-1',
  icon: 'person',
  color: '#667eea',    // Roxo
  bgColor: '#eef2ff'   // Roxo muito claro
}
```

---

## 💻 Uso nos Componentes

### ProfileScreen.js

#### Import
```javascript
import { UserAvatar, AvatarSelectorModal } from '../components/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
```

#### Estado
```javascript
const [showAvatarSelector, setShowAvatarSelector] = useState(false);
const [selectedAvatar, setSelectedAvatar] = useState('user-1'); // Avatar padrão
```

#### Carregamento do Avatar Salvo
```javascript
useEffect(() => {
    const loadAvatar = async () => {
        try {
            const savedAvatar = await AsyncStorage.getItem('user_avatar');
            if (savedAvatar) {
                setSelectedAvatar(savedAvatar);
            }
        } catch (error) {
            console.log('Erro ao carregar avatar:', error);
        }
    };
    loadAvatar();
}, []);
```

#### Handler de Seleção
```javascript
const handleSelectAvatar = async (avatarId) => {
    try {
        await AsyncStorage.setItem('user_avatar', avatarId);
        setSelectedAvatar(avatarId);
    } catch (error) {
        console.log('Erro ao salvar avatar:', error);
    }
};
```

#### Renderização
```javascript
{/* Avatar no header */}
<UserAvatar avatarId={selectedAvatar} size={moderateScale(100)} />

{/* Botão de edição */}
<TouchableOpacity 
    style={styles.editAvatarButton}
    onPress={() => setShowAvatarSelector(true)}
>
    <Ionicons name="create" size={moderateScale(18)} color="#fff" />
</TouchableOpacity>

{/* Modal de seleção */}
<AvatarSelectorModal
    visible={showAvatarSelector}
    onClose={() => setShowAvatarSelector(false)}
    onSelect={handleSelectAvatar}
    currentAvatarId={selectedAvatar}
/>
```

---

## 🎨 Componente UserAvatar

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `avatarId` | `string` | `'user-1'` | ID do avatar (ex: "user-5") |
| `size` | `number` | `80` | Tamanho em pixels |

### Exemplo de Uso

```javascript
// Avatar pequeno (40px)
<UserAvatar avatarId="user-3" size={40} />

// Avatar médio (80px - padrão)
<UserAvatar avatarId="user-10" />

// Avatar grande (120px)
<UserAvatar avatarId="user-15" size={120} />
```

### Estilo Visual

```
┌─────────────────────────┐
│                         │
│   ┌───────────────┐     │
│   │               │     │
│   │   🎮 Icon     │     │ ← Fundo colorido claro
│   │               │     │
│   └───────────────┘     │
│                         │
└─────────────────────────┘
       Sombra sutil
```

---

## 🎨 Componente AvatarSelectorModal

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `visible` | `boolean` | ✅ | Controla visibilidade do modal |
| `onClose` | `function` | ✅ | Callback ao fechar (sem selecionar) |
| `onSelect` | `function` | ✅ | Callback ao selecionar avatar |
| `currentAvatarId` | `string` | ❌ | Avatar atualmente selecionado |

### Layout do Modal

```
┌─────────────────────────────────────┐
│ Escolher Avatar              [X]    │  ← Header
├─────────────────────────────────────┤
│                                     │
│  🎨  👤  😊  👓  👨  👩           │
│                                     │
│  🏈  ⚾  🏀  🚴  🚤  🏎️           │  ← Grid 6x5
│                                     │
│  ☕  🍕  🍦  ❤️  🔥  ☀️           │
│                                     │
│  🌙  ⭐  🏆  🎮  🎧  🎵           │
│                                     │
│  📷  🖌️  🎨  🚀  🌍  🍃           │
│                                     │
└─────────────────────────────────────┘
   Scroll vertical se necessário
```

### Interação

1. **Toque no avatar**: Seleciona e fecha automaticamente
2. **Avatar selecionado**: Mostra checkmark ✅ verde
3. **Animação**: Scale 1.05x ao selecionar
4. **Toque fora/[X]**: Fecha sem selecionar

---

## 💾 Armazenamento

### AsyncStorage

**Key**: `user_avatar`  
**Value**: ID do avatar (ex: `"user-10"`)

**Exemplo**:
```javascript
// Salvar
await AsyncStorage.setItem('user_avatar', 'user-10');

// Carregar
const avatarId = await AsyncStorage.getItem('user_avatar');
// Retorna: "user-10" ou null se não existir

// Remover
await AsyncStorage.removeItem('user_avatar');
```

### Dados Salvos

```javascript
// AsyncStorage após seleção:
{
  "user_avatar": "user-15"  // ID do avatar selecionado
}
```

---

## 🎨 Paleta de Cores

### Cores Principais

| Cor | Hex | Uso |
|-----|-----|-----|
| Roxo | `#667eea` | Pessoas, troféu |
| Azul Claro | `#06b6d4` | Água, tecnologia |
| Verde | `#10b981` | Natureza, positivo |
| Laranja | `#f59e0b` | Energia, comida |
| Rosa | `#ec4899` | Feminino, doce |
| Vermelho | `#ef4444` | Ação, paixão |
| Amarelo | `#eab308` | Sol, estrela |
| Índigo | `#6366f1` | Lua, planeta |

### Fundos Correspondentes

Cada cor de ícone tem um fundo claro correspondente:

```javascript
{
  icon: 'person',
  color: '#667eea',      // Roxo
  bgColor: '#eef2ff'     // Roxo muito claro (10% opacidade)
}
```

---

## 🧪 Como Testar

### Teste 1: Seleção de Avatar

1. Abra a tela de Perfil
2. Toque no ícone de edição (lápis) no avatar
3. ✅ **Esperado**: Modal abre com 30 opções de avatares
4. Selecione qualquer avatar
5. ✅ **Esperado**: Modal fecha e avatar atualiza

### Teste 2: Persistência

1. Selecione um avatar
2. Feche o app completamente
3. Reabra o app
4. Vá para o perfil
5. ✅ **Esperado**: Avatar selecionado mantém-se

### Teste 3: Avatar Selecionado Destacado

1. Abra o modal de seleção
2. ✅ **Esperado**: Avatar atual tem checkmark ✅ verde
3. Selecione outro avatar
4. Reabra o modal
5. ✅ **Esperado**: Novo avatar tem checkmark

### Teste 4: Responsividade

```javascript
// Teste diferentes tamanhos
<UserAvatar avatarId="user-1" size={40} />   // Pequeno
<UserAvatar avatarId="user-1" size={80} />   // Médio
<UserAvatar avatarId="user-1" size={120} />  // Grande
```

✅ **Esperado**: Ícone escala proporcionalmente (50% do tamanho total)

---

## 🚀 Benefícios

### Sem Copyright
- ✅ Usa Ionicons (MIT License)
- ✅ Não requer atribuição
- ✅ Uso comercial permitido
- ✅ Não requer conexão com internet

### Performance
- ⚡ Renderizado instantâneo (ícones vetoriais)
- 💾 Armazenamento mínimo (apenas ID do avatar)
- 🔄 Sem necessidade de cache de imagens
- 📶 Funciona offline

### UX
- 🎨 30 opções variadas
- 👆 Seleção intuitiva
- ✨ Feedback visual imediato
- 💾 Persistência automática

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Total de Avatares** | 30 |
| **Categorias** | 8 |
| **Cores Únicas** | 20 |
| **Tamanho do Código** | ~350 linhas |
| **Dependências** | 0 (apenas Ionicons) |
| **Armazenamento** | ~10 bytes (ID do avatar) |

---

## 🔮 Melhorias Futuras (Opcional)

### Possíveis Expansões

1. **Mais Avatares**
   - Adicionar mais ícones do Ionicons
   - Criar categorias adicionais

2. **Personalização de Cores**
   - Permitir usuário escolher cor do ícone
   - Gradientes personalizados

3. **Upload de Imagem**
   - Foto da galeria (opcional)
   - Crop de imagem
   - Compressão automática

4. **Sincronização**
   - Salvar avatar no backend
   - Sincronizar entre dispositivos

---

## 📚 Referências

- [Ionicons](https://ionic.io/ionicons) - Biblioteca de ícones
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Armazenamento local
- [Expo Icons](https://icons.expo.fyi/) - Explorador de ícones

---

## 📝 Arquivos Criados

```
components/
  profile/
    AvatarSelector.js      ✅ Novo - Componente principal
    index.js               ✅ Atualizado - Exports

screens/
  ProfileScreen.js         ✅ Atualizado - Integração

docs/
  AVATAR_SYSTEM.md         ✅ Novo - Esta documentação
```

---

**Status**: ✅ Sistema completo e funcional  
**Testado**: ✅ iOS e Android  
**Performance**: ⚡ Excelente  
**Copyright**: ✅ Livre (Ionicons MIT)

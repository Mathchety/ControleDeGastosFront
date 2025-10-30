# Controle de Gastos - Scanner de Notas Fiscais# 💰 Controle de Gastos - App Mobile# Controle de Gastos - Captura de Comprovantes



App para escanear QR Codes de notas fiscais eletrônicas (NFC-e), categorizar automaticamente os itens com IA e visualizar seus gastos.



## Funcionalidades> Aplicativo React Native (Expo) completo para controle financeiro pessoal com IAAplicativo React Native (Expo) que permite fotografar comprovantes diretamente da câmera do dispositivo e salvar a imagem na galeria, facilitando o registro de gastos.



✅ Scanner de QR Code de notas fiscais

✅ Processamento automático com Google Gemini AI (2-3s)

✅ Categorização automática de 45+ categorias[![Expo](https://img.shields.io/badge/Expo-~54.0-blue.svg)](https://expo.dev)## Recursos

✅ Dashboard com estatísticas e gráficos

✅ Top categorias de gastos[![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)](https://reactnative.dev)

✅ Histórico de notas fiscais

✅ Autenticação JWT[![API](https://img.shields.io/badge/API-Go%20%2B%20Gemini%20AI-orange.svg)](./API_DOCUMENTATION.md)- Solicitação de permissões de câmera e galeria somente quando necessário.



## Tecnologias- Abertura da câmera nativa dentro do aplicativo.



- React Native + Expo---- Captura de comprovantes via câmera do dispositivo ou seleção múltipla na galeria.

- expo-barcode-scanner

- react-native-chart-kit- Salvamento automático da imagem na galeria do aparelho.

- Backend Go + PostgreSQL + Google Gemini AI

## 🎯 Sobre o Projeto- Galeria em miniaturas exibindo todas as fotos capturadas durante a sessão.

## Como Usar



1. Instalar dependências:

```bashSistema completo de controle de gastos pessoais desenvolvido como TCC que integra:## Pré-requisitos

npm install

```- **Frontend Mobile** (React Native + Expo)



2. Iniciar o app:- **Backend API** (Golang + PostgreSQL)- Node.js 18 ou superior.

```bash

npx expo start- **Inteligência Artificial** (Google Gemini)- Expo CLI disponível via `npx` (instalado automaticamente com os comandos abaixo).

```



3. Escanear QR Code do Expo Go no seu celular

### ✨ Destaques## Instalação

## Fluxo de Uso



1. Fazer login/cadastro

2. Tocar no botão QR Code no header✅ **Autenticação JWT** com backend Go  ```bash

3. Escanear o QR Code da nota fiscal

4. Aguardar processamento (2-3s)✅ **Scanner de QR Code** de notas fiscais (NFC-e)  npm install

5. Ver nota processada com itens categorizados

6. Visualizar estatísticas no dashboard✅ **IA Google Gemini** para análise automática  ```



## API✅ **Categorização inteligente** de 45+ categorias  



Base URL: `http://147.185.221.212:61489/api/v1`✅ **Dashboard interativo** com estatísticas  ## Execução



Endpoints principais:✅ **Banco de dados normalizado** (3NF)  

- POST /auth/register - Cadastro

- POST /auth/login - Login  ```bash

- GET /receipts - Listar notas

- POST /receipts/qr-code/confirm - Escanear QR Code---npx expo start


```

## 📱 Funcionalidades

Durante a execução, escolha a plataforma desejada (Android, iOS ou Web). Em dispositivos móveis, utilize o aplicativo Expo Go para leitura do QR Code.

### 🔐 Autenticação

- Login e registro de usuários## Estrutura principal

- Token JWT (validade 7 dias)

- Persistência com AsyncStorage- `App.js`: Implementa o fluxo de captura e salvamento de fotos.

- Gerenciamento seguro de sessão- `assets/`: Recursos estáticos gerados pelo Expo.



### 📸 Captura de Comprovantes## Permissões

- Foto via câmera nativa

- Seleção múltipla da galeriaO aplicativo solicita acesso à câmera e à galeria apenas no momento em que o usuário tenta capturar e salvar uma imagem.

- Armazenamento local seguro

- Preview em miniaturas## Próximos passos sugeridos

- Exclusão individual

- Exibir lista de comprovantes armazenados com metadados (data, valor, categoria).

### 🤖 Scanner Inteligente- Sincronizar imagens com backend ou serviço de armazenamento em nuvem.

- QR Code de notas fiscais (NFC-e)- Associar cada foto a um registro de despesa dentro do aplicativo.

- Análise com IA em 2-3s
- Preview antes de confirmar
- Categorização automática
- Extração de dados completos

### 📊 Dashboard
- Estatísticas em tempo real
- Gráficos (em desenvolvimento)
- Transações recentes
- Filtros por período
- Busca avançada

### 👤 Perfil e Configurações
- Dados do usuário
- Estatísticas pessoais
- Preferências do app
- Gerenciamento de notificações
- Segurança (2FA em breve)

---

## 🏗️ Arquitetura

```
ControleDeGastosFront/
├── App.js                     # Root com Providers
├── components/                # Componentes Reutilizáveis
│   ├── Buttons.js            # Primary, Secondary, Icon
│   ├── Cards.js              # Stat, Transaction, Receipt
│   ├── Inputs.js             # Input, Search
│   └── Modals.js             # Loading, Alert, Confirm
├── contexts/                  # Estado Global
│   ├── AuthContext.js        # JWT + AsyncStorage
│   └── DataContext.js        # Recibos + Categorias
├── navigation/                # React Navigation
│   ├── AppNavigator.js       # Stack Navigator
│   └── MainTabNavigator.js   # Bottom Tabs
├── screens/                   # Telas
│   ├── AuthScreen.js         # Login/Registro
│   ├── HomeScreen.js         # Dashboard
│   ├── ScanScreen.js         # Scanner
│   ├── ProfileScreen.js      # Perfil
│   └── SettingsScreen.js     # Configurações
├── services/                  # API Services
│   ├── api.js                # Config base
│   ├── authService.js        # Auth endpoints
│   ├── categoryService.js    # Categorias CRUD
│   ├── productService.js     # Produtos
│   └── receiptService.js     # Recibos + QR Code
└── assets/                    # Recursos estáticos
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** 18+
- **npm** ou **yarn**
- **Expo Go** (app no celular)
- Ou **Android Studio** / **Xcode**

### Instalação

```bash
# 1. Navegue até a pasta do projeto
cd ControleDeGastosFront

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npx expo start
```

### Executar no Dispositivo

**Opção 1: Expo Go (Recomendado)**
1. Instale o app "Expo Go" no celular
2. Escaneie o QR Code que aparece no terminal
3. O app será carregado automaticamente

**Opção 2: Emulador Android**
```bash
# Pressione 'a' no terminal
# ou
npx expo start --android
```

**Opção 3: Simulador iOS (Mac)**
```bash
# Pressione 'i' no terminal
# ou
npx expo start --ios
```

**Opção 4: Web**
```bash
# Pressione 'w' no terminal
# ou
npx expo start --web
```

---

## 📦 Dependências Principais

```json
{
  "@react-navigation/native": "^6.1.x",
  "@react-navigation/bottom-tabs": "^6.5.x",
  "@react-navigation/stack": "^6.3.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "expo": "~54.0.x",
  "expo-image-picker": "~19.0.x",
  "expo-file-system": "~19.0.x",
  "expo-linear-gradient": "~13.0.x",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.28.x",
  "react-native-reanimated": "~3.15.x",
  "react-native-safe-area-context": "~4.16.x",
  "react-native-screens": "~4.16.x"
}
```

---

## 🔌 API Backend

### Base URL
```
http://147.185.221.212:61489/api/v1
```

### Principais Endpoints

#### Autenticação
- `POST /register` - Criar conta
- `POST /login` - Fazer login
- `GET /me` - Obter perfil

#### Recibos
- `GET /receipts` - Listar recibos
- `GET /receipts-basic` - Versão otimizada (55% menor)
- `POST /scan-qrcode/preview` - Preview QR Code
- `POST /scan-qrcode/confirm` - Salvar nota fiscal

#### Categorias
- `GET /categories` - Listar categorias
- `POST /category` - Criar categoria
- `PATCH /category/:id` - Atualizar
- `DELETE /category/:id` - Deletar

📖 **[Documentação Completa da API](./API_DOCUMENTATION.md)**  
🧪 **[Guia de Testes](./API_TESTING_GUIDE.md)**

---

## 🎨 Componentes Customizados

### Botões
```jsx
import { PrimaryButton, SecondaryButton, IconButton } from './components/Buttons';

<PrimaryButton
  title="Entrar"
  icon="arrow-forward"
  onPress={handleLogin}
  colors={['#667eea', '#764ba2']}
/>
```

### Cards
```jsx
import { StatCard, ReceiptCard, TransactionCard } from './components/Cards';

<StatCard
  icon="wallet"
  title="Saldo Total"
  value="R$ 5.420"
  color="#667eea"
/>
```

### Modals
```jsx
import { LoadingModal, AlertModal, ConfirmModal } from './components/Modals';

<LoadingModal visible={loading} message="Carregando..." />
```

---

## 🔐 Contextos (Estado Global)

### AuthContext
```jsx
const { user, token, login, logout, isAuthenticated } = useAuth();

// Login
const result = await login(email, password);

// Logout
await logout();

// Verificar autenticação
if (isAuthenticated) { /* ... */ }
```

### DataContext
```jsx
const { 
  receipts, 
  categories, 
  fetchReceipts, 
  scanQRCode,
  confirmQRCode 
} = useData();

// Buscar recibos
await fetchReceipts();

// Escanear QR Code
const result = await scanQRCode(qrCodeData);

// Confirmar
await confirmQRCode(qrCodeData, receiptData);
```

---

## 📱 Telas do Aplicativo

### 1. AuthScreen
![Login](https://via.placeholder.com/300x500/667eea/ffffff?text=Login+Screen)

Tela de login e registro com:
- Formulários animados
- Validação de campos
- Toggle entre login/registro
- Integração com API

### 2. HomeScreen  
![Dashboard](https://via.placeholder.com/300x500/667eea/ffffff?text=Dashboard)

Dashboard com:
- Cards de estatísticas
- Transações recentes
- Ações rápidas
- Gráficos (em breve)

### 3. ScanScreen
![Scanner](https://via.placeholder.com/300x500/667eea/ffffff?text=Scanner)

Scanner de comprovantes:
- QR Code de NFC-e
- Captura por câmera
- Galeria de fotos
- Preview de imagens

### 4. ProfileScreen
![Perfil](https://via.placeholder.com/300x500/667eea/ffffff?text=Profile)

Perfil do usuário:
- Dados pessoais
- Estatísticas
- Avatar customizável
- Informações de conta

### 5. SettingsScreen
![Configurações](https://via.placeholder.com/300x500/667eea/ffffff?text=Settings)

Configurações completas:
- Notificações
- Tema (em breve)
- Segurança
- Dados e backup

---

## 🤖 Integração com IA

### Google Gemini

A API utiliza **Google Gemini AI** para:

1. **Análise de Notas Fiscais**
   - Extração de dados (loja, data, itens, preços)
   - Tempo de processamento: 2-3 segundos

2. **Categorização Automática**
   - 45+ categorias de supermercado
   - Precisão baseada em IA de última geração

3. **Fluxo de Uso**
   ```
   Imagem/QR Code → Google Gemini → JSON estruturado → Banco de dados
   ```

---

## 🏷️ Categorias Padrão

### Supermercado (15 categorias base)
1. 🍽️ Alimentação
2. 🥤 Bebidas
3. 🍎 Frutas
4. 🥬 Legumes e Verduras
5. 🍗 Carnes e Aves
6. 🐟 Peixes e Frutos do Mar
7. 🥛 Laticínios
8. 🍞 Padaria
9. ❄️ Congelados
10. 🧼 Higiene Pessoal
11. 🧹 Limpeza
12. 👶 Bebê
13. 🐾 Pet
14. 🏠 Utilidades Domésticas
15. 📦 Outros

**+ 30 categorias adicionais** configuradas na API

---

## 🎯 Roadmap

### ✅ Concluído
- [x] Estrutura completa do projeto
- [x] Autenticação JWT
- [x] Captura de fotos
- [x] Integração com API
- [x] Dashboard básico
- [x] Navegação completa
- [x] Componentesreutilizáveis

### 🚧 Em Desenvolvimento
- [ ] Scanner de QR Code real (expo-barcode-scanner)
- [ ] Visualização detalhada de recibos
- [ ] Gráficos com Victory Native
- [ ] Filtros avançados

### 📅 Planejado
- [ ] Modo escuro
- [ ] Autenticação biométrica
- [ ] Exportação de dados (PDF/Excel)
- [ ] Notificações push
- [ ] Sincronização em tempo real
- [ ] Backup na nuvem
- [ ] Versão web (React Native Web)
- [ ] Relatórios mensais automáticos

---

## 🧪 Testes

### Testar Localmente

```bash
# Executar testes unitários
npm test

# Executar com coverage
npm run test:coverage

# Testar build
npx expo export
```

### Testar API

Ver guia completo em **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)**

---

## 📊 Banco de Dados

### Modelo de Dados (Normalizado 3NF)

```
Users (1) ──┬──> (N) Receipts
             │
Categories (1) ──> (N) ReceiptItems <── (N) Receipts
```

### Segurança
- ✅ Senhas com bcrypt (10 rounds)
- ✅ JWT com HMAC-SHA256
- ✅ Foreign Keys com CASCADE
- ✅ Isolamento por usuário
- ✅ Validação de inputs

---

## 🐛 Problemas Conhecidos

### Avisos (Warnings)
- `SafeAreaView deprecated` → Atualizar para react-native-safe-area-context
- `makeDirectoryAsync deprecated` → Migrar para nova API FileSystem

### Melhorias Futuras
- Implementar cache local com SQLite
- Adicionar retry automático em falhas de rede
- Otimizar carregamento de imagens

---

## 🤝 Contribuindo

Este é um projeto acadêmico (TCC), mas sugestões são bem-vindas!

### Como Contribuir
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é acadêmico e está em desenvolvimento como parte de um TCC.

---

## 👨‍💻 Autor

**Projeto de TCC**  
Desenvolvido com ❤️ usando React Native + Expo

---

## 📚 Documentação Adicional

- 📖 [Documentação Completa da API](./API_DOCUMENTATION.md)
- 🧪 [Guia de Testes da API](./API_TESTING_GUIDE.md)
- 🔐 [Guia de Segurança](./API_DOCUMENTATION.md#-segurança)
- 🤖 [Integração com IA](./API_DOCUMENTATION.md#-google-gemini-ai)

---

## 🔗 Links Úteis

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native](https://reactnative.dev/)
- [Google Gemini AI](https://ai.google.dev/)

---

**Última atualização:** 29 de outubro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Em desenvolvimento ativo

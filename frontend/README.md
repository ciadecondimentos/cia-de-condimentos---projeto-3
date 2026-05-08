# Frontend - Configuração de Backend

## 🔧 Como Alterar a URL do Backend

No arquivo `index.js`, linha 7, você encontra:

```javascript
const BACKEND_URL = 'http://localhost:3000'; // Local
// const BACKEND_URL = 'https://seu-backend.onrender.com'; // Produção
```

### Para Desenvolvimento Local:
```javascript
const BACKEND_URL = 'http://localhost:3000';
```

### Para Teste no Netlify:
```javascript
const BACKEND_URL = 'https://cia-condimentos-api.onrender.com'; // Seu backend no Render
```

### Para Produção:
```javascript
const BACKEND_URL = 'https://seu-backend-final.onrender.com';
```

---

## 📋 Resumo das Mudanças Implementadas

### ✅ HTML (index.html)
- Estrutura completa com todos os elementos
- Header com navegação e carrinho
- Hero section inspiradora
- Filtros de categoria
- Grid de produtos dinâmicos
- Seção de contato
- Sidebar do carrinho
- Modal de pagamento PIX

### ✅ JavaScript (index.js)
- Sistema de produtos com filtro e busca
- Gerenciamento de carrinho (add, remove, qty)
- **Integração com Backend** - Genera PIX via API
- Verificação automática de pagamento (polling a cada 3s)
- Modal elegante para PIX
- Copiar chave PIX automática
- QR Code gerado pelo Mercado Pago

### ✅ CSS (style.css)
- Design premium com cores da marca (vermelho/amarelo)
- Animações suaves (fadeUp, hover)
- Responsivo para mobile
- Modal PIX com estilos profissionais
- Sidebar do carrinho fluida
- Cores e tipografia consistentes

---

## 🔗 Fluxo de Pagamento

1. Cliente adiciona produtos ao carrinho
2. Clica em "Pagar com PIX"
3. Frontend faz requisição para: `POST /pix`
4. Backend retorna QR Code + Chave Cópia e Cola
5. Frontend mostra modal com QR Code
6. Cliente escaneia ou copia a chave
7. Frontend verifica status a cada 3 segundos
8. Quando aprovado → Carrinho limpa + Mensagem de sucesso

---

## 🚀 Próximos Passos

1. **Testar localmente:**
   - Backend rodando: `npm start` na pasta `backend/`
   - Frontend: Abrir `index.html` no navegador

2. **Deploy no Render:**
   - Backend: Configurar variáveis no Render
   - Frontend: Deploy no Netlify (ou outro serviço)

3. **Banco de Dados PostgreSQL:**
   - Você vai enviar a connection string que você mencionou

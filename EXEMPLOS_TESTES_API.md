# 🧪 Exemplos de Testes - Endpoints de Produtos

## Configuração Base

```javascript
const BASE_URL = 'https://seu-backend.onrender.com';
// ou localmente: 'http://localhost:3000'
```

---

## 1️⃣ GET /products - Listar Todos

**Descrição:** Retorna lista de todos os produtos

```bash
curl -X GET https://seu-backend.onrender.com/products
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Pimenta Dedo-de-Moça",
    "category": "pimentas",
    "emoji": "🌶️",
    "description": "Pimenta fresca e picante, ideal para molhos e marinadas.",
    "price": 12.90,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Pimenta do Reino Preta",
    "category": "pimentas",
    "emoji": "⚫",
    "description": "Grãos inteiros de pimenta negra com aroma intenso.",
    "price": 15.50,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**Teste em JavaScript:**
```javascript
fetch('https://seu-backend.onrender.com/products')
  .then(res => res.json())
  .then(products => {
    console.log('✅ Produtos carregados:', products.length);
    console.log('✅ Primeiro produto description:', products[0].description);
  })
  .catch(err => console.error('❌ Erro:', err));
```

---

## 2️⃣ GET /products/:id - Buscar Um Produto

**Descrição:** Retorna um produto específico

```bash
curl -X GET https://seu-backend.onrender.com/products/1
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "name": "Pimenta Dedo-de-Moça",
  "category": "pimentas",
  "emoji": "🌶️",
  "description": "Pimenta fresca e picante, ideal para molhos e marinadas.",
  "price": 12.90,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Se não encontrar (404):**
```json
{
  "error": "Produto não encontrado"
}
```

---

## 3️⃣ POST /products - Criar Novo Produto

**Descrição:** Cria um novo produto na tabela

```bash
curl -X POST https://seu-backend.onrender.com/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cominho em Pó",
    "category": "especiarias",
    "emoji": "🫙",
    "description": "Cominho moído, essencial para temperos nordestinos.",
    "price": 8.50
  }'
```

**Resposta (201 Created):**
```json
{
  "id": 13,
  "name": "Cominho em Pó",
  "category": "especiarias",
  "emoji": "🫙",
  "description": "Cominho moído, essencial para temperos nordestinos.",
  "price": 8.50,
  "created_at": "2024-01-20T14:45:30.000Z",
  "updated_at": "2024-01-20T14:45:30.000Z"
}
```

**Teste em JavaScript:**
```javascript
const newProduct = {
  name: "Gengibre em Pó",
  category: "especiarias",
  emoji: "🟤",
  description: "Gengibre seco e moído, perfeito para chás e doces.",
  price: 10.90
};

fetch('https://seu-backend.onrender.com/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProduct)
})
  .then(res => res.json())
  .then(product => {
    console.log('✅ Produto criado com ID:', product.id);
    console.log('✅ Description:', product.description);
  })
  .catch(err => console.error('❌ Erro:', err));
```

**Erro se campos faltarem (400):**
```json
{
  "error": "Campos obrigatórios faltando"
}
```

---

## 4️⃣ PUT /products/:id - Atualizar Produto

**Descrição:** Atualiza um produto existente

```bash
curl -X PUT https://seu-backend.onrender.com/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pimenta Dedo-de-Moça Premium",
    "category": "pimentas",
    "emoji": "🌶️",
    "description": "Pimenta fresca, premium e ultra picante. Ideal para molhos gourmet.",
    "price": 18.90
  }'
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "name": "Pimenta Dedo-de-Moça Premium",
  "category": "pimentas",
  "emoji": "🌶️",
  "description": "Pimenta fresca, premium e ultra picante. Ideal para molhos gourmet.",
  "price": 18.90,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-20T15:00:30.000Z"
}
```

**Teste em JavaScript:**
```javascript
const updatedProduct = {
  name: "Pimenta Dedo-de-Moça",
  category: "pimentas",
  emoji: "🌶️",
  description: "Descrição atualizada com mais detalhes.",
  price: 14.90
};

fetch('https://seu-backend.onrender.com/products/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedProduct)
})
  .then(res => res.json())
  .then(product => {
    console.log('✅ Produto atualizado:', product.name);
    console.log('✅ Nova description:', product.description);
  })
  .catch(err => console.error('❌ Erro:', err));
```

---

## 5️⃣ DELETE /products/:id - Deletar Produto

**Descrição:** Remove um produto da tabela

```bash
curl -X DELETE https://seu-backend.onrender.com/products/1
```

**Resposta (200 OK):**
```json
{
  "id": 1,
  "name": "Pimenta Dedo-de-Moça",
  "category": "pimentas",
  "emoji": "🌶️",
  "description": "Pimenta fresca e picante, ideal para molhos e marinadas.",
  "price": 12.90,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Teste em JavaScript:**
```javascript
fetch('https://seu-backend.onrender.com/products/1', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(product => {
    console.log('✅ Produto deletado:', product.name);
  })
  .catch(err => console.error('❌ Erro:', err));
```

---

## 🔍 Erros Comuns & Soluções

### Erro: "Campos obrigatórios faltando"
**Causa:** Algum campo não foi enviado
**Solução:** Verificar se todos os campos estão presentes:
- ✅ name
- ✅ category
- ✅ emoji
- ✅ **description** (antes era `desc`)
- ✅ price

### Erro: "Produto não encontrado"
**Causa:** ID não existe no banco
**Solução:** Verificar ID com GET /products

### Erro: 500 Internal Server Error
**Causa:** Erro no banco de dados
**Solução:** 
1. Verificar se migração foi executada
2. Confirmar se coluna é `description` (não `desc`)
3. Checar logs no Render

---

## 📦 Exemplo Completo: CRUD em JavaScript

```javascript
const API = 'https://seu-backend.onrender.com/products';

// CREATE
async function createProduct(product) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  return res.json();
}

// READ all
async function getAllProducts() {
  const res = await fetch(API);
  return res.json();
}

// READ one
async function getProduct(id) {
  const res = await fetch(`${API}/${id}`);
  return res.json();
}

// UPDATE
async function updateProduct(id, product) {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  return res.json();
}

// DELETE
async function deleteProduct(id) {
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Usar:
createProduct({
  name: "Alecrim",
  category: "ervas",
  emoji: "🌿",
  description: "Alecrim fresco seco",
  price: 8.90
}).then(p => console.log('✅ Criado:', p));
```

---

## ✅ Checklist de Validação

Após fazer as requisições acima, verificar:

- [ ] GET /products retorna lista com `description`
- [ ] POST /products cria com `description`
- [ ] PUT /products/:id atualiza `description`
- [ ] DELETE /products/:id remove o produto
- [ ] Não há erro "column does not exist"
- [ ] Não há erro 500
- [ ] `updated_at` é atualizado após edição

---

**Última atualização: 8 de maio de 2026**

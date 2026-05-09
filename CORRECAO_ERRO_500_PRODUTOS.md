# 🔧 Correção: Erro 500 na rota /products

## Problema Identificado

A coluna `desc` na tabela `products` conflita com uma **palavra reservada do PostgreSQL**, causando erro 500 em todas as operações de produtos.

**Solução**: Renomear `desc` → `description`

---

## Arquivos Atualizados

### Backend
- ✅ `backend/db.js`
  - Função `createProduct(name, category, emoji, **description**, price)` 
  - Função `updateProduct(id, name, category, emoji, **description**, price)`
  - Tabela criada com coluna `description` (não `desc`)

- ✅ `backend/server.js`
  - POST `/products` - recebe `description`
  - PUT `/products/:id` - recebe `description`
  - GET `/products` - retorna `description`
  - DELETE `/products/:id` - sem mudanças

### Frontend
- ✅ `frontend/admin.js`
  - Formulários usam `description` (ao invés de `desc`)
  - Display dos produtos mostra `p.description`
  - Edição de produtos funciona com campo `description`

- ✅ `frontend/index.js`
  - Produtos padrão usam `description`
  - Renderização exibe `p.description`
  - Busca/filtro busca em `p.description.toLowerCase()`

---

## 🚀 Como Aplicar a Migração

### Opção 1: Preservar Dados Existentes (Recomendado)

Conecte ao seu banco PostgreSQL no Render e execute:

```sql
ALTER TABLE products RENAME COLUMN desc TO description;
```

**Vantagem**: Mantém todos os produtos cadastrados  
**Tempo**: ~1 segundo

### Opção 2: Limpar e Recriar Tabela (Se houver erro na Opção 1)

```sql
DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Desvantagem**: Limpa todos os produtos anteriores  
**Vantagem**: Garante tabela 100% correta

---

## 📋 Passos para Deploy no Render

1. **Atualizar código backend**
   ```bash
   git add backend/
   git commit -m "fix: corrige erro 500 - renomeia coluna desc para description"
   git push origin main
   ```

2. **Conectar ao banco PostgreSQL**
   - Abrir Render Dashboard → PostgreSQL → Connect
   - Usar ferramenta como DBeaver, pgAdmin ou psql

3. **Executar migração SQL**
   ```sql
   ALTER TABLE products RENAME COLUMN desc TO description;
   ```

4. **Testar API**
   ```bash
   curl https://seu-backend.onrender.com/products
   # Deve retornar JSON com campo "description"
   ```

5. **Frontend**
   - Se está no Netlify, fazer push no frontend também
   - Se está servido pelo backend, restartar a aplicação

---

## ✅ Verificação Pós-Migração

### Verificar estrutura da tabela
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
```

Deve mostrar:
- ✅ `id` → integer
- ✅ `name` → character varying
- ✅ `category` → character varying
- ✅ `emoji` → character varying
- ✅ `description` → text (antes era `desc`)
- ✅ `price` → numeric
- ✅ `created_at` → timestamp
- ✅ `updated_at` → timestamp

### Testar endpoints

```bash
# Listar produtos
GET /products

# Criar produto
POST /products
{
  "name": "Pimenta Preta",
  "category": "pimentas",
  "emoji": "⚫",
  "description": "Grãos de pimenta preta",
  "price": 15.50
}

# Editar produto
PUT /products/1
{
  "name": "Pimenta Preta Premium",
  "category": "pimentas",
  "emoji": "⚫",
  "description": "Grãos selecionados",
  "price": 18.00
}
```

---

## 🐛 Se ainda receber erro 500

1. Verificar console do backend para mensagem de erro exata
2. Confirmar que a coluna foi renomeada com sucesso
3. Fazer restart da aplicação no Render
4. Limpar cache do navegador (Ctrl+Shift+Delete)
5. Tentar em navegador anônimo/privado

---

## 📝 Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `db.js` | `desc` → `description` em todas funções |
| `server.js` | `desc` → `description` em todos endpoints |
| `admin.js` | `desc` → `description` em forms e display |
| `index.js` | `desc` → `description` em produtos padrão |

Todas as mudanças respeitam a compatibilidade com PostgreSQL e mantêm a estrutura segura.

# 📋 Checklist de Deploy - Correção Erro 500

## ✅ Arquivos Atualizados

### Backend
- [x] `db.js` - Funções com `description` ao invés de `desc`
- [x] `server.js` - Rotas POST, PUT com campo `description`
- [x] `MIGRATE_DESC_TO_DESCRIPTION.sql` - Script de migração
- [x] `test-products.sh` - Script de testes

### Frontend
- [x] `admin.html` - IDs de campos: `id="description"` e `id="editDescription"`
- [x] `admin.js` - Funções atualizadas com `description`
- [x] `index.js` - Produtos padrão com `description`

### Documentação
- [x] `CORRECAO_ERRO_500_PRODUTOS.md` - Guia completo de migração

---

## 🚀 Passos de Deploy

### 1️⃣ Preparação Local

```bash
# Verificar se não há referências a "desc" em produção
grep -r "\.desc" . --include="*.js"
# Deve retornar vazio ou apenas referências a CSS (.card-desc)

# Testar localmente (opcional)
# npm install
# npm start
```

### 2️⃣ Commit e Push

```bash
git add -A
git commit -m "fix: corrige erro 500 - renomeia coluna desc para description no PostgreSQL"
git push origin main
```

### 3️⃣ Atualizar Banco de Dados

**Via Render Console:**
1. Abrir [render.com](https://render.com)
2. Selecionar PostgreSQL → Connect
3. Abrir com ferramenta SQL (DBeaver, pgAdmin, Terminal)
4. Executar um dos comandos abaixo:

**Opção A: Preservar dados (RECOMENDADO)**
```sql
ALTER TABLE products RENAME COLUMN desc TO description;
```

**Opção B: Limpar tudo (se A falhar)**
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

### 4️⃣ Verificar Aplicação

**Backend (Render):**
```bash
# Aguardar deploy automático (~2 min)
# Testar em: https://seu-backend.onrender.com/products
# Deve retornar JSON com campo "description"
```

**Frontend (Netlify/Vercel):**
```bash
# Se frontend está em repositório separado, fazer push também
# Se está no backend, reload automático
```

### 5️⃣ Testes Finais

#### Via Browser
1. Abrir painel admin: `https://seu-dominio/admin.html`
2. Testar criar produto com descrição
3. Testar editar descrição
4. Testar deletar produto
5. Abrir loja pública: `https://seu-dominio/index.html`
6. Verificar se produtos aparecem corretamente

#### Via cURL
```bash
# GET /products
curl https://seu-backend.onrender.com/products

# POST /products
curl -X POST https://seu-backend.onrender.com/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "category": "pimentas",
    "emoji": "🌶️",
    "description": "Descrição de teste",
    "price": 9.99
  }'
```

---

## 🔍 Verificações Críticas

- [ ] Erro 500 em GET /products → RESOLVIDO
- [ ] Erro 500 em POST /products → RESOLVIDO
- [ ] Erro 500 em PUT /products/:id → RESOLVIDO
- [ ] Painel admin carrega produtos → OK
- [ ] Criar novo produto funciona → OK
- [ ] Editar produto funciona → OK
- [ ] Deletar produto funciona → OK
- [ ] Frontend exibe "description" corretamente → OK
- [ ] Filtro/busca funciona → OK

---

## 🚨 Se Ainda Houver Erro 500

1. **Verificar logs no Render:**
   - Ir para Logs → Ver mensagem exata
   - Procurar por "column does not exist" ou "syntax error"

2. **Verificar coluna:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name='products' AND column_name IN ('desc', 'description');
   ```

3. **Se coluna "desc" ainda existir:**
   ```sql
   ALTER TABLE products DROP COLUMN desc;
   ```

4. **Reiniciar aplicação no Render:**
   - Dashboard → Settings → Manual Deploy

---

## 📝 Notas Importantes

- ✅ Compatível com PostgreSQL 9.0+
- ✅ Sem quebra de compatibilidade forward
- ✅ Dados existentes preservados (se usar Opção A)
- ✅ Frontend + Backend sincronizados
- ⚠️ DESC é palavra reservada do PostgreSQL

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se migrations foram aplicadas
2. Veja os logs do Render para erro específico
3. Limpe cache do navegador
4. Teste em navegador anônimo
5. Se necessário, execute Opção B (limpar e recriar)

Última atualização: 8 de maio de 2026

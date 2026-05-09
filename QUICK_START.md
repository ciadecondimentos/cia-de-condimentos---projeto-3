# ⚡ INSTRUÇÕES RÁPIDAS - Deploy em 5 Minutos

## 🚀 Passo 1: Commit e Push (1 min)

```bash
cd PROJETO\ CIA\ DE\ CONDIMENTOS
git add -A
git commit -m "fix: corrige erro 500 - renomeia coluna desc para description"
git push origin main
```

**Aguardar** ~2 minutos para deploy automático no Render.

---

## 🔧 Passo 2: Migração SQL (1 min)

Conecte ao PostgreSQL no Render e execute:

```sql
ALTER TABLE products RENAME COLUMN desc TO description;
```

**Alternativa:** Se acima der erro, use:
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

---

## ✅ Passo 3: Validar (2 min)

### Via Browser
1. Abrir admin: `https://seu-dominio/admin.html`
2. Criar um produto teste
3. Se funcionar → ✅ Sucesso!

### Via Terminal (cURL)
```bash
curl https://seu-backend.onrender.com/products
```

Deve retornar JSON com **campo "description"** (não "desc").

---

## 📋 Checklist Rápido

- [ ] Código foi feito commit
- [ ] Render está deployando
- [ ] Migração SQL foi executada
- [ ] GET /products funciona
- [ ] POST /products funciona
- [ ] Painel admin funciona
- [ ] Loja pública exibe produtos

---

## 🆘 Se der erro ainda

```bash
# 1. Verificar status do deploy
https://render.com → seu app → Logs

# 2. Verificar coluna
psql $DATABASE_URL
\d products

# 3. Se coluna "desc" ainda existe
ALTER TABLE products DROP COLUMN desc CASCADE;

# 4. Restart app
# Dashboard Render → Manual Deploy
```

---

## 📚 Documentação Completa

- **CORRECAO_ERRO_500_PRODUTOS.md** - Guia detalhado
- **EXEMPLOS_TESTES_API.md** - Exemplos de requisições
- **VERIFICACAO_FINAL.md** - Validação completa
- **DIAGRAMA_CORRECAO.md** - Fluxos visuais

---

**Tempo total: ~5-10 minutos**

**Status: Pronto para deploy ✅**

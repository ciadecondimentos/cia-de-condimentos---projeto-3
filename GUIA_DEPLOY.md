# 🚀 GUIA DE DEPLOY - Render + Netlify

## PARTE 1: Deploy do Backend no Render

### ✅ Passo 1: Conectar Repositório GitHub

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub (escolha a pasta `backend/`)
4. Clique em "Connect"

### ✅ Passo 2: Configurar Serviço

Na página de criação, preencha:

| Campo | Valor |
|-------|-------|
| **Name** | `cia-condimentos-api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Region** | `São Paulo (sa-east-1)` |
| **Plan** | `Free` (ou pago) |

### ✅ Passo 3: Adicionar Variáveis de Ambiente

No Render, vá em **"Environment"** e adicione:

```
MP_ACCESS_TOKEN = APP_USR-784933418142695-031515-63fc634ae777312bdb5d9c314b4614b1-2703647209
MP_WEBHOOK_SECRET = 9b0b3897d11dc822f6f87910e21fc81e59f8007978c23893b2157835845921ef
PAYER_EMAIL = ciadecondimentos@outlook.com
DATABASE_URL = postgresql://cia_condimentos_db_user:eFsT1PdTSATPl1qNPf6yLEoERhHh7dfQ@dpg-d7v4287aqgkc73d5a61g-a.oregon-postgres.render.com/cia_condimentos_db
NODE_ENV = production
ALLOWED_ORIGINS = https://ciadecondimentosteste01.netlify.app,https://seu-dominio-final.com.br
```

⚠️ **IMPORTANTE:** `ALLOWED_ORIGINS` - Adicionar todas as URLs onde seu site vai rodar, separadas por vírgula!

### ✅ Passo 4: Deploy

Clique em **"Create Web Service"**

Render fará o deploy automaticamente. Você receberá uma URL como:
```
https://cia-condimentos-api.onrender.com
```

### ✅ Passo 5: Configurar Webhook no Mercado Pago

1. Acesse sua conta Mercado Pago → **Desenvolvedores** → **Webhooks**
2. Clique em **"Criar webhook"**
3. Adicione a URL: `https://cia-condimentos-api.onrender.com/webhook`
4. Selecione eventos: **payment.created** e **payment.updated**
5. Copie o **Secret** gerado
6. Volte ao Render e atualize a variável: `MP_WEBHOOK_SECRET = seu_novo_secret`

---

## PARTE 2: Deploy do Frontend no Netlify

### ✅ Passo 1: Conectar Repositório GitHub

1. Acesse [Netlify](https://app.netlify.com)
2. Clique em **"New site from Git"**
3. Conecte seu repositório GitHub
4. Escolha a pasta `frontend/`

### ✅ Passo 2: Configurar Build

| Campo | Valor |
|-------|-------|
| **Base directory** | `frontend` |
| **Build command** | `echo 'Static site - no build needed'` |
| **Publish directory** | `.` |

### ✅ Passo 3: Adicionar Variáveis (Opcional)

No Netlify, vá em **"Site settings"** → **"Build & deploy"** → **"Environment**:

```
REACT_APP_BACKEND_URL = https://cia-condimentos-api.onrender.com
```

Se não adicionar, o frontend detectará automaticamente por:
- Se estiver em `localhost` → usa `http://localhost:3000`
- Se estiver em produção → usa `https://cia-condimentos-api.onrender.com`

### ✅ Passo 4: Publicar

Netlify fará o deploy automaticamente. Você receberá uma URL como:
```
https://ciadecondimentosteste01.netlify.app
```

---

## 🔄 Quando Mudar de URL

Se você quiser mudar a URL do seu site (ex: para `ciadecondimentos.com.br`):

### Backend (Render):

1. Vá em **"Environment"**
2. Edite `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS = https://ciadecondimentos.com.br,https://www.ciadecondimentos.com.br
   ```
3. Clique **"Save"** → Render faz redeploy automático ✅

### Frontend (Netlify):

Se estiver usando domínio customizado:
1. Vá em **"Site settings"** → **"Domain management"**
2. Adicione seu domínio customizado (ex: `ciadecondimentos.com.br`)
3. Frontend continuará funcionando normalmente ✅

**Pronto!** Sem precisar mudar nenhuma linha de código!

---

## ✅ Checklist Final

- [ ] Backend deployado no Render
- [ ] Variáveis de ambiente adicionadas no Render
- [ ] Frontend deployado no Netlify
- [ ] CORS configurado para a URL do Netlify
- [ ] Webhook do Mercado Pago configurado
- [ ] Testou o fluxo completo (adicionar ao carrinho → pagar PIX)

---

## 🧪 Testar a Integração

Abra o Chrome DevTools (F12) → **Console** e procure por:
```
🔗 Backend URL: https://cia-condimentos-api.onrender.com
```

Se a mensagem aparecer corretamente, tudo está conectado! ✅

---

## 🆘 Troubleshooting

### "CORS error"
- Verificar se a URL está em `ALLOWED_ORIGINS` no backend
- Aguardar 1-2 minutos para redeploy findar

### "Cannot fetch PIX"
- Verificar se o backend está rodando no Render (Status: "Live")
- Verificar variáveis de ambiente no Render

### "PIX gerado mas não aparece"
- Abrir DevTools (F12) → Network
- Verificar se a resposta do `/pix` é um JSON válido
- Verificar `BACKEND_URL` no console

---

## 📞 Links Úteis

- [Render Dashboard](https://dashboard.render.com)
- [Netlify Dashboard](https://app.netlify.com)
- [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- [PostgreSQL Connection String](https://www.postgresql.org/docs/current/libpq-connect.html)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { 
  savePayment, 
  updatePaymentStatus, 
  getPaymentByMercadoPagoId, 
  getAllPayments,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from './db.js';

dotenv.config();

const app = express();

// =======================
// CORS Dinâmico
// =======================
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

// Se não houver origins configuradas, usar padrão
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://localhost:8000'
];

const corsOrigins = ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : defaultOrigins;

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// =======================
// Mercado Pago config
// =======================
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const MP_API_BASE = 'https://api.mercadopago.com/v1';
const PAYER_EMAIL = process.env.PAYER_EMAIL || 'pagamento@ciadecondimentos.com';

// =======================
// Health check
// =======================
app.get('/', (req, res) => {
  res.send('API PIX Mercado Pago rodando 🚀');
});

// =======================
// Função auxiliar para chamar API do Mercado Pago
// =======================
async function createPayment(paymentData) {
  const response = await fetch(`${MP_API_BASE}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

async function getPayment(paymentId) {
  const response = await fetch(`${MP_API_BASE}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// =======================
// Criar pagamento PIX
// =======================
app.post('/pix', async (req, res) => {
  try {
    const { valor, descricao } = req.body;

    if (!valor || Number(valor) <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const result = await createPayment({
      transaction_amount: Number(valor),
      description: descricao || 'Pagamento PIX',
      payment_method_id: 'pix',
      payer: {
        email: PAYER_EMAIL
      }
    });

    // 🔐 Salva no banco de dados PostgreSQL
    await savePayment({
      id: result.id,
      transaction_amount: result.transaction_amount,
      description: descricao || 'Pagamento PIX',
      status: result.status,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code || null,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || null
    });

    res.json({
      id: result.id,
      status: result.status,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code || null,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || null
    });

  } catch (error) {
    console.error('Erro ao gerar PIX:', error?.message || error);
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
});

// =======================
// Consultar status (AGORA PELO BACKEND)
// =======================
app.get('/status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const mpPayment = await getPayment(paymentId);

    // Atualiza no banco de dados
    await updatePaymentStatus(paymentId, mpPayment.status);

    console.log(`📊 Consultando pagamento ${paymentId}: ${mpPayment.status}`);

    return res.json({
      id: mpPayment.id,
      status: mpPayment.status,
      valor: mpPayment.transaction_amount
    });
  } catch (error) {
    console.error('Erro ao consultar status:', error);
    return res.status(500).json({ error: 'Erro ao consultar status' });
  }
});

// =======================
// Webhook Mercado Pago
// =======================
app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];

    if (!signature || !requestId) {
      return res.sendStatus(400);
    }

    const parts = signature.split(',');
    const ts = parts.find(p => p.startsWith('ts=')).split('=')[1];
    const hash = parts.find(p => p.startsWith('v1=')).split('=')[1];

    const manifest = `id:${requestId};ts:${ts};`;

    const hmac = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex');

    if (hmac !== hash) {
      console.warn('Webhook inválido');
      return res.sendStatus(401);
    }

    const paymentId = req.body?.data?.id?.toString();
    if (!paymentId) return res.sendStatus(200);

    const mpPayment = await getPayment(paymentId);

    // 🔄 Atualiza no banco de dados
    await updatePaymentStatus(paymentId, mpPayment.status);

    console.log('📩 Webhook PIX:', {
      id: mpPayment.id,
      status: mpPayment.status,
      valor: mpPayment.transaction_amount
    });

    if (mpPayment.status === 'approved') {
      console.log('✅ PIX CONFIRMADO — pronto pra liberar acesso');
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('Erro no webhook:', error);
    res.sendStatus(500);
  }
});

// =======================
// Listar todos os pagamentos (Admin)
// =======================
app.get('/payments', async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
});

// =======================
// ROTAS DE PRODUTOS
// =======================

// GET /products - Listar todos os produtos
app.get('/products', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// GET /products/:id - Buscar um produto
app.get('/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// POST /products - Criar novo produto
app.post('/products', async (req, res) => {
  try {
    const { name, category, emoji, desc, price } = req.body;

    if (!name || !category || !emoji || !desc || price === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const product = await createProduct(name, category, emoji, desc, price);
    res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// PUT /products/:id - Atualizar produto
app.put('/products/:id', async (req, res) => {
  try {
    const { name, category, emoji, desc, price } = req.body;

    if (!name || !category || !emoji || !desc || price === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const product = await updateProduct(req.params.id, name, category, emoji, desc, price);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// DELETE /products/:id - Deletar produto
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

// =======================
// Porta Render
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

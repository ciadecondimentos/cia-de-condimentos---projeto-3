import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

// ============================================
// Conexão com PostgreSQL
// ============================================
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

client.connect(err => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    initDatabase();
  }
});

// ============================================
// Inicializar Tabela de Pagamentos
// ============================================
async function initDatabase() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        mercado_pago_id VARCHAR(255) UNIQUE NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        descricao TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        qr_code TEXT,
        qr_code_base64 TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('📊 Tabela de pagamentos criada/verificada!');
  } catch (err) {
    console.error('❌ Erro ao criar tabela:', err.message);
  }
}

// ============================================
// Funções para Banco de Dados
// ============================================

export async function savePayment(paymentData) {
  try {
    const result = await client.query(
      `INSERT INTO payments (mercado_pago_id, valor, descricao, status, qr_code, qr_code_base64)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        paymentData.id,
        paymentData.transaction_amount,
        paymentData.description,
        paymentData.status,
        paymentData.qr_code || null,
        paymentData.qr_code_base64 || null
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('❌ Erro ao salvar pagamento:', err.message);
    throw err;
  }
}

export async function updatePaymentStatus(mercadoPagoId, status) {
  try {
    const result = await client.query(
      `UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE mercado_pago_id = $2
       RETURNING *;`,
      [status, mercadoPagoId.toString()]
    );
    return result.rows[0];
  } catch (err) {
    console.error('❌ Erro ao atualizar pagamento:', err.message);
    throw err;
  }
}

export async function getPaymentByMercadoPagoId(mercadoPagoId) {
  try {
    const result = await client.query(
      `SELECT * FROM payments WHERE mercado_pago_id = $1;`,
      [mercadoPagoId.toString()]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('❌ Erro ao buscar pagamento:', err.message);
    throw err;
  }
}

export async function getAllPayments() {
  try {
    const result = await client.query('SELECT * FROM payments ORDER BY created_at DESC;');
    return result.rows;
  } catch (err) {
    console.error('❌ Erro ao buscar pagamentos:', err.message);
    throw err;
  }
}

export default client;

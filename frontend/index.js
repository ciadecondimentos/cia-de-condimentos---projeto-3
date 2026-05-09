// ============================================
// Configuração de Backend
// ============================================
// Detecta automaticamente a URL do backend
// Pode ser sobrescrito com variável de ambiente
const getBackendUrl = () => {
  // Verificar se há URL hardcoded (para testes locais)
  if (window.BACKEND_URL) {
    return window.BACKEND_URL;
  }

  // Usar a URL do backend via variável de ambiente (injetar em tempo de build)
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // Padrão para desenvolvimento local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  // Padrão para produção (ajuste conforme necessário)
  return 'https://cia-condimentos-api.onrender.com';
};

const BACKEND_URL = getBackendUrl();
console.log(`🔗 Backend URL: ${BACKEND_URL}`);

// ============================================
// Base de Produtos (Padrão para uso local)
// ============================================
const defaultProducts = [
  { id: 1, name: 'Pimenta Dedo-de-Moça', category: 'pimentas', emoji: '🌶️', description: 'Pimenta fresca e picante, ideal para molhos e marinadas.', price: 12.90 },
  { id: 2, name: 'Pimenta do Reino Preta', category: 'pimentas', emoji: '⚫', description: 'Grãos inteiros de pimenta negra com aroma intenso.', price: 15.50 },
  { id: 3, name: 'Pimenta Caiena em Pó', category: 'pimentas', emoji: '🔴', description: 'Pimenta caiena moída, picante e versátil.', price: 9.90 },
  { id: 4, name: 'Cúrcuma (Açafrão-da-Terra)', category: 'especiarias', emoji: '🟡', description: 'Especiaria antiinflamatória com cor vibrante e sabor suave.', price: 11.00 },
  { id: 5, name: 'Canela em Pau', category: 'especiarias', emoji: '🟤', description: 'Canela em rama de alta qualidade para sobremesas e chás.', price: 13.90 },
  { id: 6, name: 'Cominho em Pó', category: 'especiarias', emoji: '🫙', description: 'Cominho moído, essencial para temperos nordestinos.', price: 8.50 },
  { id: 7, name: 'Páprica Defumada', category: 'especiarias', emoji: '🧡', description: 'Páprica com toque defumado, perfeita para carnes.', price: 14.80 },
  { id: 8, name: 'Manjericão Seco', category: 'ervas', emoji: '🌿', description: 'Manjericão desidratado com aroma fresco e intenso.', price: 7.90 },
  { id: 9, name: 'Alecrim Desidratado', category: 'ervas', emoji: '🌱', description: 'Alecrim seco ideal para assados e pães artesanais.', price: 8.90 },
  { id: 10, name: 'Orégano Premium', category: 'ervas', emoji: '🍃', description: 'Orégano selecionado, indispensável na cozinha italiana.', price: 6.90 },
  { id: 11, name: 'Tomilho Fresco Seco', category: 'ervas', emoji: '🌾', description: 'Tomilho aromático para sopas, carnes e legumes.', price: 9.20 },
  { id: 12, name: 'Cravo-da-Índia', category: 'especiarias', emoji: '🌰', description: 'Cravo inteiro com aroma marcante para doces e molhos.', price: 10.50 }
];

let products = [...defaultProducts];

// ============================================
// Carregar Produtos da API
// ============================================
async function loadProductsFromAPI() {
  try {
    const response = await fetch(`${BACKEND_URL}/products`);
    if (response.ok) {
      const apiProducts = await response.json();
      if (apiProducts.length > 0) {
        products = apiProducts;
        console.log('✅ Produtos carregados da API:', apiProducts.length);
      }
    }
  } catch (error) {
    console.warn('⚠️ Não foi possível carregar produtos da API, usando padrão:', error.message);
  }
  
  // Renderizar produtos após carregar
  renderProducts();
}

// Carregar produtos quando a página carrega
window.addEventListener('load', () => {
  loadProductsFromAPI();
});

// ============================================
// Estado da App
// ============================================
let cart = [];
let activeFilter = 'todos';
let searchQuery = '';
let currentPaymentId = null;
let pixCheckInterval = null;

// ============================================
// Elementos DOM
// ============================================
const grid = document.getElementById('productsGrid');
const emptyMsg = document.getElementById('emptyMsg');
const cartBadge = document.getElementById('cartBadge');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotalEl = document.getElementById('cartTotal');
const searchInput = document.getElementById('searchInput');
const pixModal = document.getElementById('pixModal');
const pixModalOverlay = document.getElementById('pixModalOverlay');

// ============================================
// Renderizar Produtos
// ============================================
function renderProducts() {
  const q = searchQuery.toLowerCase().trim();
  const filtered = products.filter(p => {
    const matchCategory = activeFilter === 'todos' || p.category === activeFilter;
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = `animation-delay:${i * 0.06}s;animation:fadeUp .45s ease both`;
    card.innerHTML = `
      <div class="card-img">${p.emoji}</div>
      <div class="card-body">
        <span class="card-category">${p.category}</span>
        <div class="card-name">${p.name}</div>
        <p class="card-desc">${p.description}</p>
        <div class="card-footer">
          <span class="card-price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
          <button class="add-btn" data-id="${p.id}">+ Adicionar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ============================================
// Gerenciar Carrinho
// ============================================
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }

  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const count = cart.reduce((sum, c) => sum + c.qty, 0);

  cartBadge.textContent = count;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
    cartFooter.style.display = 'none';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      c => `
    <div class="cart-item">
      <div class="cart-item-icon">${c.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-price">R$ ${(c.price * c.qty).toFixed(2).replace('.', ',')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${c.id},-1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="changeQty(${c.id},1)">+</button>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  cartFooter.style.display = 'flex';
  cartTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

// ============================================
// PIX - Pagamento
// ============================================
async function generatePix() {
  if (cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  // Mostrar modal com carregamento
  openPixModal();

  try {
    console.log('📤 Enviando requisição PIX para:', BACKEND_URL);
    const response = await fetch(`${BACKEND_URL}/pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valor: parseFloat(total.toFixed(2)),
        descricao: `Compra Cia de Condimentos - ${cart.length} itens`
      })
    });

    console.log('📥 Status da resposta:', response.status);

    if (!response.ok) {
      throw new Error(`Erro ao gerar PIX: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PIX gerado:', data);

    currentPaymentId = data.id;

    // Mostrar QR Code
    showPixContent(data);

    // Iniciar polling para verificar pagamento
    startCheckingPaymentStatus();

  } catch (error) {
    console.error('❌ Erro ao gerar PIX:', error);
    showPixError();
  }
}

function showPixContent(pixData) {
  const loading = document.getElementById('pixLoading');
  const content = document.getElementById('pixContent');
  const error = document.getElementById('pixError');

  loading.style.display = 'none';
  error.style.display = 'none';
  content.style.display = 'block';

  // Mostrar QR Code
  if (pixData.qr_code_base64) {
    document.getElementById('qrCodeImg').src = `data:image/png;base64,${pixData.qr_code_base64}`;
  }

  // Mostrar chave Cópia e Cola
  if (pixData.qr_code) {
    document.getElementById('pixKey').value = pixData.qr_code;
  }
}

function showPixError() {
  const loading = document.getElementById('pixLoading');
  const content = document.getElementById('pixContent');
  const error = document.getElementById('pixError');

  loading.style.display = 'none';
  content.style.display = 'none';
  error.style.display = 'block';
}

function openPixModal() {
  const loading = document.getElementById('pixLoading');
  const content = document.getElementById('pixContent');
  const error = document.getElementById('pixError');

  loading.style.display = 'block';
  content.style.display = 'none';
  error.style.display = 'none';

  pixModal.classList.add('visible');
  pixModalOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closePixModal() {
  pixModal.classList.remove('visible');
  pixModalOverlay.classList.remove('visible');
  document.body.style.overflow = '';

  // Parar de verificar pagamento
  stopCheckingPaymentStatus();

  currentPaymentId = null;
}

function startCheckingPaymentStatus() {
  if (!currentPaymentId) return;

  // Verificar a cada 3 segundos
  pixCheckInterval = setInterval(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/status/${currentPaymentId}`);
      if (!response.ok) return;

      const data = await response.json();
      const statusEl = document.getElementById('pixStatus');

      if (data.status === 'approved') {
        statusEl.textContent = '✅ Pagamento Confirmado!';
        statusEl.style.color = '#2ecc71';

        // Limpar carrinho
        cart = [];
        updateCartUI();

        // Fechar após 2 segundos
        setTimeout(() => {
          closePixModal();
          closeCart();
          alert('🎉 Pagamento realizado com sucesso! Sua compra foi confirmada.');
        }, 2000);

        stopCheckingPaymentStatus();
      } else {
        statusEl.textContent = 'Aguardando pagamento...';
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  }, 3000);
}

function stopCheckingPaymentStatus() {
  if (pixCheckInterval) {
    clearInterval(pixCheckInterval);
    pixCheckInterval = null;
  }
}

// ============================================
// Event Listeners
// ============================================

// Filtros de categoria
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderProducts();
  });
});

// Busca
searchInput.addEventListener('input', e => {
  searchQuery = e.target.value;
  renderProducts();
});

// Produtos - Adicionar ao carrinho
grid.addEventListener('click', e => {
  const btn = e.target.closest('.add-btn');
  if (btn) {
    addToCart(Number(btn.dataset.id));
  }
});

// Carrinho
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// PIX Modal
document.getElementById('checkoutBtn').addEventListener('click', generatePix);
document.getElementById('pixModalClose').addEventListener('click', closePixModal);
document.getElementById('pixModalOverlay').addEventListener('click', closePixModal);
document.getElementById('retryPixBtn').addEventListener('click', generatePix);

// Copiar chave PIX
document.getElementById('copyPixKeyBtn').addEventListener('click', () => {
  const pixKey = document.getElementById('pixKey');
  pixKey.select();
  document.execCommand('copy');
  alert('Chave PIX copiada! 📋');
});

// Menu mobile
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});

// Formulário de contato
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  alert('Mensagem enviada com sucesso! 🌶️');
  e.target.reset();
});

// ============================================
// Inicializar App (produtos carregados via loadProductsFromAPI)
// ============================================

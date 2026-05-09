// ============================================
// Configuração do Backend
// ============================================
const getBackendUrl = () => {
  if (window.BACKEND_URL) return window.BACKEND_URL;
  if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return 'https://cia-de-condimentos-projeto-3.onrender.com';
};

const BACKEND_URL = getBackendUrl();
const ADMIN_PASSWORD = 'admin123'; // Senha simples (mude em produção!)

// ============================================
// Verificar Autenticação
// ============================================
window.addEventListener('load', () => {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  if (!isAuthenticated) {
    showLoginModal();
  } else {
    loadProducts();
  }
});

function showLoginModal() {
  const password = prompt('🔐 Senha do Admin:');
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('adminAuth', 'true');
    loadProducts();
  } else {
    alert('❌ Senha incorreta!');
    window.location.href = '/index.html';
  }
}

function logout() {
  localStorage.removeItem('adminAuth');
  window.location.href = '/index.html';
}

// ============================================
// Mostrar/Ocultar Seções
// ============================================
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${sectionId}`).classList.add('active');
}

// ============================================
// Carregar Produtos
// ============================================
async function loadProducts() {
  try {
    const response = await fetch(`${BACKEND_URL}/products`);
    if (!response.ok) throw new Error('Erro ao carregar produtos');

    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Erro:', error);
    showMessage('❌ Erro ao carregar produtos', 'error');
  }
}

function displayProducts(products) {
  const list = document.getElementById('productsList');
  
  if (products.length === 0) {
    list.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#5c3a3a">Nenhum produto cadastrado</p>';
    return;
  }

  list.innerHTML = products.map(p => `
    <div class="product-card">
      <div style="font-size:2rem;margin-bottom:8px">${p.emoji}</div>
      <h4>${p.name}</h4>
      <p>${p.category}</p>
      <p>${p.desc}</p>
      <div class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
      <div class="product-actions">
        <button class="btn-edit" onclick="editProduct(${p.id}, '${p.name}', '${p.category}', '${p.emoji}', '${p.desc.replace(/'/g, "\\'")}', ${p.price})">
          ✏️ Editar
        </button>
        <button class="btn-delete" onclick="deleteProduct(${p.id}, '${p.name}')">
          🗑️ Deletar
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================
// Adicionar Produto
// ============================================
function submitProduct(event) {
  event.preventDefault();

  const product = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    emoji: document.getElementById('emoji').value,
    desc: document.getElementById('desc').value,
    price: parseFloat(document.getElementById('price').value)
  };

  createProduct(product);
}

async function createProduct(product) {
  try {
    const response = await fetch(`${BACKEND_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error('Erro ao criar produto');

    showMessage('✅ Produto adicionado com sucesso!', 'success');
    document.getElementById('productForm').reset();
    setTimeout(() => {
      loadProducts();
      showSection('products');
    }, 1500);
  } catch (error) {
    console.error('Erro:', error);
    showMessage('❌ Erro ao adicionar produto', 'error');
  }
}

// ============================================
// Editar Produto
// ============================================
function editProduct(id, name, category, emoji, desc, price) {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editCategory').value = category;
  document.getElementById('editEmoji').value = emoji;
  document.getElementById('editDesc').value = desc;
  document.getElementById('editPrice').value = price;
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

async function submitEdit(event) {
  event.preventDefault();

  const id = document.getElementById('editId').value;
  const product = {
    name: document.getElementById('editName').value,
    category: document.getElementById('editCategory').value,
    emoji: document.getElementById('editEmoji').value,
    desc: document.getElementById('editDesc').value,
    price: parseFloat(document.getElementById('editPrice').value)
  };

  try {
    const response = await fetch(`${BACKEND_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error('Erro ao editar produto');

    closeEditModal();
    showMessage('✅ Produto atualizado com sucesso!', 'success');
    setTimeout(() => loadProducts(), 1500);
  } catch (error) {
    console.error('Erro:', error);
    showMessage('❌ Erro ao editar produto', 'error');
  }
}

// ============================================
// Deletar Produto
// ============================================
async function deleteProduct(id, name) {
  if (!confirm(`Tem certeza que quer deletar "${name}"?`)) return;

  try {
    const response = await fetch(`${BACKEND_URL}/products/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Erro ao deletar produto');

    showMessage('✅ Produto deletado com sucesso!', 'success');
    setTimeout(() => loadProducts(), 1500);
  } catch (error) {
    console.error('Erro:', error);
    showMessage('❌ Erro ao deletar produto', 'error');
  }
}

// ============================================
// Mostrar Mensagens
// ============================================
function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
  setTimeout(() => msg.classList.remove('success', 'error'), 3000);
}

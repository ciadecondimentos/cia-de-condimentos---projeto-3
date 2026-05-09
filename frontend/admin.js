// ============================================
// Configuração do Backend
// ============================================
const getBackendUrl = () => {
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
  const sections = document.querySelectorAll('.section');
  const buttons = document.querySelectorAll('.admin-nav button');
  
  sections.forEach(s => s.classList.remove('active'));
  buttons.forEach(b => b.classList.remove('active'));
  
  const targetSection = document.getElementById(sectionId);
  const targetButton = document.getElementById(`btn-${sectionId}`);
  
  if (targetSection) targetSection.classList.add('active');
  if (targetButton) targetButton.classList.add('active');
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
  if (!list) {
    console.warn('Elemento #productsList não encontrado');
    return;
  }
  
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

  const nameField = document.getElementById('name');
  const categoryField = document.getElementById('category');
  const emojiField = document.getElementById('emoji');
  const descField = document.getElementById('desc');
  const priceField = document.getElementById('price');

  if (!nameField || !categoryField || !emojiField || !descField || !priceField) {
    showMessage('❌ Formulário incompleto', 'error');
    return;
  }

  const product = {
    name: nameField.value,
    category: categoryField.value,
    emoji: emojiField.value,
    desc: descField.value,
    price: parseFloat(priceField.value)
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
    const form = document.getElementById('productForm');
    if (form) form.reset();
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
  const editId = document.getElementById('editId');
  const editName = document.getElementById('editName');
  const editCategory = document.getElementById('editCategory');
  const editEmoji = document.getElementById('editEmoji');
  const editDesc = document.getElementById('editDesc');
  const editPrice = document.getElementById('editPrice');
  const editModal = document.getElementById('editModal');
  
  if (editId) editId.value = id;
  if (editName) editName.value = name;
  if (editCategory) editCategory.value = category;
  if (editEmoji) editEmoji.value = emoji;
  if (editDesc) editDesc.value = desc;
  if (editPrice) editPrice.value = price;
  if (editModal) editModal.classList.add('active');
}

function closeEditModal() {
  const editModal = document.getElementById('editModal');
  if (editModal) editModal.classList.remove('active');
}

async function submitEdit(event) {
  event.preventDefault();

  const editId = document.getElementById('editId');
  const editName = document.getElementById('editName');
  const editCategory = document.getElementById('editCategory');
  const editEmoji = document.getElementById('editEmoji');
  const editDesc = document.getElementById('editDesc');
  const editPrice = document.getElementById('editPrice');

  if (!editId || !editName || !editCategory || !editEmoji || !editDesc || !editPrice) {
    showMessage('❌ Formulário incompleto', 'error');
    return;
  }

  const id = editId.value;
  const product = {
    name: editName.value,
    category: editCategory.value,
    emoji: editEmoji.value,
    desc: editDesc.value,
    price: parseFloat(editPrice.value)
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
  if (!msg) return;
  
  msg.textContent = text;
  msg.className = `message ${type}`;
  setTimeout(() => {
    msg.classList.remove('success', 'error');
  }, 3000);
}

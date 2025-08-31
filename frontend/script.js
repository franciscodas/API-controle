// Verifica se está logado; se não, redireciona para login
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = "login.html";
}
const API_URL = "http://localhost:3000";

const listaProdutos = document.getElementById('lista-produtos');
const form = document.getElementById('form-produto');
const tabelaBody = document.querySelector('#tabela-produtos tbody');
const adc = document.querySelector(".adicionar");

// botão logout
const logoutBtn = document.querySelector('.logoutBtn');
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});
// document.body.insertBefore(logoutBtn, document.body.firstChild);

function adicionar(){
  form.style.display = 'block';
  
}

// Função para carregar produtos
async function carregarProdutos() {
  try {
    const res = await fetch(`${API_URL}/produtos`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      console.error("Erro da API:", res.status);
      return;
    }

    const produtos = await res.json();

    tabelaBody.innerHTML = '';

    if (!produtos || produtos.length === 0) {
      tabelaBody.innerHTML = `<tr><td colspan="5">Nenhum produto cadastrado</td></tr>`;
      return;
    }

    produtos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>
          <button class="menos">-</button>
          <span>${p.quantidade}</span>
          <button class="mais">+</button>
        </td>
        <td>R$ ${p.preco.toFixed(2)}</td>
        <td>R$ ${(p.quantidade * p.preco).toFixed(2)}</td>
        <td><button class="remover">Excluir</button></td>
      `;

      // Botão -
      tr.querySelector('.menos').addEventListener('click', async () => {
        if (p.quantidade > 0) {
          await atualizarQuantidade(p.id, p.quantidade - 1);
        }
      });

      // Botão +
      tr.querySelector('.mais').addEventListener('click', async () => {
        await atualizarQuantidade(p.id, p.quantidade + 1);
      });

      // Botão remover
      tr.querySelector('.remover').addEventListener('click', async () => {
        await fetch(`${API_URL}/produtos/${p.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        carregarProdutos();
      });

      tabelaBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// Atualizar quantidade
async function atualizarQuantidade(id, novaQtd) {
  await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ quantidade: novaQtd })
  });
  carregarProdutos();
}

// Adicionar produto
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const preco = parseFloat(document.getElementById('preco').value);

  await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ nome, quantidade, preco })
  });

  form.reset();
  carregarProdutos();
  form.style.display = 'none';
});

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
});


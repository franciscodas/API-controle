 // Redireciona se já estiver logado
 if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
  }
console.log(localStorage)
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const msgDiv = document.getElementById('msg');
  const btnregistro = document.querySelector('.fazer_login');  
  const tudo = document.querySelector('.todo');    
  const icone = document.querySelector('.header');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgDiv.textContent = '';
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;

    try {
      const res = await fetch('https://api-controle-2.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.erro || 'Erro ao fazer login');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      window.location.href = 'index.html';
    } catch (error) {
      msgDiv.textContent = error.message;
    }
  });

//   função entrar no pop-up registrar
  function fazer_cadastro(){
    registerForm.style.display = 'block';
    if(registerForm.style.display === 'block'){
      btnregistro.style.display = 'none';
    }
  }

  // entrar no popup
  function entrar(){
    tudo.style.display = 'block';
    if(tudo.style.display === 'block') {
      icone.style.display = 'none';
  }
}

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgDiv.textContent = '';
    const email = document.getElementById('email-register').value;
    const senha = document.getElementById('senha-register').value;

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.erros) {
          throw new Error(errorData.erros.map(e => e.msg).join(', '));
        }
        throw new Error(errorData.erro || 'Erro ao cadastrar');
      }

      msgDiv.style.color = 'green';
      msgDiv.textContent = 'Cadastro realizado com sucesso! Faça login.';
      registerForm.reset();
      registerForm.style.display = 'none'
      btnregistro.style.display = 'none';
    } catch (error) {
      msgDiv.style.color = 'red';
      msgDiv.textContent = error.message;
    }
  });
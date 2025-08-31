const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('./database');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
const port = 3000;

app.use(express.json());

const JWT_SECRET = 'segredo-super-seguro'; // Troque isso por uma env var em produção

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rota raiz, serve o index.html explicitamente
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  });

// Listar todos os produtos
app.get('/produtos', autenticarToken, (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(rows);
  });
});

// registro de login
app.post('/auth/register',
  body('email').isEmail().withMessage('E-mail inválido'),
  body('senha').isLength({ min: 5 }).withMessage('Senha deve ter pelo menos 5 caracteres'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erros: errors.array() });

    const { email, senha } = req.body;

    const senhaHash = bcrypt.hashSync(senha, 10);
    db.run("INSERT INTO usuarios (email, senha) VALUES (?, ?)", [email, senhaHash], function(err) {
      if (err) {
        return res.status(400).json({ erro: "Usuário já existe ou erro ao registrar" });
      }
      res.status(201).json({ msg: "Usuário registrado com sucesso" });
    });
});

// Rota do login
app.post('/auth/login',
  body('email').isEmail(),
  body('senha').isLength({ min: 1 }),
  (req, res) => {
    const { email, senha } = req.body;

    db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, user) => {
      if (err || !user) return res.status(401).json({ erro: "Credenciais inválidas" });

      const senhaValida = bcrypt.compareSync(senha, user.senha);
      if (!senhaValida) return res.status(401).json({ erro: "Senha incorreta" });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
});

// atenthication jwt
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.status(401).json({ erro: 'Token não enviado' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.user = user;
    next();
  });
}


// Adicionar um produto com validação
app.post('/produtos', autenticarToken, 
  body('nome').isLength({ min: 1 }).withMessage('Nome é obrigatório'),
  body('quantidade').isInt({ min: 0 }).withMessage('Quantidade deve ser número inteiro >= 0'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço informado float'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }

    const { nome, quantidade, preco } = req.body;
    db.run("INSERT INTO produtos (nome, quantidade, preco) VALUES (?, ?, ?)", [nome, quantidade, preco], function(err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      res.status(201).json({ id: this.lastID, nome, quantidade, preco });
    });
  }
);


// Atualizar quantidade de produto
app.put('/produtos/:id', autenticarToken, 
  body('quantidade').isInt({ min: 0 }).withMessage('Quantidade deve ser número inteiro >= 0'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }

    const id = parseInt(req.params.id);
    const { quantidade } = req.body;

    db.run("UPDATE produtos SET quantidade = ? WHERE id = ?", [quantidade, id], function(err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      res.json({ id, quantidade });
    });
  }
);

// Deletar produto
app.delete('/produtos/:id', autenticarToken, (req, res) => {
  const id = parseInt(req.params.id);
  db.run("DELETE FROM produtos WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.status(204).send();
  });
});

app.listen(port, () => {
  console.log(`API com banco rodando em http://localhost:${port}`);
});

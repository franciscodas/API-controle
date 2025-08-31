const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./produtos.db');

// Cria as tabelas se não existirem
db.serialize(() => {
  // Tabela de produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
      preco REAL NOT NULL DEFAULT 0.0 CHECK (preco >= 0.0)
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar tabela produtos:", err.message);
    } else {
      console.log("Tabela produtos pronta!");
    }
  });

  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error("Erro ao criar tabela usuarios:", err.message);
    } else {
      console.log("Tabela usuarios pronta!");
    }
  });
});

module.exports = db;
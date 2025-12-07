const bcrypt = require("bcrypt");
const connection = require("../db/db_config");

async function cadastrarUsuario(req, res) {
  try {
    const { nome_completo, email, telefone, senha } = req.body;

    if (!nome_completo || !email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }

    connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });

        if (results.length > 0) {
          return res.status(400).json({ erro: "E-mail já cadastrado!" });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        connection.query(
          "INSERT INTO usuarios (nome_completo, email, telefone, senha) VALUES (?, ?, ?, ?)",
          [nome_completo, email, telefone || null, senhaHash],
          (err, results) => {
            if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });

            return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", id: results.insertId });
          }
        );
      }
    );
  } catch (erro) {
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: erro.message });
  }
}

function listarUsuarios(req, res) {
  connection.query(
    "SELECT id, nome_completo, email, telefone, criado_em FROM usuarios",
    (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
      res.json(results);
    }
  );
}

function atualizarUsuario(req, res) {
  const { id, nome_completo, email, telefone } = req.body;

  if (!id) return res.status(400).json({ erro: "ID do usuário é obrigatório." });

  connection.query(
    "UPDATE usuarios SET nome_completo = ?, email = ?, telefone = ? WHERE id = ?",
    [nome_completo, email, telefone || null, id],
    (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro ao atualizar usuário.", detalhes: err.message });
      res.json({ mensagem: "Usuário atualizado com sucesso!" });
    }
  );
}

module.exports = { cadastrarUsuario, listarUsuarios, atualizarUsuario };

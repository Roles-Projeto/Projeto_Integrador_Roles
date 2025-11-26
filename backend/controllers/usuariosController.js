const bcrypt = require("bcrypt");
const connection = require("../db/db_config");

// Cadastrar novo usuário
exports.cadastrarUsuario = async (req, res) => {
  console.log("📩 Corpo recebido:", req.body);
  const { nome_completo, email, telefone, senha } = req.body;

  if (!nome_completo || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
  }

  try {
    // Verificar se o email já existe
    connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ erro: "Erro no servidor." });
        if (results.length > 0) return res.status(400).json({ erro: "E-mail já cadastrado!" });

        // Criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir usuário
        connection.query(
          "INSERT INTO usuarios (nome_completo, email, telefone, senha) VALUES (?, ?, ?, ?)",
          [nome_completo, email, telefone, senhaHash],
          (err, results) => {
            if (err) {
              console.error("❌ Erro ao inserir no banco:", err);
              return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
            }

            return res.status(201).json({
              mensagem: "Usuário cadastrado com sucesso!",
              id: results.insertId,
            });
          }
        );
      }
    );
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

// Listar usuários
exports.listarUsuarios = (req, res) => {
  connection.query(
    "SELECT id, nome_completo, email, telefone, criado_em FROM usuarios",
    (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor." });
      res.json(results);
    }
  );
};

// Atualizar usuário (PUT)
exports.atualizarUsuario = (req, res) => {
  const { id, nome_completo, email, telefone } = req.body;

  if (!id) {
    return res.status(400).json({ erro: "ID do usuário é obrigatório." });
  }

  connection.query(
    "UPDATE usuarios SET nome_completo = ?, email = ?, telefone = ? WHERE id = ?",
    [nome_completo, email, telefone, id],
    (err, results) => {
      if (err) {
        console.error("❌ Erro ao atualizar usuário:", err);
        return res.status(500).json({ erro: "Erro ao atualizar usuário." });
      }

      return res.json({ mensagem: "Usuário atualizado com sucesso!" });
    }
  );
};

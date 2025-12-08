const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../db/db_config");

exports.loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: "Preencha email e senha." });

  connection.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
      if (results.length === 0) return res.status(400).json({ erro: "Email não cadastrado." });

      const usuario = results[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) return res.status(400).json({ erro: "Senha incorreta." });

      const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: "2h" });

      // ✅ Retornando também os dados do usuário
      res.json({
        mensagem: "Login realizado com sucesso!",
        token,
        id: usuario.id,
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        telefone: usuario.telefone,
        foto_perfil: usuario.foto_perfil
      });
    }
  );
};

exports.loginEmpresario = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: "Preencha email e senha." });

  connection.query(
    "SELECT * FROM empresarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
      if (results.length === 0) return res.status(400).json({ erro: "Email não cadastrado." });

      const empresario = results[0];
      const senhaValida = await bcrypt.compare(senha, empresario.senha);
      if (!senhaValida) return res.status(400).json({ erro: "Senha incorreta." });

      const token = jwt.sign({ id: empresario.id, email: empresario.email }, process.env.JWT_SECRET, { expiresIn: "2h" });

      // ✅ Retornando também os dados do empresário
      res.json({
        mensagem: "Login realizado com sucesso!",
        token,
        id: empresario.id,
        nome_estabelecimento: empresario.nome_estabelecimento,
        email: empresario.email,
        telefone: empresario.telefone,
        foto_perfil: empresario.foto_perfil
      });
    }
  );
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../db/db_config");

exports.loginUsuario = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: "Preencha email e senha." });

  connection.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor." });
      if (results.length === 0) return res.status(400).json({ erro: "Email não cadastrado." });

      const usuario = results[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) return res.status(400).json({ erro: "Senha incorreta." });

      const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
      res.json({ mensagem: "Login realizado com sucesso!", token });
    }
  );
};

exports.loginEmpresario = (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: "Preencha email e senha." });

  connection.query(
    "SELECT * FROM empresarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor." });
      if (results.length === 0) return res.status(400).json({ erro: "Email não cadastrado." });

      const empresario = results[0];
      const senhaValida = await bcrypt.compare(senha, empresario.senha);
      if (!senhaValida) return res.status(400).json({ erro: "Senha incorreta." });

      const token = jwt.sign({ id: empresario.id, email: empresario.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
      res.json({ mensagem: "Login realizado com sucesso!", token });
    }
  );
};

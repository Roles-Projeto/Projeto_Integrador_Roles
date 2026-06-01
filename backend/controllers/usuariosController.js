console.log("🔥 CONTROLLER CARREGADO - CAMINHO:", __filename);

const bcrypt = require("bcrypt");
const connection = require("../db/db_config");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// ========================
// GERAR CÓDIGO ALEATÓRIO
// ========================
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========================
// ENVIAR EMAIL (RESEND)
// ========================
async function enviarEmailCodigo(email, codigo) {
  console.log("📩 TENTANDO ENVIAR EMAIL PARA:", email);
  console.log("🔑 CÓDIGO GERADO:", codigo);

  const { data, error } = await resend.emails.send({
    from: "Roles App <onboarding@resend.dev>",
    to: email,
    subject: "Seu codigo de verificacao - Roles",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #333;">Verificacao de Conta 🎉</h2>
        <p style="color: #555;">Use o codigo abaixo para ativar sua conta:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #6c3dff;">${codigo}</span>
        </div>
        <p style="color: #999; font-size: 13px;">Este codigo expira em 10 minutos. Se voce nao solicitou isso, ignore este email.</p>
      </div>
    `
  });

  if (error) throw new Error(error.message);
  console.log("✅ EMAIL ENVIADO!", data);
  return data;
}

// ========================
// CADASTRAR USUÁRIO (2FA)
// ========================
async function cadastrarUsuario(req, res) {
  console.log("🔥 CHEGOU NO CONTROLLER cadastrarUsuario");

  try {
    const { nome_completo, email, telefone, senha } = req.body;

    if (!nome_completo || !email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatorios." });
    }

    connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.log("❌ ERRO SELECT:", err);
        return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ erro: "E-mail ja cadastrado!" });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const codigo = gerarCodigo();

      console.log("🔑 CÓDIGO GERADO:", codigo);
      console.log("🔥 VAI INSERIR USUÁRIO...");

      connection.query(
        `INSERT INTO usuarios (nome_completo, email, telefone, senha, codigo_verificacao, verificado) VALUES (?, ?, ?, ?, ?, 0)`,
        [nome_completo, email, telefone || null, senhaHash, codigo],
        async (err, insertResult) => {
          console.log("🔥 ENTROU NO CALLBACK DO INSERT");

          if (err) {
            console.log("❌ ERRO INSERT:", err);
            return res.status(500).json({ erro: "Erro no banco ao cadastrar usuario.", detalhes: err.message });
          }

          console.log("✅ USUÁRIO INSERIDO COM SUCESSO");

          try {
            await enviarEmailCodigo(email, codigo);
            return res.status(201).json({ mensagem: "Usuario criado! Codigo enviado por email.", id: insertResult.insertId });
          } catch (erroEmail) {
            console.error("❌ ERRO AO ENVIAR EMAIL:", erroEmail.message);
            return res.status(201).json({
              mensagem: "Usuario criado, mas houve erro ao enviar o email. Use o reenvio.",
              id: insertResult.insertId,
              avisoEmail: erroEmail.message
            });
          }
        }
      );
    });
  } catch (erro) {
    console.log("❌ ERRO GERAL:", erro);
    return res.status(500).json({ erro: "Erro interno do servidor", detalhes: erro.message });
  }
}

// ========================
// LISTAR USUÁRIOS
// ========================
function listarUsuarios(req, res) {
  connection.query("SELECT id, nome_completo, email, telefone, criado_em FROM usuarios", (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
    res.json(results);
  });
}

// ========================
// ATUALIZAR USUÁRIO
// ========================
function atualizarUsuario(req, res) {
  const { id, nome_completo, sobrenome, email, telefone, foto_perfil, cpf, nascimento, sexo } = req.body;

  if (!id) return res.status(400).json({ erro: "ID do usuario e obrigatorio." });

  connection.query(
    "UPDATE usuarios SET nome_completo = ?, sobrenome = ?, email = ?, telefone = ?, foto_perfil = ?, cpf = ?, nascimento = ?, sexo = ? WHERE id = ?",
    [nome_completo, sobrenome || null, email, telefone || null, foto_perfil || null, cpf || null, nascimento || null, sexo || null, id],
    (err) => {
      if (err) return res.status(500).json({ erro: "Erro ao atualizar usuario.", detalhes: err.message });
      res.json({ mensagem: "Usuario atualizado com sucesso!" });
    }
  );
}

// ========================
// BUSCAR USUÁRIO POR ID
// ========================
function buscarUsuarioPorId(req, res) {
  const { id } = req.params;

  if (!id) return res.status(400).json({ erro: "ID do usuario e obrigatorio." });

  connection.query(
    "SELECT id, nome_completo, sobrenome, email, telefone, foto_perfil, cpf, nascimento, sexo FROM usuarios WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ erro: "Erro ao buscar usuario.", detalhes: err.message });
      if (results.length === 0) return res.status(404).json({ erro: "Usuario nao encontrado." });
      res.json(results[0]);
    }
  );
}

// ========================
// ENVIAR CÓDIGO (REENVIO)
// ========================
function enviarCodigo(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: "E-mail obrigatorio." });

  const codigo = gerarCodigo();

  connection.query("UPDATE usuarios SET codigo_verificacao = ? WHERE email = ?", [codigo, email], async (err, result) => {
    if (err) return res.status(500).json({ erro: "Erro no banco.", detalhes: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ erro: "Usuario nao encontrado." });

    try {
      await enviarEmailCodigo(email, codigo);
      res.json({ mensagem: "Codigo enviado com sucesso!" });
    } catch (erroEmail) {
      console.error("❌ ERRO AO REENVIAR EMAIL:", erroEmail.message);
      res.status(500).json({ erro: "Erro ao enviar e-mail.", detalhes: erroEmail.message });
    }
  });
}

// ========================
// VERIFICAR CÓDIGO
// ========================
function verificarCodigo(req, res) {
  const { email, codigo } = req.body;
  if (!email || !codigo) return res.status(400).json({ erro: "Email e codigo sao obrigatorios" });

  connection.query("SELECT codigo_verificacao, verificado FROM usuarios WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no servidor", detalhes: err.message });
    if (results.length === 0) return res.status(404).json({ erro: "Usuario nao encontrado" });

    const usuario = results[0];
    if (usuario.verificado) return res.json({ verificado: true });
    if (usuario.codigo_verificacao !== codigo) return res.json({ verificado: false });

    connection.query("UPDATE usuarios SET verificado = 1, codigo_verificacao = NULL WHERE email = ?", [email], (err) => {
      if (err) return res.status(500).json({ erro: "Erro ao atualizar usuario" });
      return res.json({ verificado: true });
    });
  });
}

// ========================
// RECUPERAR SENHA
// ========================
async function recuperarSenha(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: "E-mail obrigatorio." });

  const codigo = gerarCodigo();
  const expira = new Date(Date.now() + 10 * 60 * 1000);

  connection.query(
    "UPDATE usuarios SET codigo_recuperacao = ?, codigo_expira_em = ? WHERE email = ?",
    [codigo, expira, email],
    async (err, result) => {
      if (err) return res.status(500).json({ erro: "Erro no servidor", detalhes: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ erro: "Usuario nao encontrado" });

      try {
        await resend.emails.send({
          from: "Roles App <onboarding@resend.dev>",
          to: email,
          subject: "Recuperacao de senha - Roles",
          html: `
            <div style="font-family: Arial; padding: 30px;">
              <h2>Recuperacao de senha</h2>
              <p>Use o codigo abaixo para redefinir sua senha:</p>
              <div style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #6c3dff; margin: 20px 0;">
                ${codigo}
              </div>
              <p>Esse codigo expira em 10 minutos.</p>
            </div>
          `
        });
        res.json({ mensagem: "Codigo enviado no e-mail." });
      } catch (erroEmail) {
        console.log(erroEmail);
        res.status(500).json({ erro: "Erro ao enviar e-mail." });
      }
    }
  );
}

// ========================
// REDEFINIR SENHA
// ========================
async function redefinirSenha(req, res) {
  const { email, codigo, novaSenha } = req.body;
  if (!email || !codigo || !novaSenha) return res.status(400).json({ erro: "Preencha todos os campos." });

  connection.query("SELECT codigo_recuperacao, codigo_expira_em FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro no servidor" });
    if (results.length === 0) return res.status(404).json({ erro: "Usuario nao encontrado" });

    const usuario = results[0];
    if (usuario.codigo_recuperacao !== codigo) return res.status(400).json({ erro: "Codigo invalido" });
    if (new Date() > new Date(usuario.codigo_expira_em)) return res.status(400).json({ erro: "Codigo expirado" });

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    connection.query(
      "UPDATE usuarios SET senha = ?, codigo_recuperacao = NULL, codigo_expira_em = NULL WHERE email = ?",
      [senhaHash, email],
      (err) => {
        if (err) return res.status(500).json({ erro: "Erro ao atualizar senha" });
        res.json({ mensagem: "Senha redefinida com sucesso!" });
      }
    );
  });
}

// ========================
// EXPORTS
// ========================
module.exports = {
  cadastrarUsuario,
  listarUsuarios,
  atualizarUsuario,
  buscarUsuarioPorId,
  enviarCodigo,
  verificarCodigo,
  recuperarSenha,
  redefinirSenha
};
console.log("🔥 CONTROLLER CARREGADO - CAMINHO:", __filename);

const bcrypt = require("bcrypt");
const connection = require("../db/db_config");
const nodemailer = require("nodemailer");

// ========================
// TRANSPORTER EMAIL
// ========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true para 465, false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // evita erros de certificado em dev
  }
});

// ========================
// GERAR CÓDIGO ALEATÓRIO
// ========================
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========================
// ENVIAR EMAIL (REUTILIZÁVEL INTERNAMENTE)
// ========================
async function enviarEmailCodigo(email, codigo) {
  console.log("📩 TENTANDO ENVIAR EMAIL PARA:", email);
  console.log("🔑 CÓDIGO GERADO:", codigo);

  const info = await transporter.sendMail({
    from: `"Rolês App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Seu código de verificação - Rolês",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #333;">Verificação de Conta 🎉</h2>
        <p style="color: #555;">Use o código abaixo para ativar sua conta:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #6c3dff;">${codigo}</span>
        </div>
        <p style="color: #999; font-size: 13px;">Este código expira em 10 minutos. Se você não solicitou isso, ignore este email.</p>
      </div>
    `
  });

  console.log("✅ EMAIL ENVIADO! Message ID:", info.messageId);
  return info;
}


// ========================
// CADASTRAR USUÁRIO (2FA)
// ========================
async function cadastrarUsuario(req, res) {
  console.log("🔥 CHEGOU NO CONTROLLER cadastrarUsuario");

  try {
    const { nome_completo, email, telefone, senha } = req.body;

    if (!nome_completo || !email || !senha) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatórios."
      });
    }

    connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, results) => {

        if (err) {
          console.log("❌ ERRO SELECT:", err);
          return res.status(500).json({
            erro: "Erro no servidor.",
            detalhes: err.message
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            erro: "E-mail já cadastrado!"
          });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const codigo = gerarCodigo();

        console.log("🔑 CÓDIGO GERADO:", codigo);
        console.log("🔥 VAI INSERIR USUÁRIO...");

        connection.query(
          `INSERT INTO usuarios 
          (nome_completo, email, telefone, senha, codigo_verificacao, verificado) 
          VALUES (?, ?, ?, ?, ?, 0)`,
          [nome_completo, email, telefone || null, senhaHash, codigo],
          async (err, insertResult) => {

            console.log("🔥 ENTROU NO CALLBACK DO INSERT");

            if (err) {
              console.log("❌ ERRO INSERT:", err);
              return res.status(500).json({
                erro: "Erro no banco ao cadastrar usuário.",
                detalhes: err.message
              });
            }

            console.log("✅ USUÁRIO INSERIDO COM SUCESSO");

            try {
              await enviarEmailCodigo(email, codigo);

              return res.status(201).json({
                mensagem: "Usuário criado! Código enviado por email.",
                id: insertResult.insertId
              });

            } catch (erroEmail) {
              console.error("❌ ERRO AO ENVIAR EMAIL:", erroEmail.message);
              console.error("❌ DETALHES ERRO EMAIL:", erroEmail);

              // Usuário foi criado, mas email falhou — retorna aviso
              return res.status(201).json({
                mensagem: "Usuário criado, mas houve erro ao enviar o email. Use o reenvio.",
                id: insertResult.insertId,
                avisoEmail: erroEmail.message
              });
            }
          }
        );
      }
    );

  } catch (erro) {
    console.log("❌ ERRO GERAL:", erro);

    return res.status(500).json({
      erro: "Erro interno do servidor",
      detalhes: erro.message
    });
  }
}


// ========================
// LISTAR USUÁRIOS
// ========================
function listarUsuarios(req, res) {
  connection.query(
    "SELECT id, nome_completo, email, telefone, criado_em FROM usuarios",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          erro: "Erro no servidor.",
          detalhes: err.message
        });
      }

      res.json(results);
    }
  );
}


// ========================
// ATUALIZAR USUÁRIO
// ========================
function atualizarUsuario(req, res) {
  const { id, nome_completo, email, telefone } = req.body;

  if (!id) {
    return res.status(400).json({ erro: "ID do usuário é obrigatório." });
  }

  connection.query(
    "UPDATE usuarios SET nome_completo = ?, email = ?, telefone = ? WHERE id = ?",
    [nome_completo, email, telefone || null, id],
    (err) => {
      if (err) {
        return res.status(500).json({
          erro: "Erro ao atualizar usuário.",
          detalhes: err.message
        });
      }

      res.json({ mensagem: "Usuário atualizado com sucesso!" });
    }
  );
}


// ========================
// BUSCAR USUÁRIO POR ID
// ========================
function buscarUsuarioPorId(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ erro: "ID do usuário é obrigatório." });
  }

  connection.query(
    "SELECT id, nome_completo, email, telefone, foto_perfil FROM usuarios WHERE id = ?",
    [id],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro ao buscar usuário.",
          detalhes: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
      }

      res.json(results[0]);
    }
  );
}


// ========================
// ENVIAR CÓDIGO (REENVIO)
// ========================
function enviarCodigo(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: "E-mail obrigatório." });
  }

  const codigo = gerarCodigo();

  connection.query(
    "UPDATE usuarios SET codigo_verificacao = ? WHERE email = ?",
    [codigo, email],
    async (err, result) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro no banco.",
          detalhes: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
      }

      try {
        await enviarEmailCodigo(email, codigo);
        res.json({ mensagem: "Código enviado com sucesso!" });

      } catch (erroEmail) {
        console.error("❌ ERRO AO REENVIAR EMAIL:", erroEmail.message);
        res.status(500).json({
          erro: "Erro ao enviar e-mail.",
          detalhes: erroEmail.message
        });
      }
    }
  );
}


// ========================
// VERIFICAR CÓDIGO
// ========================
function verificarCodigo(req, res) {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({
      erro: "Email e código são obrigatórios"
    });
  }

  connection.query(
    "SELECT codigo_verificacao, verificado FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro no servidor",
          detalhes: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          erro: "Usuário não encontrado"
        });
      }

      const usuario = results[0];

      if (usuario.verificado) {
        return res.json({ verificado: true });
      }

      if (usuario.codigo_verificacao !== codigo) {
        return res.json({ verificado: false });
      }

      connection.query(
        "UPDATE usuarios SET verificado = 1, codigo_verificacao = NULL WHERE email = ?",
        [email],
        (err) => {

          if (err) {
            return res.status(500).json({
              erro: "Erro ao atualizar usuário"
            });
          }

          return res.json({ verificado: true });
        }
      );
    }
  );
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
  verificarCodigo
};
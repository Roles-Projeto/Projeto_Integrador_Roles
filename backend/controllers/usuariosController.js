console.log("ðŸ”¥ CONTROLLER CARREGADO - CAMINHO:", __filename);

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
// GERAR CÃ“DIGO ALEATÃ“RIO
// ========================
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========================
// ENVIAR EMAIL (REUTILIZÃVEL INTERNAMENTE)
// ========================
async function enviarEmailCodigo(email, codigo) {
  console.log("ðŸ“© TENTANDO ENVIAR EMAIL PARA:", email);
  console.log("ðŸ”‘ CÃ“DIGO GERADO:", codigo);

  const info = await transporter.sendMail({
    from: `"RolÃªs App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Seu cÃ³digo de verificaÃ§Ã£o - RolÃªs",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #333;">VerificaÃ§Ã£o de Conta ðŸŽ‰</h2>
        <p style="color: #555;">Use o cÃ³digo abaixo para ativar sua conta:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #6c3dff;">${codigo}</span>
        </div>
        <p style="color: #999; font-size: 13px;">Este cÃ³digo expira em 10 minutos. Se vocÃª nÃ£o solicitou isso, ignore este email.</p>
      </div>
    `
  });

  console.log("âœ… EMAIL ENVIADO! Message ID:", info.messageId);
  return info;
}


// ========================
// CADASTRAR USUÃRIO (2FA)
// ========================
async function cadastrarUsuario(req, res) {
  console.log("ðŸ”¥ CHEGOU NO CONTROLLER cadastrarUsuario");

  try {
    const { nome_completo, email, telefone, senha } = req.body;

    if (!nome_completo || !email || !senha) {
      return res.status(400).json({
        erro: "Preencha todos os campos obrigatÃ³rios."
      });
    }

    connection.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, results) => {

        if (err) {
          console.log("âŒ ERRO SELECT:", err);
          return res.status(500).json({
            erro: "Erro no servidor.",
            detalhes: err.message
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            erro: "E-mail jÃ¡ cadastrado!"
          });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const codigo = gerarCodigo();

        console.log("ðŸ”‘ CÃ“DIGO GERADO:", codigo);
        console.log("ðŸ”¥ VAI INSERIR USUÃRIO...");

        connection.query(
          `INSERT INTO usuarios 
          (nome_completo, email, telefone, senha, codigo_verificacao, verificado) 
          VALUES (?, ?, ?, ?, ?, 0)`,
          [nome_completo, email, telefone || null, senhaHash, codigo],
          async (err, insertResult) => {

            console.log("ðŸ”¥ ENTROU NO CALLBACK DO INSERT");

            if (err) {
              console.log("âŒ ERRO INSERT:", err);
              return res.status(500).json({
                erro: "Erro no banco ao cadastrar usuÃ¡rio.",
                detalhes: err.message
              });
            }

            console.log("âœ… USUÃRIO INSERIDO COM SUCESSO");

            try {
              await enviarEmailCodigo(email, codigo);

              return res.status(201).json({
                mensagem: "UsuÃ¡rio criado! CÃ³digo enviado por email.",
                id: insertResult.insertId
              });

            } catch (erroEmail) {
              console.error("âŒ ERRO AO ENVIAR EMAIL:", erroEmail.message);
              console.error("âŒ DETALHES ERRO EMAIL:", erroEmail);

              // UsuÃ¡rio foi criado, mas email falhou â€” retorna aviso
              return res.status(201).json({
                mensagem: "UsuÃ¡rio criado, mas houve erro ao enviar o email. Use o reenvio.",
                id: insertResult.insertId,
                avisoEmail: erroEmail.message
              });
            }
          }
        );
      }
    );

  } catch (erro) {
    console.log("âŒ ERRO GERAL:", erro);

    return res.status(500).json({
      erro: "Erro interno do servidor",
      detalhes: erro.message
    });
  }
}


// ========================
// LISTAR USUÃRIOS
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
// ATUALIZAR USUÃRIO
// ========================
function atualizarUsuario(req, res) {
  const { id, nome_completo, sobrenome, email, telefone, foto_perfil, cpf, nascimento, sexo } = req.body;

  if (!id) {
    return res.status(400).json({ erro: "ID do usuÃ¡rio Ã© obrigatÃ³rio." });
  }

  connection.query(
    "UPDATE usuarios SET nome_completo = ?, sobrenome = ?, email = ?, telefone = ?, foto_perfil = ?, cpf = ?, nascimento = ?, sexo = ? WHERE id = ?",
[nome_completo, sobrenome || null, email, telefone || null, foto_perfil || null, cpf || null, nascimento || null, sexo || null, id],
    (err) => {
      if (err) {
        return res.status(500).json({
          erro: "Erro ao atualizar usuÃ¡rio.",
          detalhes: err.message
        });
      }

      res.json({ mensagem: "UsuÃ¡rio atualizado com sucesso!" });
    }
  );
}


// ========================
// BUSCAR USUÃRIO POR ID
// ========================
function buscarUsuarioPorId(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ erro: "ID do usuÃ¡rio Ã© obrigatÃ³rio." });
  }

  connection.query(
    "SELECT id, nome_completo, email, telefone, foto_perfil FROM usuarios WHERE id = ?",
    [id],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro ao buscar usuÃ¡rio.",
          detalhes: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ erro: "UsuÃ¡rio nÃ£o encontrado." });
      }

      res.json(results[0]);
    }
  );
}


// ========================
// ENVIAR CÃ“DIGO (REENVIO)
// ========================
function enviarCodigo(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: "E-mail obrigatÃ³rio." });
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
        return res.status(404).json({ erro: "UsuÃ¡rio nÃ£o encontrado." });
      }

      try {
        await enviarEmailCodigo(email, codigo);
        res.json({ mensagem: "CÃ³digo enviado com sucesso!" });

      } catch (erroEmail) {
        console.error("âŒ ERRO AO REENVIAR EMAIL:", erroEmail.message);
        res.status(500).json({
          erro: "Erro ao enviar e-mail.",
          detalhes: erroEmail.message
        });
      }
    }
  );
}


// ========================
// VERIFICAR CÃ“DIGO
// ========================
function verificarCodigo(req, res) {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({
      erro: "Email e cÃ³digo sÃ£o obrigatÃ³rios"
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
          erro: "UsuÃ¡rio nÃ£o encontrado"
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
              erro: "Erro ao atualizar usuÃ¡rio"
            });
          }

          return res.json({ verificado: true });
        }
      );
    }
  );
}
// ========================
// RECUPERAR SENHA
// ========================
async function recuperarSenha(req, res) {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      erro: "E-mail obrigatÃ³rio."
    });
  }

  const codigo = gerarCodigo();

  // expira em 10 min
  const expira = new Date(Date.now() + 10 * 60 * 1000);

  connection.query(
    `
    UPDATE usuarios
    SET codigo_recuperacao = ?, codigo_expira_em = ?
    WHERE email = ?
    `,
    [codigo, expira, email],
    async (err, result) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro no servidor",
          detalhes: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          erro: "UsuÃ¡rio nÃ£o encontrado"
        });
      }

      try {

        await transporter.sendMail({
          from: `"RolÃªs App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "RecuperaÃ§Ã£o de senha - RolÃªs",
          html: `
            <div style="font-family: Arial; padding: 30px;">
              <h2>RecuperaÃ§Ã£o de senha</h2>

              <p>Use o cÃ³digo abaixo para redefinir sua senha:</p>

              <div style="
                font-size: 40px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #6c3dff;
                margin: 20px 0;
              ">
                ${codigo}
              </div>

              <p>
                Esse cÃ³digo expira em 10 minutos.
              </p>
            </div>
          `
        });

        res.json({
          mensagem: "CÃ³digo enviado no e-mail."
        });

      } catch (erroEmail) {

        console.log(erroEmail);

        res.status(500).json({
          erro: "Erro ao enviar e-mail."
        });

      }

    }
  );

}

// ========================
// REDEFINIR SENHA
// ========================
async function redefinirSenha(req, res) {

  const { email, codigo, novaSenha } = req.body;

  if (!email || !codigo || !novaSenha) {
    return res.status(400).json({
      erro: "Preencha todos os campos."
    });
  }

  connection.query(
    `
    SELECT codigo_recuperacao, codigo_expira_em
    FROM usuarios
    WHERE email = ?
    `,
    [email],
    async (err, results) => {

      if (err) {
        return res.status(500).json({
          erro: "Erro no servidor"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          erro: "UsuÃ¡rio nÃ£o encontrado"
        });
      }

      const usuario = results[0];

      if (usuario.codigo_recuperacao !== codigo) {
        return res.status(400).json({
          erro: "CÃ³digo invÃ¡lido"
        });
      }

      if (new Date() > new Date(usuario.codigo_expira_em)) {
        return res.status(400).json({
          erro: "CÃ³digo expirado"
        });
      }

      const senhaHash = await bcrypt.hash(novaSenha, 10);

      connection.query(
        `
        UPDATE usuarios
        SET senha = ?,
            codigo_recuperacao = NULL,
            codigo_expira_em = NULL
        WHERE email = ?
        `,
        [senhaHash, email],
        (err) => {

          if (err) {
            return res.status(500).json({
              erro: "Erro ao atualizar senha"
            });
          }

          res.json({
            mensagem: "Senha redefinida com sucesso!"
          });

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
  verificarCodigo,

  recuperarSenha,
  redefinirSenha
};

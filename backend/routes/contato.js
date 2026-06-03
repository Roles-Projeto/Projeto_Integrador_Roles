// =====================================================
//  backend/routes/contato.js
//  POST /contato  — salva no banco + envia e-mail
// =====================================================

const express    = require("express");
const router     = express.Router();
const connection = require("../db/db_config");
const nodemailer = require("nodemailer");

// ── Transporter de e-mail (Gmail SMTP) ──────────────
// No seu .env defina:  EMAIL_USER=seu@gmail.com  EMAIL_PASS=sua_senha_de_app
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
  family: 4,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ── POST /contato ────────────────────────────────────
router.post("/", async (req, res) => {
    const { nome, email, tipo, assunto, mensagem } = req.body;

    // Validação básica
    if (!nome || !email || !tipo || !assunto || !mensagem) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
    }

    // 1. Salva no banco
    connection.query(
        `INSERT INTO contatos (nome, email, tipo, assunto, mensagem)
         VALUES (?, ?, ?, ?, ?)`,
        [nome.trim(), email.trim(), tipo.trim(), assunto.trim(), mensagem.trim()],
        async (err, result) => {
            if (err) {
                console.error("Erro ao salvar contato:", err.message);
                return res.status(500).json({ erro: "Erro ao salvar mensagem." });
            }

            // 2. Envia e-mail de notificação para o suporte
            try {
                await transporter.sendMail({
                    from: `"Rolês Contato" <${process.env.EMAIL_USER}>`,
                    to:   process.env.EMAIL_USER,   // roles.suporte@gmail.com
                    replyTo: email,
                    subject: `[Rolês] ${tipo.toUpperCase()} – ${assunto}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e2e2;border-radius:10px;overflow:hidden;">
                            <div style="background:#0c0c1d;padding:20px 28px;">
                                <h2 style="color:#fff;margin:0;font-size:18px;">Nova mensagem de contato</h2>
                            </div>
                            <div style="padding:24px 28px;">
                                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                                    <tr><td style="padding:6px 0;color:#888;width:110px;">Nome</td><td style="padding:6px 0;font-weight:600;">${nome}</td></tr>
                                    <tr><td style="padding:6px 0;color:#888;">E-mail</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#6d28d9;">${email}</a></td></tr>
                                    <tr><td style="padding:6px 0;color:#888;">Motivo</td><td style="padding:6px 0;">${tipo}</td></tr>
                                    <tr><td style="padding:6px 0;color:#888;">Assunto</td><td style="padding:6px 0;">${assunto}</td></tr>
                                </table>
                                <hr style="border:none;border-top:1px solid #f0f0f0;margin:16px 0;">
                                <p style="color:#888;font-size:12px;margin:0 0 8px;">Mensagem:</p>
                                <p style="background:#f8f8f8;padding:14px;border-radius:8px;font-size:14px;line-height:1.6;margin:0;">${mensagem.replace(/\n/g, "<br>")}</p>
                            </div>
                            <div style="background:#fafafa;padding:12px 28px;border-top:1px solid #f0f0f0;">
                                <p style="margin:0;font-size:11px;color:#bbb;">ID da mensagem: #${result.insertId} — Rolês Plataforma</p>
                            </div>
                        </div>
                    `,
                });
            } catch (mailErr) {
                // E-mail falhou mas mensagem já está salva — não bloqueia a resposta
                console.error("Aviso: e-mail não enviado:", mailErr.message);
            }

            // 3. Envia e-mail de confirmação para o usuário
            try {
                await transporter.sendMail({
                    from: `"Rolês" <${process.env.EMAIL_USER}>`,
                    to:   email,
                    subject: `Recebemos sua mensagem – ${assunto}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e2e2;border-radius:10px;overflow:hidden;">
                            <div style="background:#0c0c1d;padding:20px 28px;">
                                <h2 style="color:#fff;margin:0;font-size:18px;">Rolês</h2>
                            </div>
                            <div style="padding:24px 28px;">
                                <p style="font-size:15px;margin:0 0 12px;">Olá, <strong>${nome}</strong>!</p>
                                <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 16px;">
                                    Recebemos sua mensagem sobre <strong>${assunto}</strong> e retornaremos em até <strong>24 horas em dias úteis</strong>.
                                </p>
                                <div style="background:#f8f8f8;padding:14px;border-radius:8px;font-size:13px;color:#888;">
                                    Protocolo: <strong>#${result.insertId}</strong>
                                </div>
                            </div>
                            <div style="background:#fafafa;padding:12px 28px;border-top:1px solid #f0f0f0;">
                                <p style="margin:0;font-size:11px;color:#bbb;">Rolês Plataforma — roles.suporte@gmail.com</p>
                            </div>
                        </div>
                    `,
                });
            } catch (mailErr) {
                console.error("Aviso: confirmação ao usuário não enviada:", mailErr.message);
            }

            res.status(201).json({
                mensagem: "Contato recebido com sucesso!",
                id: result.insertId,
            });
        }
    );
});

module.exports = router;


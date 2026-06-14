"use strict";

const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const db         = require("../db/db_config");
const nodemailer = require("nodemailer");

/* ════════════════════════════════════════
   EMAIL
════════════════════════════════════════ */
async function enviarEmail(para, assunto, html) {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      family: 4,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Rolês" <${process.env.EMAIL_USER}>`,
      to: para, subject: assunto, html,
    });
  }
}

/* ════════════════════════════════════════
   GARANTE TABELA login_historico
════════════════════════════════════════ */
async function ensureHistoricoTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS login_historico (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id  INT          NOT NULL,
      ip          VARCHAR(64),
      dispositivo VARCHAR(255),
      navegador   VARCHAR(100),
      criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});
}
ensureHistoricoTable();

/* ════════════════════════════════════════
   DETECTAR NAVEGADOR / DISPOSITIVO
════════════════════════════════════════ */
function detectarNavegador(ua) {
  if (!ua) return "Desconhecido";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg"))     return "Edge";
  if (ua.includes("Chrome"))  return "Chrome";
  if (ua.includes("Safari"))  return "Safari";
  return "Navegador";
}

function detectarDispositivo(ua) {
  if (!ua) return "Desktop";
  return /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
}

/* ════════════════════════════════════════
   LOGIN
════════════════════════════════════════ */
exports.loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: "Preencha email e senha." });

  try {
    const results = await db.query(
      "SELECT * FROM usuarios WHERE email = ?", [email]
    );
    if (!results.length)
      return res.status(400).json({ erro: "Email não cadastrado." });

    const usuario = results[0];

    if (!usuario.verificado)
      return res.status(403).json({
        erro: "Conta não verificada. Verifique o código enviado por email.",
      });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida)
      return res.status(400).json({ erro: "Senha incorreta." });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // ── Dados do dispositivo ──
    const ua             = req.headers["user-agent"] || "";
    const ip             = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "—";
    const navegador      = detectarNavegador(ua);
    const dispositivo    = detectarDispositivo(ua);
    const dispositivoStr = `${navegador} — ${dispositivo}`;

    // ── Salva no histórico ──
    await db.query(
      "INSERT INTO login_historico (usuario_id, ip, dispositivo, navegador) VALUES (?, ?, ?, ?)",
      [usuario.id, ip, dispositivoStr, navegador]
    ).catch(() => {});

    // ── Verifica se é dispositivo novo ──
    const historicoAnterior = await db.query(
      `SELECT id FROM login_historico
       WHERE usuario_id = ? AND dispositivo = ?
       ORDER BY criado_em DESC LIMIT 10`,
      [usuario.id, dispositivoStr]
    ).catch(() => []);

    // Se só tem 1 registro = o que acabou de inserir = dispositivo novo
    const isNovoDispositivo = Array.isArray(historicoAnterior) && historicoAnterior.length === 1;

    // ── Verifica preferência de alerta do usuário ──
    const prefs = await db.query(
      "SELECT alerta_novo_dispositivo FROM usuarios WHERE id = ?",
      [usuario.id]
    ).catch(() => []);

    const alertaAtivo = prefs[0]?.alerta_novo_dispositivo !== 0;

    // ── Envia e-mail se for dispositivo novo e alerta ativo ──
    if (isNovoDispositivo && usuario.email && alertaAtivo) {
      const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
      enviarEmail(
        usuario.email,
        "Novo acesso a sua conta Roles",
        `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#6c3dff;">Novo dispositivo detectado</h2>
          <p>Olá, <strong>${usuario.nome_completo}</strong>!</p>
          <p>Detectamos um acesso à sua conta a partir de um novo dispositivo:</p>
          <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #6c3dff;">
            <p><strong>Dispositivo:</strong> ${dispositivoStr}</p>
            <p><strong>IP:</strong> ${ip}</p>
            <p><strong>Data/Hora:</strong> ${agora}</p>
          </div>
          <p>Se foi você, pode ignorar este e-mail.</p>
          <p>Se não foi você, acesse sua conta e altere sua senha imediatamente.</p>
          <p style="color:#999;font-size:12px;margin-top:24px;">Rolês — Sua plataforma de eventos</p>
        </div>
        `
      ).catch(() => {});
    }

    res.json({
      mensagem:      "Login realizado com sucesso!",
      token,
      id:            usuario.id,
      nome_completo: usuario.nome_completo,
      email:         usuario.email,
      telefone:      usuario.telefone,
      foto_perfil:   usuario.foto_perfil,
      role:          usuario.role,
    });

  } catch (err) {
    console.error("❌ loginUsuario:", err);
    res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
  }
};

/* ════════════════════════════════════════
   HISTÓRICO DE ACESSOS
   GET /usuarios/historico-acessos/:id
════════════════════════════════════════ */
exports.historicoAcessos = async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.query(
      `SELECT id, ip, dispositivo, navegador, criado_em
       FROM login_historico
       WHERE usuario_id = ?
       ORDER BY criado_em DESC
       LIMIT 20`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar histórico.", detalhes: err.message });
  }
};
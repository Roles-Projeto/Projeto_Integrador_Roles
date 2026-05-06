/**
 * =====================================================
 *  ROLÊS — servidor raiz
 *  Compatível com Express 4 e 5
 *
 *  RODAR LOCAL:  npx nodemon server.js
 *  Acesse:       http://localhost:3000/frontend/index.html
 * =====================================================
 */

require("dotenv").config({ path: "./backend/.env" });

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const app = express();

/* ─── Middlewares globais ─── */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ─── Log de requisições ─── */
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

/* ─────────────────────────────────────────────────────
   ARQUIVOS ESTÁTICOS
───────────────────────────────────────────────────── */
function caseInsensitiveStatic(baseDir) {
  return (req, res, next) => {
    const filePath = path.join(baseDir, req.url);
    const dir  = path.dirname(filePath);
    const base = path.basename(filePath).toLowerCase();
    try {
      const files = fs.readdirSync(dir);
      const match = files.find(f => f.toLowerCase() === base);
      if (match) req.url = req.url.replace(path.basename(req.url), match);
    } catch (e) {}
    next();
  };
}

app.use("/frontend", caseInsensitiveStatic(path.join(__dirname, "frontend")));
app.use("/frontend", express.static(path.join(__dirname, "frontend")));
app.use("/uploads",  express.static(path.join(__dirname, "backend", "uploads")));

/* ─────────────────────────────────────────────────────
   ROTAS DA API
───────────────────────────────────────────────────── */
const usuariosRoutes         = require("./backend/routes/usuarios");
const authRoutes             = require("./backend/routes/auth");
const eventosRoutes          = require("./backend/routes/eventos");
const estabelecimentosRoutes = require("./backend/routes/estabelecimentos");
const contatoRoutes          = require("./backend/routes/contato");

app.use("/usuarios",         usuariosRoutes);
app.use("/usuarios",         authRoutes);
app.use("/eventos",          eventosRoutes);
app.use("/estabelecimentos", estabelecimentosRoutes);
app.use("/contato",          contatoRoutes);

/* ─────────────────────────────────────────────────────
   FALLBACK SPA
   Usa app.use() — funciona no Express 4 E 5 sem bug do path-to-regexp
───────────────────────────────────────────────────── */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

/* ─── Handler de erros ─── */
app.use((err, req, res, next) => {
  console.error("❌ ERRO:", err.message);
  res.status(500).json({ erro: "Erro interno.", detalhes: err.message });
});

/* ─── Inicia servidor ─── */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("================================");
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}/frontend/index.html`);
  console.log(`📧 Email: ${process.env.EMAIL_USER || "⚠️ NÃO DEFINIDO"}`);
  console.log("================================");
});
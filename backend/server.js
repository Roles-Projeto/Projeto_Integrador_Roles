require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ========================
// SERVIR FRONTEND ESTÁTICO (case-insensitive)
// ========================
app.use("/frontend", (req, res, next) => {
  const filePath = path.join(__dirname, "frontend", req.url);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath).toLowerCase();
  try {
    const files = fs.readdirSync(dir);
    const match = files.find(f => f.toLowerCase() === base);
    if (match) req.url = req.url.replace(path.basename(req.url), match);
  } catch(e) {}
  next();
}, express.static(path.join(__dirname, "frontend")));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

// ========================
// ROTAS DA API
// ========================
const usuariosRoutes = require("./routes/usuarios");
const authRoutes     = require("./routes/auth");
const eventosRoutes  = require("./routes/eventos");

app.use("/usuarios", usuariosRoutes);
app.use("/usuarios", authRoutes);
app.use("/eventos", eventosRoutes);

// Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.use((err, req, res, next) => {
  console.error("❌ ERRO NÃO TRATADO:", err.message);
  res.status(500).json({ erro: "Erro interno do servidor.", detalhes: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("================================");
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📧 Email configurado: ${process.env.EMAIL_USER || "⚠️ NÃO DEFINIDO"}`);
  console.log("================================");
});
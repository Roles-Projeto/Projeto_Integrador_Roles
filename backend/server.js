require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

// ========================
// ROTAS DA API
// ========================
const usuariosRoutes = require("./routes/usuarios");
const authRoutes     = require("./routes/auth");

app.use("/usuarios", usuariosRoutes);
app.use("/usuarios", authRoutes);

// ========================
// SERVIR FRONTEND ESTÁTICO
// ========================
app.use(express.static(path.join(__dirname, "../Frontend")));

// Fallback — qualquer rota não encontrada serve o index.html
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend", "index.html"));
});
// ========================
// TRATAMENTO GLOBAL DE ERROS
// ========================
app.use((err, req, res, next) => {
  console.error("❌ ERRO NÃO TRATADO:", err.message);
  res.status(500).json({ erro: "Erro interno do servidor.", detalhes: err.message });
});

// ========================
// START
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("================================");
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📧 Email configurado: ${process.env.EMAIL_USER || "⚠️ NÃO DEFINIDO"}`);
  console.log("================================");
});
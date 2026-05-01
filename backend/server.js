require("dotenv").config();

const express = require("express");
const cors    = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "online", mensagem: "🚀 API Rolês rodando!" });
});

const usuariosRoutes = require("./routes/usuarios");
const authRoutes     = require("./routes/auth");

app.use("/usuarios", usuariosRoutes);
app.use("/usuarios", authRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.url}` });
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
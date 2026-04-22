require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db/db_config");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors());

// 🔥 SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "../Frontend/index.html")));

// Rotas
const usuariosRoutes = require("./routes/usuarios");
const authRoutes = require("./routes/auth");
const eventosRoutes = require("./routes/eventos");

app.use("/usuarios", usuariosRoutes);
app.use("/eventos", eventosRoutes);
app.use("/", authRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// Teste conexão banco
db.getConnection?.((err, connection) => {
  if (err) {
    console.error("❌ Erro no banco:", err);
  } else {
    console.log("✅ Banco conectado com sucesso!");
    connection.release?.();
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
});
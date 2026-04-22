require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db/db_config");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors());

// 🔥 CAMINHO CORRETO DO FRONTEND
const frontendPath = path.join(process.cwd(), "Frontend");

console.log("Caminho do frontend:", frontendPath);

// SERVIR ARQUIVOS ESTÁTICOS
app.use(express.static(frontendPath));

// ROTAS
const usuariosRoutes = require("./routes/usuarios");
const authRoutes = require("./routes/auth");
const eventosRoutes = require("./routes/eventos");

app.use("/usuarios", usuariosRoutes);
app.use("/eventos", eventosRoutes);
app.use("/", authRoutes);

// ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// TESTE BANCO
db.getConnection?.((err, connection) => {
  if (err) {
    console.error("❌ Erro no banco:", err);
  } else {
    console.log("✅ Banco conectado com sucesso!");
    connection.release?.();
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./db/db_config"); // 👈 IMPORTANTE

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Rotas
const usuariosRoutes = require("./routes/usuarios");
const authRoutes = require("./routes/auth");
const eventosRoutes = require("./routes/eventos");

app.use("/usuarios", usuariosRoutes);
app.use("/eventos", eventosRoutes);
app.use("/", authRoutes);

// Teste API
app.get("/", (req, res) => {
  res.send("Servidor rodando! 🚀");
});

// Teste conexão banco (IMPORTANTE PRA DEBUG)
db.getConnection?.((err, connection) => {
  if (err) {
    console.error("❌ Erro no banco:", err);
  } else {
    console.log("✅ Banco conectado com sucesso!");
    connection.release?.();
  }
});

// Start server (RENDER OBRIGATÓRIO)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
});
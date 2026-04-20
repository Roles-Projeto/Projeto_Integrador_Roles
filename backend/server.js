// server.js  (substitua o seu atual por este)
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" })); // limit maior para suportar imagem em base64
app.use(cors());

// Rotas
const usuariosRoutes = require("./routes/usuarios");
const authRoutes    = require("./routes/auth");
const eventosRoutes = require("./routes/eventos"); // ← NOVO

app.use("/usuarios", usuariosRoutes);
app.use("/eventos",  eventosRoutes);  // ← NOVO
app.use("/", authRoutes);

// Rota inicial
app.get("/", (req, res) => {
  res.send("Servidor rodando! 🚀");
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
});
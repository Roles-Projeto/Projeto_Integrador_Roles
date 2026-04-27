// server.js
require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: ["http://127.0.0.1:5502", "http://localhost:5502", "http://127.0.0.1:5500", "http://localhost:5500"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Rotas
const usuariosRoutes         = require("./routes/usuarios");
const authRoutes             = require("./routes/auth");
const eventosRoutes          = require("./routes/eventos");
const estabelecimentosRoutes = require("./routes/estabelecimentos");

app.use("/usuarios",         usuariosRoutes);
app.use("/eventos",          eventosRoutes);
app.use("/estabelecimentos", estabelecimentosRoutes);
app.use("/",                 authRoutes);

// Rota inicial
app.get("/", (req, res) => {
  res.send("Servidor rodando! 🚀");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
});
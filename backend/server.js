require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rotas
const usuariosRoutes = require("./routes/usuarios");
const empresariosRoutes = require("./routes/empresarios");
const authRoutes = require("./routes/auth");

app.use("/usuarios", usuariosRoutes);
app.use("/empresarios", empresariosRoutes);
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

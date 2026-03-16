const express = require("express");
const router = express.Router();
const empresariosController = require("../controllers/empresariosController");
const verificarToken = require("../middleware/authMiddleware");

// Cadastro de empresário
router.post("/cadastro", empresariosController.cadastrarEmpresario);

// Perfil protegido
router.get("/perfil", verificarToken, empresariosController.perfil);

// Atualizar empresário
router.put("/atualizar/:id", empresariosController.atualizarEmpresario);

// Buscar empresário por id
router.get("/:id", empresariosController.getEmpresarioById);

module.exports = router;

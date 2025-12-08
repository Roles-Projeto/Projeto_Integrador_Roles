const express = require("express");
const router = express.Router();
const empresariosController = require("../controllers/empresariosController");

// Cadastro de empresário
router.post("/cadastro", empresariosController.cadastrarEmpresario);

// Atualização do perfil do empresário
router.put("/atualizar/:id", empresariosController.atualizarEmpresario);
router.get("/:id", empresariosController.getEmpresarioById);


module.exports = router;

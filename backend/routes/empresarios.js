const express = require("express");
const router = express.Router();
const empresariosController = require("../controllers/empresariosController");

// 🚀 Cadastro de empresário
router.post("/cadastro", empresariosController.cadastrarEmpresario);



module.exports = router;

// backend/routes/estabelecimentos.js
const express = require("express");
const router  = express.Router();
const estabelecimentosController = require("../controllers/estabelecimentosController");

router.get("/",      estabelecimentosController.listarEstabelecimentos);
router.get("/:id",   estabelecimentosController.buscarEstabelecimento);
router.post("/",     estabelecimentosController.criarEstabelecimento);
router.put("/:id",   estabelecimentosController.editarEstabelecimento);
router.delete("/:id",estabelecimentosController.excluirEstabelecimento);

module.exports = router;
// backend/routes/evento// backend/routes/eventos.js
const express = require("express");
const router = express.Router();
const eventosController = require("../controllers/eventosController");

router.get("/",     eventosController.listarEventos);
router.get("/:id",  eventosController.buscarEvento);
router.post("/",    eventosController.criarEvento);
router.put("/:id",  eventosController.editarEvento);
router.delete("/:id", eventosController.excluirEvento);

module.exports = router;
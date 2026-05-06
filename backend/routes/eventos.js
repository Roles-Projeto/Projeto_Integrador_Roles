const express = require("express");
const router = express.Router();
const eventosController = require("../controllers/eventosController");

router.post("/upload-imagem", eventosController.upload.single("imagem"), (req, res) => {
    if (!req.file) return res.status(400).json({ erro: "Nenhuma imagem enviada" });
    res.json({ url: `/uploads/${req.file.filename}` });  // ← só o caminho relativo
});

router.get("/",       eventosController.listarEventos);
router.get("/:id",    eventosController.buscarEvento);
router.post("/",      eventosController.criarEvento);
router.put("/:id",    eventosController.editarEvento);
router.delete("/:id", eventosController.excluirEvento);

module.exports = router;
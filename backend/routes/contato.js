const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  console.log("📩 Dados recebidos no backend:", req.body);
  res.status(200).json({ message: "Contato recebido com sucesso!" });
});

module.exports = router;

const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { responsavelNome, cnpj, estabelecimentoNome, planoSelecionado } = req.body;
  console.log("Novo cadastro:", { responsavelNome, cnpj, estabelecimentoNome, planoSelecionado });

  res.json({ sucesso: true, mensagem: `Cadastro do ${estabelecimentoNome} realizado com sucesso!` });
});

module.exports = router;

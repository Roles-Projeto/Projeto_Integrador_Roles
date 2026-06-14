// routes/estabelecimentos.js
const express = require("express");
const router = express.Router();
const db = require("../db/db_config");

function parseRow(row) {
  if (!row) return row;
  try { row.fotos_galeria = JSON.parse(row.fotos_galeria || "[]"); } catch { row.fotos_galeria = []; }
  try { row.pratos = JSON.parse(row.pratos || "[]"); } catch { row.pratos = []; }
  return row;
}

router.get("/", async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT id, nome, tipo, especialidade, faixa_preco, descricao,
             endereco, cidade, estado, bairro, rua, numero,
             telefone, website, comodidades, img_logo, img_capa,
             nota, avaliacoes, categoria_card, visibilidade
      FROM estabelecimentos
      WHERE visibilidade = ?
      ORDER BY criado_em DESC`, ["publico"]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar estabelecimentos:", err);
    res.status(500).json({ erro: "Erro interno ao buscar estabelecimentos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rows = await db.query("SELECT * FROM estabelecimentos WHERE id = ?", [req.params.id]);
    if (!rows || rows.length === 0)
      return res.status(404).json({ erro: "Estabelecimento não encontrado." });
    res.json(parseRow(rows[0]));
  } catch (err) {
    console.error("Erro ao buscar estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao buscar estabelecimento." });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      nome, tipo, especialidade, faixa_preco, capacidade, descricao,
      local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
      endereco, telefone, website, responsavel, cnpj,
      visibilidade, horario, comodidades, img_logo, img_capa,
      categoria_card, fotos_galeria, pratos
    } = req.body;

    if (!nome) return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });

    const result = await db.query(`
      INSERT INTO estabelecimentos
        (nome, tipo, especialidade, faixa_preco, capacidade, descricao,
         local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
         endereco, telefone, website, responsavel, cnpj,
         visibilidade, horario, comodidades, img_logo, img_capa,
         categoria_card, fotos_galeria, pratos)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      nome, tipo, especialidade, faixa_preco, capacidade, descricao,
      local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
      endereco, telefone, website, responsavel, cnpj,
      visibilidade || "publico", horario || "", comodidades,
      img_logo, img_capa, categoria_card,
      JSON.stringify(fotos_galeria || []), JSON.stringify(pratos || [])
    ]);

    res.status(201).json({ mensagem: "Estabelecimento cadastrado com sucesso!", id: result.insertId });
  } catch (err) {
    console.error("Erro ao cadastrar estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao cadastrar estabelecimento." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, tipo, especialidade, faixa_preco, capacidade, descricao,
      local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
      endereco, telefone, website, responsavel, cnpj,
      visibilidade, horario, comodidades, img_logo, img_capa,
      categoria_card, fotos_galeria, pratos
    } = req.body;

    await db.query(`
      UPDATE estabelecimentos SET
        nome=?, tipo=?, especialidade=?, faixa_preco=?, capacidade=?,
        descricao=?, local_nome=?, cep=?, rua=?, numero=?,
        complemento=?, bairro=?, cidade=?, estado=?, endereco=?,
        telefone=?, website=?, responsavel=?, cnpj=?,
        visibilidade=?, horario=?, comodidades=?, img_logo=?,
        img_capa=?, categoria_card=?, fotos_galeria=?, pratos=?
      WHERE id=?`, [
      nome, tipo, especialidade, faixa_preco, capacidade,
      descricao, local_nome, cep, rua, numero,
      complemento, bairro, cidade, estado, endereco,
      telefone, website, responsavel, cnpj,
      visibilidade, horario || "", comodidades, img_logo,
      img_capa, categoria_card,
      JSON.stringify(fotos_galeria || []), JSON.stringify(pratos || []), id
    ]);

    res.json({ mensagem: "Estabelecimento atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar estabelecimento." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM estabelecimentos WHERE id = ?", [req.params.id]);
    res.json({ mensagem: "Estabelecimento removido com sucesso!" });
  } catch (err) {
    console.error("Erro ao remover estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao remover estabelecimento." });
  }
});

module.exports = router;
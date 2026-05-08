// routes/estabelecimentos.js
const express = require("express");
const router = express.Router();
const db = require("../db/db_config");

const isProd = !!process.env.DATABASE_URL;

// Helper: executa query MySQL ou PostgreSQL
function query(sql, params) {
  if (isProd) {
    // PostgreSQL usa $1, $2...
    return db.query(sql, params).then(r => r.rows);
  } else {
    // MySQL usa ?
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

// ── GET /estabelecimentos ── Lista todos os públicos
router.get("/", async (req, res) => {
  try {
    const sql = isProd
      ? `SELECT id, nome, tipo, especialidade, faixa_preco, descricao,
               endereco, cidade, estado, bairro, rua, numero,
               telefone, website, comodidades, img_logo, img_capa,
               nota, avaliacoes, categoria_card, visibilidade
         FROM estabelecimentos
         WHERE visibilidade = 'publico'
         ORDER BY criado_em DESC`
      : `SELECT id, nome, tipo, especialidade, faixa_preco, descricao,
               endereco, cidade, estado, bairro, rua, numero,
               telefone, website, comodidades, img_logo, img_capa,
               nota, avaliacoes, categoria_card, visibilidade
         FROM estabelecimentos
         WHERE visibilidade = 'publico'
         ORDER BY criado_em DESC`;

    const rows = await query(sql, []);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar estabelecimentos:", err);
    res.status(500).json({ erro: "Erro interno ao buscar estabelecimentos." });
  }
});

// ── GET /estabelecimentos/:id ── Detalhe de um estabelecimento
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = isProd
      ? `SELECT * FROM estabelecimentos WHERE id = $1`
      : `SELECT * FROM estabelecimentos WHERE id = ?`;

    const rows = await query(sql, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ erro: "Estabelecimento não encontrado." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao buscar estabelecimento." });
  }
});

// ── POST /estabelecimentos ── Cadastrar novo estabelecimento
router.post("/", async (req, res) => {
  try {
    const {
      nome, tipo, especialidade, faixa_preco, capacidade, descricao,
      local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
      endereco, telefone, website, responsavel, cnpj,
      visibilidade, comodidades, img_logo, img_capa, categoria_card
    } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });
    }

    const sql = isProd
      ? `INSERT INTO estabelecimentos
           (nome, tipo, especialidade, faixa_preco, capacidade, descricao,
            local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
            endereco, telefone, website, responsavel, cnpj,
            visibilidade, comodidades, img_logo, img_capa, categoria_card)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
         RETURNING id`
      : `INSERT INTO estabelecimentos
           (nome, tipo, especialidade, faixa_preco, capacidade, descricao,
            local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
            endereco, telefone, website, responsavel, cnpj,
            visibilidade, comodidades, img_logo, img_capa, categoria_card)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const params = [
      nome, tipo, especialidade, faixa_preco, capacidade, descricao,
      local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
      endereco, telefone, website, responsavel, cnpj,
      visibilidade || "publico", comodidades, img_logo, img_capa, categoria_card
    ];

    const result = await query(sql, params);

    const novoId = isProd ? result[0]?.id : result.insertId;
    res.status(201).json({ mensagem: "Estabelecimento cadastrado com sucesso!", id: novoId });

  } catch (err) {
    console.error("Erro ao cadastrar estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao cadastrar estabelecimento." });
  }
});

// ── PUT /estabelecimentos/:id ── Atualizar estabelecimento
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, tipo, especialidade, faixa_preco, capacidade, descricao,
      local_nome, cep, rua, numero, complemento, bairro, cidade, estado,
      endereco, telefone, website, responsavel, cnpj,
      visibilidade, comodidades, img_logo, img_capa, categoria_card
    } = req.body;

    const sql = isProd
      ? `UPDATE estabelecimentos SET
           nome=$1, tipo=$2, especialidade=$3, faixa_preco=$4, capacidade=$5,
           descricao=$6, local_nome=$7, cep=$8, rua=$9, numero=$10,
           complemento=$11, bairro=$12, cidade=$13, estado=$14, endereco=$15,
           telefone=$16, website=$17, responsavel=$18, cnpj=$19,
           visibilidade=$20, comodidades=$21, img_logo=$22, img_capa=$23,
           categoria_card=$24
         WHERE id=$25`
      : `UPDATE estabelecimentos SET
           nome=?, tipo=?, especialidade=?, faixa_preco=?, capacidade=?,
           descricao=?, local_nome=?, cep=?, rua=?, numero=?,
           complemento=?, bairro=?, cidade=?, estado=?, endereco=?,
           telefone=?, website=?, responsavel=?, cnpj=?,
           visibilidade=?, comodidades=?, img_logo=?, img_capa=?,
           categoria_card=?
         WHERE id=?`;

    const params = [
      nome, tipo, especialidade, faixa_preco, capacidade,
      descricao, local_nome, cep, rua, numero,
      complemento, bairro, cidade, estado, endereco,
      telefone, website, responsavel, cnpj,
      visibilidade, comodidades, img_logo, img_capa,
      categoria_card, id
    ];

    await query(sql, params);
    res.json({ mensagem: "Estabelecimento atualizado com sucesso!" });

  } catch (err) {
    console.error("Erro ao atualizar estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao atualizar estabelecimento." });
  }
});

// ── DELETE /estabelecimentos/:id ── Remover estabelecimento
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = isProd
      ? `DELETE FROM estabelecimentos WHERE id = $1`
      : `DELETE FROM estabelecimentos WHERE id = ?`;

    await query(sql, [id]);
    res.json({ mensagem: "Estabelecimento removido com sucesso!" });
  } catch (err) {
    console.error("Erro ao remover estabelecimento:", err);
    res.status(500).json({ erro: "Erro interno ao remover estabelecimento." });
  }
});

module.exports = router;

// backend/controllers/estabelecimentosController.js
const connection = require("../db/db_config");

// =====================================================
// CRIAR ESTABELECIMENTO
// =====================================================
exports.criarEstabelecimento = (req, res) => {
  const {
    nome, tipo, especialidade, faixa_preco, capacidade,
    descricao, local_nome, cep, rua, numero, complemento,
    bairro, cidade, estado, endereco, telefone, website,
    responsavel, cnpj, visibilidade, comodidades,
    img_logo, img_capa, horarios, pratos, categoria_card,
  } = req.body;

  if (!nome)
    return res.status(400).json({ erro: "O nome do estabelecimento é obrigatório." });

  const sql = `
    INSERT INTO estabelecimentos (
      nome, tipo, especialidade, faixa_preco, capacidade,
      descricao, local_nome, cep, rua, numero, complemento,
      bairro, cidade, estado, endereco, telefone, website,
      responsavel, cnpj, visibilidade, comodidades,
      img_logo, img_capa, categoria_card
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    nome,
    tipo            || null,
    especialidade   || null,
    faixa_preco     || null,
    capacidade      ? parseInt(capacidade) : null,
    descricao       || null,
    local_nome      || null,
    cep             || null,
    rua             || null,
    numero          || null,
    complemento     || null,
    bairro          || null,
    cidade          || null,
    estado          || null,
    endereco        || null,
    telefone        || null,
    website         || null,
    responsavel     || null,
    cnpj            || null,
    visibilidade    || "publico",
    comodidades     ? JSON.stringify(comodidades) : null,
    img_logo        || null,
    img_capa        || null,
    categoria_card  || null,
  ];

  connection.query(sql, valores, (err, result) => {
    if (err)
      return res.status(500).json({ erro: "Erro ao salvar estabelecimento.", detalhes: err.message });

    const estabelecimentoId = result.insertId;

    // Salva horários
    const salvarHorarios = () => new Promise((resolve, reject) => {
      if (!horarios || horarios.length === 0) return resolve();

      const sqlHor = `
        INSERT INTO horarios_estabelecimento (estabelecimento_id, dia, aberto, abertura, fechamento)
        VALUES ?
      `;
      const vals = horarios.map(h => [
        estabelecimentoId,
        h.dia,
        h.aberto ? 1 : 0,
        h.abertura   || null,
        h.fechamento || null,
      ]);

      connection.query(sqlHor, [vals], (errHor) => {
        if (errHor) return reject(errHor);
        resolve();
      });
    });

    // Salva pratos
    const salvarPratos = () => new Promise((resolve, reject) => {
      if (!pratos || pratos.length === 0) return resolve();

      const sqlPratos = `
        INSERT INTO pratos (estabelecimento_id, titulo, categoria, preco, tipo)
        VALUES ?
      `;
      const vals = pratos.map(p => [
        estabelecimentoId,
        p.titulo,
        p.categoria || null,
        p.preco     ? parseFloat(p.preco) : null,
        p.tipo      || "destaque",
      ]);

      connection.query(sqlPratos, [vals], (errP) => {
        if (errP) return reject(errP);
        resolve();
      });
    });

    Promise.all([salvarHorarios(), salvarPratos()])
      .then(() => {
        res.status(201).json({
          mensagem: "Estabelecimento criado com sucesso!",
          estabelecimentoId,
        });
      })
      .catch((errFinal) => {
        res.status(500).json({
          erro: "Estabelecimento salvo, mas erro ao salvar horários/pratos.",
          detalhes: errFinal.message,
        });
      });
  });
};

// =====================================================
// LISTAR ESTABELECIMENTOS
// =====================================================
exports.listarEstabelecimentos = (req, res) => {
  const { busca, categoria, cidade } = req.query;

  let sql = `SELECT * FROM estabelecimentos WHERE visibilidade = 'publico'`;
  const params = [];

  if (busca) {
    sql += ` AND (nome LIKE ? OR bairro LIKE ? OR tipo LIKE ? OR categoria_card LIKE ?)`;
    params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`);
  }
  if (categoria) {
    sql += ` AND categoria_card = ?`;
    params.push(categoria);
  }
  if (cidade) {
    sql += ` AND cidade LIKE ?`;
    params.push(`%${cidade}%`);
  }

  sql += ` ORDER BY criado_em DESC`;

  connection.query(sql, params, (err, results) => {
    if (err)
      return res.status(500).json({ erro: "Erro ao buscar estabelecimentos.", detalhes: err.message });
    res.json(results);
  });
};

// =====================================================
// BUSCAR ESTABELECIMENTO POR ID (com horários e pratos)
// =====================================================
exports.buscarEstabelecimento = (req, res) => {
  const { id } = req.params;

  connection.query(
    "SELECT * FROM estabelecimentos WHERE id = ?",
    [id],
    (err, results) => {
      if (err)
        return res.status(500).json({ erro: "Erro ao buscar estabelecimento." });
      if (results.length === 0)
        return res.status(404).json({ erro: "Estabelecimento não encontrado." });

      const estab = results[0];

      // Busca horários
      connection.query(
        "SELECT * FROM horarios_estabelecimento WHERE estabelecimento_id = ?",
        [id],
        (errH, horarios) => {
          if (errH) return res.status(500).json({ erro: "Erro ao buscar horários." });

          // Busca pratos
          connection.query(
            "SELECT * FROM pratos WHERE estabelecimento_id = ?",
            [id],
            (errP, pratos) => {
              if (errP) return res.status(500).json({ erro: "Erro ao buscar pratos." });

              // Parseia comodidades de volta para array
              try {
                estab.comodidades = estab.comodidades
                  ? JSON.parse(estab.comodidades)
                  : [];
              } catch {
                estab.comodidades = [];
              }

              res.json({ ...estab, horarios, pratos });
            }
          );
        }
      );
    }
  );
};

// =====================================================
// EDITAR ESTABELECIMENTO
// =====================================================
exports.editarEstabelecimento = (req, res) => {
  const { id } = req.params;
  const {
    nome, tipo, especialidade, faixa_preco, capacidade,
    descricao, local_nome, cep, rua, numero, complemento,
    bairro, cidade, estado, endereco, telefone, website,
    responsavel, cnpj, visibilidade, comodidades,
    img_logo, img_capa, categoria_card,
  } = req.body;

  if (!nome)
    return res.status(400).json({ erro: "O nome do estabelecimento é obrigatório." });

  const sql = `
    UPDATE estabelecimentos SET
      nome=?, tipo=?, especialidade=?, faixa_preco=?, capacidade=?,
      descricao=?, local_nome=?, cep=?, rua=?, numero=?, complemento=?,
      bairro=?, cidade=?, estado=?, endereco=?, telefone=?, website=?,
      responsavel=?, cnpj=?, visibilidade=?, comodidades=?,
      img_logo=?, img_capa=?, categoria_card=?
    WHERE id=?
  `;

  const valores = [
    nome, tipo||null, especialidade||null, faixa_preco||null,
    capacidade ? parseInt(capacidade) : null,
    descricao||null, local_nome||null, cep||null, rua||null,
    numero||null, complemento||null, bairro||null, cidade||null,
    estado||null, endereco||null, telefone||null, website||null,
    responsavel||null, cnpj||null, visibilidade||"publico",
    comodidades ? JSON.stringify(comodidades) : null,
    img_logo||null, img_capa||null, categoria_card||null,
    id,
  ];

  connection.query(sql, valores, (err, result) => {
    if (err)
      return res.status(500).json({ erro: "Erro ao editar estabelecimento.", detalhes: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ erro: "Estabelecimento não encontrado." });
    res.json({ mensagem: "Estabelecimento atualizado com sucesso!" });
  });
};

// =====================================================
// EXCLUIR ESTABELECIMENTO
// =====================================================
exports.excluirEstabelecimento = (req, res) => {
  const { id } = req.params;
  connection.query(
    "DELETE FROM estabelecimentos WHERE id = ?",
    [id],
    (err, result) => {
      if (err)
        return res.status(500).json({ erro: "Erro ao excluir estabelecimento.", detalhes: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ erro: "Estabelecimento não encontrado." });
      res.json({ mensagem: "Estabelecimento excluído com sucesso!" });
    }
  );
};
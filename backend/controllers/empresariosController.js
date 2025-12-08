const connection = require("../db/db_config");
const bcrypt = require("bcrypt");

// Função para cadastrar empresário
exports.cadastrarEmpresario = async (req, res) => {
    const {
        plano, nome_responsavel, email, nome_estabelecimento,
        cnpj, tipo_estabelecimento, telefone_comercial,
        descricao, endereco, cidade, estado, senha
    } = req.body;

    if (!nome_responsavel || !email || !nome_estabelecimento || !cnpj || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }

    try {
        connection.query(
            "SELECT * FROM empresarios WHERE email = ? OR cnpj = ?",
            [email, cnpj],
            async (err, results) => {
                if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
                if (results.length > 0) return res.status(400).json({ erro: "E-mail ou CNPJ já cadastrado!" });

                const senhaHash = await bcrypt.hash(senha, 10);

                connection.query(
                    `INSERT INTO empresarios 
                    (plano, nome_responsavel, email, nome_estabelecimento, cnpj, tipo_estabelecimento, telefone_comercial, descricao, endereco, cidade, estado, senha)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [plano, nome_responsavel, email, nome_estabelecimento, cnpj, tipo_estabelecimento, telefone_comercial || null, descricao || null, endereco || null, cidade || null, estado || null, senhaHash],
                    (err, results) => {
                        if (err) return res.status(500).json({ erro: "Erro ao cadastrar empresário.", detalhes: err.message });

                        res.status(201).json({ mensagem: "Empresário cadastrado com sucesso!", id: results.insertId });
                    }
                );
            }
        );
    } catch (erro) {
        return res.status(500).json({ erro: "Erro interno do servidor", detalhes: erro.message });
    }
};
// Pega empresário pelo ID
exports.getEmpresarioById = (req, res) => {
    const empresarioId = req.params.id;

    connection.query(
        "SELECT * FROM empresarios WHERE id = ?",
        [empresarioId],
        (err, results) => {
            if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
            if (results.length === 0) return res.status(404).json({ erro: "Empresário não encontrado." });

            res.json(results[0]);
        }
    );
};


// Função para atualizar empresário (aceita campos parciais)
exports.atualizarEmpresario = (req, res) => {
    const empresarioId = req.params.id;
    const { nome_estabelecimento, email, telefone_comercial, cidade, foto_perfil } = req.body;

    connection.query(
        "SELECT * FROM empresarios WHERE id = ?",
        [empresarioId],
        (err, results) => {
            if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
            if (results.length === 0) return res.status(404).json({ erro: "Empresário não encontrado." });

            const atual = results[0];

            const sql = `
                UPDATE empresarios
                SET nome_estabelecimento = ?, email = ?, telefone_comercial = ?, cidade = ?, foto_perfil = ?
                WHERE id = ?`;

            connection.query(
                sql,
                [
                    nome_estabelecimento || atual.nome_estabelecimento,
                    email || atual.email,
                    telefone_comercial || atual.telefone_comercial,
                    cidade || atual.cidade,
                    foto_perfil || atual.foto_perfil,
                    empresarioId
                ],
                (err2, result2) => {
                    if (err2) {
                        console.error("❌ Erro ao atualizar no MySQL:", err2);
                        return res.status(500).json({ message: "Erro ao atualizar perfil", error: err2 });
                    }

                    res.json({ message: "Perfil atualizado com sucesso!", result: result2 });
                }
            );
        }
    );
};

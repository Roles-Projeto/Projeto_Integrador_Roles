const connection = require("../db/db_config");
const bcrypt = require("bcryptjs");


exports.cadastrarEmpresario = async (req, res) => {
    console.log("📩 Recebendo cadastro de empresário...");
    const {
        plano,
        nome_responsavel,
        email,
        nome_estabelecimento,
        cnpj,
        tipo_estabelecimento,
        telefone_comercial,
        descricao,
        endereco,
        cidade,
        estado,
        senha
    } = req.body;

    if (!nome_responsavel || !email || !nome_estabelecimento || !cnpj || !senha) {
        console.log("❌ Campos obrigatórios faltando");
        return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }

    try {
        connection.query(
            "SELECT * FROM empresarios WHERE email = ? OR cnpj = ?",
            [email, cnpj],
            async (err, results) => {
                if (err) return res.status(500).json({ erro: "Erro no servidor." });
                if (results.length > 0) return res.status(400).json({ erro: "E-mail ou CNPJ já cadastrado!" });

                const senhaHash = await bcrypt.hash(senha, 10);

                const sql = `
          INSERT INTO empresarios 
          (plano, nome_responsavel, email, nome_estabelecimento, cnpj, tipo_estabelecimento, telefone_comercial, descricao, endereco, cidade, estado, senha)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

                connection.query(
                    sql,
                    [plano, nome_responsavel, email, nome_estabelecimento, cnpj, tipo_estabelecimento, telefone_comercial, descricao, endereco, cidade, estado, senhaHash],
                    (err, results) => {
                        if (err) {
                            console.error("❌ Erro ao cadastrar empresário:", err.sqlMessage || err);
                            return res.status(500).json({ erro: err.sqlMessage || "Erro ao cadastrar empresário." });

                        }

                        console.log("✅ Empresário cadastrado com sucesso!");
                        res.status(201).json({ mensagem: "Empresário cadastrado com sucesso!", id: results.insertId });
                    }
                );
            }
        );
    } catch (erro) {
        console.error("❌ Erro interno:", erro);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
};

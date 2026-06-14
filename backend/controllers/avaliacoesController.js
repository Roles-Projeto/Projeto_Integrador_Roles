// controllers/avaliacoesController.js

const connection = require("../db/db_config");

// ─── LISTAR avaliações de um estabelecimento ──────────────────────────────────
// GET /avaliacoes?estabelecimento_id=X
function listarAvaliacoes(req, res) {
    const { estabelecimento_id } = req.query;

    if (!estabelecimento_id) {
        return res.status(400).json({ erro: "estabelecimento_id é obrigatório." });
    }

    connection.query(
        `SELECT id, usuario_id, nome_autor, nota, comentario, created_at
         FROM avaliacoes
         WHERE estabelecimento_id = ?
         ORDER BY created_at DESC`,
        [estabelecimento_id],
        (err, results) => {
            if (err) return res.status(500).json({ erro: "Erro no servidor.", detalhes: err.message });
            res.json(results);
        }
    );
}

// ─── CRIAR avaliação ──────────────────────────────────────────────────────────
// POST /avaliacoes
// Body: { estabelecimento_id, nota, comentario, nome_autor }
// Header: Authorization: Bearer <token>  (opcional)
function criarAvaliacao(req, res) {
    const { estabelecimento_id, nota, comentario } = req.body;

    if (!estabelecimento_id || !nota) {
        return res.status(400).json({ erro: "estabelecimento_id e nota são obrigatórios." });
    }

    if (nota < 1 || nota > 5) {
        return res.status(400).json({ erro: "Nota deve ser entre 1 e 5." });
    }

    const usuario = req.usuario; // vem do middleware authOpcional

    if (usuario) {
        // Busca nome completo do usuário logado no banco
        connection.query(
            "SELECT nome_completo FROM usuarios WHERE id = ?",
            [usuario.id],
            (err, rows) => {
                if (err) return res.status(500).json({ erro: "Erro ao buscar usuário." });
                const nome_autor = rows[0]?.nome_completo || "Usuário";
                inserir(estabelecimento_id, usuario.id, nome_autor, nota, comentario, res);
            }
        );
    } else {
        const nome_autor = (req.body.nome_autor || "").trim() || "Anônimo";
        inserir(estabelecimento_id, null, nome_autor, nota, comentario, res);
    }
}

function inserir(estabelecimento_id, usuario_id, nome_autor, nota, comentario, res) {
    connection.query(
        `INSERT INTO avaliacoes (estabelecimento_id, usuario_id, nome_autor, nota, comentario)
         VALUES (?, ?, ?, ?, ?)`,
        [estabelecimento_id, usuario_id || null, nome_autor, nota, comentario || null],
        (err, result) => {
            if (err) return res.status(500).json({ erro: "Erro ao salvar avaliação.", detalhes: err.message });

            // Atualiza média e contagem na tabela estabelecimentos
            atualizarMedia(estabelecimento_id, () => {
                res.status(201).json({ mensagem: "Avaliação enviada!", id: result.insertId });
            });
        }
    );
}

// Recalcula nota e total no estabelecimento
function atualizarMedia(estabelecimento_id, callback) {
    connection.query(
        `SELECT COUNT(*) AS total, AVG(nota) AS media
         FROM avaliacoes WHERE estabelecimento_id = ?`,
        [estabelecimento_id],
        (err, rows) => {
            if (err || !rows[0]) return callback();
            const { total, media } = rows[0];
            const mediaf = media ? parseFloat(media).toFixed(1) : 0;

            connection.query(
                "UPDATE estabelecimentos SET nota = ?, avaliacoes = ? WHERE id = ?",
                [mediaf, total, estabelecimento_id],
                () => callback()
            );
        }
    );
}

// ─── DELETAR avaliação ────────────────────────────────────────────────────────
// DELETE /avaliacoes/:id
function deletarAvaliacao(req, res) {
    const { id } = req.params;

    connection.query(
        "SELECT estabelecimento_id FROM avaliacoes WHERE id = ?",
        [id],
        (err, rows) => {
            if (err) return res.status(500).json({ erro: "Erro no servidor." });
            if (!rows.length) return res.status(404).json({ erro: "Avaliação não encontrada." });

            const estabelecimento_id = rows[0].estabelecimento_id;

            connection.query(
                "DELETE FROM avaliacoes WHERE id = ?",
                [id],
                (err) => {
                    if (err) return res.status(500).json({ erro: "Erro ao deletar.", detalhes: err.message });

                    atualizarMedia(estabelecimento_id, () => {
                        res.json({ mensagem: "Avaliação deletada com sucesso!" });
                    });
                }
            );
        }
    );
}

module.exports = { listarAvaliacoes, criarAvaliacao, deletarAvaliacao };




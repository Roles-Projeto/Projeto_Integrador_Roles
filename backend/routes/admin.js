const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const connection = require("../db/db_config");

// ─────────────────────────────────────────
// 📊 DASHBOARD
// ─────────────────────────────────────────
router.get("/dashboard", authAdmin, (req, res) => {
    const queries = {
        usuarios: "SELECT COUNT(*) as total FROM usuarios",
        estabelecimentos: "SELECT COUNT(*) as total FROM estabelecimentos",
        eventos: "SELECT COUNT(*) as total FROM eventos",
        avaliacoes: "SELECT COUNT(*) as total FROM avaliacoes",
        ingressos: "SELECT COUNT(*) as total FROM ingressos",
    };

    const resultados = {};
    let concluidos = 0;
    const total = Object.keys(queries).length;

    for (const [chave, sql] of Object.entries(queries)) {
        connection.query(sql, (err, rows) => {
            resultados[chave] = err ? 0 : rows[0].total;
            concluidos++;
            if (concluidos === total) res.json(resultados);
        });
    }
});

// ─────────────────────────────────────────
// 👥 USUÁRIOS
// ─────────────────────────────────────────
router.get("/usuarios", authAdmin, (req, res) => {
    connection.query(
        "SELECT id, nome_completo, email, telefone, role, verificado, criado_em FROM usuarios ORDER BY criado_em DESC",
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        }
    );
});

router.put("/usuarios/:id", authAdmin, (req, res) => {
    const { nome_completo, email, role, verificado } = req.body;
    connection.query(
        "UPDATE usuarios SET nome_completo = ?, email = ?, role = ?, verificado = ? WHERE id = ?",
        [nome_completo, email, role, verificado, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Usuário atualizado com sucesso." });
        }
    );
});

router.put("/usuarios/:id/role", authAdmin, (req, res) => {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ erro: "Role inválido." });
    }
    connection.query(
        "UPDATE usuarios SET role = ? WHERE id = ?",
        [role, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: `Usuário atualizado para ${role}.` });
        }
    );
});

router.delete("/usuarios/:id", authAdmin, (req, res) => {
    connection.query(
        "DELETE FROM usuarios WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Usuário deletado com sucesso." });
        }
    );
});

// ─────────────────────────────────────────
// 🏪 ESTABELECIMENTOS
// ─────────────────────────────────────────
router.get("/estabelecimentos", authAdmin, (req, res) => {
    connection.query(
        "SELECT id, nome, tipo, cidade, estado, avaliacoes, nota, visibilidade, criado_em FROM estabelecimentos ORDER BY criado_em DESC",
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        }
    );
});

router.put("/estabelecimentos/:id", authAdmin, (req, res) => {
    const { nome, tipo, cidade, endereco, descricao } = req.body;
    connection.query(
        "UPDATE estabelecimentos SET nome = ?, tipo = ?, cidade = ?, endereco = ?, descricao = ? WHERE id = ?",
        [nome, tipo, cidade, endereco, descricao, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Estabelecimento atualizado com sucesso." });
        }
    );
});

router.delete("/estabelecimentos/:id", authAdmin, (req, res) => {
    connection.query(
        "DELETE FROM estabelecimentos WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Estabelecimento deletado com sucesso." });
        }
    );
});

// ─────────────────────────────────────────
// 📅 EVENTOS
// ─────────────────────────────────────────
router.get("/eventos", authAdmin, (req, res) => {
    connection.query(
        "SELECT * FROM eventos ORDER BY criado_em DESC",
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        }
    );
});

router.put("/eventos/:id", authAdmin, (req, res) => {
    const { nome, local, descricao, data } = req.body;
    connection.query(
        "UPDATE eventos SET nome = ?, local = ?, descricao = ?, data = ? WHERE id = ?",
        [nome, local, descricao, data, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Evento atualizado com sucesso." });
        }
    );
});

router.delete("/eventos/:id", authAdmin, (req, res) => {
    connection.query(
        "DELETE FROM eventos WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Evento deletado com sucesso." });
        }
    );
});

// ─────────────────────────────────────────
// ⭐ AVALIAÇÕES
// ─────────────────────────────────────────
router.get("/avaliacoes", authAdmin, (req, res) => {
    connection.query(
        `SELECT 
            a.id,
            a.usuario_id,
            a.nome_autor,
            a.estabelecimento_id,
            e.nome AS estabelecimento_nome,
            a.nota,
            a.comentario,
            a.created_at
         FROM avaliacoes a
         LEFT JOIN estabelecimentos e ON e.id = a.estabelecimento_id
         ORDER BY a.created_at DESC`,
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        }
    );
});

router.delete("/avaliacoes/:id", authAdmin, (req, res) => {
    connection.query(
        "DELETE FROM avaliacoes WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Avaliação deletada com sucesso." });
        }
    );
});

// ─────────────────────────────────────────
// 🎟️ INGRESSOS
// ─────────────────────────────────────────
router.get("/ingressos", authAdmin, (req, res) => {
    connection.query(
        `SELECT 
            i.id,
            i.titulo,
            i.tipo,
            i.valor,
            i.quantidade_total,
            i.evento_id,
            e.nome AS evento_nome
         FROM ingressos i
         LEFT JOIN eventos e ON e.id = i.evento_id
         ORDER BY i.id DESC`,
        (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        }
    );
});

router.put("/ingressos/:id", authAdmin, (req, res) => {
    const { titulo, tipo, valor, quantidade_total } = req.body;
    connection.query(
        "UPDATE ingressos SET titulo = ?, tipo = ?, valor = ?, quantidade_total = ? WHERE id = ?",
        [titulo, tipo, valor, quantidade_total, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Ingresso atualizado com sucesso." });
        }
    );
});

router.delete("/ingressos/:id", authAdmin, (req, res) => {
    connection.query(
        "DELETE FROM ingressos WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Ingresso deletado com sucesso." });
        }
    );
});

module.exports = router;
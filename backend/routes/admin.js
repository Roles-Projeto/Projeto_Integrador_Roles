const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const connection = require("../db/db_config");

// 📊 DASHBOARD - totais
router.get("/dashboard", authAdmin, (req, res) => {
    const queries = {
        usuarios: "SELECT COUNT(*) as total FROM usuarios",
        estabelecimentos: "SELECT COUNT(*) as total FROM estabelecimentos",
        eventos: "SELECT COUNT(*) as total FROM eventos",
        avaliacoes: "SELECT COUNT(*) as total FROM avaliacoes"
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

// 👥 USUÁRIOS
router.get("/usuarios", authAdmin, (req, res) => {
    connection.query("SELECT id, nome_completo, email, telefone, role, verificado, criado_em FROM usuarios ORDER BY criado_em DESC", (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

router.delete("/usuarios/:id", authAdmin, (req, res) => {
    connection.query("DELETE FROM usuarios WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Usuário deletado com sucesso." });
    });
});

// 🏪 ESTABELECIMENTOS
router.get("/estabelecimentos", authAdmin, (req, res) => {
    connection.query("SELECT id, nome, tipo, cidade, estado, avaliacoes, nota, visibilidade, criado_em FROM estabelecimentos ORDER BY criado_em DESC", (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

router.delete("/estabelecimentos/:id", authAdmin, (req, res) => {
    connection.query("DELETE FROM estabelecimentos WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Estabelecimento deletado com sucesso." });
    });
});

// 📅 EVENTOS
router.get("/eventos", authAdmin, (req, res) => {
    connection.query("SELECT * FROM eventos ORDER BY criado_em DESC", (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

router.delete("/eventos/:id", authAdmin, (req, res) => {
    connection.query("DELETE FROM eventos WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Evento deletado com sucesso." });
    });
});

// ⭐ AVALIAÇÕES
router.get("/avaliacoes", authAdmin, (req, res) => {
    connection.query("SELECT * FROM avaliacoes ORDER BY criado_em DESC", (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

router.delete("/avaliacoes/:id", authAdmin, (req, res) => {
    connection.query("DELETE FROM avaliacoes WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: "Avaliação deletada com sucesso." });
    });
});

// 👑 PROMOVER USUÁRIO A ADMIN
router.put("/usuarios/:id/role", authAdmin, (req, res) => {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ erro: "Role inválido." });
    }
    connection.query("UPDATE usuarios SET role = ? WHERE id = ?", [role, req.params.id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: `Usuário atualizado para ${role}.` });
    });
});

module.exports = router;

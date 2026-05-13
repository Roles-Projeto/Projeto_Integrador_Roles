"use strict";

const db = require("../config/db");
const crypto = require("crypto");

// ====================================================
// LISTAR EVENTOS DISPONÍVEIS
// ====================================================

async function listarEventos(req, res) {
    try {
        const [eventos] = await db.promise().query(`
            SELECT e.*,
                   COUNT(ti.id) AS tipos_disponiveis
            FROM eventos e
            LEFT JOIN tipos_ingresso ti ON ti.evento_id = e.id AND ti.ativo = TRUE
            WHERE e.status = 'ativo' AND e.data_evento > NOW()
            GROUP BY e.id
            ORDER BY e.data_evento ASC
        `);
        res.json(eventos);
    } catch (err) {
        console.error("Erro ao listar eventos:", err);
        res.status(500).json({ erro: "Erro ao listar eventos." });
    }
}

// ====================================================
// DETALHE DO EVENTO + TIPOS DE INGRESSO
// ====================================================

async function detalheEvento(req, res) {
    const { id } = req.params;
    try {
        const [[evento]] = await db.promise().query(
            "SELECT * FROM eventos WHERE id = ? AND status = 'ativo'", [id]
        );
        if (!evento) return res.status(404).json({ erro: "Evento não encontrado." });

        const [tipos] = await db.promise().query(`
            SELECT *, (quantidade_total - quantidade_vendida) AS disponivel
            FROM tipos_ingresso
            WHERE evento_id = ? AND ativo = TRUE
        `, [id]);

        res.json({ ...evento, tipos_ingresso: tipos });
    } catch (err) {
        console.error("Erro ao buscar evento:", err);
        res.status(500).json({ erro: "Erro interno." });
    }
}

// ====================================================
// COMPRAR INGRESSO (SIMULADO)
// ====================================================

async function comprarIngresso(req, res) {
    const { usuario_id, evento_id, itens, forma_pagamento } = req.body;
    // itens: [{ tipo_ingresso_id, quantidade }]

    if (!usuario_id || !evento_id || !itens?.length || !forma_pagamento) {
        return res.status(400).json({ erro: "Dados incompletos." });
    }

    const formasValidas = ["credito", "debito", "boleto"];
    if (!formasValidas.includes(forma_pagamento)) {
        return res.status(400).json({ erro: "Forma de pagamento inválida." });
    }

    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        let valor_total = 0;
        const detalhes = [];

        // Verifica disponibilidade e calcula total
        for (const item of itens) {
            const [[tipo]] = await conn.query(
                "SELECT * FROM tipos_ingresso WHERE id = ? AND evento_id = ? AND ativo = TRUE FOR UPDATE",
                [item.tipo_ingresso_id, evento_id]
            );

            if (!tipo) {
                await conn.rollback();
                return res.status(400).json({ erro: `Tipo de ingresso ${item.tipo_ingresso_id} inválido.` });
            }

            const disponivel = tipo.quantidade_total - tipo.quantidade_vendida;
            if (disponivel < item.quantidade) {
                await conn.rollback();
                return res.status(400).json({
                    erro: `Ingressos insuficientes para "${tipo.nome}". Disponíveis: ${disponivel}.`
                });
            }

            valor_total += tipo.preco * item.quantidade;
            detalhes.push({ tipo, quantidade: item.quantidade });
        }

        // Simula aprovação do pagamento
        const status_pagamento = simularPagamento(forma_pagamento);

        // Cria o pedido
        const [pedidoResult] = await conn.query(
            "INSERT INTO pedidos (usuario_id, evento_id, valor_total, forma_pagamento, status) VALUES (?, ?, ?, ?, ?)",
            [usuario_id, evento_id, valor_total, forma_pagamento, status_pagamento]
        );
        const pedido_id = pedidoResult.insertId;

        const ingressosGerados = [];

        if (status_pagamento === "aprovado") {
            for (const { tipo, quantidade } of detalhes) {
                // Atualiza quantidade vendida
                await conn.query(
                    "UPDATE tipos_ingresso SET quantidade_vendida = quantidade_vendida + ? WHERE id = ?",
                    [quantidade, tipo.id]
                );

                // Gera ingressos individuais com QR Code
                for (let i = 0; i < quantidade; i++) {
                    const codigo_qr = gerarCodigoQR(pedido_id, tipo.id, usuario_id);
                    await conn.query(
                        "INSERT INTO ingressos (pedido_id, usuario_id, evento_id, tipo_ingresso_id, codigo_qr) VALUES (?, ?, ?, ?, ?)",
                        [pedido_id, usuario_id, evento_id, tipo.id, codigo_qr]
                    );
                    ingressosGerados.push({ tipo: tipo.nome, codigo_qr });
                }
            }
        }

        await conn.commit();

        res.status(201).json({
            mensagem: status_pagamento === "aprovado"
                ? "Compra realizada com sucesso!"
                : "Pagamento pendente. Aguardando confirmação.",
            pedido_id,
            status: status_pagamento,
            valor_total,
            forma_pagamento,
            ingressos: ingressosGerados
        });

    } catch (err) {
        await conn.rollback();
        console.error("Erro ao comprar ingresso:", err);
        res.status(500).json({ erro: "Erro interno ao processar compra." });
    } finally {
        conn.release();
    }
}

// ====================================================
// LISTAR INGRESSOS DO USUÁRIO
// ====================================================

async function meusIngressos(req, res) {
    const { usuario_id } = req.params;
    try {
        const [ingressos] = await db.promise().query(`
            SELECT 
                i.id,
                i.codigo_qr,
                i.status,
                i.criado_em,
                e.titulo AS evento_titulo,
                e.data_evento,
                e.local_nome,
                e.cidade,
                e.estado,
                e.img_capa,
                ti.nome AS tipo_ingresso,
                ti.preco,
                p.forma_pagamento,
                p.status AS status_pagamento
            FROM ingressos i
            JOIN eventos e ON e.id = i.evento_id
            JOIN tipos_ingresso ti ON ti.id = i.tipo_ingresso_id
            JOIN pedidos p ON p.id = i.pedido_id
            WHERE i.usuario_id = ?
            ORDER BY i.criado_em DESC
        `, [usuario_id]);

        res.json(ingressos);
    } catch (err) {
        console.error("Erro ao listar ingressos:", err);
        res.status(500).json({ erro: "Erro ao buscar ingressos." });
    }
}

// ====================================================
// VALIDAR QR CODE (para uso na entrada do evento)
// ====================================================

async function validarQRCode(req, res) {
    const { codigo_qr } = req.params;
    try {
        const [[ingresso]] = await db.promise().query(`
            SELECT i.*, e.titulo AS evento, e.data_evento, ti.nome AS tipo
            FROM ingressos i
            JOIN eventos e ON e.id = i.evento_id
            JOIN tipos_ingresso ti ON ti.id = i.tipo_ingresso_id
            WHERE i.codigo_qr = ?
        `, [codigo_qr]);

        if (!ingresso) return res.status(404).json({ valido: false, erro: "Ingresso não encontrado." });
        if (ingresso.status === "utilizado") return res.status(400).json({ valido: false, erro: "Ingresso já utilizado.", usado_em: ingresso.usado_em });
        if (ingresso.status === "cancelado") return res.status(400).json({ valido: false, erro: "Ingresso cancelado." });

        // Marca como utilizado
        await db.promise().query(
            "UPDATE ingressos SET status = 'utilizado', usado_em = NOW() WHERE codigo_qr = ?",
            [codigo_qr]
        );

        res.json({
            valido: true,
            mensagem: "Ingresso válido! Entrada liberada.",
            evento: ingresso.evento,
            data_evento: ingresso.data_evento,
            tipo: ingresso.tipo
        });
    } catch (err) {
        console.error("Erro ao validar QR Code:", err);
        res.status(500).json({ erro: "Erro interno." });
    }
}

// ====================================================
// DETALHE DO INGRESSO (para exibir QR Code)
// ====================================================

async function detalheIngresso(req, res) {
    const { id } = req.params;
    const { usuario_id } = req.query;
    try {
        const [[ingresso]] = await db.promise().query(`
            SELECT 
                i.*,
                e.titulo AS evento_titulo,
                e.data_evento,
                e.local_nome,
                e.endereco,
                e.cidade,
                e.estado,
                e.img_capa,
                ti.nome AS tipo_ingresso,
                ti.preco,
                p.forma_pagamento,
                p.valor_total
            FROM ingressos i
            JOIN eventos e ON e.id = i.evento_id
            JOIN tipos_ingresso ti ON ti.id = i.tipo_ingresso_id
            JOIN pedidos p ON p.id = i.pedido_id
            WHERE i.id = ? AND i.usuario_id = ?
        `, [id, usuario_id]);

        if (!ingresso) return res.status(404).json({ erro: "Ingresso não encontrado." });

        res.json(ingresso);
    } catch (err) {
        console.error("Erro ao buscar ingresso:", err);
        res.status(500).json({ erro: "Erro interno." });
    }
}

// ====================================================
// FUNÇÕES AUXILIARES
// ====================================================

function gerarCodigoQR(pedido_id, tipo_id, usuario_id) {
    const dados = `${pedido_id}-${tipo_id}-${usuario_id}-${Date.now()}-${Math.random()}`;
    return crypto.createHash("sha256").update(dados).digest("hex");
}

function simularPagamento(forma_pagamento) {
    // Boleto fica pendente, cartão aprova na hora
    if (forma_pagamento === "boleto") return "pendente";
    return "aprovado";
}

// ====================================================
// EXPORTS
// ====================================================

module.exports = {
    listarEventos,
    detalheEvento,
    comprarIngresso,
    meusIngressos,
    validarQRCode,
    detalheIngresso
};
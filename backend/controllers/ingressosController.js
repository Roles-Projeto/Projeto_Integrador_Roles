"use strict";

const db     = require("../db/db_config");
const crypto = require("crypto");

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// ====================================================
// LISTAR EVENTOS DISPONÍVEIS
// ====================================================
async function listarEventos(req, res) {
    try {
        const eventos = await query(`
            SELECT e.*,
                   MIN(i.valor) AS preco_minimo,
                   COUNT(i.id)  AS tipos_disponiveis
            FROM eventos e
            LEFT JOIN ingressos i ON i.evento_id = e.id
            WHERE e.data_inicio > NOW()
            GROUP BY e.id
            ORDER BY e.data_inicio ASC
        `);
        res.json(eventos);
    } catch (err) {
        console.error("Erro ao listar eventos:", err);
        res.status(500).json({ erro: "Erro ao listar eventos.", detalhe: err.message });
    }
}

// ====================================================
// DETALHE DO EVENTO + TIPOS DE INGRESSO
// ====================================================
async function detalheEvento(req, res) {
    const { id } = req.params;
    try {
        const rows = await query("SELECT * FROM eventos WHERE id = ?", [id]);
        const evento = rows[0];
        if (!evento) return res.status(404).json({ erro: "Evento não encontrado." });

        const tipos = await query(`
            SELECT id, titulo AS nome, tipo, valor AS preco,
                   quantidade_total, quantidade_total AS disponivel
            FROM ingressos
            WHERE evento_id = ?
        `, [id]);

        res.json({ ...evento, tipos_ingresso: tipos });
    } catch (err) {
        console.error("Erro ao buscar evento:", err);
        res.status(500).json({ erro: "Erro interno.", detalhe: err.message });
    }
}

// ====================================================
// COMPRAR INGRESSO
// ====================================================
async function comprarIngresso(req, res) {
    const { usuario_id, evento_id, itens, forma_pagamento } = req.body;

    if (!usuario_id || !evento_id || !itens?.length || !forma_pagamento) {
        return res.status(400).json({ erro: "Dados incompletos." });
    }

    const formasValidas = ["credito", "debito", "boleto", "pix"];
    if (!formasValidas.includes(forma_pagamento)) {
        return res.status(400).json({ erro: "Forma de pagamento inválida." });
    }

    try {
        let valor_total = 0;
        const detalhes  = [];

        for (const item of itens) {
            const rows = await query(
                "SELECT * FROM ingressos WHERE id = ? AND evento_id = ?",
                [item.tipo_ingresso_id, evento_id]
            );
            const tipo = rows[0];
            if (!tipo) {
                return res.status(400).json({ erro: `Ingresso ${item.tipo_ingresso_id} inválido.` });
            }
            valor_total += parseFloat(tipo.valor) * item.quantidade;
            detalhes.push({ tipo, quantidade: item.quantidade });
        }

        const status_pagamento = simularPagamento(forma_pagamento);

        const pedidoResult = await query(
            "INSERT INTO pedidos (usuario_id, evento_id, valor_total, forma_pagamento, status) VALUES (?, ?, ?, ?, ?)",
            [usuario_id, evento_id, valor_total, forma_pagamento, status_pagamento]
        );
        const pedido_id = pedidoResult.insertId;

        // ── Gera QR codes UMA vez, reutiliza no e-mail e na resposta ──
        const ingressosGerados = detalhes.flatMap(d =>
            Array.from({ length: d.quantidade }, () => ({
                tipo:      d.tipo.titulo,
                codigo_qr: gerarCodigoQR(pedido_id, d.tipo.id, usuario_id),
            }))
        );

        // ── Envia e-mail em background (só se aprovado) ───────────────
        if (status_pagamento === "aprovado") {
            try {
                const { enviarEmailIngresso } = require("../services/emailService");

                const [usuarioRows, eventoRows] = await Promise.all([
                    query("SELECT nome_completo, email FROM usuarios WHERE id = ?", [usuario_id]),
                    query("SELECT nome, data_inicio, local_nome, cidade FROM eventos WHERE id = ?", [evento_id]),
                ]);

                const usuario = usuarioRows[0];
                const evento  = eventoRows[0];

                if (usuario && evento) {
                    const d = new Date(evento.data_inicio);

                    enviarEmailIngresso({
                        nomeCliente:     usuario.nome_completo,
                        emailCliente:    usuario.email,
                        pedido_id,
                        nomeEvento:      evento.nome,
                        dataEvento:      d.toLocaleDateString("pt-BR"),
                        horaEvento:      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                        localEvento:     `${evento.local_nome}, ${evento.cidade}`,
                        nomeIngresso:    detalhes[0]?.tipo?.titulo || "Ingresso",
                        quantidade:      ingressosGerados.length,
                        subtotal:        valor_total,
                        taxaServico:     valor_total * 0.10,
                        totalPago:       valor_total * 1.10,
                        forma_pagamento,
                        ingressos:       ingressosGerados,
                    }).catch(e => console.error("❌ Erro ao enviar e-mail:", e.message));
                }
            } catch (e) {
                console.error("❌ Erro ao buscar dados para e-mail:", e.message);
            }
        }

        res.status(201).json({
            mensagem: status_pagamento === "aprovado"
                ? "Compra realizada com sucesso!"
                : "Pagamento pendente. Aguardando confirmação.",
            pedido_id,
            status:         status_pagamento,
            valor_total,
            forma_pagamento,
            ingressos:      ingressosGerados,
        });

    } catch (err) {
        console.error("Erro ao comprar ingresso:", err);
        res.status(500).json({ erro: "Erro interno ao processar compra.", detalhe: err.message });
    }
}

// ====================================================
// MEUS INGRESSOS
// ====================================================
async function meusIngressos(req, res) {
    const { usuario_id } = req.params;

    if (!usuario_id) {
        return res.status(400).json({ erro: "usuario_id não informado." });
    }

    try {
        const ingressos = await query(`
            SELECT
                p.id,
                p.usuario_id,
                p.evento_id,
                p.valor_total                                           AS preco,
                p.forma_pagamento,
                p.status                                                AS status_pagamento,
                p.criado_em,
                e.nome                                                  AS nome_evento,
                e.data_inicio                                           AS data_evento,
                e.local_nome                                            AS local_evento,
                e.cidade,
                e.estado,
                e.imagem                                                AS img_capa,
                (SELECT titulo FROM ingressos WHERE evento_id = p.evento_id LIMIT 1) AS tipo_ingresso,
                (SELECT valor  FROM ingressos WHERE evento_id = p.evento_id LIMIT 1) AS preco_unitario
            FROM pedidos p
            JOIN eventos e ON e.id = p.evento_id
            WHERE p.usuario_id = ?
            ORDER BY p.criado_em DESC
        `, [usuario_id]);

        console.log(`✅ meusIngressos: ${ingressos.length} pedido(s) para usuario_id=${usuario_id}`);
        res.json(ingressos);

    } catch (err) {
        console.error("❌ ERRO meusIngressos:", err);
        res.status(500).json({ erro: "Erro ao buscar ingressos.", detalhe: err.message });
    }
}

// ====================================================
// VALIDAR QR CODE
// ====================================================
async function validarQRCode(req, res) {
    res.json({ valido: false, mensagem: "Validação por QR não configurada." });
}

// ====================================================
// DETALHE DO INGRESSO
// ====================================================
async function detalheIngresso(req, res) {
    const { id }         = req.params;
    const { usuario_id } = req.query;

    try {
        const rows = await query(`
            SELECT
                p.id,
                p.usuario_id,
                p.evento_id,
                p.valor_total        AS preco,
                p.forma_pagamento,
                p.status             AS status_pagamento,
                p.criado_em,
                e.nome               AS nome_evento,
                e.data_inicio        AS data_evento,
                e.local_nome         AS local_evento,
                e.cidade,
                e.estado,
                e.imagem             AS img_capa,
                i.titulo             AS tipo_ingresso,
                i.valor              AS preco_unitario
            FROM pedidos p
            JOIN eventos    e ON e.id = p.evento_id
            LEFT JOIN ingressos i ON i.evento_id = p.evento_id
            WHERE p.id = ? AND p.usuario_id = ?
            LIMIT 1
        `, [id, usuario_id]);

        const ingresso = rows[0];
        if (!ingresso) return res.status(404).json({ erro: "Ingresso não encontrado." });
        res.json(ingresso);

    } catch (err) {
        console.error("Erro ao buscar ingresso:", err);
        res.status(500).json({ erro: "Erro interno.", detalhe: err.message });
    }
}

// ====================================================
// AUXILIARES
// ====================================================
function gerarCodigoQR(pedido_id, tipo_id, usuario_id) {
    const dados = `${pedido_id}-${tipo_id}-${usuario_id}-${Date.now()}-${Math.random()}`;
    return crypto.createHash("sha256").update(dados).digest("hex");
}

function simularPagamento(forma_pagamento) {
    if (forma_pagamento === "boleto") return "pendente";
    return "aprovado";
}

module.exports = {
    listarEventos,
    detalheEvento,
    comprarIngresso,
    meusIngressos,
    validarQRCode,
    detalheIngresso,
};
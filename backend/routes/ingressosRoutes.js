"use strict";

const express = require("express");
const router = express.Router();
const {
    listarEventos,
    detalheEvento,
    comprarIngresso,
    meusIngressos,
    validarQRCode,
    detalheIngresso
} = require("../controllers/ingressosController");

// ====================================================
// ROTAS DE EVENTOS
// ====================================================

// GET /eventos → lista todos os eventos ativos
router.get("/eventos", listarEventos);

// GET /eventos/:id → detalhe do evento + tipos de ingresso disponíveis
router.get("/eventos/:id", detalheEvento);

// ====================================================
// ROTAS DE INGRESSOS
// ====================================================

// POST /ingressos/comprar → realiza a compra (simulada)
// Body: { usuario_id, evento_id, itens: [{ tipo_ingresso_id, quantidade }], forma_pagamento }
router.post("/ingressos/comprar", comprarIngresso);

// GET /ingressos/usuario/:usuario_id → lista todos os ingressos do usuário
router.get("/ingressos/usuario/:usuario_id", meusIngressos);

// GET /ingressos/:id?usuario_id=X → detalhe de um ingresso (com QR Code)
router.get("/ingressos/:id", detalheIngresso);

// GET /ingressos/validar/:codigo_qr → valida QR Code na entrada do evento
router.get("/ingressos/validar/:codigo_qr", validarQRCode);

module.exports = router;
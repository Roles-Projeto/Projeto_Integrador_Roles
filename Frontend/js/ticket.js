/* ═══════════════════════════════════════════════════════════
   INGRESSOS — substituir a função renderTickets() no perfil.js
   Cole este bloco no lugar da função renderTickets existente.
═══════════════════════════════════════════════════════════ */

function renderTickets(tickets, filter) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const filtered = tickets.filter(t => {
        const d = t.data_evento ? new Date(t.data_evento) : null;
        if (filter === "proximos") return d && d >= hoje;
        if (filter === "passados") return d && d < hoje;
        return true;
    });

    if (!filtered.length) {
        showSectionState("tickets", "empty");
        return;
    }

    el("tickets-list").innerHTML = filtered.map(t => {
        const dataEvento = t.data_evento ? new Date(t.data_evento) : null;
        const isHoje     = dataEvento && dataEvento.toDateString() === new Date().toDateString();
        const isProximo  = dataEvento && dataEvento >= hoje;
        const isPendente = (t.status_pagamento || t.status) === "pendente";
        const isUsado    = !isHoje && !isProximo;

        // ── Cor da faixa lateral ──────────────────────────
        const accentColor = isPendente
            ? "#EF9F27"               // âmbar — pagamento pendente
            : isHoje
                ? "#E24B4A"           // vermelho — acontecendo hoje
                : isProximo
                    ? "#378ADD"       // azul — próximo evento
                    : "#B4B2A9";      // cinza — realizado

        // ── Pill de status ────────────────────────────────
        let statusPill;
        if (isPendente) {
            statusPill = `<span class="tc-status tc-pendente"><i class="fas fa-clock"></i> Pagamento pendente</span>`;
        } else if (isHoje) {
            statusPill = `<span class="tc-status tc-hoje"><i class="fas fa-fire"></i> Hoje!</span>`;
        } else if (isProximo) {
            statusPill = `<span class="tc-status tc-proximo"><i class="fas fa-circle" style="font-size:7px;"></i> Próximo</span>`;
        } else {
            statusPill = `<span class="tc-status tc-passado"><i class="fas fa-check"></i> Realizado</span>`;
        }

        // ── Dados do evento ───────────────────────────────
        const nomeEvento = t.evento_titulo || t.nome_evento || t.titulo || "Evento";
        const local      = t.local_nome    || t.local        || "";
        const tipo       = t.tipo_ingresso || "";
        const precoStr   = t.preco         ? formatBRL(parseFloat(t.preco)) : "";

        const dataStr = dataEvento
            ? dataEvento.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
            : "—";
        const horaStr = dataEvento
            ? dataEvento.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            : "";

        // ── Stub label ────────────────────────────────────
        const stubLabel = isPendente ? "PEND." : isUsado ? "USADO" : "SCAN";

        // ── Opacidade para ingressos passados ─────────────
        const cardStyle = isUsado ? 'style="opacity:0.6"' : "";

        return `
        <div class="ticket-card" data-usado="${isUsado}" ${cardStyle}>

            <div class="tc-accent" style="background:${accentColor};"></div>

            <div class="tc-body">

                <div class="tc-top">
                    <div class="tc-event-info">
                        <div class="tc-event-name">${nomeEvento}</div>
                        ${tipo || precoStr
                            ? `<div class="tc-event-sub">${[tipo, precoStr].filter(Boolean).join(" &bull; ")}</div>`
                            : ""}
                    </div>
                    ${tipo ? `<span class="tc-badge">${tipo}</span>` : ""}
                </div>

                <div class="tc-meta-row">
                    ${statusPill}
                    <span class="tc-meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        ${dataStr}${horaStr ? ` &bull; ${horaStr}` : ""}
                    </span>
                    ${local
                        ? `<span class="tc-meta-item"><i class="fas fa-map-marker-alt"></i> ${local}</span>`
                        : ""}
                </div>

                <div class="tc-actions">
                    ${(isProximo || isHoje) && !isPendente
                        ? `<button class="btn btn-primary btn-sm" onclick="downloadTicket('${t.id}')">
                               <i class="fas fa-download"></i> Baixar
                           </button>`
                        : ""}
                    ${isProximo && !isPendente
                        ? `<button class="btn btn-ghost btn-sm"
                               onclick="openTransferModal('${t.id}','${nomeEvento.replace(/'/g, "\\'")}')">
                               <i class="fas fa-exchange-alt"></i> Transferir
                           </button>`
                        : ""}
                    ${isPendente
                        ? `<span style="font-size:12px;color:#f57f17;">
                               <i class="fas fa-info-circle"></i> Aguardando confirmação do pagamento
                           </span>`
                        : ""}
                </div>

            </div>

            <div class="tc-stub">
                <div class="tc-qr">
                    <i class="fas fa-qrcode"></i>
                </div>
                <span class="tc-stub-label">${stubLabel}</span>
            </div>

        </div>`;
    }).join("");

    showSectionState("tickets", "list");
}
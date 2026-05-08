"use strict";

// ============================================================
// js/locais.js
// Carrega estabelecimentos da API + cards fixos do HTML
// Filtra por nome, local, descrição, tags e categoria
// ============================================================

(function () {

    // ----------------------------------------------------------
    // URL DA API (CORRIGIDO)
    // ----------------------------------------------------------
    const API_URL =
        ["localhost", "127.0.0.1"].includes(window.location.hostname)
            ? "http://localhost:3000"
            : "https://projeto-integrador-roles.onrender.com";

    // ----------------------------------------------------------
    // NORMALIZA (remove acentos, minúsculas)
    // ----------------------------------------------------------
    function norm(s) {
        return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // ----------------------------------------------------------
    // ESTADO ATUAL
    // ----------------------------------------------------------
    let termoAtual     = '';
    let categoriaAtual = 'todos';

    // ----------------------------------------------------------
    // BUSCA ESTABELECIMENTOS DA API (CORRIGIDO)
    // ----------------------------------------------------------
    async function fetchEstabelecimentos() {
        try {
            const res = await fetch(`${API_URL}/estabelecimentos`);
            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("Erro ao buscar estabelecimentos:", err);
            return [];
        }
    }

    // ----------------------------------------------------------
    // MONTA O HTML DE UM CARD VINDO DA API
    // ----------------------------------------------------------
    function criarCardDinamico(estab) {
        const horarioDisplay = estab.horario || "Verificar agenda";
        const imgSrc = estab.img_capa || estab.img_logo || "../Imagens/placeholder.png";
        const categoriaLabel = estab.tipo || estab.categoria_card || "Local";

        const enderecoDisplay = estab.endereco
            || `${estab.bairro ? estab.bairro + ", " : ""}${estab.cidade || "Goiânia"}`;

        const comodidadesArr = estab.comodidades
            ? estab.comodidades.split(',').map(c => c.trim()).filter(Boolean).slice(0, 3)
            : [];

        const tagsHTML = comodidadesArr.length > 0
            ? comodidadesArr.map(t => `<span>${t}</span>`).join("")
            : `<span>${categoriaLabel}</span>`;

        const nota = estab.nota || "Novo";
        const avaliacoes = estab.avaliacoes || 0;

        const notaDisplay = nota !== "Novo" ? `⭐ ${nota}` : `🆕 Novo`;
        const avalDisplay = nota !== "Novo" ? `${avaliacoes} avaliações` : "Novo cadastro";

        const div = document.createElement("div");
        div.classList.add("card", "card-dinamico");
        div.setAttribute("data-categoria-card", estab.categoria_card || "restaurantes");
        div.setAttribute("data-estab-id", estab.id);

        div.innerHTML = `
            <div class="card-img">
                <img src="${imgSrc}" alt="${estab.nome}" onerror="this.src='../Imagens/placeholder.png'">
                <span class="categoria">${categoriaLabel}</span>
                <span class="nota">${notaDisplay}</span>
            </div>
            <div class="card-content">
                <h3>${estab.nome} <span class="preco">${estab.faixa_preco || "$"}</span></h3>
                <p class="local"><i class="fa-solid fa-location-dot"></i> ${enderecoDisplay}</p>
                <p class="descricao">${estab.descricao
                    ? estab.descricao.substring(0, 100) + (estab.descricao.length > 100 ? "..." : "")
                    : "Estabelecimento cadastrado."}</p>
                <div class="info">
                    <p><i class="fa-regular fa-clock"></i> ${horarioDisplay}</p>
                    <p><i class="fa-solid fa-phone"></i> ${estab.telefone || "Não informado"}</p>
                </div>
                <div class="tags">${tagsHTML}</div>
                <div class="footer">
                    <p class="avaliacoes"><i class="fa-solid fa-star"></i> ${avalDisplay}</p>
                    <button class="detalhes">Ver Detalhes</button>
                </div>
            </div>
        `;

        return div;
    }

    // ----------------------------------------------------------
    // CARREGA ESTABELECIMENTOS
    // ----------------------------------------------------------
    async function carregarEstabelecimentosDinamicos() {
        const container = document.getElementById("cards-container-locais");
        if (!container) return;

        container.querySelectorAll(".card-dinamico").forEach(c => c.remove());

        const lista = await fetchEstabelecimentos();

        lista.forEach(estab => {
            const card = criarCardDinamico(estab);
            container.appendChild(card);
        });

        aplicarFiltro();
    }

    // ----------------------------------------------------------
    // TEXTO PESQUISÁVEL
    // ----------------------------------------------------------
    function textoDoCard(card) {
        const nome      = card.querySelector('h3')?.textContent || '';
        const local     = card.querySelector('.local')?.textContent || '';
        const descricao = card.querySelector('.descricao')?.textContent || '';
        const tags      = card.querySelector('.tags')?.textContent || '';
        const categoria = card.getAttribute('data-categoria-card') || '';
        return norm(`${nome} ${local} ${descricao} ${tags} ${categoria}`);
    }

    // ----------------------------------------------------------
    // FILTRO
    // ----------------------------------------------------------
    function aplicarFiltro() {
        const cards  = document.querySelectorAll('.card');
        const tNorm  = norm(termoAtual);
        const cNorm  = norm(categoriaAtual);
        let contador = 0;

        cards.forEach(card => {
            const texto   = textoDoCard(card);
            const catCard = norm(card.getAttribute('data-categoria-card') || '');

            const bateTexto = tNorm === '' || texto.includes(tNorm);
            const bateCat   = cNorm === 'todos' || catCard === cNorm;

            if (bateTexto && bateCat) {
                card.style.display = '';
                contador++;
            } else {
                card.style.display = 'none';
            }
        });

        const contadorEl = document.getElementById('contador-locais');
        if (contadorEl) contadorEl.textContent = contador;

        atualizarMensagemVazia(contador);
    }

    // ----------------------------------------------------------
    // MENSAGEM VAZIA
    // ----------------------------------------------------------
    function atualizarMensagemVazia(total) {
        const ID = 'locais-sem-resultado';
        let msg  = document.getElementById(ID);

        if (total === 0) {
            if (!msg) {
                msg = document.createElement('div');
                msg.id = ID;
                msg.innerHTML = `
                    <p>Nenhum local encontrado</p>
                `;
                document.getElementById('cards-container-locais')?.after(msg);
            }
        } else {
            msg?.remove();
        }
    }

    // ----------------------------------------------------------
    // INICIALIZAÇÃO
    // ----------------------------------------------------------
    document.addEventListener('DOMContentLoaded', async () => {

        await carregarEstabelecimentosDinamicos();

        const container = document.getElementById('cards-container-locais');
        if (container) {
            container.addEventListener('click', (e) => {
                const botao = e.target.closest('.detalhes');
                if (!botao) return;

                const card = botao.closest('.card');
                if (!card) return;

                const estabId = card.getAttribute('data-estab-id');

                if (estabId) {
                    window.location.href = `/Frontend/detalheslocais/detalheslocais.html?id=${estabId}`;
                } else {
                    alert("Este local ainda não possui página de detalhes no banco de dados.");
                }
            });
        }

        aplicarFiltro();
    });

})();
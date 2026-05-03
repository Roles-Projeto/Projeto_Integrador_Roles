"use strict";

// ============================================================
// js/locais.js
// Carrega estabelecimentos fixos (HTML) + dinâmicos (localStorage)
// Filtra por nome, local, descrição, tags e categoria
// ============================================================

(function () {

    // ----------------------------------------------------------
    // CHAVE DO "BANCO" de estabelecimentos
    // ----------------------------------------------------------
    const CHAVE_ESTAB = "roles_estabelecimentos";

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
    // MONTA O HTML DE UM CARD DINÂMICO (vindo do localStorage)
    // ----------------------------------------------------------
    function criarCardDinamico(estab) {
        // Horário do primeiro dia aberto
        let horarioDisplay = "Verificar agenda";
        const diaAberto = estab.horarios?.find(h => h.aberto && h.abertura && h.fechamento);
        if (diaAberto) {
            horarioDisplay = `${diaAberto.abertura} – ${diaAberto.fechamento}`;
        }

        // Imagem de capa ou logo (fallback para placeholder)
        const imgSrc = estab.imgCapa || estab.imgLogo || "../Imagens/placeholder.png";

        // Categoria para label do badge
        const categoriaLabel = estab.tipo || estab.categoriaCard || "Local";

        // Endereço resumido
        const enderecoDisplay = estab.endereco || estab.cidade || "Goiânia";

        // Tags (comodidades, até 3)
        const tags = (estab.comodidades || []).slice(0, 3);
        const tagsHTML = tags.length > 0
            ? tags.map(t => `<span>${t}</span>`).join("")
            : `<span>${categoriaLabel}</span>`;

        const div = document.createElement("div");
        div.classList.add("card", "card-dinamico");
        div.setAttribute("data-categoria-card", estab.categoriaCard || "restaurantes");
        div.setAttribute("data-estab-id", estab.id);

        div.innerHTML = `
            <div class="card-img">
                <img src="${imgSrc}" alt="${estab.nome}" onerror="this.src='../Imagens/placeholder.png'">
                <span class="categoria">${categoriaLabel}</span>
                <span class="nota">🆕 Novo</span>
            </div>
            <div class="card-content">
                <h3>${estab.nome} <span class="preco">${estab.faixaPrecoSimbolo || "$"}</span></h3>
                <p class="local"><i class="fa-solid fa-location-dot"></i> ${enderecoDisplay}</p>
                <p class="descricao">${estab.descricao ? estab.descricao.substring(0, 100) + (estab.descricao.length > 100 ? "..." : "") : "Novo estabelecimento cadastrado."}</p>
                <div class="info">
                    <p><i class="fa-regular fa-clock"></i> ${horarioDisplay}</p>
                    <p><i class="fa-solid fa-phone"></i> ${estab.telefone || "Não informado"}</p>
                </div>
                <div class="tags">${tagsHTML}</div>
                <div class="footer">
                    <p class="avaliacoes"><i class="fa-solid fa-star"></i> Novo cadastro</p>
                    <button class="detalhes">Ver Detalhes</button>
                </div>
            </div>
        `;

        return div;
    }

    // ----------------------------------------------------------
    // CARREGA ESTABELECIMENTOS DO localStorage E INJETA NO DOM
    // ----------------------------------------------------------
    function carregarEstabelecimentosDinamicos() {
        const container = document.getElementById("cards-container-locais");
        if (!container) return;

        // Remove cards dinâmicos antigos (evita duplicar ao recarregar)
        container.querySelectorAll(".card-dinamico").forEach(c => c.remove());

        let lista = [];
        try {
            lista = JSON.parse(localStorage.getItem(CHAVE_ESTAB)) || [];
        } catch (_) {
            lista = [];
        }

        // Filtra só os públicos
        const publicos = lista.filter(e => e.visibilidade !== "privado");

        publicos.forEach(estab => {
            const card = criarCardDinamico(estab);
            container.appendChild(card);
        });

        // Re-aplica filtro para contar corretamente
        aplicarFiltro();
    }

    // ----------------------------------------------------------
    // TEXTO PESQUISÁVEL DE CADA CARD
    // ----------------------------------------------------------
    function textoDoCard(card) {
        const nome      = card.querySelector('h3')?.textContent          || '';
        const local     = card.querySelector('.local')?.textContent      || '';
        const descricao = card.querySelector('.descricao')?.textContent  || '';
        const tags      = card.querySelector('.tags')?.textContent       || '';
        const categoria = card.getAttribute('data-categoria-card')       || '';
        return norm(`${nome} ${local} ${descricao} ${tags} ${categoria}`);
    }

    // ----------------------------------------------------------
    // APLICA FILTRO (texto + categoria)
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
    // MENSAGEM "NENHUM RESULTADO"
    // ----------------------------------------------------------
    function atualizarMensagemVazia(total) {
        const ID = 'locais-sem-resultado';
        let msg  = document.getElementById(ID);

        if (total === 0) {
            if (!msg) {
                msg = document.createElement('div');
                msg.id = ID;
                msg.style.cssText = `
                    text-align:center; padding:50px 20px;
                    color:#888; font-family:'Poppins',sans-serif; width:100%;
                `;
                msg.innerHTML = `
                    <i class="fas fa-search" style="font-size:2.5rem;color:#ccc;margin-bottom:16px;display:block;"></i>
                    <p style="font-size:1.1rem;font-weight:600;color:#444;margin:0 0 8px;">
                        Nenhum local encontrado
                    </p>
                    <p style="font-size:0.9rem;margin:0;">
                        Tente buscar por outro nome, categoria ou bairro.
                    </p>
                `;
                document.getElementById('cards-container-locais')?.after(msg);
            }
        } else {
            msg?.remove();
        }
    }

    // ----------------------------------------------------------
    // BUSCAS RECENTES
    // ----------------------------------------------------------
    const CHAVE_RECENTES = 'buscasRecentes';
    const MAX_RECENTES   = 5;

    function getRecentes() {
        try { return JSON.parse(localStorage.getItem(CHAVE_RECENTES)) || []; } catch { return []; }
    }

    function salvarRecente(termo) {
        if (!termo.trim()) return;
        let r = getRecentes().filter(x => norm(x) !== norm(termo));
        r.unshift(termo.trim());
        localStorage.setItem(CHAVE_RECENTES, JSON.stringify(r.slice(0, MAX_RECENTES)));
    }

    // ----------------------------------------------------------
    // COLETA DADOS DO CARD PARA DETALHES
    // ----------------------------------------------------------
    function coletarDadosDoCard(card) {
        // Se for card dinâmico, pega do localStorage pelo id
        const estabId = card.getAttribute("data-estab-id");
        if (estabId) {
            try {
                const lista = JSON.parse(localStorage.getItem(CHAVE_ESTAB)) || [];
                const estab = lista.find(e => String(e.id) === String(estabId));
                if (estab) return estab;
            } catch (_) {}
        }

        // Fallback: coleta do DOM (cards fixos do HTML)
        return {
            nome      : card.querySelector('h3')?.textContent.replace(/\$+/g,'').trim() || '',
            local     : card.querySelector('.local')?.textContent.trim()                 || '',
            descricao : card.querySelector('.descricao')?.textContent.trim()             || '',
            tags      : card.querySelector('.tags')?.textContent.trim()                  || '',
            imgCapa   : card.querySelector('img')?.src                                   || '',
            categoriaCard: card.getAttribute('data-categoria-card')                      || '',
            nota      : card.querySelector('.nota')?.textContent.trim()                  || '',
            horarios  : [{ aberto: true, abertura: card.querySelector('.info p:first-child')?.textContent.replace(/[^0-9:–]/g,'').trim() || '' }],
            telefone  : card.querySelector('.info p:last-child')?.textContent.trim()     || '',
            avaliacoes: card.querySelector('.avaliacoes')?.textContent.trim()            || '',
        };
    }

    // ----------------------------------------------------------
    // OUVE O EVENTO DO HEADER → roles:filtrar
    // ----------------------------------------------------------
    window.addEventListener('roles:filtrar', (e) => {
        const termo      = e.detail?.termo ?? '';
        const inputLocal = document.getElementById('search-input');

        if (inputLocal && document.activeElement !== inputLocal) {
            inputLocal.value = termo;
        }

        termoAtual = termo;
        aplicarFiltro();
    });

    // ----------------------------------------------------------
    // INICIALIZAÇÃO
    // ----------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {

        // ---- Carrega estabelecimentos salvos ----
        carregarEstabelecimentosDinamicos();

        // ---- Input local da página ----
        const inputLocal = document.getElementById('search-input');

        // Verifica se veio busca salva do header
        const filtrosSalvos = localStorage.getItem('filtrosRoles');
        if (filtrosSalvos) {
            try {
                const { termo } = JSON.parse(filtrosSalvos);
                if (termo && inputLocal) {
                    inputLocal.value = termo;
                    termoAtual       = termo;
                }
            } catch (_) {}
            localStorage.removeItem('filtrosRoles');
        }

        if (inputLocal) {
            inputLocal.addEventListener('input', () => {
                termoAtual = inputLocal.value.trim();
                aplicarFiltro();
            });

            inputLocal.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && termoAtual.trim()) {
                    salvarRecente(termoAtual.trim());
                }
            });
        }

        // ---- Botões de categoria ----
        const botoesCategoria = document.getElementById('botoes-categoria-locais');
        if (botoesCategoria) {
            botoesCategoria.addEventListener('click', (e) => {
                const botao = e.target.closest('.opçoes-abaixo');
                if (!botao) return;

                document.querySelectorAll('.opçoes-abaixo')
                    .forEach(b => b.classList.remove('ativo'));
                botao.classList.add('ativo');

                categoriaAtual = botao.getAttribute('data-categoria') || 'todos';
                aplicarFiltro();
            });
        }

        // ---- Clique em "Ver Detalhes" ----
        const container = document.getElementById('cards-container-locais');
        if (container) {
            container.addEventListener('click', (e) => {
                const botao = e.target.closest('.detalhes');
                if (!botao) return;

                const card = botao.closest('.card');
                if (!card) return;

                const dados = coletarDadosDoCard(card);
                localStorage.setItem('localDetalhes', JSON.stringify(dados));
                window.location.href = '/frontend/detalheslocais/detalheslocais.html';
            });
        }

        // ---- Aplica filtro inicial ----
        aplicarFiltro();

        // ---- Feather icons ----
        if (typeof feather !== 'undefined') feather.replace();
    });

})();
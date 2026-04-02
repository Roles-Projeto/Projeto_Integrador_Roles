"use strict";

// ============================================================
// js/locais.js
// Filtro em tempo real integrado ao header.js
// Filtra os .card por nome, local, descrição, tags e categoria
// Sincronizado com o evento roles:filtrar do header
// ============================================================

(function () {

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

        // Atualiza contador
        const contadorEl = document.getElementById('contador-locais');
        if (contadorEl) contadorEl.textContent = contador;

        // Mensagem de nenhum resultado
        atualizarMensagemVazia(contador);
    }

    // ----------------------------------------------------------
    // MENSAGEM "NENHUM RESULTADO"
    // ----------------------------------------------------------
    function atualizarMensagemVazia(total) {
        const ID  = 'locais-sem-resultado';
        let msg   = document.getElementById(ID);

        if (total === 0 && termoAtual !== '') {
            if (!msg) {
                msg = document.createElement('div');
                msg.id = ID;
                msg.style.cssText = `
                    text-align: center;
                    padding: 50px 20px;
                    color: #888;
                    font-family: 'Poppins', sans-serif;
                    width: 100%;
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
    // BUSCAS RECENTES — mesma chave do header
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
        return {
            nome      : card.querySelector('h3')?.textContent.replace(/\$+/g, '').trim() || '',
            local     : card.querySelector('.local')?.textContent.trim()                  || '',
            descricao : card.querySelector('.descricao')?.textContent.trim()              || '',
            tags      : card.querySelector('.tags')?.textContent.trim()                   || '',
            imagem    : card.querySelector('img')?.src                                    || '',
            categoria : card.getAttribute('data-categoria-card')                          || '',
            nota      : card.querySelector('.nota')?.textContent.trim()                   || '',
            horario   : card.querySelector('.info p:first-child')?.textContent.trim()     || '',
            telefone  : card.querySelector('.info p:last-child')?.textContent.trim()      || '',
            avaliacoes: card.querySelector('.avaliacoes')?.textContent.trim()             || '',
        };
    }

    // ----------------------------------------------------------
    // OUVE O EVENTO DO HEADER → roles:filtrar
    // ----------------------------------------------------------
    window.addEventListener('roles:filtrar', (e) => {
        const termo      = e.detail?.termo ?? '';
        const inputLocal = document.getElementById('search-input');

        // Sincroniza o input local com o que veio do header
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

        // ---- Input local da página ----
        const inputLocal = document.getElementById('search-input');

        // Verifica se veio busca salva do header (redirect de outra página)
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
            // Filtra em tempo real enquanto digita
            inputLocal.addEventListener('input', () => {
                termoAtual = inputLocal.value.trim();
                aplicarFiltro();
            });

            // Enter salva nos recentes
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

        // ---- Clique no botão "Ver Detalhes" ----
        const container = document.getElementById('cards-container-locais');
        if (container) {
            container.addEventListener('click', (e) => {
                const botao = e.target.closest('.detalhes');
                if (!botao) return;

                const card = botao.closest('.card');
                if (!card) return;

                const dados = coletarDadosDoCard(card);
                localStorage.setItem('localDetalhes', JSON.stringify(dados));
                window.location.href = '/frontend/verDetalhesLocais/verDetalhesLocais.html';
            });
        }

        // ---- Aplica filtro inicial ----
        aplicarFiltro();

        // ---- Inicializa feather icons ----
        if (typeof feather !== 'undefined') feather.replace();
    });

})();
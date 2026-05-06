"use strict";

(function () {

    const API_URL = window.API_BASE;

    const faixaPrecoMap = {
        "economico":   "$ — até R$ 30",
        "moderado":    "$$ — R$ 30 a R$ 80",
        "sofisticado": "$$$ — R$ 80 a R$ 150",
        "luxo":        "$$$$ — acima de R$ 150"
    };

    function norm(s) {
        return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    let termoAtual      = '';
    let categoriaAtual  = 'todos';
    let ordenacaoAtual  = 'padrao';

    // ─── FETCH ────────────────────────────────────────────────────────────────
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

    // ─── CRIAR CARD ───────────────────────────────────────────────────────────
    function criarCardDinamico(estab) {
        const imgSrc = estab.img_capa || estab.img_logo || "/frontend/imagens/placeholder.png";
        const categoriaLabel = estab.tipo || "Local";
        const enderecoDisplay = estab.endereco
            || `${estab.bairro ? estab.bairro + ", " : ""}${estab.cidade || "Goiânia"}`;

        const comodidadesArr = estab.comodidades
            ? estab.comodidades.split(',').map(c => c.trim()).filter(Boolean).slice(0, 3)
            : [];

        const tagsHTML = comodidadesArr.length > 0
            ? comodidadesArr.map(t => `<span>${t}</span>`).join("")
            : `<span>${categoriaLabel}</span>`;

        const nota = parseFloat(estab.nota) || 0;
        const avaliacoes = parseInt(estab.avaliacoes) || 0;
        const notaDisplay = nota > 0
            ? `<span class="nota"><i class="fas fa-star"></i> ${nota.toFixed(1)}</span>`
            : `<span class="nota nova">Novo</span>`;

        const horarioDisplay    = estab.horario || "Verificar agenda";
        const telefoneDisplay   = estab.telefone || "";
        const faixaPrecoDisplay = faixaPrecoMap[estab.faixa_preco] || estab.faixa_preco || "";

        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-categoria-card', estab.categoria_card || '');
        card.setAttribute('data-estab-id', estab.id);
        card.setAttribute('data-nota', nota);
        card.setAttribute('data-avaliacoes', avaliacoes);

        card.innerHTML = `
            <div class="card-img">
                <img src="${imgSrc}" alt="${estab.nome}" onerror="this.src='/frontend/imagens/placeholder.png'">
                <span class="categoria">${categoriaLabel}</span>
                ${notaDisplay}
            </div>
            <div class="card-content">
                <h3>${estab.nome} ${faixaPrecoDisplay ? `<span class="preco">${faixaPrecoDisplay}</span>` : ""}</h3>
                <p class="local"><i class="fa-solid fa-location-dot"></i> ${enderecoDisplay}</p>
                <p class="descricao">${estab.descricao || "Estabelecimento cadastrado."}</p>
                <div class="info">
                    <p><i class="fa-regular fa-clock"></i> ${horarioDisplay}</p>
                    ${telefoneDisplay ? `<p><i class="fa-solid fa-phone"></i> ${telefoneDisplay}</p>` : ""}
                </div>
                <div class="tags">${tagsHTML}</div>
                <div class="footer">
                    <p class="avaliacoes"><i class="fa-solid fa-star"></i> ${avaliacoes} avaliações</p>
                    <button class="detalhes btn-detalhes">Ver Detalhes</button>
                </div>
            </div>
        `;
        return card;
    }

    async function carregarEstabelecimentosDinamicos() {
        const container = document.getElementById('cards-container-locais');
        if (!container) return;
        const estabelecimentos = await fetchEstabelecimentos();
        if (estabelecimentos.length === 0) return;
        estabelecimentos.forEach(estab => container.appendChild(criarCardDinamico(estab)));
    }

    // ─── CONTADOR ─────────────────────────────────────────────────────────────
    function atualizarContador(total) {
        const el = document.getElementById('contador-locais');
        if (el) el.textContent = total;
    }

    // ─── FILTRO ───────────────────────────────────────────────────────────────
    function textoDoCard(card) {
        const nome      = card.querySelector('h3')?.textContent || '';
        const local     = card.querySelector('.local')?.textContent || '';
        const descricao = card.querySelector('.descricao')?.textContent || '';
        const tags      = card.querySelector('.tags')?.textContent || '';
        const categoria = card.getAttribute('data-categoria-card') || '';
        return norm(`${nome} ${local} ${descricao} ${tags} ${categoria}`);
    }

    function aplicarFiltro() {
        const container = document.getElementById('cards-container-locais');
        if (!container) return;

        let cards = Array.from(container.querySelectorAll('.card'));
        const tNorm = norm(termoAtual);
        const cNorm = norm(categoriaAtual);
        let contador = 0;

        // 1. Filtrar visibilidade
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

        // 2. Ordenar os cards visíveis dentro do container
        const visiveis = cards.filter(c => c.style.display !== 'none');

        if (ordenacaoAtual === 'melhor-avaliados') {
            visiveis.sort((a, b) => {
                const notaA = parseFloat(a.getAttribute('data-nota')) || 0;
                const notaB = parseFloat(b.getAttribute('data-nota')) || 0;
                return notaB - notaA;
            });
        } else if (ordenacaoAtual === 'mais-avaliados') {
            visiveis.sort((a, b) => {
                const avA = parseInt(a.getAttribute('data-avaliacoes')) || 0;
                const avB = parseInt(b.getAttribute('data-avaliacoes')) || 0;
                return avB - avA;
            });
        }

        // Re-insere na ordem correta
        visiveis.forEach(card => container.appendChild(card));

        atualizarContador(contador);
        atualizarMensagemVazia(contador);
    }

    function atualizarMensagemVazia(total) {
        const ID = 'locais-sem-resultado';
        let msg = document.getElementById(ID);
        if (total === 0) {
            if (!msg) {
                msg = document.createElement('div');
                msg.id = ID;
                msg.style.cssText = "text-align:center;padding:40px;color:#888;font-family:Poppins,sans-serif;";
                msg.innerHTML = `<p>Nenhum local encontrado para esta busca.</p>`;
                document.getElementById('cards-container-locais')?.after(msg);
            }
        } else {
            msg?.remove();
        }
    }

    // ─── DROPDOWN GENÉRICO ────────────────────────────────────────────────────
    function criarDropdown(botao, itens, onSelect) {
        // Remove dropdown existente se houver
        function fecharDropdown() {
            const d = document.getElementById('dropdown-aberto');
            if (d) d.remove();
        }

        botao.addEventListener('click', (e) => {
            e.stopPropagation();
            fecharDropdown();

            const menu = document.createElement('div');
            menu.id = 'dropdown-aberto';
            menu.style.cssText = `
                position: absolute;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                z-index: 999;
                min-width: 180px;
                overflow: hidden;
                font-family: Poppins, sans-serif;
            `;

            itens.forEach(item => {
                const op = document.createElement('div');
                op.textContent = item.label;
                op.style.cssText = `
                    padding: 10px 16px;
                    font-size: 13px;
                    color: #333;
                    cursor: pointer;
                    transition: background 0.15s;
                `;
                op.addEventListener('mouseenter', () => op.style.background = '#f5f5f5');
                op.addEventListener('mouseleave', () => op.style.background = '');
                op.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onSelect(item);
                    // Atualiza texto do botão
                    const span = botao.childNodes[0];
                    if (span) span.textContent = item.label + ' ';
                    fecharDropdown();
                });
                menu.appendChild(op);
            });

            // Posiciona abaixo do botão
            const rect = botao.getBoundingClientRect();
            menu.style.top  = `${rect.bottom + window.scrollY + 4}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
            document.body.appendChild(menu);
        });

        // Fecha ao clicar fora
        document.addEventListener('click', () => fecharDropdown());
    }

    // ─── INICIALIZAR FILTROS ──────────────────────────────────────────────────
    function inicializarFiltros() {
        // Busca por texto
        const inputBusca = document.getElementById('search-locais');
        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => {
                termoAtual = e.target.value;
                aplicarFiltro();
            });
        }

        // Botões de categoria (Todos / Baladas / Bares...)
        const botoesCat = document.querySelectorAll('#botoes-categoria-locais [data-categoria]');
        botoesCat.forEach(btn => {
            btn.addEventListener('click', () => {
                botoesCat.forEach(b => b.classList.remove('ativo', 'active'));
                btn.classList.add('ativo', 'active');
                categoriaAtual = btn.getAttribute('data-categoria') || 'todos';
                aplicarFiltro();
            });
        });

        // Dropdown "Todas as Categorias"
        const botoesDropdown = document.querySelectorAll('.botao-dropdown1');
        const botaoCategoria = botoesDropdown[0];
        const botaoOrdenacao = botoesDropdown[1];

        if (botaoCategoria) {
            criarDropdown(botaoCategoria, [
                { label: 'Todas as Categorias', valor: 'todos' },
                { label: 'Baladas',             valor: 'baladas' },
                { label: 'Bares',               valor: 'bares' },
                { label: 'Restaurantes',        valor: 'restaurantes' },
                { label: 'Shows',               valor: 'shows' },
            ], (item) => {
                categoriaAtual = item.valor;
                // Sincroniza botões menores
                botoesCat.forEach(b => {
                    b.classList.remove('ativo', 'active');
                    if (b.getAttribute('data-categoria') === item.valor) {
                        b.classList.add('ativo', 'active');
                    }
                });
                aplicarFiltro();
            });
        }

        // Dropdown "Melhor avaliados"
        if (botaoOrdenacao) {
            criarDropdown(botaoOrdenacao, [
                { label: 'Padrão',           valor: 'padrao' },
                { label: 'Melhor avaliados', valor: 'melhor-avaliados' },
                { label: 'Mais avaliados',   valor: 'mais-avaliados' },
            ], (item) => {
                ordenacaoAtual = item.valor;
                aplicarFiltro();
            });
        }
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', async () => {
        await carregarEstabelecimentosDinamicos();
        inicializarFiltros();
        aplicarFiltro();

        // Delegação de clique para "Ver Detalhes"
        const container = document.getElementById('cards-container-locais');
        if (container) {
            container.addEventListener('click', (e) => {
                const botao = e.target.closest('.detalhes');
                if (!botao) return;
                const card = botao.closest('.card');
                if (!card) return;
                const estabId = card.getAttribute('data-estab-id');
                if (estabId) {
                    window.location.href = `/frontend/detalheslocais/detalheslocais.html?id=${estabId}`;
                } else {
                    alert("Este local ainda não possui página de detalhes no banco de dados.");
                }
            });
        }
    });

})();
"use strict";

// ============================================================
// header.js — Login, cidade, busca global + dropdown Indeed
// ============================================================

function initHeader() {

    // ----------------------------------------------------------
    // DADOS PERSISTENTES
    // ----------------------------------------------------------
    function loadPersistentData() {
        const photoUrl = localStorage.getItem('profilePhotoUrl');
        const name     = localStorage.getItem('profileName');
        const email    = localStorage.getItem('profileEmail');

        const headerPic     = document.getElementById('profile-pic-header');
        const dropdownName  = document.querySelector('.dropdown-menu .user-info strong');
        const dropdownEmail = document.querySelector('.dropdown-menu .user-info span');
        const dropdownImg   = document.querySelector('.dropdown-menu .user-info img');

        if (photoUrl && headerPic)     headerPic.src              = photoUrl;
        if (photoUrl && dropdownImg)   dropdownImg.src            = photoUrl;
        if (name     && dropdownName)  dropdownName.textContent   = name;
        if (email    && dropdownEmail) dropdownEmail.textContent  = email;
    }

    loadPersistentData();

    // ----------------------------------------------------------
    // LOGOUT
    // ----------------------------------------------------------
    function setupLogoutListener() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (!logoutBtn || logoutBtn.dataset.listenerAdded) return;

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            ['userIsLoggedIn','profilePhotoUrl','profileName','profileEmail']
                .forEach(k => localStorage.removeItem(k));
            alternarEstadoHeader(false);
            window.location.href = '../login/login.html';
        });

        logoutBtn.dataset.listenerAdded = 'true';
    }

    // ----------------------------------------------------------
    // ESTADO LOGADO / NÃO LOGADO
    // ----------------------------------------------------------
    function alternarEstadoHeader(logado) {
        const naoLogado    = document.getElementById('header-nao-logado');
        const logadoDiv    = document.getElementById('header-logado');
        const hamburgerBtn = document.getElementById('hamburger-btn');

        if (!naoLogado || !logadoDiv) return;

        if (logado) {
            naoLogado.style.display = 'none';
            logadoDiv.style.display = 'flex';
            if (hamburgerBtn) hamburgerBtn.style.display = 'flex';
            setupLogoutListener();
        } else {
            naoLogado.style.display = 'flex';
            logadoDiv.style.display = 'none';
            if (hamburgerBtn) hamburgerBtn.style.display = 'none';
        }
    }

    alternarEstadoHeader(localStorage.getItem('userIsLoggedIn') === 'true');

    // ----------------------------------------------------------
    // DROPDOWN DE PERFIL
    // ----------------------------------------------------------
    const profileContainer = document.querySelector('.user-profile-container');
    if (profileContainer) {
        profileContainer.querySelector('.profile-avatar')?.addEventListener('click', (e) => {
            e.stopPropagation();
            profileContainer.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!profileContainer.contains(e.target))
                profileContainer.classList.remove('active');
        });
    }

    // ----------------------------------------------------------
    // BOTÃO LOGIN
    // ----------------------------------------------------------
    const openLoginBtn = document.getElementById('openLogin');
    if (openLoginBtn) {
        openLoginBtn.replaceWith(openLoginBtn.cloneNode(true));
        document.getElementById('openLogin').addEventListener('click', (e) => {
            e.preventDefault();
            const isHome = window.location.pathname.includes('index.html')
                        || window.location.pathname.endsWith('/');
            if (isHome) window.postMessage('OPEN_LOGIN_MODAL', '*');
            else window.location.href = '../login/login.html';
        });
    }

    // ----------------------------------------------------------
    // HAMBURGER
    // ----------------------------------------------------------
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });

    // ----------------------------------------------------------
    // CARD DE CIDADE
    // ----------------------------------------------------------
    const cityBtn     = document.querySelector('.city-btn');
    const cityCard    = document.getElementById('city-card');
    const overlay     = document.getElementById('city-overlay');
    const closeCard   = document.getElementById('close-card');
    const citySearch  = document.getElementById('city-search');
    const useLocation = document.getElementById('use-location');
    const cityItems   = document.querySelectorAll('.city-list li');

    const abrirCard  = () => { if (cityCard) cityCard.style.display = 'block'; if (overlay) overlay.style.display = 'block'; };
    const fecharCard = () => { if (cityCard) cityCard.style.display = 'none';  if (overlay) overlay.style.display = 'none';  };

    function selecionarCidade(nome) {
        if (cityBtn) cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${nome}`;
        localStorage.setItem('cidade', nome);
        fecharCard();
    }

    cityBtn?.addEventListener('click', abrirCard);
    closeCard?.addEventListener('click', fecharCard);
    overlay?.addEventListener('click', fecharCard);
    cityItems.forEach(i => i.addEventListener('click', () => selecionarCidade(i.dataset.city)));

    const savedCity = localStorage.getItem('cidade');
    if (savedCity && cityBtn) cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${savedCity}`;

    citySearch?.addEventListener('input', () => {
        const val = citySearch.value.toLowerCase();
        cityItems.forEach(i => {
            i.style.display = i.dataset.city.toLowerCase().includes(val) ? 'flex' : 'none';
        });
    });

    // USAR LOCALIZAÇÃO
    if (useLocation) {
        useLocation.addEventListener("click", () => {

            if (!navigator.geolocation) {
                alert("Geolocalização não suportada pelo seu navegador.");
                return;
            }

            if (cityBtn) {
                cityBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Buscando...`;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
                            { headers: { "Accept": "application/json" } }
                        );

                        const data = await response.json();

                        const cityName =
                            data.address?.city ||
                            data.address?.town ||
                            data.address?.village ||
                            data.address?.municipality ||
                            data.address?.state ||
                            "Localização atual";

                        if (cityBtn) {
                            cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${cityName}`;
                        }

                        localStorage.setItem("cidade", cityName);
                        fecharCard();

                    } catch (error) {
                        console.error("Erro ao buscar cidade:", error);

                        if (cityBtn) {
                            cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> Minha localização`;
                        }

                        localStorage.setItem("cidade", "Minha localização");
                        fecharCard();
                    }
                },
                (error) => {
                    console.warn("Geolocalização negada:", error.message);

                    if (cityBtn) {
                        cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> Localização`;
                    }

                    alert("Permita o acesso à localização para usar essa função.");
                },
                {
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    if (cityCard) document.body.appendChild(cityCard);
    if (overlay)  document.body.appendChild(overlay);

    // ----------------------------------------------------------
    // REDIRECIONAMENTOS DO DROPDOWN DE PERFIL
    // ----------------------------------------------------------
    const navMap = {
        'minha-conta'              : '../frontend/perfil/perfil.html',
        'favoritos'                : '../frontend/favoritos/favoritos.html',
        'criar-eventos'            : '../frontend/criareventos/criareventos.html',
        'cadastrar-estabelecimento': '../frontend/criareventos/criareventos.html',
        'dashboard'                : '../frontend/dashboard/dashboard.html',
        'contato'                  : '../frontend/Contato/contato.html',
    };
    Object.entries(navMap).forEach(([id, href]) => {
        document.getElementById(id)?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = href;
        });
    });

    // ==========================================================
    // DROPDOWN DE BUSCA — ESTILO INDEED
    // ==========================================================

    const searchInput    = document.getElementById('search-input');
    const searchWrapper  = document.getElementById('search-bar-wrapper');
    const suggestionsBox = document.getElementById('search-suggestions');
    const btnBuscar      = document.getElementById('btn-buscar');

    const CHAVE_RECENTES = 'buscasRecentes';
    const MAX_RECENTES   = 5;
    const MAX_SUGESTOES  = 6;

    // ---- Ícones por categoria ----
    const icones = {
        'show': 'fa-music', 'música': 'fa-music', 'festa': 'fa-glass-cheers',
        'bar': 'fa-cocktail', 'restaurante': 'fa-utensils',
        'teatro': 'fa-theater-masks', 'esporte': 'fa-futbol',
        'balada': 'fa-music', 'stand-up': 'fa-microphone',
        'arte': 'fa-palette', 'default': 'fa-calendar-alt',
    };
    const getIcone = (cat) => icones[(cat || '').toLowerCase()] || icones['default'];

    // ---- Normalizar ----
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // ---- Buscas recentes ----
    function getRecentes() {
        try { return JSON.parse(localStorage.getItem(CHAVE_RECENTES)) || []; } catch { return []; }
    }
    function salvarRecente(termo) {
        if (!termo.trim()) return;
        let r = getRecentes().filter(x => norm(x) !== norm(termo));
        r.unshift(termo.trim());
        localStorage.setItem(CHAVE_RECENTES, JSON.stringify(r.slice(0, MAX_RECENTES)));
    }
    function removerRecente(termo) {
        localStorage.setItem(CHAVE_RECENTES,
            JSON.stringify(getRecentes().filter(x => norm(x) !== norm(termo))));
    }

    // ---- Lê cards diretamente do DOM da página atual ----
    // Suporta: .card-local, .card-evento (index.html) e .evento-card (eventos.html)
    function lerCardsDaPagina() {
        const itens = [];

        document.querySelectorAll('.card-local, .card-evento, .card, .evento-card').forEach(card => {
            const nome      = card.querySelector('h3')?.textContent.trim() || '';

            // Localização: tenta vários seletores possíveis
            const localEl   = card.querySelector('.evento-local, .local, .meta .fa-location-dot, p.meta');
            const local     = localEl?.textContent.trim() || '';

            // Categoria: tag visível ou data-attribute
            const tagEl     = card.querySelector('[class*="tag"], [class*="badge"]');
            const categoria = tagEl?.textContent.trim()
                           || card.getAttribute('data-categoria-card')
                           || card.getAttribute('data-categoria')
                           || '';

            const img       = card.querySelector('img')?.src || '';
            const dataEvt   = card.querySelector('.evento-data-local p, .local-meta p, p.meta')?.textContent.trim() || '';

            // ID do evento (usado para .evento-card da página eventos.html)
            const eventoId  = card.getAttribute('data-id') || card.getAttribute('data-event-id') || '';

            if (nome) itens.push({ nome, local, categoria, img, data: dataEvt, eventoId, _el: card });
        });

        return itens;
    }

    function filtrarSugestoes(termo) {
        const t = norm(termo);
        return lerCardsDaPagina().filter(i =>
            norm(i.nome).includes(t) ||
            norm(i.categoria).includes(t) ||
            norm(i.local).includes(t)
        ).slice(0, MAX_SUGESTOES);
    }

    // ---- Destaque ----
    function destacar(txt, termo) {
        if (!termo) return txt;
        return txt.replace(
            new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
            '<mark>$1</mark>'
        );
    }

    const abrirDropdown  = () => suggestionsBox?.classList.add('active');
    const fecharDropdown = () => suggestionsBox?.classList.remove('active');

    // ----------------------------------------------------------
    // NAVEGAR PARA DETALHES
    // card-local  → salva localStorage + vai para detalheslocais
    // card-evento / evento-card → vai para detalhesEventos?id=X
    // ----------------------------------------------------------
    function navegarParaDetalhes(item) {
        const el = item._el;

        const isLocal  = el?.classList.contains('card-local');
        const isEvento = el?.classList.contains('card-evento') || el?.classList.contains('evento-card');

        if (isLocal) {
            // ---- ESTABELECIMENTO ----
            const localLimpo = (item.local || '')
                .replace(/^\s*[\S]*location[\S]*\s*/i, '')
                .replace(/^\s*[\S]*map[\S]*\s*/i, '')
                .trim();

            const dadosLocal = {
                nome:       item.nome,
                categoria:  el.dataset.categoriaCard  || item.categoria || '',
                local:      localLimpo,
                imagem:     el.querySelector('img')?.src || item.img || '',
                nota:       el.dataset.nota           || '4.5',
                avaliacoes: el.dataset.avaliacoes     || '0 avaliacoes',
                telefone:   el.dataset.telefone       || '',
                horario:    el.dataset.horario        || '',
                preco:      el.dataset.preco          || '$$',
                tags:       el.dataset.tags           || item.categoria || '',
                descricao:  el.dataset.descricao      || '',
            };

            localStorage.setItem('localDetalhes', JSON.stringify(dadosLocal));

            const href = el.getAttribute('href');
            window.location.href = href || 'detalheslocais/detalheslocais.html';

        } else if (isEvento) {
            // ---- EVENTO ----
            // Coleta todos os dados disponíveis do card e salva no localStorage
            const localTexto = (item.local || '')
                .replace(/^\s*[\S]*location[\S]*\s*/i, '')
                .replace(/^\s*[\S]*map[\S]*\s*/i, '')
                .trim();

            // Tenta pegar data/hora do card
            const metaEls   = el.querySelectorAll('p.meta, .evento-data-local p, .local-meta p');
            const dataHora  = metaEls[0]?.textContent.trim() || '';
            const descricao = el.querySelector('.descricao, p.descricao')?.textContent.trim() || '';
            const badge     = el.querySelector('[class*="badge"], [class*="tag-evento"]')?.textContent.trim() || item.categoria || '';
            const preco     = el.querySelector('.preco')?.textContent.trim() || 'Gratuito';

            const dadosEvento = {
                nome:      item.nome,
                categoria: badge,
                local:     localTexto,
                imagem:    el.querySelector('img')?.src || item.img || '',
                dataHora:  dataHora,
                descricao: descricao,
                preco:     preco,
                // data-* extras se existirem
                nota:      el.dataset.nota      || '',
                avaliacoes:el.dataset.avaliacoes || '',
                telefone:  el.dataset.telefone  || '',
                horario:   el.dataset.horario   || '',
                tags:      el.dataset.tags      || badge,
            };

            localStorage.setItem('eventoDetalhes', JSON.stringify(dadosEvento));

            // Tenta pegar href do card ou do botão "Mais Detalhes"
            const hrefExistente = el.getAttribute('href')
                               || el.querySelector('a.btn-detalhes, a[href*="detalhes"]')?.getAttribute('href')
                               || '';

            const eventoId = item.eventoId || el.getAttribute('data-id') || '';

            // Usa o href do próprio card diretamente (relativo à página atual)
            if (hrefExistente && hrefExistente !== "#") {
                window.location.href = hrefExistente;
            } else if (eventoId) {
                window.location.href = `../verDetalhesEventos/detalhesEventos.html?id=${eventoId}`;
            } else {
                window.location.href = "detalheseventos/detalheevento.html";
            }

        } else {
            // Fallback genérico
            if (searchInput) searchInput.value = item.nome;
            dispararBusca();
        }
    }

    // ---- Render: vazio → recentes ----
    function renderVazio() {
        if (!suggestionsBox) return;
        const recentes = getRecentes();
        if (recentes.length === 0) { fecharDropdown(); return; }

        suggestionsBox.innerHTML = `
            <div class="sug-section-title"><span>Buscas recentes</span></div>
            <ul class="sug-list" id="sug-recentes-list"></ul>
        `;

        const ul = suggestionsBox.querySelector('#sug-recentes-list');
        recentes.forEach(termo => {
            const li = document.createElement('li');
            li.className = 'sug-item sug-recente';
            li.innerHTML = `
                <div class="sug-left">
                    <i class="fas fa-clock-rotate-left sug-icon-recente"></i>
                    <span class="sug-texto">${termo}</span>
                </div>
                <button class="sug-remover" title="Remover" aria-label="Remover">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Clique no recente → tenta achar o card pelo nome e navega direto
            li.querySelector('.sug-left').addEventListener('click', () => {
                salvarRecente(termo);
                fecharDropdown();

                // Procura o card que bate com esse termo
                const todos = lerCardsDaPagina();
                const match = todos.find(i => norm(i.nome) === norm(termo));

                if (match) {
                    // Achou o card → navega direto para detalhes
                    navegarParaDetalhes(match);
                } else {
                    // Não achou na página atual → filtra/redireciona normalmente
                    if (searchInput) searchInput.value = termo;
                    dispararBusca();
                }
            });

            li.querySelector('.sug-remover').addEventListener('click', (e) => {
                e.stopPropagation();
                removerRecente(termo);
                renderVazio();
            });

            ul.appendChild(li);
        });

        abrirDropdown();
    }

    // ---- Render: com texto → sugestões dos cards ----
    function renderSugestoes(termo) {
        if (!suggestionsBox) return;
        const resultados = filtrarSugestoes(termo);
        suggestionsBox.innerHTML = '';

        if (resultados.length > 0) {
            const secTitle = document.createElement('div');
            secTitle.className = 'sug-section-title';
            secTitle.innerHTML = '<span>Sugestões</span>';
            suggestionsBox.appendChild(secTitle);

            const ul = document.createElement('ul');
            ul.className = 'sug-list';

            resultados.forEach(item => {
                const li = document.createElement('li');
                li.className = 'sug-item sug-evento';
                li.innerHTML = `
                    <div class="sug-left">
                        <div class="sug-icon-evento">
                            <i class="fas ${getIcone(item.categoria)}"></i>
                        </div>
                        <div class="sug-info">
                            <span class="sug-nome">${destacar(item.nome, termo)}</span>
                            <span class="sug-meta">
                                ${item.categoria ? `<span class="sug-badge">${item.categoria}</span>` : ''}
                                ${item.local     ? `<i class="fas fa-map-marker-alt"></i>${item.local}` : ''}
                            </span>
                        </div>
                    </div>
                    <i class="fas fa-arrow-up-left sug-completar" title="Preencher busca"></i>
                `;

                // ✅ card-local → detalhes do estabelecimento
                //    card-evento / evento-card → detalhes do evento
                //    outros → filtra na página
                li.querySelector('.sug-left').addEventListener('click', () => {
                    salvarRecente(item.nome);
                    fecharDropdown();

                    const isLocal  = item._el?.classList.contains('card-local');
                    const isEvento = item._el?.classList.contains('card-evento')
                                  || item._el?.classList.contains('evento-card');

                    if (isLocal || isEvento) {
                        navegarParaDetalhes(item);
                    } else {
                        if (searchInput) searchInput.value = item.nome;
                        dispararBusca();
                    }
                });

                // Seta → só preenche o input
                li.querySelector('.sug-completar').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (searchInput) searchInput.value = item.nome;
                    searchInput.focus();
                    renderSugestoes(item.nome);
                });

                ul.appendChild(li);
            });
            suggestionsBox.appendChild(ul);
        }

        // Rodapé "Buscar por X"
        const rodape = document.createElement('div');
        rodape.className = 'sug-rodape';
        rodape.innerHTML = `<i class="fas fa-search"></i><span>Buscar por <strong>"${termo}"</strong></span>`;
        rodape.addEventListener('click', () => {
            salvarRecente(termo);
            fecharDropdown();
            dispararBusca();
        });
        suggestionsBox.appendChild(rodape);

        abrirDropdown();
    }

    // ---- Listeners do input ----
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            const t = searchInput.value.trim();
            if (t.length < 2) renderVazio(); else renderSugestoes(t);
        });

        searchInput.addEventListener('input', () => {
            const t = searchInput.value.trim();
            // Só filtra na página se não tiver sugestões abertas (input vazio/curto)
            // Evita que o filtroHome.js esconda cards antes do usuário clicar na sugestão
            if (t.length < 2) {
                dispararFiltroDireto('');
                renderVazio();
            } else {
                renderSugestoes(t);
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                salvarRecente(searchInput.value.trim());
                fecharDropdown();
                dispararBusca();
            }
            if (e.key === 'Escape') fecharDropdown();
        });
    }

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (searchWrapper && !searchWrapper.contains(e.target)) fecharDropdown();
    });

    // Botão lupa
    btnBuscar?.addEventListener('click', () => {
        salvarRecente(searchInput?.value.trim() || '');
        fecharDropdown();
        dispararBusca();
    });

    // ----------------------------------------------------------
    // FILTRO DIRETO NA PÁGINA (sem redirect)
    // ----------------------------------------------------------
    function dispararFiltroDireto(termo) {
        window.dispatchEvent(new CustomEvent('roles:filtrar', {
            detail: { termo: termo.trim() }
        }));
    }

    // ----------------------------------------------------------
    // BUSCA GLOBAL
    // ----------------------------------------------------------
    function dispararBusca() {
        const termo  = searchInput ? searchInput.value.trim() : '';
        const cidade = localStorage.getItem('cidade') || 'Minha localização';

        localStorage.setItem('filtrosRoles', JSON.stringify({ termo, cidade }));

        const naHome = window.location.pathname.endsWith('index.html')
                    || window.location.pathname.endsWith('/');

        if (naHome) {
            dispararFiltroDireto(termo);
        } else {
            window.location.href = '../frontend/index.html';
        }
    }

    window.dispararBusca = dispararBusca;
}

// ============================================================
// EXECUÇÃO SEGURA
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
} else {
    initHeader();
}
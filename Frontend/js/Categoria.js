document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);

    let nomeCategoria = params.get('name');
    const iconClass = decodeURIComponent(params.get('icon-class') || 'fas fa-star');

    if (nomeCategoria === '+50 anos') nomeCategoria = '50+';

    // --- Mapeamento de cores ---
    const coresPorCategoria = {
        'Baladas':    '#5d3fd3',
        'Bar':        '#fbc02d',
        'Restaurante':'#ff8a65',
        'Karaoke':    '#9e9e9e',
        'Show':       '#29b6f6',
        'Eventos':    '#ec407a',
        'Parques':    '#0d47a1',
        '50+':        '#e53935',
    };

    const corFundoHex = coresPorCategoria[nomeCategoria] || '#6c757d';

    // --- Atualiza o Hero ---
    const heroSection   = document.getElementById('categoria-hero');
    const nomeElement   = document.getElementById('categoria-nome');
    const iconContainer = document.getElementById('categoria-icon');
    const countElement  = document.getElementById('locais-eventos-count');

    if (nomeCategoria) {
        heroSection.style.backgroundColor = corFundoHex;
        nomeElement.textContent            = nomeCategoria;
        iconContainer.innerHTML            = `<i class="${iconClass}"></i>`;
    } else {
        nomeElement.textContent            = 'Categoria Não Encontrada';
        heroSection.style.backgroundColor  = '#6c757d';
        iconContainer.innerHTML            = `<i class="fas fa-question-circle"></i>`;
    }

    // --- Busca dados reais em paralelo ---
    Promise.all([
        buscarLocais(nomeCategoria),
        buscarEventos(nomeCategoria)
    ]).then(([locais, eventos]) => {
        countElement.textContent = `${locais.length} locais · ${eventos.length} eventos`;
        renderizarLocais(locais);
        renderizarEventos(eventos, corFundoHex);
    });

    // --- Lógica de Troca de Tabs ---
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`${button.getAttribute('data-tab')}-tab`).classList.add('active');
        });
    });
});

// =============================================
// BUSCA ESTABELECIMENTOS (LOCAIS) REAIS
// =============================================
async function buscarLocais(categoria) {
    const locaisTab = document.getElementById('locais-tab');

    locaisTab.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Buscando locais...</p>
        </div>`;

    try {
        const res  = await fetch(`${window.API_BASE}/estabelecimentos`);
        if (!res.ok) throw new Error(res.status);
        const todos = await res.json();

        // Filtra pela categoria_card ou tipo, usando includes para match parcial
        const normalizar = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const catNorm    = normalizar(categoria);

        const filtrados = todos.filter(e =>
            normalizar(e.categoria_card).includes(catNorm) ||
            normalizar(e.tipo).includes(catNorm)
        );

        return filtrados;
    } catch (err) {
        console.error('Erro ao buscar locais:', err);
        locaisTab.innerHTML = `
            <div class="sem-encontrado">
                <i class="fas fa-map-marker-alt"></i>
                <h2>Erro ao carregar locais</h2>
                <p>Verifique sua conexão e tente novamente.</p>
                <a href="/frontend/locais/locais.html" class="btn-ver-todos">Ver todos os locais</a>
            </div>`;
        return [];
    }
}

// =============================================
// BUSCA EVENTOS REAIS
// =============================================
async function buscarEventos(categoria) {
    const eventosTab = document.getElementById('eventos-tab');

    eventosTab.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Buscando eventos...</p>
        </div>`;

    try {
        const res  = await fetch(`${window.API_BASE}/eventos`);
        if (!res.ok) throw new Error(res.status);
        const todos = await res.json();

        const normalizar = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const catNorm    = normalizar(categoria);

        const filtrados = todos.filter(e =>
            normalizar(e.categoria).includes(catNorm) ||
            normalizar(e.assunto).includes(catNorm) ||
            normalizar(e.tipo).includes(catNorm)
        );

        return filtrados;
    } catch (err) {
        console.error('Erro ao buscar eventos:', err);
        eventosTab.innerHTML = `
            <div class="sem-encontrado">
                <i class="fas fa-calendar-alt"></i>
                <h2>Erro ao carregar eventos</h2>
                <p>Verifique sua conexão e tente novamente.</p>
                <a href="/frontend/eventos/eventos.html" class="btn-ver-todos">Ver todos os eventos</a>
            </div>`;
        return [];
    }
}

// =============================================
// RENDERIZAÇÃO — LOCAIS
// =============================================
function renderizarLocais(locais) {
    const locaisTab = document.getElementById('locais-tab');

    if (locais.length === 0) {
        locaisTab.innerHTML = `
            <div class="sem-encontrado">
                <i class="fas fa-map-marker-alt"></i>
                <h2>Nenhum local encontrado</h2>
                <p>Ainda não temos locais cadastrados nesta categoria.</p>
                <a href="/frontend/locais/locais.html" class="btn-ver-todos">Ver todos os locais</a>
            </div>`;
        return;
    }

    locaisTab.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'populares-grid';

    locais.forEach(local => {
        // Monta comodidades como tags (pode ser string separada por vírgula ou array)
        let tags = [];
        if (local.comodidades) {
            tags = Array.isArray(local.comodidades)
                ? local.comodidades
                : local.comodidades.split(',').map(t => t.trim()).filter(Boolean);
        }
        const tagsHTML = tags.slice(0, 3).map(t => `<span class="atributo">${t}</span>`).join('');

        // Imagem: usa img_capa se existir
        const imagem = (local.img_capa || local.img_logo)
    ? (() => {
        const src = local.img_capa || local.img_logo;
        // Se for base64, usa direto
        if (src.startsWith('data:')) return src;
        // Se for URL completa, usa direto
        if (src.startsWith('http')) return src;
        // Se for caminho relativo, adiciona a base
        return `${window.API_BASE}${src}`;
      })()
    : '/frontend/imagens/placeholder.png';

        // Endereço resumido
        const endereco = [local.bairro, local.cidade].filter(Boolean).join(', ') || local.endereco || '—';

        // Avaliação
        const nota       = parseFloat(local.nota) || 0;
        const avaliacoes = local.avaliacoes || 0;

        grid.innerHTML += `
            <div class="card-local" onclick="window.location='/frontend/detalheslocais/detalheslocais.html?id=${local.id}'"'">
                <div class="card-image-wrap">
                    <img src="${imagem}" alt="${local.nome}" loading="lazy"
                         onerror="this.src='/frontend/imagens/placeholder.png'">
                    <span class="tag">${local.categoria_card || local.tipo || ''}</span>
                    ${nota > 0 ? `<span class="avaliacao"><i class="fas fa-star"></i> ${nota.toFixed(1)}</span>` : ''}
                </div>
                <div class="card-content">
                    <h3>${local.nome}</h3>
                    <div class="local-meta">
                        <p class="endereco"><i class="fas fa-map-marker-alt"></i> ${endereco}</p>
                        <p class="preco-faixa">${local.faixa_preco || ''}</p>
                    </div>
                    <p class="descricao">${local.descricao || ''}</p>
                    ${local.horario ? `<div class="horario"><i class="fas fa-clock"></i> ${local.horario}</div>` : ''}
                    ${tagsHTML ? `<div class="atributos">${tagsHTML}</div>` : ''}
                    <div class="card-footer">
                        <p class="avaliacoes-count">${avaliacoes} avaliação${avaliacoes !== 1 ? 'ões' : ''}</p>
                        <button class="btn-detalhes">Ver Detalhes</button>
                    </div>
                </div>
            </div>`;
    });

    locaisTab.appendChild(grid);
}

// =============================================
// RENDERIZAÇÃO — EVENTOS
// =============================================
function renderizarEventos(eventos, corCategoria) {
    const eventosTab = document.getElementById('eventos-tab');

    if (eventos.length === 0) {
        eventosTab.innerHTML = `
            <div class="sem-encontrado">
                <i class="fas fa-calendar-alt"></i>
                <h2>Nenhum evento encontrado</h2>
                <p>Ainda não temos eventos cadastrados nesta categoria.</p>
                <a href="/frontend/eventos/eventos.html" class="btn-ver-todos">Ver todos os eventos</a>
            </div>`;
        return;
    }

    eventosTab.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'eventos-grid';

    eventos.forEach(evento => {
        const imagem = evento.imagem || evento.img_capa || evento.foto
            ? (() => {
                const src = evento.imagem || evento.img_capa || evento.foto;
                return src.startsWith('http') ? src : `${window.API_BASE}${src}`;
              })()
            : null;

        // Formata data — corrigido para incluir data_inicio
        let dataFormatada = '';
        if (evento.data_inicio || evento.data || evento.data_evento) {
            const raw = evento.data_inicio || evento.data || evento.data_evento;
            try {
                dataFormatada = new Date(raw).toLocaleDateString('pt-BR', {
                    weekday: 'short', day: '2-digit', month: 'short'
                });
            } catch { dataFormatada = raw; }
        }

        // Preço — corrigido para incluir preco_minimo
        let preco = 'Consultar';
        if (evento.preco_minimo) {
            preco = `A partir de R$ ${parseFloat(evento.preco_minimo).toFixed(2)}`;
        } else if (evento.preco || evento.valor) {
            preco = evento.preco || evento.valor;
        }

        const horario      = evento.horario || evento.hora || '';
        const local        = evento.local || evento.endereco || evento.local_nome || '';
        const interessados = evento.interessados || evento.confirmados || 0;

        grid.innerHTML += `
            <div class="card-evento" onclick="window.location='/frontend/detalheseventos/detalheevento.html?id=${evento.id}'">
                <div class="evento-imagem-wrap" style="background:${corCategoria}22">
                    ${imagem
                        ? `<img src="${imagem}" alt="${evento.nome || evento.titulo}"
                               loading="lazy" onerror="this.style.display='none'">`
                        : placeholderEvento(evento.nome || evento.titulo || '', corCategoria)
                    }
                    <span class="tag-evento">${evento.categoria || evento.assunto || evento.tipo || ''}</span>
                </div>
                <div class="evento-content">
                    <h3>${evento.nome || evento.titulo || ''}</h3>
                    <span class="preco-evento" style="color:#16a34a!important">${preco}</span>
                    <p class="descricao-evento">${evento.descricao || ''}</p>
                    <div class="evento-data-local">
                        ${dataFormatada ? `<p><i class="fas fa-calendar-alt"></i> ${dataFormatada}</p>` : ''}
                        ${horario       ? `<p><i class="fas fa-clock"></i> ${horario}</p>`              : ''}
                    </div>
                    ${local ? `<p class="evento-local"><i class="fas fa-map-marker-alt"></i> ${local}</p>` : ''}
                    ${interessados ? `
                        <div class="evento-interessados">
                            <i class="fas fa-users"></i> ${interessados} pessoas interessadas
                        </div>` : ''}
                    <div class="evento-footer">
                        <button class="btn-detalhes-evento">Mais Detalhes</button>
                        <button class="btn-confirmar-evento">Confirmar Presença</button>
                    </div>
                </div>
            </div>`;
    });

    eventosTab.appendChild(grid);
}

// =============================================
// PLACEHOLDER SVG PARA EVENTOS SEM IMAGEM
// =============================================
function placeholderEvento(nome, cor) {
    const iniciais = nome.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
    return `
        <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">
            <div style="
                width:60px;height:60px;border-radius:14px;
                background:${cor}33;border:1px solid ${cor}55;
                display:flex;align-items:center;justify-content:center;
                font-family:'Poppins',sans-serif;font-size:1.4rem;font-weight:700;color:${cor}
            ">${iniciais}</div>
        </div>`;
}
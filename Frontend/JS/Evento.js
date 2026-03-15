
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Lógica para transformar botões 'Mais Detalhes' em links ---
    const detalheButtons = document.querySelectorAll('.btn-detalhes');

    detalheButtons.forEach(button => {
        const eventId = button.getAttribute('data-event-id');

        if (eventId) {
            const linkDetalhes = document.createElement('a');

            // IMPORTANTE: Este é o link de destino correto
            linkDetalhes.href = `/frontend/verDetalhesEventos/detalhesEventos.html?id=${eventId}`;

            // Copia as classes e o texto do botão original para manter o estilo
            linkDetalhes.className = button.className;
            linkDetalhes.textContent = button.textContent;
            linkDetalhes.setAttribute('role', 'button');

            // Substitui o botão pelo novo link
            button.parentNode.replaceChild(linkDetalhes, button);
        }
    });

    // --- CORREÇÃO: Lógica para transformar botões 'Confirmar Presença' em links ---
    const confirmarButtons = document.querySelectorAll('.btn-confirmar');

    confirmarButtons.forEach(button => {
        const linkConfirmar = document.createElement('a');

        // IMPORTANTE: Este é o link de destino correto para a página de confirmação
        linkConfirmar.href = `/frontend/verDetalhesEventos/presencaConfirmada.html`;

        // Copia as classes e o texto do botão original para manter o estilo
        linkConfirmar.className = button.className;
        linkConfirmar.textContent = button.textContent;
        linkConfirmar.setAttribute('role', 'button');

        // Substitui o botão pelo novo link
        button.parentNode.replaceChild(linkConfirmar, button);
    });
    // --- FIM DA CORREÇÃO ---


    /* ==================================================
    // --- 2. LÓGICA DE EVENTOS (Filtros e Contador) ---
    // Funções reestruturadas para funcionar em conjunto
    ================================================== */
    const searchInput = document.getElementById('searchInput');
    const eventosContainer = document.getElementById('eventosContainer');
    const pillsContainer = document.getElementById('pillsContainer');

    // Função para obter o estado atual dos filtros
    function getEstadoFiltros() {
        // Obtém a categoria ativa (pill com a classe 'active')
        const categoriaAtiva = document.querySelector('.pill.active')?.getAttribute('data-cat') || 'todas';
        // Obtém o termo de busca atual, normaliza e remove espaços
        const termoBusca = (searchInput?.value || '').toLowerCase().trim();
        return { categoriaAtiva, termoBusca };
    }

    // Função auxiliar para busca de texto
    function nomeBusca(termo, nome, descricao) {
        if (termo === '') return true; // Se a busca está vazia, considera que corresponde a tudo
        return nome.includes(termo) || descricao.includes(termo);
    }

    // Função para aplicar os filtros de Categoria E Busca
    function aplicarFiltros() {
        const { categoriaAtiva, termoBusca } = getEstadoFiltros();
        const cards = document.querySelectorAll('.evento-card');

        cards.forEach(card => {
            const cardCat = (card.getAttribute('data-categoria') || '').toLowerCase();
            const nomeEvento = card.querySelector('h3').textContent.toLowerCase();
            const descricaoEvento = card.querySelector('.descricao').textContent.toLowerCase();

            // 1. Verifica se corresponde à busca de texto
            const correspondeAoTexto = nomeBusca(termoBusca, nomeEvento, descricaoEvento);

            // 2. Verifica se corresponde à categoria
            const correspondeACategoria = (categoriaAtiva === 'todas' || cardCat === categoriaAtiva);

            // O cartão é exibido SE: (Corresponder ao texto) E (Corresponder à categoria ativa)
            card.style.display = (correspondeAoTexto && correspondeACategoria) ? 'flex' : 'none';
        });

        atualizarContador();
    }

    // Função para atualizar o contador de eventos visíveis
    function atualizarContador() {
        // Conta quantos cards estão com display: flex (visíveis)
        const eventosVisiveis = document.querySelectorAll('.evento-card[style*="flex"]').length;
        document.getElementById('qtdEventos').textContent = eventosVisiveis;

        // Caso especial: Se a busca está vazia e estamos no filtro "Todos", mostra o total
        if (eventosVisiveis === 0 && searchInput.value.trim() === '') {
            document.getElementById('qtdEventos').textContent = document.querySelectorAll('.evento-card').length;
        }
    }

    // --- Listeners de Eventos ---

    // 1. Inicializa o contador e aplica filtros na carga
    aplicarFiltros();

    // 2. Listener para o campo de busca (Keyup)
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            // Ao digitar, aplica os filtros de texto E de categoria
            aplicarFiltros();
        });
    }

    // 3. Listener de clique para os filtros de "Pills"
    if (pillsContainer) {
        pillsContainer.addEventListener('click', (e) => {
            if (!e.target.matches('.pill')) return;

            // Remove a classe 'active' de todas as pills e adiciona à clicada
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');

            // Ao clicar na pill, aplica os filtros de categoria E de texto
            aplicarFiltros();
        });
    }

    // 4. MutationObserver para o contador (monitora mudanças nos estilos dos cartões)
    if (eventosContainer) {
        const observer = new MutationObserver(() => aplicarFiltros());
        // Observa mudanças de estilo (display: flex/none) nos elementos filhos
        observer.observe(eventosContainer, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    }
});
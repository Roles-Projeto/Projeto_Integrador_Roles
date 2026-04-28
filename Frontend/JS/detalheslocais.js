
//detalherlocal,javascript
// Função para carregar dados do local do localStorage
function loadLocalDataFromStorage() {
    const dataJson = localStorage.getItem('localDetalhes');
    if (dataJson) {
        try {
            return JSON.parse(dataJson);
        } catch (e) {
            console.error("Erro ao fazer parse dos dados do local:", e);
            return null;
        }
    }
    return null;
}

// Função para preencher a página usando os IDs do seu HTML
function updatePage(localData) {
    if (!localData) {
        console.warn('Não foi possível carregar os dados do local.');
        return;
    }

    // --- 1. Preparar e Limpar os Dados ---
    const ratingText = localData.nota.replace('⭐', '').trim();
    const reviewsText = localData.avaliacoes.replace('avaliacoes', '').trim();
    const phoneClean = localData.telefone.replace(/[^\d\s\-\(\)]/g, '').trim();
    const localClean = localData.local.replace(/i\s*fa-solid\s*fa-location-dot/g, '').replace('location-dot', '').trim();
    const hoursClean = localData.horario.replace(/[^\d\s\–\:]/g, '').trim();

    // --- 2. Hero Section ---
    document.getElementById('page-title').textContent = localData.nome;
    document.getElementById('local-name').textContent = localData.nome;
    document.getElementById('local-type').textContent = localData.categoria;
    document.getElementById('local-rating').innerHTML =
        `<i class="fas fa-star"></i> ${ratingText} (${reviewsText} avaliações) | <i class="fas fa-map-marker-alt"></i> ${localClean}`;
    document.getElementById('local-price-icon').textContent = localData.preco;

    const heroSection = document.getElementById('hero-section');
    if (heroSection && localData.imagem) {
        heroSection.style.backgroundImage = `url('${localData.imagem}')`;
    }

    // --- 3. Visão Geral ---
    document.getElementById('local-description').textContent = localData.descricao;
    document.getElementById('local-hours').textContent = hoursClean;
    document.getElementById('local-contact-phone').textContent = phoneClean;

    // Inserir Tags/Atributos
    const attributesContainer = document.getElementById('local-attributes');
    attributesContainer.innerHTML = '';
    const tagsArray = localData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    tagsArray.forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag;
        attributesContainer.appendChild(span);
    });

    // --- 4. Sidebar ---
    document.getElementById('sidebar-rating').innerHTML =
        `<i class="fas fa-star"></i> ${ratingText} (${reviewsText})`;
    document.getElementById('sidebar-type').textContent = localData.categoria;
    document.getElementById('sidebar-price-symbol').textContent = localData.preco;
    document.getElementById('sidebar-hours').textContent = hoursClean;
    document.getElementById('sidebar-phone').textContent = phoneClean;
    document.getElementById('sidebar-address').textContent = localClean;

    // --- 5. Compact Info ---
    document.getElementById('info-address').textContent = localClean;
    document.getElementById('info-phone').textContent = phoneClean;
    document.getElementById('info-hours').textContent = hoursClean;
}

// FUNÇÃO DE NAVEGAÇÃO ENTRE ABAS
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.getAttribute('data-tab');

            // 1. Remove a classe 'active' de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 2. Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');

            // 3. Adiciona a classe 'active' ao conteúdo correspondente
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Execução: Carrega os dados e configura a navegação de abas
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega e exibe os dados
    const localData = loadLocalDataFromStorage();
    updatePage(localData);

    // 2. Configura a troca de abas
    setupTabNavigation();
});


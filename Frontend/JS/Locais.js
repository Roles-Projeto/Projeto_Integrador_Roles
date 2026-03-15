
// Função para coletar todos os dados de um card específico
function coletarDadosDoCard(cardElement) {
    const nomeElement = cardElement.querySelector('h3');
    let nomeTexto = nomeElement.textContent;
    let precoTexto = cardElement.querySelector('.preco').textContent.trim();

    // Limpa o nome removendo a tag de preço
    nomeTexto = nomeTexto.replace(precoTexto, '').trim();

    const categoria = cardElement.querySelector('.categoria').textContent.trim();
    const local = cardElement.querySelector('.local').textContent.trim();
    const descricao = cardElement.querySelector('.descricao').textContent.trim();
    const horario = cardElement.querySelector('.info p:nth-child(1)').textContent.replace(/(\s*clock\s*)|( Verificar Agenda)/, '').trim();
    const telefone = cardElement.querySelector('.info p:nth-child(2)').textContent.replace(/(\s*phone\s*)/, '').trim();
    const nota = cardElement.querySelector('.nota').textContent.trim();
    const avaliacoes = cardElement.querySelector('.avaliacoes').textContent.replace(/[^\d\s\w]/g, '').trim();
    const imagem = cardElement.querySelector('.card-img img').getAttribute('src');

    // Coletar todas as tags
    const tags = Array.from(cardElement.querySelectorAll('.tags span'))
        .map(span => span.textContent.trim())
        .join(', ');

    return {
        nome: nomeTexto, // Corrigido
        preco: precoTexto, // Corrigido
        categoria,
        local,
        descricao,
        horario,
        telefone,
        nota,
        avaliacoes,
        imagem,
        tags
    };
}

// FUNÇÃO PRINCIPAL: Adiciona o evento de clique aos botões "Ver Detalhes"
function adicionarListenersDetalhes() {
    const botoesDetalhes = document.querySelectorAll('.detalhes');

    botoesDetalhes.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                const localData = coletarDadosDoCard(card);

                // 1. Salva os dados no LocalStorage
                localStorage.setItem('localDetalhes', JSON.stringify(localData));

                // 2. Redireciona para a página de detalhes
                window.location.href = '../ver_detalhes_locais/verdetalheslocais.html';
            } else {
                console.error('Card pai não encontrado.');
            }
        });
    });
}

// Função de filtro por CATEGORIA E TEXTO (agora unificada)
function filtrarLocais(categoria) {
    const cards = document.querySelectorAll('.card');
    let contador = 0;
    // Pega o valor do input de busca, garante que está em minúsculas e sem espaços extras
    const textoBusca = document.getElementById('search-input').value.toLowerCase().trim();

    cards.forEach(card => {
        const categoriaCard = card.getAttribute('data-categoria-card');

        // Coleta todos os textos relevantes para a busca
        const nomeCard = card.querySelector('h3').textContent.toLowerCase();
        const localizacaoCard = card.querySelector('.local').textContent.toLowerCase();
        const tagsCard = card.querySelector('.tags').textContent.toLowerCase();

        // 1. Filtro por Categoria (selecionada no botão)
        const passaPelaCategoria = (categoria === 'todos' || categoriaCard === categoria);

        // 2. Filtro por Texto (digitado na busca)
        const passaPeloTexto = (
            nomeCard.includes(textoBusca) || // Busca no nome
            localizacaoCard.includes(textoBusca) || // Busca na localização
            tagsCard.includes(textoBusca) // Busca nas tags
        );


        if (passaPelaCategoria && passaPeloTexto) {
            card.style.display = 'flex';
            contador++;
        } else {
            card.style.display = 'none';
        }
    });
    document.getElementById('contador-locais').textContent = contador;
}

// Função unificada para aplicar os dois filtros: Categoria e Busca
function aplicarFiltros() {
    // Pega a categoria ativa no momento (usa 'todos' como padrão se nenhuma estiver ativa)
    const categoriaAtiva = document.querySelector('.opçoes-abaixo.ativo')?.getAttribute('data-categoria') || 'todos';
    filtrarLocais(categoriaAtiva);
}


// Execução: Garante que os listeners sejam adicionados após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o Feather Icons (Garante que o ícone de busca apareça)
    feather.replace();

    // Adiciona o listener para os botões de CATEGORIA (filtro)
    const botoesCategoria = document.getElementById('botoes-categoria-locais');
    if (botoesCategoria) {
        botoesCategoria.addEventListener('click', (e) => {
            if (e.target.classList.contains('opçoes-abaixo')) {
                // Remove 'ativo' de todos e adiciona ao clicado
                document.querySelectorAll('.opçoes-abaixo').forEach(btn => btn.classList.remove('ativo'));
                e.target.classList.add('ativo');

                aplicarFiltros(); // Aplica o filtro de categoria E o de texto
            }
        });
    }

    // Adiciona o listener para o campo de BUSCA (Onde você digitou o texto)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros); // Chama a função a cada input
    }


    // Adiciona a funcionalidade de "Ver Detalhes"
    adicionarListenersDetalhes();

    // Inicializa a exibição (Mostra todos os locais ao carregar)
    aplicarFiltros();
});

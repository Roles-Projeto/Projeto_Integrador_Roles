// Função para coletar todos os dados de um card específico
function coletarDadosDoCard(cardElement) {
    const nomeElement = cardElement.querySelector('h3');
    let nomeTexto = nomeElement.textContent;
    let precoTexto = cardElement.querySelector('.rls-preco').textContent.trim();

    // Limpa o nome removendo a tag de preço
    nomeTexto = nomeTexto.replace(precoTexto, '').trim();

    const categoria = cardElement.querySelector('.rls-categoria').textContent.trim();
    const local = cardElement.querySelector('.rls-local').textContent.trim();
    const descricao = cardElement.querySelector('.rls-descricao').textContent.trim();
    const horario = cardElement.querySelector('.rls-info p:nth-child(1)').textContent.replace(/(\s*clock\s*)|( Verificar Agenda)/, '').trim();
    const telefone = cardElement.querySelector('.rls-info p:nth-child(2)').textContent.replace(/(\s*phone\s*)/, '').trim();
    const nota = cardElement.querySelector('.rls-nota').textContent.trim();
    const avaliacoes = cardElement.querySelector('.rls-avaliacoes').textContent.replace(/[^\d\s\w]/g, '').trim();
    const imagem = cardElement.querySelector('.rls-card-img img').getAttribute('src');

    // Coletar todas as tags
    const tags = Array.from(cardElement.querySelectorAll('.rls-tags span'))
        .map(span => span.textContent.trim())
        .join(', ');

    return {
        nome: nomeTexto, 
        preco: precoTexto, 
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
    const botoesDetalhes = document.querySelectorAll('.rls-detalhes');

    botoesDetalhes.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.rls-card');
            if (card) {
                const localData = coletarDadosDoCard(card);

                // 1. Salva os dados no LocalStorage
                localStorage.setItem('localDetalhes', JSON.stringify(localData));

                // 2. Redireciona para a página de detalhes
                window.location.href = '/frontend/verDetalhesLocais/verDetalhesLocais.html';
            } else {
                console.error('Card pai não encontrado.');
            }
        });
    });
}

// Função de filtro por CATEGORIA E TEXTO (agora unificada)
function filtrarLocais(categoria) {
    const cards = document.querySelectorAll('.rls-card');
    let contador = 0;
    const textoBusca = document.getElementById('rls-search-input').value.toLowerCase().trim();

    cards.forEach(card => {
        const categoriaCard = card.getAttribute('data-categoria-card');

        const nomeCard = card.querySelector('h3').textContent.toLowerCase();
        const localizacaoCard = card.querySelector('.rls-local').textContent.toLowerCase();
        const tagsCard = card.querySelector('.rls-tags').textContent.toLowerCase();

        const passaPelaCategoria = (categoria === 'todos' || categoriaCard === categoria);
        const passaPeloTexto = (
            nomeCard.includes(textoBusca) || 
            localizacaoCard.includes(textoBusca) || 
            tagsCard.includes(textoBusca) 
        );

        if (passaPelaCategoria && passaPeloTexto) {
            card.style.display = 'flex';
            contador++;
        } else {
            card.style.display = 'none';
        }
    });
    document.getElementById('rls-contador-locais').textContent = contador;
}

// Função unificada para aplicar os dois filtros: Categoria e Busca
function aplicarFiltros() {
    const categoriaAtiva = document.querySelector('.rls-opcoes-abaixo.rls-ativo')?.getAttribute('data-categoria') || 'todos';
    filtrarLocais(categoriaAtiva);
}

// Execução: Garante que os listeners sejam adicionados após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();

    const botoesCategoria = document.getElementById('rls-botoes-categoria-locais');
    if (botoesCategoria) {
        botoesCategoria.addEventListener('click', (e) => {
            if (e.target.classList.contains('rls-opcoes-abaixo')) {
                document.querySelectorAll('.rls-opcoes-abaixo').forEach(btn => btn.classList.remove('rls-ativo'));
                e.target.classList.add('rls-ativo');

                aplicarFiltros(); 
            }
        });
    }

    const searchInput = document.getElementById('rls-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros); 
    }

    adicionarListenersDetalhes();
    aplicarFiltros();
});

// Dados de perfil simulados (pode ser expandido para todos os perfis)
const DADOS_PERFIS = {
    'Produtora Ji & Cia': {
        descricao: 'Especializada em jazz, blues e eventos culturais ao ar livre. Qualidade e boa música em Goiânia.',
        avaliacao: '4.9',
        eventosRealizados: '42',
        participantes: '7.850',
        seguidores: '1.500',
        eventosAtivos: '5',
        membroDesde: 'Março de 2021',
        email: 'contato@produtorajiecia.com',
        telefone: '(62) 99123-4567',
        avatar: '/frontend/imagens/logo3.png' // Imagem específica (se houver)
    },
    'Drinks & Beer': {
        descricao: 'O melhor do happy hour na T-63! Oferecemos os melhores chopps e drinks com música ambiente e petiscos.',
        avaliacao: '4.7',
        eventosRealizados: '15',
        participantes: '2.500',
        seguidores: '950',
        eventosAtivos: '3',
        membroDesde: 'Outubro de 2022',
        email: 'contato@drinksandbeer.com.br',
        telefone: '(62) 98888-7777',
        avatar: '/frontend/imagens/avatar-generico.jpg'
    },
    // Perfil Padrão/Fallback para quando o parâmetro não for encontrado
    'Eventos Goiânia Premium': {
        descricao: 'Somos uma empresa especializada em criar experiências únicas em Goiânia. Com mais de 5 anos de mercado, já realizamos centenas de eventos inesquecíveis para nossos clientes.',
        avaliacao: '4.9',
        eventosRealizados: '127',
        participantes: '15.420',
        seguidores: '2.340',
        eventosAtivos: '8',
        membroDesde: 'Janeiro de 2020',
        email: 'contato@eventosgp.com.br',
        telefone: '(62) 98765-4321',
        avatar: '/frontend/imagens/Logo Restaurante.avif'
    }
    // Adicione outros perfis aqui conforme necessário
};

/* ==================================================
// --- FUNÇÃO DE CARREGAMENTO DO PERFIL ---
================================================== */
function carregarPerfilOrganizador() {
    const params = new URLSearchParams(window.location.search);
    // Pega o nome do parâmetro 'nome' e o decodifica (reverte espaços e caracteres especiais)
    const nomeOrganizadorURL = decodeURIComponent(params.get('nome') || 'Eventos Goiânia Premium');

    // Tenta encontrar os dados, se não encontrar, usa o padrão 'Eventos Goiânia Premium'
    const dados = DADOS_PERFIS[nomeOrganizadorURL] || DADOS_PERFIS['Eventos Goiânia Premium'];

    // 1. Atualiza o cabeçalho do perfil
    document.getElementById('nome-organizador').innerHTML = `${nomeOrganizadorURL} <span class="verificado">◉ Verificado</span>`;
    document.getElementById('descricao-organizador').textContent = dados.descricao;
    document.getElementById('avatar-organizador').src = dados.avatar;

    // 2. Atualiza as estatísticas no resumo do cabeçalho
    document.getElementById('avaliacao-perfil').textContent = dados.avaliacao;
    document.getElementById('eventos-realizados').textContent = `${dados.eventosRealizados} eventos realizados`;
    document.getElementById('participantes-totais').textContent = `${dados.participantes} participantes`;

    // 3. Atualiza a barra lateral (Estatísticas)
    document.getElementById('seguidores').textContent = dados.seguidores;
    document.getElementById('eventos-ativos').textContent = dados.eventosAtivos;
    document.getElementById('total-eventos-estatistica').textContent = dados.eventosRealizados; // Reusa o total de eventos
    document.getElementById('membro-desde').textContent = dados.membroDesde;

    // 4. Atualiza a barra lateral (Contato)
    document.getElementById('email-contato').textContent = dados.email;
    document.getElementById('telefone-contato').textContent = dados.telefone;
}


/* ==================================================
// --- FUNÇÃO DE LÓGICA DAS ABAS ---
================================================== */
function inicializarAbas() {
    const botoesAba = document.querySelectorAll('.js-tab-button');
    const paineisAba = document.querySelectorAll('.painel-aba');

    botoesAba.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Remove 'ativo' class de todos os botões e painéis
            botoesAba.forEach(btn => btn.classList.remove('ativo'));
            paineisAba.forEach(pane => pane.classList.remove('ativo'));

            // Adiciona 'ativo' class ao botão e painel clicados
            button.classList.add('ativo');
            document.getElementById(tabId).classList.add('ativo');
        });
    });
}


/* ==================================================
// --- INICIALIZAÇÃO DA PÁGINA ---
================================================== */
document.addEventListener('DOMContentLoaded', () => {
    carregarPerfilOrganizador();
    inicializarAbas();
});

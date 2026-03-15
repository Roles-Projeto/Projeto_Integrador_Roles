
// Armazena a base de dados de eventos no escopo global para ser acessível por realizarAcaoComprar
const DADOS_ORGANIZADORES = {
    'Org1': { nome: 'Produtora Ji & Cia', eventos: '42', avatar: '../imagens/logo3.png' },
    'Org2': { nome: 'Drinks & Beer', eventos: '15', avatar: '../Imagens/8º imagem card.png' },
    'Org3': { nome: 'Latino Danças', eventos: '25', avatar: '../Imagens/9º imagem card.png' },
    'Org4': { nome: 'Sommelier Group', eventos: '8', avatar: '../Imagens/10º imagem card.png' },
    'Org5': { nome: 'Underground Prod.', eventos: '50', avatar: '../Imagens/11º imagem card.png' },
    'Org6': { nome: 'Café & Cia', eventos: '12', avatar: '../Imagens/12º imagem card.png' }
};

const DADOS_EVENTOS = {
    '1': {
        categoria: 'Música', titulo: 'Festival de Jazz ao Ar Livre', data: 'sex., 14 de Out', hora: '20:00', precoMinimo: 'Grátis', porPessoa: 'por pessoa', descricao: 'Uma noite mágica com os melhores músicos de jazz da cidade. Venha curtir solo ao estrelar com música ao vivo, food trucks e muito mais!', local: 'Setor Marista', endereco: 'Goiânia', confirmados: '260', organizacaoID: 'Org1', imagemBanner: '../Imagens/7º imagem card.png',
        ingressos: [
            { nome: 'Pista', preco: 'R$ 0,00', descricao: 'Acesso à área de pista', beneficios: ['Acesso à pista', '1 bebida cortesia'], disponiveis: 180, total: 200, selecionado: true },
            { nome: 'Camarote', preco: 'R$ 75,00', descricao: 'Área VIP com vista privilegiada', beneficios: ['Área VIP', 'Open bar 2h', 'Petiscos inclusos', 'Vista privilegiada'], disponiveis: 28, total: 50, selecionado: false }
        ]
    },
    '2': {
        categoria: 'Happy Hour', titulo: 'Chopada da T-63', data: 'Qui, 27 de Out', hora: '18:00', precoMinimo: 'R$ 25', porPessoa: '+ 10% taxa', descricao: 'Drinks especiais e chopp em dobro no melhor bar da T-63. Música ambiente e petiscos variados.', local: 'Avenida T-63', endereco: 'Setor Bueno', confirmados: '88', organizacaoID: 'Org2', imagemBanner: '../Imagens/8º imagem card.png',
        ingressos: [
            { nome: 'Entrada Consumível', preco: 'R$ 25,00', descricao: 'Valor de entrada revertido em consumação', beneficios: ['1 Chopp incluso', 'Acesso à área VIP'], disponiveis: 100, total: 150, selecionado: true },
        ]
    },
    '3': {
        categoria: 'Dança', titulo: 'Salsa e Bachata Night', data: 'Dom, 2 de Out', hora: '21:00', precoMinimo: 'R$ 30', porPessoa: '+ 10% taxa', descricao: 'Aulas gratuitas de salsa seguidas de muito baile latino. Para dançar a noite toda!', local: 'Casa Latina', endereco: 'Setor Central', confirmados: '120', organizacaoID: 'Org3', imagemBanner: '../Imagens/9º imagem card.png',
        ingressos: [
            { nome: 'Acesso Pista', preco: 'R$ 30,00', descricao: 'Acesso à pista de dança e aulas', beneficios: ['Aula de Bachata', 'Open Bar de Água'], disponiveis: 150, total: 200, selecionado: true },
            { nome: 'Ingresso Duplo', preco: 'R$ 50,00', descricao: 'Dois ingressos por preço promocional', beneficios: ['2 Acessos à Pista', 'Economia de R$10'], disponiveis: 50, total: 50, selecionado: false },
        ]
    },
    '4': {
        categoria: 'Gastronomia', titulo: 'Vinhos do Cerrado', data: 'Ter, 4 de Out', hora: '19:30', precoMinimo: 'R$ 80', porPessoa: '+ 10% taxa', descricao: 'Seleção especial de rótulos do centro-oeste em ambiente elegante. Harmonização com pratos regionais gourmet.', local: 'Adega Nobre', endereco: 'Setor Bueno', confirmados: '40', organizacaoID: 'Org4', imagemBanner: '../Imagens/10º imagem card.png',
        ingressos: [
            { nome: 'Experiência Padrão', preco: 'R$ 80,00', descricao: 'Degustação de 4 rótulos e tábua de frios', beneficios: ['4 taças de vinho', 'Tábua de Queijos'], disponiveis: 30, total: 50, selecionado: true },
            { nome: 'Experiência Premium', preco: 'R$ 150,00', descricao: 'Acesso a rótulos exclusivos e jantar harmonizado', beneficios: ['Rótulos Premium', 'Jantar Completo'], disponiveis: 15, total: 20, selecionado: false },
        ]
    },
    '5': {
        categoria: 'Música', titulo: 'Rock no Low Ridez', data: 'Dom, 9 de Out', hora: '22:00', precoMinimo: 'R$ 35', porPessoa: '+ 10% taxa', descricao: 'Bandas locais tocando clássicos nacionais em um pub underground. Muita energia e cerveja gelada!', local: 'Vila Cultural', endereco: 'Setor Central', confirmados: '360', organizacaoID: 'Org5', imagemBanner: '../Imagens/11º imagem card.png',
        ingressos: [
            { nome: 'Pista', preco: 'R$ 35,00', descricao: 'Acesso à área de pista', beneficios: ['Acesso à pista', 'Música ao vivo'], disponiveis: 400, total: 500, selecionado: true },
        ]
    },
    '6': {
        categoria: 'Gastronomia', titulo: 'Brunch no Bougainville', data: 'Sáb, 8 de Out', hora: '10:00', precoMinimo: 'R$ 42', porPessoa: '+ 10% taxa', descricao: 'Brunch especial com buffet de frios, doces e café da manhã completo. Ambiente ao ar livre, perfeito para a família.', local: 'Próximo ao Shopping', endereco: 'Setor Bueno', confirmados: '60', organizacaoID: 'Org6', imagemBanner: '../Imagens/12º imagem card.png',
        ingressos: [
            { nome: 'Acesso ao Buffet', preco: 'R$ 42,00', descricao: 'Acesso livre ao buffet de brunch', beneficios: ['Buffet completo', 'Café e sucos'], disponiveis: 100, total: 150, selecionado: true },
        ]
    },
    '7': {
        categoria: 'Comunidade', titulo: 'Workshop de Programação Grátis', data: 'Seg, 10 de Jun', hora: '19:00', precoMinimo: 'Grátis', porPessoa: 'por pessoa', descricao: 'Aprenda o básico de JavaScript em um workshop divertido e totalmente gratuito.', local: 'Online - YouTube', endereco: 'Em todo lugar', confirmados: '150', organizacaoID: 'Org1', imagemBanner: '../Imagens/logo3.png',
        ingressos: [
            { nome: 'Acesso Livre', preco: 'R$ 0,00', descricao: 'Inscrição para o Workshop Online', beneficios: ['Acesso total', 'Certificado'], disponiveis: 500, total: 500, selecionado: true },
        ]
    },
    '8': {
        categoria: 'Exposição', titulo: 'Arte Moderna na Praça', data: 'Dom, 16 de Jun', hora: '10:00', precoMinimo: 'Grátis', porPessoa: 'por pessoa', descricao: 'Exposição a céu aberto com obras de artistas locais.', local: 'Praça da Liberdade', endereco: 'Setor Central', confirmados: '400', organizacaoID: 'Org3', imagemBanner: '../Imagens/logo3.png',
        ingressos: [
            { nome: 'Visitação', preco: 'R$ 0,00', descricao: 'Acesso a todas as áreas da exposição', beneficios: ['Passe livre', 'Guia digital'], disponiveis: 999, total: 1000, selecionado: true },
        ]
    }
};

/* ==================================================
// --- FUNÇÃO AUXILIAR: ATUALIZA BOTÃO DE COMPRA (PAGO vs GRÁTIS) ---
================================================== */
function atualizarBotaoDeCompra(precoString) {
    const botaoComprar = document.querySelector('.botao-comprar');
    const valorIngressoElement = document.querySelector('.card-garantia-ingresso .valor-ingresso');

    if (!botaoComprar || !valorIngressoElement) {
        console.warn("Elemento do botão de compra não encontrado.");
        return;
    }

    // 1. Converte a string de preço para um número (ignorando 'R$', ',', '.')
    const precoLimpo = precoString.replace('R$', '').replace(',', '.').trim();
    const precoNumerico = parseFloat(precoLimpo);

    // 2. Lógica de atualização
    if (precoNumerico === 0) {
        // Caso seja evento GRATUITO
        botaoComprar.textContent = 'Confirmar Presença';
        botaoComprar.classList.add('botao-confirmar');
        botaoComprar.classList.remove('botao-comprar-padrao');
        valorIngressoElement.textContent = 'Grátis';
    } else {
        // Caso seja evento PAGO
        botaoComprar.textContent = 'Comprar Ingresso';
        botaoComprar.classList.remove('botao-confirmar');
        botaoComprar.classList.add('botao-comprar-padrao');
        valorIngressoElement.textContent = precoString;
    }
}


/* ==================================================
// --- FUNÇÕES DE LÓGICA DE INGRESSOS ---
================================================== */
function inicializarLogicaSelecao() {
    const botoesSelecionar = document.querySelectorAll('.botao-selecionar');
    const tipoIngressoResumo = document.querySelector('.ingresso-resumo');

    if (botoesSelecionar.length > 0 && tipoIngressoResumo) {

        botoesSelecionar.forEach(botao => {
            botao.addEventListener('click', (event) => {

                // 1. Remove o estado 'selecionado' de todos os botões
                botoesSelecionar.forEach(btn => {
                    btn.classList.remove('selecionado');
                    btn.textContent = 'Selecionar';
                });

                // 2. Adiciona o estado 'selecionado' ao botão clicado
                const botaoClicado = event.currentTarget;
                botaoClicado.classList.add('selecionado');
                botaoClicado.textContent = 'Selecionado';

                // 3. Atualiza o card de 'Garantir Ingresso' (resumo de compra)
                const precoSelecionado = botaoClicado.previousElementSibling.textContent;
                const nomeIngresso = botaoClicado.closest('.opcao-ingresso').querySelector('.nome-ingresso').textContent;

                tipoIngressoResumo.textContent = nomeIngresso;

                // Chamada da função para ATUALIZAR O BOTÃO
                atualizarBotaoDeCompra(precoSelecionado);
            });
        });

    } else {
        console.warn("Lógica de Seleção de Ingressos: Elementos de ingressos ou de resumo de compra não encontrados.");
    }
}


/* ==================================================
// --- LÓGICA DE CARREGAMENTO DO EVENTO NA PÁGINA ---
================================================== */
function carregarDetalhesEvento() {
    // 1. Obter o ID da URL. Usando '1' como padrão (fallback).
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id') || '1';

    const evento = DADOS_EVENTOS[eventId];

    if (!evento) {
        document.querySelector('.titulo-evento').textContent = 'Erro: Evento Não Encontrado';
        document.querySelector('.descricao-evento').textContent = 'O ID do evento não é válido ou não foi fornecido.';
        document.querySelector('.numero-confirmados').textContent = '0';
        return;
    }

    const organizador = DADOS_ORGANIZADORES[evento.organizacaoID];


    // 2. Preencher o Banner e Header
    const bannerSection = document.querySelector('.banner-evento');
    if (bannerSection) {
        let imagemBanner = evento.imagemBanner;
        if (imagemBanner.includes('logo3.png') && organizador && organizador.avatar) {
            imagemBanner = organizador.avatar;
        }
        bannerSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${imagemBanner}')`;
    }

    document.querySelector('.etiqueta-categoria').textContent = evento.categoria;
    document.querySelector('.titulo-evento').textContent = evento.titulo;
    document.querySelector('.data-hora-cabecalho').innerHTML = `${evento.data} <span class="separador-cabecalho">•</span> ${evento.hora}`;
    document.querySelector('.valor-minimo').textContent = evento.precoMinimo;
    document.querySelector('.por-pessoas').textContent = evento.porPessoa;

    // 3. Preencher a Seção 'Sobre o Evento'
    document.querySelector('.descricao-evento').textContent = evento.descricao;
    document.querySelector('.nome-local').textContent = evento.local;
    document.querySelector('.endereco-local').textContent = evento.endereco;
    document.querySelector('.numero-confirmados').textContent = `${evento.confirmados} pessoas`;

    // 4. Preencher a Seção 'Organizador'
    const nomeProdutoraElement = document.getElementById('nome-produtora');
    const eventosOrganizadosElement = document.getElementById('eventos-organizados');
    const avatarOrganizadorElement = document.getElementById('avatar-organizador');
    const linkVerPerfil = document.querySelector('.js-link-ver-perfil');

    if (organizador) {
        nomeProdutoraElement.innerHTML = `${organizador.nome} <span class="etiqueta-verificado">Verificado</span>`;
        eventosOrganizadosElement.textContent = `${organizador.eventos} eventos organizados`;
        avatarOrganizadorElement.src = organizador.avatar;

        const nomeCodificado = encodeURIComponent(organizador.nome);
        linkVerPerfil.href = `../eventos/ver_perfil.html?nome=${nomeCodificado}`;
    } else {
        nomeProdutoraElement.textContent = 'Organizador não encontrado';
        eventosOrganizadosElement.textContent = '--';
    }

    // 5. Preencher a Seção 'Ingressos Disponíveis'
    const ingressosContainer = document.querySelector('.ingressos-disponiveis');
    const loadingIngressos = document.getElementById('loading-ingressos');
    if (loadingIngressos) loadingIngressos.remove();

    // Gera o HTML dos ingressos
    evento.ingressos.forEach((ingresso) => {
        const progressoVendas = (ingresso.total > 0) ? (ingresso.disponiveis / ingresso.total) * 100 : 0;
        const beneficiosHtml = ingresso.beneficios.map(b => `<li class="beneficio-item-check">${b}</li>`).join('');
        const isSelecionado = ingresso.selecionado ? 'selecionado' : '';
        const textoBotao = ingresso.selecionado ? 'Selecionado' : 'Selecionar';

        const ingressoHtml = `
                <div class="opcao-ingresso ${ingresso.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}" data-tipo="${ingresso.nome}">
                    <div class="detalhes-opcao">
                        <h4 class="nome-ingresso">${ingresso.nome}</h4>
                        <p class="descricao-ingresso">${ingresso.descricao}</p>
                        <ul class="beneficios-ingresso">${beneficiosHtml}</ul>
                        <div class="status-vendas">
                            <span class="quantidade-restante">${ingresso.disponiveis} de ${ingresso.total} disponíveis</span>
                            <div class="barra-progresso">
                                <div class="progresso" style="width: ${progressoVendas}%;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="acao-opcao">
                        <span class="preco-ingresso">${ingresso.preco}</span>
                        <button class="botao-selecionar ${isSelecionado}" data-tipo="${ingresso.nome}">${textoBotao}</button>
                    </div>
                </div>
            `;
        if (ingressosContainer) {
            ingressosContainer.insertAdjacentHTML('beforeend', ingressoHtml);
        }
    });

    // 6. Atualizar o Card de Resumo de Compra com o ingresso padrão/selecionado
    const ingressoPadrao = evento.ingressos.find(i => i.selecionado) || evento.ingressos[0];

    document.querySelector('.data-resumo').textContent = evento.data;
    document.querySelector('.hora-resumo').textContent = evento.hora;
    document.querySelector('.local-resumo').textContent = evento.local;

    if (ingressoPadrao) {
        document.querySelector('.ingresso-resumo').textContent = ingressoPadrao.nome;

        // Chamada da nova função: ATUALIZA O BOTÃO E O PREÇO NO RESUMO COM O INGRESSO PADRÃO
        atualizarBotaoDeCompra(ingressoPadrao.preco);
    }

    // 7. Reinicializar a lógica de seleção para os novos botões dinâmicos
    inicializarLogicaSelecao();
}

// A função principal de inicialização deve ser chamada APENAS quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    carregarDetalhesEvento();
    inicializarAcaoBotaoComprar();
});


/* ==================================================
// --- FUNÇÃO CENTRAL: SALVA DADOS E REDIRECIONA PARA CHECKOUT ---
// Esta função está fora do DOMContentLoaded para ser acessível como callback de click.
================================================== */
function realizarAcaoComprar() {
    // 1. Encontra o ingresso ATUALMENTE SELECIONADO (no DOM)
    const ingressoSelecionadoElemento = document.querySelector('.opcao-ingresso .botao-selecionar.selecionado');

    if (!ingressoSelecionadoElemento) {
        alert('Por favor, selecione um ingresso antes de prosseguir.');
        return;
    }

    // Coleta dados do ingresso selecionado no card de ingressos
    const opcaoIngressoPai = ingressoSelecionadoElemento.closest('.opcao-ingresso');
    const nomeIngresso = opcaoIngressoPai.querySelector('.nome-ingresso').textContent;
    const precoIngressoTexto = opcaoIngressoPai.querySelector('.preco-ingresso').textContent;

    // Converte o preço de volta para o formato numérico limpo, ignorando 'R$' e ','
    const precoIngressoLimpo = parseFloat(precoIngressoTexto.replace('R$', '').replace(',', '.').trim()) || 0.00;


    // 2. Coleta dados gerais do evento usando o ID atual e a base de dados
    const eventId = new URLSearchParams(window.location.search).get('id') || '1';
    const evento = DADOS_EVENTOS[eventId]; // Pega os dados brutos da base simulada

    if (!evento) {
        alert("Erro: Dados do evento não puderam ser carregados para o checkout.");
        return;
    }

    // 3. Monta o objeto final para o localStorage
    const dadosParaCheckout = {
        // Dados do Evento 
        nome: evento.titulo,
        data: evento.data,
        hora: evento.hora,
        local: evento.local,
        imagem: evento.imagemBanner,

        // Dados do Ingresso Selecionado
        ingressoNome: nomeIngresso,
        // É importante passar o valor numérico (sem formatação) para o checkout
        ingressoPreco: precoIngressoLimpo,
    };

    // 4. Salva os dados no localStorage
    localStorage.setItem('eventoSelecionado', JSON.stringify(dadosParaCheckout));

    // 5. Redireciona
    const botaoComprar = document.querySelector('.botao-comprar');
    if (botaoComprar.classList.contains('botao-confirmar')) {
        // Evento GRÁTIS
        console.log(`Presença em "${nomeIngresso}" confirmada. Redirecionando...`);
        // 🚨 CAMINHO CORRIGIDO: Volta um nível (de eventos/) e entra em checkout/ 
        window.location.href = 'presenca_confirmada.html';
    } else {
        // Evento PAGO
        console.log("Ingresso selecionado! Redirecionando para Finalizar Compra...");
        // 🚨 CAMINHO CORRIGIDO: Volta um nível (de eventos/) e entra em checkout/
        window.location.href = 'finalizar_compra.html';
    }
}


/* ==================================================
// --- LÓGICA DE AÇÃO DO BOTÃO PRINCIPAL DE COMPRA/CONFIRMAÇÃO ---
// Esta função é chamada DEPOIS que o DOM está pronto.
================================================== */
function inicializarAcaoBotaoComprar() {
    const botaoComprar = document.querySelector('.botao-comprar');

    if (botaoComprar) {
        // O evento de clique chama a função que salva os dados e redireciona.
        botaoComprar.addEventListener('click', realizarAcaoComprar);
    } else {
        console.error("ERRO CRÍTICO: O botão de compra não foi encontrado no DOM.");
    }
}

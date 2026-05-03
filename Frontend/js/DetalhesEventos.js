const API_URL = "/eventos";

function atualizarBotaoDeCompra(precoNumerico, precoFormatado) {
    const botaoComprar = document.querySelector('.botao-comprar');
    const valorIngressoElement = document.querySelector('.card-garantia-ingresso .valor-ingresso');
    if (!botaoComprar || !valorIngressoElement) return;

    if (precoNumerico === 0) {
        botaoComprar.textContent = 'Confirmar Presença';
        botaoComprar.classList.add('botao-confirmar');
        botaoComprar.classList.remove('botao-comprar-padrao');
        valorIngressoElement.textContent = 'Grátis';
    } else {
        botaoComprar.textContent = 'Comprar Ingresso';
        botaoComprar.classList.remove('botao-confirmar');
        botaoComprar.classList.add('botao-comprar-padrao');
        valorIngressoElement.textContent = precoFormatado;
    }
}

function inicializarLogicaSelecao() {
    const botoesSelecionar = document.querySelectorAll('.botao-selecionar');
    const tipoIngressoResumo = document.querySelector('.ingresso-resumo');
    if (!botoesSelecionar.length || !tipoIngressoResumo) return;

    botoesSelecionar.forEach(botao => {
        botao.addEventListener('click', (event) => {
            botoesSelecionar.forEach(btn => {
                btn.classList.remove('selecionado');
                btn.textContent = 'Selecionar';
            });

            const botaoClicado = event.currentTarget;
            botaoClicado.classList.add('selecionado');
            botaoClicado.textContent = 'Selecionado';

            const opcaoPai = botaoClicado.closest('.opcao-ingresso');
            const nomeIngresso = opcaoPai.querySelector('.nome-ingresso').textContent;
            const precoTexto = opcaoPai.querySelector('.preco-ingresso').textContent;
            const precoNumerico = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim()) || 0;

            tipoIngressoResumo.textContent = nomeIngresso;
            atualizarBotaoDeCompra(precoNumerico, precoTexto);
        });
    });
}

async function carregarDetalhesEvento() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        document.querySelector('.titulo-evento').textContent = 'Evento não encontrado';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${eventId}`);
        if (!res.ok) throw new Error('Evento não encontrado');
        const evento = await res.json();

        // Banner
        const bannerSection = document.querySelector('.banner-evento');
        if (bannerSection && evento.imagem) {
            bannerSection.style.backgroundImage =
                `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${evento.imagem}')`;
        }

        // Cabeçalho
        document.querySelector('.etiqueta-categoria').textContent = evento.assunto || 'Evento';
        document.querySelector('.titulo-evento').textContent = evento.nome;

        const dataFormatada = evento.data_inicio
            ? new Date(evento.data_inicio).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
            : '-';
        const horaFormatada = evento.data_inicio
            ? new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : '-';

        document.querySelector('.data-hora-cabecalho').innerHTML =
            `${dataFormatada} <span class="separador-cabecalho">•</span> ${horaFormatada}`;

        const precoMinimo = parseFloat(evento.preco_minimo) || 0;
        document.querySelector('.valor-minimo').textContent =
            precoMinimo > 0 ? `R$ ${precoMinimo.toFixed(2)}` : 'Grátis';
        document.querySelector('.por-pessoas').textContent =
            precoMinimo > 0 ? '+ 10% taxa' : 'por pessoa';

        // Sobre o evento
        document.querySelector('.descricao-evento').textContent = evento.descricao || '';
        document.querySelector('.nome-local').textContent = evento.local_nome || '';
        document.querySelector('.endereco-local').textContent = evento.cidade || '';
        document.querySelector('.numero-confirmados').textContent = `${evento.confirmados || 0} pessoas`;

        // Resumo lateral
        document.querySelector('.data-resumo').textContent = dataFormatada;
        document.querySelector('.hora-resumo').textContent = horaFormatada;
        document.querySelector('.local-resumo').textContent = evento.local_nome || '';

        // Organizador
        const nomeProdutora = document.getElementById('nome-produtora');
        const eventosOrganizados = document.getElementById('eventos-organizados');
        if (nomeProdutora) {
            nomeProdutora.innerHTML = evento.nome_produtor
                ? `${evento.nome_produtor} <span class="etiqueta-verificado">Verificado</span>`
                : 'Organizador não informado';
        }
        if (eventosOrganizados) {
            eventosOrganizados.textContent = '';
        }

        // Ingressos
        const ingressosContainer = document.querySelector('.ingressos-disponiveis');
        const loadingIngressos = document.getElementById('loading-ingressos');
        if (loadingIngressos) loadingIngressos.remove();

        const ingressos = (evento.ingressos && evento.ingressos.length > 0)
            ? evento.ingressos
            : [{ titulo: 'Ingresso Geral', tipo: 'gratuito', valor: 0, quantidade_total: 100 }];

        ingressos.forEach((ingresso, index) => {
            const preco = parseFloat(ingresso.valor) || 0;
            const precoFormatado = preco > 0 ? `R$ ${preco.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
            const total = ingresso.quantidade_total ?? 100;
            const isSelecionado = index === 0;

            const html = `
                <div class="opcao-ingresso" data-tipo="${ingresso.titulo}">
                    <div class="detalhes-opcao">
                        <h4 class="nome-ingresso">${ingresso.titulo}</h4>
                        <p class="descricao-ingresso">${ingresso.tipo === 'gratuito' ? 'Entrada gratuita' : 'Ingresso pago'}</p>
                        <div class="status-vendas">
                            <span class="quantidade-restante">${total} disponíveis</span>
                            <div class="barra-progresso">
                                <div class="progresso" style="width: 100%;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="acao-opcao">
                        <span class="preco-ingresso">${precoFormatado}</span>
                        <button class="botao-selecionar ${isSelecionado ? 'selecionado' : ''}" data-tipo="${ingresso.titulo}">
                            ${isSelecionado ? 'Selecionado' : 'Selecionar'}
                        </button>
                    </div>
                </div>`;

            if (ingressosContainer) ingressosContainer.insertAdjacentHTML('beforeend', html);

            if (isSelecionado) {
                document.querySelector('.ingresso-resumo').textContent = ingresso.titulo;
                atualizarBotaoDeCompra(preco, precoFormatado);
                window._eventoAtual = {
                    nome: evento.nome,
                    data: dataFormatada,
                    hora: horaFormatada,
                    local: evento.local_nome || '',
                    imagem: evento.imagem || '',
                    ingressoNome: ingresso.titulo,
                    ingressoPreco: preco
                };
            }
        });

        inicializarLogicaSelecao();

    } catch (err) {
        console.error('Erro ao carregar evento:', err);
        document.querySelector('.titulo-evento').textContent = 'Erro ao carregar evento';
        document.querySelector('.descricao-evento').textContent = 'Não foi possível buscar os dados. Verifique o servidor.';
    }
}

function realizarAcaoComprar() {
    const ingressoSelecionado = document.querySelector('.opcao-ingresso .botao-selecionar.selecionado');
    if (!ingressoSelecionado) {
        alert('Por favor, selecione um ingresso antes de prosseguir.');
        return;
    }

    const opcaoPai = ingressoSelecionado.closest('.opcao-ingresso');
    const nomeIngresso = opcaoPai.querySelector('.nome-ingresso').textContent;
    const precoTexto = opcaoPai.querySelector('.preco-ingresso').textContent;
    const precoNumerico = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim()) || 0;

    const dadosParaCheckout = {
        ...(window._eventoAtual || {}),
        ingressoNome: nomeIngresso,
        ingressoPreco: precoNumerico
    };

    localStorage.setItem('eventoSelecionado', JSON.stringify(dadosParaCheckout));

    const botaoComprar = document.querySelector('.botao-comprar');
    if (botaoComprar.classList.contains('botao-confirmar')) {
        window.location.href = '/frontend/detalheseventos/presencaconfirmada.html';
    } else {
        window.location.href = '/frontend/detalheseventos/finalizarcompra.html';
    }
}

function inicializarAcaoBotaoComprar() {
    const botaoComprar = document.querySelector('.botao-comprar');
    if (botaoComprar) {
        botaoComprar.addEventListener('click', realizarAcaoComprar);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await carregarDetalhesEvento();
    inicializarAcaoBotaoComprar();
});
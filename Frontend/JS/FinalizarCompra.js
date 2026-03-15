
// Variáveis Globais de Configuração
let PRICE_PER_TICKET = 0.00;
const SERVICE_TAX_RATE = 0.10; // 10%
const MAX_AVAILABLE_TICKETS = 85;

/* ==================================================
// --- FUNÇÕES DE CARREGAMENTO E FORMATAÇÃO ---
================================================== */

// Função para formatar o valor para BRL
function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(value);
}

// Função para carregar os dados do evento e ingresso do localStorage
function loadEventData() {
    const eventDataString = localStorage.getItem('eventoSelecionado');

    if (eventDataString) {
        const eventData = JSON.parse(eventDataString);

        // 1. Atualiza as informações do evento no Resumo
        document.getElementById('event-image').src = eventData.imagem || 'caminho/para/placeholder.jpg';
        document.getElementById('event-name').textContent = eventData.nome || 'Evento Desconhecido';
        document.getElementById('event-date').textContent = eventData.data || '--/--/----';
        document.getElementById('event-time').textContent = eventData.hora || '--:--';
        document.getElementById('event-location').textContent = eventData.local || 'Local Desconhecido';

        // 2. Atualiza as informações do ingresso no Resumo
        document.getElementById('ticket-type').textContent = eventData.ingressoNome || 'Ingresso Padrão';

        // 3. Define o preço do ingresso (CRUCIAL!)
        PRICE_PER_TICKET = parseFloat(eventData.ingressoPreco) || 0.00;

    } else {
        console.error('Nenhum dado de evento encontrado no localStorage. Usando valores padrões.');
        PRICE_PER_TICKET = 30.00;
    }
}

/* ==================================================
// --- FUNÇÕES DE CÁLCULO E QUANTIDADE ---
================================================== */

// Função para recalcular e atualizar todos os valores na tela
function updatePrice(quantity) {
    // 1. Cálculo
    const subtotalValue = quantity * PRICE_PER_TICKET;
    const taxValue = subtotalValue * SERVICE_TAX_RATE;
    const totalValue = subtotalValue + taxValue;

    // 2. Atualização do DOM
    document.getElementById('quantidade').value = quantity;
    document.getElementById('subtotal').textContent = formatBRL(subtotalValue);
    document.getElementById('taxa').textContent = formatBRL(taxValue);
    document.getElementById('total').textContent = formatBRL(totalValue);
    document.getElementById('ticket-price-display').textContent = formatBRL(PRICE_PER_TICKET);

    // 3. Atualiza o texto do botão de pagamento principal
    document.querySelector('.btn-pagar').textContent = `Pagar ${formatBRL(totalValue)}`;

    // 4. Atualiza o texto do subtotal com a quantidade
    document.getElementById('subtotal-label').textContent = `Subtotal (${quantity}x)`;
}

// Função que é chamada pelos botões de +/-
function changeQuantity(change) {
    const input = document.getElementById('quantidade');
    let current = parseInt(input.value);
    let newValue = current + change;

    // Validações
    if (newValue >= 1 && newValue <= MAX_AVAILABLE_TICKETS) {
        updatePrice(newValue);
    } else if (newValue < 1) {
        updatePrice(1);
    } else if (newValue > MAX_AVAILABLE_TICKETS) {
        updatePrice(MAX_AVAILABLE_TICKETS);
    }
}

/* ==================================================
// --- FUNÇÃO DE FINALIZAÇÃO DA COMPRA (Sem validação) ---
================================================== */
function finalizePurchase() {
    // 1. Coletar a quantidade
    const quantidade = parseInt(document.getElementById('quantidade').value);

    // 2. Coletar e converter os valores calculados (removendo formatação BRL)
    const subtotalText = document.getElementById('subtotal').textContent.replace('R$', '').replace('.', '').replace(',', '.').trim();
    const taxaText = document.getElementById('taxa').textContent.replace('R$', '').replace('.', '').replace(',', '.').trim();
    const totalText = document.getElementById('total').textContent.replace('R$', '').replace('.', '').replace(',', '.').trim();

    const subtotalValue = parseFloat(subtotalText) || 0;
    const taxaValue = parseFloat(taxaText) || 0;
    const totalValue = parseFloat(totalText) || 0;

    // 3. Coletar os dados originais do evento
    const eventDataString = localStorage.getItem('eventoSelecionado');
    const eventData = JSON.parse(eventDataString);

    if (!eventData) {
        alert("Erro ao finalizar: Dados do evento não encontrados.");
        return;
    }

    // 4. Montar o objeto final de confirmação
    const dadosParaConfirmacao = {
        ...eventData,

        // Adiciona os dados da compra
        quantidade: quantidade,
        subtotal: subtotalValue,
        taxaServico: taxaValue,
        totalPago: totalValue,

        // Gera um ID de pedido simulado
        pedidoID: 'ROLE-' + Date.now() + Math.floor(Math.random() * 1000)
    };

    // 5. Salvar no localStorage na chave que a página de confirmação espera
    localStorage.setItem('compraConfirmada', JSON.stringify(dadosParaConfirmacao));

    // 6. Redirecionar
    console.log("Compra finalizada. Redirecionando para Confirmação...");
    window.location.href = '/frontend/verDetalhesEventos/confirmacao.html';
}

/* ==================================================
// --- FUNÇÃO PARA ANEXAR O EVENTO DE SUBMISSÃO (Com correção de redirecionamento) ---
================================================== */
function attachFinalizeAction() {
    const form = document.getElementById('payment-form');

    if (form) {
        // Manipulador de submissão do formulário
        form.addEventListener('submit', function (e) {
            // IMPEDE O RECARREGAMENTO DA PÁGINA (CORREÇÃO DE REDIRECIONAMENTO)
            e.preventDefault();

            // Se o navegador chegou aqui, a validação HTML5 (required) já foi verificada.
            finalizePurchase();
        });
    } else {
        console.error("Formulário de pagamento (#payment-form) não encontrado.");
    }
}

/* ==================================================
// --- INICIALIZAÇÃO DA PÁGINA ---
================================================== */
document.addEventListener('DOMContentLoaded', function () {
    // Passo 1: Carrega os dados do evento e define o preço base
    loadEventData();
    // Passo 2: Calcula o preço com o preço carregado (assumindo 1 ingresso inicialmente)
    updatePrice(1);
    // Passo 3: Atacha o evento de submissão do formulário
    attachFinalizeAction();
});


function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function carregarDadosConfirmacao() {
    const dadosCompraJSON = localStorage.getItem('compraConfirmada');
    if (!dadosCompraJSON) {
        document.querySelector('.page-content').innerHTML = '<h1>Erro na Compra</h1><p>Não foi possível carregar os detalhes do pedido.</p>';
        return;
    }

    const dados = JSON.parse(dadosCompraJSON);

    document.querySelectorAll('.order-id').forEach(el => {
        el.textContent = `Pedido #${dados.pedidoID || 'N/A'}`;
    });

    document.querySelector('.event-image').src = dados.imagem || 'caminho/para/placeholder.jpg';
    document.querySelector('.event-info h4').textContent = dados.nome || 'Evento Desconhecido';

    const eventMeta = document.querySelector('.event-meta').querySelectorAll('p');
    if (eventMeta.length >= 3) {
        eventMeta[0].innerHTML = `<i class="fas fa-calendar-alt"></i> ${dados.data || 'N/A'}`;
        eventMeta[1].innerHTML = `<i class="fas fa-clock"></i> ${dados.hora || 'N/A'}`;
        eventMeta[2].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${dados.local || 'N/A'}`;
    }

    const precoPorIngresso = formatarMoeda(dados.ingressoPreco);
    document.querySelector('.ticket-type').innerHTML = `<i class="fas fa-ticket-alt"></i> ${dados.ingressoNome || 'N/A'}`;
    document.querySelector('.ticket-price').textContent = `${precoPorIngresso} cada`;
    document.querySelector('.ticket-summary p').textContent = `Quantidade: ${dados.quantidade || 1}`;

    document.querySelector('.price-row:nth-child(1) .price').textContent = formatarMoeda(dados.subtotal || 0);
    document.querySelector('.price-row:nth-child(2) .price').textContent = formatarMoeda(dados.taxaServico || 0);
    document.querySelector('.total-row .price').textContent = formatarMoeda(dados.totalPago || 0);
}

document.addEventListener('DOMContentLoaded', carregarDadosConfirmacao);

// --- Toast ---
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.style.visibility = 'visible';
    toast.style.opacity = '1';
    toast.style.bottom = '50px';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.bottom = '30px';
        setTimeout(() => {
            toast.style.visibility = 'hidden';
        }, 500);
    }, 2000);
}

document.querySelectorAll('.btn-action').forEach(botao => {
    botao.addEventListener('click', function (e) {
        e.preventDefault();
        if (botao.textContent.includes('Baixar')) {
            mostrarToast('Ingressos baixados com sucesso!');
        } else if (botao.textContent.includes('Reenviar')) {
            mostrarToast('Ingressos reenviados para seu email!');
        }
    });
});

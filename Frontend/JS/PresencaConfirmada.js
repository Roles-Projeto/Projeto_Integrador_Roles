
// Lógica de Compartilhamento (Opcional)
document.querySelector('.botao-compartilhar').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'Confirmei presença neste Rolê Grátis!',
            text: 'Achei este evento incrível e confirmei presença. Vem também!',
            url: window.location.origin + '/frontend/verDetalhesEventos/detalhesEventos.html?id=SEU_EVENTO_ID' // Mude para a URL do evento real
        }).catch((error) => console.log('Erro ao compartilhar', error));
    } else {
        alert('Função de compartilhamento não suportada neste navegador.');
    }
});

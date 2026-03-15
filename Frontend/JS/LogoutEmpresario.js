
document.addEventListener('DOMContentLoaded', function () {
    const headerIframe = document.getElementById("site-header");

    if (headerIframe && headerIframe.contentWindow) {
        // Tentativa robusta de recarregar/deslogar o iframe
        try {
            // Se a lógica de deslogar estiver no header.html e depender do recarregamento:
            headerIframe.contentWindow.location.reload(true);
        } catch (e) {
            // Se o iframe for de domínio diferente, isso pode falhar silenciosamente (ignorar)
            console.error("Erro ao recarregar iframe do header:", e);
        }
    }
});

// ================================================
//  FAVORITO & COMPARTILHAR — detalheevento.html
// ================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Identificação do evento ──────────────────────────────────────────────
  // Pega o ID do evento pela URL (?id=123). Se não houver, usa a própria URL.
  const params   = new URLSearchParams(window.location.search);
  const eventoId = params.get('id') || window.location.pathname;

  // ── Seleciona os dois botões de ação ────────────────────────────────────
  const [btnFavoritar, btnCompartilhar] = document.querySelectorAll('.icone-acao');

  // ════════════════════════════════════════════════════════════════════════
  //  FAVORITO
  // ════════════════════════════════════════════════════════════════════════

  const STORAGE_KEY = 'roles_favoritos';

  /** Retorna o Set de IDs favoritados salvo no localStorage */
  function getFavoritos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  /** Persiste o Set no localStorage */
  function salvarFavoritos(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  }

  /** Atualiza a aparência do botão conforme o estado */
  function atualizarBotaoFavorito(favoritado) {
    const path = btnFavoritar.querySelector('path');

    if (favoritado) {
      // Coração preenchido + cor roxa
      path.setAttribute('fill', '#7c3aed');
      path.setAttribute('stroke', '#7c3aed');
      btnFavoritar.setAttribute('aria-label', 'Remover dos Favoritos');
      btnFavoritar.classList.add('favoritado');
    } else {
      // Coração vazio
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      btnFavoritar.setAttribute('aria-label', 'Favoritar Evento');
      btnFavoritar.classList.remove('favoritado');
    }
  }

  /** Inicializa o estado do botão ao carregar a página */
  function inicializarFavorito() {
    const favoritados = getFavoritos();
    atualizarBotaoFavorito(favoritados.has(eventoId));
  }

  /** Alterna favorito ao clicar */
  function toggleFavorito() {
    const favoritados = getFavoritos();

    if (favoritados.has(eventoId)) {
      favoritados.delete(eventoId);
      atualizarBotaoFavorito(false);
      mostrarToast('Removido dos favoritos');
    } else {
      favoritados.add(eventoId);
      atualizarBotaoFavorito(true);
      mostrarToast('❤️ Adicionado aos favoritos!');
    }

    salvarFavoritos(favoritados);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  COMPARTILHAR
  // ════════════════════════════════════════════════════════════════════════

  async function compartilharEvento() {
    // Tenta pegar o título real do evento na página
    const titulo = document.querySelector('.titulo-evento')?.textContent?.trim()
                   || 'Confira este evento no Rolês!';

    const dados = {
      title: titulo,
      text : `${titulo} — Veja mais no Rolês!`,
      url  : window.location.href,
    };

    // Web Share API — funciona nativamente em mobile (Android/iOS)
    if (navigator.share) {
      try {
        await navigator.share(dados);
        return; // encerra se o usuário compartilhou com sucesso
      } catch (err) {
        // Usuário cancelou o compartilhamento nativo — sem ação adicional
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: copia o link para a área de transferência
    try {
      await navigator.clipboard.writeText(window.location.href);
      mostrarToast('🔗 Link copiado para a área de transferência!');
    } catch {
      // Fallback máximo: campo de texto temporário
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      mostrarToast('🔗 Link copiado!');
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  TOAST — feedback visual leve
  // ════════════════════════════════════════════════════════════════════════

  function mostrarToast(mensagem) {
    // Remove toast anterior se existir
    document.querySelector('.roles-toast')?.remove();

    const toast = document.createElement('div');
    toast.className = 'roles-toast';
    toast.textContent = mensagem;

    // Estilos inline para não depender do CSS externo
    Object.assign(toast.style, {
      position       : 'fixed',
      bottom         : '24px',
      left           : '50%',
      transform      : 'translateX(-50%)',
      background     : '#1e1b4b',
      color          : '#fff',
      padding        : '10px 20px',
      borderRadius   : '8px',
      fontSize       : '14px',
      fontWeight     : '500',
      boxShadow      : '0 4px 16px rgba(0,0,0,0.25)',
      zIndex         : '9999',
      pointerEvents  : 'none',
      opacity        : '0',
      transition     : 'opacity 0.25s ease',
      whiteSpace     : 'nowrap',
    });

    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    // Fade out e remoção após 2.5 s
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  INICIALIZAÇÃO
  // ════════════════════════════════════════════════════════════════════════

  inicializarFavorito();
  btnFavoritar?.addEventListener('click', toggleFavorito);
  btnCompartilhar?.addEventListener('click', compartilharEvento);

});
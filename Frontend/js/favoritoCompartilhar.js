// ================================================
//  FAVORITO & COMPARTILHAR — detalheevento.html
// ================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Identificação do evento ──────────────────────────────────────────────
  const params   = new URLSearchParams(window.location.search);
  const eventoId = params.get('id') || window.location.pathname;

  // ── Seleciona os dois botões de ação ────────────────────────────────────
  const [btnFavoritar, btnCompartilhar] = document.querySelectorAll('.icone-acao');

  // ════════════════════════════════════════════════════════════════════════
  //  FAVORITO
  // ════════════════════════════════════════════════════════════════════════

  const STORAGE_KEY = 'roles_favoritos'; // mantém compatibilidade — Set de IDs
  const DADOS_KEY   = 'roles_favoritos_dados'; // novo — Map id → dados do evento

  /** Retorna o Set de IDs favoritados */
  function getFavoritos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  /** Retorna o objeto { [id]: dadosEvento } */
  function getFavoritosDados() {
    try {
      const raw = localStorage.getItem(DADOS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /** Persiste o Set de IDs */
  function salvarFavoritos(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  }

  /** Persiste o mapa de dados */
  function salvarFavoritosDados(dados) {
    localStorage.setItem(DADOS_KEY, JSON.stringify(dados));
  }

  /**
   * Coleta os dados visíveis do evento na página atual.
   * Tenta pegar o máximo de informação disponível no DOM.
   */
  function coletarDadosEvento() {
    // Título
    const titulo = document.querySelector('.titulo-evento')?.textContent?.trim() || 'Evento';

    // Categoria / etiqueta
    const categoria = document.querySelector('.etiqueta-categoria')?.textContent?.trim() || '';

    // Data e hora (resumo lateral ou cabeçalho)
    const data  = document.querySelector('.data-resumo')?.textContent?.trim()
               || document.querySelector('.data-hora-cabecalho')?.textContent?.trim()
               || '';
    const hora  = document.querySelector('.hora-resumo')?.textContent?.trim() || '';

    // Local
    const local = document.querySelector('.local-resumo')?.textContent?.trim()
               || document.querySelector('.nome-local')?.textContent?.trim()
               || '';

    // Preço
    const preco = document.querySelector('.valor-minimo')?.textContent?.trim()
               || document.querySelector('.valor-ingresso')?.textContent?.trim()
               || '';

    // Imagem de capa — extrai a última url() do background-image (ignora o gradient)
      let imagem = '';
      const banner = document.querySelector('.banner-evento');
      if (banner) {
      const bg = banner.style.backgroundImage;
      const matches = [...bg.matchAll(/url\(['"]?(.+?)['"]?\)/g)];
      if (matches.length) imagem = matches[matches.length - 1][1];
  }

    // URL da página do evento
    const url = window.location.href;

    return { id: eventoId, titulo, categoria, data, hora, local, preco, imagem, url };
  }

  /** Atualiza a aparência do botão conforme o estado */
  function atualizarBotaoFavorito(favoritado) {
    const path = btnFavoritar.querySelector('path');

    if (favoritado) {
      path.setAttribute('fill', '#7c3aed');
      path.setAttribute('stroke', '#7c3aed');
      btnFavoritar.setAttribute('aria-label', 'Remover dos Favoritos');
      btnFavoritar.classList.add('favoritado');
    } else {
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
    const dados       = getFavoritosDados();

    if (favoritados.has(eventoId)) {
      // ── Remove ──
      favoritados.delete(eventoId);
      delete dados[eventoId];
      atualizarBotaoFavorito(false);
      mostrarToast('Removido dos favoritos');
    } else {
      // ── Adiciona ──
      favoritados.add(eventoId);
      // Aguarda um tick para o DOM ter os dados do evento carregados
      // (detalhesEventos.js preenche o DOM de forma assíncrona)
      setTimeout(() => {
        const dadosEvento    = coletarDadosEvento();
        dados[eventoId]      = dadosEvento;
        salvarFavoritosDados(dados);
      }, 300);
      atualizarBotaoFavorito(true);
      mostrarToast('❤️ Adicionado aos favoritos!');
    }

    salvarFavoritos(favoritados);
    salvarFavoritosDados(dados);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  COMPARTILHAR
  // ════════════════════════════════════════════════════════════════════════

  async function compartilharEvento() {
    const titulo = document.querySelector('.titulo-evento')?.textContent?.trim()
                   || 'Confira este evento no Rolês!';

    const dados = {
      title: titulo,
      text : `${titulo} — Veja mais no Rolês!`,
      url  : window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(dados);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      mostrarToast('🔗 Link copiado para a área de transferência!');
    } catch {
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
  //  TOAST
  // ════════════════════════════════════════════════════════════════════════

  function mostrarToast(mensagem) {
    document.querySelector('.roles-toast')?.remove();

    const toast = document.createElement('div');
    toast.className = 'roles-toast';
    toast.textContent = mensagem;

    Object.assign(toast.style, {
      position      : 'fixed',
      bottom        : '24px',
      left          : '50%',
      transform     : 'translateX(-50%)',
      background    : '#1e1b4b',
      color         : '#fff',
      padding       : '10px 20px',
      borderRadius  : '8px',
      fontSize      : '14px',
      fontWeight    : '500',
      boxShadow     : '0 4px 16px rgba(0,0,0,0.25)',
      zIndex        : '9999',
      pointerEvents : 'none',
      opacity       : '0',
      transition    : 'opacity 0.25s ease',
      whiteSpace    : 'nowrap',
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
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
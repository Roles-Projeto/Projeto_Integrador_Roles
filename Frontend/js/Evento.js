// Frontend/js/Evento.js
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE = isLocal ? "http://localhost:3000" : window.location.origin;
const API_URL  = `${API_BASE}/eventos`;

// ── Fotos reais por categoria (SEM overlay no backgroundImage) ──
const imagensPorCategoria = {
  'todas':       'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=700&fit=crop&q=85',
  'festa':       'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=700&fit=crop&q=85',
  'show':        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&h=700&fit=crop&q=85',
  'festival':    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&h=700&fit=crop&q=85',
  'gastronomia': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=700&fit=crop&q=85',
  'workshop':    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&h=700&fit=crop&q=85',
};

// ── Aplica SOMENTE a foto — overlay fica no CSS (.hero-overlay) ──
function aplicarImagemHero(categoria) {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  const imgUrl = imagensPorCategoria[categoria] || imagensPorCategoria['todas'];

  hero.style.transition         = 'opacity 0.35s ease';
  hero.style.opacity            = '0.85';
  hero.style.backgroundImage    = `url('${imgUrl}')`;
  hero.style.backgroundSize     = 'cover';
  hero.style.backgroundPosition = 'center 40%';

  setTimeout(() => { hero.style.opacity = '1'; }, 50);

  const img = new Image();
  img.onerror = () => { hero.style.backgroundImage = 'none'; hero.style.backgroundColor = '#2e1065'; };
  img.src = imgUrl;
}

document.addEventListener("DOMContentLoaded", async () => {
  aplicarImagemHero('todas');

  const container          = document.getElementById("eventosContainer");
  const btnCarregar        = document.getElementById("carregarMais");
  const EVENTOS_POR_PAGINA = 5;
  let eventosFiltrados     = [];
  let quantidadeVisiveis   = EVENTOS_POR_PAGINA;

  // ── Navegação pelo clique no card inteiro ──────────────────────────
  container.addEventListener("click", e => {
    // Ignora cliques em botões ou links internos
    if (e.target.closest("button, a")) return;

    const card = e.target.closest(".evento-card");
    if (!card) return;

    const id = card.getAttribute("data-id");
    if (id) {
      window.location.href = `/frontend/detalheseventos/detalheevento.html?id=${id}`;
    }
  });
  // ──────────────────────────────────────────────────────────────────

  async function carregarEventos() {
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();

      document.querySelectorAll(".evento-card").forEach(c => c.remove());

      if (data.length === 0) {
        container.insertAdjacentHTML("afterbegin", `<p style="text-align:center;padding:40px;color:#888;">Nenhum evento encontrado.</p>`);
        atualizarContador();
        return;
      }

      const carregarBtn = document.querySelector(".carregar-container");
      data.forEach(evento => container.insertBefore(criarCard(evento), carregarBtn));
      aplicarFiltros();

    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      container.insertAdjacentHTML("afterbegin", `<p style="text-align:center;padding:40px;color:red;">Erro ao carregar eventos.</p>`);
    }
  }

  function criarCard(evento) {
    const article = document.createElement("article");
    article.classList.add("evento-card");
    article.setAttribute("data-categoria", (evento.assunto || "").toLowerCase());
    article.setAttribute("data-nome",      evento.nome);
    article.setAttribute("data-id",        evento.id);

    const dataFormatada = formatarData(evento.data_inicio);
    const isGratuito    = !evento.preco_minimo || parseFloat(evento.preco_minimo) === 0;
    const preco         = isGratuito ? "Gratuito" : `R$ ${parseFloat(evento.preco_minimo).toFixed(2)}`;
    const imagemSrc     = !evento.imagem
      ? `${API_BASE}/frontend/imagens/jazz.png`
      : evento.imagem.startsWith("http") ? evento.imagem : `${API_BASE}${evento.imagem}`;

    // Botão "Confirmar Presença" só aparece em eventos gratuitos
    const btnConfirmar = isGratuito
      ? `<a href="/frontend/detalheseventos/presencaconfirmada.html" class="btn-confirmar" role="button">
           <i class="fa-solid fa-check"></i> Confirmar Presença
         </a>`
      : "";

    article.innerHTML = `
      <div class="evento-imagem">
        <img src="${imagemSrc}" alt="${evento.nome}" />
        <span class="badge">${evento.assunto || "Evento"}</span>
      </div>
      <div class="evento-info">
        <h3>${evento.nome}</h3>
        <p class="descricao">${evento.descricao || ""}</p>
        <div class="meta-group">
          <p class="meta"><i class="fa-regular fa-calendar"></i> ${dataFormatada}</p>
          <p class="meta"><i class="fa-solid fa-location-dot"></i> ${evento.local_nome || ""}${evento.cidade ? " — " + evento.cidade : ""}</p>
          <p class="meta"><i class="fa-regular fa-heart"></i> 0 pessoas interessadas</p>
        </div>
        <div class="card-footer">
          <span class="preco">${preco}</span>
          <div class="acoes">
            <a href="/frontend/detalheseventos/detalheevento.html?id=${evento.id}" class="btn-detalhes" role="button">
              <i class="fa-solid fa-circle-info"></i> Detalhes
            </a>
            ${btnConfirmar}
          </div>
        </div>
      </div>`;

    return article;
  }

  function formatarData(dataStr) {
    if (!dataStr) return "-";
    const d     = new Date(dataStr);
    const dias  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} &nbsp;<i class="fa-regular fa-clock"></i> ${d.toTimeString().slice(0,5)}`;
  }

  const searchInput    = document.getElementById("searchInput");
  const pillsContainer = document.getElementById("pillsContainer");

  function aplicarFiltros() {
    const categoriaAtiva = document.querySelector(".pill.active")?.getAttribute("data-cat") || "todas";
    const termoBusca     = (searchInput?.value || "").toLowerCase().trim();
    const todos          = document.querySelectorAll(".evento-card");

    eventosFiltrados = [];
    todos.forEach(card => {
      const cat  = (card.getAttribute("data-categoria") || "").toLowerCase();
      const nome = card.querySelector("h3")?.textContent.toLowerCase()         || "";
      const desc = card.querySelector(".descricao")?.textContent.toLowerCase() || "";
      const ok   = (termoBusca === "" || nome.includes(termoBusca) || desc.includes(termoBusca))
                && (categoriaAtiva === "todas" || cat.includes(categoriaAtiva));
      if (ok) eventosFiltrados.push(card);
      card.style.display = "none";
    });

    quantidadeVisiveis = EVENTOS_POR_PAGINA;
    renderizarPagina();
  }

  function renderizarPagina() {
    eventosFiltrados.forEach((card, i) => { card.style.display = i < quantidadeVisiveis ? "flex" : "none"; });
    atualizarContador();
    atualizarBotaoCarregar();
  }

  function atualizarBotaoCarregar() {
    if (!btnCarregar) return;
    const restantes = eventosFiltrados.length - quantidadeVisiveis;
    if (restantes <= 0) { btnCarregar.style.display = "none"; return; }
    btnCarregar.style.display = "inline-flex";
    btnCarregar.innerHTML = `<i class="fa-solid fa-rotate"></i> Carregar mais ${Math.min(restantes, EVENTOS_POR_PAGINA)} eventos`;
  }

  function atualizarContador() {
    const el = document.getElementById("qtdEventos");
    if (el) el.textContent = eventosFiltrados.length || document.querySelectorAll(".evento-card").length;
  }

  if (btnCarregar) {
    btnCarregar.addEventListener("click", () => { quantidadeVisiveis += EVENTOS_POR_PAGINA; renderizarPagina(); });
  }

  if (searchInput)    searchInput.addEventListener("keyup", aplicarFiltros);

  if (pillsContainer) {
    pillsContainer.addEventListener("click", e => {
      const pill = e.target.closest(".pill");
      if (!pill) return;
      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      aplicarImagemHero(pill.getAttribute("data-cat") || "todas");
      aplicarFiltros();
    });
  }

  await carregarEventos();
});
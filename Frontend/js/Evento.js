// Frontend/js/evento.js
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE = isLocal
  ? "http://localhost:3000"
  : window.location.origin;

const API_URL = `${API_BASE}/eventos`;

document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("eventosContainer");
  const btnCarregar = document.getElementById("carregarMais");

  const EVENTOS_POR_PAGINA = 5;
  let todosEventos = [];      // todos vindos da API
  let eventosFiltrados = [];  // após aplicar filtros
  let quantidadeVisiveis = EVENTOS_POR_PAGINA;

  // -------------------------------------------------------
  // CARREGAR EVENTOS
  // -------------------------------------------------------
  async function carregarEventos() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      todosEventos = data;

      document.querySelectorAll(".evento-card").forEach(c => c.remove());

      if (data.length === 0) {
        container.insertAdjacentHTML("afterbegin",
          `<p style="text-align:center;padding:40px;color:#888;">Nenhum evento encontrado.</p>`);
        atualizarContador();
        return;
      }

      // Renderiza todos os cards escondidos — filtragem e paginação controlam a visibilidade
      const carregarBtn = document.querySelector(".carregar-container");
      data.forEach(evento => {
        container.insertBefore(criarCard(evento), carregarBtn);
      });

      aplicarFiltros(); // já aplica filtros E paginação na primeira carga

    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      container.insertAdjacentHTML("afterbegin",
        `<p style="text-align:center;padding:40px;color:red;">Erro ao carregar eventos. Verifique o servidor.</p>`);
    }
  }

  // -------------------------------------------------------
  // CRIAR CARD
  // -------------------------------------------------------
  function criarCard(evento) {
    const article = document.createElement("article");
    article.classList.add("evento-card");
    article.setAttribute("data-categoria", (evento.assunto || "").toLowerCase());
    article.setAttribute("data-nome", evento.nome);
    article.setAttribute("data-id", evento.id);

    const dataFormatada = formatarData(evento.data_inicio);
    const preco = evento.preco_minimo > 0
      ? `R$ ${parseFloat(evento.preco_minimo).toFixed(2)}`
      : "Gratuito";

    const imagemSrc = !evento.imagem
      ? `${API_BASE}/frontend/imagens/jazz.png`
      : evento.imagem.startsWith("http")
        ? evento.imagem
        : `${API_BASE}${evento.imagem}`;

    article.innerHTML = `
      <div class="evento-imagem">
        <img src="${imagemSrc}" alt="${evento.nome}" />
        <span class="badge">${evento.assunto || "Evento"}</span>
      </div>
      <div class="evento-info">
        <h3>${evento.nome}</h3>
        <p class="descricao">${evento.descricao || ""}</p>
        <p class="meta"><i class="fa-regular fa-calendar"></i> ${dataFormatada}</p>
        <p class="meta"><i class="fa-solid fa-location-dot"></i>
          ${evento.local_nome || ""} ${evento.cidade ? "- " + evento.cidade : ""}
        </p>
        <p class="meta"><i class="fa-regular fa-user"></i> 0 pessoas interessadas</p>
        <div class="card-footer">
          <span class="preco">${preco}</span>
          <div class="acoes">
            <a href="/frontend/detalheseventos/detalheevento.html?id=${evento.id}"
               class="btn-detalhes" role="button">Mais Detalhes</a>
            <a href="/frontend/detalheseventos/presencaconfirmada.html"
               class="btn-confirmar" role="button">Confirmar Presença</a>
          </div>
        </div>
      </div>
    `;

    return article;
  }

  // -------------------------------------------------------
  // FORMATAR DATA
  // -------------------------------------------------------
  function formatarData(dataStr) {
    if (!dataStr) return "-";
    const d = new Date(dataStr);
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} &nbsp;<i class="fa-regular fa-clock"></i> ${d.toTimeString().slice(0, 5)}`;
  }

  // -------------------------------------------------------
  // FILTROS + PAGINAÇÃO
  // -------------------------------------------------------
  const searchInput = document.getElementById("searchInput");
  const pillsContainer = document.getElementById("pillsContainer");

  function aplicarFiltros() {
    const categoriaAtiva = document.querySelector(".pill.active")?.getAttribute("data-cat") || "todas";
    const termoBusca = (searchInput?.value || "").toLowerCase().trim();

    const todos = document.querySelectorAll(".evento-card");

    // Monta lista de cards que passam no filtro
    eventosFiltrados = [];
    todos.forEach(card => {
      const cat = (card.getAttribute("data-categoria") || "").toLowerCase();
      const nome = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const desc = card.querySelector(".descricao")?.textContent.toLowerCase() || "";
      const textoOk = termoBusca === "" || nome.includes(termoBusca) || desc.includes(termoBusca);
      const categoriaOk = categoriaAtiva === "todas" || cat.includes(categoriaAtiva);

      if (textoOk && categoriaOk) {
        eventosFiltrados.push(card);
      }

      // Esconde tudo primeiro
      card.style.display = "none";
    });

    // Reseta quantidade visível ao mudar filtro
    quantidadeVisiveis = EVENTOS_POR_PAGINA;

    renderizarPagina();
  }

  function renderizarPagina() {
    // Esconde todos os filtrados antes de mostrar os da página atual
    eventosFiltrados.forEach((card, index) => {
      card.style.display = index < quantidadeVisiveis ? "flex" : "none";
    });

    atualizarContador();
    atualizarBotaoCarregar();
  }

  function atualizarBotaoCarregar() {
    if (!btnCarregar) return;

    const restantes = eventosFiltrados.length - quantidadeVisiveis;

    if (restantes <= 0) {
      btnCarregar.style.display = "none";
    } else {
      btnCarregar.style.display = "inline-block";
      btnCarregar.textContent = `Carregar mais ${Math.min(restantes, EVENTOS_POR_PAGINA)} eventos`;
    }
  }

  function atualizarContador() {
    const el = document.getElementById("qtdEventos");
    if (el) el.textContent = eventosFiltrados.length || document.querySelectorAll(".evento-card").length;
  }

  // -------------------------------------------------------
  // BOTÃO CARREGAR MAIS
  // -------------------------------------------------------
  if (btnCarregar) {
    btnCarregar.addEventListener("click", () => {
      quantidadeVisiveis += EVENTOS_POR_PAGINA;
      renderizarPagina();
    });
  }

  // -------------------------------------------------------
  // EVENTOS DE FILTRO
  // -------------------------------------------------------
  if (searchInput) searchInput.addEventListener("keyup", aplicarFiltros);

  if (pillsContainer) {
    pillsContainer.addEventListener("click", (e) => {
      if (!e.target.matches(".pill")) return;
      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      e.target.classList.add("active");
      aplicarFiltros();
    });
  }

  // -------------------------------------------------------
  // INICIAR
  // -------------------------------------------------------
  await carregarEventos();
});
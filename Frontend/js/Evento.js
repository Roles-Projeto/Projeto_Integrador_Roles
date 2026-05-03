// Frontend/js/evento.js
const API_URL = "/eventos";

document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("eventosContainer");

  // -------------------------------------------------------
  // CARREGAR EVENTOS
  // -------------------------------------------------------
  async function carregarEventos() {
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();

      document.querySelectorAll(".evento-card").forEach(c => c.remove());

      if (data.length === 0) {
        container.insertAdjacentHTML("afterbegin",
          `<p style="text-align:center;padding:40px;color:#888;">Nenhum evento encontrado.</p>`);
        atualizarContador();
        return;
      }

      data.forEach(evento => {
        const carregarBtn = document.querySelector(".carregar-container");
        container.insertBefore(criarCard(evento), carregarBtn);
      });

      atualizarContador();
      aplicarFiltros();

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

    // Remova o "º" e o espaço, deixando exatamente como o nome do arquivo na pasta
const imagemSrc = evento.imagem || evento.imagem_url || "../imagens/jazz.png";

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
    const dias  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} &nbsp;<i class="fa-regular fa-clock"></i> ${d.toTimeString().slice(0,5)}`;
  }

  // -------------------------------------------------------
  // FILTROS
  // -------------------------------------------------------
  const searchInput    = document.getElementById("searchInput");
  const pillsContainer = document.getElementById("pillsContainer");

  function aplicarFiltros() {
    const categoriaAtiva = document.querySelector(".pill.active")?.getAttribute("data-cat") || "todas";
    const termoBusca     = (searchInput?.value || "").toLowerCase().trim();

    document.querySelectorAll(".evento-card").forEach(card => {
      const cat  = (card.getAttribute("data-categoria") || "").toLowerCase();
      const nome = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const desc = card.querySelector(".descricao")?.textContent.toLowerCase() || "";
      const textoOk     = termoBusca === "" || nome.includes(termoBusca) || desc.includes(termoBusca);
      const categoriaOk = categoriaAtiva === "todas" || cat.includes(categoriaAtiva);
      card.style.display = textoOk && categoriaOk ? "flex" : "none";
    });

    atualizarContador();
  }

  function atualizarContador() {
    const visiveis = document.querySelectorAll('.evento-card[style*="flex"]').length;
    const el = document.getElementById("qtdEventos");
    if (el) el.textContent = visiveis || document.querySelectorAll(".evento-card").length;
  }

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
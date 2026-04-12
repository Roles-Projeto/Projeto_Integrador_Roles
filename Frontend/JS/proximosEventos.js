// Frontend/js/evento.js
const API_URL = "http://localhost:3000/eventos";

document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("eventosContainer");

  // -------------------------------------------------------
  // CARREGAR EVENTOS
  // -------------------------------------------------------
  async function carregarEventos() {
    try {
      const res   = await fetch(API_URL);
      const data  = await res.json();

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
  // CRIAR CARD COM BOTÕES EDITAR / EXCLUIR
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

    const imagemSrc = evento.imagem || "../Imagens/7º imagem card.png";

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
            <a href="../verDetalhesEventos/detalhesEventos.html?id=${evento.id}"
               class="btn-detalhes" role="button">Mais Detalhes</a>
            <a href="../verDetalhesEventos/presencaConfirmada.html"
               class="btn-confirmar" role="button">Confirmar Presença</a>
          </div>
        </div>

        <!-- Botões editar / excluir -->
        <div class="acoes-admin" style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn-editar-evento" data-id="${evento.id}"
            style="flex:1;padding:8px;background:#6c63ff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;">
            ✏️ Editar
          </button>
          <button class="btn-excluir-evento" data-id="${evento.id}"
            style="flex:1;padding:8px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;">
            🗑️ Excluir
          </button>
        </div>
      </div>
    `;

    // Excluir
    article.querySelector(".btn-excluir-evento").addEventListener("click", async () => {
      if (!confirm(`Tem certeza que deseja excluir "${evento.nome}"?`)) return;
      try {
        const res = await fetch(`${API_URL}/${evento.id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);
        alert("✅ Evento excluído!");
        article.remove();
        atualizarContador();
      } catch (err) {
        alert("❌ Erro ao excluir: " + err.message);
      }
    });

    // Editar
    article.querySelector(".btn-editar-evento").addEventListener("click", () => {
      abrirModalEditar(evento);
    });

    return article;
  }

  // -------------------------------------------------------
  // MODAL DE EDIÇÃO
  // -------------------------------------------------------
  function abrirModalEditar(evento) {
    // Remove modal anterior se existir
    document.getElementById("modalEdicao")?.remove();

    const dataInicio = evento.data_inicio ? evento.data_inicio.slice(0,16) : "";
    const dataFim    = evento.data_fim    ? evento.data_fim.slice(0,16)    : "";

    const modal = document.createElement("div");
    modal.id = "modalEdicao";
    modal.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.6);z-index:9999;
      display:flex;align-items:center;justify-content:center;
    `;

    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:32px;width:90%;max-width:560px;
                  max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
        <h2 style="margin-bottom:20px;color:#333;">✏️ Editar Evento</h2>

        <label style="display:block;margin-bottom:4px;font-weight:600;">Nome *</label>
        <input id="edit-nome" value="${evento.nome || ""}"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:14px;box-sizing:border-box;">

        <label style="display:block;margin-bottom:4px;font-weight:600;">Assunto</label>
        <input id="edit-assunto" value="${evento.assunto || ""}"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:14px;box-sizing:border-box;">

        <label style="display:block;margin-bottom:4px;font-weight:600;">Descrição</label>
        <textarea id="edit-descricao"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:14px;box-sizing:border-box;height:80px;">${evento.descricao || ""}</textarea>

        <div style="display:flex;gap:12px;margin-bottom:14px;">
          <div style="flex:1;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Data Início *</label>
            <input id="edit-data-inicio" type="datetime-local" value="${dataInicio}"
              style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
          </div>
          <div style="flex:1;">
            <label style="display:block;margin-bottom:4px;font-weight:600;">Data Término *</label>
            <input id="edit-data-fim" type="datetime-local" value="${dataFim}"
              style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;box-sizing:border-box;">
          </div>
        </div>

        <label style="display:block;margin-bottom:4px;font-weight:600;">Local</label>
        <input id="edit-local" value="${evento.local_nome || ""}"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:14px;box-sizing:border-box;">

        <label style="display:block;margin-bottom:4px;font-weight:600;">Cidade</label>
        <input id="edit-cidade" value="${evento.cidade || ""}"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:14px;box-sizing:border-box;">

        <label style="display:block;margin-bottom:4px;font-weight:600;">Estado</label>
        <input id="edit-estado" value="${evento.estado || ""}" maxlength="2"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:14px;box-sizing:border-box;">

        <label style="display:block;margin-bottom:4px;font-weight:600;">Nome do Produtor</label>
        <input id="edit-produtor" value="${evento.nome_produtor || ""}"
          style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:20px;box-sizing:border-box;">

        <div style="display:flex;gap:12px;">
          <button id="btn-cancelar-edicao"
            style="flex:1;padding:12px;background:#eee;border:none;border-radius:8px;cursor:pointer;font-size:15px;">
            Cancelar
          </button>
          <button id="btn-salvar-edicao"
            style="flex:1;padding:12px;background:#6c63ff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;">
            Salvar alterações
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Fechar ao clicar fora
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById("btn-cancelar-edicao").addEventListener("click", () => modal.remove());

    document.getElementById("btn-salvar-edicao").addEventListener("click", async () => {
      const nome       = document.getElementById("edit-nome").value.trim();
      const dataInicio = document.getElementById("edit-data-inicio").value;
      const dataFim    = document.getElementById("edit-data-fim").value;

      if (!nome || !dataInicio || !dataFim) {
        alert("Preencha nome, data de início e data de término.");
        return;
      }

      const payload = {
        nome,
        assunto:       document.getElementById("edit-assunto").value.trim(),
        descricao:     document.getElementById("edit-descricao").value.trim(),
        data_inicio:   dataInicio.replace("T", " ") + ":00",
        data_fim:      dataFim.replace("T", " ") + ":00",
        local_nome:    document.getElementById("edit-local").value.trim(),
        cidade:        document.getElementById("edit-cidade").value.trim(),
        estado:        document.getElementById("edit-estado").value.trim(),
        nome_produtor: document.getElementById("edit-produtor").value.trim(),
        imagem:        evento.imagem || null,
        categoria:     evento.categoria || null,
        cep:           evento.cep || null,
        rua:           evento.rua || null,
      };

      try {
        const res  = await fetch(`${API_URL}/${evento.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro);

        alert("✅ Evento atualizado!");
        modal.remove();
        carregarEventos(); // Recarrega a lista
      } catch (err) {
        alert("❌ Erro ao salvar: " + err.message);
      }
    });
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

  function getEstadoFiltros() {
    const categoriaAtiva = document.querySelector(".pill.active")?.getAttribute("data-cat") || "todas";
    const termoBusca     = (searchInput?.value || "").toLowerCase().trim();
    return { categoriaAtiva, termoBusca };
  }

  function aplicarFiltros() {
    const { categoriaAtiva, termoBusca } = getEstadoFiltros();
    document.querySelectorAll(".evento-card").forEach(card => {
      const cat  = (card.getAttribute("data-categoria") || "").toLowerCase();
      const nome = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const desc = card.querySelector(".descricao")?.textContent.toLowerCase() || "";
      const textoOk    = termoBusca === "" || nome.includes(termoBusca) || desc.includes(termoBusca);
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
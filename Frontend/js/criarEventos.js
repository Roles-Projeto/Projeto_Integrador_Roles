// ====================================================
// VARIÁVEIS GLOBAIS
// ====================================================
const API_URL = window.API_BASE;

const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressBar = document.getElementById("progress-bar");
const stepIndicator = document.getElementById("step-indicator");

const modal = document.getElementById("modalConfirmacao");
const resumoEvento = document.getElementById("resumoEvento");
const cancelarBtn = document.getElementById("cancelarPublicacao");
const confirmarBtn = document.getElementById("confirmarPublicacao");

let currentStep = 0;

// ====================================================
// MOSTRAR ETAPA
// ====================================================
function showStep(index) {
    steps.forEach((step, i) => {
        step.style.display = i === index ? "block" : "none";
    });

    prevBtn.style.display = index === 0 ? "none" : "inline-block";

    if (index > 0) {
        prevBtn.innerHTML = '<img src="/frontend/imagens/seta-direita.png" style="transform: scaleX(-1); width:40px;">';
    }

    if (index === steps.length - 1) {
        nextBtn.textContent = "Publicar Evento";
        nextBtn.className = "btn-primary";
        nextBtn.style.padding = "12px 28px";
    } else {
        nextBtn.innerHTML = '<img src="/frontend/imagens/seta-direita.png" style="width:40px;">';
        nextBtn.className = "btn-success";
        nextBtn.style.padding = "";
    }

    atualizarProgresso();
}

// ====================================================
// PROGRESSO
// ====================================================
function atualizarProgresso() {
    const total = steps.length;
    const progresso = ((currentStep + 1) / total) * 100;
    progressBar.style.width = progresso + "%";
    stepIndicator.textContent = `Etapa ${currentStep + 1} de ${total}`;
}

// ====================================================
// VALIDAÇÃO POR ETAPA
// ====================================================
function validarEtapa(index) {
    // Etapa 1 — Nome e Assunto obrigatórios
    if (index === 0) {
        const nome = document.getElementById("event-name")?.value?.trim();
        const assunto = document.getElementById("assunto")?.value;

        if (!nome) {
            alert("Informe o nome do evento.");
            return false;
        }
        if (!assunto) {
            alert("Selecione um assunto para o evento.");
            document.getElementById("assunto").style.border = "2px solid red";
            return false;
        }
        document.getElementById("assunto").style.border = "";
    }

    // Etapa 3 — Datas obrigatórias
    if (index === 2) {
        const dataInicio = document.getElementById("start-date")?.value;
        const horaInicio = document.getElementById("start-time")?.value;
        const dataFim = document.getElementById("end-date")?.value;
        const horaFim = document.getElementById("end-time")?.value;

        if (!dataInicio || !horaInicio) {
            alert("Informe a data e hora de início.");
            return false;
        }
        if (!dataFim || !horaFim) {
            alert("Informe a data e hora de término.");
            return false;
        }

        const inicio = new Date(`${dataInicio}T${horaInicio}`);
        const fim = new Date(`${dataFim}T${horaFim}`);
        const agora = new Date();

        if (inicio < agora) {
            alert("A data de início não pode ser no passado.");
            return false;
        }
        if (fim <= inicio) {
            alert("A data de término deve ser depois da data de início.");
            return false;
        }
    }

    // Etapa 7 — Nome do produtor e termos
    if (index === 6) {
        const produtor = document.getElementById("producer-name")?.value?.trim();
        const termos = document.getElementById("terms")?.checked;

        if (!produtor) {
            alert("Informe o nome do produtor.");
            return false;
        }
        if (!termos) {
            alert("Você precisa aceitar os Termos de Uso para publicar.");
            return false;
        }
    }

    return true;
}

// ====================================================
// BOTÃO PRÓXIMO
// ====================================================
nextBtn.addEventListener("click", () => {
    if (!validarEtapa(currentStep)) return;

    if (currentStep === steps.length - 1) {
        mostrarResumo();
        return;
    }
    currentStep++;
    showStep(currentStep);
});

// ====================================================
// BOTÃO VOLTAR
// ====================================================
prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
});

// ====================================================
// AUTOSAVE
// ====================================================
function salvarRascunho() {
    const dados = {};
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
        if (input.type === "checkbox") {
            dados[input.id] = input.checked;
        } else {
            dados[input.id] = input.value;
        }
    });
    localStorage.setItem("rascunhoEvento", JSON.stringify(dados));
}

setInterval(salvarRascunho, 5000);

// ====================================================
// CARREGAR RASCUNHO
// ====================================================
function carregarRascunho() {
    const dados = JSON.parse(localStorage.getItem("rascunhoEvento"));
    if (!dados) return;
    Object.keys(dados).forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        if (input.type === "checkbox") {
            input.checked = dados[id];
        } else {
            input.value = dados[id];
        }
    });
}

window.addEventListener("load", carregarRascunho);

// ====================================================
// MOSTRAR RESUMO
// ====================================================
const stepNavigation = document.querySelector(".step-navigation");

function mostrarResumo() {
    stepNavigation.style.display = "none";

    const nome = document.getElementById("event-name")?.value || "-";
    const produtor = document.getElementById("producer-name")?.value || "-";
    const dataInicio = document.getElementById("start-date")?.value || "-";
    const horaInicio = document.getElementById("start-time")?.value || "-";
    const dataFim = document.getElementById("end-date")?.value || "-";
    const horaFim = document.getElementById("end-time")?.value || "-";
    const nomeLocal = document.getElementById("local-nome")?.value || "";
    const rua = document.getElementById("rua")?.value || "";
    const cidade = document.getElementById("cidade")?.value || "";
    const estado = document.getElementById("estado")?.value || "";

    let local = "-";
    if (nomeLocal || rua || cidade) {
        local = `${nomeLocal}<br>${rua}<br>${cidade} - ${estado}`;
    }

    const descricao = document.getElementById("descricao")?.value || "-";

    let tipoIngresso = "Nenhum ingresso criado";
    if (listaIngressos.length > 0) {
        tipoIngresso = "<ul>";
        listaIngressos.forEach(ing => {
            const valorDisplay = ing.tipo === "pago" ? `R$ ${ing.valor}` : "Gratuito";
            tipoIngresso += `<li>${ing.titulo} - ${valorDisplay}</li>`;
        });
        tipoIngresso += "</ul>";
    }

    resumoEvento.innerHTML = `
        <h3>Resumo do Evento</h3>
        <p><strong>Evento:</strong> ${nome}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <p><strong>Local:</strong> ${local}</p>
        <p><strong>Data início:</strong> ${dataInicio} às ${horaInicio}</p>
        <p><strong>Data término:</strong> ${dataFim} às ${horaFim}</p>
        <p><strong>Produtor:</strong> ${produtor}</p>
        <p><strong>Ingressos:</strong> ${tipoIngresso}</p>
        ${imagemEvento ? `<p><strong>Imagem:</strong> ✅ Carregada</p>` : ""}
    `;

    modal.style.display = "flex";
}

// ====================================================
// CANCELAR PUBLICAÇÃO
// ====================================================
cancelarBtn.addEventListener("click", () => {
    modal.style.display = "none";
    stepNavigation.style.display = "flex";
});

// ====================================================
// CONFIRMAR PUBLICAÇÃO
// ====================================================
confirmarBtn.addEventListener("click", async () => {
    const dataInicio = document.getElementById("start-date")?.value;
    const horaInicio = document.getElementById("start-time")?.value;
    const dataFim = document.getElementById("end-date")?.value;
    const horaFim = document.getElementById("end-time")?.value;

    // Faz upload da imagem primeiro
    let imagemUrl = null;
    if (imagemEvento) {
        const formData = new FormData();
        formData.append('imagem', imagemEvento);

        const uploadRes = await fetch(`${API_URL}/upload-imagem`, {
            method: 'POST',
            body: formData
        });
        const uploadData = await uploadRes.json();
        imagemUrl = uploadData.url;
    }

    const evento = {
        nome: document.getElementById("event-name")?.value?.trim(),
        assunto: document.getElementById("assunto")?.value,
        categoria: document.getElementById("categoria")?.value,
        imagem: imagemUrl,
        data_inicio: dataInicio && horaInicio ? `${dataInicio} ${horaInicio}:00` : null,
        data_fim: dataFim && horaFim ? `${dataFim} ${horaFim}:00` : null,
        descricao: document.getElementById("descricao")?.value?.trim(),
        local_nome: document.getElementById("local-nome")?.value?.trim(),
        cep: document.getElementById("cep")?.value?.trim(),
        rua: document.getElementById("rua")?.value?.trim(),
        cidade: document.getElementById("cidade")?.value?.trim(),
        estado: document.getElementById("estado")?.value?.trim(),
        nome_produtor: document.getElementById("producer-name")?.value?.trim(),
        ingressos: listaIngressos,
    };

    confirmarBtn.disabled = true;
    confirmarBtn.textContent = "Publicando...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evento),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("DETALHES DO ERRO:", data);
            confirmarBtn.disabled = false;
            confirmarBtn.textContent = "Confirmar publicação";
            throw new Error(data.erro + " | " + (data.detalhes || ""));
        }

        localStorage.removeItem("rascunhoEvento");
        modal.style.display = "none";

        alert("✅ Evento publicado com sucesso!");

        window.location.replace(`${window.location.origin}/frontend/eventos/eventos.html`);

    } catch (err) {
        console.error("ERRO COMPLETO:", err);
        alert("❌ Erro ao publicar: " + err.message);
        confirmarBtn.disabled = false;
        confirmarBtn.textContent = "Confirmar publicação";
    }
});

// ====================================================
// INICIALIZAÇÃO
// ====================================================
showStep(currentStep);

// ====================================================
// CATEGORIAS POR ASSUNTO
// ====================================================
const categoriasPorAssunto = {
    "Festa e Balada": ["Aniversário", "Formatura", "Open Bar", "Festa Universitária", "Baile", "After", "Happy Hour"],
    "Shows e Música": ["Sertanejo", "Funk", "Pagode", "Rock", "Eletrônica", "Rap / Trap", "DJ", "K-pop"],
    "Gastronomia": ["Festival gastronômico", "Rodízio", "Degustação", "Churrasco", "Food Truck"],
    "Esportes": ["Futebol", "Corrida", "Treino funcional", "Campeonato", "Torneio"],
    "Cultura e Arte": ["Teatro", "Cinema", "Exposição", "Stand-up", "Dança"],
    "Cursos e Workshops": ["Curso", "Workshop", "Palestra", "Oficina", "Mentoria"],
    "Infantil e Família": ["Festa infantil", "Parque", "Teatro infantil", "Brincadeiras"],
    "Tecnologia": ["Hackathon", "Meetup", "Conferência", "Workshop Tech"],
    "Religião e Espiritualidade": ["Culto", "Retiro", "Congresso", "Meditação"],
    "Networking e Negócios": ["Networking", "Palestra", "Summit", "Feira"],
    "Saúde e Bem-estar": ["Yoga", "Meditação", "Corrida", "Palestra de saúde"],
    "Festivais": ["Festival de música", "Festival gastronômico", "Festival cultural"],
};

const assuntoSelect = document.getElementById("assunto");
const categoriaSelect = document.getElementById("categoria");

assuntoSelect.addEventListener("change", () => {
    const assunto = assuntoSelect.value;
    assuntoSelect.style.border = "";
    categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    if (categoriasPorAssunto[assunto]) {
        categoriasPorAssunto[assunto].forEach(cat => {
            const option = document.createElement("option");
            option.textContent = cat;
            categoriaSelect.appendChild(option);
        });
    }
});

// ====================================================
// UPLOAD DE IMAGEM DO EVENTO
// ====================================================
const dropZone = document.getElementById("drop-zone");
let imagemEvento = null;

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/jpeg, image/png, image/gif";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

dropZone.addEventListener("click", () => { fileInput.click(); });

fileInput.addEventListener("change", (e) => {
    processarImagem(e.target.files[0]);
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.border = "2px dashed #6c63ff";
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.border = "";
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.border = "";
    processarImagem(e.dataTransfer.files[0]);
});

function processarImagem(file) {
    if (!file) return;
    const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];
    if (!tiposPermitidos.includes(file.type)) {
        alert("Formato inválido. Use JPEG, PNG ou GIF.");
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        alert("Imagem muito grande. Máximo 2MB.");
        return;
    }

    imagemEvento = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        dropZone.innerHTML = `
            <img src="${e.target.result}"
                 style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
        `;
    };
    reader.readAsDataURL(file);
}

// ====================================================
// BUSCA DE CEP
// ====================================================
const cepInput = document.getElementById("cep");
const ruaInput = document.getElementById("rua");
const cidadeInput = document.getElementById("cidade");
const estadoInput = document.getElementById("estado");

cepInput.addEventListener("input", () => {
    let valor = cepInput.value.replace(/\D/g, "");
    if (valor.length > 5) valor = valor.slice(0, 5) + "-" + valor.slice(5, 8);
    cepInput.value = valor;
});

cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) { alert("CEP não encontrado"); limparEndereco(); return; }
        ruaInput.value = data.logradouro || "";
        cidadeInput.value = data.localidade || "";
        estadoInput.value = data.uf || "";
    } catch (error) {
        alert("Erro ao buscar CEP");
    }
});

function limparEndereco() {
    ruaInput.value = "";
    cidadeInput.value = "";
    estadoInput.value = "";
}

// ====================================================
// INGRESSOS
// ====================================================
const ticketConfigCard = document.querySelector(".ticket-config-card");
const listaContainer = document.querySelector(".lista-ingressos");
const listaIngressos = [];
let ingressoEditandoIndex = null;

document.querySelectorAll(".btn-ticket-action").forEach(btn => {
    btn.addEventListener("click", () => {
        const tipo = btn.dataset.tipo;
        const existente = ticketConfigCard.querySelector(".ticket-item");
        if (existente) existente.remove();
        ticketConfigCard.style.display = "flex";
        criarFormIngresso(tipo);
    });
});

function criarFormIngresso(tipo) {
    const ticketItem = document.createElement("div");
    ticketItem.classList.add("ticket-item");
    ticketItem.dataset.tipo = tipo;

    const tituloForm = tipo === "pago" ? "Criar ingresso pago" : "Criar ingresso gratuito";
    const descTaxa = tipo === "pago"
        ? `<p>A taxa de serviço é repassada ao comprador, sendo exibida junto com o valor do ingresso</p>`
        : `<p>Este ingresso é gratuito. Nenhum valor será cobrado do participante.</p>`;
    const camposValor = tipo === "pago" ? `
        <label>Valor a receber (R$)</label>
        <input type="number" step="0.01" placeholder="0,00" class="valor-ingresso">
        <label>Valor do participante (R$)</label>
        <input type="number" step="0.01" value="0.00" class="valor-participante" readonly>
    ` : '';

    ticketItem.innerHTML = `
        <button class="remove-ticket" type="button">
            <img src="/frontend/imagens/fechar.png" alt="Excluir" style="width: 20px; height: 20px;">
        </button>
        <h4>${tituloForm}</h4>
        ${descTaxa}
        <h5>Sobre o ingresso</h5>
        <label>Título do ingresso</label>
        <input type="text" class="titulo-ingresso" maxlength="45" placeholder="Ingresso único, Meia-Entrada, VIP, etc.">
        <label>Quantidade</label>
        <input type="number" class="quantidade-ingresso" placeholder="Ex. 100" min="1">
        ${camposValor}
        <label><input type="checkbox"> Criar meia-entrada para este ingresso</label>
        <a href="#">Saiba mais sobre as políticas de meia-entrada</a>
        <h5>Quando o ingresso será vendido</h5>
        <div class="radio-group">
            <label><input type="radio" name="venda-form" value="por-data" checked> Por data</label>
            <label>
                <input type="radio" name="venda-form" value="por-lote" class="radio-lote"> Por lote
                <span class="help-lote" title="A opção 'Por lote' permite vender ingressos em etapas diferentes.">?</span>
            </label>
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:8px;">
            <div style="flex:1; min-width:220px;">
                <label style="display:block; margin-bottom:6px;">Início das Vendas <span style="color:red">*</span></label>
                <input type="datetime-local" class="data-inicio-venda" style="padding:10px; width:100%; border-radius:8px; border:1px solid #ccc; font-size:14px; box-sizing:border-box;">
            </div>
            <div style="flex:1; min-width:220px;">
                <label style="display:block; margin-bottom:6px;">Término das Vendas <span style="color:red">*</span></label>
                <input type="datetime-local" class="data-fim-venda" style="padding:10px; width:100%; border-radius:8px; border:1px solid #ccc; font-size:14px; box-sizing:border-box;">
            </div>
        </div>
        <label>Quem pode comprar</label>
        <select class="quem-compra">
            <option>Para todo o público</option>
            <option>Restrito a convidados</option>
            <option>Adicionar manualmente</option>
        </select>
        <label>Quantidade permitida por compra</label>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <input type="number" class="min-compra" placeholder="Mínima" min="1" style="flex:1; min-width:120px;">
            <input type="number" class="max-compra" placeholder="Máxima" min="1" style="flex:1; min-width:120px;">
        </div>
        <label>Descrição do ingresso (opcional)</label>
        <textarea class="descricao-ingresso" maxlength="100" placeholder="Informações adicionais ao nome do ingresso."></textarea>
        <div class="ticket-actions">
            <button class="btnSalvarIngresso btn-primary" type="button">Salvar ingresso</button>
        </div>
    `;

    if (tipo === "pago") {
        const valorIngresso = ticketItem.querySelector(".valor-ingresso");
        const valorParticipante = ticketItem.querySelector(".valor-participante");
        valorIngresso.addEventListener("input", () => {
            const valor = parseFloat(valorIngresso.value);
            valorParticipante.value = !isNaN(valor) ? (valor * 1.10).toFixed(2) : "0.00";
        });
    }

    ticketItem.querySelector(".radio-lote").addEventListener("change", () => {
        if (listaIngressos.length < 1) {
            alert("Para utilizar 'Por lote', é necessário criar mais de um ingresso.");
            ticketItem.querySelector('input[value="por-data"]').checked = true;
        }
    });

    ticketItem.querySelector(".remove-ticket").addEventListener("click", () => {
        ticketItem.remove();
        ingressoEditandoIndex = null;
        if (listaIngressos.length === 0) ticketConfigCard.style.display = "none";
    });

    ticketItem.querySelector(".btnSalvarIngresso").addEventListener("click", () => {
        const titulo = ticketItem.querySelector(".titulo-ingresso").value.trim();
        const quantidade = ticketItem.querySelector(".quantidade-ingresso").value;

        if (!titulo) {
            alert("Informe o título do ingresso.");
            return;
        }

        if (!quantidade || quantidade <= 0) {
            alert("Informe a quantidade.");
            return;
        }

        let valor = 0;

        if (tipo === "pago") {
            const valorCampo = ticketItem.querySelector(".valor-ingresso").value;
            valor = valorCampo ? parseFloat(valorCampo).toFixed(2) : "0.00";
        }

        const ingresso = {
            titulo,
            valor,
            tipo,
            quantidade_total: quantidade
        };

        listaIngressos.push(ingresso);
        renderizarIngressos();
        ticketItem.remove();
    });

    ticketConfigCard.insertBefore(ticketItem, listaContainer);
}

// ====================================================
// RENDERIZAR INGRESSOS
// ====================================================
function renderizarIngressos() {
    listaContainer.innerHTML = "";
    if (listaIngressos.length === 0) {
        if (!ticketConfigCard.querySelector(".ticket-item")) ticketConfigCard.style.display = "none";
        return;
    }
    listaContainer.innerHTML = "<h3>Ingressos criados</h3>";
    listaIngressos.forEach((ingresso, index) => {
        const item = document.createElement("div");
        item.classList.add("ingresso-resumo");
        const valorDisplay = ingresso.tipo === "pago" ? `R$ ${ingresso.valor}` : "Gratuito";
        item.innerHTML = `
            <div><strong>${ingresso.titulo}</strong> &nbsp;— ${valorDisplay}</div>
            <div>
                <button class="btn-editar" onclick="editarIngresso(${index})">Editar</button>
                <button class="btn-excluir" onclick="excluirIngresso(${index})">Excluir</button>
            </div>
        `;
        listaContainer.appendChild(item);
    });
}

// ====================================================
// EDITAR / EXCLUIR INGRESSO
// ====================================================
function editarIngresso(index) {
    ingressoEditandoIndex = index;
    const ingresso = listaIngressos[index];
    const existente = ticketConfigCard.querySelector(".ticket-item");
    if (existente) existente.remove();
    ticketConfigCard.style.display = "flex";
    criarFormIngresso(ingresso.tipo);
    const form = ticketConfigCard.querySelector(".ticket-item");
    form.querySelector(".titulo-ingresso").value = ingresso.titulo;
    if (ingresso.tipo === "pago") {
        const valorIngresso = form.querySelector(".valor-ingresso");
        const valorParticipante = form.querySelector(".valor-participante");
        valorIngresso.value = ingresso.valor;
        valorParticipante.value = (parseFloat(ingresso.valor) * 1.10).toFixed(2);
    }
}

function excluirIngresso(index) {
    listaIngressos.splice(index, 1);
    renderizarIngressos();
}
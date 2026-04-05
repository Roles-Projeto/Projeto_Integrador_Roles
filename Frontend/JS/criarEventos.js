// ====================================================
// VARIÁVEIS GLOBAIS
// ====================================================

const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressBar = document.getElementById("progress-bar");
const stepIndicator = document.getElementById("step-indicator");

// MODAL
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
        prevBtn.innerHTML = '<img src="../imagens/seta-direita.png" style="transform: scaleX(-1); width:40px;">';
    }

    if (index === steps.length - 1) {
        nextBtn.textContent = "Publicar Evento";
        nextBtn.className = "btn-primary";
        nextBtn.style.padding = "12px 28px";
    } else {
        nextBtn.innerHTML = '<img src="../imagens/seta-direita.png" style="width:40px;">';
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
// BOTÃO PRÓXIMO
// ====================================================

nextBtn.addEventListener("click", () => {
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
    console.log("Rascunho salvo automaticamente");
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
    console.log("Rascunho carregado");
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

    let descricao = "-";
    const descricaoTextarea = document.getElementById("descricao");
    if (descricaoTextarea) {
        descricao = descricaoTextarea.value || "-";
    }

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

confirmarBtn.addEventListener("click", () => {
    alert("Evento publicado com sucesso!");
    localStorage.removeItem("rascunhoEvento");
    modal.style.display = "none";
    stepNavigation.style.display = "flex";
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
    "Shows e Música": ["Sertanejo", "Funk", "Pagode", "Rock", "Eletrônica", "Rap / Trap", "DJ"],
    "Gastronomia": ["Festival gastronômico", "Rodízio", "Degustação", "Churrasco", "Food Truck"],
    "Esportes": ["Futebol", "Corrida", "Treino funcional", "Campeonato", "Torneio"],
    "Cultura e Arte": ["Teatro", "Cinema", "Exposição", "Stand-up", "Dança"],
    "Cursos e Workshops": ["Curso", "Workshop", "Palestra", "Oficina", "Mentoria"]
};

const assuntoSelect = document.getElementById("assunto");
const categoriaSelect = document.getElementById("categoria");

assuntoSelect.addEventListener("change", () => {
    const assunto = assuntoSelect.value;
    categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    if (categoriasPorAssunto[assunto]) {
        categoriasPorAssunto[assunto].forEach(categoria => {
            const option = document.createElement("option");
            option.textContent = categoria;
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
    const file = e.target.files[0];
    processarImagem(file);
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
    const file = e.dataTransfer.files[0];
    processarImagem(file);
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
    mostrarPreview(file);
}

function mostrarPreview(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
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
    if (valor.length > 5) {
        valor = valor.slice(0, 5) + "-" + valor.slice(5, 8);
    }
    cepInput.value = valor;
});

cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            alert("CEP não encontrado");
            limparEndereco();
            return;
        }
        preencherEndereco(data);
    } catch (error) {
        alert("Erro ao buscar CEP");
        console.error(error);
    }
});

function preencherEndereco(data) {
    ruaInput.value = data.logradouro || "";
    cidadeInput.value = data.localidade || "";
    estadoInput.value = data.uf || "";
}

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

// Botões "Criar ingresso pago" e "Criar ingresso gratuito"
document.querySelectorAll(".btn-ticket-action").forEach(btn => {
    btn.addEventListener("click", () => {
        const tipo = btn.dataset.tipo;

        // Remove qualquer formulário aberto e cria um novo
        // (permite abrir múltiplas vezes clicando nos botões)
        const existente = ticketConfigCard.querySelector(".ticket-item");
        if (existente) existente.remove();

        // Exibe o card
        ticketConfigCard.style.display = "flex";

        // Cria o formulário do tipo correto
        criarFormIngresso(tipo);
    });
});

// ====================================================
// CRIAR FORMULÁRIO DE INGRESSO (PAGO OU GRATUITO)
// ====================================================

function criarFormIngresso(tipo) {
    const ticketItem = document.createElement("div");
    ticketItem.classList.add("ticket-item");
    ticketItem.dataset.tipo = tipo;

    const tituloForm = tipo === "pago" ? "Criar ingresso pago" : "Criar ingresso gratuito";

    const descTaxa = tipo === "pago"
        ? `<p>A taxa de serviço é repassada ao comprador, sendo exibida junto com o valor do ingresso</p>`
        : `<p>Este ingresso é gratuito. Nenhum valor será cobrado do participante.</p>`;

    // Campos de valor só aparecem no ingresso pago
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
        <input type="text" class="titulo-ingresso" maxlength="45"
               placeholder="Ingresso único, Meia-Entrada, VIP, etc.">

        <label>Quantidade</label>
        <input type="number" class="quantidade-ingresso" placeholder="Ex. 100" min="1">

        ${camposValor}

        <label>
            <input type="checkbox">
            Criar meia-entrada para este ingresso
        </label>
        <a href="#">Saiba mais sobre as políticas de meia-entrada</a>

        <h5>Quando o ingresso será vendido</h5>

        <div class="radio-group">
            <label>
                <input type="radio" name="venda-form" value="por-data" checked>
                Por data
            </label>
            <label>
                <input type="radio" name="venda-form" value="por-lote" class="radio-lote">
                Por lote
                <span class="help-lote"
                      title="A opção 'Por lote' permite vender ingressos em etapas diferentes, como Lote 1, Lote 2 e Lote 3.">
                    ?
                </span>
            </label>
        </div>

        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:8px;">

            <div style="flex:1; min-width:220px;">
                <label style="display:block; margin-bottom:6px;">
                    Início das Vendas <span style="color:red">*</span>
                </label>
                <div class="icon-input">
                    <i class="fa-regular fa-calendar-days"></i>
                    <input type="datetime-local" class="data-inicio-venda"
                           style="padding-left:38px; width:100%; border-radius:8px; border:1px solid #ccc; padding-top:10px; padding-bottom:10px; font-size:14px; box-sizing:border-box;">
                </div>
            </div>

            <div style="flex:1; min-width:220px;">
                <label style="display:block; margin-bottom:6px;">
                    Término das Vendas <span style="color:red">*</span>
                </label>
                <div class="icon-input">
                    <i class="fa-regular fa-calendar-days"></i>
                    <input type="datetime-local" class="data-fim-venda"
                           style="padding-left:38px; width:100%; border-radius:8px; border:1px solid #ccc; padding-top:10px; padding-bottom:10px; font-size:14px; box-sizing:border-box;">
                </div>
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
            <input type="number" class="min-compra" placeholder="Mínima" min="1"
                   style="flex:1; min-width:120px;">
            <input type="number" class="max-compra" placeholder="Máxima" min="1"
                   style="flex:1; min-width:120px;">
        </div>

        <label>Descrição do ingresso (opcional)</label>
        <textarea class="descricao-ingresso" maxlength="100"
                  placeholder="Informações adicionais ao nome do ingresso."></textarea>

        <div class="ticket-actions">
            <button class="btnSalvarIngresso btn-primary" type="button">Salvar ingresso</button>
        </div>
    `;

    // --- Calcular taxa de 10% (só ingresso pago) ---
    if (tipo === "pago") {
        const valorIngresso = ticketItem.querySelector(".valor-ingresso");
        const valorParticipante = ticketItem.querySelector(".valor-participante");

        valorIngresso.addEventListener("input", () => {
            const valor = parseFloat(valorIngresso.value);
            valorParticipante.value = !isNaN(valor) ? (valor * 1.10).toFixed(2) : "0.00";
        });
    }

    // --- Controle do rádio "Por lote" ---
    ticketItem.querySelector(".radio-lote").addEventListener("change", () => {
        if (listaIngressos.length < 1) {
            alert("Para utilizar 'Por lote', é necessário criar mais de um ingresso.");
            ticketItem.querySelector('input[value="por-data"]').checked = true;
        }
    });

    // --- Botão Remover (X) ---
    ticketItem.querySelector(".remove-ticket").addEventListener("click", () => {
        ticketItem.remove();
        ingressoEditandoIndex = null;
        // Esconde o card só se não houver ingressos salvos
        if (listaIngressos.length === 0) {
            ticketConfigCard.style.display = "none";
        }
    });

    // --- Botão Salvar ingresso ---
    ticketItem.querySelector(".btnSalvarIngresso").addEventListener("click", () => {
        const titulo = ticketItem.querySelector(".titulo-ingresso").value.trim();

        if (!titulo) {
            alert("Informe o título do ingresso.");
            return;
        }

        let valor = "Gratuito";
        if (tipo === "pago") {
            const valorCampo = ticketItem.querySelector(".valor-ingresso")?.value;
            valor = valorCampo && valorCampo !== "" ? parseFloat(valorCampo).toFixed(2) : "0.00";
        }

        const ingresso = { titulo, valor, tipo };

        if (ingressoEditandoIndex !== null) {
            // Atualiza ingresso em edição
            listaIngressos[ingressoEditandoIndex] = ingresso;
            ingressoEditandoIndex = null;
        } else {
            // Adiciona novo ingresso
            listaIngressos.push(ingresso);
        }

        renderizarIngressos();

        // Remove o formulário após salvar, mas mantém o card com a lista
        ticketItem.remove();
    });

    // Insere o formulário antes da lista de ingressos salvos
    ticketConfigCard.insertBefore(ticketItem, listaContainer);
}

// ====================================================
// RENDERIZAR LISTA DE INGRESSOS SALVOS
// ====================================================

function renderizarIngressos() {
    listaContainer.innerHTML = "";

    if (listaIngressos.length === 0) {
        // Esconde card se não houver ingressos nem formulário aberto
        if (!ticketConfigCard.querySelector(".ticket-item")) {
            ticketConfigCard.style.display = "none";
        }
        return;
    }

    listaContainer.innerHTML = "<h3>Ingressos criados</h3>";

    listaIngressos.forEach((ingresso, index) => {
        const item = document.createElement("div");
        item.classList.add("ingresso-resumo");

        const valorDisplay = ingresso.tipo === "pago"
            ? `R$ ${ingresso.valor}`
            : "Gratuito";

        item.innerHTML = `
            <div>
                <strong>${ingresso.titulo}</strong>
                &nbsp;— ${valorDisplay}
            </div>
            <div>
                <button class="btn-editar" onclick="editarIngresso(${index})">Editar</button>
                <button class="btn-excluir" onclick="excluirIngresso(${index})">Excluir</button>
            </div>
        `;

        listaContainer.appendChild(item);
    });
}

// ====================================================
// EDITAR INGRESSO
// ====================================================

function editarIngresso(index) {
    ingressoEditandoIndex = index;
    const ingresso = listaIngressos[index];

    // Remove formulário aberto se houver
    const existente = ticketConfigCard.querySelector(".ticket-item");
    if (existente) existente.remove();

    ticketConfigCard.style.display = "flex";
    criarFormIngresso(ingresso.tipo);

    // Preenche os campos com os dados do ingresso
    const form = ticketConfigCard.querySelector(".ticket-item");
    form.querySelector(".titulo-ingresso").value = ingresso.titulo;

    if (ingresso.tipo === "pago") {
        const valorIngresso = form.querySelector(".valor-ingresso");
        const valorParticipante = form.querySelector(".valor-participante");
        valorIngresso.value = ingresso.valor;
        valorParticipante.value = (parseFloat(ingresso.valor) * 1.10).toFixed(2);
    }
}

// ====================================================
// EXCLUIR INGRESSO
// ====================================================

function excluirIngresso(index) {
    listaIngressos.splice(index, 1);
    renderizarIngressos();
}
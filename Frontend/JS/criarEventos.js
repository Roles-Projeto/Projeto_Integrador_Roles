// ====================================================
// VARIÁVEIS
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

    // Atualiza texto do botão
    if (index === steps.length - 1) {
        nextBtn.textContent = "Publicar Evento";
    } else {
        nextBtn.textContent = "Próximo";
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

    stepIndicator.textContent =
        `Etapa ${currentStep + 1} de ${total}`;
}


// ====================================================
// BOTÃO PRÓXIMO
// ====================================================

nextBtn.addEventListener("click", () => {

    // Se estiver na última etapa → abrir resumo
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

    const inputs =
        document.querySelectorAll("input, textarea, select");

    inputs.forEach(input => {

        if (input.type === "checkbox") {
            dados[input.id] = input.checked;
        } else {
            dados[input.id] = input.value;
        }

    });

    localStorage.setItem(
        "rascunhoEvento",
        JSON.stringify(dados)
    );

    console.log("Rascunho salvo automaticamente");

}

setInterval(salvarRascunho, 5000);


// ====================================================
// CARREGAR RASCUNHO
// ====================================================

function carregarRascunho() {

    const dados =
        JSON.parse(localStorage.getItem("rascunhoEvento"));

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

function mostrarResumo() {

    const nome =
        document.getElementById("event-name")?.value || "-";

    const produtor =
        document.getElementById("producer-name")?.value || "-";

    const dataInicio =
        document.getElementById("start-date")?.value || "-";

    const horaInicio =
        document.getElementById("start-time")?.value || "-";

    const dataFim =
        document.getElementById("end-date")?.value || "-";

    const horaFim =
        document.getElementById("end-time")?.value || "-";



    // =========================
    // LOCAL
    // =========================

    const nomeLocal =
        document.getElementById("local-nome")?.value || "";

    const rua =
        document.getElementById("rua")?.value || "";

    const cidade =
        document.getElementById("cidade")?.value || "";

    const estado =
        document.getElementById("estado")?.value || "";

    let local = "-";

    if (nomeLocal || rua || cidade) {

        local = `
        ${nomeLocal}<br>
        ${rua}<br>
        ${cidade} - ${estado}
        `;

    }



    // =========================
    // DESCRIÇÃO
    // =========================

    let descricao = "-";

    const descricaoTextarea =
        document.getElementById("descricao");

    if (descricaoTextarea) {

        descricao =
            descricaoTextarea.value || "-";

    }



    // =========================
    // INGRESSOS
    // =========================

    const ingressos =
        document.querySelectorAll(".ticket-item");

    let tipoIngresso =
        "Nenhum ingresso criado";

    if (ingressos.length > 0) {

        tipoIngresso = "<ul>";

        ingressos.forEach(ingresso => {

            tipoIngresso += `
            <li>
            ${ingresso.innerText}
            </li>
            `;

        });

        tipoIngresso += "</ul>";

    }



    // =========================
    // RESUMO FINAL
    // =========================

    resumoEvento.innerHTML = `

        <h3>Resumo do Evento</h3>

        <p>
        <strong>Evento:</strong>
        ${nome}
        </p>

        <p>
        <strong>Descrição:</strong>
        ${descricao}
        </p>

        <p>
        <strong>Local:</strong>
        ${local}
        </p>

        <p>
        <strong>Data início:</strong>
        ${dataInicio} às ${horaInicio}
        </p>

        <p>
        <strong>Data término:</strong>
        ${dataFim} às ${horaFim}
        </p>

        <p>
        <strong>Produtor:</strong>
        ${produtor}
        </p>

        <p>
        <strong>Ingressos:</strong>
        ${tipoIngresso}
        </p>

    `;

    modal.style.display = "flex";

}

// ====================================================
// CANCELAR PUBLICAÇÃO
// ====================================================

cancelarBtn.addEventListener("click", () => {

    modal.style.display = "none";

});


// ====================================================
// CONFIRMAR PUBLICAÇÃO
// ====================================================

confirmarBtn.addEventListener("click", () => {

    alert("Evento publicado com sucesso!");

    localStorage.removeItem("rascunhoEvento");

    modal.style.display = "none";

});


// ====================================================
// INICIALIZAÇÃO
// ====================================================

showStep(currentStep);

const categoriasPorAssunto = {

"Festa e Balada": [
"Aniversário",
"Formatura",
"Open Bar",
"Festa Universitária",
"Baile",
"After",
"Happy Hour"
],

"Shows e Música": [
"Sertanejo",
"Funk",
"Pagode",
"Rock",
"Eletrônica",
"Rap / Trap",
"DJ"
],

"Gastronomia": [
"Festival gastronômico",
"Rodízio",
"Degustação",
"Churrasco",
"Food Truck"
],

"Esportes": [
"Futebol",
"Corrida",
"Treino funcional",
"Campeonato",
"Torneio"
],

"Cultura e Arte": [
"Teatro",
"Cinema",
"Exposição",
"Stand-up",
"Dança"
],

"Cursos e Workshops": [
"Curso",
"Workshop",
"Palestra",
"Oficina",
"Mentoria"
]

};

const assuntoSelect =
document.getElementById("assunto");

const categoriaSelect =
document.getElementById("categoria");

assuntoSelect.addEventListener("change", () => {

const assunto = assuntoSelect.value;

categoriaSelect.innerHTML =
'<option value="">Selecione uma categoria</option>';

if (categoriasPorAssunto[assunto]) {

categoriasPorAssunto[assunto].forEach(categoria => {

const option =
document.createElement("option");

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

// Criar input invisível
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/jpeg, image/png, image/gif";
fileInput.style.display = "none";

document.body.appendChild(fileInput);


// Clique no box → abrir seletor
dropZone.addEventListener("click", () => {
    fileInput.click();
});


// Seleção manual
fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    processarImagem(file);
});


// Arrastar imagem
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


// ====================================================
// PROCESSAR IMAGEM
// ====================================================

function processarImagem(file) {

    if (!file) return;

    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/gif"
    ];

    // Verificar tipo
    if (!tiposPermitidos.includes(file.type)) {
        alert("Formato inválido. Use JPEG, PNG ou GIF.");
        return;
    }

    // Verificar tamanho
    const tamanhoMaximo = 2 * 1024 * 1024;

    if (file.size > tamanhoMaximo) {
        alert("Imagem muito grande. Máximo 2MB.");
        return;
    }

    imagemEvento = file;

    mostrarPreview(file);

}


// ====================================================
// MOSTRAR PREVIEW
// ====================================================

function mostrarPreview(file) {

    const reader = new FileReader();

    reader.onload = function (e) {

        dropZone.innerHTML = `

            <img src="${e.target.result}"
                 style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
                 ">

        `;

    };

    reader.readAsDataURL(file);

}

// ====================================================
// BUSCAR CEP AUTOMATICAMENTE
// ====================================================

const cepInput = document.getElementById("cep");
const ruaInput = document.getElementById("rua");
const cidadeInput = document.getElementById("cidade");
const estadoInput = document.getElementById("estado");


// ====================================================
// MÁSCARA DO CEP
// ====================================================

cepInput.addEventListener("input", () => {

    let valor = cepInput.value.replace(/\D/g, "");

    if (valor.length > 5) {
        valor = valor.slice(0, 5) + "-" + valor.slice(5, 8);
    }

    cepInput.value = valor;

});


// ====================================================
// BUSCAR CEP
// ====================================================

cepInput.addEventListener("blur", async () => {

    const cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
        return;
    }

    try {

        const response = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        const data = await response.json();

        if (data.erro) {

            alert("CEP não encontrado");

            limparEndereco();

            return;

        }

        preencherEndereco(data);

    }

    catch (error) {

        alert("Erro ao buscar CEP");

        console.error(error);

    }

});


// ====================================================
// PREENCHER ENDEREÇO
// ====================================================

function preencherEndereco(data) {

    ruaInput.value = data.logradouro || "";

    cidadeInput.value = data.localidade || "";

    estadoInput.value = data.uf || "";

}


// ====================================================
// LIMPAR CAMPOS
// ====================================================

function limparEndereco() {

    ruaInput.value = "";
    cidadeInput.value = "";
    estadoInput.value = "";

}
const ticketButtons = document.querySelectorAll(".btn-ticket-action");
const ticketConfigCard = document.querySelector(".ticket-config-card");

// Só permite um ingresso de cada tipo
let ingressoSelecionado = null;

ticketButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const tipo = btn.dataset.tipo;

        // Se já houver um ingresso selecionado, remove
        if (ingressoSelecionado) {
            ingressoSelecionado.remove();
        }

        if (tipo === "pago") {
            criarIngressoPago();
        } else if (tipo === "gratuito") {
            // Aqui deixamos vazio por enquanto
            // Depois adicionaremos criarIngressoGratuito()
        }
    });
});

function criarIngressoPago() {

    const ticketItem = document.createElement("div");
    ticketItem.classList.add("ticket-item");

    ticketItem.innerHTML = `

        <h4>Criar ingresso pago</h4>

        <p>
        A taxa de serviço é repassada ao comprador,
        sendo exibida junto com o valor do ingresso
        </p>

        <h5>Sobre o ingresso</h5>

        <label>Título do ingresso</label>

        <input type="text"
        maxlength="45"
        placeholder="Ingresso único, Meia-Entrada, VIP, etc.">

        <label>Quantidade</label>

        <input type="number"
        placeholder="Ex. 100"
        min="1">

        <label>Valor a receber (R$)</label>

        <input type="number"
        step="0.01"
        placeholder="0,00"
        class="valor-ingresso">

        <label>Valor do participante (R$)</label>

        <input type="number"
        step="0.01"
        value="0.00"
        class="valor-participante"
        readonly>

        <label>
            <input type="checkbox">
            Criar meia-entrada para este ingresso
        </label>

        <a href="#">
        Saiba mais sobre as políticas de meia-entrada
        </a>

        <h5>Quando o ingresso será vendido</h5>

        <div class="radio-group">

            <label>
                <input type="radio"
                name="venda"
                value="por-data"
                checked>
                Por data
            </label>

            <label>
                <input type="radio"
                name="venda"
                value="por-lote"
                class="radio-lote">
                Por lote
            </label>

        </div>

        <label>Data de Início das Vendas *</label>

        <input type="date">
        <input type="time">

        <label>Data de Término das Vendas *</label>

        <input type="date">
        <input type="time">

        <label>Quem pode comprar</label>

        <select>

            <option>
            Para todo o público
            </option>

            <option>
            Restrito a convidados
            </option>

            <option>
            Adicionar manualmente
            </option>

        </select>

        <label>
        Quantidade permitida por compra
        </label>

        <input type="number"
        placeholder="Mínima"
        min="1">

        <input type="number"
        placeholder="Máxima"
        min="1">

        <label>
        Descrição do ingresso (opcional)
        </label>

        <textarea maxlength="100"
        placeholder="Informações adicionais ao nome do ingresso.">
        </textarea>

        <button class="remove-ticket">
        X
        </button>

    `;

    // =========================
    // CALCULAR 10%
    // =========================

    const valorIngresso =
    document.getElementById("valor-ingresso");

const valorParticipante =
    document.getElementById("valor-participante");

valorIngresso.addEventListener("input", () => {

    const valor =
        parseFloat(valorIngresso.value);

    if (!isNaN(valor)) {

        const taxa =
            valor * 0.10;

        const total =
            valor + taxa;

        valorParticipante.value =
            total.toFixed(2);

    } else {

        valorParticipante.value =
            "0.00";

    }

});

    // =========================
    // CONTROLE DO LOTE
    // =========================

    const radioLote =
        ticketItem.querySelector(".radio-lote");

    radioLote.addEventListener("change", () => {

        const totalIngressos =
            document.querySelectorAll(".ticket-item").length;

        if (totalIngressos < 2) {

            alert(
                "Para utilizar 'Por lote', é necessário criar mais de um ingresso."
            );

            ticketItem.querySelector(
                'input[value="por-data"]'
            ).checked = true;

        }

    });

    // =========================
    // REMOVER INGRESSO
    // =========================

    const removeBtn =
        ticketItem.querySelector(".remove-ticket");

    removeBtn.addEventListener("click", () => {

        ticketItem.remove();

        verificarBotaoCriarEvento();

    });

    // adiciona ingresso

    ticketConfigCard.appendChild(ticketItem);

    verificarBotaoCriarEvento();

}

function verificarBotaoCriarEvento() {

    let botao =
        document.getElementById("btnCriarEvento");

    const totalIngressos =
        document.querySelectorAll(".ticket-item").length;

    if (totalIngressos > 0) {

        if (!botao) {

            botao =
                document.createElement("button");

            botao.id = "btnCriarEvento";

            botao.className =
                "btn-success";

            botao.textContent =
                "Criar Evento";

            botao.addEventListener("click", () => {

                alert(
                    "Evento criado com sucesso!"
                );

            });

            document
                .querySelector(".ticket-config-card")
                .appendChild(botao);

        }

    } else {

        if (botao) {

            botao.remove();

        }

    }

}

const listaIngressos = [];

const btnSalvar =
    document.getElementById("btnSalvarIngresso");

const listaContainer =
    document.querySelector(".lista-ingressos");

btnSalvar.addEventListener("click", () => {

    const titulo =
        document.getElementById("titulo-ingresso").value;

    const valor =
        document.getElementById("valor-ingresso").value;

    if (!titulo) {

        alert("Informe o título do ingresso.");
        return;

    }

    const ingresso = {

        titulo,
        valor

    };

    listaIngressos.push(ingresso);

    renderizarIngressos();

});
function renderizarIngressos() {

    listaContainer.innerHTML =
        "<h3>Ingressos criados</h3>";

    listaIngressos.forEach(
        (ingresso, index) => {

            const item =
                document.createElement("div");

            item.classList.add("ingresso-resumo");

            item.innerHTML = `

                <strong>
                    ${ingresso.titulo}
                </strong>

                - R$ ${ingresso.valor}

                <button onclick="editarIngresso(${index})">
                    Editar
                </button>

                <button onclick="excluirIngresso(${index})">
                    Excluir
                </button>

            `;

            listaContainer.appendChild(item);

        }

    );

}

function excluirIngresso(index) {

    listaIngressos.splice(
        index,
        1
    );

    renderizarIngressos();

}

const ticketCard =
    document.querySelector(".ticket-config-card");

const botoesIngresso =
    document.querySelectorAll(".btn-ticket-action");

botoesIngresso.forEach(botao => {

    botao.addEventListener("click", () => {

        const tipo =
            botao.dataset.tipo;

        ticketCard.style.display =
            "block";

        if (tipo === "pago") {

            console.log("Ingresso pago");

        }

        if (tipo === "gratuito") {

            console.log("Ingresso gratuito");

        }

    });

});


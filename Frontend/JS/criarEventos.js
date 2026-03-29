// ====================================================
// 1. VARIÁVEIS GLOBAIS E ELEMENTOS
// ====================================================
const steps = document.querySelectorAll(".step");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressBar = document.getElementById("progress-bar");
const stepIndicator = document.getElementById("step-indicator");

// MODAL E RESUMO
const modal = document.getElementById("modalConfirmacao");
const resumoEvento = document.getElementById("resumoEvento");
const cancelarBtn = document.getElementById("cancelarPublicacao");
const confirmarBtn = document.getElementById("confirmarPublicacao");

// FORMULÁRIOS DE INGRESSOS
const listaIngressos = document.querySelector(".lista-ingressos");
const formPago = document.getElementById("form-ingresso-pago");
const formGratuito = document.getElementById("form-ingresso-gratuito");
const btnSalvarIngresso = document.getElementById("btnSalvarIngresso");
const btnSalvarGratuito = document.getElementById("btnSalvarGratuito");

// ESTADO DA APLICAÇÃO
let currentStep = 0;
let ingressos = [];
let indexEditando = null;
let imagemEvento = null;

const categoriasPorAssunto = {
    "Festa e Balada": ["Aniversário", "Formatura", "Open Bar", "Festa Universitária", "Baile", "After", "Happy Hour"],
    "Shows e Música": ["Sertanejo", "Funk", "Pagode", "Rock", "Eletrônica", "Rap / Trap", "DJ"],
    "Gastronomia": ["Festival gastronômico", "Rodízio", "Degustação", "Churrasco", "Food Truck"],
    "Esportes": ["Futebol", "Corrida", "Treino funcional", "Campeonato", "Torneio"],
    "Cultura e Arte": ["Teatro", "Cinema", "Exposição", "Stand-up", "Dança"],
    "Cursos e Workshops": ["Curso", "Workshop", "Palestra", "Oficina", "Mentoria"]
};

// ====================================================
// 2. NAVEGAÇÃO ENTRE ETAPAS (STEPS)
// ====================================================
function showStep(index) {
    steps.forEach((step, i) => {
        step.style.display = i === index ? "block" : "none";
    });

    if (prevBtn) prevBtn.style.display = index === 0 ? "none" : "inline-block";

    if (index === steps.length - 1) {
        nextBtn.textContent = "Publicar Evento";
    } else {
        nextBtn.textContent = "Próximo";
    }

    atualizarProgresso();
}

function atualizarProgresso() {
    const total = steps.length;
    const progresso = ((currentStep + 1) / total) * 100;
    if (progressBar) progressBar.style.width = progresso + "%";
    if (stepIndicator) stepIndicator.textContent = `Etapa ${currentStep + 1} de ${total}`;
}

nextBtn?.addEventListener("click", () => {
    if (currentStep === steps.length - 1) {
        mostrarResumo();
        return;
    }
    currentStep++;
    showStep(currentStep);
});

prevBtn?.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
});

// ====================================================
// 3. GESTÃO DE INGRESSOS (CORRIGIDO)
// ====================================================
function criarObjetoIngresso(tipo) {
    const sufixo = tipo === "Pago" ? "-ingresso" : "-gratuito";
    const titulo = document.getElementById(`titulo${sufixo}`).value;
    const quantidade = document.getElementById(`quantidade${sufixo}`).value;
    
    if (!titulo || !quantidade) {
        alert("Preencha os campos obrigatórios (Título e Quantidade)");
        return null;
    }

    const prefixoData = tipo === "Pago" ? "" : "-gratuito";

    return {
        tipo: tipo,
        titulo: titulo,
        quantidade: quantidade,
        valor: tipo === "Pago" ? document.getElementById(`valor${sufixo}`).value : "Grátis",
        dataInicio: document.getElementById(`data-inicio${prefixoData}`)?.value || "",
        horaInicio: document.getElementById(`hora-inicio${prefixoData}`)?.value || "",
        dataFim: document.getElementById(`data-fim${prefixoData}`)?.value || "",
        horaFim: document.getElementById(`hora-fim${prefixoData}`)?.value || "",
        minCompra: document.getElementById(`min-compra${prefixoData}`)?.value || "1",
        maxCompra: document.getElementById(`max-compra${prefixoData}`)?.value || "10",
        descricao: document.getElementById(`descricao${sufixo}`)?.value || ""
    };
}

function salvarIngresso(tipo) {
    const ingresso = criarObjetoIngresso(tipo);
    if (!ingresso) return;

    if (indexEditando !== null) {
        ingressos[indexEditando] = ingresso;
        indexEditando = null;
    } else {
        ingressos.push(ingresso);
    }

    renderizarIngressos();
    tipo === "Pago" ? limparFormularioPago() : limparFormularioGratuito();
    formPago.style.display = "none";
    formGratuito.style.display = "none";
}

btnSalvarIngresso?.addEventListener("click", () => salvarIngresso("Pago"));
btnSalvarGratuito?.addEventListener("click", () => salvarIngresso("Gratuito"));

function renderizarIngressos() {
    if (!listaIngressos) return;
    listaIngressos.innerHTML = "<h3>Ingressos criados</h3>";

    if (ingressos.length === 0) {
        listaIngressos.innerHTML += "<p style='color:#999;'>Nenhum ingresso criado ainda.</p>";
        return;
    }

    ingressos.forEach((ing, index) => {
        const div = document.createElement("div");
        div.classList.add("ingresso-card");
        div.innerHTML = `
            <button type="button" class="btn-excluir-ing" onclick="excluirIngresso(${index})">×</button>
            <strong>${ing.titulo}</strong>
            <p>Tipo: ${ing.tipo} | Qtd: ${ing.quantidade}</p>
            <p>Valor: ${ing.tipo === 'Pago' ? 'R$ ' + parseFloat(ing.valor).toFixed(2) : 'Grátis'}</p>
            <button type="button" class="btn-editar-ing" onclick="editarIngresso(${index})">Editar Dados</button>
        `;
        listaIngressos.appendChild(div);
    });
}

window.editarIngresso = (index) => {
    const ing = ingressos[index];
    indexEditando = index;
    if (ing.tipo === "Pago") {
        formPago.style.display = "block";
        formGratuito.style.display = "none";
        document.getElementById("titulo-ingresso").value = ing.titulo;
        document.getElementById("quantidade-ingresso").value = ing.quantidade;
        document.getElementById("valor-ingresso").value = ing.valor;
        // Atualiza taxa ao carregar para editar
        document.getElementById("valor-ingresso").dispatchEvent(new Event('input'));
    } else {
        formGratuito.style.display = "block";
        formPago.style.display = "none";
        document.getElementById("titulo-gratuito").value = ing.titulo;
        document.getElementById("quantidade-gratuito").value = ing.quantidade;
    }
};

window.excluirIngresso = (index) => {
    if (confirm("Deseja excluir este ingresso?")) {
        ingressos.splice(index, 1);
        renderizarIngressos();
    }
};

// ====================================================
// 4. CEP E ENDEREÇO (REVISADO)
// ====================================================
function configurarCEP() {
    const cepInput = document.getElementById("cep");
    if (!cepInput) return;

    cepInput.addEventListener("blur", async () => {
        const cep = cepInput.value.replace(/\D/g, "");
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                if (document.getElementById("rua")) document.getElementById("rua").value = data.logradouro || "";
                if (document.getElementById("cidade")) document.getElementById("cidade").value = data.localidade || "";
                if (document.getElementById("estado")) document.getElementById("estado").value = data.uf || "";
            } else {
                alert("CEP não encontrado.");
            }
        } catch (e) { console.error("Erro CEP:", e); }
    });
}

// ====================================================
// 5. CÁLCULO DE TAXAS
// ====================================================
function configurarCalculoDeTaxa() {
    const valorInput = document.getElementById("valor-ingresso");
    const checkboxAbsorver = document.getElementById("absorver-taxa");
    const displayParticipante = document.getElementById("valor-participante");

    if (!valorInput || !displayParticipante) return;

    const calcular = () => {
        let valorDigitado = parseFloat(valorInput.value);
        if (isNaN(valorDigitado) || valorDigitado <= 0) {
            displayParticipante.value = "0.00";
            return;
        }
        const taxaPercentual = 0.10;
        const absorver = checkboxAbsorver ? checkboxAbsorver.checked : false;
        let total = absorver ? valorDigitado : valorDigitado * (1 + taxaPercentual);
        displayParticipante.value = total.toFixed(2);
    };

    valorInput.addEventListener("input", calcular);
    if (checkboxAbsorver) checkboxAbsorver.addEventListener("change", calcular);
}

// ====================================================
// 6. RESUMO E FINALIZAÇÃO
// ====================================================
function mostrarResumo() {
    const nome = document.getElementById("event-name")?.value || "-";
    const descricao = document.getElementById("descricao")?.value || "-";
    const local = `${document.getElementById("local-nome")?.value || ""}<br>${document.getElementById("rua")?.value || ""} - ${document.getElementById("cidade")?.value || ""}`;
    
    let htmlIngressos = ingressos.length > 0 ? "<ul>" : "Nenhum ingresso criado";
    if (ingressos.length > 0) {
        ingressos.forEach(ing => {
            htmlIngressos += `<li>${ing.titulo} — ${ing.tipo === 'Pago' ? 'R$ ' + ing.valor : 'Grátis'} (Qtd: ${ing.quantidade})</li>`;
        });
        htmlIngressos += "</ul>";
    }

    resumoEvento.innerHTML = `
        <h3>Resumo do Evento</h3>
        <p><strong>Evento:</strong> ${nome}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <p><strong>Local:</strong> ${local}</p>
        <p><strong>Ingressos:</strong> ${htmlIngressos}</p>
    `;
    modal.style.display = "flex";
}

cancelarBtn?.addEventListener("click", () => modal.style.display = "none");
confirmarBtn?.addEventListener("click", () => {
    alert("Evento publicado com sucesso!");
    localStorage.removeItem("rascunhoEvento");
    location.reload(); 
});

// ====================================================
// 7. AUTOSAVE E UPLOAD
// ====================================================
function salvarRascunho() {
    const dados = {};
    document.querySelectorAll("input, textarea, select").forEach(input => {
        if (input.id) dados[input.id] = input.type === "checkbox" ? input.checked : input.value;
    });
    localStorage.setItem("rascunhoEvento", JSON.stringify(dados));
}

function carregarRascunho() {
    const dados = JSON.parse(localStorage.getItem("rascunhoEvento"));
    if (!dados) return;
    Object.keys(dados).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            if (input.type === "checkbox") input.checked = dados[id];
            else input.value = dados[id];
        }
    });
}

const dropZone = document.getElementById("drop-zone");
if (dropZone) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && file.size < 2 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                dropZone.innerHTML = `<img src="${ev.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        } else { alert("Máximo 2MB"); }
    });
}

// ====================================================
// 8. INICIALIZAÇÃO ÚNICA
// ====================================================
window.addEventListener("load", () => {
    carregarRascunho();
    showStep(currentStep);
    configurarCEP();
    configurarCalculoDeTaxa();
    renderizarIngressos(); // Garante que ingressos do rascunho (se houver) apareçam
    setInterval(salvarRascunho, 5000);
});

// CATEGORIAS DINÂMICAS
const assuntoSelect = document.getElementById("assunto");
const categoriaSelect = document.getElementById("categoria");

assuntoSelect?.addEventListener("change", () => {
    const assunto = assuntoSelect.value;
    categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    if (categoriasPorAssunto[assunto]) {
        categoriasPorAssunto[assunto].forEach(cat => {
            const opt = document.createElement("option");
            opt.textContent = cat; opt.value = cat;
            categoriaSelect.appendChild(opt);
        });
    }
});

// TOGGLE FORMULÁRIOS
document.querySelectorAll(".btn-ticket-action").forEach(btn => {
    btn.addEventListener("click", () => {
        const tipo = btn.dataset.tipo;
        formPago.style.display = tipo === "pago" ? "block" : "none";
        formGratuito.style.display = tipo === "gratuito" ? "block" : "none";
        indexEditando = null; // Reseta edição ao abrir novo formulário
    });
});

document.getElementById("btnFecharFormulario")?.addEventListener("click", () => formPago.style.display = "none");
document.getElementById("btnFecharGratis")?.addEventListener("click", () => formGratuito.style.display = "none");

function limparFormularioPago() {
    ["titulo-ingresso", "quantidade-ingresso", "valor-ingresso", "valor-participante", "descricao-ingresso"].forEach(id => {
        const el = document.getElementById(id); if(el) el.value = "";
    });
}

function limparFormularioGratuito() {
    ["titulo-gratuito", "quantidade-gratuito", "descricao-gratuito"].forEach(id => {
        const el = document.getElementById(id); if(el) el.value = "";
    });
}
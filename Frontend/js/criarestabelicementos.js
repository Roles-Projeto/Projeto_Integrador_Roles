"use strict";

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
const resumoEstabelecimento = document.getElementById("resumoEstabelecimento");
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
        nextBtn.textContent = "Publicar Estabelecimento";
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
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ====================================================
// BOTÃO VOLTAR
// ====================================================

prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

// ====================================================
// AUTOSAVE (RASCUNHO)
// ====================================================

function salvarRascunho() {
    const dados = {};
    const inputs = document.querySelectorAll("input:not([type='file']), textarea, select");
    inputs.forEach(input => {
        if (!input.id) return;
        if (input.type === "checkbox" || input.type === "radio") {
            dados[input.id] = input.checked;
        } else {
            dados[input.id] = input.value;
        }
    });
    localStorage.setItem("rascunhoEstabelecimento", JSON.stringify(dados));
}

setInterval(salvarRascunho, 5000);

// ====================================================
// CARREGAR RASCUNHO
// ====================================================

function carregarRascunho() {
    const dados = JSON.parse(localStorage.getItem("rascunhoEstabelecimento"));
    if (!dados) return;
    Object.keys(dados).forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        if (input.type === "checkbox" || input.type === "radio") {
            input.checked = dados[id];
        } else {
            input.value = dados[id];
        }
    });
}

window.addEventListener("load", carregarRascunho);

// ====================================================
// MOSTRAR RESUMO NO MODAL
// ====================================================

const stepNavigation = document.querySelector(".step-navigation");

function mostrarResumo() {
    stepNavigation.style.display = "none";

    const nome = document.getElementById("estab-name")?.value || "-";
    const tipo = document.getElementById("tipo")?.value || "-";
    const especialidade = document.getElementById("especialidade")?.value || "-";
    const faixaPreco = document.getElementById("faixa-preco")?.value || "-";
    const responsavel = document.getElementById("owner-name")?.value || "-";
    const descricao = document.getElementById("descricao")?.value || "-";

    const localNome = document.getElementById("local-nome")?.value || "";
    const rua = document.getElementById("rua")?.value || "";
    const numero = document.getElementById("numero")?.value || "";
    const cidade = document.getElementById("cidade")?.value || "";
    const estado = document.getElementById("estado")?.value || "";
    const telefone = document.getElementById("telefone")?.value || "";
    const bairro = document.getElementById("bairro")?.value || "";

    let local = "-";
    if (rua || localNome || cidade) {
        local = `${localNome}<br>${rua}${numero ? ", " + numero : ""}<br>${cidade}${estado ? " - " + estado : ""}`;
    }

    let horariosHTML = "<ul>";
    document.querySelectorAll(".horario-dia-row").forEach(row => {
        const dia = row.dataset.dia;
        const check = row.querySelector(".dia-check");
        const aberto = check?.checked;
        const abertura = row.querySelector(".hora-abertura")?.value || "";
        const fechamento = row.querySelector(".hora-fechamento")?.value || "";
        if (aberto && abertura && fechamento) {
            horariosHTML += `<li>${dia}: ${abertura} – ${fechamento}</li>`;
        } else if (!aberto) {
            horariosHTML += `<li>${dia}: Fechado</li>`;
        }
    });
    horariosHTML += "</ul>";

    let pratosHTML = "Nenhum prato cadastrado";
    if (listaPratos.length > 0) {
        pratosHTML = "<ul>";
        listaPratos.forEach(prato => {
            const valorDisplay = prato.preco ? `R$ ${prato.preco}` : "Sem preço";
            const badge = prato.tipo === "destaque" ? "⭐ Destaque" : "🏷️ Promoção";
            pratosHTML += `<li>${badge} — <strong>${prato.titulo}</strong> (${prato.categoria}) — ${valorDisplay}</li>`;
        });
        pratosHTML += "</ul>";
    }

    const features = [];
    document.querySelectorAll(".feature-check input:checked").forEach(feat => {
        const label = feat.closest("label");
        if (label) features.push(label.innerText.trim());
    });
    const comodidades = features.length > 0 ? features.join(", ") : "Nenhuma selecionada";

    resumoEstabelecimento.innerHTML = `
        <h3>Dados Gerais</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Tipo:</strong> ${tipo}</p>
        <p><strong>Especialidade:</strong> ${especialidade !== "" ? especialidade : "-"}</p>
        <p><strong>Faixa de preço:</strong> ${faixaPreco}</p>
        <p><strong>Responsável:</strong> ${responsavel}</p>

        <h3>Localização</h3>
        <p>${local}</p>
        ${telefone ? `<p><strong>Telefone:</strong> ${telefone}</p>` : ""}

        <h3>Horários</h3>
        ${horariosHTML}

        <h3>Descrição</h3>
        <p>${descricao.length > 200 ? descricao.substring(0, 200) + "..." : descricao}</p>

        <h3>Comodidades</h3>
        <p>${comodidades}</p>

        <h3>Pratos em Destaque</h3>
        ${pratosHTML}
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
// CONFIRMAR PUBLICAÇÃO — SALVA NO "BANCO" (localStorage)
// ====================================================

confirmarBtn.addEventListener("click", () => {
    // Coleta todos os dados do formulário
    const nome         = document.getElementById("estab-name")?.value?.trim() || "";
    const tipo         = document.getElementById("tipo")?.value || "";
    const especialidade= document.getElementById("especialidade")?.value || "";
    const faixaPreco   = document.getElementById("faixa-preco")?.value || "";
    const capacidade   = document.getElementById("capacidade")?.value || "";
    const descricao    = document.getElementById("descricao")?.value || "";
    const localNome    = document.getElementById("local-nome")?.value || "";
    const cep          = document.getElementById("cep")?.value || "";
    const rua          = document.getElementById("rua")?.value || "";
    const numero       = document.getElementById("numero")?.value || "";
    const complemento  = document.getElementById("complemento")?.value || "";
    const bairro       = document.getElementById("bairro")?.value || "";
    const cidade       = document.getElementById("cidade")?.value || "";
    const estado       = document.getElementById("estado")?.value || "";
    const telefone     = document.getElementById("telefone")?.value || "";
    const website      = document.getElementById("website")?.value || "";
    const responsavel  = document.getElementById("owner-name")?.value || "";
    const cnpj         = document.getElementById("cnpj")?.value || "";
    const visibilidade = document.querySelector('input[name="visibilidade"]:checked')?.value || "publico";

    // Horários
    const horarios = [];
    document.querySelectorAll(".horario-dia-row").forEach(row => {
        const dia       = row.dataset.dia;
        const check     = row.querySelector(".dia-check");
        const abertura  = row.querySelector(".hora-abertura")?.value || "";
        const fechamento= row.querySelector(".hora-fechamento")?.value || "";
        horarios.push({
            dia,
            aberto: check?.checked || false,
            abertura,
            fechamento
        });
    });

    // Comodidades
    const comodidades = [];
    document.querySelectorAll(".feature-check input:checked").forEach(feat => {
        const label = feat.closest("label");
        if (label) comodidades.push(label.innerText.trim());
    });

    // Imagens (base64 guardadas no preview)
    const imgLogo = document.querySelector("#drop-zone-logo img")?.src || "";
    const imgCapa = document.querySelector("#drop-zone-capa img")?.src || "";

    // Mapeia faixa de preço para símbolo $
    const mapaPreco = {
        "economico": "$",
        "moderado": "$$",
        "sofisticado": "$$$",
        "luxo": "$$$$"
    };

    // Monta objeto do estabelecimento
    const estabelecimento = {
        id          : Date.now(),                          // ID único
        nome,
        tipo,
        especialidade,
        faixaPreco,
        faixaPrecoSimbolo: mapaPreco[faixaPreco] || "$",
        capacidade,
        descricao,
        localNome,
        cep, rua, numero, complemento,
        bairro, cidade, estado,
        endereco    : `${bairro ? bairro + ", " : ""}${cidade}${estado ? " - " + estado : ""}`,
        telefone,
        website,
        responsavel,
        cnpj,
        visibilidade,
        horarios,
        comodidades,
        pratos      : [...listaPratos],
        imgLogo,
        imgCapa,
        nota        : "Novo",                             // Sem avaliações ainda
        avaliacoes  : 0,
        criadoEm    : new Date().toISOString(),

        // Campo usado pelo filtro de categoria na página locais.js
        // Mapeia tipo do formulário → categoria do card
        categoriaCard: mapearCategoria(tipo)
    };

    // ---- Salva na "tabela" de estabelecimentos ----
    const CHAVE = "roles_estabelecimentos";
    let lista = [];
    try {
        lista = JSON.parse(localStorage.getItem(CHAVE)) || [];
    } catch (_) {
        lista = [];
    }
    lista.push(estabelecimento);
    localStorage.setItem(CHAVE, JSON.stringify(lista));

    // Limpa rascunho
    localStorage.removeItem("rascunhoEstabelecimento");
    modal.style.display = "none";
    stepNavigation.style.display = "flex";

    // Feedback e redireciona para locais
    alert(`✅ "${nome}" publicado com sucesso! Ele já aparece na página de Locais.`);
    window.location.href = "../locais/locais.html";
});

// ====================================================
// MAPEIA TIPO DO FORM → CATEGORIA DO CARD (locais.js)
// ====================================================

function mapearCategoria(tipo) {
    const mapa = {
        "Restaurante"             : "restaurantes",
        "Bar e Boteco"            : "bares",
        "Café e Cafeteria"        : "bares",
        "Lanchonete e Fast Food"  : "restaurantes",
        "Pizzaria"                : "restaurantes",
        "Churrascaria"            : "restaurantes",
        "Doceria e Confeitaria"   : "restaurantes",
        "Padaria"                 : "restaurantes",
        "Sorveteria"              : "restaurantes",
        "Sushi e Japonês"         : "restaurantes",
        "Food Truck"              : "restaurantes",
        "Bistrô"                  : "restaurantes",
        "Pub"                     : "bares",
        "Enoteca"                 : "bares",
        "Hamburgueria"            : "restaurantes",
    };
    return mapa[tipo] || "restaurantes";
}

// ====================================================
// INICIALIZAÇÃO
// ====================================================

showStep(currentStep);

// ====================================================
// ESPECIALIDADES POR TIPO
// ====================================================

const especialidadesPorTipo = {
    "Restaurante": ["Brasileiro", "Italiano", "Árabe", "Japonês", "Chinês", "Mexicano", "Francês", "Vegetariano/Vegano", "Frutos do mar", "Fusion"],
    "Bar e Boteco": ["Petiscos", "Cervejas especiais", "Drinks e coquetéis", "Bar temático", "Esportivo"],
    "Café e Cafeteria": ["Café especial", "Brunch", "Torradas e pães", "Bolos e doces", "Vegano"],
    "Lanchonete e Fast Food": ["Hambúrguer", "Hot dog", "Batata frita", "Tacos", "Wraps"],
    "Pizzaria": ["Tradicional", "Gourmet", "Sem glúten", "Por metro", "Pizza no forno a lenha"],
    "Churrascaria": ["Rodízio", "À la carte", "Assado na brasa", "Costela"],
    "Doceria e Confeitaria": ["Bolos personalizados", "Brigadeiros", "Tortas", "Macarons", "Chocolates"],
    "Padaria": ["Pão artesanal", "Café da manhã", "Salgados", "Doces"],
    "Sorveteria": ["Sorvete artesanal", "Açaí", "Frozen", "Sorvete vegano"],
    "Sushi e Japonês": ["Sushi", "Temaki", "Ramen", "Udon", "Teppanyaki"],
    "Food Truck": ["Hambúrguer", "Tacos", "Churrasco", "Vegano", "Comida de rua"],
    "Hamburgueria": ["Smash burger", "Artesanal", "Vegano", "Gourmet"],
};

const tipoSelect = document.getElementById("tipo");
const especialidadeSelect = document.getElementById("especialidade");

tipoSelect.addEventListener("change", () => {
    const tipo = tipoSelect.value;
    especialidadeSelect.innerHTML = '<option value="">Selecione uma especialidade</option>';
    if (especialidadesPorTipo[tipo]) {
        especialidadesPorTipo[tipo].forEach(esp => {
            const option = document.createElement("option");
            option.textContent = esp;
            especialidadeSelect.appendChild(option);
        });
    }
});

// ====================================================
// CONTADOR DE CARACTERES
// ====================================================

const estabNameInput = document.getElementById("estab-name");
const charsSpan = document.getElementById("chars");

if (estabNameInput && charsSpan) {
    estabNameInput.addEventListener("input", () => {
        charsSpan.textContent = 100 - estabNameInput.value.length;
    });
}

// ====================================================
// MÁSCARA TELEFONE
// ====================================================

const telefoneInput = document.getElementById("telefone");
if (telefoneInput) {
    telefoneInput.addEventListener("input", () => {
        let v = telefoneInput.value.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 6)      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
        else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
        else if (v.length > 0) v = `(${v}`;
        telefoneInput.value = v;
    });
}

// ====================================================
// MÁSCARA CNPJ
// ====================================================

const cnpjInput = document.getElementById("cnpj");
if (cnpjInput) {
    cnpjInput.addEventListener("input", () => {
        let v = cnpjInput.value.replace(/\D/g, "");
        if (v.length > 14) v = v.slice(0, 14);
        v = v.replace(/^(\d{2})(\d)/,         "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/,         ".$1/$2");
        v = v.replace(/(\d{4})(\d)/,           "$1-$2");
        cnpjInput.value = v;
    });
}

// ====================================================
// HORÁRIO — TOGGLE DIA
// ====================================================

document.querySelectorAll(".dia-check").forEach(check => {
    check.addEventListener("change", () => {
        const row = check.closest(".horario-dia-row");
        const inputsDiv = row.querySelector(".horario-inputs");

        if (check.checked) {
            inputsDiv.classList.remove("horario-fechado");
            inputsDiv.innerHTML = `
                <div class="icon-input">
                    <i class="fa-regular fa-clock"></i>
                    <input type="time" class="hora-abertura" value="08:00">
                </div>
                <span class="separador-horario">até</span>
                <div class="icon-input">
                    <i class="fa-regular fa-clock"></i>
                    <input type="time" class="hora-fechamento" value="22:00">
                </div>
            `;
        } else {
            inputsDiv.classList.add("horario-fechado");
            inputsDiv.innerHTML = `<span class="fechado-label">Fechado</span>`;
        }
    });
});

// ====================================================
// UPLOAD LOGO
// ====================================================

const dropZoneLogo = document.getElementById("drop-zone-logo");
const fileInputLogo = document.createElement("input");
fileInputLogo.type = "file";
fileInputLogo.accept = "image/jpeg, image/png, image/gif";
fileInputLogo.style.display = "none";
document.body.appendChild(fileInputLogo);

dropZoneLogo.addEventListener("click", () => fileInputLogo.click());
fileInputLogo.addEventListener("change", (e) => processarImagem(e.target.files[0], dropZoneLogo));
dropZoneLogo.addEventListener("dragover", (e) => { e.preventDefault(); dropZoneLogo.style.borderColor = "#7c3aed"; });
dropZoneLogo.addEventListener("dragleave", () => { dropZoneLogo.style.borderColor = ""; });
dropZoneLogo.addEventListener("drop", (e) => { e.preventDefault(); dropZoneLogo.style.borderColor = ""; processarImagem(e.dataTransfer.files[0], dropZoneLogo); });

// ====================================================
// UPLOAD CAPA
// ====================================================

const dropZoneCapa = document.getElementById("drop-zone-capa");
const fileInputCapa = document.createElement("input");
fileInputCapa.type = "file";
fileInputCapa.accept = "image/jpeg, image/png, image/gif";
fileInputCapa.style.display = "none";
document.body.appendChild(fileInputCapa);

dropZoneCapa.addEventListener("click", () => fileInputCapa.click());
fileInputCapa.addEventListener("change", (e) => processarImagem(e.target.files[0], dropZoneCapa));
dropZoneCapa.addEventListener("dragover", (e) => { e.preventDefault(); dropZoneCapa.style.borderColor = "#7c3aed"; });
dropZoneCapa.addEventListener("dragleave", () => { dropZoneCapa.style.borderColor = ""; });
dropZoneCapa.addEventListener("drop", (e) => { e.preventDefault(); dropZoneCapa.style.borderColor = ""; processarImagem(e.dataTransfer.files[0], dropZoneCapa); });

// ====================================================
// PROCESSAR IMAGEM
// ====================================================

function processarImagem(file, dropZone) {
    if (!file) return;
    const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];
    if (!tiposPermitidos.includes(file.type)) { alert("Formato inválido. Use JPEG, PNG ou GIF."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Imagem muito grande. Máximo 2MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        dropZone.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`;
    };
    reader.readAsDataURL(file);
}

// ====================================================
// CEP
// ====================================================

const cepInput    = document.getElementById("cep");
const ruaInput    = document.getElementById("rua");
const cidadeInput = document.getElementById("cidade");
const estadoInput = document.getElementById("estado");
const bairroInput = document.getElementById("bairro");

if (cepInput) {
    cepInput.addEventListener("input", () => {
        let v = cepInput.value.replace(/\D/g, "");
        if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5, 8);
        cepInput.value = v;
    });

    cepInput.addEventListener("blur", async () => {
        const cep = cepInput.value.replace(/\D/g, "");
        if (cep.length !== 8) return;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (data.erro) { alert("CEP não encontrado"); return; }
            if (ruaInput)    ruaInput.value    = data.logradouro || "";
            if (cidadeInput) cidadeInput.value = data.localidade || "";
            if (estadoInput) estadoInput.value = data.uf         || "";
            if (bairroInput) bairroInput.value = data.bairro     || "";
        } catch (e) {
            alert("Erro ao buscar CEP");
        }
    });
}

// ====================================================
// PRATOS EM DESTAQUE
// ====================================================

const ticketConfigCard = document.querySelector(".ticket-config-card");
const listaContainer   = document.querySelector(".lista-pratos");
const listaPratos      = [];
let pratoEditandoIndex = null;

document.querySelectorAll(".btn-ticket-action").forEach(btn => {
    btn.addEventListener("click", () => {
        const tipo = btn.dataset.tipo;
        const existente = ticketConfigCard.querySelector(".ticket-item");
        if (existente) existente.remove();
        ticketConfigCard.style.display = "flex";
        criarFormPrato(tipo);
    });
});

function criarFormPrato(tipo) {
    const ticketItem = document.createElement("div");
    ticketItem.classList.add("ticket-item");
    ticketItem.dataset.tipo = tipo;

    const tituloForm = tipo === "destaque" ? "⭐ Adicionar prato destaque" : "🏷️ Adicionar promoção";
    const descForm   = tipo === "destaque"
        ? `<p>Destaque os pratos mais populares ou especiais do seu estabelecimento.</p>`
        : `<p>Cadastre uma promoção especial — combo, desconto, happy hour, etc.</p>`;

    const camposPromocao = tipo === "promocao" ? `
        <label>Preço original (R$)</label>
        <input type="number" step="0.01" placeholder="0,00" class="preco-original">
        <label>Preço promocional (R$)</label>
        <input type="number" step="0.01" placeholder="0,00" class="preco-promo">
        <label>Período da promoção</label>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <input type="datetime-local" class="promo-inicio" style="flex:1;min-width:180px;">
            <input type="datetime-local" class="promo-fim" style="flex:1;min-width:180px;">
        </div>
    ` : `
        <label>Preço (R$)</label>
        <input type="number" step="0.01" placeholder="0,00" class="preco-destaque">
    `;

    ticketItem.innerHTML = `
        <button class="remove-ticket" type="button">
            <img src="/frontend/imagens/fechar.png" alt="Fechar" style="width:16px;height:16px;">
        </button>
        <h4>${tituloForm}</h4>
        ${descForm}
        <label>Nome do prato / item <span style="color:red">*</span></label>
        <input type="text" class="titulo-prato" maxlength="60" placeholder="Ex: Risoto de camarão, Combo família...">
        <label>Categoria</label>
        <select class="categoria-prato">
            <option value="">Selecione uma categoria</option>
            <option>Entrada</option><option>Prato Principal</option>
            <option>Acompanhamento</option><option>Sobremesa</option>
            <option>Bebida</option><option>Petisco</option>
            <option>Combo / Promoção</option><option>Vegano / Vegetariano</option>
            <option>Sem glúten</option><option>Especial do dia</option>
        </select>
        ${camposPromocao}
        <label>Descrição do prato (opcional)</label>
        <textarea class="descricao-prato" maxlength="150" placeholder="Ingredientes, modo de preparo..."></textarea>
        <div class="ticket-actions">
            <button class="btnSalvarPrato btn-primary" type="button">Salvar prato</button>
        </div>
    `;

    ticketItem.querySelector(".remove-ticket").addEventListener("click", () => {
        ticketItem.remove();
        pratoEditandoIndex = null;
        if (listaPratos.length === 0) ticketConfigCard.style.display = "none";
    });

    ticketItem.querySelector(".btnSalvarPrato").addEventListener("click", () => {
        const titulo = ticketItem.querySelector(".titulo-prato").value.trim();
        if (!titulo) { alert("Informe o nome do prato."); return; }

        const categoria = ticketItem.querySelector(".categoria-prato").value || "-";
        let preco = "";
        if (tipo === "destaque") {
            preco = ticketItem.querySelector(".preco-destaque")?.value || "";
            if (preco) preco = parseFloat(preco).toFixed(2);
        } else {
            const precoPromo = ticketItem.querySelector(".preco-promo")?.value || "";
            preco = precoPromo ? parseFloat(precoPromo).toFixed(2) : "";
        }

        const prato = { titulo, categoria, preco, tipo };
        if (pratoEditandoIndex !== null) {
            listaPratos[pratoEditandoIndex] = prato;
            pratoEditandoIndex = null;
        } else {
            listaPratos.push(prato);
        }

        renderizarPratos();
        ticketItem.remove();
    });

    ticketConfigCard.insertBefore(ticketItem, listaContainer);
}

function renderizarPratos() {
    listaContainer.innerHTML = "";
    if (listaPratos.length === 0) {
        if (!ticketConfigCard.querySelector(".ticket-item")) ticketConfigCard.style.display = "none";
        return;
    }

    listaContainer.innerHTML = "<h3>Pratos cadastrados</h3>";
    listaPratos.forEach((prato, index) => {
        const item = document.createElement("div");
        item.classList.add("prato-resumo");
        const valorDisplay = prato.preco ? `R$ ${prato.preco}` : "Sem preço";
        const badgeClass   = prato.tipo === "destaque" ? "badge-destaque" : "badge-promocao";
        const badgeLabel   = prato.tipo === "destaque" ? "⭐ Destaque" : "🏷️ Promoção";
        item.innerHTML = `
            <div>
                <strong>${prato.titulo}</strong>
                <span class="prato-badge ${badgeClass}">${badgeLabel}</span>
                &nbsp;— ${prato.categoria} — ${valorDisplay}
            </div>
            <div>
                <button class="btn-editar" onclick="editarPrato(${index})">Editar</button>
                <button class="btn-excluir" onclick="excluirPrato(${index})">Excluir</button>
            </div>
        `;
        listaContainer.appendChild(item);
    });
    ticketConfigCard.style.display = "flex";
}

function editarPrato(index) {
    pratoEditandoIndex = index;
    const prato = listaPratos[index];
    const existente = ticketConfigCard.querySelector(".ticket-item");
    if (existente) existente.remove();
    ticketConfigCard.style.display = "flex";
    criarFormPrato(prato.tipo);
    const form = ticketConfigCard.querySelector(".ticket-item");
    form.querySelector(".titulo-prato").value    = prato.titulo;
    form.querySelector(".categoria-prato").value = prato.categoria !== "-" ? prato.categoria : "";
    if (prato.tipo === "destaque") {
        const precoField = form.querySelector(".preco-destaque");
        if (precoField && prato.preco) precoField.value = prato.preco;
    } else {
        const precoPromo = form.querySelector(".preco-promo");
        if (precoPromo && prato.preco) precoPromo.value = prato.preco;
    }
}

function excluirPrato(index) {
    listaPratos.splice(index, 1);
    renderizarPratos();
}
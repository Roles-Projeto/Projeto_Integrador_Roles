// Alternar Evento / Estabelecimento

const btnEvento = document.getElementById("btnEvento");
const btnEstabelecimento = document.getElementById("btnEstabelecimento");
const titulo = document.getElementById("titulo");
const campoCNPJ = document.getElementById("campoCNPJ");
const cnpjInput = document.getElementById("cnpj");

btnEvento.addEventListener("click", () => {

    titulo.textContent = "Criar Evento";

    campoCNPJ.style.display = "none";

    cnpjInput.required = false;

    btnEvento.classList.add("ativo");
    btnEstabelecimento.classList.remove("ativo");

});

btnEstabelecimento.addEventListener("click", () => {

    titulo.textContent = "Criar Estabelecimento";

    campoCNPJ.style.display = "block";

    cnpjInput.required = true;

    btnEstabelecimento.classList.add("ativo");
    btnEvento.classList.remove("ativo");

});

// Contador caracteres

const nomeEvento = document.getElementById("nomeEvento");
const contadorNome = document.getElementById("contadorNome");

nomeEvento.addEventListener("input", () => {

    const restante = 100 - nomeEvento.value.length;

    contadorNome.textContent = restante + " caracteres restantes";

});

// Upload imagem

const uploadArea = document.getElementById("uploadArea");
const imagemInput = document.getElementById("imagem");
const preview = document.getElementById("preview");

uploadArea.addEventListener("click", () => {

    imagemInput.click();

});

imagemInput.addEventListener("change", () => {

    const file = imagemInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        preview.src = reader.result;

        preview.style.display = "block";

    };

    reader.readAsDataURL(file);

});

// Duração evento

const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const duracao = document.getElementById("duracao");

function calcularDuracao() {

    if (!dataInicio.value || !dataFim.value) return;

    const inicio = new Date(dataInicio.value);
    const fim = new Date(dataFim.value);

    const diff = fim - inicio;

    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dias >= 0) {

        duracao.textContent = dias + " dias";

    }

}

dataInicio.addEventListener("change", calcularDuracao);
dataFim.addEventListener("change", calcularDuracao);

// Validação CNPJ

function validarCNPJ(cnpj) {

    cnpj = cnpj.replace(/[^\\d]+/g, '');

    if (cnpj.length !== 14) return false;

    if (/^(\\d)\\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);

    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {

        soma += numeros.charAt(tamanho - i) * pos--;

        if (pos < 2)
            pos = 9;

    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

    if (resultado != digitos.charAt(0))
        return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);

    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {

        soma += numeros.charAt(tamanho - i) * pos--;

        if (pos < 2)
            pos = 9;

    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

    if (resultado != digitos.charAt(1))
        return false;

    return true;

}

const msgCNPJ = document.getElementById("msgCNPJ");

cnpjInput.addEventListener("blur", () => {

    if (!cnpjInput.value) return;

    if (validarCNPJ(cnpjInput.value)) {

        msgCNPJ.textContent = "CNPJ válido";
        msgCNPJ.className = "sucesso";

    } else {

        msgCNPJ.textContent = "CNPJ inválido";
        msgCNPJ.className = "erro";

    }

});
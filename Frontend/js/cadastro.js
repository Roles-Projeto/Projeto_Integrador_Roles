// ========================
// DEBUG INICIAL
// ========================
const API_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:3000"
        : "https://projeto-integrador-roles.onrender.com";
console.log("🚨 JS CADASTRO CARREGADO 🚨");

// ========================
// FORM
// ========================
const form = document.getElementById('cadastroForm');

// ========================
// CAMPOS DE ERRO
// ========================
const erroNome = document.getElementById('erroNome');
const erroEmail = document.getElementById('erroEmail');
const erroSenha = document.getElementById('erroSenha');
const erroConfirmar = document.getElementById('erroConfirmar');

// ========================
// ELEMENTOS DO MODAL
// ========================
const modal = document.getElementById("modalCodigo");
const escolhaMetodo = document.getElementById("escolhaMetodo");
const areaCodigo = document.getElementById("areaCodigo");
const mensagemEnvio = document.getElementById("mensagemEnvio");
const btnVerificar = document.getElementById("btnVerificar");
const inputCodigo = document.getElementById("codigo");
const reenviarCodigo = document.getElementById("reenviarCodigo");
const outraForma = document.getElementById("outraForma");
const areaTelefone = document.getElementById("areaTelefone");
const telefoneAlternativo = document.getElementById("telefoneAlternativo");
const btnEnviarTelefone = document.getElementById("btnEnviarTelefone");

// ========================
// VARIÁVEIS DE CONTROLE
// ========================
let metodoSelecionado = null;
let dadosTemporarios = null;
let tempoRestante = 60;
let intervaloTimer = null;


// ========================
// LIMPAR ERROS DO FORM
// ========================
function limparErros() {
    erroNome.textContent = '';
    erroEmail.textContent = '';
    erroSenha.textContent = '';
    erroConfirmar.textContent = '';

    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('erro-input');
    });
}


// ========================
// SUBMIT DO CADASTRO
// ========================
form.addEventListener('submit', async (e) => {
    console.log("📤 SUBMIT DISPAROU");
    e.preventDefault();
    limparErros();

    const nome_completo = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const confirmarEmailVal = document.getElementById('confirmarEmail').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const confirmar = document.getElementById('confirmarSenha').value.trim();

    let temErro = false;

    // ========================
    // VALIDAÇÕES
    // ========================
    if (nome_completo.length < 3) {
        erroNome.textContent = "Digite seu nome completo";
        document.getElementById('nome').classList.add('erro-input');
        temErro = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        erroEmail.textContent = "Digite um e-mail válido";
        document.getElementById('email').classList.add('erro-input');
        temErro = true;
    }

    if (email !== confirmarEmailVal) {
        erroEmail.textContent = "Os e-mails não coincidem";
        document.getElementById('confirmarEmail').classList.add('erro-input');
        temErro = true;
    }

    const senhaForteRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!senhaForteRegex.test(senha)) {
        erroSenha.textContent =
            "Use no mínimo 8 caracteres com letra, número e símbolo";
        document.getElementById('senha').classList.add('erro-input');
        temErro = true;
    }

    if (senha !== confirmar) {
        erroConfirmar.textContent = "As senhas não coincidem";
        document.getElementById('confirmarSenha').classList.add('erro-input');
        temErro = true;
    }

    if (temErro) return;

    // ========================
    // ENVIO PARA O BACKEND
    // ========================
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Criando conta...";

    try {
        console.log("🌐 ENVIANDO PARA API...");

        const response = await
            fetch(`${API_URL}/usuarios/cadastro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome_completo, email, telefone, senha })
            }
            );

        console.log("📡 STATUS:", response.status);

        let data;
        try {
            data = await response.json();
        } catch {
            data = {};
        }

        console.log("📦 RESPOSTA API:", data);

        if (!response.ok) {
            alert(data.erro || "Erro ao cadastrar usuário");
            return;
        }

        // Avisa se houve problema no email mas conta foi criada
        if (data.avisoEmail) {
            console.warn("⚠️ Email não enviado automaticamente:", data.avisoEmail);
        }

        console.log("✅ BACKEND RESPONDEU CERTO");

        dadosTemporarios = { nome_completo, email, telefone, senha };

        abrirModal();

    } catch (err) {
        console.error("❌ ERRO DE CONEXÃO:", err);
        alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Criar Conta";
    }
});


// ========================
// ABRIR MODAL
// ========================
function abrirModal() {
    console.log("📩 ABRINDO MODAL");

    modal.classList.remove("hidden");
    metodoSelecionado = "email";

    const emailMascarado = mascararEmail(dadosTemporarios.email);
    mensagemEnvio.textContent =
        `Enviamos um código de verificação para ${emailMascarado}`;

    if (escolhaMetodo) escolhaMetodo.style.display = "none";
    areaCodigo.style.display = "block";

    iniciarTimerReenvio();
}


// ========================
// FECHAR MODAL
// ========================
function fecharModal() {
    modal.classList.add("hidden");
    clearInterval(intervaloTimer);
}


// ========================
// MASCARAR EMAIL
// ========================
function mascararEmail(email) {
    const [nome, dominio] = email.split("@");
    return nome.slice(0, 3) + "****@" + dominio;
}


// ========================
// MASCARAR TELEFONE
// ========================
function mascararTelefone(telefone) {
    if (!telefone) return "";
    return telefone.slice(0, 6) + "****" + telefone.slice(-4);
}


// ========================
// ENVIAR CÓDIGO (REENVIO)
// ========================
async function enviarCodigo(metodo) {
    console.log("📨 ENVIANDO CÓDIGO VIA:", metodo);
    metodoSelecionado = metodo;

    try {
        const response = await fetch(`${API_URL}/usuarios/enviar-codigo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: dadosTemporarios.email })
        }
        );

        let data;
        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {
            alert(data.erro || "Erro ao enviar código");
        }

    } catch (err) {
        console.error("❌ ERRO AO ENVIAR CÓDIGO:", err);
        alert("Erro ao enviar código. Tente novamente.");
    }
}


// ========================
// TIMER DE REENVIO (60s)
// ========================
function iniciarTimerReenvio() {
    clearInterval(intervaloTimer); // limpa timer anterior se houver

    const btn = reenviarCodigo;
    tempoRestante = 60;
    btn.disabled = true;
    btn.textContent = `Reenviar em ${tempoRestante}s`;

    intervaloTimer = setInterval(() => {
        tempoRestante--;
        btn.textContent = `Reenviar em ${tempoRestante}s`;

        if (tempoRestante <= 0) {
            clearInterval(intervaloTimer);
            btn.disabled = false;
            btn.textContent = "Reenviar código";
        }
    }, 1000);
}


// ========================
// REENVIAR CÓDIGO
// ========================
reenviarCodigo.addEventListener("click", async () => {
    if (!metodoSelecionado) return;

    reenviarCodigo.disabled = true;
    reenviarCodigo.textContent = "Enviando...";

    await enviarCodigo(metodoSelecionado);

    alert("📩 Código reenviado! Verifique seu email.");
    iniciarTimerReenvio();
});


// ========================
// OUTRA FORMA (SMS)
// ========================
outraForma.addEventListener("click", async () => {
    if (dadosTemporarios.telefone) {
        await enviarCodigo("telefone");
        mensagemEnvio.textContent =
            `Código enviado para ${mascararTelefone(dadosTemporarios.telefone)}`;
    } else {
        areaTelefone.style.display = "block";
    }
});


// ========================
// TELEFONE ALTERNATIVO
// ========================
btnEnviarTelefone.addEventListener("click", async () => {
    const telefone = telefoneAlternativo.value.trim();

    if (!telefone) {
        alert("Digite um telefone");
        return;
    }

    dadosTemporarios.telefone = telefone;
    await enviarCodigo("telefone");

    mensagemEnvio.textContent =
        `Código enviado para ${mascararTelefone(telefone)}`;

    areaTelefone.style.display = "none";
});


// ========================
// VERIFICAR CÓDIGO
// ========================
btnVerificar.addEventListener("click", async () => {
    console.log("🔐 VERIFICANDO CÓDIGO");

    const codigo = inputCodigo.value.trim();

    if (!codigo || codigo.length < 6) {
        alert("Digite o código de 6 dígitos");
        return;
    }

    btnVerificar.disabled = true;
    btnVerificar.textContent = "Verificando...";

    try {
        const response = await fetch(`${API_URL}/usuarios/verificar-codigo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: dadosTemporarios.email,
                    codigo
                })
            }
        );

        const data = await response.json();

        if (data.verificado) {
            alert("✅ Conta verificada com sucesso!");
            fecharModal();
            window.location.href = "../login/login.html";
        } else {
            alert("❌ Código inválido. Verifique e tente novamente.");
            inputCodigo.value = "";
            inputCodigo.focus();
        }

    } catch (err) {
        console.error("❌ ERRO AO VERIFICAR:", err);
        alert("Erro ao verificar código. Tente novamente.");
    } finally {
        btnVerificar.disabled = false;
        btnVerificar.textContent = "Verificar Código";
    }
});
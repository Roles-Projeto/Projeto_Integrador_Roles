const clienteBtn = document.getElementById("cliente-btn");
const empresarioBtn = document.getElementById("empresario-btn");
const mainText = document.getElementById("main-text");
const subText = document.getElementById("sub-text");
const form = document.getElementById("login-form");

const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const headerIframe = document.getElementById('site-header');

// Função para enviar a mensagem de login para o Header Iframe
function enviarLoginParaHeader(name, email, userType, photoUrl) {
    if (headerIframe && headerIframe.contentWindow) {
        headerIframe.contentWindow.postMessage({
            action: 'LOGIN_SUCCESS',
            newName: name,
            newEmail: email,
            newPicUrl: photoUrl || 'https://i.imgur.com/default-placeholder.png',
            userType: userType
        }, '*');
        console.log('Mensagem enviada para o iframe: LOGIN_SUCCESS');
    }
}

// Mantido apenas para interface visual (não interfere no backend)
if (clienteBtn && empresarioBtn) {

    clienteBtn.addEventListener("click", () => {
        clienteBtn.classList.add("active");
        empresarioBtn.classList.remove("active");
        mainText.textContent = "Encontre os melhores lugares para sair e se divertir";
        subText.textContent = "Entre rapidamente com";
    });

    empresarioBtn.addEventListener("click", () => {
        empresarioBtn.classList.add("active");
        clienteBtn.classList.remove("active");
        mainText.textContent = "Cadastre seu estabelecimento e aumente sua visibilidade";
        subText.textContent = "Entre rapidamente com";
    });

}

// Lógica de login conectando ao backend
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputPassword.value;

    // Agora existe apenas um tipo de usuário
    let userType = 'usuario';

    if (!email || !senha) {
        alert("⚠️ Preencha todos os campos (Email e Senha)!");
        return;
    }

    // Endpoint único
    const endpoint = "http://localhost:3000/usuarios/login";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        console.log("📩 Resposta do backend:", data);

        if (response.ok) {
            // Salva dados no localStorage
            localStorage.setItem('userIsLoggedIn', 'true');
            localStorage.setItem('userType', 'usuario');

            // Salva o ID do usuário para usar no perfil
            localStorage.setItem('userId', data.id);

            let name = data.nome_completo || 'Cliente Rolês';

            let photoUrl = data.foto_perfil || 'https://i.imgur.com/default-placeholder.png';

            localStorage.setItem('profileName', name);
            localStorage.setItem('profileEmail', email);
            localStorage.setItem('profilePhotoUrl', photoUrl);

            // Atualiza o header
            enviarLoginParaHeader(
                name,
                email,
                localStorage.getItem('userType'),
                photoUrl
            );

            // 🔹 Verifica se está dentro de um modal / iframe no home
            if (window.parent && window.parent !== window) {

                console.log("Login feito dentro do card do home");

                // avisa o home que o login foi feito
                window.parent.postMessage(
                    "LOGIN_SUCCESS",
                    "*"
                );

            } else {

                console.log("Login feito na página normal");

                // Redireciona para o perfil
                window.location.href =
                    "../index.html";

            }
        } else {
            alert("⚠️ " + (data.erro || "Email ou senha incorretos."));
        }

    } catch (err) {
        console.error("❌ Erro na requisição:", err);
        alert("❌ Não foi possível conectar ao servidor. Verifique se o backend está rodando (porta 3000).");
    }
});


/* ==================================================
================ REDIRECIONAR CADASTRO ==============
================================================== */

const btnCadastrar = document.getElementById("btnCadastrar");

if (btnCadastrar) {

    btnCadastrar.addEventListener("click", (e) => {

        e.preventDefault();

        window.parent.location.href = "../Cadastro/cadastro.html";

    });

}


// 👁️ MOSTRAR / ESCONDER SENHA
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

if (togglePassword && password) {

    password.addEventListener("input", () => {
        if (password.value.length > 0) {
            togglePassword.classList.add("show");
        } else {
            togglePassword.classList.remove("show");
            password.type = "password";
            togglePassword.textContent = "visibility";
        }
    });

    togglePassword.addEventListener("click", () => {
        if (password.type === "password") {
            password.type = "text";
            togglePassword.textContent = "visibility_off";
        } else {
            password.type = "password";
            togglePassword.textContent = "visibility";
        }
    });

}
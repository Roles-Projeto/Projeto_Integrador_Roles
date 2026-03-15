
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
            action: userType === 'empresario' ? 'LOGIN_SUCCESS_EMPRESARIO' : 'LOGIN_SUCCESS',
            newName: name,
            newEmail: email,
            newPicUrl: photoUrl || (userType === 'empresario' ? '../Imagens/Logo Restaurante.avif' : 'https://i.imgur.com/default-placeholder.png'),
            userType: userType
        }, '*');
        console.log('Mensagem enviada para o iframe: LOGIN_SUCCESS');
    }
}

// Alterna entre Cliente e Empresário
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

// Lógica de login conectando ao backend
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputPassword.value;
    let userType = clienteBtn.classList.contains("active") ? 'usuario' : 'empresario';

    if (!email || !senha) {
        alert("⚠️ Preencha todos os campos (Email e Senha)!");
        return;
    }

    const endpoint = userType === 'empresario'
        ? "http://localhost:3000/empresarios/login"
        : "http://localhost:3000/usuarios/login";

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
            localStorage.setItem('userType', userType === 'usuario' ? 'cliente' : 'empresario');

            // 🔹 Salva o ID do usuário para usar no perfil
            localStorage.setItem('userId', data.id);

            let name = userType === 'empresario'
                ? (data.nome_estabelecimento || 'Empresário Rolês')
                : (data.nome_completo || 'Cliente Rolês');

            let photoUrl = data.foto || (userType === 'empresario' ? '../Imagens/Logo Restaurante.avif' : 'https://i.imgur.com/default-placeholder.png');

            localStorage.setItem('profileName', name);
            localStorage.setItem('profileEmail', email);
            localStorage.setItem('profilePhotoUrl', photoUrl);

            // Atualiza o header
            enviarLoginParaHeader(name, email, localStorage.getItem('userType'), photoUrl);

            // Redireciona para o perfil
            const redirectUrl = userType === 'empresario'
                ? "../Perfil_empresario/Perfil_empresario.html"
                : "../Perfil_usuario/Perfil_usuario.html";
            window.location.href = redirectUrl;

        } else {
            alert("⚠️ " + (data.erro || "Email ou senha incorretos."));
        }
    } catch (err) {
        console.error("❌ Erro na requisição:", err);
        alert("❌ Não foi possível conectar ao servidor. Verifique se o backend está rodando (porta 3000).");
    }
});




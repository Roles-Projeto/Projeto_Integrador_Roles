const form = document.getElementById('cadastroForm');

// Campos de erro
const erroNome = document.getElementById('erroNome');
const erroEmail = document.getElementById('erroEmail');
const erroSenha = document.getElementById('erroSenha');
const erroConfirmar = document.getElementById('erroConfirmar');

// Função para limpar erros
function limparErros() {
    erroNome.textContent = '';
    erroEmail.textContent = '';
    erroSenha.textContent = '';
    erroConfirmar.textContent = '';

    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('erro-input');
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    limparErros();

    const nome_completo = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const confirmar = document.getElementById('confirmarSenha').value.trim();

    let temErro = false;

    // 🔤 Nome
    if (nome_completo.length < 3) {
        erroNome.textContent = "Digite seu nome completo";
        document.getElementById('nome').classList.add('erro-input');
        temErro = true;
    }

    // 📧 Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        erroEmail.textContent = "Digite um e-mail válido (ex: nome@email.com)";
        document.getElementById('email').classList.add('erro-input');
        temErro = true;
    }

    // 🔐 Senha forte
    const senhaForteRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!senhaForteRegex.test(senha)) {
        erroSenha.textContent = "Use no mínimo 8 caracteres com letra, número e símbolo";
        document.getElementById('senha').classList.add('erro-input');
        temErro = true;
    }

    // 🔁 Confirmar senha
    if (senha !== confirmar) {
        erroConfirmar.textContent = "As senhas não coincidem";
        document.getElementById('confirmarSenha').classList.add('erro-input');
        temErro = true;
    }

    // Se tiver erro, para aqui
    if (temErro) return;

    try {
        const response = await fetch("http://localhost:3000/usuarios/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome_completo,
                email,
                telefone,
                senha
            })
        });

        const data = await response.json();

        if (response.ok) {
            // mensagem de sucesso no lugar de alert
            alert("✅ Cadastro realizado com sucesso!");
            window.location.href = '../login/login.html';
        } else {
            alert("❌ Erro: " + (data.erro || "Falha desconhecida."));
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("❌ Erro ao conectar com o servidor.");
    }
});
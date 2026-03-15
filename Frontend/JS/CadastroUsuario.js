
const form = document.getElementById('cadastroForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome_completo = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const confirmar = document.getElementById('confirmarSenha').value.trim();

    // ✅ Validação
    if (senha !== confirmar) {
        alert('As senhas não coincidem!');
        return;
    }
    if (senha.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    try {
        // 🚀 Envio dos dados para o back-end
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
            alert("✅ " + data.mensagem);
            // 🔹 Redireciona para o login após cadastro
            window.location.href = '../login/login.html';
        } else {
            alert("❌ Erro: " + (data.erro || "Falha desconhecida."));
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("❌ Erro ao conectar com o servidor.");
    }
});



// -----------------------------
// 🔹 Lógica dos Planos
// -----------------------------
const planCards = document.querySelectorAll('.plan-card');
const planoEscolhidoInput = document.getElementById('plano_escolhido');

if (planCards.length > 0) {
    const initialSelectedCard = document.querySelector('.plan-card.selected');
    if (initialSelectedCard && planoEscolhidoInput) {
        planoEscolhidoInput.value = initialSelectedCard.querySelector('.plan-name').textContent.trim();
    }

    planCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            planCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const selectedPlan = card.querySelector('.plan-name').textContent.trim();
            if (planoEscolhidoInput) planoEscolhidoInput.value = selectedPlan;
            console.log("🟣 Plano selecionado:", selectedPlan);
        });
    });
}

// -----------------------------
// 🔹 Lógica de Cadastro do Empresário
// -----------------------------
const formCadastro = document.querySelector('.registration-form');

if (formCadastro) {
    formCadastro.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Captura os valores dos campos
        const responsavelNome = document.getElementById('responsavel_nome').value.trim();
        const responsavelEmail = document.getElementById('responsavel_email').value.trim();
        const estabelecimentoNome = document.getElementById('estabelecimento_nome').value.trim();
        const cnpj = document.getElementById('cnpj').value.trim();
        const tipoEstabelecimento = document.getElementById('tipo_estabelecimento').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const descricao = document.getElementById('descricao_estabelecimento').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const cidade = document.getElementById('cidade').value.trim();
        const estado = document.getElementById('estado').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar_senha').value;
        const planoSelecionado = planoEscolhidoInput ? planoEscolhidoInput.value : null;

        // -----------------------------
        // 🧩 Validações básicas
        // -----------------------------
        if (!responsavelNome || !responsavelEmail || !estabelecimentoNome || !cnpj || !senha) {
            alert("⚠️ Por favor, preencha todos os campos obrigatórios (Nome, Email, Estabelecimento, CNPJ e Senha).");
            return;
        }

        if (!planoSelecionado) {
            alert("⚠️ Selecione um plano antes de continuar!");
            return;
        }

        if (senha.length < 8) {
            alert("⚠️ A senha deve ter no mínimo 8 caracteres.");
            return;
        }

        if (senha !== confirmarSenha) {
            alert("⚠️ As senhas não coincidem! Verifique e tente novamente.");
            return;
        }

        // -----------------------------
        // 🚀 Envio dos dados ao backend
        // -----------------------------
        try {
            const response = await fetch("http://localhost:3000/empresarios/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plano: planoSelecionado,
                    nome_responsavel: responsavelNome,
                    email: responsavelEmail,
                    nome_estabelecimento: estabelecimentoNome,
                    cnpj: cnpj,
                    tipo_estabelecimento: tipoEstabelecimento,
                    telefone_comercial: telefone,
                    descricao: descricao,
                    endereco: endereco,
                    cidade: cidade,
                    estado: estado,
                    senha: senha
                })
            });

            const data = await response.json();
            console.log("📩 Resposta do backend:", data);

            if (data.mensagem === "Empresário cadastrado com sucesso!") {
                alert("✅ Cadastro realizado com sucesso!");
                // Redireciona diretamente para a página de login
                window.location.href = "../login/login.html";
            } else {
                alert("⚠️ Erro ao cadastrar: " + (data.erro || "Verifique os dados e tente novamente."));
            }
        } catch (erro) {
            console.error("❌ Erro na requisição:", erro);
            alert("❌ Não foi possível conectar ao servidor. Verifique se o backend está rodando (porta 3000).");
        }
    });
}

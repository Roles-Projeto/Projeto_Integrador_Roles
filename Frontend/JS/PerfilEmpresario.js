
// -----------------------------
// Elementos do perfil
// -----------------------------
const editarBtn = document.getElementById("editar-btn");
const sairBtn = document.getElementById("sair-btn");
const editFormCard = document.getElementById("edit-form-card");
const statsCard = document.getElementById("stats-card");
const cancelarBtn = document.getElementById("cancelar-btn");
const salvarBtn = document.getElementById("salvar-btn");

const displayNome = document.getElementById("nome-restaurante");
const displayEmail = document.getElementById("display-email");
const displayTelefone = document.getElementById("display-telefone");
const displayCidade = document.getElementById("display-cidade");

const inputNome = document.getElementById("edit-nome-restaurante");
const inputEmail = document.getElementById("edit-email");
const inputTelefone = document.getElementById("edit-telefone");
const inputCidade = document.getElementById("edit-cidade");

const profilePicDisplay = document.getElementById("profile-pic-display");
const uploadPicInput = document.getElementById("upload-pic-input");
const headerIframe = document.getElementById('site-header');

// -----------------------------
// Função para atualizar dados no localStorage e header
// -----------------------------
function updateProfileData(photoUrl, name, email, phone, city) {
    localStorage.setItem('profilePhotoUrl', photoUrl);
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileEmail', email);
    localStorage.setItem('profilePhone', phone);
    localStorage.setItem('profileCity', city);

    if (headerIframe && headerIframe.contentWindow) {
        headerIframe.contentWindow.postMessage({
            action: 'UPDATE_PROFILE_INFO',
            newName: name,
            newEmail: email,
            newPicUrl: photoUrl
        }, '*');
    }
}

// -----------------------------
// Função para carregar dados do backend
// -----------------------------
async function loadEmpresarioData() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("❌ Usuário não logado. Redirecionando para login...");
        window.location.href = "/frontend/login/login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/empresarios/${userId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do empresário");

        const data = await response.json();

        // Atualiza DOM
        displayNome.textContent = data.nome_estabelecimento || "Empresário Rolês";
        displayEmail.textContent = data.email || "email@exemplo.com";
        displayTelefone.textContent = data.telefone_comercial || "(00) 0000-0000";
        displayCidade.textContent = data.cidade || "Cidade - UF";
        profilePicDisplay.src = data.foto_perfil || '../Imagens/Logo Restaurante.avif';

        // Atualiza inputs
        inputNome.value = data.nome_estabelecimento || "";
        inputEmail.value = data.email || "";
        inputTelefone.value = data.telefone_comercial || "";
        inputCidade.value = data.cidade || "";

        // Atualiza localStorage
        updateProfileData(profilePicDisplay.src, inputNome.value, inputEmail.value, inputTelefone.value, inputCidade.value);

    } catch (err) {
        console.error(err);
        alert("❌ Não foi possível carregar os dados do perfil. Verifique o backend.");
    }
}

// -----------------------------
// Exibir formulário de edição
// -----------------------------
function showEditForm() {
    editFormCard.style.display = 'block';
    statsCard.style.opacity = 0.3;
}

editarBtn.addEventListener('click', showEditForm);

cancelarBtn.addEventListener('click', () => {
    editFormCard.style.display = 'none';
    statsCard.style.opacity = 1;
});

// -----------------------------
// Salvar alterações
// -----------------------------
salvarBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    const novoNome = inputNome.value.trim();
    const novoEmail = inputEmail.value.trim();
    const novoTelefone = inputTelefone.value.trim();
    const novaCidade = inputCidade.value.trim();

    if (!novoNome || !novoEmail) {
        alert("⚠️ Nome e Email são obrigatórios!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/empresarios/atualizar/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome_estabelecimento: novoNome,
                email: novoEmail,
                telefone_comercial: novoTelefone,
                cidade: novaCidade,
                foto_perfil: profilePicDisplay.src
            })
        });

        if (!response.ok) throw new Error("Erro ao atualizar perfil");

        displayNome.textContent = novoNome;
        displayEmail.textContent = novoEmail;
        displayTelefone.textContent = novoTelefone;
        displayCidade.textContent = novaCidade;

        editFormCard.style.display = 'none';
        statsCard.style.opacity = 1;

        // Atualiza localStorage e header
        updateProfileData(profilePicDisplay.src, novoNome, novoEmail, novoTelefone, novaCidade);

        alert("✅ Perfil atualizado com sucesso!");

    } catch (err) {
        console.error(err);
        alert("❌ Falha ao atualizar perfil. Verifique o backend.");
    }
});

// -----------------------------
// Atualizar foto de perfil
// -----------------------------
uploadPicInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const newPicUrl = event.target.result;
            profilePicDisplay.src = newPicUrl;
            updateProfileData(newPicUrl, inputNome.value, inputEmail.value, inputTelefone.value, inputCidade.value);
        };
        reader.readAsDataURL(file);
    }
});

// -----------------------------
// Logout
// -----------------------------
sairBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/frontend/login/logoutEmpresario.html';
});

// -----------------------------
// Inicializa a página
// -----------------------------
document.addEventListener('DOMContentLoaded', loadEmpresarioData);

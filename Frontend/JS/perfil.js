
// Elementos de Perfil
const profilePicture = document.querySelector('.profile-picture');
const profileNameDisplay = document.querySelector('.profile-name');
const profileEmailDisplay = document.getElementById('profile-email-display');
const profilePhoneDisplay = document.getElementById('profile-phone-display');

const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputTelefone = document.getElementById('telefone');

const editProfileForm = document.querySelector('.edit-profile-form');
const editPictureBtn = document.getElementById('edit-picture-btn');
const pictureUploadInput = document.getElementById('picture-upload');
const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editProfileSection = document.getElementById('edit-profile-section');
const listsSection = document.getElementById('lists-section');
const headerIframe = document.getElementById('site-header');

const viewTicketsBtn = document.getElementById('view-tickets-btn');
const ticketsSection = document.getElementById('tickets-section');

// Função para atualizar dados locais e no header
function updateProfileData(photoUrl, name, email, phone) {
    localStorage.setItem('profilePhotoUrl', photoUrl);
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileEmail', email);
    localStorage.setItem('profilePhone', phone);

    if (headerIframe && headerIframe.contentWindow) {
        headerIframe.contentWindow.postMessage({
            action: 'UPDATE_PROFILE_INFO',
            newName: name,
            newEmail: email,
            newPicUrl: photoUrl
        }, '*');
    }
}

// Função para carregar dados do backend usando userId
async function loadProfileData() {
    const userId = localStorage.getItem('userId'); // 🔹 Pega o ID salvo no login
    if (!userId) {
        alert("❌ Usuário não logado. Redirecionando para login...");
        window.location.href = "/frontend/login/login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do usuário");

        const data = await response.json();

        // Atualizar na tela
        profileNameDisplay.textContent = data.nome_completo || "Cliente Rolês";
        profileEmailDisplay.textContent = data.email || "exemplo@roles.com";
        profilePhoneDisplay.textContent = data.telefone || "(62) 00000-0000";
        profilePicture.src = data.foto_perfil || "https://i.imgur.com/default-placeholder.png";

        // Atualizar inputs do formulário
        inputNome.value = data.nome_completo || "";
        inputEmail.value = data.email || "";
        inputTelefone.value = data.telefone || "";

        // Atualizar localStorage
        updateProfileData(profilePicture.src, inputNome.value, inputEmail.value, inputTelefone.value);

    } catch (err) {
        console.error(err);
        alert("❌ Não foi possível carregar os dados do perfil. Verifique o backend.");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadProfileData();

    editProfileBtn.addEventListener('click', function () {
        const isEditing = editProfileSection.classList.toggle('hidden');
        listsSection.classList.toggle('hidden', !isEditing);
        editProfileBtn.textContent = isEditing ? 'Cancelar Edição' : 'Editar Perfil';
    });

    cancelEditBtn.addEventListener('click', function () {
        editProfileSection.classList.add('hidden');
        listsSection.classList.remove('hidden');
        editProfileBtn.textContent = 'Editar Perfil';
    });

    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function () {
        localStorage.clear();
        if (headerIframe && headerIframe.contentWindow) {
            headerIframe.contentWindow.postMessage({ action: 'LOGOUT_REQUEST' }, '*');
        }
        window.location.href = '/frontend/login/logoutUsuario.html';
    });

    editPictureBtn.addEventListener('click', function () {
        pictureUploadInput.click();
    });

    pictureUploadInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePicture.src = e.target.result;
                updateProfileData(e.target.result, inputNome.value, inputEmail.value, inputTelefone.value);
            }
            reader.readAsDataURL(file);
        }
    });

    editProfileForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const novoNome = inputNome.value.trim();
        const novoEmail = inputEmail.value.trim();
        const novoTelefone = inputTelefone.value.trim();

        if (!novoNome || !novoEmail) {
            alert('⚠️ Nome e Email são obrigatórios!');
            return;
        }

        const userId = localStorage.getItem('userId');

        try {
            const response = await fetch(`http://localhost:3000/usuarios/perfil`, { // 🔹 Endpoint que aceita PUT
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId, // 🔹 Adicionado para garantir que o backend saiba qual atualizar
                    nome_completo: novoNome,
                    email: novoEmail,
                    telefone: novoTelefone,
                    foto_perfil: profilePicture.src
                })
            });

            if (!response.ok) throw new Error("Erro ao atualizar perfil");

            updateProfileData(profilePicture.src, novoNome, novoEmail, novoTelefone);
            alert("✅ Perfil atualizado com sucesso!");
            loadProfileData();
            editProfileSection.classList.add('hidden');
            listsSection.classList.remove('hidden');
            editProfileBtn.textContent = 'Editar Perfil';

        } catch (err) {
            console.error(err);
            alert("❌ Falha ao atualizar perfil. Verifique o backend.");
        }
    });

    viewTicketsBtn.addEventListener('click', function () {
        ticketsSection.classList.toggle('hidden');
        ticketsSection.scrollIntoView({ behavior: "smooth" });
    });
});


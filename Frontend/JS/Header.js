
// Seleciona os containers de menu
const menuCliente = document.getElementById('menu-cliente');
const menuEmpresario = document.getElementById('menu-empresario');

// ----------------------------------------------------
// FUNÇÃO: CARREGA DADOS SALVOS DO LOCALSTORAGE (CRÍTICO)
// ----------------------------------------------------
function loadPersistentData() {
    // 🔑 Lê os dados salvos (agora salvos no login)
    const photoUrl = localStorage.getItem('profilePhotoUrl');
    const name = localStorage.getItem('profileName');
    const email = localStorage.getItem('profileEmail');

    const headerPicElement = document.getElementById('profile-pic-header');
    const dropdownName = document.querySelector('.dropdown-menu .user-info strong');
    const dropdownEmail = document.querySelector('.dropdown-menu .user-info span');

    // Atualiza Foto
    if (photoUrl && headerPicElement) {
        headerPicElement.src = photoUrl;
    } else if (headerPicElement) {
        // Placeholder padrão
        headerPicElement.src = "https://i.imgur.com/default-placeholder.png";
    }

    // 💡 Atualiza Nome 
    if (name && dropdownName) {
        dropdownName.textContent = name;
    } else if (dropdownName) {
        dropdownName.textContent = 'Visitante'; // Fallback
    }

    // 💡 Atualiza Email
    if (email && dropdownEmail) {
        dropdownEmail.textContent = email;
    } else if (dropdownEmail) {
        dropdownEmail.textContent = 'email@padrao.com'; // Fallback
    }
}

// ----------------------------------------------------
// FUNÇÃO LÓGICA DE LOGOUT 
// ----------------------------------------------------
function setupLogoutListener() {
    const logoutBtn = document.querySelector('.logout-btn');

    if (logoutBtn && !logoutBtn.dataset.listenerAdded) {

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const userType = localStorage.getItem('userType');

            // Limpa as chaves de persistência
            localStorage.removeItem('userIsLoggedIn');
            localStorage.removeItem('userType');
            localStorage.removeItem('profilePhotoUrl');
            localStorage.removeItem('profileName');
            localStorage.removeItem('profileEmail');

            // ❌ REMOVIDO: alert('Logout realizado com sucesso!');

            let logoutPath;
            if (userType === 'empresario') {
                logoutPath = '/frontend/login/logoutEmpresario.html';
            } else {
                logoutPath = '/frontend/login/logoutUsuario.html';
            }

            alternarEstadoHeader(false, 'cliente');

            // Redireciona a página principal (o pai do iframe)
            window.parent.location.href = logoutPath;
        });

        logoutBtn.dataset.listenerAdded = 'true';
    }
}


// FUNÇÃO PRINCIPAL: Controla o estado, o menu e os links de Perfil (MANTIDA)
function alternarEstadoHeader(logado, userType = 'cliente') {
    const naoLogado = document.getElementById('header-nao-logado');
    const logadoDiv = document.getElementById('header-logado');
    const editProfileLink = document.getElementById('edit-profile-link');

    if (logado) {
        naoLogado.style.display = 'none';
        logadoDiv.style.display = 'flex';

        if (userType === 'empresario') {
            menuCliente.style.display = 'none';
            menuEmpresario.style.display = 'flex';
        } else {
            menuCliente.style.display = 'flex';
            menuEmpresario.style.display = 'none';
        }

        if (editProfileLink) {
            if (userType === 'empresario') {
                // Link correto para o perfil do empresário
                editProfileLink.href = '/frontend/perfilEmpresario/perfilEmpresario.html';
            } else {
                // Link correto para o perfil do usuário
                editProfileLink.href = '/frontend/perfilUsuario/perfilUsuario.html';
            }
        }

        setupLogoutListener();

    } else {
        naoLogado.style.display = 'flex';
        logadoDiv.style.display = 'none';

        menuCliente.style.display = 'flex';
        menuEmpresario.style.display = 'none';
    }
}

// ----------------------------------------------------
// VERIFICAÇÃO INICIAL (MANTIDA)
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadPersistentData();

    const isLogged = localStorage.getItem('userIsLoggedIn');
    const userType = localStorage.getItem('userType') || 'cliente';

    if (isLogged === 'true') {
        alternarEstadoHeader(true, userType);
    } else {
        alternarEstadoHeader(false, userType);
    }
});

// ----------------------------------------------------
// LÓGICA DO DROPDOWN (AVATAR) (MANTIDA)
// ----------------------------------------------------
const profileContainer = document.querySelector('.user-profile-container');
if (profileContainer) {
    profileContainer.addEventListener('click', () => {
        profileContainer.classList.toggle('active');
    });
}

// ----------------------------------------------------
// COMUNICAÇÃO COM O IFRAME (postMessage) - RECEBE ATUALIZAÇÕES
// ----------------------------------------------------
window.addEventListener('message', (event) => {
    const data = event.data;
    const headerPic = document.getElementById('profile-pic-header');
    const dropdownName = document.querySelector('.dropdown-menu .user-info strong');
    const dropdownEmail = document.querySelector('.dropdown-menu .user-info span');

    // Ação de login de empresário vinda do cadastro_empresario.html (MANTIDA)
    if (data && data.action === 'LOGIN_SUCCESS_EMPRESARIO') {
        alternarEstadoHeader(true, 'empresario');
        loadPersistentData();
    }
    // 💡 NOVO: Ação de login de usuário vinda do login.html
    else if (data && data.action === 'LOGIN_SUCCESS') {
        const userType = data.userType || 'cliente';

        // 🔑 Salva os dados frescos (Nome Padrão e Email real) do login no localStorage
        if (data.newName) localStorage.setItem('profileName', data.newName);
        if (data.newEmail) localStorage.setItem('profileEmail', data.newEmail);

        alternarEstadoHeader(true, userType);
        loadPersistentData(); // Recarrega com os novos dados
    }

    // Recebe a atualização de FOTO + INFO (do perfil) (MANTIDA)
    else if (data && data.action === 'UPDATE_PROFILE_INFO' && data.newPicUrl) {

        if (headerPic) headerPic.src = data.newPicUrl;
        if (data.newName && dropdownName) dropdownName.textContent = data.newName;
        if (data.newEmail && dropdownEmail) dropdownEmail.textContent = data.newEmail;

        localStorage.setItem('profilePhotoUrl', data.newPicUrl);
    }

    // Recebe atualização de NOME e EMAIL (do botão Salvar) (MANTIDA)
    else if (data && data.action === 'UPDATE_PROFILE_INFO' && data.newName && data.newEmail) {

        if (dropdownName) dropdownName.textContent = data.newName;
        if (dropdownEmail) dropdownEmail.textContent = data.newEmail;

        localStorage.setItem('profileName', data.newName);
        localStorage.setItem('profileEmail', data.newEmail);
    }

    // Recebe o comando de logout (MANTIDA)
    else if (data && data.action === 'LOGOUT_REQUEST') {

        localStorage.removeItem('profilePhotoUrl');
        localStorage.removeItem('profileName');
        localStorage.removeItem('profileEmail');
        localStorage.removeItem('userIsLoggedIn');
        localStorage.removeItem('userType');

        alternarEstadoHeader(false, 'cliente');
    }
});

const openLoginBtn = document.getElementById("openLogin");

if (openLoginBtn) {
    openLoginBtn.addEventListener("click", (e) => {

        e.preventDefault();

        window.parent.postMessage("OPEN_LOGIN_MODAL", "*");

    });
}


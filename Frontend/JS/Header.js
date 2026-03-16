// ----------------------------------------------------
// HEADER.JS COMPLETO ATUALIZADO
// Mantém toda a lógica original, apenas adaptado para funcionar após fetch
// ----------------------------------------------------

// Função principal para inicializar o header
function initHeader() {

    // Seleciona os containers de menu **depois que o DOM do header existe**
    const menuCliente = document.getElementById('menu-cliente');
    const menuEmpresario = document.getElementById('menu-empresario');

    // ----------------------------------------------------
    // FUNÇÃO: CARREGA DADOS SALVOS DO LOCALSTORAGE
    // ----------------------------------------------------
    function loadPersistentData() {
        const photoUrl = localStorage.getItem('profilePhotoUrl');
        const name = localStorage.getItem('profileName');
        const email = localStorage.getItem('profileEmail');

        const headerPicElement = document.getElementById('profile-pic-header');
        const dropdownName = document.querySelector('.dropdown-menu .user-info strong');
        const dropdownEmail = document.querySelector('.dropdown-menu .user-info span');

        if (headerPicElement) headerPicElement.src = photoUrl || "https://i.imgur.com/default-placeholder.png";
        if (dropdownName) dropdownName.textContent = name || 'Visitante';
        if (dropdownEmail) dropdownEmail.textContent = email || 'email@padrao.com';
    }

    // ----------------------------------------------------
    // FUNÇÃO LÓGICA DE LOGOUT
    // ----------------------------------------------------
    function setupLogoutListener() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (!logoutBtn || logoutBtn.dataset.listenerAdded) return;

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const userType = localStorage.getItem('userType');

            // Limpa todos os dados de persistência
            localStorage.removeItem('userIsLoggedIn');
            localStorage.removeItem('userType');
            localStorage.removeItem('profilePhotoUrl');
            localStorage.removeItem('profileName');
            localStorage.removeItem('profileEmail');

            // Atualiza visual do header
            alternarEstadoHeader(false, 'cliente');

            // Redireciona para a página de logout correta
            const logoutPath = userType === 'empresario' ?
                '/frontend/login/logoutEmpresario.html' :
                '/frontend/login/logoutUsuario.html';

            window.parent.location.href = logoutPath;
        });

        logoutBtn.dataset.listenerAdded = 'true';
    }

    // ----------------------------------------------------
    // FUNÇÃO PRINCIPAL: ALTERA ESTADO DO HEADER (LOGADO / NÃO LOGADO)
    // ----------------------------------------------------
    function alternarEstadoHeader(logado, userType = 'cliente') {
        const naoLogado = document.getElementById('header-nao-logado');
        const logadoDiv = document.getElementById('header-logado');
        const editProfileLink = document.getElementById('edit-profile-link');

        if (!naoLogado || !logadoDiv) return; // segurança

        if (logado) {
            naoLogado.style.display = 'none';
            logadoDiv.style.display = 'flex';

            if (menuCliente && menuEmpresario) {
                menuCliente.style.display = userType === 'empresario' ? 'none' : 'flex';
                menuEmpresario.style.display = userType === 'empresario' ? 'flex' : 'none';
            }

            if (editProfileLink) {
                editProfileLink.href = userType === 'empresario' ?
                    '/frontend/perfilEmpresario/perfilEmpresario.html' :
                    '/frontend/perfilUsuario/perfilUsuario.html';
            }

            setupLogoutListener();

        } else {
            naoLogado.style.display = 'flex';
            logadoDiv.style.display = 'none';

            if (menuCliente && menuEmpresario) {
                menuCliente.style.display = 'flex';
                menuEmpresario.style.display = 'none';
            }
        }
    }

    // ----------------------------------------------------
    // VERIFICAÇÃO INICIAL AO CARREGAR
    // ----------------------------------------------------
    loadPersistentData();
    const isLogged = localStorage.getItem('userIsLoggedIn') === 'true';
    const userType = localStorage.getItem('userType') || 'cliente';
    alternarEstadoHeader(isLogged, userType);

    // ----------------------------------------------------
    // LÓGICA DO DROPDOWN (AVATAR)
    // ----------------------------------------------------
    const profileContainer = document.querySelector('.user-profile-container');
    if (profileContainer) {
        profileContainer.addEventListener('click', () => {
            profileContainer.classList.toggle('active');
        });
    }

    // ----------------------------------------------------
    // BOTÃO ABRIR LOGIN
    // ----------------------------------------------------
    const openLoginBtn = document.getElementById("openLogin");
    if (openLoginBtn) {
        openLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.parent.postMessage("OPEN_LOGIN_MODAL", "*");
        });
    }

    // ----------------------------------------------------
    // RECEBE MENSAGENS POSTMESSAGE (LOGIN, LOGOUT, UPDATE)
    // ----------------------------------------------------
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data) return;

        if (data.action === 'LOGIN_SUCCESS_EMPRESARIO') {
            alternarEstadoHeader(true, 'empresario');
            loadPersistentData();
        } else if (data.action === 'LOGIN_SUCCESS') {
            const userType = data.userType || 'cliente';
            if (data.newName) localStorage.setItem('profileName', data.newName);
            if (data.newEmail) localStorage.setItem('profileEmail', data.newEmail);
            alternarEstadoHeader(true, userType);
            loadPersistentData();
        } else if (data.action === 'UPDATE_PROFILE_INFO') {
            if (data.newPicUrl) document.getElementById('profile-pic-header').src = data.newPicUrl;
            if (data.newName) document.querySelector('.dropdown-menu .user-info strong').textContent = data.newName;
            if (data.newEmail) document.querySelector('.dropdown-menu .user-info span').textContent = data.newEmail;

            if (data.newPicUrl) localStorage.setItem('profilePhotoUrl', data.newPicUrl);
            if (data.newName) localStorage.setItem('profileName', data.newName);
            if (data.newEmail) localStorage.setItem('profileEmail', data.newEmail);
        } else if (data.action === 'LOGOUT_REQUEST') {
            localStorage.removeItem('userIsLoggedIn');
            localStorage.removeItem('userType');
            localStorage.removeItem('profilePhotoUrl');
            localStorage.removeItem('profileName');
            localStorage.removeItem('profileEmail');
            alternarEstadoHeader(false, 'cliente');
        }
    });
}

// ----------------------------------------------------
// AGUARDA O HEADER SER CARREGADO PELO FETCH
// ----------------------------------------------------
const headerContainerCheck = setInterval(() => {
    if (document.getElementById('header-container')?.children.length > 0) {
        initHeader();
        clearInterval(headerContainerCheck);
    }
}, 50);


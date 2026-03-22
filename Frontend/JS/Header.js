// ====================================================
// INICIALIZAÇÃO SEGURA DO HEADER
// ====================================================

function initHeader() {

    console.log("Header inicializado");

// Seleciona os containers de menu
const menuCliente = document.getElementById('menu-cliente');
const menuEmpresario = document.getElementById('menu-empresario');

// ----------------------------------------------------
// FUNÇÃO: CARREGA DADOS SALVOS DO LOCALSTORAGE
// ----------------------------------------------------

function loadPersistentData() {

    const photoUrl = localStorage.getItem('profilePhotoUrl');
    const name = localStorage.getItem('profileName');
    const email = localStorage.getItem('profileEmail');

    const headerPicElement =
        document.getElementById('profile-pic-header');

    const dropdownName =
        document.querySelector('.dropdown-menu .user-info strong');

    const dropdownEmail =
        document.querySelector('.dropdown-menu .user-info span');

    if (photoUrl && headerPicElement) {
        headerPicElement.src = photoUrl;
    }

    if (name && dropdownName) {
        dropdownName.textContent = name;
    }

    if (email && dropdownEmail) {
        dropdownEmail.textContent = email;
    }

}

// ----------------------------------------------------
// LOGOUT
// ----------------------------------------------------

function setupLogoutListener() {

    const logoutBtn =
        document.querySelector('.logout-btn');

    if (logoutBtn &&
        !logoutBtn.dataset.listenerAdded) {

        logoutBtn.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                const userType =
                    localStorage.getItem('userType');

                localStorage.removeItem(
                    'userIsLoggedIn'
                );

                localStorage.removeItem(
                    'userType'
                );

                localStorage.removeItem(
                    'profilePhotoUrl'
                );

                localStorage.removeItem(
                    'profileName'
                );

                localStorage.removeItem(
                    'profileEmail'
                );

                let logoutPath;

                if (userType === 'empresario') {

                    logoutPath =
                        '/frontend/login/logoutEmpresario.html';

                } else {

                    logoutPath =
                        '/frontend/login/logoutUsuario.html';

                }

                alternarEstadoHeader(
                    false,
                    'cliente'
                );

                window.parent.location.href =
                    logoutPath;

            }
        );

        logoutBtn.dataset.listenerAdded =
            'true';

    }

}

// ----------------------------------------------------
// ESTADO DO HEADER
// ----------------------------------------------------

function alternarEstadoHeader(
    logado,
    userType = 'cliente'
) {

    const naoLogado =
        document.getElementById(
            'header-nao-logado'
        );

    const logadoDiv =
        document.getElementById(
            'header-logado'
        );

    const editProfileLink =
        document.getElementById(
            'edit-profile-link'
        );

    if (!naoLogado || !logadoDiv)
        return;

    if (logado) {

        naoLogado.style.display =
            'none';

        logadoDiv.style.display =
            'flex';

        if (menuCliente &&
            menuEmpresario) {

            if (userType ===
                'empresario') {

                menuCliente.style.display =
                    'none';

                menuEmpresario.style.display =
                    'flex';

            } else {

                menuCliente.style.display =
                    'flex';

                menuEmpresario.style.display =
                    'none';

            }

        }

        if (editProfileLink) {

            if (userType ===
                'empresario') {

                editProfileLink.href =
                    '/frontend/perfilEmpresario/perfilEmpresario.html';

            } else {

                editProfileLink.href =
                    '/frontend/perfilUsuario/perfilUsuario.html';

            }

        }

        setupLogoutListener();

    } else {

        naoLogado.style.display =
            'flex';

        logadoDiv.style.display =
            'none';

        if (menuCliente &&
            menuEmpresario) {

            menuCliente.style.display =
                'flex';

            menuEmpresario.style.display =
                'none';

        }

    }

}

// ----------------------------------------------------
// VERIFICA LOGIN
// ----------------------------------------------------

loadPersistentData();

const isLogged =
    localStorage.getItem(
        'userIsLoggedIn'
    );

const userType =
    localStorage.getItem(
        'userType'
    ) || 'cliente';

if (isLogged === 'true') {

    alternarEstadoHeader(
        true,
        userType
    );

} else {

    alternarEstadoHeader(
        false,
        userType
    );

}

// ----------------------------------------------------
// DROPDOWN PERFIL
// ----------------------------------------------------

const profileContainer =
    document.querySelector(
        '.user-profile-container'
    );

if (profileContainer) {

    profileContainer.addEventListener(
        'click',
        () => {

            profileContainer.classList.toggle(
                'active'
            );

        }
    );

}

// ----------------------------------------------------
// BOTÃO LOGIN
// ----------------------------------------------------

const openLoginBtn =
    document.getElementById(
        "openLogin"
    );

if (openLoginBtn) {

    openLoginBtn.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            window.parent.postMessage(
                "OPEN_LOGIN_MODAL",
                "*"
            );

        }
    );

}

// ====================================================
// CARD DE CIDADE
// ====================================================

const cityBtn =
    document.querySelector(
        ".city-btn"
    );

const cityCard =
    document.getElementById(
        "city-card"
    );

const overlay =
    document.getElementById(
        "city-overlay"
    );

const closeCard =
    document.getElementById(
        "close-card"
    );

const citySearch =
    document.getElementById(
        "city-search"
    );

const useLocation =
    document.getElementById(
        "use-location"
    );

const cityItems =
    document.querySelectorAll(
        ".city-list li"
    );

// ABRIR CARD

if (cityBtn &&
    cityCard &&
    overlay) {

    cityBtn.addEventListener(
        "click",
        () => {

            cityCard.style.display =
                "block";

            overlay.style.display =
                "block";

        }
    );

}

// FECHAR CARD

function fecharCard() {

    if (cityCard)
        cityCard.style.display =
            "none";

    if (overlay)
        overlay.style.display =
            "none";

}

if (closeCard)
    closeCard.addEventListener(
        "click",
        fecharCard
    );

if (overlay)
    overlay.addEventListener(
        "click",
        fecharCard
    );

// CLICAR NA CIDADE

cityItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                const cityName =
                    item.dataset.city;

                if (cityBtn) {

                    cityBtn.innerHTML =
                        `<i class="fas fa-map-marker-alt"></i> ${cityName}`;

                }

                localStorage.setItem(
                    "cidade",
                    cityName
                );

                fecharCard();

            }
        );

    }
);

// CARREGAR CIDADE SALVA

const savedCity =
    localStorage.getItem(
        "cidade"
    );

if (savedCity &&
    cityBtn) {

    cityBtn.innerHTML =
        `<i class="fas fa-map-marker-alt"></i> ${savedCity}`;

}

// BUSCAR CIDADE

if (citySearch) {

    citySearch.addEventListener(
        "input",
        () => {

            const value =
                citySearch.value.toLowerCase();

            cityItems.forEach(
                item => {

                    const city =
                        item.dataset.city.toLowerCase();

                    if (
                        city.includes(
                            value
                        )
                    ) {

                        item.style.display =
                            "flex";

                    } else {

                        item.style.display =
                            "none";

                    }

                }
            );

        }
    );

}

// USAR LOCALIZAÇÃO

if (useLocation) {

    useLocation.addEventListener(
        "click",
        () => {

            if (
                navigator.geolocation
            ) {

                navigator.geolocation.getCurrentPosition(
                    () => {

                        const cityName =
                            "Minha localização";

                        if (cityBtn) {

                            cityBtn.innerHTML =
                                `<i class="fas fa-map-marker-alt"></i> ${cityName}`;

                        }

                        localStorage.setItem(
                            "cidade",
                            cityName
                        );

                        fecharCard();

                    }
                );

            }

        }
    );

}

// GARANTE QUE O CARD FIQUE NO BODY

if (cityCard)
    document.body.appendChild(
        cityCard
    );

if (overlay)
    document.body.appendChild(
        overlay
    );

}

// ====================================================
// EXECUÇÃO SEGURA
// ====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initHeader
    );

} else {

    initHeader();

}

// ====================================================
// REDIRECIONAMENTOS DO DROPDOWN
// ====================================================

function setupDropdownNavigation() {

    const userType =
        localStorage.getItem("userType");

    /* MINHA CONTA */

    const minhaConta =
        document.getElementById("minha-conta");

    if (minhaConta) {

        minhaConta.addEventListener("click", () => {

            if (userType === "empresario") {

                window.location.href =
                    "/Frontend/perfilEmpresario/perfilEmpresario.html";

            } else {

                window.location.href =
                    "/Frontend/perfilUsuario/perfilUsuario.html";

            }

        });

    }

    /* FAVORITOS */

    const favoritos =
        document.getElementById("favoritos");

    if (favoritos) {

        favoritos.addEventListener("click", () => {

            window.location.href =
                "/Frontend/favoritos/favoritos.html";

        });

    }

    /* CRIAR EVENTOS */

    const criarEventos =
        document.getElementById("criar-eventos");

    if (criarEventos) {

        criarEventos.addEventListener("click", () => {

            window.location.href =
                "/Frontend/eventos/criarEvento.html";

        });

    }

    /* CADASTRAR ESTABELECIMENTO */

    const cadastrarEstabelecimento =
        document.getElementById("cadastrar-estabelecimento");

    if (cadastrarEstabelecimento) {

        cadastrarEstabelecimento.addEventListener("click", () => {

            window.location.href =
                "/Frontend/cadastroEstabelecimento/cadastro.html";

        });

    }

    /* DASHBOARD */

    const dashboard =
        document.getElementById("dashboard");

    if (dashboard) {

        dashboard.addEventListener("click", () => {

            window.location.href =
                "/Frontend/dashboardEmpresario/dashboard.html";

        });

    }

}
"use strict";

function initHeader() {
    console.log("Header inicializado");

    // -------------------------------
    // CARREGAR DADOS DO LOCALSTORAGE
    // -------------------------------
    function loadPersistentData() {
        const photoUrl = localStorage.getItem('profilePhotoUrl');
        const name = localStorage.getItem('profileName');
        const email = localStorage.getItem('profileEmail');

        const headerPicElement = document.getElementById('profile-pic-header');
        const dropdownName = document.querySelector('.dropdown-menu .user-info strong');
        const dropdownEmail = document.querySelector('.dropdown-menu .user-info span');

        if (photoUrl && headerPicElement) headerPicElement.src = photoUrl;
        if (name && dropdownName) dropdownName.textContent = name;
        if (email && dropdownEmail) dropdownEmail.textContent = email;
    }

    loadPersistentData();

    // -------------------------------
    // ESTADO LOGADO / NÃO LOGADO
    // -------------------------------
    function alternarEstadoHeader(logado) {
        const naoLogado = document.getElementById('header-nao-logado');
        const logadoDiv = document.getElementById('header-logado');
        const hamburgerMenu = document.getElementById('hamburger-btn'); // correção aqui
        const userOptions = document.querySelector('.user-options'); // menu que abre com hamburger

        if (!naoLogado || !logadoDiv || !hamburgerMenu) return;

        if (logado) {
            naoLogado.style.display = 'none';
            logadoDiv.style.display = 'flex';
            hamburgerMenu.style.display = 'flex'; // mostra apenas se logado

            // Configura hamburger
            if (userOptions) {
                hamburgerMenu.addEventListener("click", (e) => {
                    e.stopPropagation();
                    userOptions.classList.toggle("active");
                    hamburgerMenu.classList.toggle("active");
                });

                document.addEventListener("click", (e) => {
                    if (!userOptions.contains(e.target) && e.target !== hamburgerMenu) {
                        userOptions.classList.remove("active");
                        hamburgerMenu.classList.remove("active");
                    }
                });
            }

            setupLogoutListener();
        } else {
            naoLogado.style.display = 'flex';
            logadoDiv.style.display = 'none';
            hamburgerMenu.style.display = 'none'; // esconde se não logado
        }
    }

    const isLogged = localStorage.getItem('userIsLoggedIn');
    alternarEstadoHeader(isLogged === 'true');

    // -------------------------------
    // LOGOUT
    // -------------------------------
    function setupLogoutListener() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn && !logoutBtn.dataset.listenerAdded) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userIsLoggedIn');
                localStorage.removeItem('profilePhotoUrl');
                localStorage.removeItem('profileName');
                localStorage.removeItem('profileEmail');
                alternarEstadoHeader(false);
                window.location.href = "../login/login.html";
            });
            logoutBtn.dataset.listenerAdded = 'true';
        }
    }

    // -------------------------------
    // DROPDOWN PERFIL
    // -------------------------------
    const profileContainer = document.querySelector('.user-profile-container');
    if (profileContainer) {
        profileContainer.addEventListener('click', () => {
            profileContainer.classList.toggle('active');
        });
    }

    // -------------------------------
    // BOTÃO LOGIN (MODAL OU PÁGINA)
    // -------------------------------
    const openLoginBtn = document.getElementById("openLogin");
    if (openLoginBtn) {
        // remove listeners duplicados
        openLoginBtn.replaceWith(openLoginBtn.cloneNode(true));
        const newOpenLoginBtn = document.getElementById("openLogin");
        newOpenLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const isHome = window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/");

            if (isHome) {
                // Home -> abre modal
                window.postMessage("OPEN_LOGIN_MODAL", "*");
            } else {
                // Outras páginas -> vai para login.html
                window.location.href = "../login/login.html";
            }
        });
    }

    // -------------------------------
    // CARD DE CIDADE
    // -------------------------------
    const cityBtn = document.querySelector(".city-btn");
    const cityCard = document.getElementById("city-card");
    const overlay = document.getElementById("city-overlay");
    const closeCard = document.getElementById("close-card");
    const citySearch = document.getElementById("city-search");
    const useLocation = document.getElementById("use-location");
    const cityItems = document.querySelectorAll(".city-list li");

    function abrirCard() {
        if (cityCard && overlay) {
            cityCard.style.display = "block";
            overlay.style.display = "block";
        }
    }

    function fecharCard() {
        if (cityCard) cityCard.style.display = "none";
        if (overlay) overlay.style.display = "none";
    }

    if (cityBtn) cityBtn.addEventListener("click", abrirCard);
    if (closeCard) closeCard.addEventListener("click", fecharCard);
    if (overlay) overlay.addEventListener("click", fecharCard);

    cityItems.forEach(item => {
        item.addEventListener("click", () => {
            const cityName = item.dataset.city;
            if (cityBtn) cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${cityName}`;
            localStorage.setItem("cidade", cityName);
            fecharCard();
        });
    });

    const savedCity = localStorage.getItem("cidade");
    if (savedCity && cityBtn) {
        cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${savedCity}`;
    }

    if (citySearch) {
        citySearch.addEventListener("input", () => {
            const value = citySearch.value.toLowerCase();
            cityItems.forEach(item => {
                const city = item.dataset.city.toLowerCase();
                item.style.display = city.includes(value) ? "flex" : "none";
            });
        });
    }

    if (useLocation) {
        useLocation.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(() => {
                    const cityName = "Minha localização";
                    if (cityBtn) cityBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${cityName}`;
                    localStorage.setItem("cidade", cityName);
                    fecharCard();
                });
            }
        });
    }

    // -------------------------------
    // GARANTIR QUE O CARD ESTEJA NO BODY
    // -------------------------------
    if (cityCard) document.body.appendChild(cityCard);
    if (overlay) document.body.appendChild(overlay);

    // -------------------------------
    // REDIRECIONAMENTOS DO DROPDOWN
    // -------------------------------
    function setupDropdownNavigation() {
        const navMap = {
            "minha-conta": "/frontend/perfil/perfil.html",
            "favoritos": "../favoritos/favoritos.html",
            "criar-eventos": "/frontend/criareventos/criareventos.html",
            "cadastrar-estabelecimento": "/frontend/criareventos/craireventos.html",
            "dashboard": "/frontend/dashboard/dashboard.html",
            "contato": "/frontend/contato/contato.html",
            "logout": "/frontend/login/logout.html"
        };

        Object.keys(navMap).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("click", () => {
                    window.location.href = navMap[id];
                });
            }
        });

        // Central de ajuda
        const ajuda = document.querySelector(".dropdown-item[href*='contato']");
        if (ajuda) {
            ajuda.addEventListener("click", () => {
                window.location.href = "../Contato/contato.html";
            });
        }
    }

    setupDropdownNavigation();
}

// ====================================================
// EXECUÇÃO SEGURA
// ====================================================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader);
} else {
    initHeader();
}
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const userProfile = document.getElementById("header-logado");
  
  // Toggle menu dropdown quando clicar no avatar
  const profileAvatar = document.querySelector(".profile-avatar");

  if (profileAvatar) {
    profileAvatar.addEventListener("click", () => {
      userProfile.classList.toggle("active");
    });
  }

  // Toggle menu lateral (caso queira abrir um sidebar)
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
    });
  }

  // Fechar menu ao clicar fora
  document.addEventListener("click", (e) => {
    if (!userProfile.contains(e.target) && !profileAvatar.contains(e.target)) {
      userProfile.classList.remove("active");
    }
  });
});


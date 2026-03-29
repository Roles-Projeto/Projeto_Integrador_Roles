// header-loader.js
const headerHTML = `
<nav class="navbar">
    <div class="logo">
        <a href="/index.html">Rolês</a>
    </div>

    <div class="search-bar">
        <input type="text" id="searchInput" placeholder="Buscar eventos..." />
        <div class="divider"></div>
        <div class="city-dropdown">
            <button class="city-btn" id="cityBtn">
                <i class="fas fa-map-marker-alt"></i>
                <span id="selectedCity">Minha localização</span>
            </button>
            <ul class="city-menu" id="cityMenu">
                <li>Goiânia</li>
                <li>Aparecida de Goiânia</li>
                <li>Caldas Novas</li>
            </ul>
        </div>
        <button class="search-btn" onclick="buscar()">
            <img src="/Frontend/Imagens/lupa.png" alt="Buscar">
        </button>
    </div>

    <div class="right-section">
        <div class="event-actions">
            <button class="action-btn">Criar evento</button>
            <button class="action-btn">Meus ingressos</button>
        </div>

        <div id="header-nao-logado" class="user-action-btns">
            <a href="/login/login.html" class="login" id="openLogin">Entrar</a>
        </div>

        <button id="hamburger-btn" class="hamburger-btn">
            <i class="fas fa-bars"></i>
        </button>

        <div id="header-logado" class="user-profile-container" style="display:none;">
            <div class="profile-avatar">
                <img id="profile-pic-header" src="https://i.imgur.com/default-placeholder.png" alt="Foto de Perfil" class="avatar-img">
            </div>
            <div class="dropdown-menu">
                <div class="user-info">
                    <img src="https://i.imgur.com/default-placeholder.png" alt="Foto de Perfil">
                    <div>
                        <strong id="profile-name-header">Nome do usuário</strong>
                        <span id="profile-email-header">email@email.com</span>
                    </div>
                </div>
                <hr>
                <a href="/perfil/perfil.html" id="minha-conta" class="dropdown-item"><i class="fas fa-user"></i>Minha conta</a>
                <a href="#" id="favoritos" class="dropdown-item"><i class="fas fa-heart"></i>Favoritos</a>
                <a href="/criareventos/criareventos.html" id="criar-eventos" class="dropdown-item"><i class="fas fa-calendar-plus"></i>Criar eventos</a>
                <a href="/criareventos/criareventos.html" id="cadastrar-estabelecimento" class="dropdown-item"><i class="fas fa-store"></i>Cadastrar estabelecimento</a>
                <a href="/dashboard/dashboard.html" id="dashboard" class="dropdown-item"><i class="fas fa-chart-line"></i>Dashboard</a>
                <hr>
                <a href="/Contato/contato.html" class="dropdown-item"><i class="fas fa-headset"></i>Central de ajuda</a>
                <hr>
                <a href="/login/logout.html" class="dropdown-item logout-btn"><i class="fas fa-sign-out-alt"></i>Sair</a>
            </div>
        </div>
    </div>
</nav>
`;

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("header-container");
    if (container) {
        container.innerHTML = headerHTML;
    }
});
// detalheslocais.js
// Busca os dados do estabelecimento direto da API pelo id na URL
// Ex: detalhesLocais.html?id=5

// ─── Pegar o ID da URL ─────────────────────────────────────────
function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// ─── URL da API ───────────────────────────────────────────────
const API_URL =
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:3000"
        : "https://projeto-integrador-roles.onrender.com";

// ─── Buscar dados da API ──────────────────────────────────────
async function fetchEstabelecimento(id) {
    try {
        const res = await fetch(`${API_URL}/estabelecimentos/${id}`);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Erro ao buscar estabelecimento:", err);
        return null;
    }
}

// ─── Atualizar página com dados ───────────────────────────────
function updatePage(data) {
    if (!data) {
        console.warn("Nenhum dado recebido.");
        return;
    }

    // ── Endereço ───────────────────────────────────────────────
    const enderecoExibicao = data.endereco
        || `${data.rua || ""}, ${data.numero || ""} — ${data.bairro || ""}, ${data.cidade || ""}/${data.estado || ""}`.trim();

    const enderecoMaps = data.endereco
        || `${data.rua}, ${data.numero}, ${data.bairro}, ${data.cidade}, ${data.estado}`;

    const nota = data.nota || "Novo";
    const avaliacoes = data.avaliacoes || 0;

    // ── Hero ───────────────────────────────────────────────────
    document.getElementById("page-title").textContent = data.nome || "Detalhes do Local";
    document.getElementById("local-name").textContent = data.nome || "—";
    document.getElementById("local-type").textContent = data.tipo || data.categoria_card || "—";
    document.getElementById("local-rating").textContent = `${nota} (${avaliacoes} avaliações)`;
    document.getElementById("hero-address").textContent = enderecoExibicao;

    const heroSection = document.getElementById("hero-section");
    if (heroSection && data.img_capa) {
        heroSection.style.backgroundImage = `url('${data.img_capa}')`;
        heroSection.style.backgroundSize = "cover";
        heroSection.style.backgroundPosition = "center";
    }

    // ── Descrição ──────────────────────────────────────────────
    document.getElementById("local-description").textContent =
        data.descricao || "Descrição não disponível.";

    document.getElementById("local-hours").textContent = data.horario || "—";
    document.getElementById("local-contact-phone").textContent = data.telefone || "—";

    // ── Tags ───────────────────────────────────────────────────
    const attributesContainer = document.getElementById("local-attributes");
    attributesContainer.innerHTML = "";

    [data.especialidade, data.tipo, data.categoria_card]
        .filter(t => t && t.trim().length > 0)
        .forEach(tag => {
            const span = document.createElement("span");
            span.textContent = tag;
            attributesContainer.appendChild(span);
        });

    // ── Comodidades ────────────────────────────────────────────
    if (data.comodidades) {
        const amenitiesMap = {
            "wifi": { icon: "fa-wifi", label: "Wi-Fi Grátis" },
            "wi-fi": { icon: "fa-wifi", label: "Wi-Fi Grátis" },
            "estacionamento": { icon: "fa-car", label: "Estacionamento" },
            "cartao": { icon: "fa-credit-card", label: "Aceita Cartão" },
            "cartão": { icon: "fa-credit-card", label: "Aceita Cartão" },
            "pet": { icon: "fa-paw", label: "Pet Friendly" },
            "acessibilidade": { icon: "fa-wheelchair", label: "Acessibilidade" },
            "ar condicionado": { icon: "fa-snowflake", label: "Ar Condicionado" },
        };

        const amenitiesList = document.querySelector(".amenities-list");
        if (amenitiesList) {
            amenitiesList.innerHTML = "";

            data.comodidades
                .split(",")
                .map(c => c.trim().toLowerCase())
                .filter(c => c.length > 0)
                .forEach(c => {
                    const match = amenitiesMap[c];

                    const div = document.createElement("div");
                    div.className = "amenity-item";
                    div.innerHTML = `<i class="fas ${match ? match.icon : "fa-check"}"></i> ${match ? match.label : c}`;

                    amenitiesList.appendChild(div);
                });
        }
    }

    // ── Sidebar ────────────────────────────────────────────────
    document.getElementById("sidebar-rating").innerHTML =
        `<i class="fas fa-star"></i> ${nota} (${avaliacoes})`;

    document.getElementById("sidebar-type").textContent =
        data.tipo || data.categoria_card || "—";

    document.getElementById("sidebar-price-symbol").textContent =
        data.faixa_preco || "—";

    document.getElementById("sidebar-hours").textContent =
        data.horario || "—";

    document.getElementById("sidebar-phone").textContent =
        data.telefone || "—";

    document.getElementById("sidebar-address").textContent =
        enderecoExibicao;

    // ── Info compacta ─────────────────────────────────────────
    document.getElementById("info-address").textContent = enderecoExibicao;
    document.getElementById("info-phone").textContent = data.telefone || "—";
    document.getElementById("info-hours").textContent = data.horario || "—";

    // ── Botão ligar ───────────────────────────────────────────
    const phoneDigits = (data.telefone || "").replace(/[^\d\+]/g, "");
    const btnLigar = document.getElementById("btn-ligar");

    if (btnLigar && phoneDigits) {
        btnLigar.href = `tel:${phoneDigits}`;
    }

    // ── Botão como chegar ─────────────────────────────────────
    const btnChegar = document.getElementById("btn-como-chegar");

    if (btnChegar) {
        btnChegar.addEventListener("click", () => {
            const destino = encodeURIComponent(enderecoMaps);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    ({ coords }) => {
                        const url = `https://www.google.com/maps/dir/?api=1&origin=${coords.latitude},${coords.longitude}&destination=${destino}&travelmode=driving`;
                        window.open(url, "_blank");
                    },
                    () => {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${destino}`, "_blank");
                    }
                );
            } else {
                window.open(`https://www.google.com/maps/search/?api=1&query=${destino}`, "_blank");
            }
        });
    }
}

// ─── Navegação entre abas ─────────────────────────────────────
function setupTabNavigation() {
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

            button.classList.add("active");

            const target = document.getElementById(button.getAttribute("data-tab"));
            if (target) target.classList.add("active");
        });
    });
}

// ─── Inicialização ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    const id = getIdFromUrl();

    if (!id) {
        console.error("ID não encontrado na URL.");
        return;
    }

    const data = await fetchEstabelecimento(id);

    updatePage(data);
    setupTabNavigation();
});
// detalheslocais.js

// --- Mapa de faixa de preço ---
const faixaPrecoMap = {
    "economico":   "$ — até R$ 30",
    "moderado":    "$$ — R$ 30 a R$ 80",
    "sofisticado": "$$$ — R$ 80 a R$ 150",
    "luxo":        "$$$$ — acima de R$ 150"
};

function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

const API_URL = window.API_BASE;

async function fetchEstabelecimento(id) {
    try {
        const res = await fetch(`${API_URL}/estabelecimentos/${id}`);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        const data = await res.json();

        // DEBUG: mostra todos os campos recebidos da API no console
        console.log("=== DADOS RECEBIDOS DA API ===", data);
        console.log("Campo horario:", data.horario);
        console.log("Campo horario_funcionamento:", data.horario_funcionamento);
        console.log("Todas as chaves:", Object.keys(data));

        return data;
    } catch (err) {
        console.error("Erro ao buscar estabelecimento:", err);
        return null;
    }
}

// --- Seta texto simples ---
const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
};

// --- Seta HTML (para suportar <br> nas quebras de linha) ---
const setElHTML = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
};

function formatarHorario(horario) {
    if (!horario) return "—";
    // Suporte a vírgula ou ponto-e-vírgula como separador
    return horario
        .split(/[,;]/)
        .map(h => h.trim())
        .filter(Boolean)
        .join("<br>");
}

function updatePage(data) {
    if (!data) {
        console.warn("Nenhum dado recebido.");
        return;
    }

    const enderecoExibicao = data.endereco
        || `${data.rua || ""}, ${data.numero || ""} — ${data.bairro || ""}, ${data.cidade || ""}/${data.estado || ""}`.trim();

    const enderecoMaps = data.endereco
        || `${data.rua}, ${data.numero}, ${data.bairro}, ${data.cidade}, ${data.estado}`;

    const nota = data.nota || "Novo";
    const avaliacoes = data.avaliacoes || 0;

    // Faixa de preço formatada
    const faixaPrecoDisplay = faixaPrecoMap[data.faixa_preco] || data.faixa_preco || "—";

    // Horário — tenta vários nomes de campo possíveis do banco
    const horarioBruto = data.horario
        || data.horario_funcionamento
        || data.horarios
        || data.hours
        || null;

    const horarioHTML = formatarHorario(horarioBruto);

    // --- Hero ---
    setEl("page-title", data.nome || "Detalhes do Local");
    setEl("local-name", data.nome || "—");
    setEl("local-type", data.tipo || data.categoria_card || "—");
    setEl("local-rating", `${nota} (${avaliacoes} avaliações)`);
    setEl("hero-address", enderecoExibicao);

    const heroSection = document.getElementById("hero-section");
    if (heroSection && data.img_capa) {
        heroSection.style.backgroundImage = `url('${data.img_capa}')`;
        heroSection.style.backgroundSize = "cover";
        heroSection.style.backgroundPosition = "center";
    }

    // --- Descrição ---
    setEl("local-description", data.descricao || "Descrição não disponível.");
    setEl("local-contact-phone", data.telefone || "—");

    // Horário usa innerHTML para suportar <br>
    setElHTML("local-hours", horarioHTML);

    // --- Tags ---
    const attributesContainer = document.getElementById("local-attributes");
    if (attributesContainer) {
        attributesContainer.innerHTML = "";
        [data.especialidade, data.tipo, data.categoria_card]
            .filter(t => t && t.trim().length > 0)
            .forEach(tag => {
                const span = document.createElement("span");
                span.textContent = tag;
                attributesContainer.appendChild(span);
            });
    }

    // --- Comodidades ---
    if (data.comodidades) {
        const amenitiesMap = {
            "wi-fi":             { icon: "fa-wifi",           label: "Wi-Fi Grátis" },
            "wifi":              { icon: "fa-wifi",           label: "Wi-Fi Grátis" },
            "estacionamento":    { icon: "fa-car",            label: "Estacionamento" },
            "acessibilidade":    { icon: "fa-wheelchair",     label: "Acessibilidade" },
            "pet friendly":      { icon: "fa-paw",            label: "Pet Friendly" },
            "delivery":          { icon: "fa-motorcycle",     label: "Delivery" },
            "música ao vivo":    { icon: "fa-music",          label: "Música ao Vivo" },
            "ar-condicionado":   { icon: "fa-snowflake",      label: "Ar-condicionado" },
            "aceita reservas":   { icon: "fa-calendar-check", label: "Aceita Reservas" },
            "pagamento digital": { icon: "fa-credit-card",    label: "Pagamento Digital" },
            "área externa":      { icon: "fa-umbrella-beach", label: "Área Externa" },
        };

        const amenitiesList = document.querySelector(".amenities-list");
        if (amenitiesList) {
            amenitiesList.innerHTML = "";
            data.comodidades.split(",").map(c => c.trim()).filter(Boolean).forEach(c => {
                const key = c.toLowerCase();
                const match = amenitiesMap[key];
                const div = document.createElement("div");
                div.className = "amenity-item";
                div.innerHTML = `<i class="fas ${match ? match.icon : "fa-check"}"></i> ${match ? match.label : c}`;
                amenitiesList.appendChild(div);
            });
        }
    }

    // --- Sidebar ---
    setEl("sidebar-rating", `⭐ ${nota} (${avaliacoes})`);
    setEl("sidebar-type", data.tipo || data.categoria_card || "—");
    setEl("sidebar-price-symbol", faixaPrecoDisplay);
    setElHTML("sidebar-hours", horarioHTML);
    setEl("sidebar-phone", data.telefone || "—");
    setEl("sidebar-address", enderecoExibicao);

    // --- Info compacta ---
    setEl("info-address", enderecoExibicao);
    setEl("info-phone", data.telefone || "—");
    setElHTML("info-hours", horarioHTML);

    // --- Botão ligar ---
    const phoneDigits = (data.telefone || "").replace(/[^\d\+]/g, "");
    const btnLigar = document.getElementById("btn-ligar");
    if (btnLigar && phoneDigits) btnLigar.href = `tel:${phoneDigits}`;

    // --- Botão como chegar ---
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
                    () => window.open(`https://www.google.com/maps/search/?api=1&query=${destino}`, "_blank")
                );
            } else {
                window.open(`https://www.google.com/maps/search/?api=1&query=${destino}`, "_blank");
            }
        });
    }
}

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

document.addEventListener("DOMContentLoaded", async () => {
    const id = getIdFromUrl();
    if (!id) { console.error("ID não encontrado na URL."); return; }
    const data = await fetchEstabelecimento(id);
    updatePage(data);
    setupTabNavigation();
});
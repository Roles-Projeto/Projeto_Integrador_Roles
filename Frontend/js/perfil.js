"use strict";

/* ═══════════════════════════════════════════════════════════
   CONFIG
   window.API_BASE é definido em /frontend/js/config.js
═══════════════════════════════════════════════════════════ */
const API_URL = window.API_BASE || "";

/* ═══════════════════════════════════════════════════════════
   ESTADO GLOBAL
═══════════════════════════════════════════════════════════ */
const state = {
    ticketsLoaded:   false,
    favoritosLoaded: false,
    visitasLoaded:   false,
    allTickets:      [],
    currentFilter:   "todos",
    transferId:      null,
};

/* ═══════════════════════════════════════════════════════════
   AVATAR PADRÃO
═══════════════════════════════════════════════════════════ */
const DEFAULT_AVATAR =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
    "width='40' height='40' viewBox='0 0 40 40'%3E" +
    "%3Ccircle cx='20' cy='20' r='20' fill='%23ccc'/%3E" +
    "%3Ccircle cx='20' cy='16' r='7' fill='%23fff'/%3E" +
    "%3Cellipse cx='20' cy='34' rx='12' ry='8' fill='%23fff'/%3E" +
    "%3C/svg%3E";

/* ═══════════════════════════════════════════════════════════
   UTILITÁRIOS
═══════════════════════════════════════════════════════════ */
const el  = (id) => document.getElementById(id);
const val = (id) => el(id)?.value.trim() || "";

function formatBRL(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/* ── Lê o userId do usuário logado ───────────────────────── */
function getUserId() {
    for (const key of ["userId", "id", "user_id", "usuarioId", "usuario_id"]) {
        const v = localStorage.getItem(key);
        if (v && v !== "undefined" && v !== "null") return v;
    }
    for (const key of ["user", "userData", "usuario", "loggedUser", "currentUser"]) {
        try {
            const obj = JSON.parse(localStorage.getItem(key) || "");
            const id  = obj?.id || obj?.userId || obj?.user_id;
            if (id) return String(id);
        } catch (_) {}
    }
    return null;
}

/* ── Limpa cache de perfil se o userId mudou ─────────────── */
function limparCacheSeUsuarioMudou(userId) {
    const cachedUserId = localStorage.getItem("cachedProfileUserId");
    if (cachedUserId && cachedUserId !== String(userId)) {
        localStorage.removeItem("profileName");
        localStorage.removeItem("profileEmail");
        localStorage.removeItem("profilePhotoUrl");
    }
    localStorage.setItem("cachedProfileUserId", String(userId));
}

/* ═══════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════ */
function updateHeader(name, email, photo) {
    const pic = photo && photo.length > 10 ? photo : DEFAULT_AVATAR;
    localStorage.setItem("profilePhotoUrl", pic);
    localStorage.setItem("profileName",     name  || "");
    localStorage.setItem("profileEmail",    email || "");
    applyHeaderData(name, email, pic);
}

function applyHeaderData(name, email, photo) {
    const picEl = el("profile-pic-header");
    if (picEl) { picEl.src = photo; picEl.onerror = () => { picEl.src = DEFAULT_AVATAR; }; }

    const dropImg = document.querySelector("#header-logado .user-info img");
    if (dropImg) { dropImg.src = photo; dropImg.onerror = () => { dropImg.src = DEFAULT_AVATAR; }; }

    const nameEl  = el("profile-name-header");
    const emailEl = el("profile-email-header");
    if (nameEl  && name)  nameEl.textContent  = name;
    if (emailEl && email) emailEl.textContent = email;

    const logado    = el("header-logado");
    const naoLogado = el("header-nao-logado");
    const hamburger = el("hamburger-btn");
    if (logado)    logado.style.display    = "flex";
    if (naoLogado) naoLogado.style.display = "none";
    if (hamburger) hamburger.style.display = "flex";
}

function waitForHeader(name, email, photo, tries = 0) {
    if (el("profile-pic-header")) { applyHeaderData(name, email, photo); return; }
    if (tries < 20) setTimeout(() => waitForHeader(name, email, photo, tries + 1), 150);
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
let _toastTimer;
function showToast(msg, type = "success") {
    const toast = el("toast");
    const icons = { success: "fa-check-circle", error: "fa-times-circle", warning: "fa-exclamation-circle" };
    el("toast-icon").className  = "fas " + (icons[type] || "fa-check-circle");
    el("toast-msg").textContent = msg;
    toast.className = `toast ${type} show`;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

/* ═══════════════════════════════════════════════════════════
   ESTADO DE SEÇÃO (loading | empty | list)
═══════════════════════════════════════════════════════════ */
function showSectionState(prefix, sectionState) {
    const loading = el(`${prefix}-loading`);
    const empty   = el(`${prefix}-empty`);
    const list    = el(`${prefix}-list`);
    if (loading) loading.style.display = sectionState === "loading" ? "flex" : "none";
    if (empty)   empty.style.display   = sectionState === "empty"   ? "flex" : "none";
    if (list) {
        list.style.display       = sectionState === "list" ? "flex" : "none";
        list.style.flexDirection = "column";
    }
}

/* ═══════════════════════════════════════════════════════════
   NAVEGAÇÃO LATERAL
═══════════════════════════════════════════════════════════ */
function activateSection(sectionId) {
    document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.remove("active"));
    document.querySelectorAll(".section-panel").forEach(p => p.classList.remove("active"));

    const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    const panel   = el(`section-${sectionId}`);
    if (navItem) navItem.classList.add("active");
    if (panel)   panel.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (sectionId === "ingressos" && !state.ticketsLoaded)   loadTickets();
    if (sectionId === "favoritos" && !state.favoritosLoaded) loadFavoritos();
    if (sectionId === "visitas"   && !state.visitasLoaded)   loadVisitas();
}

document.querySelectorAll(".nav-item[data-section]").forEach(item => {
    item.addEventListener("click", () => activateSection(item.dataset.section));
});

/* ═══════════════════════════════════════════════════════════
   VALIDAÇÃO
═══════════════════════════════════════════════════════════ */
const Validador = {
    nome:       (v) => v.trim().length >= 3,
    email:      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    telefone:   (v) => { const d = v.replace(/\D/g, ""); return !v || d.length === 10 || d.length === 11; },
    nascimento: (v) => {
        if (!v) return true;
        const minAge = new Date(); minAge.setFullYear(minAge.getFullYear() - 13);
        return new Date(v) <= minAge;
    },
    cpf: (cpf) => {
        const d = cpf.replace(/\D/g, "");
        if (!d) return true;
        if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
        let soma = 0, r;
        for (let i = 0; i < 9; i++) soma += +d[i] * (10 - i);
        r = (soma * 10) % 11; if (r >= 10) r = 0;
        if (r !== +d[9]) return false;
        soma = 0;
        for (let i = 0; i < 10; i++) soma += +d[i] * (11 - i);
        r = (soma * 10) % 11; if (r >= 10) r = 0;
        return r === +d[10];
    },
    senha: (v) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(v),
};

function setFieldStatus(inputId, isValid, feedbackId, msgErro) {
    const input    = el(inputId);
    const feedback = el(feedbackId);
    if (!input) return isValid;
    input.classList.toggle("invalid", !isValid);
    input.classList.toggle("valid",    isValid);
    if (feedback) {
        feedback.textContent = isValid ? "" : msgErro;
        feedback.classList.toggle("visible", !isValid);
    }
    return isValid;
}

function clearFieldStatus(inputId, feedbackId) {
    const input    = el(inputId);
    const feedback = el(feedbackId);
    if (input)    input.classList.remove("invalid", "valid");
    if (feedback) feedback.classList.remove("visible");
}

function validarInfoPessoal() {
    return [
        setFieldStatus("nome",       Validador.nome(val("nome")),                  "erro-nome",        "Informe um nome válido (mín. 3 letras)."),
        setFieldStatus("email",      Validador.email(val("email")),                "erro-email",       "Informe um e-mail válido."),
        setFieldStatus("cpf",        Validador.cpf(val("cpf")),                    "erro-cpf",         "CPF inválido."),
        setFieldStatus("telefone",   Validador.telefone(val("telefone")),          "erro-telefone",    "Telefone inválido."),
        setFieldStatus("nascimento", Validador.nascimento(el("nascimento").value),  "erro-nascimento",  "Você deve ter pelo menos 13 anos."),
    ].every(Boolean);
}

[
    ["nome",       "erro-nome",       Validador.nome,       "Informe um nome válido (mín. 3 letras)."],
    ["email",      "erro-email",      Validador.email,      "Informe um e-mail válido."],
    ["cpf",        "erro-cpf",        Validador.cpf,        "CPF inválido."],
    ["telefone",   "erro-telefone",   Validador.telefone,   "Telefone inválido."],
    ["nascimento", "erro-nascimento", Validador.nascimento, "Você deve ter pelo menos 13 anos."],
].forEach(([id, fb, fn, msg]) => {
    el(id)?.addEventListener("blur", () => setFieldStatus(id, fn(el(id).value), fb, msg));
});

el("tipo-doc")?.addEventListener("change", () => clearFieldStatus("cpf", "erro-cpf"));

/* ═══════════════════════════════════════════════════════════
   MÁSCARAS
═══════════════════════════════════════════════════════════ */
el("cpf")?.addEventListener("input", function () {
    if (val("tipo-doc") !== "CPF") return;
    let v = this.value.replace(/\D/g, "").slice(0, 11);
    v = v.replace(/(\d{3})(\d)/,                     "$1.$2")
         .replace(/(\d{3})\.(\d{3})(\d)/,            "$1.$2.$3")
         .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/,   "$1.$2.$3-$4");
    this.value = v;
});

el("telefone")?.addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").slice(0, 11);
    v = v.length <= 10
        ? v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
        : v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    this.value = v.replace(/-$/, "");
});

/* ═══════════════════════════════════════════════════════════
   FORÇA DE SENHA
═══════════════════════════════════════════════════════════ */
el("senha-nova")?.addEventListener("input", function () {
    const v = this.value;
    let score = 0;
    if (v.length >= 8)        score++;
    if (/[A-Za-z]/.test(v))  score++;
    if (/\d/.test(v))         score++;
    if (/[@$!%*#?&]/.test(v)) score++;

    const levels = [
        { w: "0%",   c: "",               t: "" },
        { w: "25%",  c: "var(--danger)",  t: "Fraca" },
        { w: "50%",  c: "var(--warning)", t: "Moderada" },
        { w: "75%",  c: "#85c200",        t: "Boa" },
        { w: "100%", c: "var(--success)", t: "Forte 🔒" },
    ][score];

    el("strength-fill").style.width      = levels.w;
    el("strength-fill").style.background = levels.c;
    el("strength-label").innerHTML = levels.t
        ? `<span style="color:${levels.c}">${levels.t}</span>` : "";
});

/* ═══════════════════════════════════════════════════════════
   MOSTRAR / OCULTAR SENHA
═══════════════════════════════════════════════════════════ */
document.querySelectorAll(".eye-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = el(btn.dataset.target);
        const show  = input.type === "password";
        input.type  = show ? "text" : "password";
        btn.querySelector("i").className = show ? "fas fa-eye-slash" : "fas fa-eye";
    });
});

/* ═══════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════ */
function setAvatar(src) {
    const img     = el("profile-picture");
    const svg     = el("avatar-default-svg");
    const cached  = localStorage.getItem("profilePhotoUrl") || "";
    const finalSrc = (src && src.length > 10 && !src.endsWith("/"))
                        ? src
                        : (cached && cached !== DEFAULT_AVATAR ? cached : "");

    if (finalSrc) {
        img.onload  = () => { img.style.display = "block"; svg.style.display = "none"; };
        img.onerror = () => {
            localStorage.removeItem("profilePhotoUrl");
            img.style.display = "none";
            svg.style.display = "block";
        };
        img.src = finalSrc;
    } else {
        img.style.display = "none";
        svg.style.display = "block";
    }
}

el("edit-picture-btn")?.addEventListener("click", () => el("picture-upload").click());

el("picture-upload")?.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("A imagem deve ter no máximo 5 MB.", "error"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        showToast("Formato inválido. Use JPG, PNG ou WebP.", "error"); return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
        const dataUrl = ev.target.result;
        setAvatar(dataUrl);
        localStorage.setItem("profilePhotoUrl", dataUrl);
        updateHeader(
            localStorage.getItem("profileName")  || "",
            localStorage.getItem("profileEmail") || "",
            dataUrl
        );
        showToast('Foto atualizada! Clique em "Salvar alterações" para confirmar.');
    };
    reader.readAsDataURL(file);
});

/* ═══════════════════════════════════════════════════════════
   CARREGAR PERFIL
═══════════════════════════════════════════════════════════ */
async function loadProfileData() {
    const userId = getUserId();
    if (!userId) {
        window.location.href = "/frontend/login/login.html";
        return;
    }

    limparCacheSeUsuarioMudou(userId);

    try {
        const res  = await fetch(`${API_URL}/usuarios/${userId}`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        el("profile-name-display").textContent  = data.nome_completo || data.nome || "Usuário";
        el("profile-email-display").textContent = data.email         || "—";
        el("profile-phone-display").textContent = data.telefone      || "—";

        if (data.cidade || data.estado) {
            el("profile-city-display").textContent =
                [data.cidade, data.estado].filter(Boolean).join(" — ");
        }

        const rawDate = data.criado_em || data.data_cadastro || data.created_at;
        if (rawDate) {
            const d      = new Date(rawDate);
            const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
            el("profile-member-since").textContent =
                `Membro desde ${months[d.getMonth()]} ${d.getFullYear()}`;
        }

        const backendPhoto = data.foto_perfil || data.avatar || "";
        const photoUrl     = backendPhoto || "";
        setAvatar(photoUrl);

        const nomeCompleto = data.nome_completo || data.nome || "";
        localStorage.setItem("profileName",  nomeCompleto);
        localStorage.setItem("profileEmail", data.email || "");
        if (photoUrl) localStorage.setItem("profilePhotoUrl", photoUrl);

        waitForHeader(nomeCompleto, data.email, photoUrl || DEFAULT_AVATAR);

        const nome = data.nome_completo || data.nome || "";
        if (nome)            el("nome").value       = nome;
        if (data.sobrenome)  el("sobrenome").value  = data.sobrenome;
        if (data.email)      el("email").value      = data.email;
        if (data.telefone)   el("telefone").value   = data.telefone;
        if (data.cpf)        el("cpf").value        = data.cpf;
        if (data.nascimento) el("nascimento").value = data.nascimento;
        if (data.sexo)       el("sexo").value       = data.sexo;

        const ua      = navigator.userAgent;
        const browser = ua.includes("Firefox") ? "Firefox"
                       : ua.includes("Edg")    ? "Edge"
                       : ua.includes("Chrome") ? "Chrome"
                       : ua.includes("Safari") ? "Safari"
                       : "Navegador";
        const device  = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
        const sessEl  = el("session-current-device");
        if (sessEl) sessEl.textContent = `${browser} — ${device}`;

    } catch (err) {
        console.error("loadProfileData:", err);
        showToast("Não foi possível carregar os dados do perfil.", "error");
    }
}

/* ═══════════════════════════════════════════════════════════
   SALVAR INFORMAÇÕES PESSOAIS
═══════════════════════════════════════════════════════════ */
el("save-info-btn")?.addEventListener("click", async () => {
    if (!validarInfoPessoal()) {
        showToast("Corrija os campos destacados antes de salvar.", "error");
        return;
    }

    const userId = getUserId();
    const btn    = el("save-info-btn");
    btn.classList.add("loading");

    try {
        const picEl  = el("profile-picture");
        const picSrc = (picEl && picEl.style.display !== "none" && picEl.src?.length > 10)
                        ? picEl.src
                        : (localStorage.getItem("profilePhotoUrl") || "");

        const body = {
            id:            userId,
            nome_completo: val("nome"),
            sobrenome:     val("sobrenome"),
            email:         val("email"),
            telefone:      val("telefone"),
            cpf:           val("cpf"),
            nascimento:    el("nascimento").value,
            sexo:          el("sexo").value,
            foto_perfil:   picSrc,
        };

        const res = await fetch(`${API_URL}/usuarios/perfil`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(body),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);

        if (picSrc && picSrc !== DEFAULT_AVATAR) localStorage.setItem("profilePhotoUrl", picSrc);

        el("profile-name-display").textContent  = body.nome_completo;
        el("profile-email-display").textContent = body.email;
        el("profile-phone-display").textContent = body.telefone || "—";

        updateHeader(body.nome_completo, body.email, picSrc || DEFAULT_AVATAR);
        showToast("Perfil atualizado com sucesso!");

    } catch (err) {
        console.error("saveProfile:", err);
        showToast("Falha ao salvar. Verifique o servidor.", "error");
    } finally {
        btn.classList.remove("loading");
    }
});

/* ═══════════════════════════════════════════════════════════
   ALTERAR SENHA
═══════════════════════════════════════════════════════════ */
el("form-senha")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const atual    = el("senha-atual").value;
    const nova     = el("senha-nova").value;
    const confirma = el("senha-confirma").value;
    let valid      = true;

    if (!atual) {
        setFieldStatus("senha-atual", false, "erro-senha-atual", "Informe sua senha atual.");
        valid = false;
    } else {
        clearFieldStatus("senha-atual", "erro-senha-atual");
    }
    if (!setFieldStatus("senha-nova", Validador.senha(nova), "erro-senha-nova",
        "Mín. 8 caracteres, 1 letra, 1 número e 1 símbolo.")) valid = false;

    if (nova !== confirma) {
        setFieldStatus("senha-confirma", false, "erro-senha-confirma", "As senhas não coincidem.");
        valid = false;
    } else {
        clearFieldStatus("senha-confirma", "erro-senha-confirma");
    }

    if (!valid) { showToast("Corrija os campos destacados.", "error"); return; }

    const btn = e.target.querySelector("[type=submit]");
    btn.classList.add("loading");

    try {
        const res = await fetch(`${API_URL}/usuarios/senha`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ id: getUserId(), senhaAtual: atual, novaSenha: nova }),
        });

        if (res.status === 401) {
            setFieldStatus("senha-atual", false, "erro-senha-atual", "Senha atual incorreta.");
            showToast("Senha atual incorreta.", "error");
            return;
        }
        if (!res.ok) throw new Error("HTTP " + res.status);

        showToast("Senha alterada com sucesso! 🔒");
        resetSenhaForm();

    } catch (err) {
        console.error("changePassword:", err);
        showToast("Falha ao alterar a senha. Tente novamente.", "error");
    } finally {
        btn.classList.remove("loading");
    }
});

el("cancel-senha-btn")?.addEventListener("click", resetSenhaForm);

function resetSenhaForm() {
    el("form-senha").reset();
    el("strength-fill").style.width = "0%";
    el("strength-label").innerHTML  = "";
    el("form-senha").querySelectorAll("input").forEach(i => i.classList.remove("valid", "invalid"));
    el("form-senha").querySelectorAll(".field-error").forEach(e => e.classList.remove("visible"));
}

/* ═══════════════════════════════════════════════════════════
   INGRESSOS
═══════════════════════════════════════════════════════════ */
async function loadTickets() {
    const userId = getUserId();
    if (!userId) return;
    showSectionState("tickets", "loading");

    let raw = null;
    for (const url of [
        `${API_URL}/ingressos/usuario/${userId}`,
        `${API_URL}/ingressos?usuarioId=${userId}`,
        `${API_URL}/pedidos/usuario/${userId}`,
        `${API_URL}/compras/usuario/${userId}`,
    ]) {
        try {
            const res = await fetch(url);
            if (res.ok) { raw = await res.json(); break; }
        } catch (_) {}
    }

    state.ticketsLoaded = true;
    const items = Array.isArray(raw) ? raw : (raw?.ingressos || raw?.data || raw?.pedidos || []);

    if (!items.length) { showSectionState("tickets", "empty"); return; }

    state.allTickets = items;
    renderTickets(state.allTickets, state.currentFilter);
    renderTicketSummary(state.allTickets);
    updateNavBadge(state.allTickets.length);
}

function renderTickets(tickets, filter) {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

    const filtered = tickets.filter(t => {
        const d = t.data_evento ? new Date(t.data_evento) : null;
        if (filter === "proximos") return d && d >= hoje;
        if (filter === "passados") return d && d <  hoje;
        return true;
    });

    if (!filtered.length) { showSectionState("tickets", "empty"); return; }

    el("tickets-list").innerHTML = filtered.map(t => {
        const dataEvento = t.data_evento ? new Date(t.data_evento) : null;
        const isHoje     = dataEvento && dataEvento.toDateString() === new Date().toDateString();
        const isProximo  = dataEvento && dataEvento >= hoje;
        const statusCls  = isHoje ? "hoje" : (isProximo ? "proximo" : "passado");
        const statusTxt  = isHoje ? "🔥 Hoje!" : (isProximo ? "Próximo" : "Realizado");
        const dataStr    = dataEvento ? dataEvento.toLocaleDateString("pt-BR") : "—";
        const nomeEvento = t.evento_titulo || t.nome_evento || t.titulo || "Evento";
        const local      = t.local_nome    || t.local       || t.endereco || "";
        const precoStr   = t.preco ? formatBRL(parseFloat(t.preco)) : "";
        const statusPgto = t.status_pagamento || t.status || "";
        const pgtoLabel  = statusPgto === "pendente"
            ? `<span class="ticket-status passado">⏳ Pagamento pendente</span>` : "";

        return `
        <div class="list-item" data-evento-id="${t.id || ""}">
            <div class="item-icon"><i class="fas fa-ticket-alt"></i></div>
            <div class="item-info">
                <div class="item-name">${nomeEvento}${t.tipo_ingresso ? " — " + t.tipo_ingresso : ""}</div>
                <div class="item-sub">
                    ${dataStr}${local ? " &bull; " + local : ""}${precoStr ? " &bull; " + precoStr : ""}
                </div>
            </div>
            ${pgtoLabel || `<span class="ticket-status ${statusCls}">${statusTxt}</span>`}
            <div class="item-actions">
                ${(isProximo || isHoje) && statusPgto !== "pendente" ? `
                    <button class="btn btn-primary btn-sm" onclick="downloadTicket('${t.id}')">
                        <i class="fas fa-download"></i> Baixar
                    </button>` : ""}
                ${isProximo && statusPgto !== "pendente" ? `
                    <button class="btn btn-ghost btn-sm"
                        onclick="openTransferModal('${t.id}','${nomeEvento.replace(/'/g, "\\'")}')">
                        <i class="fas fa-exchange-alt"></i> Transferir
                    </button>` : ""}
            </div>
        </div>`;
    }).join("");

    showSectionState("tickets", "list");
}

function renderTicketSummary(tickets) {
    const hoje     = new Date(); hoje.setHours(0, 0, 0, 0);
    const proximos = tickets.filter(t => t.data_evento && new Date(t.data_evento) >= hoje).length;
    const gasto    = tickets.reduce((s, t) => s + (parseFloat(t.preco) || 0), 0);

    el("summary-total").textContent     = tickets.length;
    el("summary-proximos").textContent  = proximos;
    el("summary-gasto").textContent     = formatBRL(gasto);
    el("tickets-summary").style.display = "block";
}

function updateNavBadge(count) {
    const badge = el("nav-ticket-count");
    if (badge && count > 0) { badge.textContent = count; badge.style.display = "inline"; }
}

async function downloadTicket(ticketId) {
    const userId = getUserId();   // ← adiciona essa linha
    try {
        const res = await fetch(`${API_URL}/ingressos/${ticketId}/download?usuario_id=${userId}`);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement("a"), { href: url, download: `ingresso-${ticketId}.pdf` });
        a.click();
        URL.revokeObjectURL(url);
        showToast("Download iniciado!");
    } catch {
        showToast("Erro ao baixar o ingresso. Tente novamente.", "error");
    }
}

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.currentFilter = btn.dataset.filter;
        if (state.allTickets.length) renderTickets(state.allTickets, state.currentFilter);
    });
});

/* ═══════════════════════════════════════════════════════════
   MODAL TRANSFERÊNCIA
═══════════════════════════════════════════════════════════ */
function openTransferModal(ticketId, ticketName) {
    state.transferId = ticketId;
    el("transfer-ticket-name").textContent = ticketName;
    el("transfer-email").value             = "";
    el("erro-transfer-email").classList.remove("visible");
    el("transfer-modal").classList.add("open");
}

el("cancel-transfer-btn")?.addEventListener("click", () => el("transfer-modal").classList.remove("open"));
el("transfer-modal")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
});

el("confirm-transfer-btn")?.addEventListener("click", async () => {
    const email = el("transfer-email").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        el("erro-transfer-email").classList.add("visible"); return;
    }
    el("erro-transfer-email").classList.remove("visible");

    const btn = el("confirm-transfer-btn");
    btn.classList.add("loading");
    try {
        const res = await fetch(`${API_URL}/ingressos/${state.transferId}/transferir`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email_destinatario: email }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Erro na transferência");
        }
        showToast(`Ingresso transferido para ${email}!`);
        el("transfer-modal").classList.remove("open");
        state.ticketsLoaded = false;
        loadTickets();
    } catch (err) {
        showToast(err.message || "Falha na transferência.", "error");
    } finally {
        btn.classList.remove("loading");
    }
});

/* ═══════════════════════════════════════════════════════════
   FAVORITOS
   Lê do localStorage (roles_favoritos_dados) com fallback
   para o backend, e sincroniza em segundo plano.
═══════════════════════════════════════════════════════════ */
async function loadFavoritos() {
    const userId = getUserId();
    showSectionState("favoritos", "loading");

    // 1. Tenta localStorage primeiro (sem precisar de userId)
    const localItems = getFavoritosDoStorage();
    if (localItems.length > 0) {
        renderFavoritos(localItems);
        state.favoritosLoaded = true;
        if (userId) sincronizarFavoritosComBackend(userId, localItems);
        return;
    }

    // 2. Fallback: busca no backend
    if (!userId) {
        state.favoritosLoaded = true;
        showSectionState("favoritos", "empty");
        return;
    }

    let raw = null;
    for (const url of [
        `${API_URL}/favoritos/usuario/${userId}`,
        `${API_URL}/favoritos?usuarioId=${userId}`,
        `${API_URL}/usuarios/${userId}/favoritos`,
    ]) {
        try {
            const res = await fetch(url);
            if (res.ok) { raw = await res.json(); break; }
        } catch (_) {}
    }

    state.favoritosLoaded = true;
    const items = Array.isArray(raw) ? raw : (raw?.favoritos || raw?.data || []);
    if (!items.length) { showSectionState("favoritos", "empty"); return; }
    renderFavoritos(items);
}

/**
 * Lê favoritos do localStorage (chave: roles_favoritos_dados).
 * Formato: { [eventoId]: { titulo, categoria, data, local, preco, imagem, url } }
 */
function getFavoritosDoStorage() {
    try {
        const raw = localStorage.getItem("roles_favoritos_dados");
        if (!raw) return [];
        return Object.values(JSON.parse(raw)).filter(Boolean);
    } catch {
        return [];
    }
}

function renderFavoritos(items) {
    if (!items.length) { showSectionState("favoritos", "empty"); return; }

    const iconMap = {
        "Show": "fa-star", "Shows e Música": "fa-music",
        "Festa e Balada": "fa-music", "Balada": "fa-music",
        "Gastronomia": "fa-utensils", "Restaurante": "fa-utensils",
        "Bar": "fa-cocktail", "Parque": "fa-tree",
        "Esportes": "fa-running", "Cultura e Arte": "fa-palette",
        "Tecnologia": "fa-laptop", "Infantil e Família": "fa-child",
    };

    el("favoritos-list").innerHTML = items.map(f => {
        const nome      = f.titulo || f.nome || f.nome_local || "—";
        const categoria = f.categoria || "";
        const sub       = [f.data, f.local || f.cidade].filter(Boolean).join(" • ") || "—";
        const preco     = f.preco || "";
        const url       = f.url   || "#";
        const id        = f.id    || "";
        const icon      = iconMap[categoria] || "fa-calendar-star";

        return `
        <div class="list-item" data-evento-id="${id}">
            <div class="item-icon">
                ${f.imagem
                    ? `<img src="${f.imagem}" alt="${nome}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">`
                    : `<i class="fas ${icon}"></i>`}
            </div>
            <div class="item-info">
                <div class="item-name">${nome}</div>
                <div class="item-sub">${sub}${preco ? " • " + preco : ""}</div>
            </div>
            ${categoria ? `<span class="category-tag">${categoria}</span>` : ""}
            <div class="item-actions">
                <a href="${url}" class="btn btn-primary btn-sm" title="Ver evento">
                    <i class="fas fa-eye"></i> Ver
                </a>
                <button class="btn btn-ghost btn-sm" onclick="removeFavoritoLocal('${id}', this)" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join("");

    showSectionState("favoritos", "list");
}

/** Remove do localStorage e atualiza a UI com animação. */
function removeFavoritoLocal(id, btn) {
    try {
        const dados = JSON.parse(localStorage.getItem("roles_favoritos_dados") || "{}");
        delete dados[id];
        localStorage.setItem("roles_favoritos_dados", JSON.stringify(dados));
    } catch (_) {}

    try {
        const raw = localStorage.getItem("roles_favoritos");
        const set = new Set(raw ? JSON.parse(raw) : []);
        set.delete(id);
        localStorage.setItem("roles_favoritos", JSON.stringify([...set]));
    } catch (_) {}

    const item = btn.closest(".list-item");
    item.style.transition = "opacity .3s, transform .3s";
    item.style.opacity    = "0";
    item.style.transform  = "translateX(20px)";
    setTimeout(() => {
        item.remove();
        if (!el("favoritos-list").querySelectorAll(".list-item").length) {
            showSectionState("favoritos", "empty");
        }
        showToast("Removido dos favoritos.");
    }, 310);
}

/** Sincroniza favoritos locais com o backend em segundo plano. */
async function sincronizarFavoritosComBackend(userId, localItems) {
    try {
        for (const item of localItems) {
            if (!item.id) continue;
            await fetch(`${API_URL}/favoritos`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ usuarioId: userId, eventoId: item.id, ...item }),
            });
        }
    } catch (_) { /* silencioso — não afeta a UX */ }
}

// Compatibilidade retroativa
async function removeFavorito(id, btn) { removeFavoritoLocal(id, btn); }

/* ═══════════════════════════════════════════════════════════
   VISITAS
═══════════════════════════════════════════════════════════ */
async function loadVisitas() {
    const userId = getUserId();
    if (!userId) return;
    showSectionState("visitas", "loading");

    let raw = null;
    for (const url of [
        `${API_URL}/visitas/usuario/${userId}`,
        `${API_URL}/historico/usuario/${userId}`,
        `${API_URL}/usuarios/${userId}/visitas`,
    ]) {
        try {
            const res = await fetch(url);
            if (res.ok) { raw = await res.json(); break; }
        } catch (_) {}
    }
    state.visitasLoaded = true;

    const items = Array.isArray(raw) ? raw : (raw?.visitas || raw?.data || []);
    if (!items.length) { showSectionState("visitas", "empty"); return; }

    el("visitas-list").innerHTML = items.map(v => {
        const nota    = parseInt(v.nota || v.avaliacao || 0);
        const dataStr = v.data_visita ? new Date(v.data_visita).toLocaleDateString("pt-BR") : "—";
        const stars   = [1,2,3,4,5].map(i =>
            `<i class="fas fa-star ${i <= nota ? "filled" : "empty"}"></i>`
        ).join("");
        return `
        <div class="list-item">
            <div class="item-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="item-info">
                <div class="item-name">${v.nome || v.nome_local || "—"}</div>
                <div class="item-sub">Visitado em ${dataStr}</div>
            </div>
            <div class="stars">${stars}</div>
        </div>`;
    }).join("");

    showSectionState("visitas", "list");
}

/* ═══════════════════════════════════════════════════════════
   SESSÕES
═══════════════════════════════════════════════════════════ */
document.querySelectorAll(".session-close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".session-card");
        card.style.transition = "opacity .3s, transform .3s";
        card.style.opacity    = "0";
        card.style.transform  = "translateX(20px)";
        setTimeout(() => { card.remove(); showToast("Sessão encerrada."); }, 310);
    });
});

el("logout-all-btn")?.addEventListener("click", () => {
    const cards = document.querySelectorAll(".session-card:not(.current)");
    cards.forEach((card, i) => setTimeout(() => {
        card.style.transition = "opacity .3s";
        card.style.opacity    = "0";
        setTimeout(() => card.remove(), 310);
    }, i * 80));
    setTimeout(() => showToast("Todas as outras sessões foram encerradas."), cards.length * 80 + 100);
});

/* ═══════════════════════════════════════════════════════════
   MODAL EXCLUIR CONTA
═══════════════════════════════════════════════════════════ */
el("open-delete-modal")?.addEventListener("click",  () => el("delete-modal").classList.add("open"));
el("cancel-delete-btn")?.addEventListener("click",  () => el("delete-modal").classList.remove("open"));
el("delete-modal")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
});
el("confirm-delete-btn")?.addEventListener("click", () => {
    showToast("Conta excluída. Redirecionando...", "warning");
    el("delete-modal").classList.remove("open");
    setTimeout(() => { localStorage.clear(); window.location.href = "/frontend/login/login.html"; }, 2200);
});

/* ═══════════════════════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════════════════════ */
el("logout-nav")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/frontend/login/logoutUsuario.html";
});

/* ═══════════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════════ */
document.querySelectorAll(".faq-question").forEach(q => {
    q.addEventListener("click", () => {
        const open = q.classList.toggle("open");
        q.nextElementSibling.classList.toggle("visible", open);
    });
});

/* ═══════════════════════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
    const userId = getUserId();
    if (userId) limparCacheSeUsuarioMudou(userId);

    const cachedName  = localStorage.getItem("profileName")     || "";
    const cachedEmail = localStorage.getItem("profileEmail")    || "";
    const cachedPhoto = localStorage.getItem("profilePhotoUrl") || DEFAULT_AVATAR;
    waitForHeader(cachedName, cachedEmail, cachedPhoto);

    loadProfileData();

    // Detecta ?section= na URL e ativa a aba correspondente
    const section = new URLSearchParams(window.location.search).get("section");
    if (section) {
        activateSection(section);
    } else {
        loadTickets();
    }

    // Banner de compra confirmada (vindo da tela de checkout)
    const compra = JSON.parse(sessionStorage.getItem("compraConfirmada") || "null");
    if (compra) {
        sessionStorage.removeItem("compraConfirmada");
        setTimeout(() => showToast(compra.mensagem || "Compra realizada com sucesso! 🎉"), 600);
    }
});
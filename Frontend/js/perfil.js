"use strict";

/* ═══════════════════════════════════════════════════════════
   CONFIG
   window.API_BASE é definido em /frontend/js/config.js
<<<<<<< HEAD
═══════════════════════════════════════════════════════════ */
const API_URL = window.API_BASE || "";
=======
═══════════════════════════════════════════ */
const API_URL = window.API_BASE || '';
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21

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
<<<<<<< HEAD
═══════════════════════════════════════════════════════════ */
const DEFAULT_AVATAR =
=======
═══════════════════════════════════════════ */
const DEFAULT_AVATAR_URL =
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
    "width='40' height='40' viewBox='0 0 40 40'%3E" +
    "%3Ccircle cx='20' cy='20' r='20' fill='%23ccc'/%3E" +
    "%3Ccircle cx='20' cy='16' r='7' fill='%23fff'/%3E" +
    "%3Cellipse cx='20' cy='34' rx='12' ry='8' fill='%23fff'/%3E" +
    "%3C/svg%3E";

<<<<<<< HEAD
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
=======
function notifyHeader(name, email, picUrl) {
    const photo = picUrl && picUrl.length > 10 ? picUrl : DEFAULT_AVATAR_URL;
    localStorage.setItem('profilePhotoUrl', photo);
    localStorage.setItem('profileName',     name  || '');
    localStorage.setItem('profileEmail',    email || '');
    applyHeaderData(name, email, photo);
}

function applyHeaderData(name, email, photo) {
    const picHeader = document.getElementById('profile-pic-header');
    if (picHeader) {
        picHeader.src     = photo;
        picHeader.onerror = () => { picHeader.src = DEFAULT_AVATAR_URL; };
    }
    const dropdownImg = document.querySelector('#header-logado .user-info img');
    if (dropdownImg) {
        dropdownImg.src     = photo;
        dropdownImg.onerror = () => { dropdownImg.src = DEFAULT_AVATAR_URL; };
    }
    const nameEl  = document.getElementById('profile-name-header');
    const emailEl = document.getElementById('profile-email-header');
    if (nameEl  && name)  nameEl.textContent  = name;
    if (emailEl && email) emailEl.textContent = email;

    const logado    = document.getElementById('header-logado');
    const naoLogado = document.getElementById('header-nao-logado');
    const hamburger = document.getElementById('hamburger-btn');
    if (logado)    logado.style.display    = 'flex';
    if (naoLogado) naoLogado.style.display = 'none';
    if (hamburger) hamburger.style.display = 'flex';
}

function waitForHeaderAndApply(name, email, photo, tries = 0) {
    const picHeader = document.getElementById('profile-pic-header');
    if (picHeader) { applyHeaderData(name, email, photo); return; }
    if (tries < 20) setTimeout(() => waitForHeaderAndApply(name, email, photo, tries + 1), 150);
}

/* ═══════════════════════════════════════════
   GET USER ID
═══════════════════════════════════════════ */
function getUserId() {
    const directKeys = ['userId', 'id', 'user_id', 'usuarioId', 'usuario_id'];
    for (const key of directKeys) {
        const val = localStorage.getItem(key);
        if (val && val !== 'undefined' && val !== 'null') return val;
    }
    const jsonKeys = ['user', 'userData', 'usuario', 'loggedUser', 'currentUser'];
    for (const key of jsonKeys) {
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
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
=======
/* ═══════════════════════════════════════════
   SHOW/HIDE section state
═══════════════════════════════════════════ */
function showState(prefix, state) {
    const loading = g(`${prefix}-loading`);
    const empty   = g(`${prefix}-empty`);
    const list    = g(`${prefix}-list`);
    if (loading) loading.style.display = state === 'loading' ? 'flex'   : 'none';
    if (empty)   empty.style.display   = state === 'empty'   ? 'flex'   : 'none';
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
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
=======
        if (item.dataset.section === 'ingressos' && !_ticketsLoaded)   loadTickets();
        if (item.dataset.section === 'favoritos'  && !_favoritosLoaded) loadFavoritos();
        if (item.dataset.section === 'visitas'    && !_visitasLoaded)   loadVisitas();
    });
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
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
=======
/* ═══════════════════════════════════════════
   VALIDATORS
═══════════════════════════════════════════ */
function validateNome() {
    const v  = gv('nome');
    const ok = v.length >= 3;
    markField(g('nome'), g('erro-nome'), !ok);
    return ok;
}
function validateEmail() {
    const v  = gv('email');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    markField(g('email'), g('erro-email'), !ok);
    return ok;
}
function validateCPF() {
    const tipo = gv('tipo-doc');
    const raw  = gv('cpf');
    if (!raw) { clearField(g('cpf'), g('erro-cpf')); return true; }
    let ok = true;
    if (tipo === 'CPF') {
        const d = raw.replace(/\D/g, '');
        if (d.length !== 11 || /^(.)\1+$/.test(d)) { ok = false; }
        else {
            let s = 0, r;
            for (let i = 0; i < 9; i++) s += +d[i] * (10 - i);
            r = (s * 10) % 11; if (r >= 10) r = 0;
            if (r !== +d[9]) ok = false;
            else {
                s = 0;
                for (let i = 0; i < 10; i++) s += +d[i] * (11 - i);
                r = (s * 10) % 11; if (r >= 10) r = 0;
                ok = r === +d[10];
            }
        }
    }
    const errEl = g('erro-cpf');
    if (errEl) errEl.textContent = tipo === 'CPF' ? 'CPF inválido.' : 'Informe o número do documento.';
    markField(g('cpf'), errEl, !ok);
    return ok;
}
function validateTelefone() {
    const v = gv('telefone');
    if (!v) { clearField(g('telefone'), g('erro-telefone')); return true; }
    const d  = v.replace(/\D/g, '');
    const ok = d.length === 10 || d.length === 11;
    markField(g('telefone'), g('erro-telefone'), !ok);
    return ok;
}
function validateNascimento() {
    const v = g('nascimento').value;
    if (!v) { clearField(g('nascimento'), g('erro-nascimento')); return true; }
    const minAge = new Date(); minAge.setFullYear(minAge.getFullYear() - 13);
    const ok = new Date(v) <= minAge;
    markField(g('nascimento'), g('erro-nascimento'), !ok);
    return ok;
}
function validateSenhaNova() {
    const v  = g('senha-nova').value;
    const ok = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(v);
    markField(g('senha-nova'), g('erro-senha-nova'), !ok);
    return ok;
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
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
=======
g('nome').addEventListener('blur',       validateNome);
g('email').addEventListener('blur',      validateEmail);
g('cpf').addEventListener('blur',        validateCPF);
g('telefone').addEventListener('blur',   validateTelefone);
g('nascimento').addEventListener('blur', validateNascimento);
g('tipo-doc').addEventListener('change', () => clearField(g('cpf'), g('erro-cpf')));

/* ═══════════════════════════════════════════
   PASSWORD STRENGTH
═══════════════════════════════════════════ */
g('senha-nova').addEventListener('input', function () {
    const v = this.value;
    let sc  = 0;
    if (v.length >= 8)        sc++;
    if (/[A-Za-z]/.test(v))  sc++;
    if (/\d/.test(v))         sc++;
    if (/[@$!%*#?&]/.test(v)) sc++;
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21

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
<<<<<<< HEAD
    const img     = el("profile-picture");
    const svg     = el("avatar-default-svg");
    const cached  = localStorage.getItem("profilePhotoUrl") || "";
    const finalSrc = (src && src.length > 10 && !src.endsWith("/"))
=======
    const img = g('profile-picture');
    const svg = g('avatar-default-svg');

    const cached = localStorage.getItem('profilePhotoUrl') || '';
    const isRealCached = cached && cached !== DEFAULT_AVATAR_URL && cached.length > 10;
    const finalSrc = (src && src.length > 10 && !src.endsWith('/'))
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
                        ? src
                        : (cached && cached !== DEFAULT_AVATAR ? cached : "");

    if (finalSrc) {
        img.onload  = () => { img.style.display = "block"; svg.style.display = "none"; };
        img.onerror = () => {
<<<<<<< HEAD
            localStorage.removeItem("profilePhotoUrl");
            img.style.display = "none";
            svg.style.display = "block";
=======
            localStorage.removeItem('profilePhotoUrl');
            img.style.display = 'none';
            svg.style.display = 'block';
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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
<<<<<<< HEAD
        localStorage.setItem("profilePhotoUrl", dataUrl);
        updateHeader(
            localStorage.getItem("profileName")  || "",
            localStorage.getItem("profileEmail") || "",
=======
        localStorage.setItem('profilePhotoUrl', dataUrl);
        notifyHeader(
            localStorage.getItem('profileName')  || '',
            localStorage.getItem('profileEmail') || '',
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
            dataUrl
        );
        showToast('Foto atualizada! Clique em "Salvar alterações" para confirmar.');
    };
    reader.readAsDataURL(file);
});

<<<<<<< HEAD
/* ═══════════════════════════════════════════════════════════
   CARREGAR PERFIL
═══════════════════════════════════════════════════════════ */
=======
/* ═══════════════════════════════════════════
   LOAD PROFILE
═══════════════════════════════════════════ */
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
        el("profile-name-display").textContent  = data.nome_completo || data.nome || "Usuário";
        el("profile-email-display").textContent = data.email         || "—";
        el("profile-phone-display").textContent = data.telefone      || "—";
=======
        g('profile-name-display').textContent  = data.nome_completo || 'Usuário';
        g('profile-email-display').textContent = data.email         || '—';
        g('profile-phone-display').textContent = data.telefone      || '—';
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21

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

<<<<<<< HEAD
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
=======
        const backendPhoto = data.foto_perfil || data.avatar || '';
        const cachedPhoto  = localStorage.getItem('profilePhotoUrl') || '';
        const isRealCached = cachedPhoto && cachedPhoto !== DEFAULT_AVATAR_URL;
        const photoUrl     = backendPhoto || (isRealCached ? cachedPhoto : '');

        setAvatar(photoUrl);
        if (photoUrl) localStorage.setItem('profilePhotoUrl', photoUrl);
        waitForHeaderAndApply(data.nome_completo, data.email, photoUrl || DEFAULT_AVATAR_URL);

        if (data.nome_completo) g('nome').value      = data.nome_completo;
        if (data.sobrenome)     g('sobrenome').value = data.sobrenome;
        if (data.email)         g('email').value     = data.email;
        if (data.telefone)      g('telefone').value  = data.telefone;
        if (data.cpf)           g('cpf').value       = data.cpf;
        if (data.nascimento)    g('nascimento').value = data.nascimento;
        if (data.sexo)          g('sexo').value      = data.sexo;

        const ua = navigator.userAgent;
        const browser = ua.includes('Firefox') ? 'Firefox'
                       : ua.includes('Edg')    ? 'Edge'
                       : ua.includes('Chrome') ? 'Chrome'
                       : ua.includes('Safari') ? 'Safari'
                       : 'Navegador';
        const device = /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop';
        const el = g('session-current-device');
        if (el) el.textContent = `${browser} — ${device}`;
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21

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
<<<<<<< HEAD
        const picEl  = el("profile-picture");
        const picSrc = (picEl && picEl.style.display !== "none" && picEl.src?.length > 10)
                        ? picEl.src
                        : (localStorage.getItem("profilePhotoUrl") || "");
=======
        const picEl  = g('profile-picture');
        const picSrc = (picEl && picEl.style.display !== 'none' && picEl.src && picEl.src.length > 10)
                          ? picEl.src
                          : (localStorage.getItem('profilePhotoUrl') || '');
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21

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

<<<<<<< HEAD
        if (picSrc && picSrc !== DEFAULT_AVATAR) localStorage.setItem("profilePhotoUrl", picSrc);

        el("profile-name-display").textContent  = body.nome_completo;
        el("profile-email-display").textContent = body.email;
        el("profile-phone-display").textContent = body.telefone || "—";

        updateHeader(body.nome_completo, body.email, picSrc || DEFAULT_AVATAR);
        showToast("Perfil atualizado com sucesso!");
=======
        if (picSrc && picSrc !== DEFAULT_AVATAR_URL) {
            localStorage.setItem('profilePhotoUrl', picSrc);
        }

        g('profile-name-display').textContent  = body.nome_completo;
        g('profile-email-display').textContent = body.email;
        g('profile-phone-display').textContent = body.telefone || '—';
        notifyHeader(body.nome_completo, body.email, picSrc || DEFAULT_AVATAR_URL);
        showToast('Perfil atualizado com sucesso!', 'success');
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21

    } catch (err) {
        console.error("saveProfile:", err);
        showToast("Falha ao salvar. Verifique o servidor.", "error");
    } finally {
        btn.classList.remove("loading");
    }
});

<<<<<<< HEAD
/* ═══════════════════════════════════════════════════════════
   ALTERAR SENHA
═══════════════════════════════════════════════════════════ */
el("form-senha")?.addEventListener("submit", async (e) => {
=======
/* ═══════════════════════════════════════════
   CHANGE PASSWORD
═══════════════════════════════════════════ */
g('form-senha').addEventListener('submit', async e => {
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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
<<<<<<< HEAD
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ id: getUserId(), senhaAtual: atual, novaSenha: nova }),
=======
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: getUserId(), senhaAtual: atual, novaSenha: nova })
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
/* ═══════════════════════════════════════════════════════════
   INGRESSOS
═══════════════════════════════════════════════════════════ */
=======
/* ═══════════════════════════════════════════
   TICKETS
═══════════════════════════════════════════ */
let _ticketsLoaded  = false;
let _allTickets     = [];
let _currentFilter  = 'todos';

>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
    state.ticketsLoaded = true;
    const items = Array.isArray(raw) ? raw : (raw?.ingressos || raw?.data || raw?.pedidos || []);

    if (!items.length) { showSectionState("tickets", "empty"); return; }

    state.allTickets = items;
    renderTickets(state.allTickets, state.currentFilter);
    renderTicketSummary(state.allTickets);
    updateNavBadge(state.allTickets.length);
=======
    _ticketsLoaded = true;
    const items = Array.isArray(raw) ? raw : (raw?.ingressos || raw?.data || raw?.pedidos || []);
    if (!items.length) { showState('tickets', 'empty'); return; }

    _allTickets = items;
    renderTickets(_allTickets, _currentFilter);
    renderTicketSummary(_allTickets);
    updateNavBadge(_allTickets.length);
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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
<<<<<<< HEAD
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
=======
        const statusCls  = isHoje ? 'hoje' : (isProximo ? 'proximo' : 'passado');
        const statusTxt  = isHoje ? '🔥 Hoje!' : (isProximo ? 'Próximo' : 'Realizado');
        const dataStr    = dataEvento ? dataEvento.toLocaleDateString('pt-BR') : '—';
        const precoStr   = t.preco ? `R$ ${parseFloat(t.preco).toFixed(2).replace('.', ',')}` : '';
        const nomeEvento = t.nome_evento || t.evento || t.titulo || 'Evento';
        const local      = t.local_evento || t.local || t.endereco || '';

        return `
        <div class="list-item" data-evento-id="${id}">
            <div class="item-icon">
                ${f.imagem
                    ? `<img src="${f.imagem}" alt="${nome}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">`
                    : `<i class="fas ${icon}"></i>`
                }
            </div>
            <div class="item-info">
            </div>
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.currentFilter = btn.dataset.filter;
        if (state.allTickets.length) renderTickets(state.allTickets, state.currentFilter);
=======
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _currentFilter = btn.dataset.filter;
        if (_allTickets.length) renderTickets(_allTickets, _currentFilter);
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
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
=======
/* ═══════════════════════════════════════════
   FAVORITOS — lê do localStorage (roles_favoritos_dados)
   com fallback para o backend
═══════════════════════════════════════════ */
let _favoritosLoaded = false;

async function loadFavoritos() {
    const userId = getUserId();
    showState('favoritos', 'loading');

    // ── 1. Tenta carregar do localStorage primeiro ──────────────────────
    const localItems = getFavoritosDoStorage();

    if (localItems.length > 0) {
        renderFavoritos(localItems);
        _favoritosLoaded = true;

        // Sincroniza com o backend em segundo plano (se usuário estiver logado)
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
        if (userId) sincronizarFavoritosComBackend(userId, localItems);
        return;
    }

<<<<<<< HEAD
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
=======
    // ── 2. Fallback: busca no backend ────────────────────────────────────
    if (!userId) {
        _favoritosLoaded = true;
        showState('favoritos', 'empty');
        return;
    }

    const endpoints = [
        `${API_URL}/favoritos/usuario/${userId}`,
        `${API_URL}/favoritos?usuarioId=${userId}`,
        `${API_URL}/usuarios/${userId}/favoritos`,
    ];

    let raw = null;
    for (const url of endpoints) {
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
        try {
            const res = await fetch(url);
            if (res.ok) { raw = await res.json(); break; }
        } catch (_) {}
    }

<<<<<<< HEAD
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
=======
    _favoritosLoaded = true;
    const items = Array.isArray(raw) ? raw : (raw?.favoritos || raw?.data || []);

    if (!items.length) { showState('favoritos', 'empty'); return; }

    renderFavoritos(items);
}

/**
 * Lê os favoritos salvos pelo favoritoCompartilhar.js no localStorage.
 * Chave: 'roles_favoritos_dados' → { [eventoId]: { titulo, categoria, data, local, preco, imagem, url } }
 */
function getFavoritosDoStorage() {
    try {
        const raw = localStorage.getItem('roles_favoritos_dados');
        if (!raw) return [];
        const dados = JSON.parse(raw);
        return Object.values(dados).filter(Boolean);
    } catch {
        return [];
    }
}

/**
 * Renderiza a lista de eventos favoritos na aba do perfil.
 * Aceita tanto itens do localStorage quanto do backend.
 */
function renderFavoritos(items) {
    if (!items.length) { showState('favoritos', 'empty'); return; }

    g('favoritos-list').innerHTML = items.map(f => {
        // Suporta tanto campos do localStorage quanto do backend
        const nome      = f.titulo || f.nome || f.nome_local || '—';
        const categoria = f.categoria || '';
        const sub       = [f.data, f.local || f.cidade].filter(Boolean).join(' • ') || '—';
        const preco     = f.preco || '';
        const url       = f.url  || '#';
        const id        = f.id   || '';

        // Ícone por categoria
        const iconMap = {
            'Show': 'fa-star', 'Shows e Música': 'fa-music',
            'Festa e Balada': 'fa-music', 'Balada': 'fa-music',
            'Gastronomia': 'fa-utensils', 'Restaurante': 'fa-utensils',
            'Bar': 'fa-cocktail', 'Parque': 'fa-tree',
            'Esportes': 'fa-running', 'Cultura e Arte': 'fa-palette',
            'Tecnologia': 'fa-laptop', 'Infantil e Família': 'fa-child',
            'default': 'fa-calendar-star'
        };
        const icon = iconMap[categoria] || iconMap['default'];

        return `
        <div class="list-item" data-evento-id="${id}">
            <div class="item-icon">
            ${f.imagem
            ? `<img src="${f.imagem}" alt="${nome}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">`
         : `<i class="fas ${icon}"></i>`
        }
        </div>
            <div class="item-info">
                <div class="item-name">${nome}</div>
                <div class="item-sub">${sub}${preco ? ' • ' + preco : ''}</div>
            </div>
            ${categoria ? `<span class="category-tag">${categoria}</span>` : ''}
            <div class="item-actions">
                <a href="${url}" class="btn btn-primary btn-sm" title="Ver evento">
                    <i class="fas fa-eye"></i> Ver
                </a>
                <button class="btn btn-ghost btn-sm" onclick="removeFavoritoLocal('${id}', this)" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join('');

    showState('favoritos', 'list');
}

/**
 * Remove o favorito do localStorage e atualiza a UI.
 */
function removeFavoritoLocal(id, btn) {
    // Remove dos dados detalhados
    try {
        const dados = JSON.parse(localStorage.getItem('roles_favoritos_dados') || '{}');
        delete dados[id];
        localStorage.setItem('roles_favoritos_dados', JSON.stringify(dados));
    } catch (_) {}

    // Remove do Set de IDs
    try {
        const raw = localStorage.getItem('roles_favoritos');
        const set = new Set(raw ? JSON.parse(raw) : []);
        set.delete(id);
        localStorage.setItem('roles_favoritos', JSON.stringify([...set]));
    } catch (_) {}

    // Remove o card da lista com animação
    const item = btn.closest('.list-item');
    item.style.transition = 'opacity .3s, transform .3s';
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(20px)';
    setTimeout(() => {
        item.remove();
        // Se a lista ficou vazia, mostra o estado vazio
        const remaining = g('favoritos-list').querySelectorAll('.list-item');
        if (!remaining.length) showState('favoritos', 'empty');
        showToast('Removido dos favoritos.');
    }, 310);
}

/**
 * Sincroniza os favoritos locais com o backend em segundo plano.
 * Só envia os IDs que o backend ainda não conhece.
 */
async function sincronizarFavoritosComBackend(userId, localItems) {
    try {
        for (const item of localItems) {
            if (!item.id) continue;
            await fetch(`${API_URL}/favoritos`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ usuarioId: userId, eventoId: item.id, ...item })
            });
        }
    } catch (_) {
        // Silencioso — sync em segundo plano; não afeta a UX
    }
}

// Mantém compatibilidade com a função antiga (caso algo ainda chame removeFavorito)
async function removeFavorito(id, btn) {
    removeFavoritoLocal(id, btn);
}

/* ═══════════════════════════════════════════
   VISITAS
═══════════════════════════════════════════ */
let _visitasLoaded = false;
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21

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
<<<<<<< HEAD
        const dataStr = v.data_visita ? new Date(v.data_visita).toLocaleDateString("pt-BR") : "—";
=======
        const dataStr = v.data_visita
            ? new Date(v.data_visita).toLocaleDateString('pt-BR') : '—';
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
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

<<<<<<< HEAD
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
=======
/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    const cachedName  = localStorage.getItem('profileName')     || '';
    const cachedEmail = localStorage.getItem('profileEmail')    || '';
    const cachedPhoto = localStorage.getItem('profilePhotoUrl') || DEFAULT_AVATAR_URL;
    waitForHeaderAndApply(cachedName, cachedEmail, cachedPhoto);

    loadProfileData();
    loadTickets();

    // Se a URL tiver ?section=favoritos, abre a aba automaticamente
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'favoritos') {
        document.querySelector('.nav-item[data-section="favoritos"]')?.click();
>>>>>>> 0891bf95d0d4f00e429ed3c2a80b6979f0481c21
    }
});
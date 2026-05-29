'use strict';

/* ═══════════════════════════════════════════
   CONFIG
   window.API_BASE é definido em /frontend/js/config.js
═══════════════════════════════════════════ */
const API_URL = window.API_BASE || '';

/* ═══════════════════════════════════════════
   SHORTCUTS
═══════════════════════════════════════════ */
const g  = id => document.getElementById(id);
const gv = id => g(id)?.value.trim() || '';

/* ═══════════════════════════════════════════
   AVATAR PADRÃO
═══════════════════════════════════════════ */
const DEFAULT_AVATAR_URL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
    "width='40' height='40' viewBox='0 0 40 40'%3E" +
    "%3Ccircle cx='20' cy='20' r='20' fill='%23ccc'/%3E" +
    "%3Ccircle cx='20' cy='16' r='7' fill='%23fff'/%3E" +
    "%3Cellipse cx='20' cy='34' rx='12' ry='8' fill='%23fff'/%3E" +
    "%3C/svg%3E";

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
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const obj = JSON.parse(raw);
            const id  = obj?.id || obj?.userId || obj?.user_id || obj?.usuarioId;
            if (id) return String(id);
        } catch (_) {}
    }
    return null;
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
let _toastTimer;
function showToast(msg, type = 'success') {
    const toast = g('toast');
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle' };
    g('toast-icon').className  = 'fas ' + (icons[type] || 'fa-check-circle');
    g('toast-msg').textContent = msg;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ═══════════════════════════════════════════
   SHOW/HIDE section state
═══════════════════════════════════════════ */
function showState(prefix, state) {
    const loading = g(`${prefix}-loading`);
    const empty   = g(`${prefix}-empty`);
    const list    = g(`${prefix}-list`);
    if (loading) loading.style.display = state === 'loading' ? 'flex' : 'none';
    if (empty)   empty.style.display   = state === 'empty'   ? 'flex' : 'none';
    if (list) {
        list.style.display       = state === 'list' ? 'flex' : 'none';
        list.style.flexDirection = 'column';
    }
}

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        g('section-' + item.dataset.section)?.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (item.dataset.section === 'ingressos' && !_ticketsLoaded)   loadTickets();
        if (item.dataset.section === 'favoritos'  && !_favoritosLoaded) loadFavoritos();
        if (item.dataset.section === 'visitas'    && !_visitasLoaded)   loadVisitas();
    });
});

/* ═══════════════════════════════════════════
   VALIDATION HELPERS
═══════════════════════════════════════════ */
function markField(inputEl, errorEl, isInvalid) {
    if (!inputEl) return;
    inputEl.classList.toggle('invalid', isInvalid);
    inputEl.classList.toggle('valid',   !isInvalid);
    if (errorEl) errorEl.classList.toggle('visible', isInvalid);
}
function clearField(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('invalid', 'valid');
    if (errorEl) errorEl.classList.remove('visible');
}

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
}

/* ═══════════════════════════════════════════
   MÁSCARAS
═══════════════════════════════════════════ */
g('cpf').addEventListener('input', function () {
    if (gv('tipo-doc') !== 'CPF') return;
    let v = this.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{3})(\d)/,       '$1.$2')
         .replace(/(\d{3})(\d)/,       '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.value = v;
});
g('telefone').addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').substring(0, 11);
    v = v.length <= 10
        ? v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        : v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    this.value = v.replace(/-$/, '');
});

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

    const levels = [
        { w: '0%',   c: '',               t: '' },
        { w: '25%',  c: 'var(--danger)',  t: 'Fraca' },
        { w: '50%',  c: 'var(--warning)', t: 'Moderada' },
        { w: '75%',  c: '#85c200',        t: 'Boa' },
        { w: '100%', c: 'var(--success)', t: 'Forte 🔒' },
    ][sc];

    g('strength-fill').style.width      = levels.w;
    g('strength-fill').style.background = levels.c;
    g('strength-label').innerHTML = levels.t
        ? `<span style="color:${levels.c}">${levels.t}</span>` : '';
});

/* ═══════════════════════════════════════════
   SHOW / HIDE PASSWORD
═══════════════════════════════════════════ */
document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = g(btn.dataset.target);
        const show  = input.type === 'password';
        input.type  = show ? 'text' : 'password';
        btn.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
});

/* ═══════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════ */
function setAvatar(src) {
    const img = g('profile-picture');
    const svg = g('avatar-default-svg');

    const cached      = localStorage.getItem('profilePhotoUrl') || '';
    const isRealCached = cached && cached !== DEFAULT_AVATAR_URL && cached.length > 10;
    const finalSrc    = (src && src.length > 10 && !src.endsWith('/'))
                            ? src
                            : (isRealCached ? cached : '');

    if (finalSrc) {
        img.onload  = () => { img.style.display = 'block'; svg.style.display = 'none'; };
        img.onerror = () => {
            localStorage.removeItem('profilePhotoUrl');
            img.style.display = 'none';
            svg.style.display = 'block';
        };
        img.src = finalSrc;
    } else {
        img.style.display = 'none';
        svg.style.display = 'block';
    }
}

g('edit-picture-btn').addEventListener('click', () => g('picture-upload').click());

g('picture-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5 MB.', 'error'); return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showToast('Formato inválido. Use JPG, PNG ou WebP.', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
        const dataUrl = ev.target.result;
        setAvatar(dataUrl);
        localStorage.setItem('profilePhotoUrl', dataUrl);
        notifyHeader(
            localStorage.getItem('profileName')  || '',
            localStorage.getItem('profileEmail') || '',
            dataUrl
        );
        showToast('Foto atualizada! Clique em "Salvar alterações" para confirmar.');
    };
    reader.readAsDataURL(file);
});

/* ═══════════════════════════════════════════
   LOAD PROFILE
═══════════════════════════════════════════ */
async function loadProfileData() {
    const userId = getUserId();
    if (!userId) {
        console.warn('Perfil: nenhum userId encontrado no localStorage. Redirecionando para login.');
        window.location.href = '/frontend/login/login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/usuarios/${userId}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        g('profile-name-display').textContent  = data.nome_completo || 'Usuário';
        g('profile-email-display').textContent = data.email         || '—';
        g('profile-phone-display').textContent = data.telefone      || '—';

        if (data.cidade || data.estado) {
            g('profile-city-display').textContent =
                [data.cidade, data.estado].filter(Boolean).join(' — ');
        }

        const rawDate = data.criado_em || data.data_cadastro || data.created_at;
        if (rawDate) {
            const d      = new Date(rawDate);
            const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
            g('profile-member-since').textContent =
                `Membro desde ${months[d.getMonth()]} ${d.getFullYear()}`;
        }

        const backendPhoto = data.foto_perfil || data.avatar || '';
        const cachedPhoto  = localStorage.getItem('profilePhotoUrl') || '';
        const isRealCached = cachedPhoto && cachedPhoto !== DEFAULT_AVATAR_URL;
        const photoUrl     = backendPhoto || (isRealCached ? cachedPhoto : '');

        setAvatar(photoUrl);
        if (photoUrl) localStorage.setItem('profilePhotoUrl', photoUrl);
        waitForHeaderAndApply(data.nome_completo, data.email, photoUrl || DEFAULT_AVATAR_URL);

        if (data.nome_completo) g('nome').value       = data.nome_completo;
        if (data.sobrenome)     g('sobrenome').value  = data.sobrenome;
        if (data.email)         g('email').value      = data.email;
        if (data.telefone)      g('telefone').value   = data.telefone;
        if (data.cpf)           g('cpf').value        = data.cpf;
        if (data.nascimento)    g('nascimento').value = data.nascimento;
        if (data.sexo)          g('sexo').value       = data.sexo;

        const ua      = navigator.userAgent;
        const browser = ua.includes('Firefox') ? 'Firefox'
                      : ua.includes('Edg')     ? 'Edge'
                      : ua.includes('Chrome')  ? 'Chrome'
                      : ua.includes('Safari')  ? 'Safari'
                      : 'Navegador';
        const device  = /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop';
        const el      = g('session-current-device');
        if (el) el.textContent = `${browser} — ${device}`;

    } catch (err) {
        console.error('loadProfileData:', err);
        showToast('Não foi possível carregar os dados do perfil.', 'error');
    }
}

/* ═══════════════════════════════════════════
   SAVE PROFILE
═══════════════════════════════════════════ */
g('save-info-btn').addEventListener('click', async () => {
    const isValid = [
        validateNome(),
        validateEmail(),
        validateCPF(),
        validateTelefone(),
        validateNascimento()
    ].every(Boolean);

    if (!isValid) {
        showToast('Corrija os campos destacados antes de salvar.', 'error');
        return;
    }

    const userId = getUserId();
    const btn    = g('save-info-btn');
    btn.classList.add('loading');

    try {
        const picEl  = g('profile-picture');
        const picSrc = (picEl && picEl.style.display !== 'none' && picEl.src && picEl.src.length > 10)
                          ? picEl.src
                          : (localStorage.getItem('profilePhotoUrl') || '');

        const body = {
            id:            userId,
            nome_completo: gv('nome'),
            sobrenome:     gv('sobrenome'),
            email:         gv('email'),
            telefone:      gv('telefone'),
            cpf:           gv('cpf'),
            nascimento:    g('nascimento').value,
            sexo:          g('sexo').value,
            foto_perfil:   picSrc
        };

        const res = await fetch(`${API_URL}/usuarios/perfil`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);

        if (picSrc && picSrc !== DEFAULT_AVATAR_URL) {
            localStorage.setItem('profilePhotoUrl', picSrc);
        }

        g('profile-name-display').textContent  = body.nome_completo;
        g('profile-email-display').textContent = body.email;
        g('profile-phone-display').textContent = body.telefone || '—';
        notifyHeader(body.nome_completo, body.email, picSrc || DEFAULT_AVATAR_URL);
        showToast('Perfil atualizado com sucesso!', 'success');

    } catch (err) {
        console.error('saveProfile:', err);
        showToast('Falha ao salvar. Verifique o servidor.', 'error');
    } finally {
        btn.classList.remove('loading');
    }
});

/* ═══════════════════════════════════════════
   CHANGE PASSWORD
═══════════════════════════════════════════ */
g('form-senha').addEventListener('submit', async e => {
    e.preventDefault();

    const atual    = g('senha-atual').value;
    const nova     = g('senha-nova').value;
    const confirma = g('senha-confirma').value;
    let valid      = true;

    if (!atual) {
        markField(g('senha-atual'), g('erro-senha-atual'), true); valid = false;
    } else {
        clearField(g('senha-atual'), g('erro-senha-atual'));
    }
    if (!validateSenhaNova()) valid = false;
    if (nova !== confirma) {
        markField(g('senha-confirma'), g('erro-senha-confirma'), true); valid = false;
    } else {
        clearField(g('senha-confirma'), g('erro-senha-confirma'));
    }

    if (!valid) { showToast('Corrija os campos destacados.', 'error'); return; }

    const btn = e.target.querySelector('[type=submit]');
    btn.classList.add('loading');

    try {
        const res = await fetch(`${API_URL}/usuarios/senha`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: getUserId(), senhaAtual: atual, novaSenha: nova })
        });

        if (res.status === 401) {
            const errEl = g('erro-senha-atual');
            if (errEl) errEl.textContent = 'Senha atual incorreta.';
            markField(g('senha-atual'), errEl, true);
            showToast('Senha atual incorreta.', 'error');
            return;
        }
        if (!res.ok) throw new Error('HTTP ' + res.status);

        showToast('Senha alterada com sucesso! 🔒', 'success');
        resetSenhaForm();

    } catch (err) {
        console.error('changePassword:', err);
        showToast('Falha ao alterar a senha. Tente novamente.', 'error');
    } finally {
        btn.classList.remove('loading');
    }
});

g('cancel-senha-btn').addEventListener('click', resetSenhaForm);

function resetSenhaForm() {
    g('form-senha').reset();
    g('strength-fill').style.width = '0%';
    g('strength-label').innerHTML  = '';
    g('form-senha').querySelectorAll('input').forEach(i => i.classList.remove('valid', 'invalid'));
    g('form-senha').querySelectorAll('.field-error').forEach(e => e.classList.remove('visible'));
}

/* ═══════════════════════════════════════════
   TICKETS
═══════════════════════════════════════════ */
let _ticketsLoaded = false;
let _allTickets    = [];
let _currentFilter = 'todos';

async function loadTickets() {
    const userId = getUserId();
    if (!userId) return;
    showState('tickets', 'loading');

    const endpoints = [
        `${API_URL}/ingressos/usuario/${userId}`,
        `${API_URL}/ingressos?usuarioId=${userId}`,
        `${API_URL}/pedidos/usuario/${userId}`,
        `${API_URL}/compras/usuario/${userId}`,
    ];

    let raw = null;
    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            if (res.ok) { raw = await res.json(); break; }
        } catch (_) {}
    }

    _ticketsLoaded = true;
    const items = Array.isArray(raw) ? raw : (raw?.ingressos || raw?.data || raw?.pedidos || []);
    if (!items.length) { showState('tickets', 'empty'); return; }

    _allTickets = items;
    renderTickets(_allTickets, _currentFilter);
    renderTicketSummary(_allTickets);
    updateNavBadge(_allTickets.length);
}

function renderTickets(tickets, filter) {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

    const filtered = tickets.filter(t => {
        const d = t.data_evento ? new Date(t.data_evento) : null;
        if (filter === 'proximos') return d && d >= hoje;
        if (filter === 'passados') return d && d < hoje;
        return true;
    });

    if (!filtered.length) { showState('tickets', 'empty'); return; }

    const list = g('tickets-list');
    list.innerHTML = filtered.map(t => {
        const dataEvento = t.data_evento ? new Date(t.data_evento) : null;
        const isProximo  = dataEvento && dataEvento >= hoje;
        const isHoje     = dataEvento && dataEvento.toDateString() === new Date().toDateString();
        const statusCls  = isHoje ? 'hoje' : (isProximo ? 'proximo' : 'passado');
        const statusTxt  = isHoje ? '🔥 Hoje!' : (isProximo ? 'Próximo' : 'Realizado');
        const dataStr    = dataEvento ? dataEvento.toLocaleDateString('pt-BR') : '—';
        const precoStr   = t.preco ? `R$ ${parseFloat(t.preco).toFixed(2).replace('.', ',')}` : '';
        const nomeEvento = t.nome_evento || t.evento || t.titulo || 'Evento';
        const local      = t.local_evento || t.local || t.endereco || '';

        return `
        <div class="list-item" data-evento-id="${t.id || ''}">
            <div class="item-icon">
                ${t.imagem
                    ? `<img src="${t.imagem}" alt="${nomeEvento}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">`
                    : `<i class="fas fa-ticket-alt"></i>`
                }
            </div>
            <div class="item-info">
                <div class="item-name">${nomeEvento}${t.setor ? ' — ' + t.setor : ''}</div>
                <div class="item-sub">
                    ${dataStr}${local ? ' &bull; ' + local : ''}${precoStr ? ' &bull; ' + precoStr : ''}
                </div>
            </div>
            <span class="ticket-status ${statusCls}">${statusTxt}</span>
            <div class="item-actions">
                ${(isProximo || isHoje) ? `
                    <button class="btn btn-primary btn-sm" onclick="downloadTicket('${t.id}')">
                        <i class="fas fa-download"></i> Baixar
                    </button>` : ''}
                ${isProximo ? `
                    <button class="btn btn-ghost btn-sm"
                        onclick="openTransferModal('${t.id}','${nomeEvento.replace(/'/g, "\\'")}')">
                        <i class="fas fa-exchange-alt"></i> Transferir
                    </button>` : ''}
            </div>
        </div>`;
    }).join('');

    showState('tickets', 'list');
}

function renderTicketSummary(tickets) {
    const hoje     = new Date(); hoje.setHours(0, 0, 0, 0);
    const proximos = tickets.filter(t => t.data_evento && new Date(t.data_evento) >= hoje).length;
    const gasto    = tickets.reduce((s, t) => s + (parseFloat(t.preco) || 0), 0);

    g('summary-total').textContent     = tickets.length;
    g('summary-proximos').textContent  = proximos;
    g('summary-gasto').textContent     = `R$ ${gasto.toFixed(2).replace('.', ',')}`;
    g('tickets-summary').style.display = 'block';
}

function updateNavBadge(count) {
    const badge = g('nav-ticket-count');
    if (badge && count > 0) {
        badge.textContent   = count;
        badge.style.display = 'inline';
    }
}

async function downloadTicket(ticketId) {
    try {
        const res = await fetch(`${API_URL}/ingressos/${ticketId}/download`);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: `ingresso-${ticketId}.pdf` });
        a.click();
        URL.revokeObjectURL(url);
        showToast('Download iniciado!');
    } catch {
        showToast('Erro ao baixar o ingresso. Tente novamente.', 'error');
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _currentFilter = btn.dataset.filter;
        if (_allTickets.length) renderTickets(_allTickets, _currentFilter);
    });
});

/* ═══════════════════════════════════════════
   TRANSFER MODAL
═══════════════════════════════════════════ */
let _transferTicketId = null;

function openTransferModal(ticketId, ticketName) {
    _transferTicketId = ticketId;
    g('transfer-ticket-name').textContent = ticketName;
    g('transfer-email').value             = '';
    g('erro-transfer-email').classList.remove('visible');
    g('transfer-modal').classList.add('open');
}

g('cancel-transfer-btn').addEventListener('click', () => g('transfer-modal').classList.remove('open'));
g('transfer-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});
g('confirm-transfer-btn').addEventListener('click', async () => {
    const email = g('transfer-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        g('erro-transfer-email').classList.add('visible');
        return;
    }
    g('erro-transfer-email').classList.remove('visible');

    const btn = g('confirm-transfer-btn');
    btn.classList.add('loading');
    try {
        const res = await fetch(`${API_URL}/ingressos/${_transferTicketId}/transferir`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email_destinatario: email })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erro na transferência');
        }
        showToast(`Ingresso transferido para ${email}!`, 'success');
        g('transfer-modal').classList.remove('open');
        _ticketsLoaded = false;
        loadTickets();
    } catch (err) {
        showToast(err.message || 'Falha na transferência.', 'error');
    } finally {
        btn.classList.remove('loading');
    }
});

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
        if (userId) sincronizarFavoritosComBackend(userId, localItems);
        return;
    }

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
        try {
            const res = await fetch(url);
            if (res.ok) { raw = await res.json(); break; }
        } catch (_) {}
    }

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
        const nome      = f.titulo || f.nome || f.nome_local || '—';
        const categoria = f.categoria || '';
        const sub       = [f.data, f.local || f.cidade].filter(Boolean).join(' • ') || '—';
        const preco     = f.preco || '';
        const url       = f.url  || '#';
        const id        = f.id   || '';

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
    try {
        const dados = JSON.parse(localStorage.getItem('roles_favoritos_dados') || '{}');
        delete dados[id];
        localStorage.setItem('roles_favoritos_dados', JSON.stringify(dados));
    } catch (_) {}

    try {
        const raw = localStorage.getItem('roles_favoritos');
        const set = new Set(raw ? JSON.parse(raw) : []);
        set.delete(id);
        localStorage.setItem('roles_favoritos', JSON.stringify([...set]));
    } catch (_) {}

    const item = btn.closest('.list-item');
    item.style.transition = 'opacity .3s, transform .3s';
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(20px)';
    setTimeout(() => {
        item.remove();
        const remaining = g('favoritos-list').querySelectorAll('.list-item');
        if (!remaining.length) showState('favoritos', 'empty');
        showToast('Removido dos favoritos.');
    }, 310);
}

/**
 * Sincroniza os favoritos locais com o backend em segundo plano.
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

// Mantém compatibilidade com chamadas antigas de removeFavorito
async function removeFavorito(id, btn) {
    removeFavoritoLocal(id, btn);
}

/* ═══════════════════════════════════════════
   VISITAS
═══════════════════════════════════════════ */
let _visitasLoaded = false;

async function loadVisitas() {
    const userId = getUserId();
    if (!userId) return;
    showState('visitas', 'loading');

    const endpoints = [
        `${API_URL}/visitas/usuario/${userId}`,
        `${API_URL}/historico/usuario/${userId}`,
        `${API_URL}/usuarios/${userId}/visitas`,
    ];
    let raw = null;
    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            if (res.ok) { raw = await res.json(); break; }
        } catch (_) {}
    }
    _visitasLoaded = true;

    const items = Array.isArray(raw) ? raw : (raw?.visitas || raw?.data || []);
    if (!items.length) { showState('visitas', 'empty'); return; }

    g('visitas-list').innerHTML = items.map(v => {
        const nota    = parseInt(v.nota || v.avaliacao || 0);
        const dataStr = v.data_visita
            ? new Date(v.data_visita).toLocaleDateString('pt-BR') : '—';
        const stars   = [1, 2, 3, 4, 5].map(i =>
            `<i class="fas fa-star ${i <= nota ? 'filled' : 'empty'}"></i>`
        ).join('');
        return `
        <div class="list-item">
            <div class="item-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="item-info">
                <div class="item-name">${v.nome || v.nome_local || '—'}</div>
                <div class="item-sub">Visitado em ${dataStr}</div>
            </div>
            <div class="stars">${stars}</div>
        </div>`;
    }).join('');

    showState('visitas', 'list');
}

/* ═══════════════════════════════════════════
   SESSÕES
═══════════════════════════════════════════ */
document.querySelectorAll('.session-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.session-card');
        card.style.transition = 'opacity .3s, transform .3s';
        card.style.opacity    = '0';
        card.style.transform  = 'translateX(20px)';
        setTimeout(() => { card.remove(); showToast('Sessão encerrada.'); }, 310);
    });
});

g('logout-all-btn')?.addEventListener('click', () => {
    const cards = document.querySelectorAll('.session-card:not(.current)');
    cards.forEach((card, i) => setTimeout(() => {
        card.style.transition = 'opacity .3s';
        card.style.opacity    = '0';
        setTimeout(() => card.remove(), 310);
    }, i * 80));
    setTimeout(() => showToast('Todas as outras sessões foram encerradas.'), cards.length * 80 + 100);
});

/* ═══════════════════════════════════════════
   DELETE MODAL
═══════════════════════════════════════════ */
g('open-delete-modal').addEventListener('click',  () => g('delete-modal').classList.add('open'));
g('cancel-delete-btn').addEventListener('click',  () => g('delete-modal').classList.remove('open'));
g('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});
g('confirm-delete-btn').addEventListener('click', () => {
    showToast('Conta excluída. Redirecionando...', 'warning');
    g('delete-modal').classList.remove('open');
    setTimeout(() => { localStorage.clear(); window.location.href = '/frontend/login/login.html'; }, 2200);
});

/* ═══════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════ */
g('logout-nav').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/frontend/login/logoutUsuario.html';
});

/* ═══════════════════════════════════════════
   FAQ
═══════════════════════════════════════════ */
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const open = q.classList.toggle('open');
        q.nextElementSibling.classList.toggle('visible', open);
    });
});

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
    }
});
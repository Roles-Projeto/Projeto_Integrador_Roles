// PresencaConfirmada.js

(function () {
    const raw = localStorage.getItem('eventoSelecionado');
    const dados = raw ? JSON.parse(raw) : null;

    const HG_KEY = 'SUA_CHAVE_AQUI'; // ← substitua pela sua chave hgbrasil.com

    function set(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '—';
    }

    // ─── PREENCHER CARD ──────────────────────────────────────────
    if (dados) {
        set('pc-nome-evento', dados.nome);
        set('pc-data-txt',    dados.data);
        set('pc-hora-txt',    dados.hora);
        set('pc-local-txt',   dados.local + (dados.cidade ? ' • ' + dados.cidade : ''));

        const thumb = document.getElementById('pc-thumb');
        if (thumb && dados.imagem) {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_BASE = isLocal ? 'http://localhost:3000' : window.location.origin;
            const src = dados.imagem.startsWith('http') ? dados.imagem : API_BASE + dados.imagem;
            thumb.innerHTML = `<img src="${src}" alt="${dados.nome || 'Evento'}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
        }
    } else {
        set('pc-nome-evento', 'Evento não encontrado');
        set('pc-data-txt', '-');
        set('pc-hora-txt', '-');
        set('pc-local-txt', '-');
    }

    // ─── CLIMA — HG BRASIL ───────────────────────────────────────
    async function carregarClima() {
        const cidade = (dados && (dados.cidade || dados.local)) || 'São Paulo';
        const nomeCidade = cidade.split(',')[0].trim();
        const tipText = document.getElementById('pc-weather-text');
        const tipLink = document.getElementById('pc-clima-link');
        const tipCard = document.getElementById('tip-clima');
        if (!tipText) return;

        try {
            const url = `https://api.hgbrasil.com/weather?key=${HG_KEY}&city_name=${encodeURIComponent(nomeCidade)}&format=json-cors`;
            const res = await fetch(url);
            const json = await res.json();

            if (json.results) {
                const r = json.results;
                tipText.textContent = `${r.temp}°C — ${r.description}`;
                if (tipLink) {
                    tipLink.href = `https://hgbrasil.com/status/weather?woeid=${r.woeid}`;
                }
            } else {
                tipText.textContent = 'Clima indisponível';
            }
        } catch (e) {
            tipText.textContent = 'Não foi possível carregar o clima';
        }
    }

    carregarClima();

    // ─── DRESS CODE ──────────────────────────────────────────────
    const dressLink = document.getElementById('pc-tip-dress-link');
    if (dressLink && dados && dados.nome) {
        const query = encodeURIComponent(`look para ${dados.nome}`);
        dressLink.href = `https://www.pinterest.com/search/pins/?q=${query}`;
    }

    const tipDress = document.getElementById('tip-dress');
    if (tipDress && dressLink) {
        tipDress.onclick = () => window.open(dressLink.href, '_blank');
    }

})();
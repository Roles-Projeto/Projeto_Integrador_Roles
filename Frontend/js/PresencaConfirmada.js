// PresencaConfirmada.js

(function () {

    const HG_KEY = 'SUA_CHAVE_AQUI'; // ← sua chave hgbrasil.com

    /* ── UTILITÁRIO ──────────────────────────────────── */
    function set(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '—';
    }

    /* ── INIT ────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {

        const raw   = localStorage.getItem('eventoSelecionado');
        const dados = raw ? JSON.parse(raw) : null;

        console.log('eventoSelecionado:', dados); // ← debug, pode remover depois

        /* ── PREENCHER DADOS DO EVENTO ───────────────── */
        if (dados) {
            set('pc-data-txt',  dados.data);
            set('pc-hora-txt',  dados.hora);
            set('pc-local-txt', dados.local + (dados.cidade ? ', ' + dados.cidade : ''));

            // Nome do evento (não do participante)
            set('pc-nome-txt', dados.nome || dados.ingressoNome || '—');

        } else {
            set('pc-data-txt',  '–');
            set('pc-hora-txt',  '–');
            set('pc-local-txt', '–');
            set('pc-nome-txt',  '–');
        }

        /* ── GOOGLE MAPS ─────────────────────────────── */
        function inicializarMaps() {
            if (!dados) return;
            const partes   = [dados.local, dados.cidade].filter(Boolean);
            const endereco = partes.join(', ');
            if (!endereco) return;

            const query  = encodeURIComponent(endereco);
            const url    = `https://www.google.com/maps/search/?api=1&query=${query}`;
            const linkEl = document.getElementById('pc-maps-link');
            const cardEl = document.getElementById('tip-maps');

            if (linkEl) linkEl.href = url;
            if (cardEl) cardEl.onclick = () => window.open(url, '_blank');
        }

        inicializarMaps();

        /* ── CLIMA — HG BRASIL ───────────────────────── */
        async function carregarClima() {
            const cidade     = (dados && (dados.cidade || dados.local)) || 'São Paulo';
            const nomeCidade = cidade.split(',')[0].trim();
            const tipText    = document.getElementById('pc-weather-text');
            const tipLink    = document.getElementById('pc-clima-link');
            const cardEl     = document.getElementById('tip-clima');

            if (!tipText) return;

            try {
                const url  = `https://api.hgbrasil.com/weather?key=${HG_KEY}&city_name=${encodeURIComponent(nomeCidade)}&format=json-cors`;
                const res  = await fetch(url);
                const json = await res.json();

                if (json.results) {
                    const r = json.results;
                    tipText.textContent = `${r.temp}°C — ${r.description}`;
                    if (tipLink) tipLink.href = `https://hgbrasil.com/status/weather?woeid=${r.woeid}`;
                    if (cardEl)  cardEl.onclick = () => window.open(tipLink.href, '_blank');
                } else {
                    tipText.textContent = 'Clima indisponível';
                }
            } catch {
                tipText.textContent = 'Não foi possível carregar';
            }
        }

        carregarClima();

        /* ── DRESS CODE — PINTEREST ──────────────────── */
        const dressLink = document.getElementById('pc-tip-dress-link');
        const tipDress  = document.getElementById('tip-dress');

        if (dressLink) {
            const termo    = dados && dados.nome ? `look para ${dados.nome}` : 'look casual chique evento';
            const query    = encodeURIComponent(termo);
            dressLink.href = `https://www.pinterest.com/search/pins/?q=${query}`;
        }

        if (tipDress && dressLink) {
            tipDress.onclick = () => window.open(dressLink.href, '_blank');
        }

    });

})();
(function () {
    'use strict';

    // ── Lê os dados salvos pelo detalheseventos.js no localStorage ──────────
    // O objeto "eventoSelecionado" é montado em detalheseventos.js assim:
    // window._eventoAtual = { nome, data, hora, local, imagem, ... }
    // localStorage.setItem('eventoSelecionado', JSON.stringify(dadosParaCheckout))
    function getDadosEvento() {
        try {
            const raw = localStorage.getItem('eventoSelecionado');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('[PresencaConfirmada] Erro ao ler localStorage:', e);
            return null;
        }
    }

    // ── Popula o card com os dados do evento ─────────────────────────────────
    // Não faz nova chamada ao backend — usa o que já foi salvo pelo fluxo:
    // detalheseventos.js → window._eventoAtual → localStorage → esta tela
    function popularCardEvento(dados) {
        if (!dados) return;

        // Thumbnail
        const thumb = document.getElementById('pc-thumb');
        if (thumb && dados.imagem) {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_BASE = isLocal ? 'http://localhost:3000' : window.location.origin;
            const imgUrl = dados.imagem.startsWith('http') ? dados.imagem : `${API_BASE}${dados.imagem}`;
            thumb.innerHTML = `<img src="${imgUrl}" alt="Capa do evento" onerror="this.parentElement.textContent='🎪'">`;
        }

        // Nome — vem de eventoSelecionado.nome
        const nomeEl = document.getElementById('pc-nome-evento');
        if (nomeEl && dados.nome) nomeEl.textContent = dados.nome;

        // Data — vem de eventoSelecionado.data (já formatada em detalheseventos.js)
        const dataTxt = document.getElementById('pc-data-txt');
        if (dataTxt && dados.data) dataTxt.textContent = dados.data;

        // Hora — vem de eventoSelecionado.hora (já formatada em detalheseventos.js)
        const horaTxt = document.getElementById('pc-hora-txt');
        if (horaTxt && dados.hora) horaTxt.textContent = dados.hora;

        // Local — vem de eventoSelecionado.local
        const localTxt = document.getElementById('pc-local-txt');
        if (localTxt && dados.local) localTxt.textContent = dados.local;
    }

    // ── Clima via wttr.in (API gratuita, sem chave) ──────────────────────────
    // Usa o local do evento como cidade; fallback para "Brasil"
    function inicializarClima(dados) {
        const weatherText = document.getElementById('pc-weather-text');
        const tipClima    = document.getElementById('tip-clima');
        if (!weatherText || !tipClima) return;

        const cidade = (dados && dados.local) ? dados.local : 'Brasil';
        const weatherSiteUrl = `https://wttr.in/${encodeURIComponent(cidade)}`;

        fetch(`https://wttr.in/${encodeURIComponent(cidade)}?format=%C+%t`)
            .then(r => r.text())
            .then(txt => {
                weatherText.textContent = txt.trim() || 'Toque para ver a previsão.';
            })
            .catch(() => {
                weatherText.textContent = 'Toque para ver a previsão do tempo.';
            });

        tipClima.addEventListener('click', () => {
            window.open(weatherSiteUrl, '_blank');
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        const dados = getDadosEvento();
        popularCardEvento(dados);
        inicializarClima(dados);
    });

})();
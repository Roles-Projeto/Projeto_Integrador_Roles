"use strict";

// ============================================================
// detalheseventos.js
// Lê os dados do evento salvos no localStorage (eventoDetalhes)
// e preenche a página detalheevento.html
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------
    // 1. CARREGAR DADOS
    // ----------------------------------------------------------
    function carregarDados() {
        try {
            const json = localStorage.getItem('eventoDetalhes');
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.error('Erro ao ler eventoDetalhes:', e);
            return null;
        }
    }

    const dados = carregarDados();

    if (!dados) {
        console.warn('Nenhum dado de evento encontrado no localStorage.');
        return;
    }

    // ----------------------------------------------------------
    // 2. PREENCHER BANNER / HERO
    // ----------------------------------------------------------

    // Imagem de fundo
    const banner = document.querySelector('.banner-evento');
    if (banner && dados.imagem) {
        banner.style.backgroundImage = `url('${dados.imagem}')`;
        banner.style.backgroundSize  = 'cover';
        banner.style.backgroundPosition = 'center';
    }

    // Categoria / etiqueta
    const etiqueta = document.querySelector('.etiqueta-categoria');
    if (etiqueta) etiqueta.textContent = dados.categoria || 'Evento';

    // Título
    const titulo = document.querySelector('.titulo-evento');
    if (titulo) titulo.textContent = dados.nome || 'Evento';

    // Alterar title da aba
    document.title = `Rolês - ${dados.nome || 'Evento'}`;

    // Data/hora no cabeçalho
    const dataHoraCab = document.querySelector('.data-hora-cabecalho');
    if (dataHoraCab) dataHoraCab.textContent = limparTexto(dados.dataHora) || '--';

    // Preço no banner
    const valorMinimo = document.querySelector('.valor-minimo');
    if (valorMinimo) {
        const precoLimpo = (dados.preco || 'Gratuito')
            .replace(/R\$\s*/i, '')
            .replace(/Gratuito/i, '0,00')
            .trim();
        valorMinimo.textContent = precoLimpo.includes(',') || precoLimpo.includes('0,00')
            ? precoLimpo
            : `${precoLimpo}`;
    }

    // ----------------------------------------------------------
    // 3. PREENCHER SEÇÃO "SOBRE O EVENTO"
    // ----------------------------------------------------------

    const descricaoEl = document.querySelector('.descricao-evento');
    if (descricaoEl) {
        descricaoEl.textContent = dados.descricao || 'Descrição não disponível.';
    }

    // Local
    const nomeLocal = document.querySelector('.nome-local');
    if (nomeLocal) nomeLocal.textContent = dados.local || '--';

    const enderecoLocal = document.querySelector('.endereco-local');
    if (enderecoLocal) enderecoLocal.textContent = dados.local || '--';

    // ----------------------------------------------------------
    // 4. PREENCHER SIDEBAR "GARANTA SEU INGRESSO"
    // ----------------------------------------------------------

    // Extrai data e hora separados se possível
    const { dataStr, horaStr } = extrairDataHora(dados.dataHora || dados.horario || '');

    const dataResumo = document.querySelector('.data-resumo');
    if (dataResumo) dataResumo.textContent = dataStr || '--';

    const horaResumo = document.querySelector('.hora-resumo');
    if (horaResumo) horaResumo.textContent = horaStr || '--';

    const localResumo = document.querySelector('.local-resumo');
    if (localResumo) localResumo.textContent = dados.local || '--';

    // Valor
    const valorIngresso = document.querySelector('.valor-ingresso');
    if (valorIngresso) {
        valorIngresso.textContent = dados.preco || 'Gratuito';
    }

    // ----------------------------------------------------------
    // 5. ORGANIZADOR (placeholder pois não vem do card)
    // ----------------------------------------------------------

    const nomeProdutora = document.getElementById('nome-produtora');
    if (nomeProdutora) {
        nomeProdutora.innerHTML = `Organizador <span class="etiqueta-verificado">Verificado</span>`;
    }

    const eventosOrg = document.getElementById('eventos-organizados');
    if (eventosOrg) eventosOrg.textContent = 'Informações do organizador não disponíveis';

    // ----------------------------------------------------------
    // 6. INGRESSOS
    // ----------------------------------------------------------

    const loadingIngressos = document.getElementById('loading-ingressos');
    if (loadingIngressos) {
        const precoTexto = dados.preco || 'Gratuito';
        loadingIngressos.outerHTML = `
            <div class="tipo-ingresso">
                <div class="info-ingresso">
                    <p class="nome-ingresso">Ingresso Geral</p>
                    <p class="descricao-ingresso">${dados.descricao || ''}</p>
                </div>
                <span class="preco-ingresso">${precoTexto}</span>
            </div>
        `;
    }

    // ----------------------------------------------------------
    // HELPERS
    // ----------------------------------------------------------

    function limparTexto(txt) {
        if (!txt) return '';
        // Remove ícones de font-awesome e caracteres estranhos
        return txt
            .replace(/[\uE000-\uF8FF]/g, '') // private use area (ícones)
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function extrairDataHora(texto) {
        if (!texto) return { dataStr: '--', horaStr: '--' };

        // Tenta achar hora no formato HH:MM
        const horaMatch = texto.match(/\d{1,2}:\d{2}/);
        const horaStr   = horaMatch ? horaMatch[0] : '--';

        // Remove a hora e o lixo, deixa só a parte da data
        const dataStr = texto
            .replace(/\d{1,2}:\d{2}/, '')
            .replace(/[•·\-|]/g, '')
            .replace(/i\s*class[^>]*>/g, '')
            .replace(/<[^>]*>/g, '')
            .trim() || '--';

        return { dataStr, horaStr };
    }

});
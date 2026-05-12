// monitor.js
window.addEventListener('load', function () {
  const [entry] = performance.getEntriesByType('navigation');
  if (!entry) return;

  function ms(a, b) {
    const v = a - b;
    return v >= 0 ? Math.round(v) : null;
  }

  const dados = {
    dns:       ms(entry.domainLookupEnd,          entry.domainLookupStart),
    conexao:   ms(entry.connectEnd,               entry.connectStart),
    servidor:  ms(entry.responseStart,            entry.requestStart),
    download:  ms(entry.responseEnd,              entry.responseStart),
    domPronto: ms(entry.domContentLoadedEventEnd, entry.startTime),
    totalPage: ms(entry.loadEventEnd,             entry.startTime),
  };

  console.log('=== Tempo de carregamento ===');
  console.table(dados);

  if (dados.servidor > 500)   console.warn('⚠️ TTFB alto:', dados.servidor + 'ms');
  if (dados.totalPage > 3000) console.warn('⚠️ Página lenta:', dados.totalPage + 'ms');

  try {
    const historico = JSON.parse(localStorage.getItem('pm_historico') || '[]');
    historico.push({ pagina: location.pathname, tempo: dados, quando: new Date().toLocaleString() });
    localStorage.setItem('pm_historico', JSON.stringify(historico.slice(-50)));
  } catch (e) {
    console.warn('Histórico não salvo:', e);
  }
});
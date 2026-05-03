'use strict';

// ─────────────────────────────────────────────
// ESTADO GLOBAL DE NOTIFICAÇÕES
// ─────────────────────────────────────────────
let unreadCount = 3;

function setUnreadCount(n) {
  unreadCount = Math.max(0, n);
  // Atualiza badge na tab
  const badge = document.querySelector('.dnav-badge');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
  }
  // Atualiza alerta de topo
  const banner = document.getElementById('alertBanner');
  if (banner) {
    if (unreadCount === 0) {
      banner.style.display = 'none';
    } else {
      banner.style.display = 'flex';
      const strong = banner.querySelector('strong');
      if (strong) strong.textContent = unreadCount + ' notificaç' + (unreadCount === 1 ? 'ão não lida' : 'ões não lidas');
    }
  }
  // Atualiza label no topo da lista
  const groupLabel = document.querySelector('#notifList .notif-group-label');
  if (groupLabel) {
    groupLabel.textContent = 'Não lidas · ' + unreadCount;
  }
}

// ─────────────────────────────────────────────
// INSTÂNCIAS DOS GRÁFICOS
// ─────────────────────────────────────────────
let salesChartInst  = null;
let ratingChartInst = null;

const chartData = {
  '6m': { labels: ['Mai','Jun','Jul','Ago','Set','Out'], data: [8200,11500,15800,22400,31000,45780] },
  '3m': { labels: ['Ago','Set','Out'],                  data: [22400,31000,45780] },
  '1m': { labels: ['S1','S2','S3','S4'],                data: [8900,12400,14200,10280] }
};
let currentPeriod = '6m';

const eventosData = {
  labels:      ['Live Jazz Night','Festival Eletrônico','Happy Hour'],
  vendidos:    [156, 186, 0],
  disponiveis: [44,  114, 100]
};

// ─────────────────────────────────────────────
// CRIAR / RECRIAR GRÁFICOS
// ─────────────────────────────────────────────
function criarGraficos() {
  const salesCanvas  = document.getElementById('salesChart');
  const ratingCanvas = document.getElementById('ratingChart');
  if (!salesCanvas || !ratingCanvas) return;

  if (salesChartInst)  { salesChartInst.destroy();  salesChartInst  = null; }
  if (ratingChartInst) { ratingChartInst.destroy(); ratingChartInst = null; }

  const periodo = chartData[currentPeriod];

  salesChartInst = new Chart(salesCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: periodo.labels,
      datasets: [{
        label: 'Receita (R$)',
        data: periodo.data,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleFont: { family:'Poppins', size:12 },
          bodyFont:  { family:'Poppins', size:13 },
          padding: 12, cornerRadius: 8, displayColors: false,
          callbacks: {
            title: items => 'Mês: ' + items[0].label,
            label: ctx  => ' R$ ' + ctx.parsed.y.toLocaleString('pt-BR')
          }
        }
      },
      scales: {
        x: { grid:{display:false}, ticks:{font:{family:'Poppins',size:11},color:'#9ca3af'} },
        y: { grid:{color:'#f3f4f6'}, ticks:{font:{family:'Poppins',size:11},color:'#9ca3af',callback:v=>'R$ '+(v/1000).toFixed(0)+'k'} }
      }
    }
  });

  ratingChartInst = new Chart(ratingCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: eventosData.labels,
      datasets: [
        { label:'Vendidos',    data:eventosData.vendidos,    backgroundColor:'#7c3aed', borderRadius:6, barPercentage:0.6 },
        { label:'Disponíveis', data:eventosData.disponiveis, backgroundColor:'#e9e9ea', borderRadius:6, barPercentage:0.6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: {
          display: true, position:'bottom',
          labels: { usePointStyle:true, pointStyle:'circle', font:{family:'Poppins',size:12}, color:'#6b7280', padding:20 }
        },
        tooltip: { backgroundColor:'#111827', titleFont:{family:'Poppins',size:12}, bodyFont:{family:'Poppins',size:13}, padding:12, cornerRadius:8 }
      },
      scales: {
        x: { grid:{display:false}, ticks:{font:{family:'Poppins',size:11},color:'#9ca3af'} },
        y: { grid:{color:'#f3f4f6'}, min:0, ticks:{font:{family:'Poppins',size:11},color:'#9ca3af',stepSize:50} }
      }
    }
  });
}

// ─────────────────────────────────────────────
// PERÍODO DOS GRÁFICOS
// ─────────────────────────────────────────────
function setPeriod(btn, period) {
  currentPeriod = period;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (!salesChartInst) return;
  const d = chartData[period];
  salesChartInst.data.labels           = d.labels;
  salesChartInst.data.datasets[0].data = d.data;
  salesChartInst.update('active');
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO ENTRE SEÇÕES
// ─────────────────────────────────────────────
function showSection(sectionId, btn) {
  document.querySelectorAll('.dsection').forEach(s => s.classList.remove('active-section'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active-section');

  document.querySelectorAll('.dnav-tab').forEach(t => t.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    document.querySelectorAll('.dnav-tab').forEach(t => {
      const m = t.getAttribute('onclick')?.match(/'([^']+)'/);
      if (m && m[1] === sectionId) t.classList.add('active');
    });
  }

  // ⚠️ FIX: gráficos precisam ser recriados DEPOIS que a seção fica visível
  // pois o canvas tem dimensão 0 quando display:none
  if (sectionId === 'dashboard') {
    // aguarda o DOM pintar a seção antes de criar o chart
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { criarGraficos(); });
    });
  }
}

// ─────────────────────────────────────────────
// MODAL DE INGRESSOS
// ─────────────────────────────────────────────
function openTicketModal() {
  const m = document.getElementById('ticketModal');
  if (m) m.style.display = 'flex';
}
function closeTicketModal() {
  const m = document.getElementById('ticketModal');
  if (m) m.style.display = 'none';
}
function initTicketInput() {
  const total = document.getElementById('totalTickets');
  const avail = document.getElementById('availableTickets');
  if (!total || !avail) return;
  const sold = 156;
  total.addEventListener('input', () => {
    avail.value = Math.max(0, (parseInt(total.value) || 0) - sold);
  });
}

// ─────────────────────────────────────────────
// FILTRO DA TABELA DE VENDAS
// ─────────────────────────────────────────────
function filterSales() {
  const query  = (document.getElementById('salesSearch')?.value  || '').toLowerCase();
  const status = (document.getElementById('statusFilter')?.value || '').toLowerCase();
  const rows   = document.querySelectorAll('#salesTableBody tr');

  let visible = 0;
  let totalVal = 0;

  rows.forEach(row => {
    const matchQuery  = !query  || (row.dataset.name  || '').includes(query) || (row.dataset.event || '').includes(query);
    const matchStatus = !status || (row.dataset.status || '') === status;

    if (matchQuery && matchStatus) {
      row.style.display = '';
      visible++;
      const valCell = row.querySelectorAll('td')[3]?.innerText || '';
      const num = parseFloat(valCell.replace(/[^\d,]/g,'').replace(',','.')) || 0;
      totalVal += num;
    } else {
      row.style.display = 'none';
    }
  });

  const countEl = document.getElementById('tableCount');
  const totalEl = document.getElementById('tableTotal');
  if (countEl) countEl.textContent = visible + ' transaç' + (visible === 1 ? 'ão' : 'ões');
  if (totalEl) totalEl.textContent = 'R$ ' + totalVal.toLocaleString('pt-BR', {minimumFractionDigits:2});
}

// ─────────────────────────────────────────────
// FILTRO DE NOTIFICAÇÕES
// ─────────────────────────────────────────────
function filterNotif(btn, cat) {
  document.querySelectorAll('.nf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#notifList .notif-item').forEach(item => {
    item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
  });
}

// ─────────────────────────────────────────────
// MARCAR TODAS COMO LIDAS
// ─────────────────────────────────────────────
function markAllRead() {
  document.querySelectorAll('.notif-unread').forEach(el => el.classList.remove('notif-unread'));
  document.querySelectorAll('.ni-new').forEach(el => el.remove());
  setUnreadCount(0);
  showToast('Todas as notificações foram marcadas como lidas.', 'success');
}

// ─────────────────────────────────────────────
// NOTIFICAÇÕES INDIVIDUAIS CLICÁVEIS
// Ao clicar em uma notificação não lida, marca como lida
// ─────────────────────────────────────────────
function initNotifClicks() {
  document.querySelectorAll('#notifList .notif-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      if (item.classList.contains('notif-unread')) {
        item.classList.remove('notif-unread');
        const tag = item.querySelector('.ni-new');
        if (tag) tag.remove();
        setUnreadCount(unreadCount - 1);
        if (unreadCount === 0) {
          showToast('Todas as notificações foram lidas!', 'success');
        }
      }
    });
  });
}

// ─────────────────────────────────────────────
// MODAL DE EDIÇÃO GENÉRICO
// ─────────────────────────────────────────────
function openEditModal(tipo, nome) {
  // Cria modal dinamicamente se não existir
  let overlay = document.getElementById('editModalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'editModalOverlay';
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.5);
      display:flex; justify-content:center; align-items:center; z-index:9999;
    `;
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="background:#fff; border-radius:16px; padding:32px; width:480px; max-width:94vw;
                box-shadow:0 20px 60px rgba(0,0,0,.2); font-family:'Poppins',sans-serif;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h2 style="font-size:18px; font-weight:700; margin:0;">Editar ${tipo}</h2>
          <p style="font-size:13px; color:#6b7280; margin:4px 0 0;">${nome}</p>
        </div>
        <button onclick="closeEditModal()" style="background:#f3f4f6; border:none; width:32px; height:32px;
          border-radius:50%; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;">✕</button>
      </div>
      <div style="background:#f5f0ff; border:1px solid #e9d5ff; border-left:4px solid #7c3aed;
                  border-radius:8px; padding:14px 16px; margin-bottom:24px;
                  font-size:13px; color:#374151; line-height:1.6;">
        <strong style="color:#7c3aed;">📋 Funcionalidade em implementação</strong><br>
        A edição completa de ${tipo.toLowerCase()}s será conectada ao banco de dados na próxima sprint.
        Por enquanto você pode ajustar os campos abaixo (simulação local).
      </div>
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#6b7280; display:block; margin-bottom:6px;">
            Nome do ${tipo}
          </label>
          <input type="text" value="${nome}" style="width:100%; padding:10px 14px; border:1px solid #e5e7eb;
            border-radius:8px; font-size:14px; font-family:'Poppins',sans-serif; outline:none; box-sizing:border-box;"
            onfocus="this.style.borderColor='#7c3aed'" onblur="this.style.borderColor='#e5e7eb'">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#6b7280; display:block; margin-bottom:6px;">
            Status
          </label>
          <select style="width:100%; padding:10px 14px; border:1px solid #e5e7eb; border-radius:8px;
            font-size:14px; font-family:'Poppins',sans-serif; outline:none; background:#fff; box-sizing:border-box;">
            <option>Ativo / Aberto</option>
            <option>Agendado</option>
            <option>Pausado</option>
            <option>Encerrado</option>
          </select>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:24px;">
        <button onclick="closeEditModal()" style="background:#f3f4f6; color:#374151; border:none;
          padding:10px 22px; border-radius:8px; font-size:13px; font-weight:600;
          font-family:'Poppins',sans-serif; cursor:pointer;">Cancelar</button>
        <button onclick="saveEditModal('${nome}')" style="background:linear-gradient(135deg,#a78bfa,#7c3aed); color:#fff; border:none;
          padding:10px 22px; border-radius:8px; font-size:13px; font-weight:600;
          font-family:'Poppins',sans-serif; cursor:pointer;">Salvar alterações</button>
      </div>
    </div>
  `;

  overlay.style.display = 'flex';
}

function closeEditModal() {
  const overlay = document.getElementById('editModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function saveEditModal(nome) {
  closeEditModal();
  showToast('"' + nome + '" atualizado com sucesso! (simulação local)', 'success');
}

// ─────────────────────────────────────────────
// SISTEMA DE TOAST (feedback visual)
// ─────────────────────────────────────────────
function showToast(msg, tipo) {
  // Remove toasts antigos
  document.querySelectorAll('.dash-toast').forEach(t => t.remove());

  const colors = { success:'#16a34a', error:'#ef4444', info:'#7c3aed', warn:'#f59e0b' };
  const icons  = { success:'✓', error:'✕', info:'ℹ', warn:'⚠' };

  const toast = document.createElement('div');
  toast.className = 'dash-toast';
  toast.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:99999;
    background:#111827; color:#fff; padding:14px 20px;
    border-radius:10px; font-family:'Poppins',sans-serif; font-size:13px; font-weight:500;
    display:flex; align-items:center; gap:10px;
    box-shadow:0 8px 24px rgba(0,0,0,.25);
    animation:toastIn .25s ease; max-width:360px; line-height:1.4;
  `;

  const dot = document.createElement('span');
  dot.style.cssText = `display:inline-flex; align-items:center; justify-content:center;
    width:22px; height:22px; border-radius:50%; background:${colors[tipo]||colors.info};
    font-size:12px; font-weight:700; flex-shrink:0;`;
  dot.textContent = icons[tipo] || 'ℹ';

  toast.appendChild(dot);
  toast.appendChild(document.createTextNode(msg));
  document.body.appendChild(toast);

  // Injetar keyframes uma vez
  if (!document.getElementById('toastStyle')) {
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = `
      @keyframes toastIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes toastOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(12px)} }
    `;
    document.head.appendChild(s);
  }

  setTimeout(() => {
    toast.style.animation = 'toastOut .25s ease forwards';
    setTimeout(() => toast.remove(), 260);
  }, 3500);
}

// ─────────────────────────────────────────────
// FECHAR MODAIS COM ESC
// ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeTicketModal();
    closeEditModal();
  }
});

// Fechar modal clicando no overlay
document.addEventListener('click', e => {
  const modalOv = document.getElementById('ticketModal');
  if (e.target === modalOv) closeTicketModal();
  const editOv = document.getElementById('editModalOverlay');
  if (e.target === editOv) closeEditModal();
});

// ─────────────────────────────────────────────
// BOTÕES DE EDITAR (delegação de eventos)
// Detecta clique em qualquer botão ev-btn--purple dentro de ev-card
// ─────────────────────────────────────────────
function initEditButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.ev-btn--purple');
    if (!btn) return;
    const card = btn.closest('.ev-card');
    if (!card) return;
    const titulo = card.querySelector('.ev-title')?.textContent?.trim() || 'Item';

    // Descobre se é evento ou estabelecimento
    const secao = card.closest('#eventos') ? 'Evento' : 'Estabelecimento';
    openEditModal(secao, titulo);
  });
}

// ─────────────────────────────────────────────
// EXPORTAÇÃO EXCEL (lógica original preservada)
// ─────────────────────────────────────────────
function initExport() {
  const btn = document.getElementById('btnExport');
  if (!btn) return;

  btn.addEventListener('click', e => {
    e.preventDefault();
    const wb = XLSX.utils.book_new();

    const resumo = [
      { Indicador:'Total de Vendas',   Valor: document.getElementById('total-vendas')?.innerText    || '' },
      { Indicador:'Visualizações',     Valor: document.getElementById('eventos-ativos')?.innerText  || '' },
      { Indicador:'Avaliação Média',   Valor: document.getElementById('avaliacao-media')?.innerText || '' }
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo), 'Resumo');

    const vendas = [];
    document.querySelectorAll('#salesTableBody tr').forEach(row => {
      const cols = row.querySelectorAll('td');
      if (cols.length < 6) return;
      vendas.push({
        Cliente:    cols[0]?.innerText.trim() || '',
        Evento:     cols[1]?.innerText || '',
        Quantidade: cols[2]?.innerText || '',
        Total:      cols[3]?.innerText || '',
        Data:       cols[4]?.innerText || '',
        Status:     cols[5]?.innerText.trim() || ''
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vendas), 'Histórico de Vendas');

    const info = [{ Informação:'Relatório gerado em', Valor: new Date().toLocaleString('pt-BR') }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(info), 'Informações');

    XLSX.writeFile(wb, 'relatorio_dashboard_completo.xlsx');
    showToast('Relatório exportado com sucesso!', 'success');
  });
}

// ─────────────────────────────────────────────
// BOTÕES DE NAVEGAÇÃO (Criar Evento / Novo Estabelecimento)
// Ajuste os caminhos abaixo conforme sua estrutura de pastas
// ─────────────────────────────────────────────
function initNavButtons() {
  // AJUSTE: Verifique se os nomes das pastas no VS Code são exatamente esses.
  // Servidores web diferenciam 'Criar' de 'criar'.
  const PATHS = {
    criarEvento: '/frontend/criareventos/criareventos.html',
    criarEstabelecimento: '/frontend/criarEstabelecimentos/criarEstabelecimentos.html',
  };

  // Função auxiliar para evitar repetição de código (DRY - Don't Repeat Yourself)
  const setupClickEvents = (selector) => {
    const buttons = document.querySelectorAll(selector);
    
    buttons.forEach(btn => {
      const txt = btn.textContent.trim().toLowerCase(); // Convertendo para minúsculo para facilitar a busca

      if (txt.includes('evento')) {
        btn.addEventListener('click', () => {
          window.location.href = PATHS.criarEvento;
        });
      } else if (txt.includes('estabelecimento')) {
        btn.addEventListener('click', () => {
          window.location.href = PATHS.criarEstabelecimento;
        });
      }
    });
  };

  // Aplica a lógica para os dois tipos de botões
  setupClickEvents('.btn-quick');
  setupClickEvents('.btn-create');
}

// Não esqueça de chamar a função!
initNavButtons();

  // Botões dentro das seções
  document.querySelectorAll('.btn-create').forEach(btn => {
    const txt = btn.textContent.trim();

    if (txt.includes('Criar Evento')) {
      btn.addEventListener('click', () => {
        window.location.href = PATHS.criarEvento;
      });
    }

    if (txt.includes('Estabelecimento')) {
      btn.addEventListener('click', () => {
        window.location.href = PATHS.criarEstabelecimento;
      });
    }
  });

// ─────────────────────────────────────────────
// BOTÃO SALVAR INGRESSOS no modal
// ─────────────────────────────────────────────
function initSaveTickets() {
  const btn = document.querySelector('.btn-save-m');
  if (!btn) return;
  btn.addEventListener('click', () => {
    closeTicketModal();
    showToast('Quantidade de ingressos atualizada com sucesso!', 'success');
  });
}

// ─────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Gráficos
  criarGraficos();

  // Interatividade
  initTicketInput();
  initExport();
  initNavButtons();
  initEditButtons();
  initNotifClicks();
  initSaveTickets();

  // Badge e alerta iniciais
  setUnreadCount(3);
});
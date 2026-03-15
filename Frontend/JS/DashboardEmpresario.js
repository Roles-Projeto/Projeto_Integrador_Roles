
// ====== GRÁFICO DE VENDAS ======
const salesCtx = document.getElementById('salesChart');

new Chart(salesCtx, {
    type: 'line',
    data: {
        labels: ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'],
        datasets: [{
            label: 'Vendas',
            data: [8000, 12000, 16000, 21000, 30000, 45000],
            borderColor: '#A78BFA',
            backgroundColor: 'rgba(167,139,250,0.35)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#A78BFA',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#A78BFA',
            pointHoverBorderColor: '#FFFFFF',
            pointHoverBorderWidth: 2
        }]
    },
    options: {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
                borderColor: '#A78BFA',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                padding: 12,
                callbacks: {
                    label: function (context) {
                        return `R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
                    },
                    title: function (tooltipItems) {
                        return `Mês: ${tooltipItems[0].label}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#777'
                }
            },
            y: {
                grid: {
                    borderDash: [6, 6],
                    color: '#DDD'
                },
                ticks: {
                    color: '#777',
                    callback: function (value) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    }
                }
            }
        },
        // Configurações de hover
        hover: {
            mode: 'nearest',
            intersect: true
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    }
});

// ====== GRÁFICO DE EVENTOS ======
const ratingCtx = document.getElementById('ratingChart');

new Chart(ratingCtx, {
    type: 'bar',
    data: {
        labels: ['Festival Eletrônico', 'Live Jazz Night', 'Happy Hour'],
        datasets: [
            {
                label: 'Disponíveis',
                data: [110, 45, 100],
                backgroundColor: '#D1D1D6',
                borderRadius: 8,
            },
            {
                label: 'Vendidos',
                data: [190, 155, 0],
                backgroundColor: '#A78BFA',
                borderRadius: 8,
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#777' }
            },
            y: {
                min: 0,
                max: 220,
                grid: {
                    borderDash: [6, 6],
                    color: '#DDD'
                },
                ticks: { color: '#777' }
            }
        }
    }
});

function showSection(sectionId, btn) {
    // Esconde todas as seções
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.classList.remove('active-section');
    });

    // Mostra somente a seção clicada
    document.getElementById(sectionId).classList.add('active-section');

    // Remove active de todos os botões
    document.querySelectorAll('.tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Adiciona active ao botão clicado
    if (btn) btn.classList.add('active');
}

// Adiciona evento automático para tabs
document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('onclick').match(/'(.+)'/)[1];
        showSection(target, tab);
    });
});

// Botões de relatório → abre aba de vendas
document.querySelectorAll('.btn-report').forEach(btn => {
    btn.addEventListener('click', () => {
        showSection('vendas');
    });
});

// Botões de ingressos → alerta
document.querySelectorAll('.btn-tickets').forEach(btn => {
    btn.addEventListener('click', () => {
        alert("Tela de ingressos ainda não foi criada!");
    });
});

document.querySelector('.btn-export').addEventListener('click', () => {
    const blob = new Blob(["Relatório fictício do Dashboard"], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_dashboard.txt"; // pode ser .pdf se usar biblioteca
    link.click();
});

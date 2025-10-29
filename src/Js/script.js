/* ==================================================
// FUNÇÕES GLOBAIS FORA DO DOMCONTENTLOADED
================================================== */

// Função auxiliar para injetar estilo na mensagem de sucesso do Contato
function adicionarEstiloMensagem() {
    const style = document.createElement('style');
    style.innerHTML = `
        .mensagem-sucesso {
            text-align: center;
            max-width: 600px;
            margin: 80px auto;
            padding: 40px;
            border: 2px solid #0c0c1d;
            border-radius: 10px;
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .mensagem-sucesso h2 {
            font-size: 28px;
            color: #0c0c1d;
            margin-bottom: 15px;
        }
        .mensagem-sucesso p {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
        }
        .mensagem-sucesso a {
            color: #0c0c1d;
            font-weight: 600;
            text-decoration: none;
        }
        .mensagem-sucesso a:hover {
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
}

// Função auxiliar para atualizar o contador de eventos
function atualizarContador() {
    // Verifica se o container de eventos existe antes de tentar selecionar
    const eventosContainer = document.getElementById('eventosContainer');
    if (!eventosContainer) return; 

    const todos = Array.from(document.querySelectorAll('.evento-card'));
    const visiveis = todos.filter(c => c.style.display !== 'none');
    
    const qtdEventosElement = document.getElementById('qtdEventos');
    if (qtdEventosElement) {
         qtdEventosElement.innerText = visiveis.length;
    }
}


/* ==================================================
// INICIALIZAÇÃO ÚNICA DE DOM: TODAS AS LÓGICAS AQUI DENTRO
================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Script.js unificado carregado. Iniciando todas as funcionalidades...");

    /* ==================================================
    // --- LÓGICA DO CONTATO  ---
    ================================================== */
    const formContato = document.getElementById('form-contato');
    const contatoContainer = document.querySelector('.contato-container');
    if (formContato && contatoContainer) {
        formContato.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(formContato);
            const nome = formData.get('nome');

            const mensagemSucesso = document.createElement('div');
            mensagemSucesso.className = 'mensagem-sucesso';

            mensagemSucesso.innerHTML = `
                <h2>Mensagem Enviada com Sucesso!</h2>
                <p>Obrigado pelo seu contato, <b>${nome || 'Cliente'}</b>! Retornaremos o mais breve possível.</p>
                <p>Enquanto isso, que tal conferir os <a href="../locais/index.html">melhores rolês</a>?</p>
            `;

            contatoContainer.innerHTML = '';
            contatoContainer.appendChild(mensagemSucesso);

            adicionarEstiloMensagem();
        });
    }

    /* ==================================================
    // --- LÓGICA DE EVENTOS (Filtros e Contador) ---
    ================================================== */
    const pillsContainer = document.getElementById('pillsContainer');
    if (pillsContainer) {
        // Inicializa o contador (apenas se o container existir)
        atualizarContador(); 
        
        // Adiciona MutationObserver
        const observer = new MutationObserver(() => atualizarContador());
        observer.observe(document.getElementById('eventosContainer'), { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        
        // Adiciona o listener de clique para os filtros
        pillsContainer.addEventListener('click', (e) => {
            if (!e.target.matches('.pill')) return;

            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');

            const cat = e.target.getAttribute('data-cat');
            const cards = document.querySelectorAll('.evento-card');

            cards.forEach(card => {
                if (cat === 'todas') {
                    card.style.display = 'flex';
                    return;
                }
                const cardCat = (card.getAttribute('data-categoria') || '').toLowerCase();
                card.style.display = cardCat.includes(cat) ? 'flex' : 'none';
            });

            atualizarContador();
        });
    }

    /* ==================================================
    // --- LÓGICA DE PLANOS (Seleção e Formulário de Cadastro) ---
    ================================================== */

    const planCards = document.querySelectorAll('.plan-card');
    const planoEscolhidoInput = document.getElementById('plano_escolhido'); 

    if (planCards.length > 0) {
        // 1. Define o plano inicial
        const initialSelectedCard = document.querySelector('.plan-card.selected');
        if (initialSelectedCard && planoEscolhidoInput) {
            planoEscolhidoInput.value = initialSelectedCard.querySelector('.plan-name').textContent.trim();
        }

        // 2. Lógica de Clique
        planCards.forEach(card => {
            card.addEventListener('click', (event) => {
                
                event.preventDefault(); 
                event.stopPropagation();
                
                planCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const selectedPlan = card.querySelector('.plan-name').textContent.trim();
                if (planoEscolhidoInput) {
                    planoEscolhidoInput.value = selectedPlan;
                }
            });
        });
    }

    // 3. Lógica de Submissão do Formulário de Cadastro
    const formCadastro = document.querySelector('.registration-form');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const responsavelNome = document.getElementById('responsavel_nome').value.trim();
            const cnpj = document.getElementById('cnpj').value.trim();
            const estabelecimentoNome = document.getElementById('estabelecimento_nome').value.trim();
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar_senha').value;
            const planoSelecionado = planoEscolhidoInput ? planoEscolhidoInput.value : 'NÃO SELECIONADO';
            
            if (responsavelNome === "" || estabelecimentoNome === "" || cnpj === "" || senha === "") {
                alert("Por favor, preencha os campos de Nome, Estabelecimento, CNPJ e Senha.");
                return;
            }

            if (senha.length < 8) {
                alert("A senha deve ter no mínimo 8 caracteres.");
                return;
            }
            
            if (senha !== confirmarSenha) {
                alert("As senhas não coincidem! Verifique e tente novamente.");
                return;
            }
            
            setTimeout(() => {
                alert(`Parabéns, ${responsavelNome}! \n\nSeu estabelecimento "${estabelecimentoNome}" foi cadastrado no plano "${planoSelecionado}".\n\nPróximo passo: Integração de Pagamento.`);
            }, 500);
            
        });
    } 

    /* ==================================================
    // --- LÓGICA DE INGRESSOS (Ver mais detalhes/eventos) ---
    ================================================== */

    const botoesSelecionar = document.querySelectorAll('.botao-selecionar');
    
    // Procura o .valor-detalhe DENTRO do quarto .linha-detalhe (que é o 'Ingresso')
    const tipoIngressoResumo = document.querySelector('.card-garantia-ingresso .detalhes-data-local .linha-detalhe:nth-child(4) .valor-detalhe');
    
    // Onde aparece o preço total no resumo
    const valorIngressoResumo = document.querySelector('.card-garantia-ingresso .valor-ingresso');

    if (botoesSelecionar.length > 0 && valorIngressoResumo && tipoIngressoResumo) {
        
        botoesSelecionar.forEach(botao => {
            botao.addEventListener('click', (event) => {
                
                // 1. Remove o estado 'selecionado' de todos os botões
                botoesSelecionar.forEach(btn => {
                    btn.classList.remove('selecionado');
                    btn.textContent = 'Selecionar'; 
                });

                // 2. Adiciona o estado 'selecionado' ao botão clicado
                const botaoClicado = event.currentTarget;
                botaoClicado.classList.add('selecionado');
                botaoClicado.textContent = 'Selecionado';
                
                // 3. Atualiza o card de 'Garantir Ingresso' (resumo de compra)
                const tipoIngressoSelecionado = botaoClicado.getAttribute('data-tipo');
                const precoSelecionado = botaoClicado.previousElementSibling.textContent;

                const tipoFormatado = tipoIngressoSelecionado.charAt(0).toUpperCase() + tipoIngressoSelecionado.slice(1);
                tipoIngressoResumo.textContent = tipoFormatado; 

                valorIngressoResumo.textContent = precoSelecionado;
            });
        });

    } else {
        // Console log só aparece se houver botões e não houver resumo ou vice-versa,  // 
        console.warn("Lógica de Seleção de Ingressos: Elementos de ingressos ou de resumo de compra não encontrados.");
    }
});
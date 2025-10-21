
/* ==================================================
==================== Contato ==========================
================================================== */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-contato');
  const contatoContainer = document.querySelector('.contato-container');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(form);
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
});


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

/* ==================================================
==================== EVENTOS ==========================
================================================== */
function atualizarContador() {
  const todos = Array.from(document.querySelectorAll('.evento-card'));
  const visiveis = todos.filter(c => c.style.display !== 'none');
  document.getElementById('qtdEventos').innerText = visiveis.length;
}
atualizarContador(); // chamada inicial

// atualizar contador sempre que a busca ou filtros rodarem:
// já temos listeners no seu script; garanta chamar atualizarContador() dentro deles.
// Para robustez, adiciona observer simples:
const observer = new MutationObserver(() => atualizarContador());
observer.observe(document.getElementById('eventosContainer'), { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

document.getElementById('pillsContainer').addEventListener('click', (e) => {
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

// =================================================================
// LÓGICA DE INTERAÇÃO DA PÁGINA
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Script.js carregado. Iniciando funcionalidades...");

    // ------------------------------------------
    // LÓGICA DE SELEÇÃO DE PLANOS
    // ------------------------------------------
    
    const planCards = document.querySelectorAll('.plan-card');
    const planoEscolhidoInput = document.getElementById('plano_escolhido'); 

    // Define o plano inicial
    const initialSelectedCard = document.querySelector('.plan-card.selected');
    if (initialSelectedCard && planoEscolhidoInput) {
        planoEscolhidoInput.value = initialSelectedCard.querySelector('.plan-name').textContent.trim();
        console.log(`Plano inicial definido no input: ${planoEscolhidoInput.value}`);
    }

    planCards.forEach(card => {
        
        card.addEventListener('click', (event) => {
            
            // CRUCIAL: Impede o comportamento padrão do clique (como se fosse um link/botão de submit)
            event.preventDefault(); 
            event.stopPropagation();
            
            // Remove a classe 'selected' de todos os cartões
            planCards.forEach(c => c.classList.remove('selected'));
            
            // Adiciona a classe 'selected' apenas ao cartão clicado
            card.classList.add('selected');

            // ATUALIZA O VALOR DO CAMPO OCULTO com o nome do plano (removendo espaços em branco)
            const selectedPlan = card.querySelector('.plan-name').textContent.trim();
            if (planoEscolhidoInput) {
                planoEscolhidoInput.value = selectedPlan;
            }
            
            console.log(`Plano selecionado com clique: ${selectedPlan}`);
            
        });
    });

    // ------------------------------------------
    // LÓGICA DE FORMULÁRIO (Submissão e Validação)
    // ------------------------------------------

    const form = document.querySelector('.registration-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio real do formulário
            
            console.log('Tentativa de submissão interceptada. Iniciando validação...');

            // --- Validação Básica ---
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
            
            // --- Simulação de Sucesso ---
            
            console.log('✅ Validação de Cadastro OK!');
            console.log(`Dados a serem enviados: {Responsável: ${responsavelNome}, CNPJ: ${cnpj}, Plano: ${planoSelecionado}}`);
            
            // Simula o envio para o servidor
            setTimeout(() => {
                 alert(`Parabéns, ${responsavelNome}! \n\nSeu estabelecimento "${estabelecimentoNome}" foi cadastrado no plano "${planoSelecionado}".\n\nPróximo passo: Integração de Pagamento.`);
                // Aqui você redirecionaria o usuário: window.location.href = '/sucesso';
            }, 500);
           
        });
    } else {
         console.error("ERRO: Formulário com a classe '.registration-form' não encontrado.");
    }
    
});
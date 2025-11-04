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

document.addEventListener('DOMContentLoaded', () => {
    const editProfileButton = document.getElementById('editProfileButton');
    const saveProfileButton = document.getElementById('saveProfileButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const editProfileSection = document.getElementById('editProfileSection');

    // Função para mostrar a seção de edição
    function showEditSection() {
        editProfileSection.classList.remove('hidden');
        // Você pode esconder outras seções se desejar
        // Ex: document.querySelector('.favorite-places-section').classList.add('hidden');
        // E o botão "Editar Perfil"
        editProfileButton.classList.add('hidden');
    }

    // Função para esconder a seção de edição
    function hideEditSection() {
        editProfileSection.classList.add('hidden');
        // Você pode mostrar as outras seções novamente
        // Ex: document.querySelector('.favorite-places-section').classList.remove('hidden');
        // E o botão "Editar Perfil"
        editProfileButton.classList.remove('hidden');
    }

    // Evento para o botão "Editar Perfil"
    if (editProfileButton) {
        editProfileButton.addEventListener('click', showEditSection);
    }

    // Evento para o botão "Salvar"
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', () => {
            // Aqui você adicionaria a lógica para salvar os dados
            // Ex: coletar valores dos inputs, enviar para um servidor, etc.
            console.log('Dados do perfil salvos!');
            // Depois de salvar, esconde a seção de edição
            hideEditSection();
            // Opcional: Atualizar os dados exibidos na sidebar
            const newName = document.getElementById('editName').value;
            const newEmail = document.getElementById('editEmail').value;
            const newPhone = document.getElementById('editPhone').value;

            document.querySelector('.profile-card h2').textContent = newName;
            // Para email e telefone, seria necessário ajustar o HTML se eles tivessem IDs específicos ou fossem mais dinâmicos
            // Por simplicidade, para este exemplo, apenas o nome é atualizado aqui.
        });
    }

    // Evento para o botão "Cancelar"
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', hideEditSection);
    }
});

// tela de perfil usuario  



const userData = {
  nome: "Usuário Google",
  email: "usuario@gmail.com",
  telefone: "(11) 99999-9999",
  cidade: "São Paulo, SP",
  membroDesde: "Jan 2024",
  avatar: "https://via.placeholder.com/120/4a148c/ffffff?text=UG",
  favoritos: [
    { nome: "Bar do João", tipo: "Bar", nota: 4.8 },
    { nome: "Restaurante Villa", tipo: "Restaurante", nota: 4.9 },
    { nome: "Club Manhattan", tipo: "Balada", nota: 4.7 },
  ],
  recentes: [
    { nome: "Pizzaria Bella", data: "14/01/2024", nota: 5 },
    { nome: "Café Central", data: "09/01/2024", nota: 5 },
    { nome: "Bar Rooftop", data: "07/01/2024", nota: 5 },
  ],
};

// --- FUNÇÕES DE RENDERIZAÇÃO E INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
  // Elementos do Card Lateral
  const nameDisplay = document.getElementById("user-name");
  const emailDisplay = document.getElementById("user-email");
  const phoneDisplay = document.getElementById("user-phone");
  const cityDisplay = document.getElementById("user-location");
  const memberDisplay = document.getElementById("user-member-since");
  const avatar = document.getElementById("user-avatar");
  const avatarHeader = document.getElementById("user-avatar-header");

  // Elementos de Conteúdo
  const favContainer = document.getElementById("favoritos-list");
  const recContainer = document.getElementById("recentes-list");

  // Campos de Edição
  const editNome = document.getElementById("edit-nome");
  const editEmail = document.getElementById("edit-email");
  const editTelefone = document.getElementById("edit-telefone");

  // Função para renderizar os dados do usuário e listas
  const renderizarPerfil = () => {
    nameDisplay.textContent = userData.nome;
    emailDisplay.textContent = userData.email;
    phoneDisplay.textContent = userData.telefone;
    cityDisplay.textContent = userData.cidade;
    memberDisplay.textContent = userData.membroDesde;
    avatar.src = userData.avatar;
    avatarHeader.src = userData.avatar;

    // Preenche campos de edição
    editNome.value = userData.nome;
    editEmail.value = userData.email;
    editTelefone.value = userData.telefone;

    // Renderiza Favoritos
    favContainer.innerHTML = "";
    userData.favoritos.forEach((fav) => {
      const div = document.createElement("div");
      div.classList.add("lista-item");
      div.innerHTML = `
        <div>
          <strong>${fav.nome}</strong><br>
          <small>${fav.tipo}</small>
        </div>
        <div class="estrelas">⭐ ${fav.nota}</div>
      `;
      favContainer.appendChild(div);
    });

    // Renderiza Recentes
    recContainer.innerHTML = "";
    userData.recentes.forEach((r) => {
      const div = document.createElement("div");
      div.classList.add("lista-item");
      const estrelasHtml = "⭐".repeat(r.nota);
      div.innerHTML = `
        <div>
          <strong>${r.nome}</strong><br>
          <small>${r.data}</small>
        </div>
        <div class="estrelas">${estrelasHtml}</div>
      `;
      recContainer.appendChild(div);
    });
  };

  renderizarPerfil(); // Inicializa o perfil na tela

  // --- LÓGICA DE EDIÇÃO E BOTÕES ---
  const editarBtn = document.getElementById("editar-btn");
  const sairBtn = document.getElementById("sair-btn");
  const salvarBtn = document.getElementById("salvar-btn");
  const cancelarBtn = document.getElementById("cancelar-btn");

  const conteudoCard = document.querySelector(".conteudo");
  const edicaoCard = document.querySelector(".editar-perfil-card");

  const entrarModoEdicao = () => {
    conteudoCard.classList.add("oculto");
    edicaoCard.classList.remove("oculto");
    editNome.value = userData.nome;
    editEmail.value = userData.email;
    editTelefone.value = userData.telefone;
  };

  const sairModoEdicao = () => {
    edicaoCard.classList.add("oculto");
    conteudoCard.classList.remove("oculto");
  };

  editarBtn?.addEventListener("click", entrarModoEdicao);
  cancelarBtn?.addEventListener("click", sairModoEdicao);

  sairBtn?.addEventListener("click", () => {
    alert("Você saiu da sua conta!");
    // Aqui vai a lógica real de logout, se necessário
  });

  salvarBtn?.addEventListener("click", () => {
    const novoNome = editNome.value.trim();
    const novoEmail = editEmail.value.trim();
    const novoTelefone = editTelefone.value.trim();

    if (!novoNome || !novoEmail) {
      alert("Nome e Email são obrigatórios!");
      return;
    }

    userData.nome = novoNome;
    userData.email = novoEmail;
    userData.telefone = novoTelefone;

    renderizarPerfil();
    alert("Perfil atualizado com sucesso!");
    sairModoEdicao();
  });

  // --- ATUALIZAÇÃO DO AVATAR ---
  const avatarInput = document.getElementById("avatar-input");
  avatarInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        userData.avatar = ev.target.result;
        avatar.src = userData.avatar;
        avatarHeader.src = userData.avatar;
      };
      reader.readAsDataURL(file);
    }
  });

  // --- DROPDOWN DO AVATAR NO HEADER ---
  const dropdown = document.getElementById("dropdown-card");

  avatarHeader?.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle("show");
  });

  // Fecha o dropdown ao clicar fora
  document.addEventListener("click", (e) => {
    if (!dropdown?.contains(e.target) && e.target !== avatarHeader) {
      dropdown?.classList.remove("show");
    }
  });
});

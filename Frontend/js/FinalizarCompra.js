/* ==================================================
   VARIÁVEIS GLOBAIS
================================================== */
let PRICE_PER_TICKET = 0.00;
const SERVICE_TAX_RATE = 0.10;
const MAX_AVAILABLE_TICKETS = 85;

let currentPaymentMethod = 'cartao';
let pixTimerInterval = null;

/* ==================================================
   UTILITÁRIOS DE VALIDAÇÃO (ALGORITMOS)
================================================== */
const Validador = {
    nome: (val) => val.trim().split(' ').length >= 2 && val.trim().length > 4, // Exige nome e sobrenome
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    telefone: (val) => val.replace(/\D/g, '').length >= 10,
    cvv: (val) => /^[0-9]{3,4}$/.test(val),
    validade: (val) => {
        if (!/^\d{2}\/\d{2}$/.test(val)) return false;
        const [mes, ano] = val.split('/');
        if (mes < 1 || mes > 12) return false;
        const dataAtual = new Date();
        const anoAtual = parseInt(dataAtual.getFullYear().toString().slice(-2));
        const mesAtual = dataAtual.getMonth() + 1;
        if (ano < anoAtual || (ano == anoAtual && mes < mesAtual)) return false;
        return true;
    },
    cartao: (val) => val.replace(/\D/g, '').length >= 13,
    cpf: (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }
};

/* ==================================================
   FEEDBACK VISUAL E VALIDAÇÃO DE CAMPOS
================================================== */
function setFieldStatus(inputId, isValid, feedbackId, msgErro) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    if (!input) return false;

    if (isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (feedback) { feedback.textContent = ''; feedback.className = 'field-feedback ok'; }
        return true;
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        if (feedback) { feedback.textContent = msgErro; feedback.className = 'field-feedback err'; }
        return false;
    }
}

function validarDadosPessoais() {
    const vNome = setFieldStatus('nome', Validador.nome(document.getElementById('nome').value), 'fb-nome', 'Insira seu nome completo');
    const vCpf = setFieldStatus('cpf', Validador.cpf(document.getElementById('cpf').value), 'fb-cpf', 'CPF inválido');
    const vEmail = setFieldStatus('email', Validador.email(document.getElementById('email').value), 'fb-email', 'E-mail inválido');
    const vTel = setFieldStatus('telefone', Validador.telefone(document.getElementById('telefone').value), 'fb-telefone', 'Telefone inválido');
    return vNome && vCpf && vEmail && vTel;
}

function validarDadosCartao() {
    const vNum = setFieldStatus('numero-cartao', Validador.cartao(document.getElementById('numero-cartao').value), 'fb-cartao', 'Número inválido');
    const vNome = setFieldStatus('nome-cartao', Validador.nome(document.getElementById('nome-cartao').value), 'fb-nome-cartao', 'Insira o nome impresso');
    const vValidade = setFieldStatus('validade', Validador.validade(document.getElementById('validade').value), 'fb-validade', 'Data inválida/expirada');
    const vCvv = setFieldStatus('cvv', Validador.cvv(document.getElementById('cvv').value), 'fb-cvv', 'CVV inválido');
    return vNum && vNome && vValidade && vCvv;
}

// Configura eventos Blur para validação em tempo real
function configurarValidacaoRealTime() {
    const campos = [
        { id: 'nome', validador: Validador.nome, fb: 'fb-nome', err: 'Insira seu nome completo' },
        { id: 'cpf', validador: Validador.cpf, fb: 'fb-cpf', err: 'CPF inválido' },
        { id: 'email', validador: Validador.email, fb: 'fb-email', err: 'E-mail inválido' },
        { id: 'telefone', validador: Validador.telefone, fb: 'fb-telefone', err: 'Telefone inválido' },
        { id: 'numero-cartao', validador: Validador.cartao, fb: 'fb-cartao', err: 'Número inválido' },
        { id: 'nome-cartao', validador: Validador.nome, fb: 'fb-nome-cartao', err: 'Insira o nome impresso' },
        { id: 'validade', validador: Validador.validade, fb: 'fb-validade', err: 'Data inválida' },
        { id: 'cvv', validador: Validador.cvv, fb: 'fb-cvv', err: 'CVV inválido' },
    ];

    campos.forEach(campo => {
        const el = document.getElementById(campo.id);
        if (el) {
            el.addEventListener('blur', () => setFieldStatus(campo.id, campo.validador(el.value), campo.fb, campo.err));
        }
    });

    // Sincroniza dados pessoais com os cards de Pix e Boleto
    ['nome', 'cpf'].forEach(id => {
        document.getElementById(id).addEventListener('input', sincronizarResumoPagador);
    });
}

function sincronizarResumoPagador() {
    const nome = document.getElementById('nome').value || '—';
    const cpf = document.getElementById('cpf').value || '—';
    
    document.getElementById('pix-nome-display').textContent = nome;
    document.getElementById('pix-cpf-display').textContent = cpf;
    document.getElementById('boleto-nome-display').textContent = nome;
    document.getElementById('boleto-cpf-display').textContent = cpf;
}

/* ==================================================
   API VIA CEP (VALIDAÇÃO DE ENDEREÇO)
================================================== */
async function buscarCEP(cepInput) {
    const cep = cepInput.value.replace(/\D/g, '');
    const spinner = document.getElementById('spinner-cep');
    const box = document.getElementById('endereco-box');
    
    if (cep.length !== 8) {
        setFieldStatus('cep-boleto', false, 'fb-cep', 'CEP incompleto');
        box.style.display = 'none';
        return false;
    }

    spinner.style.display = 'block';
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) throw new Error('CEP não encontrado');

        document.getElementById('endereco-logradouro').textContent = data.logradouro;
        document.getElementById('endereco-bairro').textContent = data.bairro;
        document.getElementById('endereco-cidade').textContent = data.localidade;
        document.getElementById('endereco-uf').textContent = data.uf;

        box.style.display = 'block';
        setFieldStatus('cep-boleto', true, 'fb-cep', '');
        return true;
    } catch (error) {
        box.style.display = 'none';
        setFieldStatus('cep-boleto', false, 'fb-cep', 'CEP inválido ou não encontrado');
        return false;
    } finally {
        spinner.style.display = 'none';
    }
}

/* ==================================================
   MÁSCARAS
================================================== */
function aplicarMascaras() {
    const masks = {
        cpf: (v) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4'),
        telefone: (v) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2'),
        cartao: (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
        validade: (v) => v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2'),
        cep: (v) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
        cvv: (v) => v.replace(/\D/g, '').slice(0, 4)
    };

    const addMask = (id, maskFn, callback) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', function() { 
            this.value = maskFn(this.value); 
            if(callback) callback(this);
        });
    };

    addMask('cpf', masks.cpf);
    addMask('telefone', masks.telefone);
    addMask('validade', masks.validade);
    addMask('cvv', masks.cvv);
    
    // Identificação básica de bandeira
    addMask('numero-cartao', masks.cartao, (el) => {
        const icon = document.getElementById('card-brand-icon');
        const val = el.value.replace(/\D/g, '');
        icon.className = 'input-icon fas';
        if(val.startsWith('4')) icon.classList.add('fa-cc-visa', 'visa');
        else if(/^5[1-5]/.test(val)) icon.classList.add('fa-cc-mastercard', 'master');
        else if(/^3[47]/.test(val)) icon.classList.add('fa-cc-amex', 'amex');
        else icon.classList.add('fa-credit-card');
    });

    // CEP com chamada a API automática ao atingir 8 dígitos
    addMask('cep-boleto', masks.cep, (el) => {
        if (el.value.replace(/\D/g, '').length === 8) buscarCEP(el);
        else document.getElementById('endereco-box').style.display = 'none';
    });
}

/* ==================================================
   FLUXOS DE PAGAMENTO E CHECKOUT
================================================== */
function switchPaymentMethod(method) {
    document.querySelectorAll('.payment-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.payment-tab').forEach(tab => tab.classList.remove('active'));

    document.getElementById('payment-' + method).classList.add('active');
    document.querySelector('[data-method="' + method + '"]').classList.add('active');
    currentPaymentMethod = method;

    if (method !== 'pix' && pixTimerInterval) {
        clearInterval(pixTimerInterval);
        pixTimerInterval = null;
    }
}

// Submissão Cartão de Crédito
function handleCartaoSubmit() {
    const dadosPessoaisOk = validarDadosPessoais();
    const cartaoOk = validarDadosCartao();

    if (dadosPessoaisOk && cartaoOk) {
        finalizePurchase();
    } else {
        // Rola até o primeiro campo com erro
        const firstError = document.querySelector('.input-wrapper input.invalid');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Submissão PIX
function gerarPix() {
    if (!validarDadosPessoais()) {
        document.getElementById('pix-dados-incompletos').style.display = 'flex';
        return;
    }
    document.getElementById('pix-dados-incompletos').style.display = 'none';
    document.getElementById('pix-step-1').style.display = 'none';
    document.getElementById('pix-step-2').style.display = 'block';

    const totalText = document.getElementById('total').textContent;
    const btnPixPay = document.getElementById('btn-pix-pay');
    
    btnPixPay.innerHTML = `<i class="fas fa-check-circle" style="margin-right:8px;"></i>Já paguei ${totalText}`;
    
    // Adiciona evento para finalizar a compra ao clicar em "Já paguei"
    btnPixPay.onclick = function(e) {
        e.preventDefault();
        finalizePurchase();
    };

    iniciarTimerPix(30 * 60);
}

// Submissão Boleto
function gerarBoleto() {
    const cepInput = document.getElementById('cep-boleto');
    
    if (!validarDadosPessoais()) {
        document.getElementById('boleto-dados-incompletos').style.display = 'flex';
        return;
    }
    if (cepInput.value.replace(/\D/g, '').length !== 8 || cepInput.classList.contains('invalid')) {
        setFieldStatus('cep-boleto', false, 'fb-cep', 'Verifique o CEP antes de emitir');
        return;
    }

    document.getElementById('boleto-dados-incompletos').style.display = 'none';
    document.getElementById('boleto-valor').textContent = document.getElementById('total').textContent;
    
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3); // Simplificado para +3 dias
    document.getElementById('boleto-vencimento').textContent = dataVencimento.toLocaleDateString('pt-BR');
    document.getElementById('boleto-numero').textContent = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

    document.getElementById('boleto-step-1').style.display = 'none';
    document.getElementById('boleto-step-2').style.display = 'block';
}

function iniciarTimerPix(segundos) {
    if (pixTimerInterval) clearInterval(pixTimerInterval);
    const countdownEl = document.getElementById('pix-countdown');

    pixTimerInterval = setInterval(() => {
        if (segundos <= 0) {
            clearInterval(pixTimerInterval);
            if (countdownEl) countdownEl.textContent = 'Expirado';
            return;
        }
        segundos--;
        const min = Math.floor(segundos / 60).toString().padStart(2, '0');
        const sec = (segundos % 60).toString().padStart(2, '0');
        if (countdownEl) countdownEl.textContent = `${min}:${sec}`;
    }, 1000);
}

function copiarCodigo(inputId, feedbackId) {
    const code = document.getElementById(inputId).value;
    navigator.clipboard.writeText(code).then(() => {
        const feedback = document.getElementById(feedbackId);
        feedback.textContent = '✓ Copiado com sucesso!';
        setTimeout(() => feedback.textContent = '', 3000);
    });
}

function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/* ==================================================
   CÁLCULOS E FINALIZAÇÃO
================================================== */
function updatePrice(quantity) {
    const subtotalValue = quantity * PRICE_PER_TICKET;
    const taxValue = subtotalValue * SERVICE_TAX_RATE;
    const totalValue = subtotalValue + taxValue;

    document.getElementById('quantidade').value = quantity;
    document.getElementById('subtotal').textContent = formatBRL(subtotalValue);
    document.getElementById('taxa').textContent = formatBRL(taxValue);
    document.getElementById('total').textContent = formatBRL(totalValue);
    document.getElementById('ticket-price-display').textContent = formatBRL(PRICE_PER_TICKET);
    document.getElementById('subtotal-label').textContent = `Subtotal (${quantity}x)`;

    const btnPagar = document.querySelector('#payment-cartao .btn-pagar');
    if (btnPagar) btnPagar.textContent = `Pagar ${formatBRL(totalValue)}`;
}

function changeQuantity(change) {
    const input = document.getElementById('quantidade');
    let newValue = parseInt(input.value) + change;
    if (newValue >= 1 && newValue <= MAX_AVAILABLE_TICKETS) updatePrice(newValue);
}

function loadEventData() {
    const eventDataString = localStorage.getItem('eventoSelecionado');
    if (eventDataString) {
        const eventData = JSON.parse(eventDataString);
        document.getElementById('event-image').src = eventData.imagem || 'caminho/para/placeholder.jpg';
        document.getElementById('event-name').textContent = eventData.nome || 'Evento Desconhecido';
        document.getElementById('event-date').textContent = eventData.data || '--/--/----';
        document.getElementById('event-time').textContent = eventData.hora || '--:--';
        document.getElementById('event-location').textContent = eventData.local || 'Local Desconhecido';
        document.getElementById('ticket-type').textContent = eventData.ingressoNome || 'Ingresso Padrão';
        PRICE_PER_TICKET = parseFloat(eventData.ingressoPreco) || 30.00;
    } else {
        PRICE_PER_TICKET = 30.00;
    }
}

// NOVA FUNÇÃO: Salva os dados no formato que a página de confirmação espera
function salvarDadosCompra() {
    const quantidade = parseInt(document.getElementById('quantidade').value) || 1;
    const subtotalValue = quantidade * PRICE_PER_TICKET;
    const taxValue = subtotalValue * SERVICE_TAX_RATE;
    const totalValue = subtotalValue + taxValue;

    // Recupera dados básicos do evento se existirem
    const eventDataString = localStorage.getItem('eventoSelecionado');
    let eventData = {};
    if (eventDataString) {
        eventData = JSON.parse(eventDataString);
    }

    const dadosCompra = {
        pedidoID: Math.floor(Math.random() * 90000000 + 10000000).toString(), // Gera um ID aleatório
        imagem: eventData.imagem || document.getElementById('event-image').src,
        nome: eventData.nome || document.getElementById('event-name').textContent,
        data: eventData.data || document.getElementById('event-date').textContent,
        hora: eventData.hora || document.getElementById('event-time').textContent,
        local: eventData.local || document.getElementById('event-location').textContent,
        ingressoPreco: PRICE_PER_TICKET,
        ingressoNome: eventData.ingressoNome || document.getElementById('ticket-type').textContent,
        quantidade: quantidade,
        subtotal: subtotalValue,
        taxaServico: taxValue,
        totalPago: totalValue
    };

    localStorage.setItem('compraConfirmada', JSON.stringify(dadosCompra));
}

function finalizePurchase() {
    console.log('Validado. Salvando dados e redirecionando para confirmação...');
    salvarDadosCompra(); // Chama a nova função antes de redirecionar
    window.location.href = 'confirmacao.html';
}

function downloadBoleto() {
    alert('Boleto baixado com sucesso! Redirecionando...');
    salvarDadosCompra(); // Chama a nova função antes de redirecionar
    window.location.href = 'confirmacao.html';
}

/* ==================================================
   INICIALIZAÇÃO
================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadEventData();
    updatePrice(1);
    aplicarMascaras();
    configurarValidacaoRealTime();
});
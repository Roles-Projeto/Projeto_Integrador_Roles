
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
==================== /////// ==========================
================================================== */
// Botões de alternância Cliente / Empresário
const clienteBtn = document.getElementById("cliente-btn");
const empresarioBtn = document.getElementById("empresario-btn");
const mainText = document.getElementById("main-text");
const subText = document.getElementById("sub-text");

clienteBtn.addEventListener("click", () => {
  clienteBtn.classList.add("active");
  empresarioBtn.classList.remove("active");
  mainText.textContent = "O Rolês conecta você aos melhores lugares da cidade";
  subText.textContent = "Entre rapidamente com";
});

empresarioBtn.addEventListener("click", () => {
  empresarioBtn.classList.add("active");
  clienteBtn.classList.remove("active");
  mainText.textContent = "Cadastre seu estabelecimento e atraia mais clientes";
  subText.textContent = "Entre rapidamente com";
});


// Simulação de login
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (email.value.trim() === "" || senha.value.trim() === "") {
    msg.textContent = "⚠️ Preencha todos os campos!";
    msg.className = "mensagem erro";
  } else {
    msg.textContent = "✅ Login efetuado com sucesso!";
    msg.className = "mensagem sucesso";
    
    // Simula um redirecionamento (pode trocar o link depois)
    setTimeout(() => {
      alert("Bem-vindo ao Rolês, " + (btnCliente.classList.contains("active") ? "Cliente!" : "Empresário!"));
    }, 1000);
  }
});

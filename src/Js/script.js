
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


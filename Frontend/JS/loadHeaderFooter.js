// Função para carregar HTML externo
function loadHTML(url, elementId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${url}: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            // Executa funções do header ou footer, se houver JS dentro
            runEmbeddedScripts(elementId);
        })
        .catch(error => console.error(error));
}

// Função para executar scripts que vieram no HTML
function runEmbeddedScripts(elementId) {
    const container = document.getElementById(elementId);
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
        oldScript.remove();
    });
}

// Carregando header e footer
loadHTML('/frontend/header/header.html', 'header-container');
loadHTML('/frontend/footer/footer.html', 'footer-container');
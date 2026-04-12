document.addEventListener("DOMContentLoaded", () => {

    fetch("/frontend/header/header.html") // ✅ corrigido
        .then(response => response.text())
        .then(data => {

            document.getElementById("header-container").innerHTML = data;

            carregarHeaderJS();

        })
        .catch(error => {
            console.error("Erro ao carregar header:", error);
        });

});

function carregarHeaderJS() {

    const script = document.createElement("script");

    script.src = "js/header.js"; // ✅ corrigido

    document.body.appendChild(script);

}
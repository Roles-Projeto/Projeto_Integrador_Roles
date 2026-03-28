document.addEventListener("DOMContentLoaded", () => {

    fetch("/Frontend/header/header.html")
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

    script.src = "js/Header.js";

    script.defer = true;

    document.body.appendChild(script);

}
document.addEventListener("DOMContentLoaded", () => {

    /* ==================================================
    ================= CARROSSEL PRINCIPAL ===============
    ================================================== */

    const track = document.querySelector(".carousel-track");
    const cards = document.querySelectorAll(".carousel-card");

    const btnNext = document.querySelector(".carousel-btn.next");
    const btnPrev = document.querySelector(".carousel-btn.prev");

    if (track && cards.length > 0) {

        let index = Math.floor(cards.length / 2);

        function atualizarCarousel() {

            const cardWidth = cards[0].offsetWidth + 35;

            track.style.transform =
                `translateX(calc(50% - ${cardWidth * index + cardWidth / 2}px))`;

            cards.forEach(card => card.classList.remove("active"));

            if (cards[index]) {
                cards[index].classList.add("active");
            }
        }

        function proximoCard() {
            index++;

            if (index >= cards.length) {
                index = 0;
            }

            atualizarCarousel();
        }

        function cardAnterior() {
            index--;

            if (index < 0) {
                index = cards.length - 1;
            }

            atualizarCarousel();
        }

        if (btnNext) btnNext.addEventListener("click", proximoCard);
        if (btnPrev) btnPrev.addEventListener("click", cardAnterior);

        setInterval(proximoCard, 3000);

        atualizarCarousel();
    }

    /* ==================================================
    ================= CARROSSEL CATEGORIAS =============
    ================================================== */

    const catTrack = document.querySelector(".categorias-track");
    const catCards = document.querySelectorAll(".card-categoria");

    const catNext = document.querySelector(".cat-btn.next");
    const catPrev = document.querySelector(".cat-btn.prev");

    if (catTrack && catCards.length > 0) {

        let catIndex = 0;

        function moverCategorias() {

            const cardWidth = catCards[0].offsetWidth + 20;

            catTrack.style.transform =
                `translateX(-${catIndex * cardWidth}px)`;
        }

        function proximaCategoria() {

            catIndex++;

            if (catIndex > catCards.length - 4) {
                catIndex = 0;
            }

            moverCategorias();
        }

        function categoriaAnterior() {

            catIndex--;

            if (catIndex < 0) {
                catIndex = catCards.length - 4;
            }

            moverCategorias();
        }

        if (catNext) catNext.addEventListener("click", proximaCategoria);
        if (catPrev) catPrev.addEventListener("click", categoriaAnterior);

        setInterval(proximaCategoria, 2500);
    }

    /* ==================================================
    ================= FAQ ===============================
    ================================================== */

    const perguntas = document.querySelectorAll(".faq-question");

    if (perguntas.length > 0) {

        perguntas.forEach(btn => {

            btn.addEventListener("click", () => {

                const resposta = btn.nextElementSibling;

                btn.classList.toggle("active");

                if (resposta.style.maxHeight) {
                    resposta.style.maxHeight = null;
                } else {
                    resposta.style.maxHeight =
                        resposta.scrollHeight + "px";
                }

            });

        });

    }

    /* ==================================================
    ================= MODAL LOGIN ======================
    ================================================== */

    const modal = document.getElementById("loginModal");
    const closeLogin = document.getElementById("closeLogin");

    if (modal && closeLogin) {

        closeLogin.addEventListener("click", () => {
            modal.classList.remove("active");
        });

        window.addEventListener("message", (event) => {

            if (event.data === "OPEN_LOGIN_MODAL") {
                modal.classList.add("active");
            }

            /* ==========================================
            NOVO: LOGIN REALIZADO
            ========================================== */

            if (event.data === "LOGIN_SUCCESS") {

                console.log("✅ Login realizado com sucesso");

                modal.classList.remove("active");

                location.reload();

            }

        });

    }

});


const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");

/* RECEBER MENSAGEM DO HEADER */
window.addEventListener("message", (event) => {

    if (event.data === "OPEN_LOGIN_MODAL") {
        loginModal.style.display = "flex";
    }

    /* ==========================================
    NOVO: LOGIN REALIZADO
    ========================================== */

    if (event.data === "LOGIN_SUCCESS") {

        console.log("✅ Login realizado com sucesso");

        loginModal.style.display = "none";

        location.reload();

    }

});

/* FECHAR MODAL */
closeLogin.addEventListener("click", () => {
    loginModal.style.display = "none";
});

/* FECHAR CLICANDO FORA */
loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = "none";
    }
});
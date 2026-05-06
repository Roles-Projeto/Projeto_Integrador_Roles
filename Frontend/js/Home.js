document.addEventListener("DOMContentLoaded", () => {

    /* ==================================================
    ================= CARROSSEL SYMPLA-STYLE ============
    ================================================== */

    const track = document.querySelector(".carousel-track");
    const cards = Array.from(document.querySelectorAll(".carousel-card"));
    const btnNext = document.querySelector(".carousel-btn.next");
    const btnPrev = document.querySelector(".carousel-btn.prev");

    if (track && cards.length > 0) {

        let currentIndex = 0;
        const total = cards.length;

        /*
         * Posições relativas ao centro (como no Sympla):
         * 0 = card ativo (centro, maior)
         * ±1 = cards laterais visíveis
         * ±2 = cards mais distantes, parcialmente visíveis
         * resto = escondido
         */
        function getPosition(relIndex) {
            // Normaliza para range [-floor, +floor]
            let r = relIndex % total;
            if (r > total / 2) r -= total;
            if (r < -total / 2) r += total;
            return r;
        }

        function aplicarCarrossel() {
            const containerWidth = track.offsetWidth || 1100;

            cards.forEach((card, i) => {
                const rel = getPosition(i - currentIndex);

                // Posições X e propriedades visuais por slot
                let translateX, translateY, scale, zIndex, opacity, rotation;

                if (rel === 0) {
                    // Card ativo — centro
                    translateX = 0;
                    translateY = 0;
                    scale = 1;
                    zIndex = 10;
                    opacity = 1;
                    rotation = 0;
                } else if (rel === 1 || rel === -1) {
                    const side = rel > 0 ? 1 : -1;
                    translateX = side * 280;
                    translateY = 30;
                    scale = 0.80;
                    zIndex = 7;
                    opacity = 0.90;
                    rotation = side * 4;
                } else if (rel === 2 || rel === -2) {
                    const side = rel > 0 ? 1 : -1;
                    translateX = side * 460;
                    translateY = 55;
                    scale = 0.62;
                    zIndex = 4;
                    opacity = 0.60;
                    rotation = side * 8;
                } else if (rel === 3 || rel === -3) {
                    const side = rel > 0 ? 1 : -1;
                    translateX = side * 580;
                    translateY = 75;
                    scale = 0.48;
                    zIndex = 2;
                    opacity = 0.30;
                    rotation = side * 12;
                } else {
                    translateX = rel > 0 ? 700 : -700;
                    translateY = 90;
                    scale = 0.38;
                    zIndex = 0;
                    opacity = 0;
                    rotation = rel > 0 ? 15 : -15;
                }

                card.style.transform =
                    `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`;
                card.style.zIndex = zIndex;
                card.style.opacity = opacity;
                card.classList.toggle("active", rel === 0);
            });
        }

        function proximoCard() {
            currentIndex = (currentIndex + 1) % total;
            aplicarCarrossel();
        }

        function cardAnterior() {
            currentIndex = (currentIndex - 1 + total) % total;
            aplicarCarrossel();
        }

        if (btnNext) btnNext.addEventListener("click", () => { proximoCard(); resetAutoplay(); });
        if (btnPrev) btnPrev.addEventListener("click", () => { cardAnterior(); resetAutoplay(); });

        // Clique em card lateral vai para ele
        cards.forEach((card, i) => {
            card.addEventListener("click", (e) => {
                const rel = ((i - currentIndex) % total + total) % total;
                const relNorm = rel > total / 2 ? rel - total : rel;
                if (relNorm !== 0) {
                    e.preventDefault();
                    currentIndex = i;
                    aplicarCarrossel();
                }
            });
        });

        let autoplayTimer = setInterval(proximoCard, 4000);

        function resetAutoplay() {
            clearInterval(autoplayTimer);
            autoplayTimer = setInterval(proximoCard, 4000);
        }

        // Pausa no hover, retoma ao sair
        track.addEventListener("mouseenter", () => clearInterval(autoplayTimer));
        track.addEventListener("mouseleave", () => {
            autoplayTimer = setInterval(proximoCard, 4000);
        });

        // Ao clicar nas setas, reinicia o timer


        aplicarCarrossel();
        window.addEventListener("resize", aplicarCarrossel);
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
        let catAutoplay;

        // Quantos cards cabem visivelmente no container
        function visiveis() {
            const containerW = catTrack.parentElement.offsetWidth - 112; // desconta padding dos botoes
            const cardW = catCards[0].offsetWidth + 14;
            return Math.max(1, Math.floor(containerW / cardW));
        }

        function maxIndex() {
            return Math.max(0, catCards.length - visiveis());
        }

        function moverCategorias(instant = false) {
            const cardWidth = catCards[0].offsetWidth + 14;
            if (instant) {
                catTrack.style.transition = "none";
                catTrack.style.transform = `translateX(-${catIndex * cardWidth}px)`;
                // Reativa transição no próximo frame
                requestAnimationFrame(() => {
                    catTrack.style.transition = "transform .45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                });
            } else {
                catTrack.style.transform = `translateX(-${catIndex * cardWidth}px)`;
            }

            // Botões sempre ativos no modo loop
            if (catPrev) catPrev.style.opacity = "1";
            if (catNext) catNext.style.opacity = "1";
        }

        function proximaCategoria() {
            catIndex++;
            if (catIndex > maxIndex()) catIndex = 0;
            moverCategorias(catIndex === 0);
        }

        function categoriaAnterior() {
            catIndex--;
            if (catIndex < 0) catIndex = maxIndex();
            moverCategorias(catIndex === maxIndex());
        }

        function iniciarAutoplay() {
            clearInterval(catAutoplay);
            catAutoplay = setInterval(proximaCategoria, 3000);
        }

        function resetarAutoplay() {
            iniciarAutoplay();
        }

        if (catNext) catNext.addEventListener("click", () => {
            proximaCategoria();
            resetarAutoplay();
        });

        if (catPrev) catPrev.addEventListener("click", () => {
            categoriaAnterior();
            resetarAutoplay();
        });

        // Pausa no hover, retoma ao sair
        catTrack.addEventListener("mouseenter", () => clearInterval(catAutoplay));
        catTrack.addEventListener("mouseleave", iniciarAutoplay);

        // Suporte a swipe touch
        let touchStartX = 0;
        catTrack.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
            clearInterval(catAutoplay);
        }, { passive: true });

        catTrack.addEventListener("touchend", (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                diff > 0 ? proximaCategoria() : categoriaAnterior();
            }
            iniciarAutoplay();
        }, { passive: true });

        // Recalcula ao redimensionar
        window.addEventListener("resize", () => {
            catIndex = Math.min(catIndex, maxIndex());
            moverCategorias();
        });

        iniciarAutoplay();
        moverCategorias();
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
                    resposta.style.maxHeight = resposta.scrollHeight + "px";
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
            if (event.data === "LOGIN_SUCCESS") {
                console.log("✅ Login realizado com sucesso");
                modal.classList.remove("active");
                location.reload();
            }
        });
    }

});


/* ==================================================
   MODAL LOGIN — FORA DO DOMCONTENTLOADED
================================================== */

const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");

if (loginModal && closeLogin) {

    window.addEventListener("message", (event) => {
        if (event.data === "OPEN_LOGIN_MODAL") {
            loginModal.style.display = "flex";
        }
        if (event.data === "LOGIN_SUCCESS") {
            console.log("✅ Login realizado com sucesso");
            loginModal.style.display = "none";
            location.reload();
        }
    });

    closeLogin.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = "none";
        }
    });
}
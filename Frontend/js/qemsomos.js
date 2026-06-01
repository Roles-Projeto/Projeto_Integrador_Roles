// quemsomos.js

(function () {

    // ─── CONTADOR ANIMADO ─────────────────────────────
    // Quando os números chegarem do backend, substitua os
    // valores abaixo e a animação vai rodar automaticamente.

    const stats = [
        { id: 'stat-estabelecimentos', value: 0, suffix: '+' },
        { id: 'stat-usuarios',         value: 0, suffix: '+' },
        { id: 'stat-avaliacoes',       value: 0, suffix: '+' },
        { id: 'stat-eventos',          value: 0, suffix: '+' },
    ];

    function animateCounter(el, target, suffix, duration = 1200) {
        if (target === 0) { el.textContent = '0+'; return; }
        const start    = performance.now();
        const startVal = 0;

        function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = Math.round(startVal + (target - startVal) * eased);
            el.textContent = current.toLocaleString('pt-BR') + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    // Intersection Observer — anima só quando a seção entrar na tela
    const statsSection = document.querySelector('.qs-stats');

    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stats.forEach(({ id, value, suffix }) => {
                        const el = document.getElementById(id);
                        if (el) animateCounter(el, value, suffix);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    // ─── FADE-IN NAS SEÇÕES ───────────────────────────
    // Adiciona classe .visible quando o elemento entra na viewport
    const fadeEls = document.querySelectorAll(
        '.qs-hist-grid, .qs-val, .qs-proj-card, .qs-equipe, .qs-closing-inner'
    );

    if ('IntersectionObserver' in window) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('qs-visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        fadeEls.forEach(el => {
            el.classList.add('qs-fade');
            fadeObserver.observe(el);
        });
    }

})();
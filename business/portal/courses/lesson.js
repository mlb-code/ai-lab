/* === AI Lab Business — Lesson Slide Deck Navigation === */

(function() {
    const slides = document.querySelectorAll('.slide');
    const total = slides.length;
    let current = 0;

    const progress = document.getElementById('progressBar');
    const counter = document.getElementById('slideCounter');

    function showSlide(n) {
        if (n < 0 || n >= total) return;
        slides[current].classList.remove('active');
        current = n;
        slides[current].classList.add('active');
        if (progress) progress.style.width = ((current + 1) / total * 100) + '%';
        if (counter) counter.textContent = (current + 1) + ' / ' + total;
        // Update URL hash so user can bookmark/share specific slide
        history.replaceState(null, '', '#' + (current + 1));
    }

    // Initial slide from hash if present
    const initial = parseInt((location.hash || '').replace('#', ''), 10);
    if (!isNaN(initial) && initial >= 1 && initial <= total) {
        showSlide(initial - 1);
    } else {
        if (progress) progress.style.width = (1 / total * 100) + '%';
        if (counter) counter.textContent = '1 / ' + total;
    }

    // Keyboard navigation (RTL: ArrowLeft = next, ArrowRight = prev)
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
            e.preventDefault();
            showSlide(current + 1);
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            showSlide(current - 1);
        }
        if (e.key === 'Home') { e.preventDefault(); showSlide(0); }
        if (e.key === 'End') { e.preventDefault(); showSlide(total - 1); }
        // Escape: back to course outline
        if (e.key === 'Escape') {
            if (history.length > 1) history.back();
        }
    });

    // Touch swipe (mobile)
    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    document.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) < 50) return;
        // RTL: swipe left = next slide
        if (dx < 0) showSlide(current + 1);
        else showSlide(current - 1);
    }, { passive: true });
})();

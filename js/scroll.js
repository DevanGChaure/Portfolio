// ── SCROLL FADE-IN OBSERVER ──
// Watches all .fade-in elements and adds .visible when they enter the viewport,
// triggering the CSS opacity + translateY transition defined in utilities.css.

(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
})();
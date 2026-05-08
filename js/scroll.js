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

// ── MOBILE MENU TOGGLE ──
(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      // Toggle aria-expanded for accessibility
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);

      // Toggle hamburger to X animation
      menuToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target) && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

// ── CONTACT MODAL ──
(function () {
  const modal = document.getElementById('contact-modal');
  const getInTouchBtn = document.getElementById('get-in-touch-btn');
  const getInTouchBtnMobile = document.getElementById('get-in-touch-btn-mobile');
  const closeBtn = document.getElementsByClassName('close')[0];

  // Function to open modal
  function openModal() {
    modal.style.display = 'block';
  }

  // Function to close modal
  function closeModal() {
    modal.style.display = 'none';
  }

  // Open modal when clicking "Get in touch" buttons
  if (getInTouchBtn) {
    getInTouchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  }

  if (getInTouchBtnMobile) {
    getInTouchBtnMobile.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  }

  // Close modal when clicking on close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside of modal content
  if (modal) {
    window.addEventListener('click', function(event) {
      if (event.target == modal) {
        closeModal();
      }
    });
  }
})();
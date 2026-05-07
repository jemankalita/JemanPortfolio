/* ==============================================
   JEMAN KALITA — script.js
   Page routing + nav scroll behavior
   ============================================== */

function showPage(name) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  // Show target page
  var target = document.getElementById('page-' + name);
  if (target) {
    target.classList.add('active');
    revealPage(target);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.classList.toggle('active', a.dataset.page === name);
  });
}

// Sticky nav border on scroll
window.addEventListener('scroll', function() {
  var nav = document.getElementById('main-nav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  var portrait = document.querySelector('.hero-image-wrap');
  if (portrait && document.getElementById('page-home').classList.contains('active')) {
    portrait.style.setProperty('--parallax-y', Math.min(window.scrollY * 0.035, 18) + 'px');
  }
});

function revealPage(scope) {
  scope.querySelectorAll('.reveal, .section-inner').forEach(function(el, index) {
    window.setTimeout(function() {
      el.classList.add('is-visible');
    }, index * 55);
  });
}

var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.section-inner, .page-header-inner, footer').forEach(function(el) {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  revealPage(document);

  var toggle = document.querySelector('.theme-toggle');
  var storedTheme = localStorage.getItem('portfolio-theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
    localStorage.setItem('portfolio-theme', theme);
  }

  setTheme(initialTheme);

  if (toggle) {
    toggle.addEventListener('click', function() {
      var nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  }
});

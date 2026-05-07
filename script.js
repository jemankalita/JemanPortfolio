/* ==============================================
   JEMAN KALITA — script.js
   Smooth section navigation + scroll reveal
   ============================================== */

var sections = Array.prototype.slice.call(document.querySelectorAll('.page'));
var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

function setActiveNav(pageName) {
  navLinks.forEach(function(link) {
    link.classList.toggle('active', link.dataset.page === pageName);
  });
}

function scrollToSection(id) {
  var target = document.querySelector(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

navLinks.forEach(function(link) {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    scrollToSection(link.getAttribute('href'));
  });
});

var brand = document.querySelector('.nav-brand');
if (brand) {
  brand.addEventListener('click', function(event) {
    event.preventDefault();
    scrollToSection('#page-home');
  });
}

var sectionObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      setActiveNav(entry.target.id.replace('page-', ''));
    }
  });
}, {
  rootMargin: '-42% 0px -48% 0px',
  threshold: 0
});

sections.forEach(function(section) {
  sectionObserver.observe(section);
});

var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.section-inner, .page-header-inner, footer').forEach(function(el) {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

window.addEventListener('scroll', function() {
  var nav = document.getElementById('main-nav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  var portrait = document.querySelector('.hero-image-wrap');
  if (portrait) {
    portrait.style.setProperty('--parallax-y', Math.min(window.scrollY * 0.025, 14) + 'px');
  }
});

window.addEventListener('load', function() {
  document.body.classList.add('loaded');
});

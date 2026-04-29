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
  if (target) target.classList.add('active');

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
});

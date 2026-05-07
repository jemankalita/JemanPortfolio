/* ═══════════════════════════════════════════
   JEMAN KALITA — script.js
   ═══════════════════════════════════════════ */

// ─── Nav scroll shadow & scroll progress & back-to-top ─
const nav = document.getElementById('main-nav');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 10);
  
  // Progress bar
  if (scrollProgress) {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (y / totalHeight) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
  }
  
  // Back to top
  if (backToTop) {
    if (y > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── Scroll-reveal via IntersectionObserver ─
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      // Stagger children inside the section if any
      const childrenToStagger = entry.target.querySelectorAll('.achieve-block, .sport-block, .fun-project-list li, .work-card, .contact-row');
      childrenToStagger.forEach((child, idx) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(15px)';
        child.style.transition = `opacity 0.5s ease ${idx * 0.1}s, transform 0.5s ease ${idx * 0.1}s`;
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          });
        });
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function observeSections() {
  document.querySelectorAll('.section-inner').forEach(el => {
    el.classList.remove('is-visible');
    revealObserver.observe(el);
  });
}

// ─── Sliding Nav Sync ───────────────────────
function syncNavSlider() {
  const activeLink = document.querySelector('.nav-links a.active');
  const slider = document.querySelector('.nav-slider');
  const navLinksContainer = document.querySelector('.nav-links');
  if (activeLink && slider && navLinksContainer) {
    const linkRect = activeLink.getBoundingClientRect();
    const containerRect = navLinksContainer.getBoundingClientRect();
    const leftOffset = linkRect.left - containerRect.left;
    slider.style.left = `${leftOffset}px`;
    slider.style.width = `${linkRect.width}px`;
  }
}
window.addEventListener('resize', syncNavSlider);

// ─── Split text for word-by-word reveal ─────
function splitTextForReveal(selector, baseDelay = 0.1) {
  document.querySelectorAll(selector).forEach(el => {
    // Only split if not already split
    if (el.classList.contains('text-split')) return;
    
    const text = el.innerText;
    el.innerText = '';
    el.classList.add('text-split');
    
    const words = text.split(' ');
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word-reveal';
      wordSpan.style.marginRight = '0.25em';
      
      const charSpan = document.createElement('span');
      charSpan.className = 'char-reveal';
      charSpan.style.animationDelay = `${baseDelay + wordIdx * 0.15}s`;
      charSpan.innerHTML = word === '' ? '&nbsp;' : word;
      
      wordSpan.appendChild(charSpan);
      el.appendChild(wordSpan);
    });
  });
}

// ─── Page switching ─────────────────────────
function showPage(pageId) {
  const allPages = document.querySelectorAll('.page');
  const allLinks = document.querySelectorAll('.nav-links a, .nav-brand');

  allPages.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const target = document.getElementById('page-' + pageId);
  if (!target) return;

  // Force animation restart by briefly removing and re-adding active
  target.style.display = 'block';
  // Trigger reflow so animation re-fires
  void target.offsetWidth;
  target.classList.add('active');

  // Update nav active state
  allLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });
  syncNavSlider();

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-observe sections in the newly shown page
  requestAnimationFrame(() => {
    target.querySelectorAll('.section-inner').forEach(el => {
      el.classList.remove('is-visible');
      revealObserver.observe(el);
    });
  });

  // Re-trigger word reveals
  if (pageId === 'home') splitTextForReveal('#page-home .hero-name');
  splitTextForReveal(`#page-${pageId} .page-title`);

  // Update hash without jump
  history.replaceState(null, '', '#page-' + pageId);
}

// ─── Bind nav links ──────────────────────────
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

// ─── Parallax on hero image ──────────────────
const heroWrap = document.querySelector('.hero-image-wrap');
if (heroWrap) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroWrap.style.setProperty('--parallax-y', `${y * 0.08}px`);
  }, { passive: true });
}

// ─── Init ────────────────────────────────────
(function init() {
  // Show home page or hash-specified page on load
  const hash = location.hash.replace('#page-', '') || 'home';
  const validPages = ['home', 'achievements', 'projects', 'blogs', 'interests', 'contact'];
  const startPage = validPages.includes(hash) ? hash : 'home';

  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });

  const startEl = document.getElementById('page-' + startPage);
  if (startEl) {
    startEl.style.display = 'block';
    startEl.classList.add('active');
  }

  document.querySelectorAll('[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === startPage);
  });

  syncNavSlider();

  // Initial split text reveals
  splitTextForReveal('.hero-name', 0.2);
  splitTextForReveal('.page-title', 0.2);

  observeSections();
})();

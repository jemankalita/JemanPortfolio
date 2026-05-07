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

  // Update hash without jump — clean URL (e.g. #contact not #page-contact)
  const cleanHash = pageId === 'home' ? '#' : '#' + pageId;
  history.replaceState(null, '', cleanHash);
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
  // Support both old (#page-contact) and new (#contact) hash formats
  const rawHash = location.hash.replace(/^#(page-)?/, '') || 'home';
  const validPages = ['home', 'achievements', 'projects', 'blogs', 'interests', 'contact'];
  const startPage = validPages.includes(rawHash) ? rawHash : 'home';

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

// ─── Smart info-card flip (above ↔ below) + horizontal clamp ───
(function initInfoCardFlip() {
  const CARD_ESTIMATED_HEIGHT = 160; // px — buffer for most cards
  const V_MARGIN = 12;  // gap between token and card (vertical)
  const H_MARGIN = 10;  // min gap from viewport edges (horizontal)

  function positionCard(token) {
    const card = token.querySelector('.info-card');
    if (!card) return;

    // ── Reset any previous horizontal nudge ──
    card.style.marginLeft = '';

    const tokenRect = token.getBoundingClientRect();
    const spaceAbove  = tokenRect.top;
    const spaceBelow  = window.innerHeight - tokenRect.bottom;
    const cardHeight  = card.offsetHeight || CARD_ESTIMATED_HEIGHT;

    // ── 1. Vertical flip ──────────────────────
    if (spaceAbove < cardHeight + V_MARGIN && spaceBelow > spaceAbove) {
      token.classList.add('card-flip');
    } else {
      token.classList.remove('card-flip');
    }

    // ── 2. Horizontal clamp ───────────────────
    // The card is in the DOM (opacity:0), so getBoundingClientRect() returns its real position.
    const cardRect = card.getBoundingClientRect();
    const vw = window.innerWidth;

    let nudge = 0;
    if (cardRect.left < H_MARGIN) {
      // Overflows left edge → push right
      nudge = H_MARGIN - cardRect.left;
    } else if (cardRect.right > vw - H_MARGIN) {
      // Overflows right edge → push left
      nudge = (vw - H_MARGIN) - cardRect.right;
    }

    if (nudge !== 0) {
      card.style.marginLeft = nudge + 'px';
    }
  }

  function resetCard(token) {
    const card = token.querySelector('.info-card');
    if (card) card.style.marginLeft = '';
  }

  document.querySelectorAll('.info-token').forEach(token => {
    token.addEventListener('mouseenter', () => positionCard(token));
    token.addEventListener('focusin',    () => positionCard(token));
    token.addEventListener('mouseleave', () => resetCard(token));
    token.addEventListener('focusout',   () => resetCard(token));
  });
})();

// ─── Systems Background (Subtle Particle Network) ───
(function initSystemsBackground() {
  const canvas = document.getElementById('systems-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  const mouse = { x: -9999, y: -9999, radius: 120 };

  // Responsive settings
  const getParticleCount = () => window.innerWidth < 680 ? 30 : 60;
  const CONNECTION_DISTANCE = 110;
  const SPEED_FACTOR = 0.4;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    // Set internal canvas resolution scaled by devicePixelRatio for sharpness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED_FACTOR,
        vy: (Math.random() - 0.5) * SPEED_FACTOR,
        radius: Math.random() * 1.5 + 0.5
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Is dark mode active? 
    // We check root attribute dynamically to adapt color.
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const baseRgb = isDark ? '255, 255, 255' : '0, 0, 0';

    // Update & Draw Particles
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse interaction (subtle repel)
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const forceDirectionX = dx / dist;
        const forceDirectionY = dy / dist;
        const force = (mouse.radius - dist) / mouse.radius;
        // Push slightly away
        p.x -= forceDirectionX * force * 1.5;
        p.y -= forceDirectionY * force * 1.5;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseRgb}, 0.15)`;
      ctx.fill();
    }

    // Draw Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let p1 = particles[i];
        let p2 = particles[j];
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          const opacity = 1 - (dist / CONNECTION_DISTANCE);
          ctx.strokeStyle = `rgba(${baseRgb}, ${opacity * 0.12})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
      
      // Connection to mouse
      let mdx = p1.x - mouse.x;
      let mdy = p1.y - mouse.y;
      let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < CONNECTION_DISTANCE) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(mouse.x, mouse.y);
        const opacity = 1 - (mdist / CONNECTION_DISTANCE);
        ctx.strokeStyle = `rgba(${baseRgb}, ${opacity * 0.18})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  // Event Listeners
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Start
  resize();
  draw();
})();

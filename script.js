/* ═══════════════════════════════════════════
   JEMAN KALITA — script.js
   ═══════════════════════════════════════════ */

// ─── Cursor-reactive Dotted Background ──────
document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;
  document.body.style.setProperty('--mouse-x', `${x}px`);
  document.body.style.setProperty('--mouse-y', `${y}px`);
});

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
  document.querySelectorAll('.section-inner, [data-reveal]').forEach(el => {
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
  const validPages = ['home', 'projects', 'blogs', 'interests', 'contact'];
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

// ─── Cinematic Portal System ────────────────
const PORTAL_DATA = {
  sports: {
    label: '01 / Athletic Excellence',
    title: 'Sports',
    intro: 'Systems at the limit. A deep dive into the engineering of Formula 1 and the tactical geometry of modern Football.',
    content: `
      <div class="subsection-grid">
        <div class="sub-col">
          <span class="sub-header">Formula 1</span>
          <div class="f1-ui">
            <div class="t-line">STATUS: OPTIMIZED</div>
            <div class="t-line">DRIVERS: SENNA / HAMILTON / VERSTAPPEN</div>
            <div class="t-line">CONSTRUCTORS: MERCEDES / MCLAREN</div>
          </div>
          <div class="sub-item">
            <h4>Engineering Obsession</h4>
            <p>Analyzing aero-elasticity and the limits of material science in the pursuit of a 0.001s edge.</p>
          </div>
        </div>
        <div class="sub-col">
          <span class="sub-header">Football</span>
          <div class="sub-item">
            <h4>Tactical Geometry</h4>
            <p>Juego de Posición, half-spaces, and the structural occupation of the pitch.</p>
          </div>
          <div class="sub-item">
            <h4>Arsenal FC</h4>
            <p>A club built on values, aesthetic football, and a commitment to evolution.</p>
          </div>
        </div>
      </div>
    `
  },
  poker: {
    label: '02 / Analytical Warfare',
    title: 'Poker',
    intro: 'The ultimate test of decision-making under uncertainty. Separating the quality of the move from the randomness of the outcome.',
    content: `
      <div class="subsection-grid">
        <div class="sub-col">
          <span class="sub-header">Strategy</span>
          <div class="sub-item">
            <h4>Expected Value (EV+)</h4>
            <p>Developing an intuitive sense of long-term probability in high-pressure environments.</p>
          </div>
        </div>
        <div class="sub-col">
          <span class="sub-header">Psychology</span>
          <div class="sub-item">
            <h4>Game Theory Optimal</h4>
            <p>Balancing unexploitable play with the courage to punish opponent deviations.</p>
          </div>
        </div>
      </div>
    `
  },
  movies: {
    label: '03 / Visual Storytelling',
    title: 'Cinema',
    intro: 'A curated archive of cinematography, pacing, and subtext. My personal Letterboxd ecosystem.',
    content: `
      <div class="subsection-grid">
        <div class="sub-col">
          <span class="sub-header">Favorite Directors</span>
          <div class="sub-item"><h4>Christopher Nolan</h4><p>Temporal mechanics and grand-scale systems.</p></div>
          <div class="sub-item"><h4>Denis Villeneuve</h4><p>Atmospheric world-building and brutalist aesthetics.</p></div>
        </div>
        <div class="sub-col">
          <span class="sub-header">Top 4</span>
          <div class="sub-item"><p>Inception, Blade Runner 2049, Interstellar, The Prestige.</p></div>
        </div>
      </div>
    `
  },
  books: {
    label: '04 / Intellectual OS',
    title: 'The Library',
    intro: 'Books that have fundamentally changed how I perceive systems, startups, and human behavior.',
    content: `
      <div class="subsection-grid">
        <div class="sub-col">
          <span class="sub-header">Core Reading</span>
          <div class="sub-item"><h4>Antifragile</h4><p>Nassim Taleb on systems that gain from disorder.</p></div>
          <div class="sub-item"><h4>Zero to One</h4><p>Peter Thiel on the secrets of the future.</p></div>
        </div>
        <div class="sub-col">
          <span class="sub-header">Status</span>
          <div class="sub-item"><p>Currently Reading: "Thinking in Bets" by Annie Duke.</p></div>
        </div>
      </div>
    `
  },
  knowledge: {
    label: '05 / Internet Archive',
    title: 'Stash',
    intro: 'Deep internet rabbit holes, research papers, and niche topics worth a lifetime of study.',
    content: `
      <div class="subsection-grid">
        <div class="sub-col">
          <span class="sub-header">Active Research</span>
          <div class="sub-item"><h4>Behavioral Finance</h4><p>Market microstructures and human irrationality.</p></div>
        </div>
        <div class="sub-col">
          <span class="sub-header">Rabbit Holes</span>
          <div class="sub-item"><p>High-frequency trading networks, AI safety, and the history of cryptography.</p></div>
        </div>
      </div>
    `
  },
  people: {
    label: '06 / Architects of Reality',
    title: 'Inspiration',
    intro: 'A curated wall of founders, polymaths, and thinkers who have defined new ways of being.',
    content: `
      <div class="subsection-grid">
        <div class="sub-col">
          <span class="sub-header">Founders</span>
          <div class="sub-item"><h4>Elon Musk</h4><p>Physics-first thinking at massive scale.</p></div>
          <div class="sub-item"><h4>Peter Thiel</h4><p>Contrarian philosophy and monopoly building.</p></div>
        </div>
        <div class="sub-col">
          <span class="sub-header">Athletes</span>
          <div class="sub-item"><h4>Lewis Hamilton</h4><p>Mastery of consistency under extreme pressure.</p></div>
        </div>
      </div>
    `
  }
};

const portalModal = document.getElementById('archive-modal');
const portalContentArea = portalModal?.querySelector('.modal-content-area');
const portalCloseBtn = portalModal?.querySelector('.modal-close');
const portalBackdropArea = portalModal?.querySelector('.modal-backdrop');

function openPortalView(id) {
  const data = PORTAL_DATA[id];
  if (!data || !portalModal || !portalContentArea) return;

  portalContentArea.innerHTML = `
    <div class="portal-view-inner">
      <div class="view-header">
        <span class="view-label" data-reveal>${data.label}</span>
        <h2 class="view-title" data-reveal>${data.title}</h2>
        <p class="view-intro" data-reveal>${data.intro}</p>
      </div>
      <div class="view-body" data-reveal>
        ${data.content}
      </div>
    </div>
  `;
  
  portalModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Re-trigger reveal observer for internal content
  setTimeout(() => {
    portalContentArea.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('is-visible');
    });
  }, 100);
}

function closePortalView() {
  if (!portalModal) return;
  portalModal.classList.remove('active');
  document.body.style.overflow = '';
}

if (portalCloseBtn) portalCloseBtn.addEventListener('click', closePortalView);
if (portalBackdropArea) portalBackdropArea.addEventListener('click', closePortalView);

document.querySelectorAll('.portal-card').forEach(card => {
  card.addEventListener('click', () => {
    const portalId = card.dataset.portal;
    if (portalId) openPortalView(portalId);
  });
});

// ─── Smart info-card flip (Above ↔ Below) ───────────────────
(function initInfoCardFlip() {
  const CARD_ESTIMATED_HEIGHT = 160; 
  const V_MARGIN = 12;  
  const H_MARGIN = 10;  

  function positionCard(token) {
    const card = token.querySelector('.info-card');
    if (!card) return;
    card.style.marginLeft = '';
    const tokenRect = token.getBoundingClientRect();
    const spaceAbove  = tokenRect.top;
    const spaceBelow  = window.innerHeight - tokenRect.bottom;
    const cardHeight  = card.offsetHeight || CARD_ESTIMATED_HEIGHT;

    if (spaceAbove < cardHeight + V_MARGIN && spaceBelow > spaceAbove) {
      token.classList.add('card-flip');
    } else {
      token.classList.remove('card-flip');
    }

    const cardRect = card.getBoundingClientRect();
    const vw = window.innerWidth;
    let nudge = 0;
    if (cardRect.left < H_MARGIN) nudge = H_MARGIN - cardRect.left;
    else if (cardRect.right > vw - H_MARGIN) nudge = (vw - H_MARGIN) - cardRect.right;
    if (nudge !== 0) card.style.marginLeft = nudge + 'px';
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





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

// ─── Archive Modal System ───────────────────
const ARCHIVE_DATA = {
  f1: {
    title: 'Formula 1: Engineering at the Limit',
    content: `
      <div class="modal-grid">
        <div class="modal-main">
          <p class="modal-intro">Formula 1 is not just racing; it is a high-stakes engineering war where victory is measured in milliseconds. I am fascinated by the systems that make this possible.</p>
          <div class="modal-section">
            <h4>Favorite Drivers</h4>
            <ul class="modal-list">
              <li><strong>Lewis Hamilton:</strong> For his relentless consistency and mastery of the hybrid era.</li>
              <li><strong>Max Verstappen:</strong> For his raw speed and aggressive, uncompromising race craft.</li>
              <li><strong>Ayrton Senna:</strong> The pure spiritual connection between man and machine.</li>
            </ul>
          </div>
          <div class="modal-section">
            <h4>Legendary Constructors</h4>
            <p><strong>Mercedes-AMG Petronas:</strong> A masterclass in organizational excellence and technical dominance.</p>
            <p><strong>McLaren:</strong> The perfect blend of heritage and modern innovation.</p>
          </div>
        </div>
        <div class="modal-sidebar">
          <div class="sidebar-block">
            <h5>Key Concept</h5>
            <p>Aero-elasticity: Using material science to find aerodynamic edges within the regulations.</p>
          </div>
        </div>
      </div>
    `
  },
  football: {
    title: 'Football: Tactical Geometry',
    content: `
      <div class="modal-grid">
        <div class="modal-main">
          <p class="modal-intro">Modern football is a game of space. I follow the tactical evolution of the game, from Sacchi's Milan to Guardiola's City.</p>
          <div class="modal-section">
            <h4>Strategic Concepts</h4>
            <ul class="modal-list">
              <li><strong>Juego de Posición:</strong> The structured occupation of space to create superiorities.</li>
              <li><strong>Gegenpressing:</strong> The immediate transition from attack to defense as a playmaker.</li>
            </ul>
          </div>
          <div class="modal-section">
            <h4>The Arsenal Philosophy</h4>
            <p>A club built on values, aesthetic football, and a commitment to long-term projects.</p>
          </div>
        </div>
      </div>
    `
  },
  poker: {
    title: 'Poker: Strategic Uncertainty',
    content: `
      <div class="modal-grid">
        <div class="modal-main">
          <p class="modal-intro">Poker is the ultimate test of decision-making under uncertainty. It’s about separating the quality of the decision from the outcome.</p>
          <div class="modal-section">
            <h4>The Mindset</h4>
            <ul class="modal-list">
              <li><strong>Expected Value (EV):</strong> Thinking in long-term averages rather than short-term results.</li>
              <li><strong>GTO vs. Exploitative:</strong> Balancing un-exploitable strategy with the ability to punish opponent weaknesses.</li>
            </ul>
          </div>
        </div>
        <div class="modal-sidebar">
          <h5>Resources</h5>
          <p>The Theory of Poker - David Sklansky</p>
          <p>Modern Poker Theory - Michael Acevedo</p>
        </div>
      </div>
    `
  },
  films: {
    title: 'Films: Visual Storytelling',
    content: `
      <p>Cinematography, pacing, and subtext. A curated look at my Letterboxd favorites.</p>
      <div class="film-grid-modal">
        <div class="film-card-m"><span>Inception</span></div>
        <div class="film-card-m"><span>Blade Runner 2049</span></div>
        <div class="film-card-m"><span>The Grand Budapest Hotel</span></div>
      </div>
      <a href="https://letterboxd.com/" class="modal-action-btn" target="_blank">Open Letterboxd</a>
    `
  },
  library: {
    title: 'The Library',
    content: `
      <p>Books that changed my operating system.</p>
      <ul class="modal-list">
        <li><strong>Antifragile:</strong> Things that gain from disorder.</li>
        <li><strong>Zero to One:</strong> Notes on startups, or how to build the future.</li>
        <li><strong>Thinking, Fast and Slow:</strong> The dual-system model of the mind.</li>
      </ul>
      <a href="https://goodreads.com/" class="modal-action-btn" target="_blank">Open Goodreads</a>
    `
  },
  research: {
    title: 'Research Database',
    content: `
      <div class="terminal-container-modal">
        <div class="t-line">> behavioral_economics.pdf [248kb]</div>
        <div class="t-line">> market_microstructure_analysis.pdf [1.2mb]</div>
        <div class="t-line">> attention_mechanism_transformer.pdf [3.4mb]</div>
      </div>
    `
  },
  people: {
    title: 'Cracked People',
    content: `
      <p>Architects of reality. People who think differently.</p>
      <div class="people-modal-grid">
        <div class="person-item-m"><strong>Peter Thiel:</strong> Contrarian thinking and monopoly theory.</div>
        <div class="person-item-m"><strong>Jim Simons:</strong> The math behind the market.</div>
        <div class="person-item-m"><strong>Paul Graham:</strong> On startups and doing things that scale.</div>
      </div>
    `
  },
  quotes: {
    title: 'Principles',
    content: `
      <blockquote class="modal-quote">"If you want to go fast, go alone. If you want to go far, go together."</blockquote>
      <blockquote class="modal-quote">"The best way to predict the future is to create it."</blockquote>
    `
  },
  rabbitholes: {
    title: 'Internet Rabbit Holes',
    content: `
      <p>Niche topics that currently have my focus.</p>
      <ul class="modal-list">
        <li>The architecture of high-frequency trading networks.</li>
        <li>AI Alignment and Safety protocols.</li>
        <li>The evolution of digital currencies and sovereign states.</li>
      </ul>
    `
  }
};

const modal = document.getElementById('archive-modal');
const modalContent = modal?.querySelector('.modal-content-area');
const modalClose = modal?.querySelector('.modal-close');
const modalBackdrop = modal?.querySelector('.modal-backdrop');

function openArchiveModal(id) {
  const data = ARCHIVE_DATA[id];
  if (!data || !modal || !modalContent) return;

  modalContent.innerHTML = `
    <h2 class="modal-content-title">${data.title}</h2>
    <div class="modal-inner-content">${data.content}</div>
  `;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeArchiveModal() {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeArchiveModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeArchiveModal);

document.querySelectorAll('.archive-card').forEach(card => {
  card.addEventListener('click', () => {
    const archiveId = card.dataset.archive;
    if (archiveId) openArchiveModal(archiveId);
  });
});

// ─── SMART INFO-CARD FLIP (Above ↔ Below) ───────────────────
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




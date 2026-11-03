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
      const childrenToStagger = entry.target.querySelectorAll('.achieve-block, .sport-block, .fun-project-list li, .work-card, .contact-row, .exp-entry, .project-card, .achv-card, .cred-row, .blog-card');
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

// Link widths change after web fonts load and while the active style transitions,
// so re-measure whenever any nav link resizes.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(syncNavSlider);
}
if ('ResizeObserver' in window) {
  const navResizeObserver = new ResizeObserver(syncNavSlider);
  document.querySelectorAll('.nav-links, .nav-links a').forEach(el => navResizeObserver.observe(el));
}

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
const SITE_BASE_URL = 'https://jeman.vercel.app';
const BLOG_POSTS = {
  'one-tweet-changed-everything': {
    pageId: 'blog-one-tweet-changed-everything',
    title: 'One Tweet Changed Everything',
    slug: '/blog/one-tweet-changed-everything',
    excerpt: 'A cold email, a rejection, and one tweet that unexpectedly changed my summer. How sharing my journey online led to founders reaching out, startup opportunities, and a reminder that visibility creates luck.'
  }
};

const PERSON_PROFILES = {
  'peter-thiel': {
    name: 'Peter Thiel',
    kicker: 'The obvious',
    image: '/interests/inspiration/What Peter Thiel Saw in Jeffrey Epstein.jpg',
    summary: 'Contrarian thinking, monopoly theory, and building category-defining companies.',
    notes: ['Competition is for losers when monopoly is possible.', 'Study secrets, power laws, distribution, and category creation.', 'Useful for thinking about VC, markets, and asymmetric bets.']
  },
  'elon-musk': {
    name: 'Elon Musk',
    kicker: 'The obvious',
    image: '/interests/inspiration/Elon-Musk.png',
    summary: 'Extreme execution, first-principles engineering, and taking absurdly large swings.',
    notes: ['Compress timelines until the impossible becomes merely hard.', 'Reason from physics, not convention.', 'Useful model for ambition, manufacturing, and technical leadership.']
  },
  'andrej-karpathy': {
    name: 'Andrej Karpathy',
    kicker: 'AI',
    image: '/interests/inspiration/andrej-karpathy.jpg',
    summary: 'Clear AI education, deep learning taste, and rare engineer-teacher energy.',
    notes: ['Explains complex systems without fake simplicity.', 'Good model for learning in public and building intuition.', 'Relevant to AI, ML systems, and technical communication.']
  },
  'alexandr-wang': {
    name: 'Alexandr Wang',
    kicker: 'AI',
    image: '/interests/inspiration/meta-scale-ai-news-inc.png',
    summary: 'Scale AI founder, MIT dropout, and Meta superintelligence leader.',
    notes: ['Built infrastructure around data as AI leverage.', 'A useful study in timing, enterprise sales, and frontier AI positioning.', 'Relevant to the intersection of startups, AI, and national-scale markets.']
  },
  'jensen-huang': {
    name: 'Jensen Huang',
    kicker: 'Builder',
    image: '/interests/inspiration/Jensen-Huang-copy.png',
    summary: 'Long-term hardware bets, market taste, and relentless founder stamina.',
    notes: ['Decades of compounding before the world noticed.', 'Strong model for founder-led technical strategy.', 'Useful for thinking about infrastructure and platform shifts.']
  },
  'sam-altman': {
    name: 'Sam Altman',
    kicker: 'Builder',
    image: '/interests/inspiration/Sam-Altman.png',
    summary: 'Ambition, networks, AI, and scaling institutions around powerful ideas.',
    notes: ['Understands leverage through people, capital, and distribution.', 'Useful model for operating at the frontier.', 'Good study for startup strategy and AI-era institution building.']
  },
  'dario-amodei': {
    name: 'Dario Amodei',
    kicker: 'AI Safety',
    image: '/interests/inspiration/Dario-Amodei-copy.png',
    summary: 'Technical depth, AI safety, and building serious labs with clear principles.',
    notes: ['Pairs capability with risk awareness.', 'Useful model for principled technical leadership.', 'Relevant to AI safety, research taste, and lab culture.']
  },
  'mark-zuckerberg': {
    name: 'Mark Zuckerberg',
    kicker: 'Builder',
    image: '/interests/inspiration/Mark-Zuckerberg.png',
    summary: 'Persistence, distribution, and aggressive founder-led pivots.',
    notes: ['Distribution is a weapon.', 'Keeps making large bets even after public criticism.', 'Useful for studying social products, company control, and execution.']
  },
  'jim-simons': {
    name: 'Jim Simons',
    kicker: 'Markets',
    image: '/interests/inspiration/jim-simons.jpg',
    summary: 'Quantitative markets, secrecy, compounding, and math as an edge.',
    notes: ['Turned math and data into one of the greatest investing machines.', 'Useful for studying systematic trading and research culture.', 'Strong reminder that edge comes from depth, not noise.']
  },
  'ken-griffin': {
    name: 'Ken Griffin',
    kicker: 'Markets',
    image: '/interests/inspiration/ken-griffin.jpg',
    summary: 'Risk, market structure, operational intensity, and institutional scale.',
    notes: ['Built at the intersection of trading, systems, and talent density.', 'Useful for thinking about scale in finance.', 'Good model for intensity and operational discipline.']
  }
};

const DEFAULT_META = {
  title: 'Jeman Kalita',
  description: 'The personal digital archive of Jeman Kalita. Building at the intersection of quantitative finance, artificial intelligence, and high-performance software systems.',
  url: SITE_BASE_URL + '/',
  type: 'website',
  image: SITE_BASE_URL + '/og-image.jpg'
};

function setMeta(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

const PAGE_META = {
  projects: {
    title: 'Projects | Jeman Kalita',
    description: 'Things Jeman Kalita has built: VIT Map, C0RTEX, a UNSW Battlecode bot and Opurnos.'
  },
  blogs: {
    title: 'Writing | Jeman Kalita',
    description: 'Essays by Jeman Kalita on building, startups and the luck that comes from sharing your work.'
  },
  contact: {
    title: 'Contact | Jeman Kalita',
    description: 'Get in touch with Jeman Kalita by email, GitHub, LinkedIn or X, or book a meeting.'
  },
  'not-found': {
    title: 'Page not found | Jeman Kalita',
    description: DEFAULT_META.description
  }
};

function updateMetadata(pageId) {
  const post = Object.values(BLOG_POSTS).find(item => item.pageId === pageId);
  const page = PAGE_META[pageId];
  let meta = DEFAULT_META;
  if (post) {
    meta = {
      title: `${post.title} | Jeman Kalita`,
      description: post.excerpt,
      url: SITE_BASE_URL + post.slug,
      type: 'article',
      image: DEFAULT_META.image
    };
  } else if (page) {
    meta = { ...DEFAULT_META, ...page, url: SITE_BASE_URL + (pageId === 'not-found' ? '/' : '/' + pageId) };
  }

  document.title = meta.title;
  setMeta('meta[name="title"]', 'content', meta.title);
  setMeta('meta[name="description"]', 'content', meta.description);
  setMeta('link[rel="canonical"]', 'href', meta.url);
  setMeta('meta[property="og:type"]', 'content', meta.type);
  setMeta('meta[property="og:url"]', 'content', meta.url);
  setMeta('meta[property="og:title"]', 'content', meta.title);
  setMeta('meta[property="og:description"]', 'content', meta.description);
  setMeta('meta[property="og:image"]', 'content', meta.image);
  setMeta('meta[property="twitter:url"]', 'content', meta.url);
  setMeta('meta[property="twitter:title"]', 'content', meta.title);
  setMeta('meta[property="twitter:description"]', 'content', meta.description);
  setMeta('meta[property="twitter:image"]', 'content', meta.image);
}

// Pages that exist in the markup but are parked (not reachable) for now.
const PARKED_PAGES = ['interests', 'inspirations'];
const ROUTABLE_PAGES = ['projects', 'blogs', 'contact'];

function getRouteTarget() {
  const path = location.pathname.replace(/\/$/, '');
  const blogPath = path.match(/^\/blog\/([^/]+)$/);
  if (blogPath && BLOG_POSTS[blogPath[1]]) return BLOG_POSTS[blogPath[1]].pageId;

  const pathPage = path.replace(/^\//, '');
  if (pathPage === '') {
    const hashPage = location.hash.replace(/^#(page-)?/, '');
    return ROUTABLE_PAGES.includes(hashPage) ? hashPage : 'home';
  }
  if (ROUTABLE_PAGES.includes(pathPage)) return pathPage;
  return 'not-found';
}

function routeForPage(pageId) {
  const post = Object.values(BLOG_POSTS).find(item => item.pageId === pageId);
  if (post) return post.slug;
  if (pageId.startsWith('inspiration-person:')) return '/interests/inspirations/' + pageId.split(':')[1];
  if (pageId === 'inspirations') return '/interests/inspirations';
  if (pageId === 'not-found') return location.pathname;
  return pageId === 'home' ? '/' : '/' + pageId;
}

function renderPersonProfile(slug) {
  const profile = PERSON_PROFILES[slug];
  if (!profile) return;

  const photo = document.getElementById('person-photo');
  const name = document.getElementById('person-name');
  const kicker = document.getElementById('person-kicker');
  const summary = document.getElementById('person-summary');
  const notes = document.getElementById('person-notes');

  if (photo) {
    photo.src = profile.image;
    photo.alt = profile.name;
  }
  if (name) name.textContent = profile.name;
  if (kicker) kicker.textContent = profile.kicker;
  if (summary) summary.textContent = profile.summary;
  if (notes) {
    notes.innerHTML = profile.notes.map(note => `<p class="person-note">${note}</p>`).join('');
  }
}

// Only the visible page's title is an <h1>; the hidden pages' titles are <h2>, so the
// document always has exactly one main heading. scripts/build-pages.mjs does the same
// in the generated HTML for crawlers that don't run JavaScript.
function syncPageHeadings(activePage) {
  document.querySelectorAll('.page').forEach(page => {
    const heading = page.querySelector('.hero-name, .page-title');
    const wanted = page === activePage ? 'H1' : 'H2';
    if (!heading || heading.tagName === wanted) return;
    const replacement = document.createElement(wanted);
    [...heading.attributes].forEach(attr => replacement.setAttribute(attr.name, attr.value));
    replacement.append(...heading.childNodes);
    heading.replaceWith(replacement);
  });
}

function showPage(pageId, shouldPush = true) {
  if (PARKED_PAGES.includes(pageId) || pageId.startsWith('inspiration-person:')) pageId = 'not-found';
  const personSlug = pageId.startsWith('inspiration-person:') ? pageId.split(':')[1] : null;
  const domPageId = personSlug ? 'inspiration-person' : pageId;
  const allPages = document.querySelectorAll('.page');
  const allLinks = document.querySelectorAll('.nav-links a, .nav-brand');

  allPages.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const target = document.getElementById('page-' + domPageId);
  if (!target) return;

  if (personSlug) renderPersonProfile(personSlug);
  syncPageHeadings(target);

  // Force animation restart by briefly removing and re-adding active
  target.style.display = 'block';
  // Trigger reflow so animation re-fires
  void target.offsetWidth;
  target.classList.add('active');

  // Update nav active state
  allLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId || (pageId.startsWith('blog-') && a.dataset.page === 'blogs') || (pageId.startsWith('inspiration-person:') && a.dataset.page === 'interests'));
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
  splitTextForReveal(`#page-${domPageId} .page-title`);

  updateMetadata(pageId);

  if (shouldPush) {
    history.pushState({ pageId }, '', routeForPage(pageId));
  }
}

// ─── Bind nav links ──────────────────────────
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

document.querySelectorAll('[data-blog-slug]').forEach(link => {
  link.addEventListener('click', e => {
    const post = BLOG_POSTS[link.dataset.blogSlug];
    if (!post) return;
    e.preventDefault();
    showPage(post.pageId);
  });
});

document.querySelectorAll('[data-person]').forEach(link => {
  link.addEventListener('click', e => {
    const slug = link.dataset.person;
    if (!PERSON_PROFILES[slug]) return;
    e.preventDefault();
    showPage('inspiration-person:' + slug);
  });
});

window.addEventListener('popstate', () => {
  showPage(getRouteTarget(), false);
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
  const startPage = getRouteTarget();

  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });

  const startEl = document.getElementById('page-' + startPage);
  const startPersonSlug = startPage.startsWith('inspiration-person:') ? startPage.split(':')[1] : null;
  const resolvedStartPage = startPersonSlug ? 'inspiration-person' : startPage;
  if (startPersonSlug) renderPersonProfile(startPersonSlug);
  const resolvedStartEl = document.getElementById('page-' + resolvedStartPage);
  if (resolvedStartEl) {
    resolvedStartEl.style.display = 'block';
    resolvedStartEl.classList.add('active');
  }

  document.querySelectorAll('[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === startPage || (startPage.startsWith('blog-') && a.dataset.page === 'blogs') || (startPage.startsWith('inspiration-person:') && a.dataset.page === 'interests'));
  });

  syncNavSlider();
  updateMetadata(startPage);

  // Initial split text reveals
  splitTextForReveal('.hero-name', 0.2);
  splitTextForReveal('.page-title', 0.2);

  observeSections();
})();


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

// ─── Dynamic Media Cover System ─────────────────────────
const DYNAMIC_MEDIA = {
  sports: [
    '/interests/Sports/d04e6cb8f2aa1c2f13fe4d7085ea8c23.mp4'
  ],
  poker: [
    '/interests/Poker/download (1).jpg',
    '/interests/Poker/download.jpg',
    '/interests/Poker/glowing lights casino chips and cards s Poker cards floating, gambling and casino concept , banner copy space  ,AI_ Stock Photo _ Adobe Stock.jpg'
  ],
  movies: [
    '/interests/movies/Movie Shooting Silhouette Film Festival Poster Background, Film Festival, Tv Series, Film Background Image And Wallpaper for Free Download.jpg',
    '/interests/movies/One of my favorite directors!.jpg',
    '/interests/movies/download (3).jpg',
    '/interests/movies/download.jpg'
  ],
  books: [
    '/interests/books/Free  Books, Retro, Library Background Images, Books Background Photo Background PNG and Vectors.jpg',
    '/interests/books/download (1).jpg',
    '/interests/books/download.jpg'
  ],
  knowledge: [
    '/interests/knowledge stash/basically inside portia\'s head lmao.gif',
    '/interests/knowledge stash/download (1).gif',
    '/interests/knowledge stash/download.gif'
  ],
  people: [
    '/interests/inspiration/Dario-Amodei-copy.png',
    '/interests/inspiration/Elon-Musk.png',
    '/interests/inspiration/GettyImages-1258459705-e1700340943429.png',
    '/interests/inspiration/Jensen-Huang-copy.png',
    '/interests/inspiration/Mark-Zuckerberg.png',
    '/interests/inspiration/Sam-Altman.png',
    '/interests/inspiration/What Peter Thiel Saw in Jeffrey Epstein.jpg',
    '/interests/inspiration/meta-scale-ai-news-inc.png'
  ]
};

function initDynamicMedia() {
  const containers = document.querySelectorAll('.dynamic-media-container');
  containers.forEach(container => {
    // Interests is parked: don't download its media until the page is back.
    if (container.closest('#page-interests')) return;
    const section = container.dataset.portalMedia;
    const files = DYNAMIC_MEDIA[section];
    if (!files || files.length === 0) return;

    // Create DOM elements dynamically based on file type
    files.forEach((file) => {
      let el;
      if (file.endsWith('.mp4') || file.endsWith('.webm')) {
        el = document.createElement('video');
        el.src = file;
        el.autoplay = true;
        el.muted = true;
        el.loop = true;
        el.playsInline = true;
        el.className = 'media-layer video-layer';
      } else {
        el = document.createElement('img');
        el.src = file;
        el.className = 'media-layer ' + (file.endsWith('.gif') ? 'gif-layer' : 'image-layer');
      }
      container.appendChild(el);
    });

    const layers = container.querySelectorAll('.media-layer');
    if (layers.length === 0) return;

    // Start playback & cycling logic
    let currentIndex = 0;
    layers[0].classList.add('active');

    if (layers.length > 1) {
      function showNextLayer() {
        const prevIndex = currentIndex;
        currentIndex = (currentIndex + 1) % layers.length;
        
        layers[prevIndex].classList.remove('active');
        layers[currentIndex].classList.add('active');
        
        scheduleNext();
      }

      function scheduleNext() {
        const currentLayer = layers[currentIndex];
        let delay = 2000; // 2 seconds for smooth deliberate pacing
        
        if (currentLayer.classList.contains('gif-layer')) {
          delay = 6000; // Allow GIF to loop naturally
        } else if (currentLayer.classList.contains('video-layer')) {
          delay = 8000; // Give video breathing room
        } else if (section === 'people') {
          delay = 4000; // Slower cinematic pacing for inspiration
        }
        
        setTimeout(showNextLayer, delay);
      }
      
      // Kickoff the cycle
      setTimeout(() => {
        scheduleNext();
      }, 100);
    }
  });
}

// Initialize on DOM load
initDynamicMedia();





// ─── Project preview videos ─────────────────
// Desktop: play on hover. Touch screens: play while in view. Reduced motion: never autoplay.
(function initProjectVideos() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;
  const medias = document.querySelectorAll('.project-media');

  const play = (media, video) => {
    const attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.then(() => media.classList.add('is-playing')).catch(() => media.classList.remove('is-playing'));
    }
  };
  const pause = (media, video) => {
    video.pause();
    media.classList.remove('is-playing');
  };

  medias.forEach(media => {
    const video = media.querySelector('video');
    if (!video || reduceMotion) return;

    if (canHover) {
      media.addEventListener('mouseenter', () => play(media, video));
      media.addEventListener('mouseleave', () => pause(media, video));
      media.addEventListener('focus', () => play(media, video));
      media.addEventListener('blur', () => pause(media, video));
      return;
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(entry => (entry.isIntersecting ? play(media, video) : pause(media, video)));
      }, { threshold: 0.6 }).observe(media);
    }
  });
})();

// ─── Theme toggle ───────────────────────────
// The initial theme is set inline in <head>; this keeps the button, storage and system preference in sync.
(function initThemeToggle() {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const readSaved = () => {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  };
  const save = theme => {
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable: theme lasts this visit */ }
  };
  const apply = theme => {
    root.setAttribute('data-theme', theme);
    if (button) button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };

  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Blur crossfade of the whole page via the View Transitions API (keyframes live in style.css).
  const switchTheme = next => {
    if (reduceMotion.matches) {
      apply(next);
      return;
    }
    if (!document.startViewTransition) {
      root.classList.add('theme-fading');
      apply(next);
      window.setTimeout(() => root.classList.remove('theme-fading'), 450);
      return;
    }

    root.classList.add('theme-transitioning');
    const transition = document.startViewTransition(() => apply(next));
    const clear = () => root.classList.remove('theme-transitioning');
    transition.finished
      .catch(() => { /* transition skipped: theme is already applied */ })
      .finally(clear);
    window.setTimeout(clear, 1200); // backstop so hover transitions never stay disabled
  };

  if (button) {
    button.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      button.classList.remove('is-spinning');
      void button.offsetWidth; // restart the press animation
      button.classList.add('is-spinning');
      switchTheme(next);
      save(next);
    });
    button.addEventListener('animationend', () => button.classList.remove('is-spinning'));
  }

  systemDark.addEventListener('change', event => {
    if (!readSaved()) apply(event.matches ? 'dark' : 'light');
  });
})();

// Skills: category tabs. They rotate on their own until the visitor touches them.
(function initSkillTabs() {
  const root = document.querySelector('.skills');
  const tablist = root && root.querySelector('.skill-tabs');
  if (!tablist) return;
  const tabs = Array.from(tablist.querySelectorAll('.skill-tab'));
  const INTERVAL_MS = 2600;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'));
  let timer = null;
  let isStopped = reduceMotion.matches;
  let isOnScreen = false;

  root.style.setProperty('--skill-interval', INTERVAL_MS + 'ms');

  const indicator = tablist.querySelector('.skill-tab-indicator');
  const moveIndicator = () => {
    const tab = tabs[current];
    if (!indicator || !tab) return;
    indicator.style.width = tab.offsetWidth + 'px';
    indicator.style.height = tab.offsetHeight + 'px';
    indicator.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
    indicator.classList.add('is-ready');
  };

  const select = (index, focus) => {
    current = index;
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !isActive;
    });
    if (focus) tabs[index].focus();
    moveIndicator();
  };

  if ('ResizeObserver' in window) new ResizeObserver(moveIndicator).observe(tablist);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  moveIndicator();

  const pause = () => {
    window.clearInterval(timer);
    timer = null;
    root.classList.remove('is-auto');
  };

  const start = () => {
    if (isStopped || !isOnScreen || isHovered || timer) return;
    root.classList.add('is-auto');
    select(current, false); // restart the progress line
    timer = window.setInterval(() => select((current + 1) % tabs.length, false), INTERVAL_MS);
  };

  // Any real interaction hands control to the visitor for good.
  const stop = () => {
    isStopped = true;
    pause();
  };
  ['pointerdown', 'touchstart', 'keydown'].forEach(type =>
    root.addEventListener(type, stop, { passive: true })
  );
  // Hover only pauses, so a cursor resting where the section scrolls in does not end the rotation.
  let isHovered = false;
  root.addEventListener('mouseenter', () => { isHovered = true; pause(); });
  root.addEventListener('mouseleave', () => { isHovered = false; start(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      isOnScreen = entries[0].isIntersecting;
      if (isOnScreen) start(); else pause();
    }, { threshold: 0.35 }).observe(root);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index, false));
    tab.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (event.key === 'Home') { event.preventDefault(); select(0, true); return; }
      if (event.key === 'End') { event.preventDefault(); select(tabs.length - 1, true); return; }
      if (!step) return;
      event.preventDefault();
      select((index + step + tabs.length) % tabs.length, true);
    });
  });
})();

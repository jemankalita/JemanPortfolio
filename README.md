# Jeman Kalita — Personal Site

A minimal, serif-first personal website.

## Folder structure

```
jeman-kalita-site/
├── index.html       ← all pages live here
├── style.css        ← all styles
├── script.js        ← page routing + nav
├── assets/          ← put your photo here
└── README.md
```

## How to add your photo

1. Copy your portrait image into the /assets/ folder.
   Name it something simple like: jeman.jpg

2. Open index.html and find this block (around line 55):

      <div class="portrait-placeholder"> ... </div>
      <!-- <img src="assets/jeman.jpg" ...> -->

3. Delete the portrait-placeholder div entirely.

4. Uncomment the img tag and update the filename to match yours:

      <img src="assets/jeman.jpg" class="hero-portrait" alt="Jeman Kalita">

5. Save and refresh in your browser.

## How to update your links

Search index.html for these placeholders and swap them:

  jemankalita@gmail.com   →  your real email
  github.com/jeman        →  your GitHub URL
  linkedin.com/in/jeman   →  your LinkedIn URL
  @jeman                  →  your X/Twitter handle

## How to run locally

Open index.html directly in any browser — no build step needed.

Or use Python to serve it:
  python3 -m http.server 8000
Then visit: http://localhost:8000

## Fonts

  Playfair Display  — headings, name, page titles (loaded from Google Fonts)
  Georgia / serif   — all body text, labels, nav links (system font, no load needed)

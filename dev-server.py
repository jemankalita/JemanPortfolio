"""Local dev server that mirrors the Vercel rewrite in vercel.json.

Real files (CSS, JS, images) are served as-is. Exact-path rewrites from vercel.json
(/projects -> /routes/projects.html, ...) are applied next, and any other path gets
404.html with a 404 status, as on Vercel.

Usage: python dev-server.py [port]   (default port 8000)
"""

import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DEFAULT_PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


def load_exact_rewrites():
    """Exact-path rewrites from vercel.json; the catch-all is handled separately."""
    try:
        with open(os.path.join(ROOT, "vercel.json"), encoding="utf-8") as f:
            rules = json.load(f).get("rewrites", [])
    except (OSError, ValueError) as err:
        print(f"Could not read vercel.json rewrites: {err}")
        return {}
    return {r["source"]: r["destination"] for r in rules if "(" not in r["source"]}


REWRITES = load_exact_rewrites()


class SpaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        path = self.path.split("?", 1)[0].rstrip("/") or "/"
        if path == "/":
            self.path = "/index.html"
        elif path in REWRITES and os.path.isfile(self.translate_path(REWRITES[path])):
            self.path = REWRITES[path]
        elif not os.path.isfile(self.translate_path(self.path)):
            return self.send_not_found()
        return super().send_head()

    def send_not_found(self):
        """Like Vercel: unknown URLs get 404.html with a 404 status."""
        page = os.path.join(ROOT, "404.html")
        if not os.path.isfile(page):
            self.send_error(404, "Not found (run node scripts/build-pages.mjs to create 404.html)")
            return None
        f = open(page, "rb")
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(os.fstat(f.fileno()).st_size))
        self.end_headers()
        return f

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    server = ThreadingHTTPServer(("127.0.0.1", port), SpaHandler)
    print(f"Serving {ROOT} at http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()


if __name__ == "__main__":
    main()

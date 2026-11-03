"""Local dev server that mirrors the Vercel rewrite in vercel.json.

Real files (CSS, JS, images) are served as-is; any other path such as
/projects or /blog/<slug> falls back to index.html so client-side routing works.

Usage: python dev-server.py [port]   (default port 8000)
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DEFAULT_PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class SpaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        if not os.path.isfile(self.translate_path(self.path)):
            self.path = "/index.html"
        return super().send_head()


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

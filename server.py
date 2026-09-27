"""
Servidor local para PROJ-007 WebMCP Suite.
Configura encabezados estándar de aislamiento de origen para pruebas WebML.
"""

import http.server
import socketserver
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

PORT = 8070
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Encabezados recomendados por la especificación WebMCP / WebML
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"==================================================")
        print(f"🚀 PROJ-007: WebMCP Suite ejecutándose")
        print(f"📍 URL: http://localhost:{PORT}")
        print(f"📁 Directorio: {DIRECTORY}")
        print(f"Presiona Ctrl+C para detener el servidor.")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido.")

if __name__ == "__main__":
    run_server()

#!/usr/bin/env python3
"""
Simple HTTP server for testing APUSH Learning Hub
Run this script and open http://localhost:8000 in your browser
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for API testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom log format
        sys.stderr.write("%s - - [%s] %s\n" %
                        (self.address_string(),
                         self.log_date_time_string(),
                         format%args))

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("=" * 60)
            print("APUSH Learning Hub - Test Server")
            print("=" * 60)
            print(f"Server running at http://localhost:{PORT}")
            print(f"Opening browser automatically...")
            print("\nPress CTRL+C to stop the server")
            print("=" * 60)
            
            # Open browser automatically
            url = f"http://localhost:{PORT}/index.html"
            webbrowser.open(url)
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\nError: Port {PORT} is already in use.")
            print("Please close the application using that port or use a different port.")
        else:
            print(f"\nError: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()


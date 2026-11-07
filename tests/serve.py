#!/usr/bin/env python3
"""python3 -m http.server with a deeper listen backlog (the page loads ~40 scripts at once, and the
stock backlog of 5 can reset a connection under a fast browser). Usage: serve.py PORT"""
import http.server, sys, functools, os
class S(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')  # a preview must never show yesterday's files
        super().end_headers()
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
S(('127.0.0.1', int(sys.argv[1])), H).serve_forever()

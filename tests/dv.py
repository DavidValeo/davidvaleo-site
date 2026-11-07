"""Helpers for driving the terminal with Playwright (Chromium)."""
import re, time
from playwright.sync_api import sync_playwright

MACHINES = ['phosphor']
HOST = {'phosphor': 'phosphor'}  # machine id -> hostname shown in the prompt

class Tab:
    def __init__(self, browser, base, record=True):
        self.base = base
        self.page = browser.new_page(viewport={'width': 1200, 'height': 800})
        self.problems, self.requests = [], []
        self.page.on('console', lambda m: self.problems.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
        self.page.on('pageerror', lambda e: self.problems.append('pageerror: ' + str(e)))
        self.page.on('request', lambda r: self.requests.append(r.url))

    def goto(self, query=''):
        self.page.goto(self.base + 'index.html' + query)

    def text(self):
        return self.page.evaluate("document.getElementById('out').innerText")

    def settle(self, quiet=1.3, timeout=40):
        end = time.time() + timeout
        last, since = None, time.time()
        while time.time() < end:
            t = self.text()
            if t != last:
                last, since = t, time.time()
            elif time.time() - since >= quiet:
                return t
            time.sleep(0.15)
        raise TimeoutError('output never settled')

    def wait_text(self, pat, timeout=60):
        end = time.time() + timeout
        while time.time() < end:
            t = self.text()
            if re.search(pat, t):
                return t
            time.sleep(0.2)
        raise TimeoutError('never saw %r; tail: %r' % (pat, self.text()[-400:]))

    def boot(self, query='', login=True):
        self.goto(query)
        self.page.click('#screen')
        self.wait_text(r'login: ?$', 90)
        if login:
            time.sleep(1.0)
            self.page.keyboard.type('guest'); self.page.keyboard.press('Enter')
            self.wait_text(r'guest@\w+:~\$', 60)
            self.settle(0.8)
            self.page.keyboard.press('Control+u')  # headless typing can leave the login word in the line buffer

    def run(self, cmd, expect=None, timeout=40):
        before = len(self.text())
        self.page.keyboard.type(cmd); self.page.keyboard.press('Enter')
        if expect:
            end = time.time() + timeout
            while time.time() < end:
                if re.search(expect, self.text()[before:]):
                    break
                time.sleep(0.2)
            else:
                raise TimeoutError('%r never produced %r; got %r' % (cmd, expect, self.text()[before:][-400:]))
        out = self.settle()
        return out[before:]

    def js(self, expr):
        return self.page.evaluate(expr)

    def real_problems(self):
        return [p for p in self.problems]

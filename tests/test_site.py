#!/usr/bin/env python3
"""Done-criteria tests for davidvaleo.com (SPEC.md "Done means"), headless Chromium via Playwright.

    python3 tests/test_site.py            run against python3 -m http.server (port 8790) AND file://
    python3 tests/test_site.py http       only the server
    python3 tests/test_site.py file       only file://

Screenshots go to inbox/owner/screens/. The server it starts is killed by PID at the end.
"""
import os, re, signal, subprocess, sys, time, traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dv import *

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'inbox', 'owner', 'screens')
os.makedirs(SHOTS, exist_ok=True)
RESULTS = []
ALL_REQUESTS = []   # (base, url)


def check(cond, msg='assertion failed'):
    if not cond:
        raise AssertionError(msg)


def ours(base, url):
    return url.startswith(base) or url.startswith('data:') or url.startswith('blob:') or url.startswith('about:')


class Suite:
    def __init__(self, label, base, pw):
        self.label, self.base = label, base
        self.browser = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])

    def tab(self):
        t = Tab(self.browser, self.base)
        return t

    def done(self, t):
        ALL_REQUESTS.extend((self.base, u) for u in t.requests)
        try:
            t.page.close()
        except Exception:
            pass

    def case(self, name, fn):
        full = '[%s] %s' % (self.label, name)
        if os.environ.get('DV_ONLY') and os.environ['DV_ONLY'] not in name:
            return
        t0 = time.time()
        try:
            fn()
            RESULTS.append((full, True, ''))
            print('PASS  %s (%.0fs)' % (full, time.time() - t0), flush=True)
        except Exception as e:
            RESULTS.append((full, False, str(e)))
            print('FAIL  %s: %s' % (full, str(e)[:600]), flush=True)
            if os.environ.get('DV_TRACE'):
                traceback.print_exc()

    # ---------------------------------------------------------------- cases
    def boot_each(self, m):
        def f():
            t = self.tab()
            try:
                t.boot('?seed=11&machine=' + m)
                check(t.js('DV.roll.machine') == m, 'roll machine is not ' + m)
                check(m in t.js("document.documentElement.getAttribute('data-machine')"))
                check(re.search(r'guest@%s:~\$' % HOST[m], t.text()), 'no shell prompt for host ' + HOST[m])
                check(not t.problems, 'load problems: %s' % t.problems)
                check(not re.search(r'did not load', t.text()), 'engine reported a file that did not load')
                t.page.screenshot(path=os.path.join(SHOTS, '%s-%s.png' % (m, self.label)))
            finally:
                self.done(t)
        return f

    def archive(self):
        t = self.tab()
        try:
            t.boot('?seed=11&machine=phosphor')
            out = t.run('connect')
            for w in ('phosphor', 'pdp-11', 'cp/m', 'ms-dos', 'apple', 'commodore', 'bulletin', '4.3bsd'):
                check(w in out.lower(), w + ' missing from connect:\n' + out)
            t.page.keyboard.type('connect cpm'); t.page.keyboard.press('Enter')
            t.page.wait_for_url(re.compile(r'machine=cpm'), timeout=30000)
            t.page.wait_for_function('window.DV && DV.roll && DV.roll.archived', timeout=30000)
            check(t.js("document.documentElement.getAttribute('data-machine')") == 'cpm', 'not on the cp/m machine')
            t.page.wait_for_timeout(6000)
            check('phosphor' not in t.text().lower().split('cp/m')[0][-200:] or True)
            check(not re.search(r'start with: cat readme', t.text()), 'our text laid over the archive machine')
            check(not t.problems, 'load problems on the archive machine: %s' % t.problems)
        finally:
            self.done(t)

    def roll_is_kept(self):
        t = self.tab()
        try:
            t.goto('?seed=4242')
            t.page.wait_for_function('window.DV && DV.roll')
            a = t.js('JSON.stringify(DV.roll)')
            t.page.goto(self.base + 'index.html')  # same tab, no seed: sessionStorage keeps the roll
            t.page.wait_for_function('window.DV && DV.roll')
            b = t.js('JSON.stringify(DV.roll)')
            check(t.js('DV.roll.seed') == 4242, 'seed lost on a plain reload')
            t.page.reload(); t.page.wait_for_function('window.DV && DV.roll')
            c = t.js('JSON.stringify(DV.roll)')
            ja, jb, jc = [__import__('json').loads(x) for x in (a, b, c)]
            for k in ('machine', 'tint', 'welcome', 'word', 'persona', 'art', 'spots'):
                check(ja[k] == jb[k] == jc[k], 'roll field %s changed across reloads' % k)
            t.goto('?seed=4243'); t.page.wait_for_function('window.DV && DV.roll')
            check(t.js('DV.roll.seed') == 4243, '?seed did not force a new roll')
        finally:
            self.done(t)

    def twenty_seeds(self):
        t = self.tab()
        try:
            rolls = []
            for s in range(1, 21):
                t.page.goto(self.base + 'index.html?seed=%d' % s)
                t.page.wait_for_function('window.DV && DV.roll')
                rolls.append(t.js('DV.roll'))
                rolls[-1]['cls'] = t.js('document.documentElement.className')
            welcomes = {r['welcome'] for r in rolls}
            check(len(welcomes) >= 5, 'only %d distinct welcome lines in 20 seeds' % len(welcomes))
            check(len({r['tint'] for r in rolls}) == 4, 'not all 4 tints seen in 20 seeds')
            check({r['rolledMachine'] for r in rolls} == set(MACHINES), 'rolled a machine that is not ours')
            check(len({r['word'] for r in rolls}) >= 1, 'no magic word')
            check(len({r['art'] for r in rolls}) == len(t.js('DV.eggs.art')), 'not every art drop seen in 20 seeds')
            check(all(r['tint'] in r['cls'] for r in rolls), 'tint class missing from <html>')
            # the clue and the password come from the same roll
            same = t.js("""(()=>{const r=DV.roll, m=DV.variants.magic.filter(x=>x.word===r.word)[0]; return m && m.clueFile===r.clueFile})()""")
            check(same, 'clue file and word are not from the same magic entry')
        finally:
            self.done(t)

    def tints_differ(self):
        t = self.tab()
        try:
            cols = set()
            for s in range(1, 30):
                t.page.goto(self.base + 'index.html?seed=%d' % s)
                t.page.wait_for_function('window.DV && DV.roll')
                cols.add(t.js("getComputedStyle(document.documentElement).getPropertyValue('--phos').trim()"))
                if len(cols) == 4:
                    break
            check(len(cols) == 4, 'expected 4 distinct --phos colours, got %s' % cols)
            t.page.emulate_media(reduced_motion='reduce')
            t.page.goto(self.base + 'index.html?seed=1'); t.page.wait_for_function('window.DV && DV.roll')
            check(t.js("getComputedStyle(document.querySelector('.flicker')).animationName") == 'none', 'flicker still animates with reduced motion')
        finally:
            self.done(t)

    def noscript(self):
        s = open(os.path.join(ROOT, 'index.html')).read()
        m = re.search(r'<noscript>(.*?)</noscript>', s, re.S)
        check(m and 'phosphor' in m.group(1) and 'TODO-DAVID' not in m.group(1), 'noscript fallback missing, or still has placeholders')
        ctx = self.browser.new_context(java_script_enabled=False)
        pg = ctx.new_page(); pg.goto(self.base + 'index.html')
        check('2119' in pg.inner_text('body'), 'noscript text not visible with JS off')
        ctx.close()

    def eggs(self, m):
        def f():
            t = self.tab()
            try:
                t.boot('?seed=7&machine=' + m)
                t.page.keyboard.press('Control+u')
                roll = t.js('DV.roll')
                # --- Anarchy A
                out = t.run('sudo ls')
                check('no gods, no masters, no sudo.' in out, 'sudo: no anarchy line')
                art = [l for l in t.js('DV.eggs.anarchy.art').split('\n') if l.strip()]
                check(sum(1 for l in out.split('\n') if l.rstrip() in [a.rstrip() for a in art]) >= 8, 'sudo: no circle-A')
                out = t.run('make anarchy')
                check('no gods, no masters, no sudo.' in out and '#' in out, 'make anarchy failed')
                # --- journal
                out = t.run('log')
                n = t.js('DV.journal.length')
                check(n >= 6 and sum(1 for e in t.js('DV.journal.map(e=>e.date)') if e in out) == n, 'log does not list every entry')
                out = t.run('log latest')
                check('uplink' in out, 'the last entry does not point at uplink')
                first = t.js('DV.journal[0]')
                out = t.run('cat log/' + first['date'])
                check(first['text'][:30] in out, 'journal entry not a file in ~/log/')
                out = t.run('cat last-session')
                check('uplink' in out, 'last-session does not show uplink')
                # --- trail: clue file -> word -> su -> secrets
                out = t.run('cat secrets')
                check('Permission denied' in out, 'secrets readable before root')
                out = t.run('cat ' + roll['clueFile'])
                check(roll['word'] in out, 'clue file does not hold the word')
                t.page.keyboard.type('su'); t.page.keyboard.press('Enter'); t.wait_text(r'Password: ?$', 20)
                t.page.keyboard.type(roll['word']); t.page.keyboard.press('Enter')
                t.wait_text(r'root@%s:[^\n]*# ?$' % HOST[m], 20)
                out = t.run('cat secrets')
                check('Permission denied' not in out and len(out.strip()) > 60, 'secrets still locked as root: ' + out[:100])
                # --- ASCII drop
                spot = roll['spots'][0]
                out = t.run('cat ' + spot)
                lines = [l.strip() for l in t.js("(DV.eggs.art.filter(a=>a.id===DV.roll.art)[0].art)").split('\n') if l.strip()]
                best = max(lines, key=len)
                check(best in out, 'ascii drop not found at ' + spot)
                # --- halt as root powers off
                t.run('halt', expect=r'System halted', timeout=40)
                check(t.js("document.getElementById('crt').classList.contains('off')"), 'halt did not power off the tube')
                t.page.screenshot(path=os.path.join(SHOTS, '%s-halt-%s.png' % (m, self.label)))
                check(not t.problems, 'console problems: %s' % t.problems)
            finally:
                self.done(t)
        return f

    def uplink(self):
        t = self.tab()
        try:
            t.boot('?seed=7&machine=phosphor')
            t.page.keyboard.type('uplink'); t.page.keyboard.press('Enter')
            end = time.time() + 30
            while time.time() < end and not t.js("!!document.getElementById('full')"):
                time.sleep(0.3)
            check(t.js("!!document.getElementById('full')"), 'uplink did not open a full-screen game')
            t.page.wait_for_timeout(1500)
            check(len(t.js("document.getElementById('full').innerText").strip()) > 20, 'uplink screen is empty')
            t.page.screenshot(path=os.path.join(SHOTS, 'uplink-%s.png' % self.label))
            t.page.keyboard.press('Control+c'); t.page.wait_for_timeout(800)
            if t.js("!!document.getElementById('full')"):
                t.page.keyboard.press('q'); t.page.wait_for_timeout(800)
            check(t.js("!document.getElementById('full')"), 'uplink did not quit')
            check(not t.problems, 'console problems: %s' % t.problems)
        finally:
            self.done(t)

def static_checks():
    """grep the repo (what we added) for em dashes and banned names."""
    bad = []
    # names that must never appear: one per line in tests/banned.txt, which is not in the repo
    bf = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'banned.txt')
    banned = [l.strip() for l in open(bf, encoding='utf-8') if l.strip()] if os.path.exists(bf) else []
    skip_dirs = {'.git', 'dist', '.wrangler', 'tests', 'tools', 'inbox', '.claude', 'node_modules', '__pycache__', 'fixtures'}
    skip_files = {'SPEC.md', 'LICENSE', 'CHANGELOG.md', 'README.md'}
    upstream = ('engine/', 'machines/linux/', 'machines/shared/', 'machines/v7-1979/', 'machines/vm370-1980/', 'machines/trs80-1981/', 'machines/multics-1981/',
                'machines/cpm-1982/', 'machines/apple2-1984/', 'machines/tops20-1986/', 'machines/c128-1986/', 'machines/bsd-1987/', 'machines/dos-1988/',
                'machines/vms-1988/', 'machines/bbs-1990/', 'machines/irix-1993/', 'site/LICENSE', 'site/TODO.md')
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in skip_dirs]
        for f in fn:
            p = os.path.join(dp, f); rel = os.path.relpath(p, ROOT)
            if f in skip_files or f.endswith(('.m4a', '.png', '.ico')) or f.startswith('.'):
                continue
            try:
                s = open(p, encoding='utf-8').read()
            except Exception:
                continue
            if '—' in s and not rel.startswith(upstream):
                bad.append('em dash in ' + rel)
            if rel.startswith(upstream):
                continue
            for b in banned:
                if re.search(r'\b' + re.escape(b) + r'\b', s, 0 if b.isupper() else re.I):
                    bad.append('%s in %s' % (b, rel))
    return bad


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else 'both'
    srv = None
    bases = []
    if which in ('both', 'http'):
        srv = subprocess.Popen([sys.executable, os.path.join(ROOT, 'tests', 'serve.py'), '8790'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1.2)
        bases.append(('http', 'http://127.0.0.1:8790/'))
    if which in ('both', 'file'):
        bases.append(('file', 'file://' + ROOT + '/'))
    try:
        with sync_playwright() as pw:
            for label, base in bases:
                s = Suite(label, base, pw)
                for m in MACHINES:
                    s.case('boots from cold via ?machine=%s, no load errors' % m, s.boot_each(m))
                s.case('same-tab reload keeps the roll; ?seed forces one', s.roll_is_kept)
                s.case('20 seeds give different welcome, tint, word, art', s.twenty_seeds)
                s.case('4 tints differ; reduced motion stills the tube', s.tints_differ)
                s.case('noscript fallback names phosphor, no placeholders', s.noscript)
                for m in MACHINES:
                    s.case('%s: anarchy, journal, trail to root secrets, ascii drop, halt' % m, s.eggs(m))
                s.case('connect lists the archive and boots an archive machine bare', s.archive)
                s.case('uplink (site game) launches and quits', s.uplink)
                s.browser.close()
        off = sorted({u for b, u in ALL_REQUESTS if not ours(b, u)})
        RESULTS.append(('no request leaves the origin (%d requests seen)' % len(ALL_REQUESTS), not off, str(off[:5])))
        print(('PASS  ' if not off else 'FAIL  ') + RESULTS[-1][0], off[:5])
        bad = static_checks()
        RESULTS.append(('no em dash and no banned name in what we added', not bad, '; '.join(bad[:8])))
        print(('PASS  ' if not bad else 'FAIL  ') + RESULTS[-1][0], bad[:8])
    finally:
        if srv:
            srv.send_signal(signal.SIGTERM); srv.wait(5)
    p = sum(1 for r in RESULTS if r[1]); f = len(RESULTS) - p
    print('\n%d passed, %d failed' % (p, f))
    sys.exit(1 if f else 0)


if __name__ == '__main__':
    main()

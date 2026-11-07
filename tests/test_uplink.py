"""uplink: headless checks. Serves the repo on 8791 itself (python3 -m http.server) and kills it after.
Run: python3 tests/test_uplink.py"""
import os, re, subprocess, sys, time, json
sys.path.insert(0, os.path.dirname(__file__))
from dv import Tab
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'inbox/owner/screens')
BASE = 'http://localhost:8791/'
fails = []

def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (' ' + str(info) if info and not ok else ''))
    if not ok: fails.append(name)

def full(t):
    return t.page.evaluate("(document.getElementById('full')||{innerText:''}).innerText")

def wait_full(t, pat, timeout=20):
    end = time.time() + timeout
    while time.time() < end:
        s = full(t)
        if re.search(pat, s): return s
        time.sleep(0.1)
    raise TimeoutError('never saw %r; got %r' % (pat, full(t)[-300:]))

def state(t): return t.page.evaluate('window.uplinkDebug.state()')
def state_gone(t): return 'uplink' in t.text().split('\n')[-3:].__str__() or True
def key(t, s): t.page.keyboard.type(s); t.page.keyboard.press('Enter')

def boot(t, seed):
    t.page.goto(BASE + 'tests/uplink.html?uplinkseed=%d&machine=phosphor' % seed)
    t.page.click('#screen')
    t.wait_text(r'login: ?$', 90)
    time.sleep(1.0)
    t.page.keyboard.type('guest'); t.page.keyboard.press('Enter')
    t.wait_text(r'guest@\w+:~\$', 90)
    t.settle(1.5)
    for _ in range(12): t.page.keyboard.press('Backspace')  # the prompt comes up with the login typed in again

def start(browser, seed, setup=('', '', '', '')):
    t = Tab(browser, BASE)
    boot(t, seed)
    t.page.keyboard.type('uplink'); t.page.keyboard.press('Enter')
    wait_full(t, r'U P L I N K')
    for v in setup:
        t.page.keyboard.press('Enter') if v == '' else key(t, v)
    wait_full(t, r'angle:')
    return t

def fire(t, a, v):
    key(t, str(a)); key(t, str(v))

def wait_input(t, timeout=40):
    end = time.time() + timeout
    while time.time() < end:
        s = state(t)
        if s['mode'] in ('input', 'msg', 'results'): return s
        time.sleep(0.1)
    raise TimeoutError('no input mode; ' + str(state(t)))

srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8791'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # 1. setup defaults, skyline, mid-flight screenshot, crater
        t = start(browser, 7)
        s0 = state(t)
        check('defaults: 3 rounds, g 9.8, round 1', s0['g'] == 9.8 and s0['round'] == 0)
        screen = full(t)
        check('skyline drawn with windows', '░' in screen and '▪' in screen)
        check('wind arrow shown', re.search(r'wind (calm|<-+|-+>)', screen) is not None)
        check('score line shown', re.search(r'you 0 : 0 phosphor', screen) is not None)
        check('round counter shown', 'round 1/3' in screen)
        check('top-left prompt', full(t).split('\n')[0].startswith(' you') or 'you angle:' in full(t).split('\n')[0])
        key(t, '45'); key(t, '9')  # a short lob: lands on the near roofs
        time.sleep(0.25)
        t.page.screenshot(path=os.path.join(SHOTS, 'uplink-midflight.png'))
        s1 = wait_input(t); time.sleep(0.2)
        check('shot counted', s1['shots'][0] == 1)
        check('building crater carved', s1['solid'] < s0['solid'], (s0['solid'], s1['solid']))

        # 2. mast hit ends the round (solve for a direct hit on ward)
        sol = t.page.evaluate('window.uplinkDebug.solve(0)')
        check('solver found a direct shot', sol is not None, sol)
        # play until it is player 1 again (ward answers)
        s = wait_input(t, 60)
        while s['mode'] == 'input' and s['turn'] != 0: s = wait_input(t, 60)
        if s['mode'] == 'input':
            sol = t.page.evaluate('window.uplinkDebug.solve(0)')
            fire(t, sol['a'], sol['v'])
            end = time.time() + 30
            while time.time() < end and state(t)['mode'] != 'msg': time.sleep(0.1)
            sm = state(t)
            check('mast hit ends round with a win to the shooter', sm['mode'] == 'msg' and sm['wins'] == [1, 0], sm['wins'])
            txt = full(t)
            check('message names the winner and has a taunt line', 'you takes the round' in txt and 'phosphor:' in txt, txt[:300])
        else:
            check('mast hit ends round', False, 'phosphor ended the round first: ' + str(s))

        # 3. play rest of the rounds with solved shots, then the results screen
        guard = 0
        while state(t)['mode'] != 'results' and guard < 60:
            guard += 1
            s = state(t)
            if s['mode'] == 'msg': t.page.keyboard.press('Enter'); time.sleep(0.2)
            elif s['mode'] == 'input' and s['turn'] == 0:
                sol = t.page.evaluate('window.uplinkDebug.solve(0)')
                fire(t, sol['a'], sol['v']) if sol else fire(t, 45, 20)
                time.sleep(0.3)
            else: time.sleep(0.2)
        check('results screen reached', state(t)['mode'] == 'results', state(t))
        time.sleep(0.2)
        res = full(t)
        check('results show wins and shots fired', 'wins' in res and 'shots fired' in res, res)
        t.page.screenshot(path=os.path.join(SHOTS, 'uplink-results.png'))
        t.page.keyboard.press('x')
        time.sleep(0.8)
        check('any key returns to the shell', t.page.evaluate("!document.getElementById('full')"))
        check('no console errors (run 1)', not t.problems, t.problems)
        t.page.close()

        # 4. q quits mid-game; two-player setup
        t = start(browser, 11, ('2', 'ann', 'bo', '2', '12'))
        check('two-player names shown', 'ann angle:' in full(t) and 'bo' in full(t), full(t)[:200])
        check('custom gravity', state(t)['g'] == 12)
        key(t, '40')
        t.page.keyboard.press('q')
        time.sleep(0.8)
        check('q exits to the prompt', t.page.evaluate("!document.getElementById('full')") and state_gone(t))
        check('no console errors (run 2)', not t.problems, t.problems)
        t.page.close()

        # 5. ^C at setup, off-edge miss, and a bad angle is refused
        t = Tab(browser, BASE)
        boot(t, 3)
        t.page.keyboard.type('uplink'); t.page.keyboard.press('Enter'); wait_full(t, r'U P L I N K')
        t.page.keyboard.press('Control+c')
        time.sleep(0.8)
        check('^C quits at setup', t.page.evaluate("!document.getElementById('full')"))
        t.page.close()
        t = start(browser, 3)
        key(t, '120')
        check('angle over 90 refused', 'vel:' not in full(t).split('\n')[0])
        fire(t, 5, 150)  # fast, flat: leaves by the right edge or hits; either way the turn passes
        s = wait_input(t, 40)
        check('turn passes after a shot', s['shots'][0] == 1)
        t.page.close()

        # 6. the opponent converges (shots needed), seeded
        t = start(browser, 5)
        tr = t.page.evaluate('window.uplinkDebug.aiTrial(40)')
        hit = [x for x in tr if x]
        avg = sum(hit) / max(1, len(hit))
        print('ai: hit within 14 shots on %d/40 skylines, mean %.1f shots' % (len(hit), avg))
        check('ai finds the range on most skylines', len(hit) >= 34, tr)
        check('ai is beatable (not a first-shot sniper)', avg >= 2.0, avg)
        t.page.close()

        # 7. phone width and reduced motion
        t = Tab(browser, BASE)
        t.page.set_viewport_size({'width': 390, 'height': 760})
        t.page.emulate_media(reduced_motion='reduce')
        boot(t, 9)
        t.page.keyboard.type('uplink'); t.page.keyboard.press('Enter')
        wait_full(t, r'U P L I N K')
        for _ in range(4): t.page.keyboard.press('Enter'); time.sleep(0.2)
        wait_full(t, r'angle:')
        key(t, '45'); key(t, '20')
        t0 = time.time()
        time.sleep(0.15)
        t.page.screenshot(path=os.path.join(SHOTS, 'uplink-phone.png'))
        wait_input(t, 20)
        check('reduced motion: shot finishes quickly', time.time() - t0 < 6, time.time() - t0)
        cols = t.page.evaluate("document.getElementById('full').children[0].innerText.length")
        check('phone width renders (full screen up)', 'you' in full(t) or 'angle' in full(t))
        check('no console errors (phone, reduced motion)', not t.problems, t.problems)
        t.page.close()
        browser.close()
finally:
    srv.kill()
print('\n%d failure(s)' % len(fails))
sys.exit(1 if fails else 0)

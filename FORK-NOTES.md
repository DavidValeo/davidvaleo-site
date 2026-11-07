# FORK-NOTES: davidvaleo.com on PHOSPHOR-9

Fork of github.com/GaijinSystems/phosphor (remote `upstream`). AGPL-3.0-or-later; LICENSE and upstream notices kept.
Our code is AGPL too. The `source` command points at https://github.com/DavidValeo/davidvaleo-site.

## Upstream files edited (each one, and why)

| file | change | why |
|---|---|---|
| `index.html` | title, description and noscript text; a `data:` favicon (no 404 on /favicon.ico); script tags for `content/*.js`, `site/variety.js`, `site/journal.js`, `site/games.js` | the page is ours; the engine loads our data and commands |
| `machines/machines.js` | one entry, `phosphor`, added before `linux` | register our machine; the vintage entries stay, so `connect` reaches them and upstream merges stay clean |
| `README.md` | a section about the fork added above the engine manual, which is kept whole | so the repo says what it is; merges only touch the top |
| `site/config.js`, `site/content.js`, `site/home.js`, `site/theme.css` | rewritten | these are the template's "yours" files; they are meant to be replaced |

Nothing else under `engine/` or the vintage `machines/` folders is touched.

## New files (not upstream)

- `machines/phosphor-2119/`: `machine.js` (boot, readme, last-session), `commands.js`, `fs.js`, `later.js`.
  It reuses `machines/linux/commands.js`, `fs.js` and `games/` unchanged and lays its own identity on top.
- `machines/dv-shared/`: `core.js` (helpers; loads the engine's /usr/games: frotz, nethack, cowsay, sl, fortune, cmatrix)
  and `eggs.js` (`sudo`, `make anarchy`).
- `content/`: `journal.js` (the log), `variants.js` (per-tab welcome, tint, password, egg spots), `eggs.js` (ascii art).
- `site/`: `variety.js` (the per-tab roll), `journal.js` (the `log` command), `games.js` and `games/uplink.js` (the uplink game).
- `tests/` (Playwright), `deploy.sh`.

## Deploy

`./deploy.sh` copies the tracked files, minus `tests/`, `tools/`, `inbox/`, `.claude/` and these notes, into `dist/` and
deploys it to Cloudflare Pages. Everything served is static and relative-path.

## Merging upstream

`git fetch upstream && git merge upstream/main`. Conflicts can only be in the files in the first table.

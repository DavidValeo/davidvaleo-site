# To do: the example text in site/

Everything in this folder is example content (CC0, see `LICENSE` here) for a site to replace. This lists every
placeholder and generic line in it, so nothing is missed.

## Settings (`site/config.js`)

- `name: operator`: your name. Its first word becomes `{owner}`, the owner's login.
- `email: operator@example.com`: your address, `{email}` in the text.
- `title: PHOSPHOR-9` and `badge: PHOSPHOR-9`: the browser tab and the name on the bezel.
- `source: https://github.com/GaijinSystems/phosphor`: point it at your copy if you change the code (AGPL).
- `protected: photo01.pic, photo02.pic, secrets, .trash/core`: `photo01.pic`, `photo02.pic` and
  `.trash/core` are locked, empty teaser files; only `secrets` (in `site/home.js`) has text.

## Words (`site/content.js`)

- `== welcome ==`: `welcome to {site}.` and `~ type help and press return.` Generic, but works as it is.
- `== about ==`: the line `~ (edit the about section in site/content.js)` is a placeholder; the two lines
  above it are generic.
- `== mail ==`, the letter:
  - the paragraph `this is the letter every visitor finds waiting. say hello, ...` is a placeholder;
  - the rows `my next project ... coming soon -> https://example.com` and
    `my first project ~~2025-06-01~~ {year}-06-01 -> https://example.com` are examples;
  - `to reach the operator, write to:` and `~ no terminal should be without one!` are generic.
- `== command: motto | words to live by ==` (`keep the tube warm.`): an example of a command of your own.

## The home folder (`site/home.js`)

- `now`: the line `~ (edit the now file in site/home.js)` is a placeholder.
- `attic`: `nothing up here yet.`
- `notes/todo`, `notes/ideas`, `src/hello.c`, `.plan` and `.profile`: example files.
- `secrets`, `.trash/letter.bak` and `.trash/.deeper/note`: the example puzzle. The note points to `/etc` and
  the root password the machines leave lying about (`/etc/rc.old` on V7, 4.3BSD and IRIX, a cron job in
  `/etc/cron.d` on Debian, `<SYSTEM>PTYCON.ATO` on TOPS-20); `secrets` is locked until you are root.
  Keep, change or delete it as a whole.

## Look (`site/theme.css`)

- Nothing is set: every block is commented out, so the engine's P1 green is used.

# Changelog

## 1.0.0 (unreleased)

First public release of PHOSPHOR-9 as a template, split out of the single-file terminal
behind gaijin.systems.

- Split into `engine/` (the terminal), `machines/v7-1979/` (the imaginary computer) and
  `site/` (your content), loaded by plain `<script>` tags: works opened from disk.
- Built-in commands live in `engine/commands/`; switch any of them off with `commands:`.
- The whole letter is content now (`== mail ==`), not just its project list.
- `{site}`, `{hostname}`, `{owner}`, `{email}` and `{year}` placeholders in any text.
- New settings: `title`, `badge`, `source`, `commands`, `hostname`; machine settings
  `year`, `installed`, `user`, `offline`.
- New `source` command, pointing at the terminal's source code (GNU AGPL).
- Files that fail to load (missing, or a stray backtick inside) are named on the screen
  at start, including when the page is opened from disk.
- Text commands can replace a core command once it is switched off; `commands: -name`
  also removes the machine's text commands, never the site's.
- `about` disappears when there is no `== about ==` section; `man` works with `help` off.
- Optional `site/theme.css` for colours, with an amber example.

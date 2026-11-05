# Changelog

## 1.0.0 (unreleased)

First public release of PHOSPHOR-9 as a template, split out of the single-file terminal
behind gaijin.systems.

- Split into `engine/` (the terminal), `machines/v7-1979/` (the imaginary computer) and
  `site/` (your content), loaded by plain `<script>` tags: works opened from disk.
- Built-in commands live in `engine/commands/`; switch any of them off with `commands:`.
- The whole letter is content now (`== mail ==`), not just its project list.
- `{site}`, `{hostname}`, `{owner}`, `{email}` and `{year}` placeholders in any section's text.
- New settings: `title`, `badge`, `source`, `commands`, `hostname`, `prompt`; machine settings
  `year`, `installed`, `user`, `offline`.
- New `source` command, pointing at the terminal's source code (GNU AGPL).
- Files that fail to load (missing, or a stray backtick inside) are named on the screen
  at start, including when the page is opened from disk.
- Text commands can replace a core command once it is switched off; `commands: -name`
  also removes the machine's text commands, never the site's.
- `about` disappears when there is no `== about ==` section; `man` works with `help` off.
- Optional `site/theme.css` for colours, with an amber example.
- Screen readers hear each finished line; links show a focus outline and open with Enter;
  reduced-motion settings also stop the cursor blink and the afterglow.
- PageUp and PageDown scroll back through the output.
- Some things to find, if you know where to look.
- `fill` puts the monitor away and lets the glass fill the window; the browser remembers.
- On touch screens, a small row of keys on the glass: esc, ^C, ^D, ^Z and tab.
- Several machines: `machines/machines.js` lists them, `machine:` and `machines:` choose,
  and the `connect` command or `?machine=name` switches. New machine setting `homes`.
- A real shell: pipes, `<` `>` `>>`, `&&` `||`, quotes, `$VARIABLES`, wildcards, and shell
  scripts (`sh file`, or `chmod +x` and `./file`).
- The file system can be written for the session: `>`, `touch`, `mkdir`, `cp`, `mv`, `rm`.
  A reload puts everything back. `cat` and friends read the keyboard until Ctrl-D.
- `ed`, the standard editor, with its addresses, regular expressions and `?`.
- `vi`, the visual editor, on the machines that had it, drawn on the glass.
- Colossal Cave, the 350-point version, on the 4.3BSD machine: `adventure`, in `/usr/games`, with
  `suspend` and resume, kept in the browser.
- Small Berkeley games there too: `wump`, `hangman`, `worm`, `robots`, `snake`, `banner`, `number`,
  `primes`, `factor`. `robots` and `snake` keep their scores in the browser.
- Each machine's year is set once, in `machines/machines.js`, and `{year}` follows it.
- More machines: a VAX-11/780 running 4.3BSD; a PC running MS-DOS 3.30 with `C:\>`, `dir`, `edlin`
  and `Abort, Retry, Fail?`; a Silicon Graphics Crimson running IRIX 4.0.5 with `hinv` and `fsn`;
  an S-100 box running CP/M 2.2 with `A>`, `PIP` and `STAT`; and a VAX running VMS, with versioned
  files and DCL. New machine settings: `home`, `shell`, `unix`, `login`, `csh`, `login prompt`,
  `root login`, `root prompt`, `root password`, `login failed`, `closed door`, `backdoor`.
- Text tools: `grep`, `wc`, `sort`, `uniq`, `tail`, `tr`, `tee`, `cal`, `file`, `du` and others.
- Each machine has only the commands its real system had; `help` lists just the essentials.
- Scripts and the prompt understand `for`, `while`, `until`, `if`, `case`, `test`, `expr`, `read`,
  `shift`, `$1` and backticks; on csh machines, `foreach`. Machines boot with their own `== boot ==`.
- Ctrl-C, Ctrl-D, Ctrl-S, Ctrl-Q and Ctrl-U do what they should; `stty 9600` sets a real line speed.
- File names, commands and aliases follow the machine's `case:` setting; Unix is case-sensitive.
- Glow colours follow `--phos-rgb`, `--dim-rgb` and `--err-rgb`, so a theme recolours the
  whole tube, and the amber example is one line.
- `alias name='a ; b'` works at the prompt: `;` inside quotes no longer splits the line.

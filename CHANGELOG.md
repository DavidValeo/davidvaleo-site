# Changelog

## 1.0.0 (unreleased)

First public release of PHOSPHOR-9 as a template, split out of the single-file terminal
behind gaijin.systems.

- On a desktop the monitor sits at the top of the window, centred across, and the cable hangs below it. A new
  `cord desktop:` setting gives the coil its own number of turns on a wide screen.
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
- `fill` puts the monitor away and lets the glass fill the window; the browser remembers. `help`
  lists it, and VMS `HELP` has `FILL` and `RUN`.
- `lite` tube effects for browsers that draw without a graphics chip: one small glow, a stepped,
  unblended band, a still flicker and cable, a lighter inner shadow, no afterglow when scrolling. New setting `effects:` (`auto`,
  `full`, `lite`); `auto` picks `lite` for a software or missing WebGL, or a slow warm-up. The
  `effects` command shows or switches it and the browser remembers; `help` lists it, VMS `HELP`
  has `EFFECTS`.
- On touch screens, a small row of keys on the glass: esc, ^C, ^D, ^Z and tab.
- Several machines: `machines/machines.js` lists them, `machine:` and `machines:` choose,
  and the `connect` command or `?machine=name` switches. New machine setting `homes`.
- A real shell: pipes, `<` `>` `>>`, `2>` `2>&1`, `&&` `||`, quotes, `$VARIABLES`, wildcards, `#`
  comments, and shell scripts (`sh file`, or `chmod +x` and `./file`). Each command on a line runs
  after the one before has finished, and its backticks and variables are worked out when its turn
  comes.
- The file system can be written for the session: `>`, `touch`, `mkdir`, `cp`, `mv`, `rm`.
  A reload puts everything back. `cat` and friends read the keyboard until Ctrl-D.
- `ed`, the standard editor, with its addresses, regular expressions and `?`.
- `vi`, the visual editor, on the machines that had it, drawn on the glass.
- Colossal Cave, the 350-point version, on the 4.3BSD machine: `adventure`, in `/usr/games`, with
  `suspend` and resume, kept in the browser. VMS has it too, as `RUN [GAMES]ADVENTURE`.
- Small Berkeley games there too: `wump`, `hangman`, `worm`, `robots`, `snake`, `banner`, `number`,
  `primes`, `factor`. `robots` and `snake` keep their scores in the browser.
- Rogue on the 4.3BSD machine, ported from the C of version 5.4.4, with `S` and the top ten kept in the
  browser. It shrinks its type to show the whole 80x24 where that stays readable, and pans where not.
- Each machine's year is set once, in `machines/machines.js`, and `{year}` follows it.
- More machines: a VAX-11/780 running 4.3BSD; a PC running MS-DOS 3.30 with `C:\>`, `dir`, `edlin`
  and `Abort, Retry, Fail?`; a Silicon Graphics Crimson running IRIX 4.0.5 with `hinv` and `fsn`;
  an S-100 box running CP/M 2.2 with `A>`, `PIP` and `STAT`; and a VAX running VMS, with versioned
  files and DCL. New machine settings: `home`, `shell`, `unix`, `login`, `csh`, `login prompt`,
  `root login`, `root prompt`, `root password`, `login failed`, `closed door`, `backdoor`.
- Every game in V7's `/usr/games` plays: `arithmetic`, `backgammon`, `banner`, `bcd`, `bj`, `checkers`,
  `chess`, `ching`, `cubic`, `fortune`, `hangman`, `maze`, `moo`, `ppt`, `quiz`, `reversi`, `ttt`, `words`
  and `wump`, ported from their source, or from 2.11BSD's sources checked against the V7 programs.
  `banner`, `checkers`, `cubic`, `maze` and `reversi`, whose source is lost, are rewritten to match the
  real programs' output.
- So does all of 4.3BSD's: also `aardvark`, `battlestar`, `boggle`, `btlgammon`, `canfield`,
  `cfscores`, `cribbage`, `doctor`, `fish`, `hunt` (with robot players), `mille`, `monop`, `rain`,
  `sail`, `snscore`, `teachgammon`, `trek`, `worms` and `zork`, which is Dungeon, as on the tape.
- VMS runs the games in `[GAMES]`: Adventure, Conquest, Empire, Monster, Moria and Star Trek.
  Moria and Conquest keep their sites' play hours, by the visitor's clock.
- DOS and CP/M run the real Zork I and II on a Z-machine interpreter, and keep some of its replies
  at the prompt. There is no Zork III.
- Games load the first time they run. Each machine's `later.js` names its games and holds their
  manual pages, so `ls`, `man` and `which` work before then. `commands: -name` switches a game
  off; the README shows how to add, remove and stub one.
- CP/M's `USER` areas keep their files apart.
- 4.3BSD checked against the real system: its error messages and usage lines, `ls` in columns with
  `-F`, `-s` and `-i`, `ps aux`, csh variables, `setenv`, one-line `if`, `which`, `whereis`, `last` and
  `limit`, and the real `/usr/games`. New machine setting `perror`.
- Text tools: `grep`, `wc`, `sort`, `uniq`, `tail`, `tr`, `tee`, `cal`, `file`, `du` and others.
- Each machine has only the commands its real system had; `help` lists just the essentials.
- Scripts and the prompt understand `for`, `while`, `until`, `if`, `case`, `test`, `expr`, `read`,
  `shift`, `$1` and backticks; on csh machines, `foreach`, `>&`, `$status`, `$#name`, and `if`
  with `&&`, `||`, `!`, arithmetic, `=~` and `-r` `-w` `-x` `-e` `-d` `-z`. Machines boot with their own
  `== boot ==`.
- Locked files stay locked through `mv`, `rm -r`, links and every machine's own copy commands, and
  `rm -r` and `rmdir` leave alone a folder that `su` will return to.
- Ctrl-C, Ctrl-D, Ctrl-S, Ctrl-Q and Ctrl-U do what they should; `stty 9600` sets a real line speed.
- File names, commands and aliases follow the machine's `case:` setting; Unix is case-sensitive.
- Glow colours follow `--phos-rgb`, `--dim-rgb` and `--err-rgb`, so a theme recolours the
  whole tube, and the amber example is one line.
- `alias name='a ; b'` works at the prompt: `;` inside quotes no longer splits the line.
- A seventh machine, `linux`: a KVM server running Debian 13 "trixie", on its serial console, with the
  visitor's own date and year. bash's prompt, tab completion, `history`, `!!` and `$(command)`; GNU's `ls`,
  `cat`, `rm` and `mkdir` messages and `--help`; `uname`, `ip`, `hostname -I`, `free`, `df`, `uptime`, `w`,
  `ps aux`, `top`, `systemctl`, `journalctl`, `fastfetch`, and `sudo` and `apt`, which know a guest when they
  see one. In `/usr/games`, `frotz` with Zork I and II, `sl`, `cowsay` and `fortune`; and `cmatrix`.
  New machine setting `shell: bash`; a machine's `year` may be `new Date().getFullYear()`.
- `machine: random` starts on a machine picked at random, the same one for the rest of the browser tab.
- On phones, the monitor stays in view when the soft keyboard opens.
- An eighth machine, `tops20`: a DECSYSTEM-2060 running TOPS-20 V6.1 in 1986, with the EXEC's `@`, Escape
  recognition and guide words, `?` for what comes next, generation numbers, `UNDELETE` and `EXPUNGE`,
  `SYSTAT`, `FINGER`, `MM`, and `ADVENTURE` and `DUNGEON` in `<GAMES>`. A machine can now answer Escape,
  Tab and `?` at the prompt itself (`Phosphor.recognize`).

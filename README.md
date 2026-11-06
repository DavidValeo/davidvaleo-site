# PHOSPHOR-9

A 1979 video terminal for your website. Visitors land at a glowing green screen with a
coiled cable, log in as `guest`, and poke around a small Version 7 Unix machine: `ls`,
`cat`, `mail`, `man`, `who`, `ps`, a few secrets. You fill it with your own words. Six more
machines can be plugged in, from CP/M to a Debian server of today, and most of them come with their games.

Plain HTML, CSS and JavaScript. No build step, no frameworks, no server code, and no
requests to anyone else's servers.

## Quick start

1. Download or clone this repository.
2. Open `index.html` in a browser. Double-clicking it works; no web server is needed.
3. Edit the files in `site/`, reload, repeat.
4. Copy the whole folder to any web server. It works at a domain's root or in a
   subfolder (`example.com/terminal/`), because every path is relative.

## What goes where

```
index.html            the page; lists the files to load. Edit only the <title>
                      (shown before the script runs; "title:" in config.js wins after).
site/                 YOURS: everything you are meant to change
  config.js           settings: your name, email, speed, sound, locked files
  content.js          the welcome message, the about file, the letter, your commands
  home.js             the visitor's home folder: files, folders, hidden things
  theme.css           colours (optional)
machines/             the imaginary computers: machines.js lists them, one folder for each
  machines.js         the catalog: each machine's name, year, folder and files
  v7-1979/            one machine:
    machine.js          its settings and text: self-test, boot log, dmesg, ps
    fs.js               its system folders and files
    commands.js         commands of its own (not every machine has one)
    later.js            its games: names and manual pages, loaded when first run
    games/              the games themselves, one file each
  shared/             games and helpers more than one machine uses
engine/               the terminal itself; you should not need to touch it
  phosphor.css
  phosphor.js
  commands/           the built-in commands, a few per file
```

`index.html` loads the engine, the commands, the list of machines and your site; the
engine then loads the chosen machine. Anything you set wins over the machine.

## What loads when

1. **The page.** `index.html` loads the engine, the shared Unix commands (`engine/commands/`),
   the catalog (`machines/machines.js`) and your `site/` files. No machine yet.
2. **The machine.** The engine picks one (see [Choosing machines](#choosing-machines)) and
   loads the files its catalog entry lists, in the order listed: usually `later.js` first, where
   there is one (it names the games and holds their manual pages), then its settings and text
   (`machine.js`), its commands (`commands.js`) and its file tree (`fs.js`), in whichever order
   that machine's entry gives.
   `connect bsd` reloads the page with `?machine=bsd`, so each machine starts from cold and
   nothing of the last one is left behind.
3. **A game.** A game's own files load the first time someone runs it, and then stay for the
   visit. Until then `ls /usr/games`, `man rogue` and `which rogue` already work, and a visitor
   who never plays downloads none of it. If a game's file fails to arrive, the program says
   it cannot execute (on VMS, that the image could not be activated) and the prompt comes back;
   Ctrl-C stops the wait.

## Writing content

The files in `site/` look like JavaScript, but you only ever edit the text between the
two backticks:

```
Phosphor.content(String.raw`

name:  operator

== welcome ==
welcome to {site}.

`);
```

This is what lets `index.html` work when opened straight from your disk. It costs you two
things you cannot type inside the backticks: a backtick (`` ` ``), and a dollar sign
followed by `{`. If either slips in, that file stops loading and the terminal says so on
the screen when it starts.

### Settings

At the top of a file, before its first `== section ==`, one per line:

| Setting | What it does |
|---|---|
| `name:` | Your name. The first word (up to 8 letters) is the owner's login, shown in `ls -l`, `who` and on the mail. |
| `email:` | Your address. `{email}` in any section's text becomes this. |
| `title:` | The browser tab title. |
| `badge:` | The name on the monitor's bezel (desktop only). |
| `speed:` | Typing speed. `1` is normal, `1.25` is 25% faster. |
| `uppercase:` | `yes` prints everything in capitals, like an uppercase-only teletype; `no` does not. Without this line, `yes`. |
| `prompt:` | The shell prompt, normally `$ `. Use quotes to keep a trailing space: `prompt: "% "`. |
| `sound:` | `on`: keyclicks from the first tap or keypress. `off`: silent until `sound on`. |
| `effects:` | `auto` (the default), `full` or `lite`; see [Looks](#looks). A visitor's own choice with the `effects` command wins in their browser. |
| `source:` | Where the `source` command points. Must start with `http://` or `https://`. See [Licence](#licence). |
| `commands:` | Switch commands off or on: `commands: -ping, -sudo`. Works on the built-in commands, the machine's (`-sudo`) and the games (`-rogue`); see [Switching a game off](#switching-a-game-off). Without the `-`, it switches back on one the machine has switched off (`commands: vi`). Your own `== command: ==` sections are never switched off, so delete those instead. |
| `protected:` | Locked files and folders: listed by `ls`, but `cat` says *can't open*. Paths work (`.trash/core`); a trailing `/` makes a locked folder. |
| `machine:` `machines:` | Which machine the terminal starts on, and which ones the `connect` command offers: `machines: v7, bsd`. Unset, the first and all of them. With one machine there is no `connect`. `machine: random` picks one of the allowed machines when the address doesn't name one, and keeps that pick for the rest of the browser tab, so a reload boots the same machine and a new tab picks again. |
| `hostname:` | The machine's name. Normally taken from your domain (`example.com` becomes `example`). |
| `cord turns:` `cord desktop:` `cord width:` `cord thickness:` `cord gap:` `cord straight:` `cord sway:` | The coiled cable under the monitor: `turns` is a count, and `desktop` is the count on a wide screen (`turns` is used on phones, and wherever `desktop` is unset); the rest are in screen pixels. Values outside a sensible range are pulled back into it. |

A machine's year lives in `machines/machines.js`, and `{year}` in any text follows it. The
machine sets a few more (`installed:`, `user:`, `homes:`, `case:`, `offline:`);
you can override those too. `case:` is `sensitive`, where `FILE` and `file` differ, as on
Unix, or `ignore`, where they are the same, as on DOS.

### Sections

A line like `== welcome ==` starts a section; the lines after it are printed as written.

| Section | What it is |
|---|---|
| `== welcome ==` | Printed after login (also `/etc/motd`). |
| `== about ==` | The `about` file and command. |
| `== mail ==` | The letter. `you have mail.` shows at login while it has text. |
| `== file: NAME ==` | A file in the home folder. `NAME` may be a path (`notes/todo`); folders are made as needed. A name starting with a dot is hidden (`ls -a`). A path starting with `/` goes anywhere. |
| `== dir: NAME ==` | An empty folder. |
| `== command: NAME \| HELP ==` | A new command that prints the section. `NAME, OTHER` gives it two names. Without help text it is hidden from `help`. It replaces a built-in of the same name, except the core ones (`help`, `man`, `clear`, `ls`, `cat`, `sound`, `cd`, `pwd`, `echo`, `mail`, `alias`, `source`): switch one of those off first (`commands: -mail`) and yours takes its place. |
| `== man: NAME ==` | The description part of a manual page. Replaces a built-in page or adds a new one. |
| `== boot ==` | A machine coming up after power-on, a line at a time; `text @300` waits 300 ms after the line. |
| `== aliases ==` | Shortcuts, one per line: `ll = ls -l`, or `cl = clear ; ls`. Only useful on a machine whose shell had aliases; the 1979 machine has none. |

### Inside a section

| You write | You get |
|---|---|
| `~ text` | dim green |
| `! text` | red |
| `~~text~~` | ~~struck through~~, anywhere in a line |
| `text -> https://example.com` | the whole line is a link (also `mailto:`; nothing else is accepted) |
| `{site}` `{hostname}` `{owner}` `{email}` `{year}` | filled in when the terminal starts; `{year}` follows the machine, so use it rather than writing a year |
| `# note` | a note to yourself, not printed |

Blank lines and leading spaces are kept. **Write each paragraph as one line**: the glass
wraps long lines to fit its width, phones included, so line breaks typed into the middle
of a paragraph look ragged on a small screen.

### The project list in the letter

A line in `== mail ==` with a run of two or more spaces in the middle is a *project row*:
name, spaces, status or date. Pad every row to the same width so the right-hand column
lines up (`~~` marks are not printed and do not count). On a screen too narrow for the
rows, the run of spaces shrinks, down to two, until each row fits. Project rows also get
a little extra space between them.

## Commands

`help` lists what a visitor needs to get around, including `fill`, which puts the cable
away and makes the monitor, bezel and all, as big as the window allows (`fill` again puts it back; the browser remembers),
and `effects`, which shows or switches the tube effects (`effects lite`, `full` or `auto`; see
[Looks](#looks)).
Behind it, each machine has the commands
its real system had, and no others apart from the terminal's own: on the
1979 machine there is no `vi`, and `whoami` is `who am i`. Explore; you know if you know.

The shell understands pipes, redirection, quotes, variables, wildcards and scripts. Visitors
can change files in their home folder and `/tmp`, and a reload puts everything back.
On the Unix machines, the commands `help` lists have a manual page (`man ls`) and a usage
line (`ls -h`), except that `echo -h` prints `-h`, as it should, and `fill -h` simply fills the screen; on Linux, where `-h` means
something else to GNU's tools, the usage line is `ls --help`. The Linux machine's bash also
completes names with tab (twice lists the choices), repeats with `!!` and takes `$(command)`. PageUp and PageDown scroll back through the output
once it has finished typing.

To add a command that prints text, use a `== command: ==` section. To add one that does
something, write a small file like the ones in `engine/commands/` and add a `<script>`
tag for it in `index.html`, after the other commands:

```js
Phosphor.command({names:['roll'],help:'roll a die',
  man:{what:'roll a die',syn:'roll',desc:['prints a number from 1 to 6.']},
  run:function(args){ Phosphor.typeLine(String(1+Math.floor(Math.random()*6))) }});
```

## The machines

| Name | Machine | Year | Its games |
|---|---|---|---|
| `v7` | PDP-11/70, Version 7 Unix | 1979 | `/usr/games` |
| `bsd` | VAX-11/780, 4.3BSD | 1987 | `/usr/games` |
| `dos` | IBM PC/AT, MS-DOS 3.30 | 1988 | `C:\ZORK` |
| `vms` | VAX-11/785, VAX/VMS V4.6 | 1988 | `[GAMES]`, started with `RUN` |
| `tops20` | DECSYSTEM-2060, TOPS-20 V6.1 | 1986 | `<GAMES>`, started by name |
| `irix` | Silicon Graphics Crimson, IRIX 4.0.5 | 1993 | graphics demos, which need a display it doesn't have |
| `cpm` | S-100 Z80, CP/M 2.2 | 1982 | `ZORK1` in user area 0, `ZORK2` in user area 3 |
| `linux` | KVM virtual server, Debian 13 "trixie" | the visitor's own | `frotz`, `sl`, `cowsay`, `fortune` in `/usr/games`, and `cmatrix` |

Each one has the commands, messages and file tree of its real system; V7 and 4.3BSD were
checked side by side with the real systems running in a simulator, and the Debian machine's
package versions and `apt`'s messages were checked against Debian 13. It is reached on its serial console, boots
when the terminal does, and follows the visitor's clock, year and all; its guest is not in
the sudoers file, so `sudo` and `apt install` say no, as they would. Each folder's `machine.js` holds its settings and text (the
self-test, the boot log, `dmesg`, the `ps` table), `fs.js` builds its system folders, and
`later.js`, where it has one, names its games.

### TOPS-20

The DEC-20's EXEC finishes words for you. Type the start of a command and press Escape (Tab
does the same here): it fills in the rest, with guide words in parentheses, as in
`DIRECTORY (OF FILES)`; Escape again gives the default, `*.*.*`. `?` lists what can come next
and gives you your line back. File names are `NAME.TYP.n` in directories like `<GUEST>`;
`DELETE` only marks a file, `UNDELETE` brings it back and `EXPUNGE` makes it go. `SYSTAT`,
`FINGER`, `MM` (the mail) and `LOGOUT` are there, and after `LOGOUT`, `LOGIN GUEST` with any
password. `HELP ?` lists the topics, `FILL`, `SOUND`, `EFFECTS` and `CONNECT` among them; bare
`CONNECT` lists the other machines, and `CONNECT <DIR>` moves you to a directory you own. The
messages were checked against TOPS-20 running under KLH10 (the Panda distribution) and the
6.1 EXEC's source. The recognition is the machine's: its `commands.js` sets
`Phosphor.recognize(key, line)`, which the engine asks about Escape, Tab and `?` at the prompt.

### Choosing machines

In `site/config.js`:

```
machine:  bsd
machines: v7, bsd, vms
```

`machine:` is the one the terminal starts on; `machines:` is the list `connect` offers and
the only ones that can be reached. Unset, the terminal starts on the first machine in the
catalog and offers all of them; with one machine in the list there is no `connect`.
`?machine=vms` on the page's address starts on that machine instead, if it is in the list
(anything else falls back to `machine:`), which is how `connect` switches.

### Adding a machine

1. Copy the folder of the machine nearest to what you want, say `machines/v7-1979/` to
   `machines/pdp-1975/`.
2. Add a line for it to `machines/machines.js`:

   ```js
   pdp:{name:'pdp-11/45, sixth edition',year:1975,dir:'machines/pdp-1975',files:['later.js','machine.js','fs.js']},
   ```

   `name` is what `connect` shows. `year` is the machine's clock and `{year}`; its
   `installed:` date must fall before that year starts, or on January 1. A machine of today
   can take the visitor's own year with `year:new Date().getFullYear()`, as `linux` does. `files` load in
   this order, from the folder (a path like `../shared/zork.js` reaches another folder).
   Machines are listed oldest first, and `connect` always lists them by year, whatever order
   a site's `machines:` gives. With no `machine:` setting, the oldest allowed machine is the
   default.
3. Change its files:
   - `machine.js` is text in the same format as `site/`: settings first, then sections
     (`== banner ==`, `== boot ==`, `== dmesg ==` and the rest). The settings a machine can
     set besides the site's are `installed`, `user`, `homes` or `home`, `case`, `offline`,
     `shell` (`dos`, `dcl` or `bash`), `unix: no` (leave out the Unix commands), `csh`, `perror`,
     `login`, `login prompt`, `login failed`, `root login`, `root prompt`, `root password`, `also root`,
     `backdoor`, `closed door`, `not found`, `mail notice` and `ls columns`; the eight
     machines between them use each one, so look there for an example.
     `commands: -vi, -whoami` leaves out the engine's commands the real system did not have.
   - `fs.js` builds the system folders with `P.sys(path,'d')` for a folder and
     `P.sys(path,'f',{body:[...]})` for a file, and `P.programs(...)` makes a program file for
     every command that has a `path`.
   - `commands.js`, if it has one, adds the machine's own commands with
     `Phosphor.command({...})`, written like the ones in `engine/commands/`.
   - `later.js` lists its games; see [Games](#games). An empty one is fine; or take
     `later.js` out of `files`.
4. Open the page with `?machine=pdp`. A file that fails to load is named on the glass.

### Removing a machine

To keep a machine off your site, leave it out of `machines:`. To take it out of the
template, delete its line from `machines/machines.js` and its folder (not `shared/`, which
other machines use). `?machine=` with a name that is not in the catalog starts the default
machine.

### Keeping Linux current

The other machines are fixed in their year. `linux` takes the visitor's year, but what it
shows (Debian 13.7, kernel 6.12.111, its package versions, and the apt and
unattended-upgrades logs, last run on 14 October 2026) was taken from Debian when this
release was made. Left alone, it ages into a server nobody patches, which is believable for
a while. Refresh it about once per Debian release, when a new major version comes out (Debian
14 "forky" is expected around 2027), or sooner if you like. In `machines/linux/`:

1. Start the current Debian in a container, for example
   `podman run --rm -it debian:trixie` (or the new release's name), and run `apt-get update`.
2. Take the release and versions from it, not from memory: `/etc/os-release`,
   `/etc/debian_version`, `bash --version`, `ls --version`, `apt --version`,
   `apt-cache policy` for each package the machine lists (in `commands.js`), and the
   kernel package's version and date (`apt-cache show linux-image-amd64`).
3. Update the kernel string and its build date (the boot text in `machine.js`, `uname`, and
   `/boot` and `/proc` in `fs.js`), `os-release`, `/etc/debian_version` and the motd.
4. Update the package list and versions, and the logs in `/var/log` (`apt/history.log`,
   `dpkg.log`, `unattended-upgrades/`) so their last run is a few weeks before the refresh.
5. Check the messages a visitor is likely to see against the container, as a non-root user:
   `sudo`, `su`, `apt install`, `apt update`, `dpkg`, and `man` for a missing page. Check that
   each program the machine runs is still packaged (`neofetch`, for example, was dropped in
   Debian 13, and `fastfetch` took its place).
6. For a new major release, also update the codename everywhere (`grep -ri trixie`),
   the `name:` in `machines/machines.js`, and the Debian rows in this README.
7. Run the machine and check its boot, `uname -a`, `cat /etc/os-release`, `apt list --installed`
   and `fastfetch`, then add a line to the changelog.

Its folder, `machines/linux`, has no year in its name, unlike the others, because its year is
the visitor's. A refresh changes only the text inside it.

## Games

The games are the real ones, ported from their original source to JavaScript and checked
against the original program running, compiled from its source or on the real system in a
simulator. Monster, Moria and Conquest are the exceptions: nothing could run their VAX code,
so they were tested on their own. Where no source survives, the program was rewritten to
behave like the real one; the tables say which.

### What is there

**Version 7 Unix**, in `/usr/games`:

| Game | |
|---|---|
| `arithmetic` | drill in sums |
| `backgammon` | the Bell Labs backgammon |
| `banner` | huge letters, sideways (rewritten from its output; no source survives) |
| `bcd` | text as a punched card |
| `bj` | blackjack |
| `checkers` | checkers against the machine (rewritten; no source survives) |
| `chess` | class D chess, the 1979 program, move for move |
| `ching` | the I Ching |
| `cubic` | 3-D tic-tac-toe, 4x4x4 (rewritten; no source survives) |
| `fortune` | a fortune |
| `hangman` | guess the word |
| `maze` | draws a maze (rewritten; no source survives) |
| `moo` | guess the four-digit number |
| `ppt` | text as paper tape |
| `quiz` | questions in pairs of categories, from a list of its own |
| `reversi` | othello (rewritten; no source survives) |
| `ttt` | tic-tac-toe that learns, and remembers in the browser |
| `words` | words that can be made from some letters |
| `wump` | hunt the wumpus |

**4.3BSD**, in `/usr/games`:

| Game | |
|---|---|
| `aardvark` | Aardvark's Museum, a DDL adventure |
| `adventure` | Colossal Cave, the 350-point version |
| `arithmetic`, `bcd`, `chess`, `ching`, `fortune`, `quiz` | as on V7, the Berkeley versions |
| `backgammon`, `teachgammon` | backgammon, and a tutorial for it |
| `banner` | large letters, down the page |
| `battlestar` | a tropical adventure |
| `boggle` | find words in a 4x4 grid, against the clock |
| `btlgammon` | the old Bell Labs backgammon |
| `canfield`, `cfscores` | the solitaire, and its winnings |
| `cribbage` | cribbage against the machine |
| `doctor` | an ELIZA, from the Franz Lisp |
| `factor`, `primes`, `number` | numbers into factors, primes and words |
| `fish` | Go Fish |
| `hangman`, `wump` | the Berkeley versions |
| `hunt` | the maze shoot-out, here against three robot players (the robots are new; the game had none) |
| `mille` | Mille Bornes |
| `monop` | Monopoly, for one to nine players at one keyboard |
| `rain`, `worms` | screen toys |
| `robots`, `snake`, `snscore`, `worm` | screen games, and snake's scores |
| `rogue` | Rogue 5.4.4 |
| `sail` | Wooden Ships and Iron Men, against computer-sailed ships |
| `trek` | Star Trek |
| `zork` | Dungeon, which is what `zork` was on the 4.3BSD tape: its opening and V2.0a wording, with Dungeon 2.5.6 behind them, since the tape's own FORTRAN is lost |

**VAX/VMS**, `RUN [GAMES]name` (`DIR [GAMES]` lists them; `LOGIN.COM` also lets you type
`ADVENTURE`, `STARTREK`, `EMPIRE` or `MORIA` with arguments):

| Game | |
|---|---|
| `ADVENTURE` | Colossal Cave, the same port as on 4.3BSD |
| `CONQUEST` | real-time space war, against the robots (one player; the scheduler that stands in for its driver is new) |
| `EMPIRE` | the war game, 1988 version |
| `MONSTER` | the multi-user adventure, here with one user, and the world kept in the browser |
| `MORIA` | Moria 4.8, from the VAX Pascal |
| `STARTREK` | Super Star Trek, from SST2K, a later descendant standing in for the DECUS program, whose source was not found |

**TOPS-20**, in `<GAMES>` (`DIR <GAMES>` lists them; `LOGIN.CMD` puts `GAMES:` in `SYS:`, so the
name at the `@` starts one, as does `RUN GAMES:name`). The other names there are a real site's,
and say no during prime time:

| Game | |
|---|---|
| `ADVENTURE` | Colossal Cave, the same port as on 4.3BSD |
| `DUNGEON` | the same Dungeon as 4.3BSD's `zork`, opening as the DEC-20's did, with its own welcome and first room; ^C goes back to the EXEC |

**MS-DOS and CP/M**: Zork I and Zork II, Infocom's own story files on an interpreter written
for this terminal. On DOS, `CD \ZORK` then `ZORK1` or `ZORK2`, or `C:\ZORK\ZORK1` from
anywhere. On CP/M, `ZORK1` from user area 0, and `USER 3` then `ZORK2`.

**IRIX** has `flight`, `buttonfly`, `dog`, `ideas`, `arena`, `newave` and `insect`, which
want a graphics display and say so.

**Debian 13**, what the administrator installed (`ls /usr/games`):

| Game | |
|---|---|
| `frotz` | the Z-machine interpreter, with Zork I and II in `INFOCOM_PATH`: `frotz zork1.z3` |
| `sl` | a steam locomotive, for those who type `sl` for `ls` (new drawings, after Toyoda Masashi's program) |
| `cowsay`, `cowthink` | a cow says or thinks what you give it: `fortune \| cowsay` |
| `fortune` | a saying, from a small set of old quotations chosen for this terminal |
| `cmatrix` | characters falling down the glass, in `/usr/bin` as Debian puts it (written for this terminal) |

### Full screen, and phones

The games that draw on the whole screen (`rogue`, `hunt`, `sail`, `mille`, `backgammon`,
`teachgammon`, `canfield`, `cribbage`, `battlestar`'s flights, `robots`, `snake`, `worm`,
`hangman`, `rain`, `worms`, Empire, Moria, Conquest, `sl`, `cmatrix`, and Zork's status line) take over the
glass and give it back when they end. Most of the others are a line at a time and work at
any width. Several were written for an 80 by 24 terminal: `rogue`, `mille`, `backgammon`,
`hunt`, `sail`, `canfield`, `cribbage`, `battlestar`'s flights, Empire, Moria and Conquest
shrink their type to show all of it while it stays readable, and on a screen too small for
that `rogue` and `mille` let the arrow keys look around, `sail` says it can't sail on this
terminal, and the others follow the cursor. `teachgammon` and the small games
(`robots`, `snake`, `worm`, `hangman`, `rain`, `worms`) and Linux's `top`, `sl` and
`cmatrix` use whatever size the glass is. On a phone, the row of keys on
the glass gives esc, Ctrl-C, Ctrl-D, Ctrl-Z and tab.

### Play hours

Moria and Conquest keep their sites' original rules and refuse to run in working hours, by
the visitor's own clock: Moria is closed 8 AM to 5 PM, Monday to Friday, and Conquest plays
from 6 PM to 8 AM on weekdays, all weekend and on the holidays its file lists. The other VMS
games run any time.

To open them all the time:

- **Moria**: in `machines/vms-1988/games/moria.js`, the line starting `days=[0,"SUN:` has a
  row per day with an `X` for each open hour and a `.` for each closed one. Make every
  character between the `:` and the `|` an `X`. A browser that has run Moria before has kept
  its own `HOURS.DAT` (see [Saves](#saves)) and keeps its old hours until that is cleared.
- **Conquest**: in `machines/vms-1988/games/conquest.js`, find `"*:18-23:*:*:*:"` (its
  `GAMCRON` file) and add `"*:*:*:*:*:", ` in front of it.

### Saves

Games that kept a save file or a score file in their day keep it in the visitor's own
browser (`localStorage`), under keys starting `phosphor-9/` and then the game's name:
`phosphor-9/rogue/...`, `phosphor-9/moria/files`, `phosphor-9/zork1/save/...` and so on.
Nothing is sent anywhere, and clearing the site's data in the browser clears them.

### Switching a game off

`commands: -rogue, -hunt` in `site/config.js` switches games off like any other command.
The program file stays in `/usr/games`, as it would on a machine where it was there and
not working, and running it gives `rogue: Command not found.` On VMS, a game switched off
goes back to `-SITE-F-PRIMESHIFT, games are disabled during prime shift`. This is the
way to do it that survives an upgrade.

### Putting a stub back

A stub is a game that is listed and won't run, with a message in the style of the machine,
which is what every game was before the ports. Two ways:

- **From `site/`**, a text command:

  ```
  == command: hunt ==
  hunt: load average too high. try again after hours.
  ```

  It replaces the game, but on every machine: `hunt` on V7 would print it too.
- **In the machine**, in its `commands.js` (or a new file added after `later.js` in its
  `files`):

  ```js
  P.stubs(['hunt','sail'],function(n){
    P.typeLine(n+': load average too high. try again after hours.');
  },{hidden:true,noHelpFlag:true});
  ```

  A stub defined after `later.js` wins over the game; its manual page stays. To drop the
  page as well, delete the game's line from `later.js`.

### Adding a game

A game is a file that defines a command, and an entry that names it:

1. Write the game as `machines/bsd-1987/games/coin.js`:

   ```js
   Phosphor.command({names:['coin'],run:function(args){
     Phosphor.typeLine(Math.random()<0.5?'heads':'tails');
   }});
   ```

   `Phosphor.ask(prompt, function(line){...})` reads a line; `Phosphor.program(...)` takes
   the whole screen (see `engine/phosphor.js` and the games already there for both).
2. Add it to the machine's `later.js`:

   ```js
   game('games/coin.js','coin',{what:'toss a coin',syn:'coin',desc:['prints heads or tails.']});
   ```

   The first argument is the file, or a list of files that load in order, relative to the
   machine's folder (`'../shared/x.js'` for a shared one). On V7, 4.3BSD and Linux the `game`
   helper, defined at the top of that `later.js`, gives the program file its path
   (`/usr/games`), so it shows in `ls` and `which`; a new `later.js` defines its own or calls
   `Phosphor.later` directly.
   On VMS the helper is `image('games/coin.js','coin')`, and `RUN [GAMES]COIN` also needs
   `['coin',1024]` added to the list of images in its `fs.js`. DOS, CP/M and IRIX have no
   `later.js`; add one to the machine's `files` in `machines/machines.js` to give them games.

Edits inside `machines/` are replaced when you upgrade. To keep a game of your own across
upgrades, put both parts in `site/`: the game in, say, `site/games/coin.js`, and the entry in
a new `site/games.js`, with a `<script src="site/games.js"></script>` line after the other
`site/` lines in `index.html`:

```js
Phosphor.later('../../site/games/coin.js',{names:['coin'],path:'/usr/games',
  enabled:function(){return Phosphor.machine==='bsd'},
  man:{what:'toss a coin',syn:'coin',desc:['prints heads or tails.']}});
```

The file path is relative to the machine's folder, hence the `../../`. Without `enabled`, the
game is on every machine.

### Removing a game

Delete its line from the machine's `later.js` and its file from `games/` (or from `shared/`,
if no other machine's `later.js` names it). Its entry in `fs.js`, if it has one, keeps the
program file listed; delete that too if you want no trace.

Zork on DOS and CP/M is not a command, so `commands:` can't switch it off: it runs when its
`.COM` file is there. To remove it, delete its files from that machine's `fs.js` (on DOS,
the `/zork` folder line and the three after it; on CP/M, the three-line `forEach` statement
that puts the `zork` files), then `'../shared/zork.js'` from its `files` in
`machines/machines.js`.

## Looks

`site/theme.css` overrides the engine's colours. It includes a ready-made amber monitor:
remove the comment marks around it.

The tube effects come in two strengths. `full` draws a double glow round the text, a bright
band rolling down the glass, a flicker, and a cable that sways. `lite` looks much the same for
far less drawing: one small glow, the band moving in small steps (five a second) without
blending, the flicker held at its average and the cable still, one inner shadow on the glass
instead of two, and no afterglow behind scrolling text (`clear` still fades). It is for browsers that draw the page without a graphics chip, where `full`
keeps half a processor core or more busy even while nothing is typed. The `effects:` setting picks one; `auto`, the default, uses `full`
unless the browser's WebGL is a software renderer (SwiftShader, llvmpipe and the like) or
missing, or the screen's warm-up draws at under 25 frames a second; then `lite`. Visitors can
switch with the `effects` command, and their browser remembers. A reduced-motion setting in the
browser or system also stops the band, the flicker, the sway, the cursor blink and the afterglow,
whichever effects are in use. The styles are in `engine/phosphor.css`, under `html.lite`.

## Privacy

The terminal makes no requests to other servers: no fonts, analytics or trackers. The one
exception is `ping`, on the machines that had it, which, when a visitor pings your own domain,
sends small `HEAD` requests for the page to your own server and times the answers. Switch it
off with `commands: -ping` if you would rather it did not.

Games that kept a save or a score file in their day keep them in the visitor's own browser
(`localStorage`; see [Saves](#saves)). The `fill` and `effects` commands remember their settings there too.
Nothing is sent anywhere, and nothing else is stored.

## Upgrading

Replace `engine/` and `machines/` (and `index.html`, putting your `<title>` back in it, and any
`site/` script lines you added) with the new release. Leave `site/` alone. Changes made inside
`machines/` are lost, so keep a note of them, or do them from `site/` where this README shows
how. Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## Licence

- **The terminal** (`engine/`, `index.html`, and `machines/` apart from the games) is free software under the
  [GNU Affero General Public License, version 3 or later](LICENSE).
- **The games** keep the notices they came with, in their own files, and each is under
  those terms, not the AGPL; the new code written for them (the Z-machine, the DDL
  interpreter, the robots in `hunt` and Conquest's scheduler, the five V7 games rewritten
  without source, and Debian's `frotz`, `sl`, `cowsay`, `fortune` and `cmatrix` programs) is under the AGPL with the rest. The table below sums up what each notice
  says and where the doubts are. It is a summary, not legal advice: if you publish the games,
  read the notices and decide for yourself, and remove any you are not comfortable with
  (see [Removing a game](#removing-a-game)).

| Games | Source | Terms | Caveats |
|---|---|---|---|
| V7: `backgammon`, `fortune`, `hangman`, `quiz`, `wump`, and the word list; V7 and 4.3BSD: `arithmetic`, `bcd`, `chess`; 4.3BSD: `quiz` (98% the V7 program, with no notice of its own) | Version 7 Unix (`bcd` from the Sixth Edition) | Caldera's licence for Ancient UNIX, kept in each file | Its advertising clause conflicts with GPL-family licences such as the AGPL, and whether Caldera could grant it at all is disputed. Fortunes and quiz answers quote other people's words |
| V7: `bj`, `moo`, `ttt`, `ppt`, `words` | 2.11BSD | No notice | Very probably Bell Labs code, so as above |
| `ching` (V7 and 4.3BSD) | V7, with logic from NetBSD | Caldera and the Regents, kept | The hexagram text is the Wilhelm/Baynes translation of the I Ching (1950), which is likely still in copyright and covered by neither notice |
| 4.3BSD: `backgammon`, `battlestar`, `boggle`, `canfield`, `cfscores`, `cribbage`, `fish`, `hunt`, `rain`, `sail`, `snscore`, `teachgammon`, `trek`, `worms` | 4.3BSD | The Regents' notice, kept | The 4.3BSD notices point to the Berkeley Software License Agreement, which is not in the source, so there is no explicit grant; the later NetBSD versions carry a BSD licence. `trek` adds its authors' own permission. Boggle, Mille Bornes, Monopoly and Wooden Ships and Iron Men are trademarks named in the games' text |
| 4.3BSD: `mille`, `monop`, `fortune` | 4.3BSD | No notice in the files | As above, with nothing in the files at all |
| 4.3BSD: `btlgammon` | 4.3BSD | No notice | The old V7 program, so if it is Bell Labs code the Caldera question above applies |
| 4.3BSD: `doctor` | 4.3BSD's `doctor.l`, which has no notice | The Regents' four-clause BSD licence from Net/2's almost identical copy, kept | Net/2 is the release AT&T's Unix Systems Laboratories sued over |
| 4.3BSD: `aardvark` | 4.3BSD | No notice on the game; the Regents' and UCLA's on what was around it | No grant for the game text |
| 4.3BSD: `zork` (Dungeon) | Dungeon 2.5.6 | Infocom's notice, kept: *commercial usage strictly prohibited* | Non-commercial, and no grant to copy or change it. Microsoft's 2025 MIT release of Zork I to III does not name Dungeon |
| Colossal Cave (4.3BSD and VMS) | NetBSD | BSD licence, kept | |
| 4.3BSD: `wump`, `number`, `primes`, `factor`, `banner`, `hangman`, `worm`, `robots`, `snake` (`games.js`, `banner-font.js`) | NetBSD | BSD licence, kept | |
| Rogue | Rogue 5.4.4 | BSD licence, kept, with the notice for the parts based on the work of Nicholas J. Kisseberth | |
| Zork I and II (DOS, CP/M, Linux) | Infocom's story files, release 119 and 63 | MIT licence (Microsoft, 2025), kept | The licence covers the software, read here as including the story files; Zork is a trademark and the licence does not cover the name |
| VMS: Star Trek | SST2K 2.10 | BSD licence, kept | It descends from older programs whose authors' grant to relicense is not on record; Star Trek is a trademark |
| VMS: Empire | Chuck Simmons's C Empire, in Walter Bright's VMS release | Simmons's Empire General Public License, kept, with Bright's statement | Bright calls it a copy of his copyrighted Empire, whose own sources are non-commercial |
| VMS: Monster | Rich Skrenta's VAX Pascal | "You may freely copy, distribute and change Monster", kept | No warranty disclaimer |
| VMS: Moria | Moria 4.8, VAX Pascal | Robert Alan Koeneke's notice, kept: may be copied and changed, not sold | Non-commercial, and it calls itself public domain while keeping all rights. This is not Umoria, the later GPL version |
| VMS: Conquest | Conquest 4.22, Ratfor | Poskanzer and Leres's permission notice, kept | Keep the notice in all copies and supporting documentation |
| Linux: the default cow in `/usr/share/cowsay/cows` (`fs.js`) | cowsay 3.03, Tony Monroe | The same terms as Perl, the Artistic License or the GNU GPL version 1 or later, noted in the file | The `cowsay` program reading it is new. Only the default cow is there |
| Linux: `fortune`'s sayings (`fs.js`) | Quotations from works published before 1912 | Public domain | The program is new; none of BSD's or fortune-mod's files are used |
| Linux: `sl` | New, after Toyoda Masashi's `sl` | AGPL | Behaviour follows the original; the program and the drawings are new, so his notice is not needed, and he is credited |

- **The example content** in `site/` is dedicated to the public domain under
  [CC0 1.0](site/LICENSE). Copy any of it without credit.
- **Your own content** is yours. Replacing the examples in `site/` with your own words
  does not put them under any of these licences.

The AGPL asks that people using a changed version can get its source. The `source`
command handles that: it prints the address set by `source:` in `site/config.js`. If
you change the terminal's code, point that setting at wherever your changed copy lives.
If you switch `source` off and you have changed the code, offer the source some other way,
such as a link on the page.

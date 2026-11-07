# PHOSPHOR-9

A 1979 video terminal for your website. Visitors land at a glowing green screen with a
coiled cable, log in as `guest`, and poke around a small Version 7 Unix machine: `ls`,
`cat`, `mail`, `man`, `who`, `ps`, a few secrets. You fill it with your own words. Twelve more
machines can be plugged in, from an IBM mainframe, Multics, a TRS-80, an Apple IIe and a Commodore 128 to a Debian server of today, and a dial-up bulletin board too; most of them come with their games.

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
  content.js          the welcome message, the about section, the letter, your commands
  home.js             the visitor's home folder: files, folders, hidden things
  theme.css           colours (optional)
  TODO.md             every example and placeholder line above, to replace (not loaded)
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
   it cannot execute (on VMS, that the image could not be activated; on TOPS-20, that the program
   could not be loaded) and the prompt comes back;
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
| `machine:` `machines:` | Which machine the terminal starts on, and which ones the `connect` command offers: `machines: v7, bsd`. Unset, the first and all of them. With one machine there is no `connect`. `machine: random` picks one of the allowed machines when the address doesn't name one, and keeps that pick for the rest of the browser tab, so a reload boots the same machine and a new tab picks again. The Commodore 128 and the bulletin board sit out the draw: give a machine `random:false` in `machines/machines.js` to leave it out the same way. The address, `connect` and these settings still reach it, and if only such machines are allowed, random picks among them. |
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
| `== welcome ==` | Printed after login (also `/etc/motd`, on the Unix machines). |
| `== about ==` | What the `about` command prints (no about file: the terminal prints it; the C128's disk has an `ABOUT` program instead). |
| `== mail ==` | The letter. `you have mail.`, in the machine's words, shows when the guest logs in, while it has text. |
| `== file: NAME ==` | A file in the home folder. `NAME` may be a path (`notes/todo`); folders are made as needed. A name starting with a dot is hidden (`ls -a`). A path starting with `/` goes anywhere. |
| `== dir: NAME ==` | An empty folder. |
| `== command: NAME \| HELP ==` | A new command that prints the section. `NAME, OTHER` gives it two names. Without help text it is hidden from `help`. It replaces a built-in of the same name, except the core ones (`help`, `man`, `clear`, `ls`, `cat`, `sound`, `cd`, `pwd`, `echo`, `mail`, `alias`, `source`): switch one of those off first (`commands: -mail`) and yours takes its place. |
| `== man: NAME ==` | The description part of a manual page. Replaces a built-in page or adds a new one. |
| `== boot ==` | A machine coming up after power-on, a line at a time; `text @300` waits 300 ms after the line. |
| `== aliases ==` | Shortcuts, one per line: `ll = ls -l`, or `cl = clear ; ls`. Only useful on a machine whose shell had aliases; the 1979 machine has none. |
| `== board ==` | The bulletin board's settings, one per line: `name:` (Afterglow BBS), `number:` (555-0142), `sysop:` ({owner}) and `password:` (the sysop's). Unset, the defaults in brackets. |

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

On the Unix machines `help` lists the terminal's own commands apart, under "the terminal's, not the
machine's:": `about`, `mail`, `source`, `sound`, `fill`, `effects`, `connect` and your own
`== command: ==` sections. The terminal answers them on every machine (the C128 takes only `fill`,
`sound`, `effects`, `connect` and `source`: its disk has `ABOUT` and `LETTER` programs), their manual pages say so, and the Unix machines have no program file
for them, so a file of the same name never takes their place.

The shell understands pipes, redirection, quotes, variables, wildcards and scripts. Visitors
can change files in their home folder and `/tmp`, and a reload puts everything back. A file holds
at most 4 MB; past that, the write stops and the machine says its disk is full.
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
| `vm370` | IBM System/370 Model 158, VM/370 Release 6 with CMS | 1980 | none: Release 6 came with no games |
| `trs80` | Radio Shack TRS-80 Model III, TRSDOS 1.3 and Level II BASIC | 1981 | on its disk: `DIR` lists them; `BASIC` then `RUN"NAME/BAS"`, and `ZORK1`, `ZORK2` |
| `multics` | Honeywell Level 68, Multics MR8.0 | 1981 | none |
| `cpm` | S-100 Z80, CP/M 2.2 | 1982 | `ZORK1` in user area 0, `ZORK2` in user area 3 |
| `apple2` | Apple IIe, DOS 3.3 | 1984 | `ZORK I`, `ZORK II` and four BASIC games on the disk, started with `RUN` |
| `tops20` | DECSYSTEM-2060, TOPS-20 V6.1 | 1986 | `<GAMES>`, started by name |
| `c128` | Commodore 128 with a 1571 drive, BASIC 7.0; `GO 64` makes it a Commodore 64 | 1986 | on its disk: `DIRECTORY` lists them |
| `bsd` | VAX-11/780, 4.3BSD | 1987 | `/usr/games` |
| `dos` | IBM PC/AT, MS-DOS 3.30 | 1988 | `C:\ZORK` |
| `vms` | VAX-11/785, VAX/VMS V4.6 | 1988 | `[GAMES]`, started with `RUN` |
| `bbs` | A bulletin board, dialled on a 2400 bps modem | 1990 | two doors: Star Haul and Deep Mine |
| `irix` | Silicon Graphics Crimson, IRIX 4.0.5 | 1993 | graphics demos, which need a display it doesn't have |
| `linux` | KVM virtual server, Debian 13 "trixie" | the visitor's own | `frotz`, `sl`, `cowsay`, `fortune` and `nethack` in `/usr/games`, and `cmatrix` |

Each one has the commands, messages and file tree of its real system (the bulletin board is invented); V7 and 4.3BSD were
checked side by side with the real systems running in a simulator, and the Debian machine's
package versions and `apt`'s messages were checked against Debian 13. It is reached on its serial console, boots
when the terminal does, and follows the visitor's clock, year and all; its guest is not in
the sudoers file, so `sudo` and `apt install` say no, as they would. `su` (or `su -`) asks for root's password as Debian's does, and says `su: Authentication failure` when it is wrong; `exit` goes back, and `su -c` runs a single command instead. The password is the `root password:` in `machines/linux/machine.js`, and the administrator was careless with it. As root, `su` and `sudo` ask nothing (`sudo -u`, `sudo -i` and `su` to another user work too), `systemctl start`, `stop` and the rest are accepted without a word, `halt`, `poweroff`, `reboot` and `shutdown now` stop the machine, and `shutdown` with a later time says when it is scheduled.

Each folder's `machine.js` holds its settings and text (the
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
`CONNECT` lists the other machines, and `CONNECT <DIR>` moves you to a directory you own.
`ENABLE` turns the `@` prompt into `$` and `DISABLE` turns it back, for anyone, as the real EXEC does; only
OPERATOR has the WHEEL and OPERATOR capabilities that make it matter, and with them the locked files open and any
directory can be written.
`LOGIN OPERATOR` takes the `root password:` in `machines/tops20-1986/machine.js` (with `root login: operator`;
OPERATOR still starts at `@` until `ENABLE`); the site keeps it less carefully than it should. The
messages were checked against TOPS-20 running under KLH10 (the Panda distribution) and the
6.1 EXEC's source. The recognition is the machine's: its `commands.js` sets
`Phosphor.recognize(key, line)`, which the engine asks about Escape, Tab and `?` at the prompt.

### VM/370

IBM's virtual machine system, as a university or company ran it at the end of the 1970s: a System/370 Model 158
running VM/370 Release 6 (1979), reached from a typewriter terminal, so everything comes a line at a time. CP, the
Control Program, says `VM/370 ONLINE` and logs the guest on; the log message (the site's `== welcome ==`, under the
operator's own lines) and `LOGON AT` follow, CMS is loaded, and the first line after that, an empty one the terminal
types on arrival, runs the guest's `PROFILE EXEC`. After that each command is answered with the ready message,
`R; T=0.01/0.01 10:21:55` (processor time and the time of day), or `R(00028); ...` when it failed, and the messages
are CP's and CMS's own (`FILE NOT FOUND.`; `CP SET EMSG ON` adds their codes, `DMSLST002E`); a command it does not
know gets `UNKNOWN CP/CMS COMMAND`. An empty line gets `CMS`, or `CP` in CP mode.

Files are `NAME TYPE MODE` on minidisks: `LISTFILE` (or `L`) lists the A-disk, `LISTFILE * * *` every disk,
`TYPE README MEMO` shows a file, and `COPYFILE`, `RENAME`, `ERASE`, `STATE`, `QUERY DISK`, `ACCESS`, `RELEASE`,
`FORMAT`, `PRINT`, `PUNCH`, `DISK DUMP` and `DISK LOAD` do what they did. `EDIT` is the CMS editor of 1979 on a
typewriter: `INPUT` (an empty line ends it), `TOP`, `NEXT`, `UP`, `LOCATE /x/`, `FIND`, `CHANGE /a/b/ * *`,
`DELETE`, `REPLACE`, `TYPE`, `SAVE`, `FILE` and `QUIT`. `EXEC` runs the CMS EXEC language of the time (`&TYPE`,
`&IF`, `&GOTO`, `&LOOP`, `&READ`, `&STACK`, `&1` to `&30`), and an EXEC runs by its name alone. The site's files are
on the guest's A-disk (`notes/todo` is `TODO NOTES`, `src/hello.c` is `HELLO C`), and what the visitor writes,
renames or erases there is kept in the browser (see [Saves](#saves)); the files the site gives come back afresh
unless the visitor has replaced or erased them.

The letter arrives in the reader, as mail did: `QUERY READER ALL` shows it, `READCARD *` reads it onto the A-disk as
`LETTER MEMO`, and `MAIL` shows it straight away. The CP commands are there from CMS as they are (`QUERY TIME`,
`QUERY NAMES`, `MSG`, `SPOOL`, `LINK`, `DETACH`, `DEFINE`, `PURGE`, `ORDER`, `CHANGE`, `TRANSFER`, `IPL CMS`,
`LOGOFF`), `CP` alone or `#CP` gives CP the terminal until `BEGIN`, and CP's line editing works: `#` ends a line
and starts another, `@` takes back a character, `"` makes the next one plain. `LINK MAINT 191 291 RR` and then
`ACCESS 291 B` reach another user's disk. `HELP` lists its topics, and among them the terminal's own words, which
work here as on every machine. After `LOGOFF`, `LOGON GUEST` takes the password the log message gives.

MAINT, the system programmer, is the privileged account (classes A to G): `LOGON MAINT` with the
`root password:` in `machines/vm370-1980/machine.js`. The system programmer keeps the CP directory, passwords and
all, on his 191 disk, which anyone may link to; as MAINT, the locked files open, `SET LOGMSG` replaces the log
message, `MSG ALL` and `WNG ALL` reach everyone, and `SHUTDOWN` stops the machine. The empty line is the machine's:
its `cms.js` sets `Phosphor.blank`, which the engine calls instead of starting a new prompt when a line is empty.
The messages were checked against VM/370 Release 6 running under Hercules (the "SixPack"), and against IBM's
Release 6 manuals wherever the SixPack has changed them. There is no 3270 full-screen terminal, and XEDIT,
FILELIST, RDRLIST and REXX are not here: they came later, with VM/SP.

### Multics

The Honeywell runs Multics MR8.0, installed here in June 1980, so its clock says 1981. The terminal is on a line to
it: the banner gives the load and the users, `login Guest` (any password; `help` before logging in says so) prints
`Password:` and the mask a printing terminal typed the password over, then the login messages, and the guest's
`start_up.ec` prints the site's welcome as the message of the day and `You have mail.` There is no prompt: after
every command line comes the ready message, `r 12:34 0.123 4`, the time, the CPU seconds and the page faults. Ctrl-C
is the QUIT key: the command stops, and the ready message says `level 2` until `release` (`rl`) or `start` (`sr`),
which goes back into a qedx that was interrupted.

Commands have long and short names: `list` (`ls`), `print` (`pr`), `print_wdir` (`pwd`), `change_wdir` (`cwd`),
`create_dir` (`cd`), `delete` (`dl`), `delete_dir` (`dd`), `rename` (`rn`), `copy` (`cp`), `move` (`mv`), `add_name`
(`an`), `status` (`st`), `list_acl` (`la`), `set_acl` (`sa`), `who`, `where` (`wh`), `qedx` (`qx`), `exec_com` (`ec`),
`read_mail` (`rdm`), `print_mail` (`prm`), `send_mail` (`sdm`), `send_message` (`sm`), `help` and `list_help` (`lh`),
`logout`, and more. Pathnames run down from the root with `>`: the guest's home is `>user_dir_dir>Guest>Guest`
(`>udd>Guest>Guest` for short), a leading `<` goes up one directory, and `*` and `**` are star names. Command lines
take `;` between commands, quotes, active functions in brackets (`string [wd]`, `[date]`, `[user name]`) and
parentheses (`dl (a b)` runs `dl` twice), and, as Multics did, `#` erases the character before it and `@` the whole
line. `qedx` is a real editor, with no prompt: `a` to type lines, `\f` to stop, `1,$p`, `s/old/new/`, `w name`, `q`.
An `exec_com` segment (`name.ec`) runs with `&1` to `&9`, `&if [...] &then ... &else`, `&goto`, `&print` and `&quit`.

The letter is the mail in `Guest.mbx`; `help` prints the info segments in `>doc>info` a block at a time, and `help`
on its own lists, under a heading of their own, the terminal's own words (`about`, `source`, `sound`, `fill`,
`effects`, `connect`) and your text commands with them. What the guest writes, renames or deletes in the home
directory is kept in the browser (see [Saves](#saves)), up to the guest's quota of 1024 records, 4 MB; past that a
write says `Record quota overflow.` `Repair.SysAdmin` is the privileged account that reads and changes nearly
everything: `login Repair` takes the `root password:` in `machines/multics-1981/machine.js` (with
`root login: repair`), and the operators left it in an exec_com anyone may print. QUIT is the machine's: its
`commands.js` sets `Phosphor.onInterrupt`, which the engine calls on Ctrl-C and whose answer it shows instead of `^C`.

The messages and formats were checked against Multics MR12.8 running under the DPS8M simulator, and against the
MR8.0 manuals where the two differ: the 1980 banner, `Segment foo not found.`, `You are protected from preemption
until 1007.8.`, the mail and help dialogues and the `qedx` requests are the manuals'. Multics is case sensitive:
`LIST` is not `list`, and the terminal's words are typed in lower case.

### TRS-80 Model III

The Model III has no terminal: the glass is its own screen, 64 columns by 16 rows, with its block graphics. It boots
TRSDOS 1.3 from drive 0, with Tandy's notices and the questions every boot asked, `Enter Date` and `Enter Time`, which
the owner answers from the clock (it is 1981 in there), and then `TRSDOS Ready` and its row of dots. `DIR` lists the
disk, `FREE` shows its free space map, `LIST` dumps a file in hex as TRSDOS 1.3 did, `KILL`, `RENAME`, `TIME`, `DATE`,
`CLOCK`, `CLS`, `LIB`, `HELP` and `ERROR n` work, and most of the rest of TRSDOS's library answers with its own error
numbers. `BASIC` asks `How Many Files?` and `Memory Size?` (Enter for both) and brings up Disk BASIC at `READY` and
`>`: type numbered lines to make a program, `LIST`, `RUN`, `NEW`, `SAVE"NAME/BAS"`, `LOAD`, `KILL`, and `CMD"S"` to go
back to TRSDOS. The disk lives in your browser. `CSAVE"A"` and `CLOAD"A"` use the cassette, also kept in the browser,
with the relay's click and the two asterisks in the corner, one blinking, as it loads; `SYSTEM` gives its `*?` prompt
for a machine-language tape. Ctrl-C (or Escape) is BREAK. Held while the machine starts (press it during the first
second), BREAK skips the disk, as on the real one: `Cass?` and `Memory Size?`, then the ROM's Level II BASIC, with its
two-letter messages (`?SN Error`) where Disk BASIC spells them out (`Syntax Error`). Both BASICs have Level II's three
kinds of number (`A%`, `A!`, `A#`, and `DEFINT` and the rest), `PRINT @`, `PRINT USING`, `SET`, `RESET` and `POINT` on
the 128 by 48 block grid, `INKEY$`, `STRING$` and `TIME$`, and drop into EDIT mode at a line with a syntax error. The
up arrow (or `^`) types the power sign, which the Model III shows as an arrow.

The terminal's own commands are words typed at `TRSDOS Ready` or at `>`: `ABOUT`, `MAIL`, `SOURCE` and your own text
commands show on the terminal's glass, and a key brings the Model III back; `FILL`, `SOUND`, `EFFECTS` and `CONNECT`
answer on its screen, and TRSDOS's `HELP` lists them after its own. They come from `PHOSPHOR/CMD`, which TRSDOS runs at
boot (its `AUTO`), as utilities of the time hooked themselves in; killing or overwriting it turns them off at TRSDOS
from the next boot, and clearing the site's data in the browser brings the disk back as it came. `ZORK1` and `ZORK2`
start Infocom's games. BASIC,
TRSDOS and the disk are written for this terminal and contain nothing of Tandy's or Microsoft's, and the boot screen's
picture is drawn for it; the screens, prompts, messages and what BASIC prints were checked against a Model III running
TRSDOS 1.3 in xtrs, and its ROM BASIC in MAME. A few Commodore words typed at a prompt get an answer from a Model III
owner of 1981 (the `JOKES` table in `trs80.js`).

### Apple IIe

The Apple has no terminal: the glass is its own monitor, 40 columns by 24 rows, and it boots from its disk with
the Apple ][ title, DOS 3.3 and the `]` prompt. Caps lock is down, as the manual asks, so everything typed comes out in
capitals. Applesoft BASIC works as it did: type numbered lines to make a program, `LIST`, `RUN`, `NEW`, `SAVE NAME`
and `LOAD NAME`, `CATALOG` to see the disk, and the messages are the real ones, down to `?SYNTAX ERROR IN 10`. Escape
then I, J, K or M moves the cursor about the screen, and the right arrow copies what it passes over into the line,
which is how you mend a line you have listed. Ctrl-C stops a program (`BREAK IN 20`). `CALL -151` gives the monitor's `*`
(`300.30F` to look at memory, `300:A9 C1` to change it, `300L` to list it, `300G` to run it), and `3D0G` goes back to
BASIC. The disk lives in your browser: what you save, delete or lock is still there next time, and clearing the site's
data gives you the original disk back.

The terminal's own commands are typed at the `]` prompt as words of their own: `HELP`, `MAIL`, `ABOUT`, `SOURCE`
and your own text commands show on the terminal's glass, and a key brings the Apple back; `FILL`, `SOUND`, `EFFECTS`
and `CONNECT` answer on the Apple's screen. A program can use them too, after an ampersand: `& "MAIL"`. They come from
`PHOSPHOR`, the program the disk's `HELLO` loads at boot, the way a utility of the time hooked itself to DOS and to `&`.

`RUN ZORK I` and `RUN ZORK II` start Infocom's games. The BASIC interpreter, the 6502 behind `CALL` and the monitor's
`G`, and the disk are written for this terminal and contain nothing of Apple's or Microsoft's; the ROM is not there,
so memory above `$C000` reads as zeros, and the `GR` and `HGR` graphics are accepted but draw nothing. Its output
was checked line for line against an Apple IIe running DOS 3.3 in MAME. `XYZZY`, `PLUGH` and `PR#7` (or `IN#7`) at the `]`
prompt get the terminal's own answers (the `JOKES` table in `apple.js`).

### Commodore 128

The C128 has no shell and no login: it comes up at `READY.` on its 40-column screen, light green
on dark grey, after booting the disk in drive 8, whose `WELCOME` program prints your
`== welcome ==`. It was bought for Christmas 1985, so its clock says 1986. Typing goes onto the
screen, not into a line: the cursor keys move anywhere, and Return enters whichever line the
cursor is on, so a line listed above can be changed and entered again. Home is HOME (with Shift,
CLR), Insert is INST, Ctrl-C is RUN/STOP (twice within a second, RUN/STOP and RESTORE), F1 to F8 are the function keys, and Ctrl-1 to Ctrl-8,
Ctrl-9, Ctrl-0 and Alt-1 to Alt-8 are the colour and reverse keys. Capitals type as letters, so
caps lock does no harm.

`DIRECTORY` lists the disk. `ABOUT` and `LETTER` are programs that print those sections
(`RUN"ABOUT"`), your files are sequential files on it (`RUN"READ"` shows one), and the games are
there too. `DSAVE"NAME"` keeps a program, `DLOAD"NAME"` brings it back, and `SCRATCH`, `RENAME`
and `HEADER` work on the disk, which is kept in the browser (see [Saves](#saves)). Escape then X
switches to the 80-column screen, light cyan on black. `GO 64`, answered with Y, makes it a
Commodore 64, light blue on blue, with BASIC V2 (`LOAD"$",8` then `LIST` for the directory,
`LOAD"NAME",8`), until `RESET`, which is the reset button, or a reload.

The terminal's own commands are words typed at `READY.`: `FILL`, `SOUND ON` and `SOUND OFF`,
`EFFECTS` (with `AUTO`, `FULL` or `LITE`), `CONNECT` and `SOURCE`; `HELP` lists them. Both BASICs
were written for this terminal and checked against a C128 running in the VICE emulator: the boot
screens, the messages, the editor's ways and what programs print. The characters are drawn for
this terminal too; Commodore's ROMs are not used. `SOUND`, `PLAY` and the SID's registers make
their notes while the keyclicks are on, and `FAST` blanks the 40-column screen, as it did, until
`SLOW`. Bitmap graphics and sprites are not there: `GRAPHIC 1` to `4` answer `?UNIMPLEMENTED
COMMAND ERROR`, and `DRAW` and the rest `?NO GRAPHICS AREA ERROR`. `SYS 32800,123,45,6`, in C128 mode, shows the credits
that Commodore's programmers hid in the ROM, as the real machine does. A few other machines' commands typed at
`READY.` get an answer from a Commodore owner of 1985; their texts are the `RIVALS` table in `screen.js`.

### The bulletin board

`connect bbs` plugs the terminal into a 2400 bps modem instead of a computer. It types the board's number at the
modem, `ATDT555-0142`; with the sound on, the return that dials is the visitor's, because a browser plays nothing
until someone has pressed a key, and then the modem's speaker plays the dial tone, the digits, the ring, the answer
tone and the handshake before `CONNECT 2400`. The board, Afterglow BBS, is filled from the site: the letter, the
about section and the `now` file are its General messages, each project row in the letter is a message of its
own, the home folder's files (nothing hidden or locked) are the sysop's notes and the first file area, and the
welcome, the about section and your own `== command: ==` sections with help text are among its bulletins. A
`== board ==` section changes its name, number and sysop.

A caller picks a handle and, on a board of 1986 or later, ANSI colour or plain ASCII; the board then has
bulletins, message bases to read and post in, a file area whose downloads end as they would on a terminal with
no disk (the text files can be shown with ASCII), a graffiti wall, the user list and last callers, a sysop who is
never there when paged, an hour a call, and two doors, Star Haul and Deep Mine. The terminal's own words work at
its main menu, `?` lists them under their own heading, and `+++` on a line by itself talks to the modem: `ATH`
hangs up, `ATO` goes back on line. Goodbye ends in `NO CARRIER`, and after it, or a hang-up, the terminal goes back
to the machine the visitor came from. What a caller adds (handle, posts, wall, comments, door games) is kept in the
browser only. The sysop is `{owner}`, and the password is set by `var PASSWORD` in `machines/shared/bbs.js` (or `password:` in
`== board ==`, or, on the bbs machine, a `root password:` in site/); someone left it in a log in the file area.

The board can also be reached from MS-DOS and CP/M: `TERM` is a terminal program on each (`C:\COMM\TERM.EXE`,
`A:TERM.COM`), which lists the numbers and passes AT commands to the modem; ^C goes back to the prompt. The PC's
modem is a 2400 and the CP/M machine's a 1200, so the board comes up at that speed, in that machine's year: in
1982 it talks plain ASCII. The board, modem and doors are in `machines/shared/` (`bbs.js`, `modem.js`,
`bbs-doors.js`, `bbs.css`); its board, text, callers and files are all invented for this terminal. The colours are
the machine's to ask for: `\u0005` and a hex digit in a line types the rest of it in that colour, which the
machine's CSS gives as `.k0` to `.kf`, and `\u0005` with anything else goes back to plain.

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
     `backdoor`, `closed door`, `not found`, `mail notice`, `ls columns` and `disk full`; the
     machines between them use each one, so look there for an example. `root login` (normally
     `root`) with `root password` is an account that logs in as the super-user, at the `root prompt`
     (normally `# `), and the Unix machines' `su` takes the same password; at the login prompt it
     counts case unless the machine has `case: ignore`. `also root: name/password` adds a second
     such account, and `disk full` is what a write says when a file passes 4 MB.
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
| `hangman` | the Berkeley version |
| `wump` | hunt the wumpus: V7's, as 4.3BSD shipped it |
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
name at the `@` starts one, as does `RUN GAMES:name`). The other names there are a real site's:
during prime time they say games may not be played, and after it that execute access is required:

| Game | |
|---|---|
| `ADVENTURE` | Colossal Cave, the same port as on 4.3BSD |
| `DUNGEON` | the same Dungeon as 4.3BSD's `zork`, opening as the DEC-20's did, with its own welcome and first room; ^C goes back to the EXEC |

**Commodore 128**, on the disk in drive 8 (`DIRECTORY`; `RUN"HELLO"`, or as a C64 `LOAD"HELLO",8`
and `RUN`). They are David Ahl's own programs from *BASIC Computer Games* (1978), as a 40-column
owner typed them in:

| Game | |
|---|---|
| `HELLO` | a conversation with a computer that solves problems |
| `NICOMACHUS` | it guesses your number from three remainders |
| `ONE CHECK` | solitaire checkers: jump to clear the board |
| `BUZZWORD` | phrases for reports and speeches |
| `DIAMOND` | a page of diamonds |
| `SINE WAVE` | the words, swinging down the screen |

**TRS-80 Model III**, on the disk (`DIR` lists it; `BASIC`, then `RUN"BULLSEYE/BAS"`, and `LIST` shows how it is
made): `BULLSEYE` (darts for up to 20 players) and `BUZZWORD` (phrases for reports), David Ahl's programs from
*BASIC Computer Games*, and `WORM` (steer a worm round the screen in block graphics with the arrow keys), written
for this terminal; and `ZORK1` and `ZORK2` at `TRSDOS Ready`, the same story files as on DOS and CP/M.

**MS-DOS and CP/M**: Zork I and Zork II, Infocom's own story files on an interpreter written
for this terminal. On DOS, `CD \ZORK` then `ZORK1` or `ZORK2`, or `C:\ZORK\ZORK1` from
anywhere. On CP/M, `ZORK1` from user area 0, and `USER 3` then `ZORK2`.

**The bulletin board** has two doors, written for this terminal: Star Haul, trading ore, grain and tech between
five stations with ten jumps a day, and Deep Mine, how deep you dare dig before the roof comes down. Both keep
their players and best scores in the browser.

**Apple IIe**, on the disk (`CATALOG` lists it; `RUN` and the name starts one, and `LIST` shows how it is made):
`GUESS` (a number from 1 to 100), `BAGELS` (three digits, from clues), `LANDER` (bring a craft down on the Moon) and
`KINGDOM` (ten years of land, grain and people), written for this terminal as type-in games of the time were; and
`ZORK I` and `ZORK II`, the same story files as on DOS and CP/M.

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
| `nethack` | NetHack 3.6.7, the tty game as Debian 13's `nethack-console` has it, with saves, bones and scores kept in the browser |

### Full screen, and phones

The games that draw on the whole screen (`rogue`, `hunt`, `sail`, `mille`, `backgammon`,
`teachgammon`, `canfield`, `cribbage`, `battlestar`'s flights, `robots`, `snake`, `worm`,
`hangman`, `rain`, `worms`, Empire, Moria, Conquest, `nethack`, `sl`, `cmatrix`, and Zork's status line) take over the
glass and give it back when they end. Most of the others are a line at a time and work at
any width. Several were written for an 80 by 24 terminal: `rogue`, `mille`, `backgammon`,
`teachgammon`, `hunt`, `sail`, `canfield`, `cribbage`, `battlestar`'s flights, Empire, Moria, Conquest and
`nethack` shrink their type to show all of it while it stays readable, and on a screen too small for
that `sail` says it can't sail on this terminal and the others follow the cursor; `rogue` and
`mille` also let the arrow keys look around. On a phone, a sideways swipe pans such a screen
(with a little momentum, none in lite effects or with reduced motion), a faint ‹ or › shows at
a side that has more, and the next key goes back to following the cursor. `robots`, `snake` and `worm` take the size of the
glass when they start and keep it, as the originals did; after a resize they shrink their type
or follow the cursor in the same way. `hangman`, `rain`, `worms` and Linux's `top`, `sl` and
`cmatrix` use whatever size the glass is. On a phone, the row of keys on
the glass gives esc, Ctrl-C, Ctrl-D, Ctrl-Z and tab. When the phone's keyboard opens, the monitor shrinks to sit
above it, and puts the cable away if that leaves too little height; a phone held sideways gets the whole
width, with no cable.

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
`phosphor-9/rogue/...`, `phosphor-9/moria/files`, `phosphor-9/zork1/save/...`, `phosphor-9/nethack/files` and so on.
Nothing is sent anywhere, and clearing the site's data in the browser clears them.
The C128's disk is a save file too: what the visitor writes, renames or scratches is
kept under `phosphor-9/c128/disk`; the files the disk came with (the games, and the programs and files
made from `site/`) are made again at each power-on. The Apple IIe's disk is kept under `phosphor-9/apple2/disk`.
The TRS-80's disk is kept under `phosphor-9/trs80/disk`, and its cassette under `phosphor-9/trs80/tape`.
VM/370's A-disk, what the guest wrote, renamed or erased on it, is kept under `phosphor-9/vm370/guest191`, and the
Multics guest's home directory under `phosphor-9/multics/home`: only what the guest made, changed or deleted, so the
site's own files come back fresh, with any changes laid over them. The bulletin board keeps its callers, posts,
wall lines, comments and door games under `phosphor-9/bbs/`.

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
   the whole screen (see `engine/phosphor.js` and the games already there for both). A
   full-screen program that shows part of a wider screen can pass its view through
   `S.pan(left, max, cursorColumn)`, so a sideways swipe pans it.
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
   `['coin',1024]` added to the list of images in its `fs.js`. DOS, CP/M, IRIX, VM/370, Multics
   and the bulletin board have no `later.js`; add one to the machine's `files` in `machines/machines.js` to give them games.

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

On the Apple IIe, the games are files on its disk: delete their entries from `machines/apple2-1984/disk.js` (a
visitor's browser keeps the disk it already has until its site data is cleared). The C128's games are entries in
`machines/c128-1986/games.js`; delete one there. The TRS-80's games are entries in `machines/trs80-1981/disk.js`;
delete one there (a visitor who has saved, killed or renamed a file on that disk keeps the disk they have until
its site data is cleared).

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
(`localStorage`; see [Saves](#saves)), as do the disks of the Apple IIe, the TRS-80 and the C128 and the guest's files on VM/370 and
Multics. The bulletin board keeps the handle a caller picks, and what they post, there too. The `fill` and `effects` commands remember their settings there as well, and `machine: random`
keeps its pick for the tab in the browser's session storage. Nothing is sent anywhere, and nothing else is stored.

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
  without source, Debian's `frotz`, `sl`, `cowsay`, `fortune` and `cmatrix` programs, the Apple's, the TRS-80's and the Commodores' BASICs and TRSDOS, the C128's READ program, and the bulletin board's doors) is under the AGPL with the rest.
  NetHack is the exception: its file, including the C library, file system and vt100 written for
  its port, is under the NetHack General Public License, as the file says. The table below sums up what each notice
  says and where the doubts are. It is a summary, not legal advice: if you publish the games,
  read the notices and decide for yourself, and remove any you are not comfortable with
  (see [Removing a game](#removing-a-game)).

| Games | Source | Terms | Caveats |
|---|---|---|---|
| V7: `backgammon`, `fortune`, `hangman`, `quiz`, `wump`, and the word list; 4.3BSD: `wump` (the V7 program); V7 and 4.3BSD: `arithmetic`, `bcd`, `chess`; 4.3BSD: `quiz` (98% the V7 program, with no notice of its own) | Version 7 Unix (`bcd` from the Sixth Edition) | Caldera's licence for Ancient UNIX, kept in each file | Its advertising clause conflicts with GPL-family licences such as the AGPL, and whether Caldera could grant it at all is disputed. Fortunes and quiz answers quote other people's words |
| V7: `bj`, `moo`, `ttt`, `ppt`, `words` | 2.11BSD | No notice | Very probably Bell Labs code, so as above |
| `ching` (V7 and 4.3BSD) | V7, with logic from NetBSD | Caldera and the Regents, kept | The hexagram text is the Wilhelm/Baynes translation of the I Ching (1950), which is likely still in copyright and covered by neither notice |
| 4.3BSD: `backgammon`, `battlestar`, `boggle`, `canfield`, `cfscores`, `cribbage`, `fish`, `hunt`, `rain`, `sail`, `snscore`, `teachgammon`, `trek`, `worms` | 4.3BSD | The Regents' notice, kept | The 4.3BSD notices point to the Berkeley Software License Agreement, which is not in the source, so there is no explicit grant; the later NetBSD versions carry a BSD licence. `trek` adds its authors' own permission. Boggle, Mille Bornes, Monopoly and Wooden Ships and Iron Men are trademarks named in the games' text |
| 4.3BSD: `mille`, `monop`, `fortune` | 4.3BSD | No notice in the files | As above, with nothing in the files at all |
| 4.3BSD: `btlgammon` | 4.3BSD | No notice | The old V7 program, so if it is Bell Labs code the Caldera question above applies |
| 4.3BSD: `doctor` | 4.3BSD's `doctor.l`, which has no notice | The Regents' four-clause BSD licence from Net/2's almost identical copy, kept | Net/2 is the release AT&T's Unix Systems Laboratories sued over |
| 4.3BSD: `aardvark` | 4.3BSD | No notice on the game; the Regents' and UCLA's on what was around it | No grant for the game text |
| 4.3BSD: `zork`, TOPS-20: `DUNGEON` (Dungeon) | Dungeon 2.5.6 | Infocom's notice, kept: *commercial usage strictly prohibited* | Non-commercial, and no grant to copy or change it. Microsoft's 2025 MIT release of Zork I to III does not name Dungeon |
| Colossal Cave (4.3BSD, VMS and TOPS-20) | NetBSD | BSD licence, kept | |
| 4.3BSD: `number`, `primes`, `factor`, `banner`, `hangman`, `worm`, `robots`, `snake` (`games.js`, `banner-font.js`) | NetBSD | BSD licence, kept | |
| Rogue | Rogue 5.4.4 | BSD licence, kept, with the notice for the parts based on the work of Nicholas J. Kisseberth | |
| Zork I and II (DOS, CP/M, Linux, Apple IIe, TRS-80) | Infocom's story files, release 119 and 63 | MIT licence (Microsoft, 2025), kept | The licence covers the software, read here as including the story files; Zork is a trademark and the licence does not cover the name |
| Apple IIe: `GUESS`, `BAGELS`, `LANDER`, `KINGDOM` | New, for this terminal | AGPL, with the rest of `machines/` | |
| C128: `HELLO`, `NICOMACHUS`, `ONE CHECK`, `BUZZWORD`, `DIAMOND`, `SINE WAVE` | *BASIC Computer Games* (1978), the listings Vintage BASIC carries | Public domain: on 15 June 2022 David Ahl placed everything he had written or edited in the public domain; the book credits each of these to him alone. Quoted in `games.js` | He asks that his work be used for educational and historical purposes and not for profit, which is a wish, not a condition. Only his own programs are used: the book's other games are other people's |
| TRS-80: `BULLSEYE`, `BUZZWORD` | *BASIC Computer Games* (1978), the listings coding-horror/basic-computer-games carries | Public domain: on 15 June 2022 David Ahl placed everything he had written or edited in the public domain; the book credits both to him alone. Quoted in `disk.js` | He asks that his work be used for educational and historical purposes and not for profit, which is a wish, not a condition. Typed in as a Model III owner would: `RND(0)` for `RND(1)`, `CLEAR 500` in `BULLSEYE`, the titles centred in 64 columns |
| TRS-80: `WORM` | New, for this terminal | AGPL, with the rest of `machines/` | |
| The bulletin board: Star Haul, Deep Mine | New, for this terminal | AGPL, with the rest of `machines/` | |
| VMS: Star Trek | SST2K 2.10 | BSD licence, kept | It descends from older programs whose authors' grant to relicense is not on record; Star Trek is a trademark |
| VMS: Empire | Chuck Simmons's C Empire, in Walter Bright's VMS release | Simmons's Empire General Public License, kept, with Bright's statement | Bright calls it a copy of his copyrighted Empire, whose own sources are non-commercial |
| VMS: Monster | Rich Skrenta's VAX Pascal | "You may freely copy, distribute and change Monster", kept | No warranty disclaimer |
| VMS: Moria | Moria 4.8, VAX Pascal | Robert Alan Koeneke's notice, kept: may be copied and changed, not sold | Non-commercial, and it calls itself public domain while keeping all rights. This is not Umoria, the later GPL version |
| VMS: Conquest | Conquest 4.22, Ratfor | Poskanzer and Leres's permission notice, kept | Keep the notice in all copies and supporting documentation |
| Linux: the default cow in `/usr/share/cowsay/cows` (`fs.js`) | cowsay 3.03, Tony Monroe | The same terms as Perl, the Artistic License or the GNU GPL version 1 or later, noted in the file | The `cowsay` program reading it is new. Only the default cow is there |
| Linux: `fortune`'s sayings (`fs.js`) | Quotations from works published before 1912 | Public domain | The program is new; none of BSD's or fortune-mod's files are used |
| Linux: `sl` | New, after Toyoda Masashi's `sl` | AGPL | Behaviour follows the original; the program and the drawings are new, so his notice is not needed, and he is credited |
| Linux: `nethack` | NetHack 3.6.7 (`nethack-367-src.tgz` from nethack.org) | NetHack General Public License, kept, with every source file's notice; the patch against 3.6.7, the new `fakecap.c` and the C library headers it was built against are in a comment at the end of the file | Copyleft: the NGPL wants the whole of any work containing NetHack under identical terms, so it is kept in its own file, loaded only when it runs. The file points to the upstream source for the rest, and the NGPL allows that pointer only for noncommercial distribution: a commercial site must offer the complete source itself |

- **The example content** in `site/` is dedicated to the public domain under
  [CC0 1.0](site/LICENSE). Copy any of it without credit.
- **Your own content** is yours. Replacing the examples in `site/` with your own words
  does not put them under any of these licences.

The AGPL asks that people using a changed version can get its source. The `source`
command handles that: it prints the address set by `source:` in `site/config.js`. If
you change the terminal's code, point that setting at wherever your changed copy lives.
If you switch `source` off and you have changed the code, offer the source some other way,
such as a link on the page.

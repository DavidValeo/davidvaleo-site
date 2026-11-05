# PHOSPHOR-9

A 1979 video terminal for your website. Visitors land at a glowing green screen with a
coiled cable, log in as `guest`, and poke around a small Version 7 Unix machine: `ls`,
`cat`, `mail`, `man`, `who`, `ps`, a few secrets. You fill it with your own words.

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
  config.js           settings: your name, email, speed, sound, locked files, aliases
  content.js          the welcome message, the about file, the letter, your commands
  home.js             the visitor's home folder: files, folders, hidden things
  theme.css           colours (optional)
machines/v7-1979/     the imaginary computer: its year, self-test, boot log, system files
engine/               the terminal itself; you should not need to touch it
  phosphor.css
  phosphor.js
  commands/           the built-in commands, a few per file
```

`index.html` loads the engine, then the commands, then the machine, then your site.
Your site loads last, so anything you set wins over the machine.

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
| `source:` | Where the `source` command points. Must start with `http://` or `https://`. See [Licence](#licence). |
| `commands:` | Switch commands off or on: `commands: -ping, -ifconfig`. Works on the built-in commands and the machine's (`-sudo`); your own `== command: ==` sections are never switched off, so delete those instead. |
| `protected:` | Locked files and folders: listed by `ls`, but `cat` says *can't open*. Paths work (`.trash/core`); a trailing `/` makes a locked folder. |
| `hostname:` | The machine's name. Normally taken from your domain (`example.com` becomes `example`). |
| `cord turns:` `cord width:` `cord thickness:` `cord gap:` `cord straight:` `cord sway:` | The coiled cable under the monitor: `turns` is a count, the rest are in screen pixels. Values outside a sensible range are pulled back into it. |

The machine sets a few more (`year:`, `installed:`, `user:`, `offline:`); you can override
those too.

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
| `== aliases ==` | Shortcuts, one per line: `ll = ls -l`, or `cl = clear ; ls`. |

### Inside a section

| You write | You get |
|---|---|
| `~ text` | dim green |
| `! text` | red |
| `~~text~~` | ~~struck through~~, anywhere in a line |
| `text -> https://example.com` | the whole line is a link (also `mailto:`; nothing else is accepted) |
| `{site}` `{hostname}` `{owner}` `{email}` `{year}` | filled in when the terminal starts |
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

Built in: `about` `alias` `cat` `cd` `clear` `date` `dmesg` `echo` `exit` `help`
`hostname` `ifconfig` `ls` `mail` `man` `ping` `ps` `pwd` `rm` `sound` `source` `su`
`uptime` `who` `whoami`, plus `sudo` and a couple of magic words from the machine.
Every listed command has a manual page (`man ls`) and a usage line (`ls -h`), except that
`echo -h` prints `-h`, as it should. PageUp and PageDown scroll back through the output
once it has finished typing.

To add a command that prints text, use a `== command: ==` section. To add one that does
something, write a small file like the ones in `engine/commands/` and add a `<script>`
tag for it in `index.html`, after the other commands:

```js
Phosphor.command({names:['roll'],help:'roll a die',
  man:{what:'roll a die',syn:'roll',desc:['prints a number from 1 to 6.']},
  run:function(args){ Phosphor.typeLine(String(1+Math.floor(Math.random()*6))) }});
```

## The machine

`machines/v7-1979/` describes the computer behind the glass: a PDP-11/70 running
Version 7 Unix in 1979. `machine.js` holds its settings and text (the self-test, `dmesg`,
the `ps` table, `sudo`), `fs.js` builds its system folders, and `eggs.js` holds the hidden
commands. To make a different machine, copy the folder, change it, and point the
`<script>` tags in `index.html` at the copy.

## Looks

`site/theme.css` overrides the engine's colours. It includes a ready-made amber monitor:
remove the comment marks around it.

## Privacy

The terminal makes no requests to other servers: no fonts, analytics or trackers. The one
exception is `ping`, which, when a visitor pings your own domain, sends small `HEAD`
requests for the page to your own server and times the answers. Switch it off with
`commands: -ping` if you would rather it did not.

## Upgrading

Replace `engine/` and `machines/` (and `index.html`, putting your `<title>` back in it) with the
new release. Leave `site/` alone. Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## Licence

- **The terminal** (`engine/`, `machines/`, `index.html`) is free software under the
  [GNU Affero General Public License, version 3 or later](LICENSE).
- **The example content** in `site/` is dedicated to the public domain under
  [CC0 1.0](site/LICENSE). Copy any of it without credit.
- **Your own content** is yours. Replacing the examples in `site/` with your own words
  does not put them under either licence.

The AGPL asks that people using a changed version can get its source. The `source`
command handles that: it prints the address set by `source:` in `site/config.js`. If
you change the terminal's code, point that setting at wherever your changed copy lives.

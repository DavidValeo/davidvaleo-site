/* davidvaleo.com on PHOSPHOR-9: machine "phosphor-2119".
   phosphor: a personal terminal left running on purpose. Its builder wrote letters into its log until 2063
   (content/journal.js, the log command); since then it has looked after itself.
   Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE.
   Same text format as the site files; see README.md. Do not type a backtick or a dollar sign
   followed by { between the two backticks below. No em dashes anywhere. */
Phosphor.content(String.raw`

badge:       PHOSPHOR
hostname:    phosphor
installed:   2004-02-20 21:00
user:        guest
homes:       /home
case:        sensitive
shell:       bash
perror:      yes
mail notice: there is a letter for you. type mail.
login failed: no accounts here. guest is fine.
# placeholder: site/variety.js overrides this with the rolled magic word.
root password: changeme
commands:    -ping, -ed, -cal, -ifconfig
offline:     ping: no route out. everything you need is on this machine.

== banner ==
PHOSPHOR-9 VIDEO TERMINAL  ROM V1.07

== boot ==
PHOSPHOR  personal terminal  rev 9 @500

CORE ......................... nominal @300
MEMORY ....................... verified, self-repaired @250
STORE ........................ intact, journal mounted read-only @250
MAINTENANCE .................. autonomous, all faults cleared @300
LAST HUMAN LOGIN ............. 2063-05-11 22:09 @300
ACCESS ....................... open, no accounts, no admin @400
SESSION ...................... guest on tty1 @300

start with: cat readme @300

== dmesg ==
phosphor: maintenance autonomous since 2063-05-11
store: journal mounted read-only, 8 entries
archive: 13 machines preserved, see connect
access: no accounts, no admin

== ps ==
x    1  ?      0:00  init
x    7  ?      55y   maintain --autonomous
x    9  ?      0:01  archive --serve
-   41  tty1   0:00  -bash

== aliases ==
ls = ls --color=auto
read = cat

== file: readme ==
this is phosphor, a personal terminal left running on purpose.
the person who built it wrote letters into its log until 2063.
since then it has looked after itself, and it is in good shape.

to look around:
  ls          list what is here
  cat NAME    read a file
  log         the journal. log 1 reads the first entry
  connect     visit the old computers he kept
  help        everything else

there are no accounts and no admin. you can read anything.
one file is locked. the key is somewhere you can find it.

== file: last-session ==
2063-05-11 21:02  log --write
2063-05-11 21:40  uplink
2063-05-11 21:52  uplink
2063-05-11 22:07  uplink
2063-05-11 22:08  # rematch. someday.
2063-05-11 22:09  logout

your turn. type uplink.

== command: who | who is on the system ==
guest     tty1     now    first login since 2063-05-11

== command: uptime | how long the machine has run ==
 22:09:00 up 42263 days,  1 user,  load average: 0.01, 0.01, 0.00

== man: who ==
lists who is on the machine.

== man: uptime ==
shows how long the machine has run without stopping.

`);

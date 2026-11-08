/* davidvaleo.com on PHOSPHOR-9: the terminal's words. The welcome message, the about section and
   the letter are the fallbacks; site/variety.js overrides some of them per roll from content/variants.js.
   Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE.
   See README.md for the sections and markup, content/journal.js for the journal. Do not type a backtick,
   or a dollar sign followed by {, anywhere between the two backticks below. No em dashes anywhere. */
Phosphor.content(window.DV && DV.onArchive && DV.onArchive() ? '' : String.raw`

# The owner login shown in ls -l, who and on the mail.
name:      phosphor

# Printed after login (and kept in /etc/motd). The roll adds one more line under it.
== welcome ==
hello. you found phosphor. have a look around.
~ start with: cat readme

# What the about command prints.
== about ==
phosphor is a personal terminal, built to keep running after its owner logged off.
it holds a journal he wrote over sixty years, addressed to whoever came next.
since his last login it has run and repaired itself, about fifty years, unattended.

# The letter (the mail command). The roll replaces this with the letter in content/variants.js.
== mail ==
last entry. i'm logging off for good and leaving phosphor running. it knows how to look after itself now. everything here is open. i kept exactly one password, for old times' sake. it's in /etc/passwd, where anyone can read it. and for the record: i played uplink against this machine again tonight and lost, again. i want a rematch. you'll have to take it for me.

# Commands of our own. == command: NAME | HELP TEXT == then what it prints.
== command: motto | what he left on the wall ==
no gods, no masters, no sudo.
~ leave things better than you found them.

== man: motto ==
prints what he left on the wall.

`);

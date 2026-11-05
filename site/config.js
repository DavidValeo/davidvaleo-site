/* Your terminal's settings. Edit freely: this file is yours.
   The example values below are CC0 (public domain); see site/LICENSE.

   One setting per line, "name: value". Lines starting with # are notes and are ignored.
   Do not type a backtick, or a dollar sign followed by {, anywhere between the two
   backticks below: either one stops the file from loading. */
Phosphor.content(String.raw`

# The machine behind the glass, and which others the connect command offers (see
# machines/machines.js). Unset: the first one, and all of them. One machine: no connect.
# machine:  v7
# machines: v7

# Your name. The first word (up to 8 letters) is the owner's login, shown in ls -l,
# who and on the mail. {owner} in any section's text becomes that word.
name:      operator

# Your address, for the letter. {email} in any section's text becomes this.
email:     operator@example.com

# Browser tab title, and the name on the monitor's bezel.
title:     PHOSPHOR-9
badge:     PHOSPHOR-9

# Typing speed: 1 = normal, 1.25 = 25% faster.
speed:     1

# yes = everything in capitals, like an uppercase-only teletype. Without this line: yes.
uppercase: no

# on = keyclicks from the first tap or keypress; off = silent until "sound on".
sound:     on

# Where the source command sends people. The licence (GNU AGPL) asks that anyone using
# a changed copy can get its source: if you change the code, point this at your copy.
source:    https://github.com/GaijinSystems/phosphor

# Switch commands off (or back on): a comma list, minus to remove. Works on the built-in
# commands and the machine's (sudo), not on your own == command: == sections.
# e.g.  commands: -ping      (ping, on the machines that have it, is the only command that
# makes network requests)
commands:

# Locked files and folders in the home directory: listed by ls, but cat says
# "can't open". Paths work (.trash/core); a trailing / makes a locked folder.
protected: photo01.pic, photo02.pic, secrets, .trash/core

# The coiled cable under the monitor: turns is a count, the rest are in screen pixels.
# Values outside a sensible range are pulled back into it.
cord turns:     7
cord width:     18
cord thickness: 3.2
cord gap:       1.8
cord straight:  7.35
cord sway:      2.5

`);

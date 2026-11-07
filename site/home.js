/* davidvaleo.com on PHOSPHOR-9: the visitor's home folder. Every == file: == and == dir: == below
   appears in ls. Paths are relative to the home; a name starting with a dot is hidden (ls -a); a path
   starting with / goes anywhere. Lock files with "protected:" in site/config.js (secrets, .trash/core).
   site/variety.js adds one egg spot per roll from content/variants.js. The story files (readme,
   last-session) live in machines/phosphor-2119/machine.js.
   Copyright (C) 2026 David Valeo. GNU AGPL v3 or later; see LICENSE.
   Do not type a backtick, or a dollar sign followed by {, between the two backticks. No em dashes. */
Phosphor.content(window.DV && DV.onArchive && DV.onArchive() ? '' : String.raw`

== file: secrets ==
you found the one lock i kept. there is nothing behind it but this note.

i spent years arguing that nobody should be in charge of a computer, then made myself root, just this once, to leave you something. i think that's allowed.

here is the whole secret: nobody is coming to run things for you. not a company, not a machine, not an admin. that's good news. it means you can.

be kind to whoever uses this next. fix one thing before you go.

no gods, no masters, no sudo.

== file: .profile ==
# read by the shell at login.
PATH=/usr/local/bin:/usr/bin:/bin
TERM=p9
export PATH TERM

== file: .trash/.deeper/note ==
one password is still on this machine, where old machines kept theirs.
~ cat /etc/passwd
~ go back up: cd ..

`);

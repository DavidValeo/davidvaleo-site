/* Your terminal's words: the welcome message, the about file and the letter.
   The example text below is CC0 (public domain); replace it with your own. See README.md
   for the full list of sections and markup. Do not type a backtick, or a dollar sign
   followed by {, anywhere between the two backticks below. */
Phosphor.content(String.raw`

# Printed after login (and kept in /etc/motd).
== welcome ==
welcome to {site}.
~ type help and press return.

# The about file and the about command.
== about ==
this terminal belongs to {owner}.
it is always {year} in here.
~ (edit the about section in site/content.js)

# The letter (the mail command). "you have mail." shows at login while this has text.
#
# Write each paragraph as ONE line: the glass wraps it to fit, phones included.
#
# Project rows: name, a run of spaces, then the status or date. Pad every row to the same
# width (41 characters here) so the right-hand column lines up; the ~~ marks are not
# printed and do not count, and {year} counts as the four digits it becomes. On a narrow screen the run of spaces shrinks to fit.
# ~~text~~ strikes text through: here, the real date, then the in-character one: the same month and day, in
# whatever year the machine is.
# Retired projects move to the attic file (site/home.js).
== mail ==
welcome to {site}!

this is the letter every visitor finds waiting. say hello, say what this place is, and say what you are working on. it is one long line in site/content.js, and the glass wraps it.

here is what is on the bench:
~ tap or click a title to visit.

my next project               coming soon -> https://example.com
my first project    ~~2025-06-01~~ {year}-06-01 -> https://example.com

~ no terminal should be without one!

to reach the operator, write to:
{email} -> mailto:{email}
~ no modem detected. copy it down by hand.

# A command of your own: == command: NAME | HELP TEXT == then what it prints.
# Several names: == command: projects, proj | ... ==   No help text = hidden from help.
== command: motto | words to live by ==
keep the tube warm.

`);

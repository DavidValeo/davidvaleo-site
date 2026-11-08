/* davidvaleo.com on PHOSPHOR-9: what the per-tab roll chooses from. Plain data, loaded by a
   script tag, no fetch. Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE.
   No em dashes anywhere. Welcome lines are spoken: keep them plain.
   Nothing about the real owner. */
window.DV = window.DV || {};
/* true when the address asks for one of the archive machines that connect reaches: our text stays off them */
DV.onArchive = function () {
  var m = ''; try { m = (new URLSearchParams(location.search).get('machine') || '').toLowerCase(); } catch (e) {}
  return !!m && DV.variants.machines.indexOf(m) < 0 && !!(window.Phosphor && Phosphor.catalog && Phosphor.catalog[m]);
};
DV.variants = {

  machines: ["phosphor"],

  tints: ["tint-ember", "tint-foxfire", "tint-moth", "tint-bluehour"],

  /* one of these prints after login. */
  welcome: [
    "hello. you found phosphor. have a look around.",
    "welcome. everything here is open, and nothing will break.",
    "fifty years without a visitor, and everything still works. welcome.",
    "welcome to phosphor. someone left this running for you.",
    "hello, visitor. the journal is open whenever you are.",
    "you are the first keypress in a long while. make yourself at home."
  ],

  /* the machine's == boot == is used as is */
  boot: {},

  letters: [
    ["from:     the journal", "to:       whoever finds it", "subject:  logging off", "", "last entry. i'm logging off for good and leaving phosphor running. it knows how to look after itself now. everything here is open. i kept exactly one password, for old times' sake. it's in /etc/passwd, where anyone can read it. and for the record: i played uplink against this machine again tonight and lost, again. i want a rematch. you'll have to take it for me."]
  ],

  /* the last password in the world, kept where old machines kept theirs */
  magic: [
    { word: "mine", clueFile: "/etc/passwd", clueText: "# /etc/passwd\n# this file used to hold the passwords for every account on a machine.\n# this machine has no accounts. i kept one line, for old times' sake.\nroot:mine:0:0:root:/root:/bin/sh\n# yes, the password is right there. type su, give it the word, then cat secrets." }
  ],

  /* where the ascii drops hide. one spot per roll gets a picture; a second gets just its line. */
  eggSpots: [
    { path: "~/.trash/.deeper/.deepest",     text: "you kept going. this is what was down here." },
    { path: "~/.cache/drawings/kept",        text: "cached in 2050. never cleared." },
    { path: "/usr/share/doc/visitor/README", text: "for whoever comes in." },
    { path: "/var/mail/.nobody",             text: "mail for nobody. you read it anyway." },
    { path: "~/pictures/.plain",             text: "plain text pictures." },
    { path: "/etc/motd.d/99-drop",           text: "kept out of the login message. kept anyway." }
  ]
};

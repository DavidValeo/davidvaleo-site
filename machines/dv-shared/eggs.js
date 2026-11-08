/* davidvaleo.com on PHOSPHOR-9: the eggs, as commands (loaded after ../linux/commands.js, so ours win).
   Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE.
   Data lives in content/eggs.js (DV.eggs); the roll in site/variety.js (DV.roll). */
(function (P) {
  'use strict';
  window.DV = window.DV || {};
  function eggs() { return DV.eggs || {}; }
  function word() { return (DV.roll && DV.roll.word) || ''; }
  function fillWord(t) { return String(t).replace(/\{word\}/g, word()); }
  function lines(t) { return String(t).split('\n'); }

  /* ---- Anarchy A: sudo (any arguments, any machine of ours) and make anarchy ---- */
  function anarchy() {
    var a = eggs().anarchy || {};
    P.typeLine(a.line || 'no gods, no masters, no sudo.');
    if (a.art) P.say([' '].concat(lines(a.art)));
    P.status(0);
  }
  P.command({
    names: ['sudo'], path: '/usr/bin',
    man: { what: 'execute a command as another user', syn: 'sudo [command]', desc: ['there is no sudo here. there never was.'] },
    run: function () { anarchy(); }
  });
  P.command({
    names: ['make'], path: '/usr/bin', hidden: true,
    man: { what: 'maintain program groups', syn: 'make [target]', desc: ['builds the named target from the makefile in the working directory. one target is built into this machine.'] },
    run: function (a) {
      var t = (a || []).filter(function (x) { return x.charAt(0) !== '-'; })[0];
      if (t === 'anarchy') { anarchy(); return; }
      if (!t) { P.typeLine('make: *** No targets specified and no makefile found.  Stop.', 'err'); P.status(2); return; }
      P.typeLine("make: *** No rule to make target '" + t + "'.  Stop.", 'err'); P.status(2);
    }
  });

  /* ---- the root trail: su with the rolled word, the clue file, halt as root (all from the linux shell and the roll) ---- */
})(window.Phosphor);

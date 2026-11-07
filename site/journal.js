/* davidvaleo.com on PHOSPHOR-9: the log command and ~/log/, the journal left on the machine.
   Copyright (C) 2026 David Valeo. GNU AGPL v3 or later; see LICENSE.
   Data: content/journal.js (DV.journal). Runs after site/variety.js and before Phosphor.start().
   The archive machines that connect reaches get none of this. */
(function (P) {
  'use strict';
  var J = (window.DV && DV.journal) || [];
  if (!J.length || (DV.roll && DV.roll.archived)) { P.content(''); return; } /* tells the loader this file arrived */

  function safe(t) { return String(t).replace(/`/g, "'").replace(/\$\{/g, '$ {'); }
  P.content(J.map(function (e) {
    return '== file: log/' + e.date + ' ==\n' + safe(e.title) + '\n\n' + safe(e.text) + '\n';
  }).join('\n'));

  function show(e) {
    P.typeLine('--- ' + e.date + ' | ' + e.title, 'dim');
    P.typeLine(e.text);
    P.typeLine('');
  }
  function index() {
    P.typeLine('journal: ' + J.length + ' entries, ' + J[0].date.slice(0, 4) + ' to ' + J[J.length - 1].date.slice(0, 4), 'dim');
    J.forEach(function (e, i) { P.typeLine(String(i + 1).padStart(3) + '  ' + e.date + '  ' + e.title); });
    P.typeLine('log 1 reads the first. log latest reads the last. log all reads them in order.', 'dim');
  }
  P.command({
    names: ['log'], path: '/usr/local/bin', help: 'read the journal',
    man: { what: 'read the journal', syn: 'log [ n | year | latest | all ]', desc: [
      'with nothing, lists the entries. with a number, a year or a date, prints that entry. latest prints the last one, all prints every entry, oldest first.',
      '', 'the entries are also files, in ~/log/.'] },
    run: function (a) {
      var w = (a[0] || '').toLowerCase();
      if (!w) { index(); return; }
      if (w === 'all') { J.forEach(show); return; }
      if (w === 'latest' || w === 'last') { show(J[J.length - 1]); return; }
      var n = parseInt(w, 10), hit = null;
      if (/^\d{1,2}$/.test(w) && n >= 1 && n <= J.length) hit = J[n - 1];
      if (!hit) hit = J.filter(function (e) { return e.date.indexOf(w) === 0; })[0];
      if (!hit) { P.typeLine('log: no entry ' + a[0] + '. type log for the list.', 'err'); P.status(1); return; }
      show(hit);
    }
  });
})(window.Phosphor);

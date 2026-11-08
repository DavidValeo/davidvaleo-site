/* davidvaleo.com on PHOSPHOR-9: one roll per browser tab.
   Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE.

   Picks the machine, tube tint, welcome line, boot flavor, lead chat persona, where the eggs hide,
   the magic word (and the clue that holds it) and the tone of the letter, all from one seed kept in
   sessionStorage. ?seed=N forces a roll. Data: content/variants.js (DV.variants), content/eggs.js.
   Everything is handed to Phosphor.content(), so this file must run before Phosphor.start(). */
(function () {
  'use strict';
  window.DV = window.DV || {};
  var V = DV.variants;
  if (!V || !V.machines || !V.machines.length) return;
  var E = DV.eggs || {};
  var KEY = 'dv/seed';

  /* ---- the seed ---- */
  function param(name) {
    try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; }
  }
  function parseSeed(s) {
    if (s === null || s === undefined || s === '') return null;
    var n = parseInt(s, 10);
    if (isNaN(n)) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; n = h; }
    return n >>> 0;
  }
  function freshSeed() {
    try { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0]; } catch (e) { return (Math.random() * 4294967296) >>> 0; }
  }
  var seed = parseSeed(param('seed')), stored = null, forced = seed !== null;
  if (seed === null) {
    try { stored = parseSeed(sessionStorage.getItem(KEY)); } catch (e) {}
    seed = stored !== null ? stored : freshSeed();
  }
  try { sessionStorage.setItem(KEY, String(seed)); } catch (e) {}

  /* mulberry32: the same seed always makes the same roll */
  var st = seed >>> 0;
  function rnd() {
    st = (st + 0x6D2B79F5) >>> 0;
    var t = st;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function pick(a) { return a && a.length ? a[Math.floor(rnd() * a.length)] : undefined; }
  function pickIdx(a) { return a && a.length ? Math.floor(rnd() * a.length) : -1; }

  /* ---- the roll (draw order is fixed, so adding a field at the end never changes the others) ---- */
  var rolled = pick(V.machines);
  var tint = pick(V.tints || []);
  var wi = pickIdx(V.welcome || []);
  var bi = Math.floor(rnd() * 1e6);
  var persona = null;
  var chat = DV.chat || {};
  var leads = (chat.personas || []).filter(function (p) { return p.lead; });
  if (leads.length) persona = pick(leads).id;
  var magic = pick(V.magic || []);
  var spots = (V.eggSpots || []).slice();
  var spotA = spots.length ? spots.splice(Math.floor(rnd() * spots.length), 1)[0] : null;
  var spotB = spots.length ? spots.splice(Math.floor(rnd() * spots.length), 1)[0] : null;
  var artIdx = pickIdx(E.art || []);
  var li = pickIdx(V.letters || []);

  /* a machine named in the address wins for this load (connect uses it); the roll keeps the rest.
     The archive machines (connect lists them) boot as themselves: none of our text is laid over them. */
  var asked = (param('machine') || '').toLowerCase();
  var machine = V.machines.indexOf(asked) >= 0 ? asked : rolled;
  var archived = !!asked && asked !== machine && !!(Phosphor.catalog || {})[asked];
  if (archived) {
    DV.roll = { seed: seed, forced: forced, machine: asked, archived: true };
    document.documentElement.setAttribute('data-machine', asked);
    Phosphor.content(''); /* tells the loader this file arrived */
    return;
  }

  var roll = DV.roll = {
    seed: seed, forced: forced, machine: machine, rolledMachine: rolled, tint: tint,
    welcomeIndex: wi, welcome: wi >= 0 ? V.welcome[wi] : '',
    persona: persona, word: magic ? magic.word : '', clueFile: magic ? magic.clueFile : '',
    spots: [spotA, spotB].filter(Boolean).map(function (s) { return s.path; }),
    art: artIdx >= 0 ? E.art[artIdx].id : '', letter: li
  };

  /* ---- text that is safe inside Phosphor.content ---- */
  function safe(t) {
    return String(t).replace(/`/g, "'").replace(/\$\{/g, '$ {');
  }
  function word(t) { return String(t).replace(/\{word\}/g, roll.word); }
  function body(text) { /* one block of lines; a leading # would be a comment, == a heading */
    return safe(word(text)).split('\n').map(function (l) {
      if (/^\s*#/.test(l) || /^\s*==/.test(l)) return '​' + l;
      return l;
    }).join('\n');
  }
  function art(text) {
    if (Array.isArray(text)) text = text.join('\n'); /* picture lines: nothing at the start may be read as markup */
    return safe(text).replace(/~~/g, '~ ~').split('\n').map(function (l) {
      if (/^\s*[#!~]/.test(l) || /^\s*==/.test(l) || /\s->\s/.test(l)) return '​' + l.replace(/\s->\s/g, ' -​> ');
      return l;
    }).join('\n');
  }
  function fileSection(path, text) { return '== file: ' + path.replace(/\s+/g, '') + ' ==\n' + text + '\n'; }

  var out = [];
  out.push('machine: ' + machine);
  out.push('commands: sudo, make');
  try { var cat = Phosphor.catalog[machine]; if (cat) out.push('badge: ' + (cat.badge || machine.toUpperCase() + ' ' + cat.year)); } catch (e) {}
  if (roll.word) out.push('root password: ' + roll.word);
  out.push('');

  if (roll.welcome) out.push('== welcome ==\n' + body(roll.welcome) + '\n');

  var boots = (V.boot || {})[machine];
  if (boots && boots.length) {
    var b = [].concat(boots[bi % boots.length]);
    roll.boot = bi % boots.length;
    out.push('== boot ==\n' + b.map(body).join('\n') + '\n');
  }

  if (li >= 0) {
    var L = V.letters[li];
    if (Array.isArray(L)) L = L.join('\n');
    if (!/^\s*==\s*mail\s*==/.test(L)) L = '== mail ==\n' + L;
    L = L.replace(/^\s*==\s*mail\s*==\s*\n?/, '');
    out.push('== mail ==\n' + body(L) + '\n');
  }

  if (magic && magic.clueFile && magic.clueText) out.push(fileSection(magic.clueFile, body(magic.clueText)));

  if (spotA) {
    var a = artIdx >= 0 ? E.art[artIdx] : null;
    out.push(fileSection(spotA.path, body(spotA.text || '') + (a ? '\n\n' + art(a.art) : '')));
  }
  if (spotB) out.push(fileSection(spotB.path, body(spotB.text || '')));

  Phosphor.content(out.join('\n'));

  /* ---- the tube ---- */
  if (tint) document.documentElement.classList.add(/^tint-/.test(tint) ? tint : 'tint-' + tint);
  document.documentElement.setAttribute('data-machine', machine);
  document.documentElement.setAttribute('data-seed', String(seed));
  if (roll.persona) document.documentElement.setAttribute('data-lead', roll.persona);
})();

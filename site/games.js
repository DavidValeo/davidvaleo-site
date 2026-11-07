/* davidvaleo.com on PHOSPHOR-9: games of our own, loaded when first run.
   SPDX-License-Identifier: AGPL-3.0-or-later
   New code for this site. Copyright (C) 2026 David Valeo. GNU AGPL v3 or later; see LICENSE. */
(function (P) {
  'use strict';
  P.later('../../site/games/uplink.js', {names: ['uplink'], path: '/usr/games',
    man: {what: 'two relay masts lob data packets across a skyline', syn: 'uplink', desc: [
      'a turn-based artillery game for one or two players. each side has a relay mast on a rooftop. take turns to enter an angle, in degrees from 0 to 90 measured from the side your mast faces, and a velocity in metres per second. the packet flies under gravity and the wind, which is new every round and shown at the bottom as an arrow.',
      'a packet that hits a building carves a crater and passes the turn. a packet that hits a mast wins the round for the shooter; hitting your own mast wins it for the other player. a packet that leaves by the left or right edge is a miss. one that flies over the top keeps going, and a ^ at the top edge marks where.',
      'setup asks for the number of players, names, the rounds to play (3) and gravity (9.8). enter takes the default. in one-player games you play phosphor, the machine itself, which learns from its misses but is not perfect.',
      'the score is at the bottom centre. after the last round the results show wins and shots fired; any key returns to the shell.', '',
      'q or ctrl-c quits at any time (while typing a name, only ctrl-c or esc).',
      'with prefers-reduced-motion set, the animations are short.']}});
})(window.Phosphor);

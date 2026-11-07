/* davidvaleo.com on PHOSPHOR-9: shared helpers for our machines (loaded before ../linux/commands.js).
   Copyright (C) 2026 David Valeo. GNU AGPL v3 or later; see LICENSE.
   Our machines reuse the Linux shell in machines/linux (commands.js, fs.js, games) and lay their own
   identity on top, so upstream merges of machines/linux keep working. */
(function (P) {
  'use strict';
  window.DV = window.DV || {};

  /* games borrowed from machines/linux: the file is relative to the machine folder, hence ../linux/ */
  var GAMES = {
    cowsay: [['../linux/games/cowsay.js'], ['cowsay', 'cowthink'], { what: 'configurable speaking/thinking cow', syn: 'cowsay [-e eyes] [-T tongue] [-W column] message', desc: ['prints a cow saying the words given, in a balloon. cowthink has it think them instead.'] }],
    fortune: [['../linux/games/fortune.js'], 'fortune', { what: 'print a random adage', syn: 'fortune [-s] [-l] [-c]', desc: ['prints one of the sayings kept in /usr/share/games/fortunes, chosen at random.'] }],
    sl: [['../linux/games/sl.js'], 'sl', { what: 'a steam locomotive, for those who type sl for ls', syn: 'sl [-alFe]', desc: ['sends a steam locomotive across the screen. it cannot be stopped; that is the point.'] }],
    /* the two big ones, with their upstream manual pages (machines/linux/later.js) */
    frotz: [['../shared/zmachine.js', '../linux/games/frotz.js'], 'frotz', {what:'interpreter for Infocom and other Z-Machine games',syn:'frotz [options] file [blorb_file]',desc:[
  'plays the story files of Infocom\'s text adventures, and of the games written since for the Z-machine. type your commands in plain words; the game answers, and the line at the top says where you are and how you are doing.',
  'a story file that is not in the working directory is looked for in the directories named in INFOCOM_PATH. on this machine the administrator has put zork1.z3 and zork2.z3 there, so frotz zork1.z3 starts Zork I.','',
  'save and restore keep your game in this browser, under a name you choose. ctrl-c leaves at once.']}],
    nethack: [['../linux/games/nethack.js'], 'nethack', {what:'Exploring The Mazes of Menace',syn:'nethack [ -d directory ] [ -n ] [ -p profession ] [ -r race ] [ -[DX] ] [ -u playername ] [ -dec ] [ -ibm ] [ --showpaths ] [ --version[:paste] ]',desc:[
  'nethack is a display oriented dungeons & dragons(tm) - like game. the standard tty display and command structure resemble rogue.',
  'to get started you really only need to know two commands. the command ? will give you a list of the available commands (as well as other information) and the command / will identify the things you see on the screen.',
  'to win the game (as opposed to merely playing to beat other people\'s high scores) you must locate the amulet of yendor which is somewhere below the 20th level of the dungeon and get it out. few people achieve this; most never do.',
  'when the game ends, whether by your dying, quitting, or escaping from the caves, nethack will give you (a fragment of) the list of top scorers. nethack -s [ -v ] [ -p profession ] [ -r race ] [ playernames ] shows the list without playing.',
  'the environment variable NETHACKOPTIONS can be used to initialize many run-time options. the ? command provides a description of these options and syntax. options may also be put in a configuration file, .nethackrc in your home directory.',
  '-u playername supplies the answer to the question "who are you?". -p and -r choose the profession and race. -D asks for debug mode, which only root may have here. -dec and -ibm are the decgraphics and ibmgraphics options.','',
  'on this machine saved games, bones files and the list of top scorers are kept in this browser. closing the page hangs up the terminal, and nethack saves the game as it does when a line drops. ctrl-c asks whether you really want to quit. the arrow keys move as h j k l do.']}],
    cmatrix: [['../linux/games/cmatrix.js'], 'cmatrix', { what: 'falling characters', syn: 'cmatrix [-s] [-u update]', desc: ['fills the screen with falling columns of characters, until q or ctrl-c.'] }, { path: '/usr/bin' }]
  };
  DV.later = function (which) {
    which.forEach(function (k) {
      var g = GAMES[k];
      if (!g) return;
      P.later(g[0], Object.assign({ names: [].concat(g[1]), path: '/usr/games', man: g[2], hidden: true }, g[3] || {}));
    });
  };
  /* what each machine is: set by its commands.js, read by eggs.js and fs.js */
  DV.cfg = DV.cfg || {};
  P.setup(function () {}); /* tells the loader this file arrived */
})(window.Phosphor);

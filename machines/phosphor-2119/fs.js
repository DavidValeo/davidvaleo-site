/* davidvaleo.com on PHOSPHOR-9: machine "phosphor", its identity over the Linux file system
   (runs after ../linux/fs.js). Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE. */
Phosphor.setup(function (P) {
  'use strict';
  var C = DV.cfg, sys = P.sys, ST = P.st;
  var MOTD = ["phosphor 2119. all systems nominal.", "leave things better than you found them."];
  var REL = ['PRETTY_NAME="' + C.os + ' ' + C.version + '"', 'NAME="' + C.os + '"', 'VERSION_ID="' + C.version + '"', 'ID=' + C.id, 'HOME_URL="about:blank"'];
  sys('/usr/lib/os-release', 'f', { body: REL });
  sys('/etc/issue', 'f', { body: [C.os + ' ' + C.version + ' \\n \\l', ''] });
  sys('/etc/issue.net', 'f', { body: [C.os + ' ' + C.version] });
  var etc = P.find('/etc', true);
  delete etc.kids['debian_version'];
  sys('/etc/release', 'f', { body: [C.os + ' ' + C.version + ' (' + C.year + ')'] });
  /* the careless administrator's cron note is replaced by the rolled clue file */
  var cron = P.find('/etc/cron.d', true);
  if (cron) delete cron.kids['home-backup'];
  /* the banner: the same 9 lines Debian printed (the first is the uname line), now ours */
  var w = P.profile.welcome, head = w.slice(0, 9), tail = w.slice(9);
  head[0] = 'Linux ' + ST.hostname + ' ' + C.krel + ' ' + P.debian.kbuild + ' x86_64';
  head[1] = ''; head[2] = MOTD[0] || ''; head[3] = MOTD[1] || ''; head[4] = MOTD[2] || ''; head[5] = ''; head[6] = ''; head[7] = ''; head[8] = '';
  P.profile.welcome = head.concat(tail);
  sys('/etc/motd', 'f', { body: function () { return head.slice(1, 8).concat([''], P.profile.welcome.slice(9)); } });
});

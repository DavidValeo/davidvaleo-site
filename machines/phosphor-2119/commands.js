/* davidvaleo.com on PHOSPHOR-9: machine "phosphor": what this machine is, laid over the Linux shell
   (runs after ../linux/commands.js, before ../linux/fs.js). Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later. */
(function (P) {
  'use strict';
  var D = P.debian;
  Object.assign(D, { krel: '61.0.3-plain', kbuild: '#1 SMP PREEMPT plain 47 (2117-06-21)', cpu: 'board 31', ncpu: 2 });
  D.links = Object.assign({}, D.links, { '/vmlinuz': 'boot/vmlinuz-61.0.3-plain', '/initrd.img': 'boot/initrd.img-61.0.3-plain' });
  DV.cfg = { id: 'phosphor', year: 2119, os: 'Plain', version: '47', krel: '61.0.3-plain' };
  P.setup(function () {}); /* tells the loader this file arrived */
})(window.Phosphor);

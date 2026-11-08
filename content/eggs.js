/* davidvaleo.com on PHOSPHOR-9: the eggs. Plain data, loaded by a script tag, no fetch.
   Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE.
   Nothing about the real owner. No em dashes anywhere. */
window.DV = window.DV || {};
DV.eggs = {

  /* sudo <anything>, and make anarchy, print the line and then the A. 37 columns wide. */
  anarchy: {
    line: "no gods, no masters, no sudo.",
    art: [
      "                  #                  ",
      "          #################          ",
      "       #####     ###     #####       ",
      "     ####       ## ##       ####     ",
      "    ###        ##   ##        ###    ",
      "  ###         ##     ##         ###  ",
      "  ##        ##         ##        ##  ",
      " ###       ##           ##       ### ",
      " ##       ##             ##       ## ",
      "###      ##               ##      ###",
      " ##     ##                 ##     ## ",
      " ###   #######################   ### ",
      "  ##  ##                     ##  ##  ",
      "  #####                       #####  ",
      "   ####                       ####   ",
      "  ## ####                   #### ##  ",
      " ##    #####             #####    ## ",
      "##        #################        ##",
      "                  #                  "
    ].join("\n")
  },

  /* ascii drops: one per roll lands in an egg spot. all under 40 columns. */
  art: [


    { id: "board", title: "board 1", art: [
      "       _______________________",
      "      |  _________________  |",
      "      | |                 | |",
      "      | |   phosphor: up  | |",
      "      | |   since 2004    | |",
      "      | |_________________| |",
      "      |_____________________|",
      "     [===== board 1 of 31 =====]",
      "      retired 2011. labelled."
    ].join("\n") },

    { id: "wave", title: "a carrier wave", art: [
      "  |",
      "  |  .-.      .-.      .-.      .-.",
      "  | /   \\    /   \\    /   \\    /   \\",
      "  |/     \\  /     \\  /     \\  /     \\",
      "  |       \\/       \\/       \\/       >",
      "  |",
      "  |_______________________________",
      "   three hops, one hello."
    ].join("\n") },


    { id: "chair", title: "the chair", art: [
      "           ______________",
      "          |              |",
      "          |              |",
      "          |     root     |",
      "          |              |",
      "          |______________|",
      "          |______________|",
      "          |  |        |  |",
      "          |  |        |  |",
      "          |__|        |__|",
      "    he left it empty on purpose."
    ].join("\n") },

  ]
};

(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  // Crisp inline SVG icons for weapons, armors, accessories, elixirs, assets, and crests
  var SVGS = {
    dagger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4l5.5 5.5-8.5 8.5L6 12.5 14.5 4z"/><path d="M6 12.5L3.5 20.5l8-2.5"/><path d="M9 15l-4 4"/></svg>',
    sword: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3l2 2-9.5 9.5-2-2L19 3z"/><path d="M8 11l5 5"/><path d="M5 19l4.5-4.5"/><circle cx="4.5" cy="19.5" r="1.3"/></svg>',
    elven_blade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 3c-5 1-9.5 4.5-12 9.5L5 16l3 3 3.5-3c5-2.5 8.5-7 8.5-13z"/><path d="M11 13c1.5-2.5 4-4.5 6.5-5.5"/><path d="M4 20l2.5-2.5"/></svg>',
    demon_sword: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 2.5L15 11l2 2-6 6-4-4 6-6 2 2 4.5-8.5z"/><path d="M5 19l2-2"/><path d="M9 6l2-2 1 3"/></svg>',
    meteor_blade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3l-8 8-3-3 8-5h3z"/><path d="M10 11l-6 6 3 3 6-6"/><path d="M4 20l2-2"/><path d="M6 5l2 2M17 16l2 2"/></svg>',
    anvil_sword: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v14"/><path d="M8 12h8"/><path d="M9.5 16h5l-1 4h-3l-1-4z"/><path d="M12 2l2.5 3.5L12 10 9.5 5.5 12 2z"/></svg>',
    leather_armor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4l5 2 5-2 3 4-2.5 2.5V20h-11v-9.5L4 8l3-4z"/><path d="M12 6v14"/></svg>',
    scale_armor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M8 10a4 4 0 0 0 8 0"/><path d="M9 14a3 3 0 0 0 6 0"/></svg>',
    plate_armor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8.5 3.5v6.5c0 5.5-3.8 8.8-8.5 10-4.7-1.2-8.5-4.5-8.5-10V5.5L12 2z"/><path d="M12 6v12"/><path d="M7.5 10h9"/></svg>',
    mithril_armor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8.5 3.5v6.5c0 5.5-3.8 8.8-8.5 10-4.7-1.2-8.5-4.5-8.5-10V5.5L12 2z"/><polygon points="12 7 15 11.5 12 16 9 11.5"/></svg>',
    charm_wood: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3"/><path d="M12 21c4-3 6-6.5 6-10.5A6 6 0 0 0 6 10.5C6 14.5 8 18 12 21z"/><path d="M12 9v8"/></svg>',
    lens: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/><circle cx="11" cy="11" r="2.5"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13 13 8.5 15.5 11 11 15.5 8.5"/></svg>',
    ring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6.5"/><polygon points="12 3 15 6.5 12 8.5 9 6.5"/></svg>',
    pendant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3l5 5 5-5"/><circle cx="12" cy="14.5" r="5.5"/><circle cx="12" cy="14.5" r="2"/></svg>',
    elixir_heal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v4l-5 7.5A3.5 3.5 0 0 0 8 20h8a3.5 3.5 0 0 0 3-5.5L14 7V3"/><path d="M12 11.5v4"/><path d="M10 13.5h4"/></svg>',
    elixir_anti: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v4.5L5.5 15A3.5 3.5 0 0 0 8.5 20h7a3.5 3.5 0 0 0 3-5L14 7.5V3"/><path d="M8 14.5h8"/></svg>',
    elixir_focus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4v4l4.5 6.5A4 4 0 0 1 15 19H9a4 4 0 0 1-3.5-6.5L10 6V2z"/><path d="M12.5 10l-2 3.5h3l-2 3.5"/></svg>',
    caravan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="9" rx="2"/><path d="M16 10h4l2 3v3h-6"/><circle cx="7.5" cy="18" r="2"/><circle cx="18.5" cy="18" r="2"/></svg>',
    safehouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"/><path d="M9 21v-6h6v6"/></svg>',
    scroll_shadow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h11a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M9 9h6M9 13h5"/></svg>',
    crest_anvil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16l-2 4H7l-3-4z"/><path d="M9 13v5l-2 2h10l-2-2v-5"/><path d="M12 4v5"/></svg>',
    crest_crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3.5v6.5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5.5L12 2z"/></svg>',
    crest_demon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c4 4 6 7 6 11a6 6 0 1 1-12 0c0-4 2-7 6-11z"/><path d="M12 11c1.5 2 2.5 3.5 2.5 5a2.5 2.5 0 0 1-5 0c0-1.5 1-3 2.5-5z"/></svg>'
  };

  function getIconSvg(key, extraClass) {
    var svg = SVGS[key] || SVGS.sword;
    return '<span class="svg-icon ' + (extraClass || '') + '" aria-hidden="true">' + svg + '</span>';
  }

  GameApp.Icons = {
    SVGS: SVGS,
    getIconSvg: getIconSvg
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.Icons;
  }
})(typeof window !== 'undefined' ? window : globalThis);

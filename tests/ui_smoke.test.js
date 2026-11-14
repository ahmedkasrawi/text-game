'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var rootDir = path.resolve(__dirname, '..');
var html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
var uiCode = fs.readFileSync(path.join(rootDir, 'js', 'v6', 'ui.js'), 'utf8');

// 1. Verify all <link href="...">, <script src="...">, and static <img src="..."> resolve to real files
var assetRegex = /(?:href|src)="([^"]+)"/g;
var match;
var assetCount = 0;
while ((match = assetRegex.exec(html)) !== null) {
  var relPath = match[1];
  var fullPath = path.join(rootDir, relPath);
  assert(fs.existsSync(fullPath), 'Missing linked asset in index.html: ' + relPath);
  assetCount += 1;
}
console.log('✓ Verified all ' + assetCount + ' CSS/JS/Image asset references in index.html exist on disk');

// 2. Verify every $('id') referenced in js/v6/ui.js exists in index.html
var idRefRegex = /\$\('([^']+)'\)/g;
var checkedIds = {};
while ((match = idRefRegex.exec(uiCode)) !== null) {
  var domId = match[1];
  if (checkedIds[domId]) continue;
  checkedIds[domId] = true;
  assert(
    html.indexOf('id="' + domId + '"') !== -1,
    'V6 UI references missing DOM id in index.html: #' + domId
  );
}
console.log('✓ Verified all ' + Object.keys(checkedIds).length + ' DOM IDs in js/v6/ui.js match index.html');

// 3. Minimal DOM shim smoke test for V6 UI boot -> start run -> choice -> encounter -> modals
function makeEl(id) {
  var listeners = {};
  var classes = {};
  var attrs = {};
  var el = {
    id: id || '',
    textContent: '',
    innerHTML: '',
    src: '',
    style: {},
    classList: {
      add: function (c) { classes[c] = true; },
      remove: function (c) { delete classes[c]; },
      toggle: function (c, force) { if (force) classes[c] = true; else delete classes[c]; },
      contains: function (c) { return Boolean(classes[c]); }
    },
    addEventListener: function (ev, fn) {
      listeners[ev] = listeners[ev] || [];
      listeners[ev].push(fn);
    },
    getAttribute: function (k) { return attrs[k] || null; },
    setAttribute: function (k, v) { attrs[k] = String(v); },
    click: function () { (listeners.click || []).forEach(function (fn) { fn({ currentTarget: el, target: el }); }); }
  };
  return el;
}

var elements = {};
Object.keys(checkedIds).forEach(function (id) { elements[id] = makeEl(id); });

global.window = global;
global.localStorage = {
  _data: {},
  getItem: function (k) { return this._data[k] || null; },
  setItem: function (k, v) { this._data[k] = String(v); },
  removeItem: function (k) { delete this._data[k]; }
};
global.document = {
  readyState: 'complete',
  getElementById: function (id) { return elements[id] || null; },
  querySelectorAll: function () { return []; },
  querySelector: function () { return null; },
  addEventListener: function () {}
};

global.GameApp = {};
require('../js/audio.js');
require('../js/v6/schema.js');
require('../js/v6/assets.js');
require('../js/data/v6/world.js');
require('../js/v6/world_time.js');
require('../js/data/v6/gear_shop.js');
require('../js/v6/combat.js');
require('../js/data/v6/characters_achievements.js');
require('../js/v6/characters_achievements.js');
require('../js/v6/storage.js');
require('../js/v6/engine.js');
var V6UI = require('../js/v6/ui.js');

assert(elements['main-menu-screen'].classList.contains('hidden') === false, 'Main menu visible on boot');

V6UI.startNewRun();
assert(elements['app'].classList.contains('hidden') === false, 'Game shell visible after starting run');
assert.strictEqual(elements['event-title'].textContent.length > 0, true, 'Starting event title rendered');
assert(elements['choices-container'].innerHTML.indexOf('follow_smith') !== -1, 'Origin choices rendered');

V6UI.openMapModal();
assert(elements['modal-body'].innerHTML.indexOf('continent_map.jpg') !== -1, 'Continent map modal rendered');
V6UI.openShopModal();
assert(elements['modal-body'].innerHTML.indexOf('sword_iron.jpg') !== -1, 'Shop modal renders item artwork');
V6UI.openHallModal();
assert(elements['modal-body'].innerHTML.indexOf('الأقوى') !== -1, 'Hall modal renders mythic achievements');
V6UI.openTimelineModal();
assert(elements['modal-body'].innerHTML.indexOf('timeline-tree') !== -1, 'Timeline tree modal rendered');

console.log('✓ V6 Cinematic UI boot, Menu, Stage, Map, Visual Shop, Hall & Timeline Tree smoke tests passed!');

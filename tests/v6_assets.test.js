'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var V6Assets = require('../js/v6/assets.js');

var rootDir = path.resolve(__dirname, '..');
var allPaths = V6Assets.getAllAssetPaths();

assert.strictEqual(Object.keys(V6Assets.SCENES).length, 6, 'Expected 6 scenes');
assert.strictEqual(Object.keys(V6Assets.CHARACTERS).length, 8, 'Expected 8 character portraits');
assert.strictEqual(Object.keys(V6Assets.ITEMS).length, 24, 'Expected 24 item cards');
assert.strictEqual(Object.keys(V6Assets.UI).length, 2, 'Expected 2 UI art assets');
assert.strictEqual(allPaths.length, 40, 'Expected 40 total registered visual assets');

var missing = [];
allPaths.forEach(function (relPath) {
  var fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    missing.push(relPath);
  } else {
    var stat = fs.statSync(fullPath);
    assert(stat.size > 5000, 'Asset looks unexpectedly tiny/empty: ' + relPath + ' (' + stat.size + ' bytes)');
  }
});

assert.deepStrictEqual(missing, [], 'Missing asset files on disk: ' + missing.join(', '));
console.log('✓ Verified all ' + allPaths.length + ' cohesive V6 visual assets exist on disk and are non-empty');

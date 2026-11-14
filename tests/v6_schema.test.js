'use strict';

var assert = require('assert');
var V6Schema = require('../js/v6/schema.js');

// 1. Identity & constants
assert.strictEqual(V6Schema.SCHEMA_VERSION, 6);
assert.strictEqual(V6Schema.GAME_TITLE, 'الظل التاه');
assert.strictEqual(Object.keys(V6Schema.FACTIONS).length, 4, 'Expected 4 human factions');
assert.strictEqual(Object.keys(V6Schema.WEAPON_TYPES).length, 4, 'Expected 4 weapon archetypes');
assert.strictEqual(Object.keys(V6Schema.CITIES).length, 5, 'Expected 5 core map cities');
assert.strictEqual(V6Schema.CHAPTERS[3].maxAge, 25, 'Timeline must run up to age 25');

// 2. Default state shape
var state = V6Schema.createDefaultV6State('hard');
assert.strictEqual(state.schemaVersion, 6);
assert.strictEqual(state.gameTitle, 'الظل التاه');
assert.strictEqual(state.timeline.age, 7);
assert.strictEqual(state.timeline.chapter, 1);
assert.strictEqual(state.stats.str, 3, 'Childhood base stat should be 3');
assert.strictEqual(state.vitals.hp, 41, 'Childhood starting HP on hard should be 41');
assert.strictEqual(state.loadout.potionSlots.length, 3);
assert.strictEqual(state.factions.joinedFaction, 'none');

// 3. Non-destructive v5 legacy bridge
var mockMem = {
  salil_anvil_endings_v1: JSON.stringify({ human_hero: true, truce_architect: true }),
  salil_anvil_settings_v1: JSON.stringify({ textSpeed: 'fast', soundEnabled: false }),
  salil_anvil_autosave_v1: JSON.stringify({ state: { age: 14 } })
};
var writeCalls = 0;
var mockStore = {
  getItem: function (k) { return mockMem[k] || null; },
  setItem: function () { writeCalls += 1; },
  removeItem: function () { writeCalls += 1; }
};

var bridge = V6Schema.readLegacyV5Bridge(mockStore);
assert.strictEqual(writeCalls, 0, 'Legacy bridge must be strictly read-only');
assert.strictEqual(bridge.hasLegacyData, true);
assert.strictEqual(bridge.legacyEndingsCount, 2);
assert.strictEqual(bridge.veteranBadge.id, 'v5_veteran_traveler');
assert.strictEqual(bridge.inheritedSettings.textSpeed, 'fast');
assert.strictEqual(bridge.inheritedSettings.soundEnabled, false);

console.log('✓ V6 Schema & non-destructive V5 legacy bridge tests passed');

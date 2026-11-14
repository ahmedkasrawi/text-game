'use strict';

var assert = require('assert');
var path = require('path');

// Ensure browser-like global shim
global.window = global;
global.localStorage = {
  _data: {},
  getItem: function (k) { return this._data[k] || null; },
  setItem: function (k, v) { this._data[k] = String(v); },
  removeItem: function (k) { delete this._data[k]; }
};

// Load modules in order
require('../js/v6/schema.js');
require('../js/v6/assets.js');
require('../js/data/v6/world.js');
require('../js/v6/world_time.js');
require('../js/data/v6/gear_shop.js');
require('../js/v6/combat.js');
require('../js/data/v6/characters_achievements.js');
require('../js/v6/characters_achievements.js');
require('../js/data/v6/events_ch1.js');
require('../js/v6/storage.js');
require('../js/v6/engine.js');

var GameApp = global.GameApp;
assert(GameApp, 'GameApp must exist');
assert(Array.isArray(GameApp.V6StoryEvents), 'GameApp.V6StoryEvents must be an array');
assert(GameApp.V6EventsCh1.length >= 20, 'Chapter 1 must have at least 20 events');

var ShopData = GameApp.V6ShopData;
var Assets = GameApp.V6Assets;
var World = GameApp.V6WorldData;

// 1. Verify Catalog Integrity
GameApp.V6EventsCh1.forEach(function (ev) {
  assert(ev.id, 'Event must have id');
  assert.strictEqual(ev.chapter, 1, 'Event ' + ev.id + ' must be chapter 1');
  assert(ev.title && typeof ev.title === 'string', 'Event ' + ev.id + ' must have title');
  assert(ev.body && typeof ev.body === 'string', 'Event ' + ev.id + ' must have body');
  assert(Array.isArray(ev.choices) && ev.choices.length >= 2, 'Event ' + ev.id + ' must have >= 2 choices');

  // Verify scene exists in asset catalog
  if (ev.sceneId) {
    assert(Assets.SCENES[ev.sceneId], 'Event ' + ev.id + ' references unknown sceneId: ' + ev.sceneId);
  }

  // Verify speaker exists in characters catalog or is protagonist
  if (ev.speakerId && ev.speakerId !== 'protagonist') {
    var charExists = GameApp.V6NarrativeMeta.MAIN_CHARACTERS[ev.speakerId] || GameApp.V6NarrativeMeta.TRANSIENT_NPCS[ev.speakerId];
    assert(charExists, 'Event ' + ev.id + ' references unknown speakerId: ' + ev.speakerId);
  }

  ev.choices.forEach(function (ch) {
    assert(ch.id, 'Choice in ' + ev.id + ' must have id');
    assert(ch.label, 'Choice ' + ch.id + ' in ' + ev.id + ' must have label');
    assert(ch.outcome, 'Choice ' + ch.id + ' in ' + ev.id + ' must have outcome');

    if (ch.encounterId) {
      assert(ShopData.ENCOUNTER_TEMPLATES[ch.encounterId], 'Choice ' + ch.id + ' references unknown encounter: ' + ch.encounterId);
    }
    if (ch.effects) {
      if (ch.effects.grantWeapon) {
        assert(ShopData.ITEMS[ch.effects.grantWeapon], 'Choice ' + ch.id + ' grants unknown weapon: ' + ch.effects.grantWeapon);
      }
      if (ch.effects.grantArmor) {
        assert(ShopData.ITEMS[ch.effects.grantArmor], 'Choice ' + ch.id + ' grants unknown armor: ' + ch.effects.grantArmor);
      }
      if (ch.effects.grantPotion) {
        assert(ShopData.ITEMS[ch.effects.grantPotion], 'Choice ' + ch.id + ' grants unknown potion: ' + ch.effects.grantPotion);
      }
      if (ch.effects.setLocation) {
        assert(World.CITIES[ch.effects.setLocation], 'Choice ' + ch.id + ' sets unknown location: ' + ch.effects.setLocation);
      }
    }
  });
});
console.log('✓ Verified Chapter 1 event catalog integrity (' + GameApp.V6EventsCh1.length + ' events verified)');

// 2. Playthrough Simulation A: Smithy / Legion Route
(function testSmithyRoute() {
  var init = GameApp.V6Engine.createNewGame('hard', false);
  var state = init.state;
  var ev = init.event;
  assert.strictEqual(state.timeline.chapter, 1);
  assert.strictEqual(state.timeline.age, 7);
  assert.strictEqual(state.timeline.turn, 1);
  assert.strictEqual(ev.id, 'v6_origin_awakening');

  // Choose Smithy origin
  var res = GameApp.V6Engine.chooseOption(state, ev, 'origin_smith', function () { return 0.5; });
  assert(res.ok);
  assert.strictEqual(state.progression.flags.origin_path, 'smithy');
  assert.strictEqual(res.nextEvent.id, 'v6_ch1_smithy_initiation');

  // Advance through 19 more turns of Chapter 1
  for (var t = 2; t <= 20; t++) {
    var curEv = GameApp.V6Engine.getNextEvent(state);
    assert(curEv, 'Must provide an event at turn ' + t);
    assert(curEv.choices.length > 0, 'Event ' + curEv.id + ' must have choices');

    // Pick first non-encounter choice for smooth automated progression
    var choice = curEv.choices[0];
    for (var c = 0; c < curEv.choices.length; c++) {
      if (!curEv.choices[c].encounterId) {
        choice = curEv.choices[c];
        break;
      }
    }

    var stepRes = GameApp.V6Engine.chooseOption(state, curEv, choice.id, function () { return 0.5; });
    assert(stepRes.ok, 'Choice ' + choice.id + ' must succeed at turn ' + t);
  }

  // At the end of 20 turns, state should be ready for Chapter 2
  assert.strictEqual(state.timeline.chapter, 2, 'Chapter must be 2 after 20 turns');
  assert.strictEqual(state.timeline.age, 12, 'Age must be 12 at beginning of Chapter 2');
  assert(state.stats.str >= 7, 'Strength should have grown from childhood: got ' + state.stats.str);
  assert(state.progression.timelineNodes.length >= 20, 'Timeline nodes should record 20 turn decisions');
  console.log('✓ Chapter 1 Smithy / Legion 20-turn simulation passed (STR=' + state.stats.str + ', LegionRep=' + state.factions.legion + ')');
})();

// 3. Playthrough Simulation B: Alley / Shadow Route
(function testAlleyRoute() {
  var init = GameApp.V6Engine.createNewGame('normal', false);
  var state = init.state;
  var ev = init.event;
  assert.strictEqual(ev.id, 'v6_origin_awakening');

  // Choose Alley origin
  var res = GameApp.V6Engine.chooseOption(state, ev, 'origin_alley', function () { return 0.5; });
  assert(res.ok);
  assert.strictEqual(state.progression.flags.origin_path, 'alley');
  assert.strictEqual(state.progression.flags.knows_underbelly, true);
  assert.strictEqual(res.nextEvent.id, 'v6_ch1_alley_initiation');

  for (var t = 2; t <= 20; t++) {
    var curEv = GameApp.V6Engine.getNextEvent(state);
    var choice = curEv.choices[0];
    for (var c = 0; c < curEv.choices.length; c++) {
      if (!curEv.choices[c].encounterId) {
        choice = curEv.choices[c];
        break;
      }
    }
    var stepRes = GameApp.V6Engine.chooseOption(state, curEv, choice.id, function () { return 0.5; });
    assert(stepRes.ok);
  }

  assert.strictEqual(state.timeline.chapter, 2);
  assert.strictEqual(state.timeline.age, 12);
  assert(state.factions.shadow > 0, 'Shadow faction reputation must be positive');
  console.log('✓ Chapter 1 Alley / Shadow 20-turn simulation passed');
})();

// 4. Playthrough Simulation C: Caravan / Merchant Route
(function testCaravanRoute() {
  var init = GameApp.V6Engine.createNewGame('hard', false);
  var state = init.state;
  var ev = init.event;

  var res = GameApp.V6Engine.chooseOption(state, ev, 'origin_caravan', function () { return 0.5; });
  assert(res.ok);
  assert.strictEqual(state.progression.flags.origin_path, 'caravan');
  assert(state.vitals.gold >= 18, 'Should start with bonus gold');

  for (var t = 2; t <= 20; t++) {
    var curEv = GameApp.V6Engine.getNextEvent(state);
    var choice = curEv.choices[0];
    for (var c = 0; c < curEv.choices.length; c++) {
      if (!curEv.choices[c].encounterId) {
        choice = curEv.choices[c];
        break;
      }
    }
    var stepRes = GameApp.V6Engine.chooseOption(state, curEv, choice.id, function () { return 0.5; });
    assert(stepRes.ok);
  }

  assert.strictEqual(state.timeline.chapter, 2);
  assert.strictEqual(state.timeline.age, 12);
  assert(state.skills.trade >= 1, 'Trade skill should be practiced');
  console.log('✓ Chapter 1 Caravan / Merchant 20-turn simulation passed');
})();

// 5. Playthrough Simulation D: Abbey / Inquisition Route with Tactical Encounter
(function testAbbeyRouteWithCombat() {
  var init = GameApp.V6Engine.createNewGame('hard', false);
  var state = init.state;
  var ev = init.event;

  var res = GameApp.V6Engine.chooseOption(state, ev, 'origin_abbey', function () { return 0.5; });
  assert(res.ok);
  assert.strictEqual(state.progression.flags.origin_path, 'abbey');

  // Verify that an encounter choice pauses turn advance and starts combat
  var wolfEv = GameApp.V6Engine.getEventById('v6_ch1_wolf_pack');
  assert(wolfEv, 'Must find wolf event');
  var encChoice = wolfEv.choices.filter(function (c) { return c.encounterId === 'frontier_wolf'; })[0];
  assert(encChoice, 'Must have frontier_wolf choice');

  var encRes = GameApp.V6Engine.chooseOption(state, wolfEv, encChoice.id, function () { return 0.5; });
  assert(encRes.ok);
  assert.strictEqual(encRes.startedEncounter, true);
  assert(encRes.encounter, 'Must return active encounter');
  assert.strictEqual(encRes.encounter.id, 'frontier_wolf');

  // Run encounter to victory with proper AP management
  var safetyCounter = 20;
  while (encRes.encounter.status === 'active' && safetyCounter-- > 0) {
    if (encRes.encounter.player.ap > 0) {
      GameApp.V6Combat.performEncounterAction(state, encRes.encounter, 'balanced_strike', null, function () { return 0.5; });
    } else {
      GameApp.V6Combat.performEncounterAction(state, encRes.encounter, 'end_round', null, function () { return 0.5; });
    }
  }
  assert.strictEqual(encRes.encounter.status, 'victory');

  // Finalize turn after encounter
  var fin = GameApp.V6Engine.finalizeTurnAfterChoice(state, 'انتصرت على الذئب!', function () { return 0.5; });
  assert(fin.ok);
  assert.strictEqual(state.timeline.turn, 3, 'Turn should advance from 2 to 3 after resolving combat encounter');
  console.log('✓ Chapter 1 Abbey route & tactical childhood encounter test passed');
})();

console.log('All Chapter 1 narrative, branching, and simulation tests passed successfully!');

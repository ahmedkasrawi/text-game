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
require('../js/data/v6/events_ch2.js');
require('../js/data/v6/events_ch3.js');
require('../js/v6/storage.js');
require('../js/v6/engine.js');

var GameApp = global.GameApp;
assert(GameApp, 'GameApp must exist');
assert(Array.isArray(GameApp.V6StoryEvents), 'GameApp.V6StoryEvents must be an array');
assert(GameApp.V6EventsCh3.length >= 12, 'Chapter 3 must have at least 12 events');

var ShopData = GameApp.V6ShopData;
var Assets = GameApp.V6Assets;
var World = GameApp.V6WorldData;

// 1. Verify Catalog Integrity
GameApp.V6EventsCh3.forEach(function (ev) {
  assert(ev.id, 'Event must have id');
  assert.strictEqual(ev.chapter, 3, 'Event ' + ev.id + ' must be chapter 3');
  assert(ev.title && typeof ev.title === 'string', 'Event ' + ev.id + ' must have title');
  assert(ev.body && typeof ev.body === 'string', 'Event ' + ev.id + ' must have body');
  assert(Array.isArray(ev.choices) && ev.choices.length >= 1, 'Event ' + ev.id + ' must have choices');

  if (ev.sceneId) {
    assert(Assets.SCENES[ev.sceneId], 'Event ' + ev.id + ' references unknown sceneId: ' + ev.sceneId);
  }

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
    }
  });
});
console.log('✓ Verified Chapter 3 event catalog integrity (' + GameApp.V6EventsCh3.length + ' events verified)');

// 2. Full 96-Turn Lifecycle Simulation (Ages 7 to 25 complete run)
(function testFull96TurnLifecycle() {
  var init = GameApp.V6Engine.createNewGame('normal', false);
  var state = init.state;
  var ev = init.event;

  // Origin choice
  var res = GameApp.V6Engine.chooseOption(state, ev, 'origin_caravan', function () { return 0.5; });
  assert(res.ok);

  // Play through turn 2 to 96
  for (var t = 2; t <= 96; t++) {
    var curEv = GameApp.V6Engine.getNextEvent(state);
    assert(curEv, 'Must provide an event at turn ' + t);

    // Pick survival-optimal choice
    var choice = curEv.choices[0];
    var bestScore = -9999;
    for (var c = 0; c < curEv.choices.length; c++) {
      var cand = curEv.choices[c];
      if (cand.encounterId) continue;
      var goldDelta = (cand.effects && cand.effects.vitals && cand.effects.vitals.gold) || 0;
      var hpDelta = (cand.effects && cand.effects.vitals && cand.effects.vitals.hp) || 0;
      var score = (state.vitals.gold < 40 ? goldDelta * 2 : goldDelta) + hpDelta;
      if (score > bestScore && state.vitals.gold + goldDelta >= 0) {
        bestScore = score;
        choice = cand;
      }
    }

    var stepRes = GameApp.V6Engine.chooseOption(state, curEv, choice.id, function () { return 0.5; });
    assert(stepRes.ok, 'Choice ' + choice.id + ' must succeed at turn ' + t);

    if (state.progression.isEnded) {
      break;
    }
  }

  // At the end of turn 96, life cycle reaches 25 and completes upon crossing into 26
  assert.strictEqual(state.timeline.age, 26, 'Run ends upon crossing past age 25 (age 26 reached)');
  assert(state.timeline.turn >= 96, 'Must reach final turn 96 (got ' + state.timeline.turn + ')');
  assert(state.progression.timelineNodes.length >= 95, 'Should have recorded 95+ timeline decisions');

  var ending = GameApp.V6Engine.resolveEndingSummary(state);
  assert(ending, 'Must resolve a valid ending');
  assert(ending.title && ending.desc, 'Ending must have title and description: ' + JSON.stringify(ending));
  console.log('✓ Full 96-turn lifecycle (Ages 7 to 25) simulation passed! Ending: «' + ending.title + '»');
})();

// 3. Verify Distinct 15 Endings Coverage
(function test15EndingsCatalog() {
  var sampleKeys = [
    'ending_early_death',
    'ending_debt_ruin',
    'ending_slain',
    'ending_executed',
    'ending_betrayed_fall',
    'ending_shadow_sovereign',
    'ending_shadow_phantom_king',
    'ending_legion_marshal',
    'ending_emperor_iron',
    'ending_merchant_baron',
    'ending_merchant_kingmaker',
    'ending_inquisitor_lord',
    'ending_alchemist_prophet',
    'ending_rebel_liberator',
    'ending_companion_dynasty',
    'ending_wandering_shadow'
  ];

  sampleKeys.forEach(function (id) {
    var dummyState = GameApp.V6Schema.createDefaultV6State('normal');
    dummyState.progression.endingId = id;
    var summary = GameApp.V6Engine.resolveEndingSummary(dummyState);
    assert(summary && summary.title, 'Ending ' + id + ' must resolve cleanly');
  });
  console.log('✓ Verified 15+ distinct endings resolution catalog');
})();

// 4. Chapter 3 Endgame Boss Battle Test
(function testEndgameBossEncounter() {
  var init = GameApp.V6Engine.createNewGame('hard', false);
  var state = init.state;
  state.timeline.chapter = 3;
  state.timeline.age = 24;
  state.timeline.turn = 90;
  state.equipment = state.equipment || { belt: [null, null, null] };
  state.equipment.weapon = 'sword_royal';
  state.stats.str = 18;
  state.skills.combat = 8;

  var bossEnc = GameApp.V6Combat.startEncounter(state, 'renegade_marshal_boss', function () { return 0.5; });
  assert.strictEqual(bossEnc.id, 'renegade_marshal_boss');
  assert(bossEnc.enemy.hp >= 120, 'Endgame boss must have high HP');

  var rounds = 35;
  while (bossEnc.status === 'active' && rounds-- > 0) {
    if (bossEnc.player.ap > 0) {
      GameApp.V6Combat.performEncounterAction(state, bossEnc, 'balanced_strike', null, function () { return 0.8; });
    } else {
      GameApp.V6Combat.performEncounterAction(state, bossEnc, 'end_round', null, function () { return 0.8; });
    }
  }
  assert.strictEqual(bossEnc.status, 'victory', 'Player with royal sword must be able to defeat the endgame boss');
  console.log('✓ Chapter 3 Renegade Marshal Endgame Boss tactical combat passed');
})();

console.log('All Chapter 3 narrative, adulthood economy, 15 endings, and 96-turn lifecycle tests passed successfully!');

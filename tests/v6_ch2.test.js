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
require('../js/v6/storage.js');
require('../js/v6/engine.js');

var GameApp = global.GameApp;
assert(GameApp, 'GameApp must exist');
assert(Array.isArray(GameApp.V6StoryEvents), 'GameApp.V6StoryEvents must be an array');
assert(GameApp.V6EventsCh2.length >= 15, 'Chapter 2 must have at least 15 events');

var ShopData = GameApp.V6ShopData;
var Assets = GameApp.V6Assets;
var World = GameApp.V6WorldData;

// 1. Verify Catalog Integrity
GameApp.V6EventsCh2.forEach(function (ev) {
  assert(ev.id, 'Event must have id');
  assert.strictEqual(ev.chapter, 2, 'Event ' + ev.id + ' must be chapter 2');
  assert(ev.title && typeof ev.title === 'string', 'Event ' + ev.id + ' must have title');
  assert(ev.body && typeof ev.body === 'string', 'Event ' + ev.id + ' must have body');
  assert(Array.isArray(ev.choices) && ev.choices.length >= 2, 'Event ' + ev.id + ' must have >= 2 choices');

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
      if (ch.effects.setLocation) {
        assert(World.CITIES[ch.effects.setLocation], 'Choice ' + ch.id + ' sets unknown location: ' + ch.effects.setLocation);
      }
    }
  });
});
console.log('✓ Verified Chapter 2 event catalog integrity (' + GameApp.V6EventsCh2.length + ' events verified)');

// 2. Playthrough Simulation: Complete 56-turn journey (Ch1 + Ch2: Ages 7 to 17)
(function testCh1AndCh2ContinuousRun() {
  var init = GameApp.V6Engine.createNewGame('hard', false);
  var state = init.state;
  var ev = init.event;

  // Origin choice
  var res = GameApp.V6Engine.chooseOption(state, ev, 'origin_smith', function () { return 0.5; });
  assert(res.ok);

  // Play through turn 2 to 56 (Ages 7 to 17)
  for (var t = 2; t <= 56; t++) {
    var curEv = GameApp.V6Engine.getNextEvent(state);
    assert(curEv, 'Must provide an event at turn ' + t);

    // Pick choices prioritizing survival and economic health in simulation
    var choice = curEv.choices[0];
    var bestScore = -9999;
    for (var c = 0; c < curEv.choices.length; c++) {
      var candidate = curEv.choices[c];
      if (candidate.encounterId) continue;
      var goldDelta = (candidate.effects && candidate.effects.vitals && candidate.effects.vitals.gold) || 0;
      var hpDelta = (candidate.effects && candidate.effects.vitals && candidate.effects.vitals.hp) || 0;
      var score = (state.vitals.gold < 40 ? goldDelta * 2 : goldDelta) + hpDelta;
      if (score > bestScore && state.vitals.gold + goldDelta >= 0) {
        bestScore = score;
        choice = candidate;
      }
    }

    var stepRes = GameApp.V6Engine.chooseOption(state, curEv, choice.id, function () { return 0.5; });
    if (!stepRes.ok) {
      console.error('Failed at turn ' + t + ' (Age ' + state.timeline.age + ', Ch ' + state.timeline.chapter + '): ' + stepRes.reason);
      console.error('State vitals:', state.vitals, 'isEnded:', state.progression.isEnded);
    }
    assert(stepRes.ok, 'Choice ' + choice.id + ' must succeed at turn ' + t);
  }

  // At the end of turn 56, the journey must transition to Chapter 3 (Adulthood, Age 18)
  assert.strictEqual(state.timeline.chapter, 3, 'Chapter must be 3 after 56 turns');
  assert.strictEqual(state.timeline.age, 18, 'Age must be 18 at start of Chapter 3');
  assert.strictEqual(state.timeline.turn, 57, 'Next turn should be 57');
  assert(state.progression.timelineNodes.length >= 56, 'Should have recorded 56 timeline decisions');
  console.log('✓ Continuous 56-turn simulation (Ages 7-17 across Ch1 & Ch2) passed! (Turn=57, Age=18, Chapter=3)');
})();

// 3. Faction Divergence Test in Chapter 2
(function testShadowDivergenceInCh2() {
  var init = GameApp.V6Engine.createNewGame('normal', false);
  var state = init.state;
  var ev = init.event;

  // Start with alley
  GameApp.V6Engine.chooseOption(state, ev, 'origin_alley', function () { return 0.5; });

  // Move directly to turn 21 in underbelly
  state.timeline.chapter = 2;
  state.timeline.age = 12;
  state.timeline.turn = 21;
  state.timeline.locationId = 'underbelly';

  var underbellyEv = GameApp.V6Engine.getEventById('v6_ch2_underbelly_arrival');
  assert(underbellyEv, 'Must find underbelly arrival event');

  var oathRes = GameApp.V6Engine.chooseOption(state, underbellyEv, 'und_take_shadow_oath', function () { return 0.5; });
  assert(oathRes.ok);
  assert.strictEqual(state.progression.flags.shadow_guild_initiate, true);
  assert(state.factions.shadow >= 20, 'Shadow reputation should increase');
  console.log('✓ Chapter 2 Shadow Guild initiation & faction divergence test passed');
})();

// 4. Mid-Tier Tactical Combat Test in Chapter 2
(function testChapter2Combat() {
  var init = GameApp.V6Engine.createNewGame('hard', false);
  var state = init.state;
  state.timeline.chapter = 2;
  state.timeline.age = 14;
  state.timeline.turn = 28;
  state.stats.str = 8;
  state.stats.agi = 7;
  state.skills.combat = 4;
  state.vitals.hp = 85;
  state.vitals.maxHp = 85;
  state.equipment = state.equipment || { belt: [null, null, null] };
  state.equipment.weapon = 'sword_steel';
  state.equipment.armor = 'armor_iron';

  var duelEv = GameApp.V6Engine.getEventById('v6_ch2_academy_drill');
  assert(duelEv, 'Must find academy drill event');

  var encChoice = duelEv.choices.filter(function (c) { return c.encounterId === 'royal_duelist'; })[0];
  assert(encChoice, 'Must have royal_duelist encounter choice');

  var encRes = GameApp.V6Engine.chooseOption(state, duelEv, encChoice.id, function () { return 0.5; });
  assert(encRes.ok);
  assert.strictEqual(encRes.startedEncounter, true);
  assert.strictEqual(encRes.encounter.id, 'royal_duelist');

  // Resolve tactical combat
  var rounds = 25;
  while (encRes.encounter.status === 'active' && rounds-- > 0) {
    if (encRes.encounter.player.ap > 0) {
      GameApp.V6Combat.performEncounterAction(state, encRes.encounter, 'balanced_strike', null, function () { return 0.8; });
    } else {
      GameApp.V6Combat.performEncounterAction(state, encRes.encounter, 'end_round', null, function () { return 0.8; });
    }
  }
  assert.strictEqual(encRes.encounter.status, 'victory');

  var fin = GameApp.V6Engine.finalizeTurnAfterChoice(state, 'هزمت مبارز الأكاديمية الملكية!', function () { return 0.5; });
  assert(fin.ok);
  console.log('✓ Chapter 2 Royal Duelist tactical combat test passed');
})();

console.log('All Chapter 2 narrative, cities, paths, and 56-turn transition tests passed successfully!');

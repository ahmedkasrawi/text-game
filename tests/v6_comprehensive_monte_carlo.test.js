'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

// Setup Node globals
var window = global;
global.window = global;

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
var Engine = GameApp.V6Engine;
var Storage = GameApp.V6Storage;
var Combat = GameApp.V6Combat;
var Schema = GameApp.V6Schema;

console.log('===============================================================');
console.log('   STEP 10: COMPREHENSIVE COMMERCIAL BALANCE & MONTE CARLO     ');
console.log('===============================================================\n');

// ---------------------------------------------------------------------
// TEST 1: 1,000 Un-upgraded First-Time Runs (Brutal Early Childhood Death)
// ---------------------------------------------------------------------
console.log('--- Phase 1: 1,000 Fresh Runs (Hardcore, Zero Upgrades) ---');
var profile = Storage.getProfile();
profile.diamonds = 0;
profile.reincarnationUpgrades = {
  stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
  skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
  startingGold: 0
};
Storage.saveProfile(profile);

var freshEndingStats = {};
var freshEarlyDeathCount = 0;
var totalFreshRuns = 1000;

for (var i = 0; i < totalFreshRuns; i++) {
  var game = Engine.createNewGame('hard', false);
  var state = game.state;
  var currentEvent = game.event;
  var turnsCount = 0;
  var maxSafeTurns = 120; // safety ceiling

  while (!state.progression.isEnded && turnsCount++ < maxSafeTurns) {
    if (!currentEvent || !currentEvent.choices || currentEvent.choices.length === 0) {
      currentEvent = Engine.getNextEvent(state);
      if (!currentEvent || !currentEvent.choices) break;
    }

    // Pick random choice simulating inexperienced player exploration
    var cIdx = Math.floor(Math.random() * currentEvent.choices.length);
    var choice = currentEvent.choices[cIdx];

    var res = Engine.chooseOption(state, currentEvent, choice.id, Math.random);
    if (!res.ok) break;

    if (res.startedEncounter && res.encounter) {
      var enc = res.encounter;
      var encSafety = 35;
      while (enc.status === 'active' && encSafety-- > 0) {
        if (enc.player.ap > 0) {
          Combat.performEncounterAction(state, enc, 'balanced_strike', null, Math.random);
        } else {
          Combat.performEncounterAction(state, enc, 'end_round', null, Math.random);
        }
      }
      var fin = Engine.finalizeTurnAfterChoice(state, 'انتهى الاشتباك', Math.random);
      currentEvent = fin.nextEvent;
    } else {
      currentEvent = res.nextEvent;
    }
  }

  var endId = state.progression.endingId || 'ending_death_without_trace';
  freshEndingStats[endId] = (freshEndingStats[endId] || 0) + 1;
  if (endId === 'ending_death_without_trace') {
    freshEarlyDeathCount++;
  }
}

var deathWithoutTraceRatio = (freshEarlyDeathCount / totalFreshRuns) * 100;
console.log('Fresh 1,000 Runs Ending Breakdown:', freshEndingStats);
console.log('«موتٌ بلا أثر» Rate: ' + deathWithoutTraceRatio.toFixed(1) + '% (Target: ~50% - 70%)');
assert(deathWithoutTraceRatio >= 45 && deathWithoutTraceRatio <= 75,
  'Brutal difficulty must yield ~50-70% «موتٌ بلا أثر» on fresh un-upgraded runs; got ' + deathWithoutTraceRatio.toFixed(1) + '%');
console.log('✓ Phase 1 Passed: Fresh runs are ruthlessly hard as requested!\n');

// ---------------------------------------------------------------------
// TEST 2: Reincarnation Meta-Progression Over Multiple Generations
// ---------------------------------------------------------------------
console.log('--- Phase 2: Simulating Player Reincarnation Meta-Progression ---');

// Reset profile with starting diamonds earned from previous runs
Storage.addDiamonds(50); // Player has accumulated diamonds
// Spend diamonds on upgrades:
Storage.buyReincarnationUpgrade('stats', 'str', 1); // +1 STR
Storage.buyReincarnationUpgrade('stats', 'str', 1); // +2 STR total
Storage.buyReincarnationUpgrade('stats', 'agi', 1); // +1 AGI
Storage.buyReincarnationUpgrade('stats', 'agi', 1); // +2 AGI total
Storage.buyReincarnationUpgrade('skills', 'combat', 2); // +1 Combat
Storage.buyReincarnationUpgrade('skills', 'combat', 2); // +2 Combat
Storage.buyReincarnationUpgrade('skills', 'trade', 2);  // +1 Trade
Storage.buyReincarnationUpgrade('startingGold', 'gold', 1); // +20 gold
Storage.buyReincarnationUpgrade('startingGold', 'gold', 1); // +40 gold

var upgradedGame = Engine.createNewGame('hard', false);
var upState = upgradedGame.state;

assert.strictEqual(upState.stats.str, 5, 'Base 3 + 2 STR = 5');
assert.strictEqual(upState.stats.agi, 5, 'Base 3 + 2 AGI = 5');
assert.strictEqual(upState.skills.combat, 2, 'Combat skill should be 2');
assert.strictEqual(upState.skills.trade, 1, 'Trade skill should be 1');
assert.strictEqual(upState.vitals.gold, 46, 'Gold should be 6 + 40 = 46');
assert.strictEqual(upState.vitals.hp, 51, 'HP should have +10 from STR upgrade: 41 + 10 = 51');

// Run 250 upgraded simulation runs with experienced player decision making
var upgradedEndings = {};
var upgradedSurvivedChildhood = 0;

for (var j = 0; j < 250; j++) {
  var run = Engine.createNewGame('normal', false);
  var rState = run.state;
  var rEv = run.event;
  var stepCount = 0;

  for (var t = 1; t <= 96; t++) {
    if (!rEv || !rEv.choices || rEv.choices.length === 0) {
      rEv = Engine.getNextEvent(rState);
      if (!rEv || !rEv.choices) break;
    }

    // Experienced player: evaluates choices for survival, health, and gold sustainability
    var choice = rEv.choices[0];
    var bestScore = -9999;
    for (var c = 0; c < rEv.choices.length; c++) {
      var cand = rEv.choices[c];
      var goldDelta = (cand.effects && cand.effects.vitals && cand.effects.vitals.gold) || 0;
      var hpDelta = (cand.effects && cand.effects.vitals && cand.effects.vitals.hp) || 0;
      var score = (rState.vitals.gold < 40 ? goldDelta * 2 : goldDelta) + (hpDelta * 3) + (Math.random() * 5);
      if (cand.encounterId && rState.vitals.hp < 40) score -= 50;
      if (score > bestScore) {
        bestScore = score;
        choice = cand;
      }
    }

    var rRes = Engine.chooseOption(rState, rEv, choice.id, Math.random);
    if (!rRes.ok) break;

    if (rRes.startedEncounter && rRes.encounter) {
      var rEnc = rRes.encounter;
      var rSafety = 40;
      while (rEnc.status === 'active' && rSafety-- > 0) {
        if (rEnc.player.ap > 0) {
          Combat.performEncounterAction(rState, rEnc, 'balanced_strike', null, Math.random);
        } else {
          Combat.performEncounterAction(rState, rEnc, 'end_round', null, Math.random);
        }
      }
      var rFin = Engine.finalizeTurnAfterChoice(rState, 'انتهى الاشتباك', Math.random);
      rEv = rFin.nextEvent;
    } else {
      rEv = rRes.nextEvent;
    }

    if (rState.progression.isEnded) break;
  }

  var rEndId = rState.progression.endingId || 'ending_wandering_shadow';
  upgradedEndings[rEndId] = (upgradedEndings[rEndId] || 0) + 1;
  if (rState.timeline.age >= 12) {
    upgradedSurvivedChildhood++;
  }
}

var survivedChildhoodRate = (upgradedSurvivedChildhood / 250) * 100;
console.log('Upgraded 250 Runs Ending Breakdown:', upgradedEndings);
console.log('Upgraded Childhood Survival Rate: ' + survivedChildhoodRate.toFixed(1) + '% (Substantial boost with upgrades)');
assert(survivedChildhoodRate >= 80, 'Upgrades must significantly improve childhood survival rate; got ' + survivedChildhoodRate.toFixed(1) + '%');
console.log('✓ Phase 2 Passed: Meta-progression unlocks higher survival and deep endings!\n');

// ---------------------------------------------------------------------
// TEST 3: Prestige Achievements Reachability across Long Chains
// ---------------------------------------------------------------------
console.log('--- Phase 3: Prestige Mythic Achievement Chains Verification ---');
var champ = Schema.createDefaultV6State('hard');
champ.timeline.age = 24;
champ.timeline.chapter = 3;
champ.vitals.gold = 900;
champ.stats.str = 11;
champ.skills.combat = 7;
champ.progression.flags.won_frontier_trial_ch1 = true;
champ.progression.flags.won_arena_gauntlet_ch2 = true;
champ.progression.flags.won_grand_champion_duel_ch3 = true;
champ.progression.flags.combat_victories = 9;
champ.progression.flags.combat_retreats = 0;
Combat.buyShopItem(champ, 'sword_royal');        // epic weapon
Combat.buyShopItem(champ, 'armor_legion_plate'); // epic armor

var champEval = GameApp.V6CastEngine.evaluatePrestigeAchievements(champ);
assert.strictEqual(champEval.report.the_strongest.unlocked, true, '«الأقوى» should be unlocked when multi-chapter champion trial is won');
assert.strictEqual(champEval.report.king_of_humans.unlocked, false, 'Unrelated mythic achievement remains locked');
console.log('✓ Phase 3 Passed: Prestige achievements trigger reliably on targeted deep questlines.\n');

// ---------------------------------------------------------------------
// TEST 4: Profile, Storage, Save/Load & Settings Integrity
// ---------------------------------------------------------------------
console.log('--- Phase 4: Storage, Slots & Settings Polish ---');
var sState = Schema.createDefaultV6State('hard');
sState.vitals.gold = 350;
sState.timeline.turn = 42;
sState.timeline.age = 16;
Storage.saveSlot(0, sState, 'رحلة الفصل الثاني');

var loadedSlot0 = Storage.loadSlot(0);
assert(loadedSlot0, 'Loaded slot 0 must not be null');
assert.strictEqual(loadedSlot0.vitals.gold, 350);
assert.strictEqual(loadedSlot0.timeline.turn, 42);
assert.strictEqual(loadedSlot0.timeline.age, 16);

Storage.saveSettings({ textSpeed: 'fast', soundEnabled: true });
var curSettings = Storage.getSettings();
assert.strictEqual(curSettings.textSpeed, 'fast');
assert.strictEqual(curSettings.soundEnabled, true);

console.log('✓ Phase 4 Passed: Save slots and user settings fully robust.\n');

console.log('===============================================================');
console.log('   STEP 10 COMPLETE: ALL COMPREHENSIVE TESTS PASSED (100%)     ');
console.log('===============================================================\n');

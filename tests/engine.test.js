'use strict';

var assert = require('assert');

// Load modules into global GameApp namespace just like browser <script defer> tags
require('../js/state.js');
require('../js/icons.js');
require('../js/storage.js');
require('../js/data/events_childhood.js');
require('../js/data/events_story.js');
require('../js/data/events_paths.js');
require('../js/data/shop.js');
require('../js/data/endings.js');
require('../js/engine.js');

var G = globalThis.GameApp;
var Engine = G.Engine;
var State = G.State;
var Storage = G.Storage;
var Endings = G.Endings;

function testDataIntegrity() {
  var all = Engine.getAllEvents();
  assert(all.length >= 65, 'Expected rich event library, got ' + all.length);

  var seenIds = {};
  all.forEach(function (ev) {
    assert(ev.id && !seenIds[ev.id], 'Duplicate or missing event id: ' + ev.id);
    seenIds[ev.id] = true;
    assert(ev.title && ev.text, 'Missing title/text on ' + ev.id);
    assert(Array.isArray(ev.choices) && ev.choices.length >= 2, 'Event needs >=2 choices: ' + ev.id);

    ev.choices.forEach(function (ch) {
      assert(ch.id && ch.label, 'Choice missing id/label in ' + ev.id);
      assert(ch.success && ch.success.text, 'Choice missing success text in ' + ev.id + '/' + ch.id);
      if (ch.check) {
        assert(ch.fail && ch.fail.text, 'Checked choice missing fail branch in ' + ev.id + '/' + ch.id);
      }
      // Verify no gold-spending choice is free at 0 gold
      var gSucc = ch.success && ch.success.effects && ch.success.effects.gold;
      if (typeof gSucc === 'number' && gSucc < 0) {
        assert(typeof ch.minGold === 'number' && ch.minGold >= Math.abs(gSucc), 'Missing/low minGold on ' + ev.id + '/' + ch.id);
      }
    });
  });

  // Verify every shop item has rarity and valid icon SVG
  G.ShopData.SHOP_ITEMS.forEach(function (it) {
    assert(State.RARITY_META[it.rarity], 'Shop item missing valid rarity: ' + it.id);
    assert(G.Icons.SVGS[it.iconKey], 'Shop item missing valid iconKey: ' + it.id);
  });

  console.log('✓ Data integrity, minGold safety, rarity, and SVG icons passed (' + all.length + ' unique events)');
}

function testTimelineAndIntelligence() {
  var state = Engine.startNewGame(function () { return 0.2; });
  assert.strictEqual(state.phase, 'childhood');
  assert.strictEqual(state.age, 7);
  assert.strictEqual(state.quarter, 1);
  assert.strictEqual(state.currentEventId, 'child_7_q1');

  // All 6 skills must start at 0 (undiscovered)
  Object.keys(state.skills).forEach(function (k) {
    assert.strictEqual(state.skills[k], 0, 'Skill should start at 0: ' + k);
  });
  assert.strictEqual(state.skills.shadow, 0, 'shadow skill must exist and start at 0');
  assert.strictEqual(state.skills.alchemy, 0, 'alchemy skill must exist and start at 0');
  assert.strictEqual(state.skills.sword_path, 0, 'sword_path skill must exist and start at 0');

  // Verify INT gating in child_7_q2 (requires minInt: 8)
  Engine.resolveChoice(state, 'forge_watch', function () { return 0.1; });
  assert.strictEqual(state.skills.smithing, 2, 'smithing learned after forge_watch');
  assert(state.lastOutcome.deltas.some(function (d) { return d.isNewSkill; }), 'First-time skill discovery should flag isNewSkill');
  Engine.advanceTurn(state, function () { return 0.1; });
  assert.strictEqual(state.currentEventId, 'child_7_q2');
  var evQ2 = Engine.findEventById('child_7_q2');
  var availLowInt = Engine.getAvailableChoices(state, evQ2);
  assert(!availLowInt.some(function (c) { return c.id === 'int_inspect_cargo'; }), 'INT 8 choice should be hidden at INT 6');

  // Raise INT to 8 and confirm it unlocks
  state.attributes.int = 8;
  var availHighInt = Engine.getAvailableChoices(state, evQ2);
  assert(availHighInt.some(function (c) { return c.id === 'int_inspect_cargo'; }), 'INT 8 choice should appear at INT 8');

  // Advance remaining 15 childhood turns to hit turn 17 = Age 11 Period 1
  for (var t = 2; t <= 16; t++) {
    var ev = Engine.findEventById(state.currentEventId);
    var choices = Engine.getAvailableChoices(state, ev).filter(function (c) {
      return Engine.canAffordChoice(state, c).ok;
    });
    Engine.resolveChoice(state, choices[0].id, function () { return 0.1; });
    Engine.advanceTurn(state, function () { return 0.1; });
  }

  assert.strictEqual(state.turnIndex, 17, 'Turn 17 should start youth phase');
  assert.strictEqual(state.phase, 'youth');
  assert.strictEqual(state.age, 11);
  assert.strictEqual(state.period, 1);
  assert.strictEqual(state.totalTurns, 64);
  assert.strictEqual(state.currentEventId, 'story_11_m1_career');
  assert(state.pendingShop, 'Age 10 end should trigger annual shop before Age 11');
  console.log('✓ Hidden starting skills (6), 64-turn timeline, and INT gating passed');
}

function testShopElixirsFactionsAndRarity() {
  var st = Engine.startNewGame();
  st.age = 8;
  st.quarter = 4;
  st.gold = 360;
  st.currentEventId = 'child_8_q4';
  Engine.resolveChoice(st, 'keep_coin', function () { return 0.5; });
  Engine.advanceTurn(st, function () { return 0.5; });

  assert.strictEqual(st.age, 9);
  assert.strictEqual(st.pendingShop, true, 'Annual shop should open after Age 8 Q4');
  assert.strictEqual(st.shopYear, 8);

  var buyHeal = Engine.buyShopItem(st, 'elixir_healing');
  assert(buyHeal.ok, 'Should buy healing elixir');
  assert.strictEqual(st.elixirs.healing, 1);

  var buyCharm = Engine.buyShopItem(st, 'acc_wood_charm');
  assert(buyCharm.ok, 'Should equip accessory charm');
  assert.strictEqual(st.gear.accessory, 'تميمة الخشب الحارس');
  assert.strictEqual(st.gear.accessoryRarity, 'uncommon');
  assert.strictEqual(st.ownedAccessories.length, 1);

  // Verify special faction weapon remains buyable even at equal weaponPower (power 7)
  st.age = 13;
  st.phase = 'youth';
  st.period = 2;
  st.shopYear = 13;
  st.factions.elves = 22;
  st.gear.weaponPower = 7;
  var elvenAvail = G.ShopData.getAvailableShopItems(st).some(function (e) { return e.item.id === 'wpn_elven_whisper'; });
  assert(elvenAvail, 'Elven whisper blade (allowSpecialBuy) should remain visible at equal weaponPower 7');

  // Verify trade discount scales past 15% (e.g. trade 30 -> 30% discount!)
  st.skills.trade = 30;
  var royalItem = G.ShopData.SHOP_ITEMS.filter(function (i) { return i.id === 'wpn_royal_blade'; })[0];
  var discounted = G.ShopData.getItemPrice(royalItem, st);
  assert(discounted < Math.round(165 * 0.85), 'Trade skill >= 30 should break old 15% cap, got ' + discounted);
  st.skills.trade = 0;

  // Verify Black Market at threat >= 55
  st.threat = 58;
  var itemsBM = G.ShopData.getAvailableShopItems(st);
  var healEntryBM = itemsBM.filter(function (e) { return e.item.id === 'elixir_healing'; })[0];
  assert(healEntryBM.finalPrice > 26, 'Black market at threat 55+ must charge higher price, got ' + healEntryBM.finalPrice);
  st.threat = 10;

  // Verify Faction dynamics: Demons gain hurts Humans & Family, while Elves gain does NOT hurt Humans!
  var humansBefore = st.factions.humans;
  var familyBefore = st.factions.family;
  st.currentEventId = 'story_12_m10_elven_envoy';
  Engine.resolveChoice(st, 'open_elven_channel', function () { return 0.5; });
  assert.strictEqual(st.factions.humans, humansBefore, 'Befriending Elves should NOT hurt Humans automatically');

  st.currentEventId = 'story_14_m2_war_outbreak';
  Engine.resolveChoice(st, 'align_demons', function () { return 0.5; });
  assert(st.factions.humans < humansBefore - 10, 'Aligning with Demons must severely hurt Humans');
  assert(st.factions.family < familyBefore, 'Aligning with Demons must mildly hurt Family');

  // Verify Trait mechanical bonus + Check cap 92%
  var evBanquet = Engine.findEventById('story_12_m3_guild_poison');
  var chKnock = evBanquet.choices.filter(function (c) { return c.id === 'knock_cup'; })[0];
  st.attributes.agi = 30;
  st.skills.shadow = 40;
  assert(Engine.getChoiceChance(st, chKnock, evBanquet) <= 92, 'Check chance must cap at 92%');

  // Verify Ending Age stays 18 (not 19!)
  st.age = 18;
  st.period = 6;
  st.phase = 'youth';
  st.awaitingNext = false;
  st.currentEventId = 'story_18_m12_climax';
  st.skills.smithing = 10;
  Engine.resolveChoice(st, 'climax_forge', function () { return 0.05; });
  Engine.advanceTurn(st, function () { return 0.05; });
  assert.strictEqual(st.phase, 'ended');
  assert.strictEqual(st.age, 18, 'Final ending age must stay 18 (not 19)');
  assert.strictEqual(st.endingId, 'ending_eternal_forge', 'climax_forge at smithing 10 must resolve to ending_eternal_forge');

  console.log('✓ Shop rarity, Black Market (55+), Trade scaling, Faction rules, 92% cap, and Age-18 ending passed');
}

function testSwordPathAndHardcoreDeath() {
  // Verify Sword Path ultra-rare unlock & combat boost
  var st = Engine.startNewGame();
  st.phase = 'youth';
  st.age = 15;
  st.period = 3;
  st.attributes.agi = 10;
  st.attributes.ins = 9;
  st.skills.combat = 8;
  st.flags.heardSwordMasterRumors = true;
  st.currentEventId = null;

  var ev = Engine.selectNextEvent(st, function () { return 0.5; });
  assert.strictEqual(ev.id, 'rare_sword_path_trial', 'Sword Path trial should unlock when rare prerequisites match');
  st.currentEventId = ev.id;
  var res = Engine.resolveChoice(st, 'accept_sword_trial', function () { return 0.01; });
  assert.strictEqual(res.status, 'success');
  assert.strictEqual(st.skills.sword_path, 2);
  assert(st.traits.indexOf('مبارز الصمت') !== -1);

  // Verify Hardcore death on heavy assassination failure
  var stDead = Engine.startNewGame();
  stDead.currentEventId = 'story_15_m3_silent_needle';
  stDead.phase = 'youth';
  stDead.age = 15;
  stDead.period = 2;
  stDead.hp = 25;
  var outcome = Engine.resolveChoice(stDead, 'fight_through', function () { return 0.999; });
  assert.strictEqual(outcome.status, 'fail');
  assert.strictEqual(stDead.hp, 0);
  assert.strictEqual(stDead.phase, 'ended');
  assert.strictEqual(stDead.endingId, 'ending_assassinated');
  console.log('✓ Ultra-rare Sword Path and Hardcore death verified');
}

function testStorageRoundTrip() {
  var st = Engine.startNewGame();
  st.gold = 333;
  Storage.saveToSlot(1, st);
  var loaded = Storage.loadFromSlot(1);
  assert(loaded && loaded.gold === 333, 'Slot save/load round-trip failed');
  Storage.deleteSlot(1);
  assert.strictEqual(Storage.loadFromSlot(1), null, 'Slot deletion failed');
  console.log('✓ Storage save/load/delete round-trip passed');
}

function runTargetedBuild(strategy) {
  var state = Engine.startNewGame();
  var guard = 0;

  while (state.phase !== 'ended' && guard < 150) {
    guard += 1;
    var ev = Engine.findEventById(state.currentEventId);
    assert(ev, 'Missing event at turn ' + state.turnIndex + ' age=' + state.age + ' career=' + state.career);

    var choices = Engine.getAvailableChoices(state, ev).filter(function (c) {
      return Engine.canAffordChoice(state, c).ok;
    });
    assert(choices.length > 0, 'No affordable choices in event ' + ev.id);

    var picked = null;
    if (strategy.preferredIds) {
      for (var i = 0; i < choices.length; i++) {
        if (strategy.preferredIds.indexOf(choices[i].id) !== -1) {
          picked = choices[i];
          break;
        }
      }
    }
    if (!picked && strategy.scoreFn) {
      var bestScore = -Infinity;
      choices.forEach(function (ch) {
        var sc = strategy.scoreFn(ch, state);
        if (sc > bestScore) {
          bestScore = sc;
          picked = ch;
        }
      });
    }
    if (!picked) {
      picked = choices[Math.floor(Math.random() * choices.length)];
    }

    var rng = strategy.forceFail ? function () { return 0.999; } : strategy.forceSuccess ? function () { return 0.05; } : Math.random;
    Engine.resolveChoice(state, picked.id, rng);
    if (state.phase === 'ended') break;
    Engine.advanceTurn(state, rng);
    if (state.pendingShop) Engine.closeShop(state);
  }

  assert.strictEqual(state.phase, 'ended', 'Run did not reach ended state');
  return state;
}

function testAllEndingsReachable() {
  var discovered = {};

  var strategies = [
    // Truce architect
    {
      forceSuccess: true,
      preferredIds: ['study_ledgers', 'int_inspect_cargo', 'int_study_seal', 'choose_merchant', 'int_forensics', 'int_silver_test', 'open_elven_channel', 'study_seal', 'align_neutral', 'int_double_evidence', 'commit_peace_or_shadow', 'deliver_peace_dossier', 'goal_peace', 'climax_truce'],
      scoreFn: function (c) { return (c.minInt ? 20 : 0) + (c.id.indexOf('study') !== -1 || c.id.indexOf('peace') !== -1 ? 10 : 0); }
    },
    // Crown champion
    {
      forceSuccess: true,
      preferredIds: ['mother_lessons', 'ask_guards', 'focus_combat', 'train_militia', 'choose_adventurer', 'rally_humans', 'stand_human_pride', 'align_humans', 'defend_walls', 'commit_humans', 'lead_charge', 'goal_honor', 'climax_crown']
    },
    // Eternal forge
    {
      forceSuccess: true,
      preferredIds: ['forge_watch', 'help_repair', 'focus_smithing', 'assist_forge', 'contest_forge', 'prep_smith', 'choose_smith', 'forge_personal', 'climax_forge'],
      scoreFn: function (c) { return c.id.indexOf('smith') !== -1 || c.id.indexOf('forge') !== -1 || c.id.indexOf('work_orders') !== -1 ? 10 : 0; }
    },
    // Elven guardian
    {
      forceSuccess: true,
      preferredIds: ['hide_elf', 'choose_adventurer', 'open_elven_channel', 'save_elves', 'align_elves', 'help_extinguish', 'commit_elves', 'climax_elves']
    },
    // Demon counselor
    {
      forceSuccess: true,
      preferredIds: ['keep_coin', 'choose_merchant', 'deal_demons', 'align_demons', 'trade_with_demons', 'parley_demon', 'commit_demons', 'climax_demons'],
      scoreFn: function (c) {
        var ef = c.success && c.success.effects;
        return (ef && ef.faction && ef.faction.demons ? ef.faction.demons * 5 : 0);
      }
    },
    // Shadow blade
    {
      forceSuccess: true,
      preferredIds: ['pick_lock', 'eavesdrop', 'choose_merchant', 'build_intel_net', 'outmaneuver_master', 'stealth_ambush_master', 'blackmail_valkor', 'climax_shadow'],
      scoreFn: function (c) { return c.id.indexOf('stealth') !== -1 || c.id.indexOf('shadow') !== -1 || c.id.indexOf('intel') !== -1 ? 10 : 0; }
    },
    // Trade emperor
    {
      forceSuccess: true,
      preferredIds: ['market_observe', 'barter_coal', 'winter_trade', 'contest_trade', 'prep_merchant', 'choose_merchant', 'auction_alloy', 'supply_war_empire', 'climax_trade'],
      scoreFn: function (c) { return c.id.indexOf('caravan') !== -1 || c.id.indexOf('trade') !== -1 || c.id.indexOf('hoard') !== -1 || c.id.indexOf('join_cartel') !== -1 ? 10 : 0; }
    },
    // Wandering heir
    {
      forceSuccess: true,
      preferredIds: ['ask_mother_honest', 'smuggle_escape', 'goal_freedom', 'climax_escape_family']
    },
    // Early death: fallen
    {
      forceFail: true,
      preferredIds: ['give_parents', 'leave_fast', 'evade_call_guards', 'choose_adventurer', 'ignore_focus', 'outsmart_smoke', 'align_humans', 'defend_walls', 'accept_honor_duel', 'lead_charge'],
      scoreFn: function (c) {
        if (c.success && c.success.effects && (c.success.effects.hp || 0) > 0) return -50;
        if (c.fail && c.fail.effects && (c.fail.effects.hp || 0) < 0) return 50 - c.fail.effects.hp;
        return c.check ? 20 : 0;
      }
    },
    // Early death: assassinated
    {
      forceFail: true,
      preferredIds: ['eavesdrop', 'sell_collector', 'report_elf', 'choose_merchant', 'deal_demons', 'align_demons', 'auction_alloy', 'blackmail_valkor', 'dodge_cover', 'spot_forgery', 'counter_grapple', 'fight_through', 'finish_vendetta_combat'],
      scoreFn: function (c, s) {
        if (c.success && c.success.effects && (c.success.effects.hp || 0) > 0) return -50;
        if (c.success && c.success.effects && (c.success.effects.threat || 0) > 0) return 50;
        if (s.threat >= 50 && c.fail && c.fail.effects && (c.fail.effects.hp || 0) < 0) return 45 - c.fail.effects.hp;
        return !c.check ? 20 : 0;
      }
    }
  ];

  strategies.forEach(function (strat) {
    var finalSt = runTargetedBuild(strat);
    discovered[finalSt.endingId] = (discovered[finalSt.endingId] || 0) + 1;
  });

  // 500 random playthroughs under real Hardcore RNG!
  var randomDeaths = 0;
  for (var i = 0; i < 500; i++) {
    var st = runTargetedBuild({});
    discovered[st.endingId] = (discovered[st.endingId] || 0) + 1;
    if (st.endingId === 'ending_fallen' || st.endingId === 'ending_assassinated') randomDeaths++;
  }

  console.log('✓ 510 full playthrough simulations completed with ZERO deadlocks! (Random Hardcore deaths: ' + randomDeaths + '/500 = ' + ((randomDeaths / 500) * 100).toFixed(1) + '%)');
  console.log('  Ending distribution:', discovered);

  var allEndingIds = Endings.getEndingList().map(function (e) { return e.id; });
  allEndingIds.forEach(function (eid) {
    assert(discovered[eid] > 0, 'Ending was never reached in simulation: ' + eid);
  });
  console.log('✓ All ' + allEndingIds.length + ' endings verified reachable!');
}

testDataIntegrity();
testTimelineAndIntelligence();
testShopElixirsFactionsAndRarity();
testSwordPathAndHardcoreDeath();
testStorageRoundTrip();
testAllEndingsReachable();
console.log('\nALL ENGINE TESTS PASSED SUCCESSFULLY!');

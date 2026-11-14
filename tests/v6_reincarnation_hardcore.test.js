'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

// Setup Node globals for game scripts
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
assert(GameApp, 'GameApp must exist');
var Engine = GameApp.V6Engine;
var Storage = GameApp.V6Storage;
var Schema = GameApp.V6Schema;

// 1. Verify HTML & UI layout: Inn Rest removed, Reincarnation shop added
(function testHtmlLayout() {
  var htmlPath = path.join(__dirname, '..', 'index.html');
  var html = fs.readFileSync(htmlPath, 'utf8');

  assert(!html.includes('id="btn-rest-inn"'), 'Inn Rest button (btn-rest-inn) must be completely removed');
  assert(html.includes('id="btn-menu-reincarnation"'), 'Main menu must include Reincarnation shop button');
  assert(html.includes('id="btn-end-reincarnation"'), 'Ending panel must include Reincarnation shop button');
  assert(html.includes('id="ending-diamonds-box"'), 'Ending panel must include diamond display box');

  console.log('✓ HTML Layout verification: btn-rest-inn removed, Reincarnation buttons & diamond box verified');
})();

// 2. Choice hint privacy test: No consequence prediction rendered on buttons
(function testChoicePrivacy() {
  var uiCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'v6', 'ui.js'), 'utf8');

  // Verify choicesEl does not render c.hint inside choice-btn
  assert(!uiCode.includes("'<span class=\"choice-hint\">' + esc(c.hint) + '</span>'"),
    'Choice hints must NOT be rendered on choice buttons before selection');

  // Verify consequences appear in formatConsequenceNote and chooseOption outcome
  var testEffects = {
    stats: { str: 1, agi: 1 },
    skills: { combat: 1 },
    vitals: { hp: -10, stamina: -15 }
  };
  var note = Engine.formatConsequenceNote(testEffects);
  assert(note.includes('+1 قوة'), 'Consequence note must show +1 قوة');
  assert(note.includes('+1 قتال'), 'Consequence note must show +1 قتال');
  assert(note.includes('-15 جهد'), 'Consequence note must show -15 جهد');
  assert(note.includes('-10 صحة'), 'Consequence note must show -10 صحة');

  console.log('✓ Choice consequence privacy verified: predictions hidden on buttons, revealed only in outcome text');
})();

// 3. Ruthless starting stats & «موتٌ بلا أثر» ending test
(function testBrutalDifficultyAndTraceLessDeath() {
  var state = Schema.createDefaultV6State('hard');
  assert.strictEqual(state.stats.str, 3, 'Child starting strength must be 3 (fragile)');
  assert.strictEqual(state.stats.agi, 3, 'Child starting agility must be 3');
  assert.strictEqual(state.stats.int, 3, 'Child starting intelligence must be 3');
  assert.strictEqual(state.stats.ins, 3, 'Child starting insight must be 3');
  assert.strictEqual(state.stats.cha, 3, 'Child starting charisma must be 3');
  assert.strictEqual(state.vitals.hp, 41, 'Starting HP on hard difficulty must be 41');
  assert.strictEqual(state.vitals.gold, 6, 'Starting gold must be 6 (poverty)');

  // Early childhood death (hp <= 0 in Ch1) triggers «موتٌ بلا أثر»
  state.vitals.hp = 0;
  var ending = Engine.resolveEndingSummary(state);
  assert.strictEqual(ending.id, 'ending_death_without_trace', 'Early childhood death must trigger ending_death_without_trace');
  assert.strictEqual(ending.title, 'موتٌ بلا أثر');
  assert(ending.desc.includes('سقط جسدك النحيل في صمتٍ موحش'));

  console.log('✓ Brutal child stats & «موتٌ بلا أثر» ending verified');
})();

// 4. Diamond reward scaling test
(function testDiamondRewardScaling() {
  var s = Schema.createDefaultV6State('hard');

  // Death without trace before age 10 gives 0 diamonds
  s.timeline.age = 8;
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_death_without_trace'), 0,
    'Death without trace before age 10 must grant 0 diamonds');

  // Death without trace at or after age 10 gives 1 diamond
  s.timeline.age = 10;
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_death_without_trace'), 1,
    'Death without trace at age 10 must grant 1 diamond');
  s.timeline.age = 11;
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_death_without_trace'), 1,
    'Death without trace at age 11 must grant 1 diamond');

  // Mid-game early death (slain/debt ruin/executed)
  s.timeline.age = 14;
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_slain'), 2, 'Chapter 2 death gives 2 diamonds');
  s.timeline.age = 19;
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_slain'), 4, 'Adulthood death gives 4 diamonds');

  // Standard endings
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_wandering_shadow'), 8, 'Wandering Shadow grants 8 diamonds');
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_rebel_liberator'), 8, 'Rebel Liberator grants 8 diamonds');

  // Faction lord endings
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_legion_marshal'), 12, 'Legion Marshal grants 12 diamonds');
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_shadow_sovereign'), 12, 'Shadow Sovereign grants 12 diamonds');

  // Mythic prestige endings
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_emperor_iron'), 18, 'Iron Emperor grants 18 diamonds');
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_alchemist_prophet'), 18, 'Alchemist Prophet grants 18 diamonds');
  assert.strictEqual(Engine.computeDiamondsReward(s, 'ending_companion_dynasty'), 18, 'Companion Dynasty grants 18 diamonds');

  console.log('✓ Diamond reward tier scaling rules (0, 1, 2, 4, 8, 12, 18) verified');
})();

// 5. Reincarnation Soul Shop purchases, persistence, and reset test
(function testReincarnationShop() {
  // Clear profile for clean test
  var profile = Storage.getProfile();
  profile.diamonds = 0;
  profile.reincarnationUpgrades = {
    stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
    skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
    startingGold: 0
  };
  Storage.saveProfile(profile);

  // Add 10 diamonds
  Storage.addDiamonds(10);
  assert.strictEqual(Storage.getProfile().diamonds, 10);

  // 1. Buy 1 stat point (Cost: 1 diamond)
  var bStat = Storage.buyReincarnationUpgrade('stats', 'str', 1);
  assert(bStat.ok, 'Buying +1 STR for 1 diamond should succeed');
  assert.strictEqual(Storage.getProfile().diamonds, 9);
  assert.strictEqual(Storage.getProfile().reincarnationUpgrades.stats.str, 1);

  // 2. Buy 1 skill point (Cost: 2 diamonds)
  var bSkill = Storage.buyReincarnationUpgrade('skills', 'combat', 2);
  assert(bSkill.ok, 'Buying +1 Combat for 2 diamonds should succeed');
  assert.strictEqual(Storage.getProfile().diamonds, 7);
  assert.strictEqual(Storage.getProfile().reincarnationUpgrades.skills.combat, 1);

  // 3. Buy starting gold (Cost: 1 diamond)
  var bGold = Storage.buyReincarnationUpgrade('startingGold', 'gold', 1);
  assert(bGold.ok, 'Buying starting gold for 1 diamond should succeed');
  assert.strictEqual(Storage.getProfile().diamonds, 6);
  assert.strictEqual(Storage.getProfile().reincarnationUpgrades.startingGold, 20);

  // 4. Start a new game and verify persistent upgrades are applied
  var game = Engine.createNewGame('hard', false);
  var st = game.state;
  assert.strictEqual(st.stats.str, 4, 'Strength should be 3 + 1 = 4');
  assert.strictEqual(st.skills.combat, 1, 'Combat skill should be 0 + 1 = 1');
  assert.strictEqual(st.vitals.gold, 26, 'Gold should be 6 + 20 = 26');
  assert.strictEqual(st.vitals.hp, 46, 'HP should have +5 bonus from STR upgrade: 41 + 5 = 46');

  // 5. Reset reincarnation upgrades: 100% diamond refund
  var resetRes = Storage.resetReincarnationUpgrades();
  assert(resetRes.ok);
  assert.strictEqual(resetRes.refunded, 4, 'Should refund 1 (STR) + 2 (Combat) + 1 (Gold) = 4 diamonds');
  assert.strictEqual(Storage.getProfile().diamonds, 10, 'Diamonds should be fully refunded to 10');
  assert.strictEqual(Storage.getProfile().reincarnationUpgrades.stats.str, 0);
  assert.strictEqual(Storage.getProfile().reincarnationUpgrades.skills.combat, 0);
  assert.strictEqual(Storage.getProfile().reincarnationUpgrades.startingGold, 0);

  // Clean new game without upgrades returns to base stats
  var cleanGame = Engine.createNewGame('hard', false);
  assert.strictEqual(cleanGame.state.stats.str, 3);
  assert.strictEqual(cleanGame.state.skills.combat, 0);
  assert.strictEqual(cleanGame.state.vitals.gold, 6);

  console.log('✓ Reincarnation Soul Shop purchases, stat/skill/gold application, and 100% refund reset verified');
})();

console.log('\n======================================================');
console.log('ALL REINCARNATION & HARDCORE BALANCE TESTS PASSED (100%)');
console.log('======================================================\n');

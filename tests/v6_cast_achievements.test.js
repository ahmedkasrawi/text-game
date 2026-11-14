'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

global.GameApp = {};
require('../js/v6/schema.js');
require('../js/v6/assets.js');
require('../js/data/v6/world.js');
require('../js/v6/world_time.js');
require('../js/data/v6/gear_shop.js');
require('../js/v6/combat.js');
var NarrativeMeta = require('../js/data/v6/characters_achievements.js');
var Cast = require('../js/v6/characters_achievements.js');
var Schema = global.GameApp.V6Schema;
var Combat = global.GameApp.V6Combat;

var rootDir = path.resolve(__dirname, '..');

// 1. All 7 main characters & 6 transient NPCs exist and portraits resolve to disk
var charIds = Object.keys(NarrativeMeta.MAIN_CHARACTERS);
assert.strictEqual(charIds.length, 7, 'Expected 7 main NPCs');
charIds.forEach(function (cid) {
  var c = NarrativeMeta.MAIN_CHARACTERS[cid];
  assert(fs.existsSync(path.join(rootDir, c.portrait)), 'Missing portrait for ' + cid);
});
assert.strictEqual(Object.keys(NarrativeMeta.TRANSIENT_NPCS).length, 6, 'Expected 6 conditional transient NPCs');
assert.strictEqual(Object.keys(NarrativeMeta.PRESTIGE_ACHIEVEMENTS).length, 5, 'Expected 5 mythic/legendary prestige achievements');

// 2. Relationship 3-axis progression, active companion, and Ch3 romance/partnership
var state = Schema.createDefaultV6State('hard');
Cast.initCharactersState(state);
assert.strictEqual(Cast.setActiveCompanion(state, 'lyra_shadow').ok, false, 'Cannot recruit unmet companion');

Cast.meetCharacter(state, 'lyra_shadow', { loyalty: 20, trust: 15 });
var recruit = Cast.setActiveCompanion(state, 'lyra_shadow');
assert.strictEqual(recruit.ok, true);
assert.strictEqual(state.economy.retinueUpkeep, 8, 'Recruiting Lyra adds 8g seasonal upkeep');
assert.strictEqual(Cast.getCompanionModifiers(state).stealth, 2);

state.timeline.chapter = 3;
state.timeline.age = 20;
Cast.shiftRelationship(state, 'lyra_shadow', { loyalty: 50, trust: 50, questStage: 3 });
assert.strictEqual(state.characters.roster.lyra_shadow.romance, true);
assert.strictEqual(state.characters.roster.lyra_shadow.relationshipStage, 'partner');

// 3. Betrayal removes companion, breaks romance, and locks stage
state.progression.flags.sold_shadow_secrets = true;
var betrayRes = Cast.shiftRelationship(state, 'lyra_shadow', { loyalty: -100 });
assert.strictEqual(betrayRes.betrayedNow, true);
assert.strictEqual(state.characters.roster.lyra_shadow.betrayed, true);
assert.strictEqual(state.characters.roster.lyra_shadow.romance, false);
assert.strictEqual(state.characters.companionId, null, 'Betrayal must auto-dismiss companion');
assert.strictEqual(state.economy.retinueUpkeep, 0);

// 4. Transient NPCs (passing vs meaningful interaction)
Cast.recordTransientEncounter(state, 'alley_courier', false);
assert.strictEqual(state.characters.encounteredTransient.alley_courier.meaningful, false);
Cast.recordTransientEncounter(state, 'blind_scribe', 'found_royal_cipher');
assert.strictEqual(state.progression.flags.found_royal_cipher, true);

// 5. Prestige Achievements: normal playthrough gets 0; full multi-chapter chain unlocks "الأقوى"
var casual = Schema.createDefaultV6State('normal');
casual.timeline.age = 25;
casual.skills.combat = 4;
var casualEval = Cast.evaluatePrestigeAchievements(casual);
assert.strictEqual(casualEval.newlyUnlocked.length, 0, 'Casual playthrough must NOT unlock mythic achievements');

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

var champEval = Cast.evaluatePrestigeAchievements(champ);
assert.strictEqual(champEval.newlyUnlocked.length, 1);
assert.strictEqual(champEval.newlyUnlocked[0].id, 'the_strongest');
assert.strictEqual(champEval.report.king_of_humans.unlocked, false, 'Unrelated mythic achievement remains locked');

console.log('✓ V6 Cast (7 Main + 6 Transient NPCs), Companion Upkeep, Betrayal/Romance & 5 Mythic Prestige Achievements tests passed!');

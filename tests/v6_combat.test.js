'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

global.GameApp = {};
require('../js/v6/schema.js');
require('../js/v6/assets.js');
require('../js/data/v6/world.js');
require('../js/v6/world_time.js');
var ShopData = require('../js/data/v6/gear_shop.js');
var Combat = require('../js/v6/combat.js');
var Schema = global.GameApp.V6Schema;

var rootDir = path.resolve(__dirname, '..');

// 1. All 24 shop items exist & map to real images on disk
var itemIds = Object.keys(ShopData.ITEMS);
assert.strictEqual(itemIds.length, 24, 'Expected 24 V6 shop items');
itemIds.forEach(function (id) {
  var item = ShopData.ITEMS[id];
  assert(item.image && fs.existsSync(path.join(rootDir, item.image)), 'Missing item image for ' + id + ': ' + item.image);
});

// 2. Shop buying, black market gate, signet + trade discounts, and potion belt
var buyer = Schema.createDefaultV6State('hard');
buyer.timeline.age = 17;
buyer.timeline.chapter = 2;
buyer.timeline.locationId = 'royal_capital';
buyer.vitals.gold = 600;
buyer.skills.trade = 4;

// Black market bow must fail in Royal Capital with 0 suspicion
assert.strictEqual(Combat.canBuyShopItem(buyer, 'bow_assassin').ok, false);
buyer.timeline.locationId = 'underbelly';
assert.strictEqual(Combat.canBuyShopItem(buyer, 'bow_assassin').ok, true);

var signetCostBefore = Combat.getItemPrice(buyer, 'acc_signet');
var buySignet = Combat.buyShopItem(buyer, 'acc_signet');
assert.strictEqual(buySignet.ok, true);
assert.strictEqual(buyer.loadout.accessoryId, 'acc_signet');
// Signet discount lowers future prices
var poisonAfter = Combat.getItemPrice(buyer, 'potion_poison');
assert(poisonAfter < ShopData.ITEMS.potion_poison.price, 'Trade + signet should discount shop prices');

// 3. Test Bow (preemptive Round-0 opening shot)
var archer = Schema.createDefaultV6State('normal');
archer.timeline.age = 15;
archer.timeline.locationId = 'underbelly';
archer.vitals.gold = 500;
Combat.buyShopItem(archer, 'bow_recurve');
var bowEnc = Combat.startEncounter(archer, 'alley_cutthroat', function () { return 0.1; });
assert(bowEnc.enemy.hp < bowEnc.enemy.maxHp, 'Bow must deal preemptive Round-0 damage before player acts');
assert(bowEnc.enemy.bleedTicks > 0, 'Recurve bow opening shot should inflict bleed');

// 4. Test Axe (poise shatter & enemy stagger)
var axeman = Schema.createDefaultV6State('normal');
axeman.timeline.age = 16;
axeman.vitals.gold = 500;
axeman.stats.str = 9;
Combat.buyShopItem(axeman, 'axe_war');
var axeEnc = Combat.startEncounter(axeman, 'armored_deserter', function () { return 0.9; });
Combat.performEncounterAction(axeman, axeEnc, 'heavy_break', null, function () { return 0.9; });
assert(axeEnc.enemy.poise < axeEnc.enemy.maxPoise, 'Axe heavy_break must shred enemy poise');

// 5. Test Spear (guard_counter automatic riposte)
var lancer = Schema.createDefaultV6State('normal');
lancer.timeline.age = 16;
lancer.vitals.gold = 500;
Combat.buyShopItem(lancer, 'spear_knight');
var spearEnc = Combat.startEncounter(lancer, {
  id: 'duel_test', mode: 'combat', name: 'مبارز تجريبي', hp: 50, poise: 15, attack: 12,
  pattern: ['quick_slash']
}, function () { return 0.9; });
var hpBeforeEnemyTurn = spearEnc.enemy.hp;
Combat.performEncounterAction(lancer, spearEnc, 'guard_counter', null, function () { return 0.9; });
Combat.performEncounterAction(lancer, spearEnc, 'end_round', null, function () { return 0.9; });
assert(spearEnc.enemy.hp < hpBeforeEnemyTurn, 'Spear guard_counter must riposte when enemy strikes');

// 6. Test Sword combo + Potions in battle (poison coat & stamina AP)
var swordsman = Schema.createDefaultV6State('normal');
swordsman.timeline.age = 16;
swordsman.timeline.locationId = 'underbelly';
swordsman.vitals.gold = 500;
Combat.buyShopItem(swordsman, 'sword_steel');
Combat.buyShopItem(swordsman, 'potion_poison');
Combat.buyShopItem(swordsman, 'potion_stamina');
var swEnc = Combat.startEncounter(swordsman, 'alley_cutthroat', function () { return 0.9; });
Combat.performEncounterAction(swordsman, swEnc, 'use_potion', { slotIdx: 0 }, function () { return 0.9; });
assert(swEnc.player.poisonCoatRounds > 0, 'Poison potion must coat weapon');
Combat.performEncounterAction(swordsman, swEnc, 'use_potion', { slotIdx: 1 }, function () { return 0.9; });
assert(swEnc.player.ap >= 1, 'Stamina potion grants bonus AP mid-round');
Combat.performEncounterAction(swordsman, swEnc, 'balanced_strike', null, function () { return 0.9; });
assert(swEnc.enemy.poisonTicks > 0, 'Coated sword strike must poison enemy');

// 7. Test Debate Mode (Inquisition trial)
var scholar = Schema.createDefaultV6State('normal');
scholar.timeline.age = 18;
scholar.vitals.gold = 400;
scholar.stats.int = 10;
scholar.stats.cha = 9;
scholar.skills.politics = 4;
Combat.buyShopItem(scholar, 'acc_signet');
var debEnc = Combat.startEncounter(scholar, 'inquisition_trial', function () { return 0.9; });
assert.strictEqual(debEnc.mode, 'debate');
var rounds = 0;
while (debEnc.status === 'active' && rounds < 15) {
  rounds += 1;
  Combat.performEncounterAction(scholar, debEnc, 'balanced_strike', null, function () { return 0.9; });
}
assert.strictEqual(debEnc.status, 'victory', 'High-INT/Politics scholar should win Inquisition debate');

// 8. Test Non-lethal defeat -> Scar vs Nightmare defeat -> Death
var victim = Schema.createDefaultV6State('hard');
victim.vitals.hp = 5;
victim.vitals.gold = 40;
var lossEnc = Combat.startEncounter(victim, {
  id: 'scar_test', mode: 'combat', name: 'لص قاسٍ', hp: 100, poise: 20, attack: 35,
  lethal: false, scarOnDefeat: 'scar_eye', pattern: ['heavy_strike']
}, function () { return 0.9; });
Combat.performEncounterAction(victim, lossEnc, 'end_round', null, function () { return 0.9; });
assert.strictEqual(lossEnc.status, 'defeat');
assert.strictEqual(lossEnc.survivedWithScar, true);
assert(victim.scars.indexOf('scar_eye') !== -1, 'Surviving defeat must leave permanent scar');
assert(!victim.progression.isEnded, 'Non-lethal defeat on Hard keeps run alive with scar');

var nmVictim = Schema.createDefaultV6State('nightmare');
nmVictim.vitals.hp = 5;
var fatalEnc = Combat.startEncounter(nmVictim, {
  id: 'fatal_test', mode: 'combat', name: 'جلاد كابوسي', hp: 100, poise: 20, attack: 35,
  lethal: false, scarOnDefeat: 'scar_eye', pattern: ['heavy_strike']
}, function () { return 0.9; });
Combat.performEncounterAction(nmVictim, fatalEnc, 'end_round', null, function () { return 0.9; });
assert.strictEqual(nmVictim.progression.isEnded, true, 'Nightmare defeat must be fatal');

console.log('✓ V6 Tactical Combat (Sword/Axe/Spear/Bow), Debate Mode, Potions, Black Market & Permanent Scars tests passed!');

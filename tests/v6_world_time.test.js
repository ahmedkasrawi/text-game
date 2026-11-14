'use strict';

var assert = require('assert');

global.GameApp = {};
require('../js/v6/schema.js');
require('../js/data/v6/world.js');
var WorldTime = require('../js/v6/world_time.js');
var Schema = global.GameApp.V6Schema;

// 1. Exact 96-turn timeline across ages 7..25 (Chapter 1: 20, Chapter 2: 36, Chapter 3: 40)
var state = Schema.createDefaultV6State('normal');
state.vitals.gold = 2000; // fund living costs across all 96 turns
var seenCh2AtAge = null;
var seenCh3AtAge = null;
var turnsPlayed = 0;

while (!state.progression.isEnded) {
  turnsPlayed += 1;
  var step = WorldTime.advanceTurn(state, function () { return 0.99; });
  if (step.chapterChanged && step.chapter === 2) seenCh2AtAge = step.age;
  if (step.chapterChanged && step.chapter === 3) seenCh3AtAge = step.age;
  if (turnsPlayed > 120) assert.fail('Timeline exceeded safety cap');
}

assert.strictEqual(turnsPlayed, 96, 'Total lifespan turns from age 7 to 25 must equal 96');
assert.strictEqual(seenCh2AtAge, 12, 'Chapter 2 must begin cleanly at age 12');
assert.strictEqual(seenCh3AtAge, 18, 'Chapter 3 must begin cleanly at age 18');
assert.strictEqual(state.timeline.age, 26, 'Run ends immediately upon crossing past age 25');

// 2. City gating & map travel + road ambush + scar penalties
var s2 = Schema.createDefaultV6State('hard');
s2.vitals.gold = 100;
assert.strictEqual(WorldTime.canTravelTo(s2, 'royal_capital').ok, false, 'Royal Capital locked before age 12');
assert.strictEqual(WorldTime.canTravelTo(s2, 'underbelly').ok, false, 'Underbelly locked at age 7 without flag');

s2.timeline.age = 9;
s2.progression.flags.knows_underbelly = true;
assert.strictEqual(WorldTime.canTravelTo(s2, 'underbelly').ok, true, 'Underbelly unlocks early via secret knowledge at age 9');

// Apply permanent scars: scar_leg (+6 travel stamina) & scar_brand (15 suspicion floor)
var scar1 = WorldTime.applyScar(s2, 'scar_leg');
assert.strictEqual(scar1.ok, true);
assert.strictEqual(WorldTime.applyScar(s2, 'scar_leg').alreadyHas, true);
assert.strictEqual(WorldTime.canTravelTo(s2, 'underbelly').staminaCost, 26, 'Leg scar must add +6 stamina cost');

WorldTime.applyScar(s2, 'scar_brand');
assert(s2.vitals.suspicion >= 15, 'Brand scar enforces minimum suspicion floor of 15');

var travelAmbush = WorldTime.travelToCity(s2, 'underbelly', function () { return 0.01; });
assert.strictEqual(travelAmbush.ok, true);
assert.strictEqual(travelAmbush.ambushTriggered, true);
assert(travelAmbush.ambushHpLoss > 0);
assert.strictEqual(s2.timeline.locationId, 'underbelly');

// 3. Adulthood economy: properties, taxes, customs raid, loans & debt default
var s3 = Schema.createDefaultV6State('hard');
s3.timeline.age = 19;
s3.timeline.chapter = 3;
s3.timeline.locationId = 'salt_port';
s3.vitals.gold = 300;
s3.vitals.suspicion = 60; // high suspicion risks port warehouse customs hit

var buy1 = WorldTime.buyProperty(s3, 'port_warehouse');
assert.strictEqual(buy1.ok, true);
assert.strictEqual(s3.vitals.gold, 60);

var raidReport = WorldTime.computePropertyReport(s3, function () { return 0.1; });
assert(raidReport.alerts.length === 1, 'Customs inspection should trigger at 60 suspicion when rng=0.1');
assert(raidReport.netIncome < 40, 'Customs inspection should slash warehouse profit');

// Loans & default cycle
var loan = WorldTime.takeLoan(s3, 100, 'shadow');
assert.strictEqual(loan.ok, true);
assert.strictEqual(loan.totalOwed, 145);
s3.timeline.turn = loan.dueTurn; // jump to due turn
var tickDefault = WorldTime.advanceTurn(s3, function () { return 0.99; });
assert.strictEqual(s3.progression.flags.debt_defaulted, true, 'Missing due turn triggers debt default');
assert(s3.vitals.debt > 145, 'Defaulting compounds debt');
assert(tickDefault.logs.some(function (l) { return l.indexOf('تأخرت عن سداد الدين') !== -1; }));

// Repaying clears debt & default flag
s3.vitals.gold = 400;
var repay = WorldTime.repayDebt(s3, s3.vitals.debt);
assert.strictEqual(repay.ok, true);
assert.strictEqual(s3.vitals.debt, 0);
assert(!s3.progression.flags.debt_defaulted);

// Rest recovery
s3.vitals.stamina = 10;
s3.vitals.hp = 20;
var rest = WorldTime.restAndRecover(s3);
assert.strictEqual(rest.ok, true);
assert.strictEqual(s3.vitals.stamina, s3.vitals.maxStamina);
assert(s3.vitals.hp > 20);

console.log('✓ V6 World, 96-turn 3-Chapter Timeline (Ages 7-25), Travel, Scars, Properties, Taxes & Debt tests passed!');

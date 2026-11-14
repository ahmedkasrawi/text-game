(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  function getShop() {
    return GameApp.V6ShopData;
  }

  function getSchema() {
    return GameApp.V6Schema;
  }

  function getWorldTime() {
    return GameApp.V6WorldTime;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function getItemPrice(state, itemId) {
    var item = getShop().ITEMS[itemId];
    if (!item) return 0;
    var tradeSkill = (state.skills && state.skills.trade) || 0;
    var discount = Math.min(0.28, tradeSkill * 0.035);
    var acc = state.loadout && state.loadout.accessoryId ? getShop().ITEMS[state.loadout.accessoryId] : null;
    if (acc && acc.tradeDiscountBonus) discount += acc.tradeDiscountBonus;
    discount = Math.min(0.38, discount);
    return Math.max(5, Math.round(item.price * (1 - discount)));
  }

  function canBuyShopItem(state, itemId) {
    var item = getShop().ITEMS[itemId];
    if (!item) return { ok: false, reason: 'عنصر غير موجود.' };
    if (state.timeline.age < (item.minAge || 7)) {
      return { ok: false, reason: 'يتطلب بلوغ سن ' + item.minAge + '.' };
    }
    if (item.blackMarket) {
      var isShadow = state.factions.joinedFaction === 'shadow' || state.timeline.locationId === 'underbelly';
      if (state.vitals.suspicion < 40 && !isShadow) {
        return { ok: false, reason: 'عنصر سوق سوداء: يتطلب الأحياء السفلى أو شبهة 40+ أو الانتماء للظل.' };
      }
    }
    if (item.category !== 'potion') {
      var ownedKey = item.category === 'weapon' ? 'ownedWeapons'
        : (item.category === 'armor' ? 'ownedArmors' : 'ownedAccessories');
      if ((state.loadout[ownedKey] || []).indexOf(itemId) !== -1) {
        return { ok: false, reason: 'تمتلك هذا العنصر بالفعل.' };
      }
    }
    var price = getItemPrice(state, itemId);
    if (state.vitals.gold < price) {
      return { ok: false, reason: 'الذهب غير كافٍ (' + price + ').' };
    }
    return { ok: true, price: price, item: item };
  }

  function equipItem(state, itemId) {
    var item = getShop().ITEMS[itemId];
    if (!item) return { ok: false, reason: 'عنصر غير معروف.' };

    if (item.category === 'weapon') {
      if (state.loadout.ownedWeapons.indexOf(itemId) === -1) return { ok: false, reason: 'لا تملك هذا السلاح.' };
      state.loadout.weaponId = itemId;
      return { ok: true, slot: 'weapon', item: item };
    }
    if (item.category === 'armor') {
      if (state.loadout.ownedArmors.indexOf(itemId) === -1) return { ok: false, reason: 'لا تملك هذا الدرع.' };
      state.loadout.armorId = itemId;
      return { ok: true, slot: 'armor', item: item };
    }
    if (item.category === 'accessory') {
      if (state.loadout.ownedAccessories.indexOf(itemId) === -1) return { ok: false, reason: 'لا تملك هذه التميمة.' };
      state.loadout.accessoryId = itemId;
      return { ok: true, slot: 'accessory', item: item };
    }
    return { ok: false, reason: 'الجرعات تُجهّز في الجيوب السريعة.' };
  }

  function assignPotionSlot(state, slotIdx, potionId) {
    if (slotIdx < 0 || slotIdx > 2) return { ok: false, reason: 'جيب غير صالح.' };
    if (!potionId) {
      state.loadout.potionSlots[slotIdx] = null;
      return { ok: true, slotIdx: slotIdx, potionId: null };
    }
    var count = (state.loadout.potionsInventory && state.loadout.potionsInventory[potionId]) || 0;
    if (count <= 0) return { ok: false, reason: 'لا تملك رصيداً من هذه الجرعة.' };
    state.loadout.potionSlots[slotIdx] = potionId;
    return { ok: true, slotIdx: slotIdx, potionId: potionId };
  }

  function buyShopItem(state, itemId) {
    var check = canBuyShopItem(state, itemId);
    if (!check.ok) return check;

    var item = check.item;
    state.vitals.gold -= check.price;

    if (item.category === 'potion') {
      state.loadout.potionsInventory[itemId] = (state.loadout.potionsInventory[itemId] || 0) + 1;
      // Auto-assign to first empty belt slot if present
      var emptySlot = state.loadout.potionSlots.indexOf(null);
      if (emptySlot !== -1 && state.loadout.potionSlots.indexOf(itemId) === -1) {
        state.loadout.potionSlots[emptySlot] = itemId;
      }
      return { ok: true, price: check.price, item: item, autoEquipped: emptySlot !== -1 };
    }

    var ownedKey = item.category === 'weapon' ? 'ownedWeapons'
      : (item.category === 'armor' ? 'ownedArmors' : 'ownedAccessories');
    state.loadout[ownedKey].push(itemId);
    equipItem(state, itemId);
    return { ok: true, price: check.price, item: item, autoEquipped: true };
  }

  function computePlayerCombatProfile(state, mode) {
    var Shop = getShop();
    var weapon = state.loadout.weaponId ? Shop.ITEMS[state.loadout.weaponId] : null;
    var armor = state.loadout.armorId ? Shop.ITEMS[state.loadout.armorId] : null;
    var acc = state.loadout.accessoryId ? Shop.ITEMS[state.loadout.accessoryId] : null;

    var stats = state.stats || { str: 5, int: 5, agi: 5, cha: 5, ins: 5 };
    var skills = state.skills || { combat: 0, stealth: 0, politics: 0 };

    if (mode === 'debate') {
      var debateAttack = 8 + Math.round(stats.int * 1.1 + stats.cha * 1.1 + (skills.politics || 0) * 1.6);
      var debatePoise = 14 + Math.round(stats.int * 1.2 + (armor && armor.debateBonus ? armor.debateBonus : 0) + (acc && acc.debateBonus ? acc.debateBonus : 0));
      return {
        mode: 'debate',
        weapon: null,
        weaponType: 'none',
        attack: debateAttack,
        armorBreak: 6 + Math.round(stats.ins * 0.8),
        defense: 4 + Math.round((skills.politics || 0) * 0.8),
        maxPoise: debatePoise,
        dodgeChance: clamp(0.08 + stats.ins * 0.015, 0.08, 0.35),
        maxAp: 2
      };
    }

    var baseAttack = 7 + Math.round(stats.str * 1.15 + stats.agi * 0.6 + (skills.combat || 0) * 1.5);
    var weaponAttack = weapon ? weapon.attack : 0;
    var weaponBreak = weapon ? (weapon.armorBreak || 2) : 2;
    var armorDefense = armor ? (armor.defense || 0) : 0;
    var basePoise = 12 + Math.round(stats.str * 0.8) + (armor ? (armor.poiseBonus || 0) : 0) + (acc ? (acc.poiseBonus || 0) : 0);
    var dodge = clamp(0.06 + stats.agi * 0.014 + (armor && armor.dodgeBonus ? armor.dodgeBonus : 0) + (weapon && weapon.parryBonus ? weapon.parryBonus * 0.4 : 0), 0.06, 0.46);

    return {
      mode: 'combat',
      weapon: weapon,
      weaponType: weapon ? weapon.weaponType : 'unarmed',
      attack: baseAttack + weaponAttack,
      armorBreak: weaponBreak + Math.round(stats.str * 0.4),
      defense: armorDefense + Math.round((skills.combat || 0) * 0.6),
      maxPoise: basePoise,
      dodgeChance: dodge,
      maxAp: stats.agi >= 10 ? 3 : 2
    };
  }

  function nextEnemyIntent(enemy) {
    var pattern = enemy.pattern || ['quick_slash', 'heavy_strike', 'guard_stance'];
    var idx = enemy.turnIndex % pattern.length;
    enemy.turnIndex += 1;
    var intentId = pattern[idx];
    var labels = {
      quick_slash: 'ضربة سريعة',
      heavy_strike: 'ضربة ثقيلة كاسرة',
      guard_stance: 'تحصّن بالدرع',
      poison_dart: 'طعنة مسمومة',
      harsh_accusation: 'اتهام قاسٍ أمام الشهود'
    };
    enemy.intent = intentId;
    enemy.intentLabel = labels[intentId] || intentId;
  }

  function applyDamageToTarget(target, rawDmg, rawPoiseBreak) {
    var poiseHit = Math.min(target.poise, rawPoiseBreak);
    target.poise = Math.max(0, target.poise - poiseHit);
    var poiseBrokenJustNow = false;
    if (poiseHit > 0 && target.poise === 0 && !target.staggered) {
      target.staggered = true;
      poiseBrokenJustNow = true;
    }
    var guardMitigation = target.guarding ? 0.5 : (target.poise > 0 ? 0.82 : 1.18);
    var finalDmg = Math.max(2, Math.round(rawDmg * guardMitigation));
    target.hp = Math.max(0, target.hp - finalDmg);
    return {
      damage: finalDmg,
      poiseBroken: poiseBrokenJustNow
    };
  }

  function startEncounter(state, templateIdOrSpec, rng) {
    var Shop = getShop();
    var Schema = getSchema();
    var rand = typeof rng === 'function' ? rng : Math.random;
    var tpl = typeof templateIdOrSpec === 'string'
      ? Shop.ENCOUNTER_TEMPLATES[templateIdOrSpec]
      : templateIdOrSpec;
    if (!tpl) throw new Error('Unknown encounter template: ' + templateIdOrSpec);

    var diff = Schema.DIFFICULTIES[state.difficulty] || Schema.DIFFICULTIES.hard;
    var mode = tpl.mode || 'combat';
    var profile = computePlayerCombatProfile(state, mode);

    var encounter = {
      id: tpl.id || 'custom_encounter',
      mode: mode,
      round: 1,
      status: 'active', // 'active' | 'victory' | 'defeat' | 'escaped'
      log: [],
      lethal: Boolean(tpl.lethal),
      scarOnDefeat: tpl.scarOnDefeat || null,
      rewardGold: tpl.rewardGold || 20,
      rewardRep: tpl.rewardRep || 4,
      player: {
        hp: state.vitals.hp,
        maxHp: state.vitals.maxHp,
        poise: profile.maxPoise,
        maxPoise: profile.maxPoise,
        ap: profile.maxAp,
        maxAp: profile.maxAp,
        attack: profile.attack,
        armorBreak: profile.armorBreak,
        defense: profile.defense,
        dodgeChance: profile.dodgeChance,
        weapon: profile.weapon,
        weaponType: profile.weaponType,
        comboCount: 0,
        guarding: false,
        poisonCoatRounds: 0,
        poisonDmg: 0,
        poisonOnSelf: 0,
        bleedOnSelf: 0
      },
      enemy: {
        name: tpl.name,
        hp: Math.round(tpl.hp * diff.damageMult),
        maxHp: Math.round(tpl.hp * diff.damageMult),
        poise: Math.round((tpl.poise || 15) * diff.damageMult),
        maxPoise: Math.round((tpl.poise || 15) * diff.damageMult),
        attack: Math.round(tpl.attack * diff.damageMult),
        armorBreak: Math.round((tpl.armorBreak || 4) * diff.damageMult),
        poisonAttack: tpl.poisonAttack || 0,
        pattern: tpl.pattern || ['quick_slash', 'heavy_strike'],
        turnIndex: 0,
        guarding: false,
        staggered: false,
        poisonTicks: 0,
        poisonDmg: 0,
        bleedTicks: 0,
        bleedDmg: 0,
        intent: 'quick_slash',
        intentLabel: ''
      }
    };

    nextEnemyIntent(encounter.enemy);

    // Bow opening shot at Round 0 before melee closes
    if (mode === 'combat' && profile.weaponType === 'bow' && profile.weapon && profile.weapon.preemptive) {
      var openDmg = Math.round(profile.attack * 0.72);
      var openRes = applyDamageToTarget(encounter.enemy, openDmg, Math.round(profile.armorBreak * 0.8));
      var msg = 'ضربة استباقية بالقوس (' + profile.weapon.name + '): ألحقتَ ' + openRes.damage + ' ضرراً قبل التحام العدو';
      if (profile.weapon.bleedOnCrit && rand() < 0.75) {
        encounter.enemy.bleedTicks = 2;
        encounter.enemy.bleedDmg = profile.weapon.bleedOnCrit;
        msg += ' وأصبته بنزيف!';
      }
      if (profile.weapon.poisonOnHit) {
        encounter.enemy.poisonTicks = 3;
        encounter.enemy.poisonDmg = profile.weapon.poisonOnHit;
        msg += ' وتسلّل السمّ إليه!';
      }
      encounter.log.push(msg);
      if (encounter.enemy.hp <= 0) {
        finishVictory(state, encounter);
      }
    }

    return encounter;
  }

  function finishVictory(state, encounter) {
    encounter.status = 'victory';
    state.vitals.hp = clamp(encounter.player.hp, 1, state.vitals.maxHp);
    state.vitals.gold += encounter.rewardGold;
    state.vitals.reputation += encounter.rewardRep;
    var skillKey = encounter.mode === 'debate' ? 'politics' : 'combat';
    state.skills[skillKey] = (state.skills[skillKey] || 0) + 1;
    encounter.log.push('انتصار! كسبت ' + encounter.rewardGold + ' ذهباً و+' + encounter.rewardRep + ' سمعة.');
  }

  function finishDefeat(state, encounter) {
    encounter.status = 'defeat';
    var WorldTime = getWorldTime();
    var isNightmare = state.difficulty === 'nightmare';
    var fatal = encounter.lethal || isNightmare;

    if (!fatal && encounter.scarOnDefeat && WorldTime) {
      var scarRes = WorldTime.applyScar(state, encounter.scarOnDefeat);
      state.vitals.hp = Math.min(state.vitals.maxHp, 14);
      var goldLost = Math.min(state.vitals.gold, Math.max(8, Math.round(state.vitals.gold * 0.3)));
      state.vitals.gold -= goldLost;
      encounter.survivedWithScar = true;
      encounter.appliedScar = scarRes.scar ? scarRes.scar.name : encounter.scarOnDefeat;
      encounter.log.push('سقطتَ مثخناً بالجراح لكنك نجوت بحياةٍ مكسورة، وخلّفت المعركة ندبة دائمة: ' + encounter.appliedScar + '.');
    } else {
      state.vitals.hp = 0;
      state.progression.isEnded = true;
      if (encounter.mode === 'debate') {
        state.progression.endingId = 'ending_executed';
      } else if (state.timeline.age < 18 || state.timeline.chapter < 3) {
        state.progression.endingId = 'ending_death_without_trace';
      } else {
        state.progression.endingId = 'ending_slain';
      }
      encounter.log.push('هزيمة قاتلة في المواجهة — انتهت رحلتك هنا.');
    }
  }

  function resolveEnemyTurn(state, encounter, rand) {
    var p = encounter.player;
    var e = encounter.enemy;

    // Enemy DOT ticks first
    if (e.bleedTicks > 0) {
      e.hp = Math.max(0, e.hp - e.bleedDmg);
      e.bleedTicks -= 1;
      encounter.log.push('النزيف يستنزف ' + e.name + ' (-' + e.bleedDmg + ').');
    }
    if (e.poisonTicks > 0) {
      e.hp = Math.max(0, e.hp - e.poisonDmg);
      e.poisonTicks -= 1;
      encounter.log.push('السمّ يسري في ' + e.name + ' (-' + e.poisonDmg + ').');
    }
    if (e.hp <= 0) {
      finishVictory(state, encounter);
      return;
    }

    e.guarding = false;

    if (e.staggered) {
      encounter.log.push(e.name + ' مترنح من كسر ثباته وفقد دوره!');
      e.staggered = false;
      e.poise = Math.round(e.maxPoise * 0.55);
    } else if (e.intent === 'guard_stance') {
      e.guarding = true;
      e.poise = Math.min(e.maxPoise, e.poise + 8);
      encounter.log.push(e.name + ' يرفع دفاعه ويستعيد ثباته.');
    } else {
      var dodgeRoll = rand();
      var effectiveDodge = p.guarding ? p.dodgeChance * 0.5 : p.dodgeChance;
      if (!p.guarding && dodgeRoll < effectiveDodge) {
        encounter.log.push('تفاديتَ هجوم ' + e.name + ' برشاقة!');
      } else {
        var mult = e.intent === 'heavy_strike' ? 1.35 : (e.intent === 'poison_dart' ? 0.8 : 1.0);
        var raw = Math.max(3, Math.round(e.attack * mult - p.defense * 0.45));
        var pBreak = e.intent === 'heavy_strike' ? e.armorBreak + 5 : e.armorBreak;
        var hit = applyDamageToTarget(p, raw, pBreak);
        encounter.log.push(e.name + ' نفّذ ' + e.intentLabel + ' وألحق ' + hit.damage + ' ضرراً.');

        if (e.intent === 'poison_dart' && e.poisonAttack > 0) {
          p.poisonOnSelf = Math.max(p.poisonOnSelf, 2);
        }

        // Spear counter-strike riposte on defend!
        if (p.guarding && p.weaponType === 'spear' && p.weapon && p.weapon.counterStrike) {
          var riposteRaw = Math.round(p.attack * (p.weapon.counterRatio || 0.7));
          var riposteHit = applyDamageToTarget(e, riposteRaw, Math.round(p.armorBreak * 0.5));
          encounter.log.push('ردّ الرمح الفوري (' + p.weapon.name + '): طعنة مرتدة بـ ' + riposteHit.damage + ' ضرراً!');
          if (e.hp <= 0) {
            finishVictory(state, encounter);
            return;
          }
        }
      }
    }

    // Player poison self tick
    if (p.poisonOnSelf > 0 && p.hp > 0) {
      var selfPoisonDmg = 5;
      p.hp = Math.max(0, p.hp - selfPoisonDmg);
      p.poisonOnSelf -= 1;
      encounter.log.push('السم يؤذيك (-' + selfPoisonDmg + ' صحة).');
    }

    if (p.hp <= 0) {
      finishDefeat(state, encounter);
      return;
    }

    // Prepare next round
    encounter.round += 1;
    p.ap = p.maxAp;
    p.guarding = false;
    nextEnemyIntent(e);
  }

  function performEncounterAction(state, encounter, actionId, opts, rng) {
    if (!encounter || encounter.status !== 'active') {
      return { ok: false, reason: 'المواجهة منتهية بالفعل.' };
    }
    var rand = typeof rng === 'function' ? rng : Math.random;
    var Shop = getShop();
    var p = encounter.player;
    var e = encounter.enemy;
    var apCost = actionId === 'heavy_break' ? 2 : 1;

    if (actionId !== 'end_round' && p.ap < apCost) {
      return { ok: false, reason: 'نقاط الفعل غير كافية (' + apCost + ').' };
    }

    if (actionId === 'balanced_strike') {
      p.ap -= 1;
      var comboBoost = 1;
      if (p.weaponType === 'sword' && p.weapon) {
        p.comboCount = Math.min(2, p.comboCount + 1);
        comboBoost = 1 + (p.comboCount - 1) * (p.weapon.comboScale || 0.2);
      }
      var dmg = Math.round(p.attack * comboBoost);
      var res = applyDamageToTarget(e, dmg, p.armorBreak);
      encounter.log.push('ضربة متوازنة ألحقت ' + res.damage + ' ضرراً' + (res.poiseBroken ? ' وكسرت ثبات الخصم!' : '.'));
      if (p.poisonCoatRounds > 0) {
        e.poisonTicks = Math.max(e.poisonTicks, 2);
        e.poisonDmg = Math.max(e.poisonDmg, p.poisonDmg);
        p.poisonCoatRounds -= 1;
      }
    } else if (actionId === 'heavy_break') {
      p.ap -= 2;
      p.comboCount = 0;
      var isAxe = p.weaponType === 'axe';
      var heavyDmg = Math.round(p.attack * (isAxe ? 1.48 : 1.32));
      var heavyBreak = Math.round(p.armorBreak * (isAxe ? 2.1 : 1.65));
      var hRes = applyDamageToTarget(e, heavyDmg, heavyBreak);
      encounter.log.push('ضربة كاسرة للدرع ألحقت ' + hRes.damage + ' ضرراً' + (hRes.poiseBroken ? ' وهشّمت دفاع الخصم!' : '.'));
    } else if (actionId === 'guard_counter') {
      p.ap -= 1;
      p.guarding = true;
      p.poise = Math.min(p.maxPoise, p.poise + 6);
      encounter.log.push('اتخذتَ وضعية الصدّ' + (p.weaponType === 'spear' ? ' وتأهّبتَ للرد بالرمح.' : '.'));
    } else if (actionId === 'feint_trick') {
      p.ap -= 1;
      var trickPower = 6 + Math.round(((state.skills && state.skills.stealth) || 0) * 1.8 + state.stats.ins * 0.9);
      // Ignores guard & hits poise directly
      e.guarding = false;
      var tRes = applyDamageToTarget(e, Math.round(p.attack * 0.55 + trickPower), Math.round(trickPower * 0.9));
      encounter.log.push('خدعة تكتيكية اخترقت الدفاع وألحقت ' + tRes.damage + ' ضرراً' + (tRes.poiseBroken ? ' مع اختلال توازن الخصم!' : '.'));
    } else if (actionId === 'use_potion') {
      var slotIdx = opts && typeof opts.slotIdx === 'number' ? opts.slotIdx : 0;
      var pid = state.loadout.potionSlots[slotIdx];
      var qty = pid ? (state.loadout.potionsInventory[pid] || 0) : 0;
      if (!pid || qty <= 0) {
        return { ok: false, reason: 'الجيب المحدد فارغ.' };
      }
      var pot = Shop.ITEMS[pid];
      p.ap -= 1;
      state.loadout.potionsInventory[pid] = qty - 1;
      if (state.loadout.potionsInventory[pid] <= 0) {
        state.loadout.potionSlots[slotIdx] = null;
      }
      if (pot.healHp) {
        p.hp = Math.min(p.maxHp, p.hp + pot.healHp);
        state.vitals.hp = p.hp;
      }
      if (pot.staminaRestore) {
        state.vitals.stamina = Math.min(state.vitals.maxStamina, state.vitals.stamina + pot.staminaRestore);
      }
      if (pot.grantAp) {
        p.ap += pot.grantAp;
      }
      if (pot.coatPoisonRounds) {
        p.poisonCoatRounds = pot.coatPoisonRounds;
        p.poisonDmg = pot.poisonDmg || 7;
      }
      if (pot.cleanse) {
        p.poisonOnSelf = 0;
        p.bleedOnSelf = 0;
      }
      encounter.log.push('استخدمتَ ' + pot.name + '.');
    } else if (actionId === 'retreat') {
      var escapeOdds = clamp(0.45 + state.stats.agi * 0.03 + ((state.skills && state.skills.stealth) || 0) * 0.05, 0.35, 0.9);
      if (rand() < escapeOdds) {
        encounter.status = 'escaped';
        state.vitals.hp = clamp(p.hp, 1, state.vitals.maxHp);
        state.vitals.stamina = Math.max(0, state.vitals.stamina - 15);
        encounter.log.push('نجحتَ في الانسحاب من المواجهة بأقل الخسائر.');
        return { ok: true, encounter: encounter };
      }
      p.ap = 0;
      encounter.log.push('فشلت محاولة الانسحاب!');
    } else if (actionId === 'end_round') {
      p.ap = 0;
    } else {
      return { ok: false, reason: 'فعل قتالي غير معروف: ' + actionId };
    }

    if (e.hp <= 0) {
      finishVictory(state, encounter);
      return { ok: true, encounter: encounter };
    }

    // Auto-trigger enemy turn when player is out of AP or ends round
    if (p.ap <= 0 && encounter.status === 'active') {
      resolveEnemyTurn(state, encounter, rand);
    }

    return { ok: true, encounter: encounter };
  }

  GameApp.V6Combat = {
    getItemPrice: getItemPrice,
    canBuyShopItem: canBuyShopItem,
    buyShopItem: buyShopItem,
    equipItem: equipItem,
    assignPotionSlot: assignPotionSlot,
    computePlayerCombatProfile: computePlayerCombatProfile,
    startEncounter: startEncounter,
    performEncounterAction: performEncounterAction
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6Combat;
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
  }

  function ensureStateIntegrity(state) {
    if (!state.pendingRipples) state.pendingRipples = [];
    if (!state.skills) state.skills = {};
    // Backward compatibility: merge legacy stealth + intrigue into shadow
    if (state.skills.shadow === undefined) {
      var legStealth = state.skills.stealth || 0;
      var legIntrigue = state.skills.intrigue || 0;
      state.skills.shadow = Math.max(legStealth, legIntrigue);
    }
    delete state.skills.stealth;
    delete state.skills.intrigue;

    if (state.skills.alchemy === undefined) state.skills.alchemy = 0;
    if (state.skills.sword_path === undefined) state.skills.sword_path = 0;

    if (!state.elixirs) state.elixirs = { healing: 0, antidote: 0, focus: 0 };
    if (!state.assets) state.assets = { caravanShare: false, safeHouse: false };
    if (!state.boughtShopItems) state.boughtShopItems = [];
    if (!state.ownedAccessories) state.ownedAccessories = [];
    if (!state.gear) {
      state.gear = {
        weapon: 'سكين ورشة بسيط',
        weaponPower: 1,
        weaponRarity: 'common',
        weaponIcon: 'dagger',
        armor: 'مئزر جلدي متين',
        armorDefense: 1,
        armorRarity: 'common',
        armorIcon: 'leather_armor',
        accessory: 'لا يوجد',
        accessoryDesc: '',
        accessoryRarity: 'common',
        accessoryIcon: '',
        accessoryBonus: {}
      };
    }
    if (!state.gear.weaponRarity) state.gear.weaponRarity = 'common';
    if (!state.gear.weaponIcon) state.gear.weaponIcon = 'sword';
    if (!state.gear.armorRarity) state.gear.armorRarity = 'common';
    if (!state.gear.armorIcon) state.gear.armorIcon = 'leather_armor';
    if (!state.gear.accessory) state.gear.accessory = 'لا يوجد';
    if (!state.gear.accessoryBonus) state.gear.accessoryBonus = {};
    if (!state.gear.accessoryRarity) state.gear.accessoryRarity = 'common';
    if (state.gear.accessory !== 'لا يوجد') {
      var existsAcc = state.ownedAccessories.some(function (a) { return a.name === state.gear.accessory; });
      if (!existsAcc) {
        state.ownedAccessories.push({
          name: state.gear.accessory,
          desc: state.gear.accessoryDesc || '',
          rarity: state.gear.accessoryRarity || 'uncommon',
          icon: state.gear.accessoryIcon || 'charm_wood',
          bonus: state.gear.accessoryBonus || {}
        });
      }
    }
    if (typeof state.period !== 'number') state.period = 1;
    if (typeof state.tempCheckBonus !== 'number') state.tempCheckBonus = 0;
    if (typeof state.totalTurns !== 'number' || state.totalTurns > 64) state.totalTurns = 64;
    return state;
  }

  function getAllEvents() {
    var data = GameApp.Data || {};
    return []
      .concat(data.childhoodEvents || [])
      .concat(data.storyEvents || [])
      .concat(data.pathEvents || []);
  }

  function findEventById(id) {
    var events = getAllEvents();
    for (var i = 0; i < events.length; i++) {
      if (events[i].id === id) return events[i];
    }
    return null;
  }

  function isEventEligible(ev, state) {
    if (ev.phase && ev.phase !== state.phase) return false;
    if (!ev.repeatable && state.usedEvents.indexOf(ev.id) !== -1) return false;

    if (typeof ev.age === 'number' && ev.age !== state.age) return false;
    if (typeof ev.minAge === 'number' && state.age < ev.minAge) return false;
    if (typeof ev.maxAge === 'number' && state.age > ev.maxAge) return false;

    if (typeof ev.quarter === 'number' && ev.quarter !== state.quarter) return false;
    var curPeriod = state.period || 1;
    if (typeof ev.period === 'number' && ev.period !== curPeriod) return false;

    if (ev.career) {
      if (Array.isArray(ev.career)) {
        if (ev.career.indexOf(state.career) === -1) return false;
      } else if (ev.career !== state.career) {
        return false;
      }
    }

    if (typeof ev.minThreat === 'number' && state.threat < ev.minThreat) return false;

    if (ev.minFaction) {
      var fks = Object.keys(ev.minFaction);
      for (var f = 0; f < fks.length; f++) {
        if ((state.factions[fks[f]] || 0) < ev.minFaction[fks[f]]) return false;
      }
    }

    if (ev.maxFaction) {
      var mfks = Object.keys(ev.maxFaction);
      for (var mf = 0; mf < mfks.length; mf++) {
        if ((state.factions[mfks[mf]] || 0) > ev.maxFaction[mfks[mf]]) return false;
      }
    }

    if (typeof ev.condition === 'function' && !ev.condition(state)) return false;

    return true;
  }

  function selectNextEvent(state, rngFn) {
    ensureStateIntegrity(state);
    var rand = typeof rngFn === 'function' ? rngFn : Math.random;
    var events = getAllEvents();

    if (state.currentEventId) {
      var existing = findEventById(state.currentEventId);
      if (existing) return existing;
    }

    var eligible = events.filter(function (ev) {
      return isEventEligible(ev, state);
    });

    if (eligible.length === 0) {
      return null;
    }

    // 1. Fixed story/childhood milestones (priority >= 95)
    var milestones = eligible.filter(function (ev) {
      return (ev.priority || 0) >= 95;
    });
    if (milestones.length > 0) {
      return pickWeighted(milestones, rand);
    }

    // 2. O(1) Delayed Ripples from earlier choices
    if (state.pendingRipples.length > 0) {
      var activeRipples = [];
      var chosenRippleEvent = null;

      for (var r = 0; r < state.pendingRipples.length; r++) {
        var rip = state.pendingRipples[r];
        if (rip.maxTurn && state.turnIndex > rip.maxTurn) continue;
        if (state.usedEvents.indexOf(rip.eventId) !== -1) continue;

        if (!chosenRippleEvent && state.turnIndex >= rip.minTurn) {
          var evMatch = findEventById(rip.eventId);
          if (evMatch && isEventEligible(evMatch, state)) {
            chosenRippleEvent = evMatch;
            continue;
          }
        }
        activeRipples.push(rip);
      }

      state.pendingRipples = activeRipples;
      if (chosenRippleEvent) {
        return chosenRippleEvent;
      }
    }

    // 3. Rare Sword Path encounter or Faction Collapse Penalty (priority 80..92)
    var highSpecials = eligible.filter(function (ev) {
      var p = ev.priority || 0;
      return p >= 80 && p < 95 && !ev.isRipple && ev.category !== 'assassin';
    });
    if (highSpecials.length > 0) {
      return pickWeighted(highSpecials, rand);
    }

    // 4. Sequential Career Arc chapters (priority 70..79)
    var arcEvents = eligible.filter(function (ev) {
      var p = ev.priority || 0;
      return p >= 70 && p < 80 && !ev.isRipple && ev.category !== 'assassin';
    });
    if (arcEvents.length > 0 && rand() < 0.78) {
      return pickWeighted(arcEvents, rand);
    }

    // 5. Dynamic assassination pressure when threat is >= 28
    var recentAssassin = state.flags.lastAssassinTurn && (state.turnIndex - state.flags.lastAssassinTurn < 3);
    if (state.phase === 'youth' && state.threat >= 28 && !recentAssassin) {
      var assassinPool = eligible.filter(function (ev) {
        return ev.category === 'assassin' && (ev.priority || 0) < 95 && !ev.isRipple;
      });
      var triggerChance = clamp((state.threat - 14) / 115, 0.2, 0.58);
      if (assassinPool.length > 0 && rand() < triggerChance) {
        var pickedA = pickWeighted(assassinPool, rand);
        state.flags.lastAssassinTurn = state.turnIndex;
        return pickedA;
      }
    }

    // 6. Periodic routine breather (ensures routine_city_calm and career routines actually surface!)
    var recentRoutine = state.flags.lastRoutineTurn && (state.turnIndex - state.flags.lastRoutineTurn < 4);
    var routinePool = eligible.filter(function (ev) { return Boolean(ev.repeatable); });
    if (state.phase === 'youth' && !recentRoutine && routinePool.length > 0) {
      var routineChance = (state.period === 4 || state.hp < 65) ? 0.34 : 0.16;
      if (rand() < routineChance) {
        state.flags.lastRoutineTurn = state.turnIndex;
        return pickWeighted(routinePool, rand);
      }
    }

    // 7. Varied non-ripple unique pool (pick from top band within 8 priority points for replay freshness!)
    var nonRippleEligible = eligible.filter(function (ev) { return !ev.isRipple && !ev.repeatable; });
    var poolToPick = nonRippleEligible.length > 0 ? nonRippleEligible : eligible.filter(function (ev) { return !ev.isRipple; });
    if (poolToPick.length === 0) poolToPick = eligible;

    var maxPriority = -Infinity;
    for (var i = 0; i < poolToPick.length; i++) {
      var p = typeof poolToPick[i].priority === 'number' ? poolToPick[i].priority : 20;
      if (p > maxPriority) maxPriority = p;
    }

    var topBand = poolToPick.filter(function (ev) {
      var p = typeof ev.priority === 'number' ? ev.priority : 20;
      return p >= maxPriority - 8;
    });

    return pickWeighted(topBand, rand);
  }

  function pickWeighted(list, rand) {
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      total += typeof list[i].weight === 'number' ? list[i].weight : 10;
    }
    var roll = rand() * total;
    var acc = 0;
    for (var j = 0; j < list.length; j++) {
      acc += typeof list[j].weight === 'number' ? list[j].weight : 10;
      if (roll <= acc) return list[j];
    }
    return list[0];
  }

  function resolveText(val, state) {
    return typeof val === 'function' ? val(state) : val;
  }

  function getAvailableChoices(state, event) {
    ensureStateIntegrity(state);
    if (!event || !event.choices) return [];
    return event.choices.filter(function (ch) {
      if (typeof ch.minInt === 'number' && state.attributes.int < ch.minInt) {
        return false;
      }
      if (ch.minAttr) {
        var attrKeys = Object.keys(ch.minAttr);
        for (var a = 0; a < attrKeys.length; a++) {
          if ((state.attributes[attrKeys[a]] || 0) < ch.minAttr[attrKeys[a]]) return false;
        }
      }
      if (ch.minSkill) {
        var skillKeys = Object.keys(ch.minSkill);
        for (var s = 0; s < skillKeys.length; s++) {
          if ((state.skills[skillKeys[s]] || 0) < ch.minSkill[skillKeys[s]]) return false;
        }
      }
      if (ch.minFaction) {
        var fKeys = Object.keys(ch.minFaction);
        for (var f = 0; f < fKeys.length; f++) {
          if ((state.factions[fKeys[f]] || 0) < ch.minFaction[fKeys[f]]) return false;
        }
      }
      if (ch.requiresElixir) {
        if ((state.elixirs[ch.requiresElixir] || 0) <= 0) return false;
      }
      if (Array.isArray(ch.requiresFlags)) {
        for (var r = 0; r < ch.requiresFlags.length; r++) {
          if (!state.flags[ch.requiresFlags[r]]) return false;
        }
      }
      if (Array.isArray(ch.requiresTraits)) {
        for (var t = 0; t < ch.requiresTraits.length; t++) {
          if (state.traits.indexOf(ch.requiresTraits[t]) === -1) return false;
        }
      }
      if (typeof ch.condition === 'function' && !ch.condition(state)) {
        return false;
      }
      return true;
    });
  }

  function getChoiceSynergyCount(state, choice) {
    if (!choice.check || !Array.isArray(choice.check.flagBonuses)) return 0;
    var count = 0;
    for (var i = 0; i < choice.check.flagBonuses.length; i++) {
      if (state.flags[choice.check.flagBonuses[i].flag]) count += 1;
    }
    return count;
  }

  function getEffectiveSkillBonus(skillVal, mult) {
    var m = typeof mult === 'number' ? mult : 2.8;
    var tier1 = Math.min(skillVal, 10) * m;
    var tier2 = Math.max(0, Math.min(skillVal - 10, 10)) * (m * 0.5);
    var tier3 = Math.max(0, skillVal - 20) * (m * 0.18);
    return tier1 + tier2 + tier3;
  }

  function getTraitCheckBonus(state, c, event) {
    var TDefs = GameApp.State && GameApp.State.TRAIT_EFFECTS;
    if (!TDefs || !Array.isArray(state.traits)) return 0;
    var bonus = 0;
    state.traits.forEach(function (tr) {
      var def = TDefs[tr];
      if (!def) return;
      if (def.checkBonus && c.skill === def.checkBonus.skill) bonus += def.checkBonus.val;
      if (def.checkBonusSkills && def.checkBonusSkills.indexOf(c.skill) !== -1) bonus += def.checkBonusVal;
      if (def.checkBonusAttr && c.attr === def.checkBonusAttr) bonus += def.checkBonusVal;
      if (def.checkBonusSkill && c.skill === def.checkBonusSkill && c.attr !== def.checkBonusAttr) bonus += def.checkBonusVal;
      if (def.assassinCheckBonus && event && event.category === 'assassin') bonus += def.assassinCheckBonus;
      if (def.earlyCheckBonus && state.age <= 12) bonus += def.earlyCheckBonus;
    });
    return bonus;
  }

  function getChoiceChance(state, choice, event) {
    if (!choice.check) return null;
    ensureStateIntegrity(state);
    var c = choice.check;
    var ev = event || findEventById(state.currentEventId);
    var chance = typeof c.base === 'number' ? c.base : 32;

    // Progressive difficulty scaling across ages 12..18 so late-game stays tense (55%-88% typically)
    if (!c.noAgeScale && state.age >= 12) {
      chance -= Math.floor((state.age - 11) * 2.2);
    }

    if (c.attr && state.attributes[c.attr] !== undefined) {
      var attrMult = typeof c.attrMult === 'number' ? c.attrMult : 2.6;
      chance += (state.attributes[c.attr] - 4) * attrMult;
    }

    if (c.skill) {
      var skillVal = state.skills[c.skill] || 0;
      if (skillVal === 0 && !c.noUntrainedPenalty) {
        chance -= 12;
      } else if (c.skill === 'sword_path') {
        chance += skillVal * (typeof c.skillMult === 'number' ? c.skillMult : 5);
      } else {
        chance += getEffectiveSkillBonus(skillVal, c.skillMult);
      }

      // Ultra-rare Sword Path mastery amplifies all combat checks dramatically
      if (c.skill === 'combat' && (state.skills.sword_path || 0) > 0) {
        chance += Math.min(20, state.skills.sword_path * 4);
      }
    }

    if (c.gearBonus) {
      if (c.gearBonus === 'weapon') chance += (state.gear.weaponPower || 0) * 2.5;
      else if (c.gearBonus === 'armor') chance += (state.gear.armorDefense || 0) * 2.5;
      else if (c.gearBonus === 'both') chance += ((state.gear.weaponPower || 0) + (state.gear.armorDefense || 0)) * 1.6;
    }

    if (state.gear && state.gear.accessoryBonus) {
      if (c.attr && state.gear.accessoryBonus[c.attr]) chance += state.gear.accessoryBonus[c.attr];
      if (c.skill && state.gear.accessoryBonus[c.skill]) chance += state.gear.accessoryBonus[c.skill];
      if (c.skill === 'combat' && state.gear.accessoryBonus.sword_path && (state.skills.sword_path || 0) > 0) {
        chance += Math.round(state.gear.accessoryBonus.sword_path * 0.5);
      }
    }

    chance += getTraitCheckBonus(state, c, ev);

    if (state.tempCheckBonus) {
      chance += state.tempCheckBonus;
    }
    if (state.flags && state.flags.antidoteActive && (c.skill === 'shadow' || c.skill === 'alchemy' || c.attr === 'ins')) {
      chance += 12;
    }

    if (Array.isArray(c.flagBonuses)) {
      for (var i = 0; i < c.flagBonuses.length; i++) {
        if (state.flags[c.flagBonuses[i].flag]) {
          chance += c.flagBonuses[i].bonus;
        }
      }
    }

    // Active Threat Penalty on checks
    if (c.threatPenalty) {
      chance -= state.threat * c.threatPenalty;
    } else if (state.threat >= 40 && (c.skill === 'shadow' || c.skill === 'trade' || c.attr === 'cha' || c.applyThreat)) {
      chance -= Math.floor((state.threat - 35) * 0.28);
    }

    return Math.round(clamp(chance, 10, 92));
  }

  function canAffordChoice(state, choice) {
    if (typeof choice.minGold === 'number' && state.gold < choice.minGold) {
      return { ok: false, reason: 'يتطلب ' + choice.minGold + ' ذهباً' };
    }
    return { ok: true, reason: null };
  }

  function queueRippleItem(state, item, rand) {
    if (!item || !item.eventId) return;
    if (state.usedEvents.indexOf(item.eventId) !== -1) return;
    for (var i = 0; i < state.pendingRipples.length; i++) {
      if (state.pendingRipples[i].eventId === item.eventId) return;
    }
    var dMin = typeof item.delayMin === 'number' ? item.delayMin : 4;
    var dMax = typeof item.delayMax === 'number' ? item.delayMax : dMin + 5;
    var delay = dMin + Math.floor(rand() * (dMax - dMin + 1));
    state.pendingRipples.push({
      eventId: item.eventId,
      minTurn: state.turnIndex + delay,
      maxTurn: item.expiresAfter ? state.turnIndex + delay + item.expiresAfter : null
    });
  }

  function addAndEquipAccessory(state, acc) {
    ensureStateIntegrity(state);
    var exists = state.ownedAccessories.some(function (a) { return a.name === acc.name; });
    if (!exists) {
      state.ownedAccessories.push({
        name: acc.name,
        desc: acc.desc || '',
        rarity: acc.rarity || 'uncommon',
        icon: acc.icon || 'charm_wood',
        bonus: acc.bonus || {}
      });
    }
    state.gear.accessory = acc.name;
    state.gear.accessoryDesc = acc.desc || '';
    state.gear.accessoryRarity = acc.rarity || 'uncommon';
    state.gear.accessoryIcon = acc.icon || 'charm_wood';
    state.gear.accessoryBonus = acc.bonus || {};
  }

  function equipAccessory(state, accName) {
    ensureStateIntegrity(state);
    for (var i = 0; i < state.ownedAccessories.length; i++) {
      if (state.ownedAccessories[i].name === accName) {
        var found = state.ownedAccessories[i];
        state.gear.accessory = found.name;
        state.gear.accessoryDesc = found.desc;
        state.gear.accessoryRarity = found.rarity || 'uncommon';
        state.gear.accessoryIcon = found.icon || 'charm_wood';
        state.gear.accessoryBonus = found.bonus;
        return true;
      }
    }
    return false;
  }

  function getDamageMitigation(state, eventCategory) {
    var mit = Math.floor((state.gear.armorDefense || 0) * 0.7);
    if (state.assets && state.assets.safeHouse) mit += 2;
    var TDefs = GameApp.State && GameApp.State.TRAIT_EFFECTS;
    if (TDefs && Array.isArray(state.traits)) {
      state.traits.forEach(function (tr) {
        var def = TDefs[tr];
        if (!def) return;
        if (def.assassinDmgReduction && eventCategory === 'assassin') mit += def.assassinDmgReduction;
        if (def.combatDmgReduction && eventCategory !== 'assassin') mit += def.combatDmgReduction;
      });
    }
    return mit;
  }

  function applyEffects(state, effects, rngFn, eventCategory) {
    var deltas = [];
    if (!effects) return deltas;

    ensureStateIntegrity(state);
    var rand = typeof rngFn === 'function' ? rngFn : Math.random;
    var StateMod = GameApp.State;

    if (typeof effects.maxHp === 'number' && effects.maxHp !== 0) {
      state.maxHp = Math.max(40, state.maxHp + effects.maxHp);
      state.hp = clamp(state.hp + effects.maxHp, 0, state.maxHp);
      deltas.push({ label: 'الحد الأقصى للصحة', val: effects.maxHp });
    }

    if (typeof effects.hp === 'number' && effects.hp !== 0) {
      var actualHp = effects.hp;
      if (actualHp < 0) {
        if (eventCategory === 'assassin' && state.threat >= 55) {
          actualHp -= 6;
        }
        var defReduction = getDamageMitigation(state, eventCategory);
        if (defReduction > 0) {
          actualHp = Math.min(-2, actualHp + defReduction);
        }
      }
      state.hp = clamp(state.hp + actualHp, 0, state.maxHp);
      deltas.push({ label: 'الصحة', val: actualHp });
    }

    if (typeof effects.gold === 'number' && effects.gold !== 0) {
      state.gold = Math.max(0, state.gold + effects.gold);
      deltas.push({ label: 'الذهب', val: effects.gold });
    }

    if (typeof effects.rep === 'number' && effects.rep !== 0) {
      state.rep = Math.max(-50, state.rep + effects.rep);
      deltas.push({ label: 'السمعة', val: effects.rep });
    }

    if (typeof effects.threat === 'number' && effects.threat !== 0) {
      state.threat = clamp(state.threat + effects.threat, 0, 100);
      deltas.push({ label: 'التهديد', val: effects.threat, invertColor: true });
    }

    if (effects.attr) {
      Object.keys(effects.attr).forEach(function (k) {
        var v = effects.attr[k];
        if (!v) return;
        state.attributes[k] = clamp((state.attributes[k] || 0) + v, 1, 35);
        deltas.push({ label: StateMod.ATTR_LABELS[k] || k, val: v });
      });
    }

    if (effects.skill) {
      Object.keys(effects.skill).forEach(function (k) {
        var v = effects.skill[k];
        if (!v) return;
        var prev = state.skills[k] || 0;
        var maxCap = k === 'sword_path' ? 10 : 60;
        state.skills[k] = clamp(prev + v, 0, maxCap);
        var isNew = prev === 0 && v > 0;
        var label = (isNew ? '✨ مهارة جديدة - ' : '') + (StateMod.SKILL_LABELS[k] || k);
        deltas.push({ label: label, val: v, isNewSkill: isNew });
      });
    }

    // Faction changes + User's precise relational cross-effects
    if (effects.faction) {
      var fEff = Object.assign({}, effects.faction);

      // Trait bonus: صديق الظل الأخضر boosts elven gains
      if (fEff.elves > 0 && state.traits.indexOf('صديق الظل الأخضر') !== -1) {
        fEff.elves += 2;
      }

      // Demons <-> Humans strict opposition (cannot ally with both!)
      if (!effects.noCounterFaction) {
        if ((fEff.demons || 0) > 0 && fEff.humans === undefined) {
          fEff.humans = -Math.max(4, Math.round(fEff.demons * 0.8));
        } else if ((fEff.demons || 0) > 0 && fEff.humans > -Math.round(fEff.demons * 0.6)) {
          fEff.humans = Math.min(fEff.humans, -Math.round(fEff.demons * 0.65));
        }
        if ((fEff.humans || 0) >= 8 && fEff.demons === undefined && state.phase === 'youth') {
          fEff.demons = -Math.round(fEff.humans * 0.55);
        }

        // Family mild racial reaction: Humans/Elves positive (+1/+2), Demons negative (-2/-3)
        if (fEff.family === undefined) {
          var famDelta = 0;
          if ((fEff.humans || 0) >= 10) famDelta += 1;
          if ((fEff.elves || 0) >= 12) famDelta += 1;
          if ((fEff.demons || 0) >= 10) famDelta -= Math.max(2, Math.floor(fEff.demons / 5));
          if (famDelta !== 0) fEff.family = famDelta;
        }
      }

      Object.keys(fEff).forEach(function (k) {
        var v = fEff[k];
        if (!v) return;
        state.factions[k] = clamp((state.factions[k] || 0) + v, -100, 100);
        deltas.push({ label: StateMod.FACTION_LABELS[k] || k, val: v });
      });
    }

    if (effects.giveElixir) {
      Object.keys(effects.giveElixir).forEach(function (ek) {
        var count = effects.giveElixir[ek];
        if (!count) return;
        state.elixirs[ek] = (state.elixirs[ek] || 0) + count;
        deltas.push({ label: '🧪 ' + (StateMod.ELIXIR_LABELS[ek] || ek), val: count });
      });
    }

    if (effects.consumeElixir && state.elixirs[effects.consumeElixir] > 0) {
      state.elixirs[effects.consumeElixir] -= 1;
      deltas.push({ label: 'استهلاك: ' + (StateMod.ELIXIR_LABELS[effects.consumeElixir] || effects.consumeElixir), val: null });
    }

    if (effects.flags) {
      Object.keys(effects.flags).forEach(function (k) {
        state.flags[k] = effects.flags[k];
      });
    }

    if (effects.incFlags) {
      Object.keys(effects.incFlags).forEach(function (k) {
        state.flags[k] = (state.flags[k] || 0) + effects.incFlags[k];
      });
    }

    if (effects.queueRipple) {
      if (Array.isArray(effects.queueRipple)) {
        effects.queueRipple.forEach(function (r) { queueRippleItem(state, r, rand); });
      } else {
        queueRippleItem(state, effects.queueRipple, rand);
      }
    }

    if (effects.addTrait && state.traits.indexOf(effects.addTrait) === -1) {
      state.traits.push(effects.addTrait);
      deltas.push({ label: 'وسم: ' + effects.addTrait, val: null });
    }

    if (effects.setCareer) {
      state.career = effects.setCareer;
      deltas.push({ label: 'المسار: ' + (StateMod.CAREER_LABELS[effects.setCareer] || effects.setCareer), val: null });
    }

    if (effects.setAlignment) {
      state.warAlignment = effects.setAlignment;
      deltas.push({ label: 'الانحياز: ' + (StateMod.ALIGNMENT_LABELS[effects.setAlignment] || effects.setAlignment), val: null });
    }

    // Gear downgrade protection: never replace stronger gear with weaker!
    if (effects.setWeapon) {
      if (effects.setWeapon.power > (state.gear.weaponPower || 0)) {
        state.gear.weapon = effects.setWeapon.name;
        state.gear.weaponPower = effects.setWeapon.power;
        state.gear.weaponRarity = effects.setWeapon.rarity || (effects.setWeapon.power >= 10 ? 'legendary' : effects.setWeapon.power >= 7 ? 'rare' : 'uncommon');
        state.gear.weaponIcon = effects.setWeapon.icon || 'sword';
        deltas.push({ label: 'سلاح جديد: ' + effects.setWeapon.name, val: null });
      } else {
        var soldWpnGold = Math.max(12, effects.setWeapon.power * 3);
        state.gold += soldWpnGold;
        deltas.push({ label: 'بيع سلاح أضعف (' + effects.setWeapon.name + ')', val: soldWpnGold });
      }
    }

    if (effects.setArmor) {
      if (effects.setArmor.defense > (state.gear.armorDefense || 0)) {
        state.gear.armor = effects.setArmor.name;
        state.gear.armorDefense = effects.setArmor.defense;
        state.gear.armorRarity = effects.setArmor.rarity || (effects.setArmor.defense >= 9 ? 'epic' : effects.setArmor.defense >= 5 ? 'rare' : 'uncommon');
        state.gear.armorIcon = effects.setArmor.icon || 'scale_armor';
        deltas.push({ label: 'درع جديد: ' + effects.setArmor.name, val: null });
      } else {
        var soldArmGold = Math.max(12, effects.setArmor.defense * 3);
        state.gold += soldArmGold;
        deltas.push({ label: 'بيع درع أضعف (' + effects.setArmor.name + ')', val: soldArmGold });
      }
    }

    if (effects.setAccessory) {
      addAndEquipAccessory(state, effects.setAccessory);
      deltas.push({ label: 'تميمة مضافة للحقيبة: ' + effects.setAccessory.name, val: null });
    }

    return deltas;
  }

  function useElixir(state, elixirKey) {
    ensureStateIntegrity(state);
    if ((state.elixirs[elixirKey] || 0) <= 0) {
      return { ok: false, msg: 'لا تملك هذا الإكسير في حقيبتك.' };
    }
    if (state.phase === 'ended' || state.awaitingNext) {
      return { ok: false, msg: 'استخدم الإكسير قبل اتخاذ القرار في المحطة.' };
    }

    if (elixirKey === 'healing') {
      if (state.hp >= state.maxHp) {
        return { ok: false, msg: 'صحتك مكتملة بالفعل!' };
      }
      state.elixirs.healing -= 1;
      var before = state.hp;
      var healAmount = 35 + (state.traits.indexOf('نور التعقيم') !== -1 ? 12 : 0);
      state.hp = clamp(state.hp + healAmount, 0, state.maxHp);
      return { ok: true, msg: 'شربت إكسير الشفاء (+' + (state.hp - before) + ' صحة).' };
    }

    if (elixirKey === 'antidote') {
      state.elixirs.antidote -= 1;
      state.threat = clamp(state.threat - 14, 0, 100);
      state.flags.antidoteActive = true;
      return { ok: true, msg: 'شربت ترياق السموم (-14 تهديد ومناعة إضافية +12% في الكمائن والمكائد).' };
    }

    if (elixirKey === 'focus') {
      if (state.tempCheckBonus > 0) {
        return { ok: false, msg: 'جرعة التركيز مفعلة بالفعل للاختبار القادم!' };
      }
      state.elixirs.focus -= 1;
      state.tempCheckBonus = 18;
      return { ok: true, msg: 'شربت جرعة التركيز (+18% لفرصة نجاح اختبارك القادم)!' };
    }

    return { ok: false, msg: 'نوع إكسير غير معروف.' };
  }

  function buyShopItem(state, itemId) {
    ensureStateIntegrity(state);
    if (!GameApp.ShopData) return { ok: false, msg: 'بيانات المتجر غير متوفرة.' };
    var entries = GameApp.ShopData.getAvailableShopItems(state);
    var match = null;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].item.id === itemId) {
        match = entries[i];
        break;
      }
    }
    if (!match) return { ok: false, msg: 'العنصر غير متاح حالياً.' };
    if (state.gold < match.finalPrice) return { ok: false, msg: 'ذهبك لا يكفي.' };

    var item = match.item;
    state.gold -= match.finalPrice;
    if (!item.repeatable && state.boughtShopItems.indexOf(item.id) === -1) {
      state.boughtShopItems.push(item.id);
    }

    if (item.type === 'elixir') {
      state.elixirs[item.elixirKey] = (state.elixirs[item.elixirKey] || 0) + 1;
    } else if (item.type === 'weapon') {
      state.gear.weapon = item.weapon.name;
      state.gear.weaponPower = item.weapon.power;
      state.gear.weaponRarity = item.weapon.rarity || item.rarity || 'uncommon';
      state.gear.weaponIcon = item.weapon.icon || item.iconKey || 'sword';
    } else if (item.type === 'armor') {
      state.gear.armor = item.armor.name;
      state.gear.armorDefense = item.armor.defense;
      state.gear.armorRarity = item.armor.rarity || item.rarity || 'uncommon';
      state.gear.armorIcon = item.armor.icon || item.iconKey || 'scale_armor';
    } else if (item.type === 'accessory') {
      addAndEquipAccessory(state, item.accessory);
    } else if (item.type === 'asset') {
      state.assets[item.assetKey] = true;
    }

    if (item.bonusEffects) {
      applyEffects(state, item.bonusEffects);
    }

    return { ok: true, msg: 'تم شراء «' + item.name + '» بنجاح.' };
  }

  function closeShop(state) {
    state.pendingShop = false;
  }

  function resolveChoice(state, choiceId, rngFn) {
    var rand = typeof rngFn === 'function' ? rngFn : Math.random;
    var event = findEventById(state.currentEventId);
    if (!event) return null;

    var available = getAvailableChoices(state, event);
    var choice = null;
    for (var i = 0; i < available.length; i++) {
      if (available[i].id === choiceId) {
        choice = available[i];
        break;
      }
    }
    if (!choice) return null;
    if (!canAffordChoice(state, choice).ok) return null;

    var status = 'neutral';
    var branch = choice.success;
    var chance = getChoiceChance(state, choice, event);

    if (chance !== null && choice.fail) {
      var roll = rand() * 100;
      if (roll <= chance) {
        status = 'success';
        branch = choice.success;
      } else {
        status = 'fail';
        branch = choice.fail;
      }
      state.tempCheckBonus = 0;
      if (state.flags && state.flags.antidoteActive) state.flags.antidoteActive = false;
    }

    var outcomeText = resolveText(branch.text, state);
    var deltas = applyEffects(state, branch.effects, rand, event.category);

    if (!event.repeatable && state.usedEvents.indexOf(event.id) === -1) {
      state.usedEvents.push(event.id);
    }

    var periodStr = 'عمر ' + state.age + ' • ' + GameApp.State.getPeriodLabel(state);
    state.pendingShop = false;
    state.chronicle.unshift({
      turnIndex: state.turnIndex,
      turnLabel: periodStr,
      title: event.title,
      choiceLabel: choice.label,
      status: status,
      outcomeSummary: outcomeText
    });

    state.lastOutcome = {
      status: status,
      chance: chance,
      text: outcomeText,
      deltas: deltas,
      category: event.category,
      isRoutine: Boolean(event.repeatable)
    };
    state.awaitingNext = true;

    if (state.hp <= 0) {
      state.phase = 'ended';
      var isAssassination = event.category === 'assassin' || state.threat >= 50;
      state.endingId = isAssassination ? 'ending_assassinated' : 'ending_fallen';
      state.awaitingNext = false;
      if (GameApp.Storage) {
        GameApp.Storage.unlockEnding(state.endingId);
      }
    }

    return state.lastOutcome;
  }

  function applyAnnualEconomy(state, finishedYear) {
    if (state.assets && state.assets.caravanShare) {
      var caravanIncome = (state.skills && state.skills.trade >= 10) ? 30 : 22;
      state.gold += caravanIncome;
    }
    var TDefs = GameApp.State && GameApp.State.TRAIT_EFFECTS;
    if (TDefs && Array.isArray(state.traits)) {
      state.traits.forEach(function (tr) {
        if (TDefs[tr] && TDefs[tr].annualGold) {
          state.gold += TDefs[tr].annualGold;
        }
      });
    }
    if (state.assets && state.assets.safeHouse) {
      state.threat = clamp(state.threat - 8, 0, 100);
    }
    // Annual living & war tax after age 10 to curb gold inflation
    state.lastYearTax = 0;
    if (finishedYear >= 11 && finishedYear <= 17) {
      var targetTax = finishedYear >= 14 ? 26 : 14;
      var paidTax = Math.min(state.gold, targetTax);
      state.gold -= paidTax;
      state.lastYearTax = paidTax;
    }
    // Ongoing war erosion of Human & Family trust when aligned with Demons
    if (finishedYear >= 14 && (state.warAlignment === 'demons' || (state.factions && state.factions.demons >= 20))) {
      state.factions.humans = clamp((state.factions.humans || 0) - 9, -100, 100);
      state.factions.family = clamp((state.factions.family || 0) - 4, -100, 100);
    }
  }

  function advanceTurn(state, rngFn) {
    if (state.phase === 'ended') return null;

    ensureStateIntegrity(state);
    state.awaitingNext = false;
    state.lastOutcome = null;
    state.currentEventId = null;

    var finishedYear = null;

    if (state.phase === 'childhood') {
      state.turnIndex += 1;
      state.quarter += 1;
      if (state.quarter > 4) {
        finishedYear = state.age;
        state.quarter = 1;
        state.age += 1;
      }
      if (state.age > 10) {
        state.phase = 'youth';
        state.period = 1;
      }
    } else if (state.phase === 'youth') {
      // Check if we just finished the final station (Age 18 Period 6) -> keep Age at 18!
      if (state.age >= 18 && state.period >= 6) {
        state.phase = 'ended';
        state.endingId = GameApp.Endings.resolveFinalEnding(state);
        if (GameApp.Storage) {
          GameApp.Storage.unlockEnding(state.endingId);
        }
        return null;
      }

      if (state.age === 18 && state.period === 5) {
        finishedYear = 18; // Final Pre-Climax Market before Period 6 Battle!
      }

      state.turnIndex += 1;
      state.period += 1;
      if (state.period > 6) {
        finishedYear = state.age;
        state.period = 1;
        state.age += 1;
      }
    }

    if (finishedYear !== null && finishedYear >= 8) {
      applyAnnualEconomy(state, finishedYear);
      state.pendingShop = true;
      state.shopYear = finishedYear;
    }

    // Hardcore: only minimal childhood growth recovery (+1 HP on Q1/Q3), zero free regen in Youth
    if (state.hp > 0 && state.hp < state.maxHp && state.phase === 'childhood' && state.quarter % 2 === 1) {
      state.hp = Math.min(state.maxHp, state.hp + 1);
    }

    var nextEv = selectNextEvent(state, rngFn);
    if (nextEv) {
      state.currentEventId = nextEv.id;
    }
    return nextEv;
  }

  function applyLegacyToState(st, legacy) {
    if (!legacy) return;
    if (legacy.gold) st.gold += legacy.gold;
    if (legacy.int) st.attributes.int += legacy.int;
    if (legacy.agi) st.attributes.agi += legacy.agi;
    if (legacy.ins) st.attributes.ins += legacy.ins;
    if (legacy.healing) st.elixirs.healing += legacy.healing;
    if (legacy.antidote) st.elixirs.antidote += legacy.antidote;
    if (legacy.focus) st.elixirs.focus += legacy.focus;
    if (legacy.skills) {
      Object.keys(legacy.skills).forEach(function (sk) {
        st.skills[sk] = (st.skills[sk] || 0) + legacy.skills[sk];
      });
    }
    if (legacy.trait && st.traits.indexOf(legacy.trait) === -1) {
      st.traits.push(legacy.trait);
    }
    if (legacy.unlockSwordRumors) {
      st.flags.knowsSwordRumorLegacy = true;
    }
    st.flags.legacyApplied = legacy.title;
  }

  function startNewGame(rngFn, options) {
    var st = GameApp.State.createInitialState();
    var opts = options || {};
    var allowLegacy = opts.useLegacy !== undefined ? opts.useLegacy : false;
    if (allowLegacy && GameApp.Storage && GameApp.Storage.getLegacyBonus) {
      applyLegacyToState(st, GameApp.Storage.getLegacyBonus());
    }
    var firstEv = selectNextEvent(st, rngFn);
    if (firstEv) {
      st.currentEventId = firstEv.id;
    }
    return st;
  }

  GameApp.Engine = {
    ensureStateIntegrity: ensureStateIntegrity,
    getAllEvents: getAllEvents,
    findEventById: findEventById,
    selectNextEvent: selectNextEvent,
    getAvailableChoices: getAvailableChoices,
    getChoiceChance: getChoiceChance,
    getChoiceSynergyCount: getChoiceSynergyCount,
    getDamageMitigation: getDamageMitigation,
    canAffordChoice: canAffordChoice,
    resolveText: resolveText,
    equipAccessory: equipAccessory,
    useElixir: useElixir,
    buyShopItem: buyShopItem,
    closeShop: closeShop,
    resolveChoice: resolveChoice,
    advanceTurn: advanceTurn,
    startNewGame: startNewGame,
    clamp: clamp
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.Engine;
  }
})(typeof window !== 'undefined' ? window : globalThis);

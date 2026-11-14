(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  function getMeta() {
    return GameApp.V6NarrativeMeta;
  }

  function getShop() {
    return GameApp.V6ShopData;
  }

  function clamp(val, lo, hi) {
    return Math.max(lo, Math.min(hi, val));
  }

  function createDefaultCharRecord() {
    return {
      met: false,
      alive: true,
      loyalty: 0,
      trust: 0,
      fear: 0,
      questStage: 0,
      romance: false,
      betrayed: false,
      relationshipStage: 'stranger'
    };
  }

  function initCharactersState(state) {
    var Meta = getMeta();
    state.characters = state.characters || { roster: {}, companionId: null, encounteredTransient: {} };
    state.characters.roster = state.characters.roster || {};
    state.characters.encounteredTransient = state.characters.encounteredTransient || {};

    Object.keys(Meta.MAIN_CHARACTERS).forEach(function (charId) {
      if (!state.characters.roster[charId]) {
        state.characters.roster[charId] = createDefaultCharRecord();
      }
    });
    return state.characters.roster;
  }

  function recomputeRelationshipStage(state, charId, rec, def) {
    if (!rec.alive) {
      rec.relationshipStage = 'deceased';
      return;
    }
    if (rec.betrayed) {
      rec.relationshipStage = 'betrayed';
      return;
    }
    if (!rec.met) {
      rec.relationshipStage = 'stranger';
      return;
    }
    if (rec.romance) {
      rec.relationshipStage = 'partner';
      return;
    }
    if (state.timeline.chapter >= 3 && def.romanceable && rec.loyalty >= 65 && rec.trust >= 60) {
      rec.romance = true;
      rec.relationshipStage = 'partner';
      return;
    }
    if (rec.loyalty >= 55 && rec.trust >= 45) {
      rec.relationshipStage = 'blood_oath';
    } else if (rec.loyalty >= 25) {
      rec.relationshipStage = 'ally';
    } else if (rec.loyalty <= -25) {
      rec.relationshipStage = 'rival';
    } else {
      rec.relationshipStage = 'acquaintance';
    }
  }

  function checkBetrayal(state, charId) {
    var Meta = getMeta();
    var def = Meta.MAIN_CHARACTERS[charId];
    var rec = state.characters.roster[charId];
    if (!def || !rec || !rec.met || !rec.alive || rec.betrayed) return false;

    var flags = (state.progression && state.progression.flags) || {};
    var rule = def.betrayalRule;
    var severeHostility = rec.loyalty <= -40 && rec.trust <= -20;
    var triggeredRule = rule && flags[rule.flag] && rec.loyalty <= rule.minLoyalty;

    if (severeHostility || triggeredRule) {
      rec.betrayed = true;
      rec.romance = false;
      rec.relationshipStage = 'betrayed';
      if (state.characters.companionId === charId) {
        setActiveCompanion(state, null);
      }
      return true;
    }
    return false;
  }

  function meetCharacter(state, charId, initialDelta) {
    initCharactersState(state);
    var Meta = getMeta();
    var def = Meta.MAIN_CHARACTERS[charId];
    if (!def) return { ok: false, reason: 'شخصية غير معروفة.' };

    var rec = state.characters.roster[charId];
    var firstTime = !rec.met;
    rec.met = true;

    if (initialDelta) {
      return shiftRelationship(state, charId, initialDelta);
    }
    recomputeRelationshipStage(state, charId, rec, def);
    return { ok: true, firstTime: firstTime, record: rec, character: def };
  }

  function shiftRelationship(state, charId, delta) {
    initCharactersState(state);
    var Meta = getMeta();
    var def = Meta.MAIN_CHARACTERS[charId];
    var rec = state.characters.roster[charId];
    if (!def || !rec) return { ok: false, reason: 'شخصية غير معروفة.' };
    if (!rec.alive) return { ok: false, reason: 'الشخصية متوفاة.' };

    rec.met = true;
    if (typeof delta.loyalty === 'number') rec.loyalty = clamp(rec.loyalty + delta.loyalty, -100, 100);
    if (typeof delta.trust === 'number') rec.trust = clamp(rec.trust + delta.trust, -100, 100);
    if (typeof delta.fear === 'number') rec.fear = clamp(rec.fear + delta.fear, 0, 100);
    if (typeof delta.questStage === 'number') rec.questStage = Math.max(rec.questStage, delta.questStage);
    if (delta.kill) {
      rec.alive = false;
      if (state.characters.companionId === charId) {
        setActiveCompanion(state, null);
      }
    }

    var betrayedNow = checkBetrayal(state, charId);
    recomputeRelationshipStage(state, charId, rec, def);

    return {
      ok: true,
      betrayedNow: betrayedNow,
      record: rec,
      character: def
    };
  }

  function setActiveCompanion(state, charId) {
    initCharactersState(state);
    var Meta = getMeta();
    if (!charId) {
      state.characters.companionId = null;
      state.economy.retinueUpkeep = 0;
      return { ok: true, companionId: null };
    }
    var def = Meta.MAIN_CHARACTERS[charId];
    var rec = state.characters.roster[charId];
    if (!def || !rec) return { ok: false, reason: 'شخصية غير معروفة.' };
    if (!rec.met) return { ok: false, reason: 'لم تلتقِ بهذه الشخصية بعد.' };
    if (!rec.alive) return { ok: false, reason: 'هذه الشخصية لم تعد على قيد الحياة.' };
    if (rec.betrayed) return { ok: false, reason: 'لا يمكن مرافقة من خانك أو خنته.' };
    if (rec.loyalty < 10 && rec.fear < 45) {
      return { ok: false, reason: 'يتطلب الأمر ولاءً (10+) أو هيبة/خوفاً (45+) لإقناع ' + def.name + ' بمرافقتك.' };
    }

    state.characters.companionId = charId;
    state.economy.retinueUpkeep = def.upkeep || 0;
    return { ok: true, companionId: charId, character: def, upkeep: state.economy.retinueUpkeep };
  }

  function getCompanionModifiers(state) {
    var cid = state.characters && state.characters.companionId;
    if (!cid) return {};
    var def = getMeta().MAIN_CHARACTERS[cid];
    return def && def.companionBonus ? def.companionBonus : {};
  }

  function recordTransientEncounter(state, npcId, meaningfulChoiceFlag) {
    initCharactersState(state);
    var npc = getMeta().TRANSIENT_NPCS[npcId];
    if (!npc) return { ok: false, reason: 'شخصية عابرة غير معروفة.' };

    state.characters.encounteredTransient[npcId] = {
      age: state.timeline.age,
      cityId: state.timeline.locationId,
      meaningful: Boolean(meaningfulChoiceFlag)
    };
    if (meaningfulChoiceFlag && typeof meaningfulChoiceFlag === 'string') {
      state.progression.flags[meaningfulChoiceFlag] = true;
    }
    return { ok: true, npc: npc };
  }

  function evaluatePrestigeAchievements(state) {
    var Meta = getMeta();
    var Shop = getShop();
    var flags = (state.progression && state.progression.flags) || {};
    var stats = state.stats || {};
    var skills = state.skills || {};
    var roster = initCharactersState(state);
    var combatsWon = flags.combat_victories || 0;
    var retreats = flags.combat_retreats || 0;

    var weapon = Shop && state.loadout.weaponId ? Shop.ITEMS[state.loadout.weaponId] : null;
    var armor = Shop && state.loadout.armorId ? Shop.ITEMS[state.loadout.armorId] : null;
    var highRarities = { epic: true, legendary: true };

    var conditions = {
      the_strongest: {
        age23: state.timeline.age >= 23,
        trial1: Boolean(flags.won_frontier_trial_ch1),
        trial2: Boolean(flags.won_arena_gauntlet_ch2),
        trial3: Boolean(flags.won_grand_champion_duel_ch3),
        combatStats: (skills.combat || 0) >= 6 && (stats.str || 0) >= 10 && combatsWon >= 8 && retreats === 0,
        epicLoadout: Boolean(weapon && highRarities[weapon.rarity] && armor && highRarities[armor.rarity])
      },
      king_of_humans: {
        cipherCh1: Boolean(flags.found_royal_cipher),
        factionsCh2: state.factions.legion >= 45 && state.factions.merchants >= 40,
        councilCh3: Boolean(flags.won_capital_council_ch3),
        rulerStats: (skills.politics || 0) >= 6 && (stats.cha || 0) >= 10 && (state.economy.properties || []).length >= 2 && state.vitals.debt === 0,
        loyalBacker: (roster.marcus_legion.loyalty >= 45 && roster.marcus_legion.alive && !roster.marcus_legion.betrayed)
          || (roster.salim_merchant.loyalty >= 45 && roster.salim_merchant.alive && !roster.salim_merchant.betrayed)
      },
      sovereign_of_shadow: {
        earlyShadow: Boolean(flags.knows_underbelly),
        noBrand: (state.scars || []).indexOf('scar_brand') === -1,
        purgeCouncil: Boolean(flags.purged_shadow_council_ch2),
        twinRegicide: Boolean(flags.shadow_twin_regicide),
        phantomStats: state.timeline.age >= 24 && (skills.stealth || 0) >= 7 && state.vitals.suspicion <= 35 && roster.lyra_shadow.loyalty >= 40 && !roster.lyra_shadow.betrayed
      },
      unscarred_survivor: {
        hardDiff: state.difficulty === 'hard' || state.difficulty === 'nightmare',
        age25: state.timeline.age >= 25 && state.vitals.hp > 0,
        zeroScars: (state.scars || []).length === 0 && state.vitals.debt === 0,
        fiveWins: combatsWon >= 5 && Boolean(flags.refused_shadow_blood)
      },
      alchemist_prophet: {
        veraBond: roster.vera_alchemist.loyalty >= 55 && roster.vera_alchemist.trust >= 50 && roster.vera_alchemist.alive,
        trialWon: Boolean(flags.won_inquisition_trial),
        panacea: Boolean(flags.crafted_philosopher_elixir) && (skills.alchemy || 0) >= 6 && (stats.int || 0) >= 11
      }
    };

    var newlyUnlocked = [];
    var report = {};
    state.progression.prestigeProgress = state.progression.prestigeProgress || {};

    Object.keys(Meta.PRESTIGE_ACHIEVEMENTS).forEach(function (achId) {
      var def = Meta.PRESTIGE_ACHIEVEMENTS[achId];
      var map = conditions[achId] || {};
      var keys = def.checks.map(function (c) { return c.key; });
      var metCount = 0;
      var missing = [];

      def.checks.forEach(function (chk) {
        if (map[chk.key]) {
          metCount += 1;
        } else {
          missing.push(chk.label);
        }
      });

      var unlocked = keys.length > 0 && metCount === keys.length;
      var prev = Boolean(state.progression.prestigeProgress[achId] && state.progression.prestigeProgress[achId].unlocked);
      if (unlocked && !prev) {
        newlyUnlocked.push(def);
      }

      var entry = {
        id: achId,
        name: def.name,
        unlocked: unlocked || prev,
        metCount: metCount,
        totalChecks: keys.length,
        ratio: keys.length ? Math.round((metCount / keys.length) * 100) : 0,
        missing: missing
      };
      state.progression.prestigeProgress[achId] = entry;
      report[achId] = entry;
    });

    return {
      newlyUnlocked: newlyUnlocked,
      report: report
    };
  }

  GameApp.V6CastEngine = {
    initCharactersState: initCharactersState,
    meetCharacter: meetCharacter,
    shiftRelationship: shiftRelationship,
    checkBetrayal: checkBetrayal,
    setActiveCompanion: setActiveCompanion,
    getCompanionModifiers: getCompanionModifiers,
    recordTransientEncounter: recordTransientEncounter,
    evaluatePrestigeAchievements: evaluatePrestigeAchievements
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6CastEngine;
  }
})(typeof window !== 'undefined' ? window : globalThis);

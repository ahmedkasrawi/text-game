(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  function getSchema() {
    return GameApp.V6Schema;
  }

  function getWorldData() {
    return GameApp.V6WorldData;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function getChapterForAge(age) {
    if (age <= 11) return 1;
    if (age <= 17) return 2;
    return 3;
  }

  function getTurnsPerYearForChapter(chapter) {
    var Schema = getSchema();
    var ch = Schema.CHAPTERS[chapter];
    return ch ? ch.turnsPerYear : 4;
  }

  function getSeasonLabel(chapter, season) {
    var World = getWorldData();
    var list = World.SEASON_LABELS[chapter] || World.SEASON_LABELS[1];
    var idx = clamp((season || 1) - 1, 0, list.length - 1);
    return list[idx];
  }

  function getDifficultyConfig(state) {
    var Schema = getSchema();
    return Schema.DIFFICULTIES[state.difficulty] || Schema.DIFFICULTIES.hard;
  }

  function computeSeasonalLivingCost(state) {
    var ch = state.timeline.chapter;
    var city = getWorldData().CITIES[state.timeline.locationId] || getWorldData().CITIES.ash_frontier;
    var diff = getDifficultyConfig(state);
    var base = 0;
    if (ch === 2) base = 4;
    else if (ch === 3) base = 14;
    var upkeep = state.economy && state.economy.retinueUpkeep ? state.economy.retinueUpkeep : 0;
    return Math.round((base * city.taxLevel * diff.taxMult) + upkeep);
  }

  function computePropertyReport(state, rng) {
    var World = getWorldData();
    var rand = typeof rng === 'function' ? rng : Math.random;
    var owned = (state.economy && state.economy.properties) || [];
    var totalIncome = 0;
    var totalUpkeep = 0;
    var totalSuspicionDelta = 0;
    var alerts = [];
    var diff = getDifficultyConfig(state);

    owned.forEach(function (propId) {
      var prop = World.PROPERTIES[propId];
      if (!prop) return;
      var city = World.CITIES[prop.cityId];
      var gross = prop.incomePerTurn;

      // High suspicion threatens smuggling warehouses & caravans
      if (propId === 'port_warehouse' && state.vitals.suspicion >= 55 && rand() < 0.35) {
        gross = Math.round(gross * 0.35);
        alerts.push('تفتيش جمركي في ميناء الملح خفّض أرباح مستودعك.');
      } else if (propId === 'caravan_share' && rand() < (0.14 * diff.taxMult)) {
        gross = Math.round(gross * 0.5);
        alerts.push('قطاع الطرق اعترضوا قافلتك مما اقتطع نصف عائد الموسم.');
      }

      totalIncome += gross;
      totalUpkeep += Math.round(prop.upkeep * (city ? city.taxLevel : 1));
      totalSuspicionDelta += prop.suspicionDelta || 0;
    });

    return {
      grossIncome: totalIncome,
      upkeep: totalUpkeep,
      netIncome: totalIncome - totalUpkeep,
      suspicionDelta: totalSuspicionDelta,
      alerts: alerts
    };
  }

  function getScarEffectsSummary(state) {
    var World = getWorldData();
    var summary = { travelStaminaPenalty: 0, suspicionFloor: 0 };
    (state.scars || []).forEach(function (scarId) {
      var scar = World.SCARS_CATALOG[scarId];
      if (!scar) return;
      if (scar.travelStaminaPenalty) summary.travelStaminaPenalty += scar.travelStaminaPenalty;
      if (scar.suspicionFloor && scar.suspicionFloor > summary.suspicionFloor) {
        summary.suspicionFloor = scar.suspicionFloor;
      }
    });
    return summary;
  }

  function applyScar(state, scarId) {
    var World = getWorldData();
    var scar = World.SCARS_CATALOG[scarId];
    if (!scar) return { ok: false, reason: 'ندبة غير معروفة' };
    state.scars = state.scars || [];
    if (state.scars.indexOf(scarId) !== -1) {
      return { ok: false, alreadyHas: true, reason: 'الشخصية تحمل هذه الندبة بالفعل' };
    }
    state.scars.push(scarId);
    Object.keys(scar.mods || {}).forEach(function (stat) {
      if (typeof state.stats[stat] === 'number') {
        state.stats[stat] = Math.max(1, state.stats[stat] + scar.mods[stat]);
      }
    });
    var summary = getScarEffectsSummary(state);
    if (state.vitals.suspicion < summary.suspicionFloor) {
      state.vitals.suspicion = summary.suspicionFloor;
    }
    return { ok: true, scar: scar };
  }

  function isCityUnlocked(state, cityId) {
    var World = getWorldData();
    var city = World.CITIES[cityId];
    if (!city) return { unlocked: false, reason: 'مدينة غير معروفة' };

    var age = state.timeline.age;
    var flags = (state.progression && state.progression.flags) || {};
    if (city.unlockFlag && flags[city.unlockFlag] && age >= city.minAge) {
      return { unlocked: true };
    }
    var effectiveMinAge = city.autoUnlockAge || city.minAge;
    if (age < effectiveMinAge) {
      return {
        unlocked: false,
        reason: 'تُفتح مدينة ' + city.name + ' في سن ' + effectiveMinAge + ' (أو باكتشاف طريقها السري).'
      };
    }
    return { unlocked: true };
  }

  function canTravelTo(state, targetCityId) {
    var World = getWorldData();
    var fromId = state.timeline.locationId;
    if (fromId === targetCityId) {
      return { ok: false, reason: 'أنت بالفعل في هذه المدينة.' };
    }
    var lockCheck = isCityUnlocked(state, targetCityId);
    if (!lockCheck.unlocked) {
      return { ok: false, reason: lockCheck.reason };
    }
    var route = World.TRAVEL_ROUTES[fromId] && World.TRAVEL_ROUTES[fromId][targetCityId];
    if (!route) {
      return { ok: false, reason: 'لا يوجد طريق مفتوح حالياً لهذه الوجهة.' };
    }
    var scarFX = getScarEffectsSummary(state);
    var totalStamina = route.stamina + scarFX.travelStaminaPenalty;
    if (state.vitals.gold < route.gold) {
      return { ok: false, reason: 'الذهب غير كافٍ لتكلفة السفر (' + route.gold + ').' };
    }
    if (state.vitals.stamina < totalStamina) {
      return { ok: false, reason: 'الجهد المتبقي غير كافٍ للسفر (' + totalStamina + ').' };
    }
    return {
      ok: true,
      route: route,
      goldCost: route.gold,
      staminaCost: totalStamina,
      city: World.CITIES[targetCityId]
    };
  }

  function travelToCity(state, targetCityId, rng) {
    var check = canTravelTo(state, targetCityId);
    if (!check.ok) return check;

    var rand = typeof rng === 'function' ? rng : Math.random;
    var diff = getDifficultyConfig(state);
    state.vitals.gold -= check.goldCost;
    state.vitals.stamina = Math.max(0, state.vitals.stamina - check.staminaCost);
    state.timeline.locationId = targetCityId;

    var suspicionBoost = (state.vitals.suspicion / 100) * 0.25;
    var ambushChance = clamp((check.route.risk + suspicionBoost) * diff.damageMult, 0.05, 0.65);
    var ambushTriggered = rand() < ambushChance;
    var ambushHpLoss = 0;

    if (ambushTriggered) {
      ambushHpLoss = Math.round((8 + Math.floor(rand() * 10)) * diff.damageMult);
      state.vitals.hp = Math.max(1, state.vitals.hp - ambushHpLoss);
    }

    return {
      ok: true,
      arrived: true,
      city: check.city,
      goldSpent: check.goldCost,
      staminaSpent: check.staminaCost,
      ambushTriggered: ambushTriggered,
      ambushHpLoss: ambushHpLoss,
      message: ambushTriggered
        ? 'وصلت إلى ' + check.city.name + ' بعد كمينٍ في الطريق كلفك ' + ambushHpLoss + ' صحة.'
        : 'وصلت بأمان إلى ' + check.city.name + '.'
    };
  }

  function buyProperty(state, propId) {
    var World = getWorldData();
    var prop = World.PROPERTIES[propId];
    if (!prop) return { ok: false, reason: 'عقار غير معروف' };
    if (state.timeline.age < prop.minAge) {
      return { ok: false, reason: 'يتطلب شراء ' + prop.name + ' بلوغ سن ' + prop.minAge + '.' };
    }
    state.economy.properties = state.economy.properties || [];
    if (state.economy.properties.indexOf(propId) !== -1) {
      return { ok: false, reason: 'تمتلك هذا العقار بالفعل.' };
    }
    if (state.vitals.gold < prop.cost) {
      return { ok: false, reason: 'الذهب غير كافٍ لشراء ' + prop.name + ' (' + prop.cost + ').' };
    }
    state.vitals.gold -= prop.cost;
    state.economy.properties.push(propId);
    return { ok: true, property: prop };
  }

  function takeLoan(state, amount, lenderId) {
    var World = getWorldData();
    var lender = World.LOAN_TERMS[lenderId || 'merchants'] || World.LOAN_TERMS.merchants;
    if (amount <= 0 || amount > 500) {
      return { ok: false, reason: 'قيمة القرض يجب أن تكون بين 1 و500 ذهب.' };
    }
    if (state.vitals.debt > 0) {
      return { ok: false, reason: 'لا يمكنك فتح قرض جديد قبل سداد دينك القائم.' };
    }
    var totalOwed = Math.round(amount * (1 + lender.interestRate));
    state.vitals.gold += amount;
    state.vitals.debt = totalOwed;
    state.vitals.debtDueTurn = state.timeline.turn + lender.termTurns;
    state.progression.flags.current_lender = lender.id;
    return {
      ok: true,
      borrowed: amount,
      totalOwed: totalOwed,
      dueTurn: state.vitals.debtDueTurn,
      lender: lender
    };
  }

  function repayDebt(state, amount) {
    if (state.vitals.debt <= 0) return { ok: false, reason: 'لا توجد ديون قائمة عليك.' };
    var pay = Math.min(amount || state.vitals.debt, state.vitals.debt, state.vitals.gold);
    if (pay <= 0) return { ok: false, reason: 'لا تملك ذهباً لسداد الدين.' };
    state.vitals.gold -= pay;
    state.vitals.debt -= pay;
    if (state.vitals.debt === 0) {
      state.vitals.debtDueTurn = 0;
      delete state.progression.flags.debt_defaulted;
      state.vitals.suspicion = Math.max(getScarEffectsSummary(state).suspicionFloor, state.vitals.suspicion - 6);
    }
    return { ok: true, paid: pay, remainingDebt: state.vitals.debt };
  }

  function restAndRecover(state) {
    var cost = state.timeline.chapter === 1 ? 0 : (state.timeline.chapter === 2 ? 4 : 8);
    if (state.vitals.gold < cost) {
      return { ok: false, reason: 'لا يكفي الذهب لاستئجار نُزُل للراحة.' };
    }
    state.vitals.gold -= cost;
    var staminaGain = 45;
    var hpGain = 14;
    state.vitals.stamina = Math.min(state.vitals.maxStamina, state.vitals.stamina + staminaGain);
    state.vitals.hp = Math.min(state.vitals.maxHp, state.vitals.hp + hpGain);
    return { ok: true, cost: cost, staminaGain: staminaGain, hpGain: hpGain };
  }

  function advanceTurn(state, rng) {
    var World = getWorldData();
    var rand = typeof rng === 'function' ? rng : Math.random;
    var logs = [];
    var prevChapter = state.timeline.chapter;

    // 1. Seasonal Economy Tick (properties vs living expenses + taxes)
    var propReport = computePropertyReport(state, rand);
    var livingCost = computeSeasonalLivingCost(state);
    var netGoldDelta = propReport.netIncome - livingCost;
    state.vitals.gold += netGoldDelta;

    propReport.alerts.forEach(function (a) { logs.push(a); });
    if (propReport.netIncome > 0) {
      logs.push('عائد أملاكك الصافي هذا الموسم: +' + propReport.netIncome + ' ذهب.');
    }
    if (livingCost > 0) {
      logs.push('مصاريف المعيشة والضرائب: -' + livingCost + ' ذهب.');
    }

    // Apply property suspicion shifts respectfully above scar floor
    var scarFloor = getScarEffectsSummary(state).suspicionFloor;
    state.vitals.suspicion = clamp(state.vitals.suspicion + propReport.suspicionDelta, scarFloor, 100);

    // 2. Debt check & penalties
    if (state.vitals.debt > 0) {
      if (state.timeline.turn >= state.vitals.debtDueTurn) {
        var lenderKey = state.progression.flags.current_lender || 'merchants';
        var lender = World.LOAN_TERMS[lenderKey] || World.LOAN_TERMS.merchants;
        state.vitals.debt = Math.round(state.vitals.debt * 1.15);
        state.vitals.suspicion = clamp(state.vitals.suspicion + lender.suspicionPenaltyOnDefault, scarFloor, 100);
        state.progression.flags.debt_defaulted = true;
        state.vitals.hp = Math.max(0, state.vitals.hp - 12);
        logs.push('تأخرت عن سداد الدين لـ ' + lender.name + '! تضاعفت الشبهة وتعرضت لمطاردة.');
      }
    }

    // 3. Bankruptcy/starvation check
    if (state.vitals.gold < 0) {
      var shortfall = Math.abs(state.vitals.gold);
      state.vitals.gold = 0;
      var hpDamage = Math.min(18, 5 + Math.floor(shortfall / 4));
      state.vitals.hp = Math.max(0, state.vitals.hp - hpDamage);
      state.vitals.stamina = Math.max(10, state.vitals.stamina - 20);
      logs.push('عجز مالي عن تغطية نفقة الموسم (-' + hpDamage + ' صحة).');
    } else {
      var regen = state.progression.flags.debt_defaulted ? 12 : 24;
      state.vitals.stamina = Math.min(state.vitals.maxStamina, state.vitals.stamina + regen);
    }

    // 4. Advance calendar (season -> age -> chapter)
    var turnsInYear = getTurnsPerYearForChapter(state.timeline.chapter);
    state.timeline.turn += 1;
    state.timeline.season += 1;
    var agedUp = false;

    if (state.timeline.season > turnsInYear) {
      state.timeline.season = 1;
      state.timeline.age += 1;
      agedUp = true;
      state.timeline.chapter = getChapterForAge(state.timeline.age);
    }

    var chapterChanged = state.timeline.chapter !== prevChapter;
    var reachedAdulthoodCap = state.timeline.age > 25;
    var died = state.vitals.hp <= 0;

    if (reachedAdulthoodCap || died) {
      state.progression.isEnded = true;
      if (died && !state.progression.endingId) {
        if (state.progression.flags.debt_defaulted) {
          state.progression.endingId = 'ending_debt_ruin';
        } else if (state.timeline.age < 18 || state.timeline.chapter < 3) {
          state.progression.endingId = 'ending_death_without_trace';
        } else {
          state.progression.endingId = 'ending_slain';
        }
      }
    }

    return {
      turn: state.timeline.turn,
      age: state.timeline.age,
      season: state.timeline.season,
      seasonLabel: getSeasonLabel(state.timeline.chapter, state.timeline.season),
      chapter: state.timeline.chapter,
      agedUp: agedUp,
      chapterChanged: chapterChanged,
      netGoldDelta: netGoldDelta,
      livingCost: livingCost,
      propertyIncome: propReport.netIncome,
      died: died,
      reachedAgeLimit: reachedAdulthoodCap,
      logs: logs
    };
  }

  GameApp.V6WorldTime = {
    getChapterForAge: getChapterForAge,
    getTurnsPerYearForChapter: getTurnsPerYearForChapter,
    getSeasonLabel: getSeasonLabel,
    computeSeasonalLivingCost: computeSeasonalLivingCost,
    computePropertyReport: computePropertyReport,
    getScarEffectsSummary: getScarEffectsSummary,
    applyScar: applyScar,
    isCityUnlocked: isCityUnlocked,
    canTravelTo: canTravelTo,
    travelToCity: travelToCity,
    buyProperty: buyProperty,
    takeLoan: takeLoan,
    repayDebt: repayDebt,
    restAndRecover: restAndRecover,
    advanceTurn: advanceTurn
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6WorldTime;
  }
})(typeof window !== 'undefined' ? window : globalThis);

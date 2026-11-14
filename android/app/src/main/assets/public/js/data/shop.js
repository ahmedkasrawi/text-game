(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var SHOP_ITEMS = [
    // --- Elixirs & Tactical Consumables ---
    {
      id: 'elixir_healing',
      type: 'elixir',
      elixirKey: 'healing',
      rarity: 'common',
      iconKey: 'elixir_heal',
      category: 'إكسير وجرعات',
      name: 'إكسير الشفاء العشبي',
      desc: 'يعيد +35 صحة فوراً عند استخدامه من الحقيبة في أي محطة (+12 مع وسم نور التعقيم).',
      price: 26,
      minAge: 8,
      repeatable: true
    },
    {
      id: 'elixir_antidote',
      type: 'elixir',
      elixirKey: 'antidote',
      rarity: 'uncommon',
      iconKey: 'elixir_anti',
      category: 'إكسير وجرعات',
      name: 'ترياق السموم النقي',
      desc: 'يخفض التهديد (-14) ويمنح +12% في الكمائن أو يبطل التسميم تلقائياً في الأحداث.',
      price: 30,
      minAge: 8,
      repeatable: true
    },
    {
      id: 'elixir_focus',
      type: 'elixir',
      elixirKey: 'focus',
      rarity: 'rare',
      iconKey: 'elixir_focus',
      category: 'إكسير وجرعات',
      name: 'جرعة التركيز الصافية',
      desc: 'تمنح +18% لفرصة نجاح اختبارك القادم عند شربها قبل اتخاذ القرار.',
      price: 40,
      minAge: 10,
      repeatable: true
    },
    {
      id: 'service_clear_threat',
      type: 'service',
      rarity: 'rare',
      iconKey: 'scroll_shadow',
      category: 'إكسير وجرعات',
      name: 'وثيقة تمويه وشطب ملاحقة',
      desc: 'رشوة وسطاء الظل والحرس لمحو آثارك فوراً (-28 تهديد).',
      price: 72,
      minAge: 11,
      repeatable: true,
      bonusEffects: { threat: -28 }
    },

    // --- Childhood & Basic Gear ---
    {
      id: 'wpn_balanced_dagger',
      type: 'weapon',
      rarity: 'common',
      iconKey: 'dagger',
      category: 'الأسلحة',
      name: 'نصل تدريب متوازن',
      desc: 'سلاح خفيف متين (+3 قوة سلاح).',
      price: 34,
      minAge: 8,
      maxAge: 12,
      weapon: { name: 'نصل تدريب متوازن', power: 3, rarity: 'common', icon: 'dagger' }
    },
    {
      id: 'arm_hunter_leather',
      type: 'armor',
      rarity: 'common',
      iconKey: 'leather_armor',
      category: 'الدروع',
      name: 'سترة صيد جلدية مبطنة',
      desc: 'توفر حماية عملية في الطفولة (+3 دفاع).',
      price: 32,
      minAge: 8,
      maxAge: 12,
      armor: { name: 'سترة صيد جلدية مبطنة', defense: 3, rarity: 'common', icon: 'leather_armor' }
    },

    // --- Youth & War Gear ---
    {
      id: 'wpn_guard_sword',
      type: 'weapon',
      rarity: 'uncommon',
      iconKey: 'sword',
      category: 'الأسلحة',
      name: 'سيف حرس الحامية',
      desc: 'فولاذ موثوق لمعارك الشباب (+5 قوة سلاح).',
      price: 75,
      minAge: 11,
      weapon: { name: 'سيف حرس الحامية', power: 5, rarity: 'uncommon', icon: 'sword' }
    },
    {
      id: 'arm_scale_steel',
      type: 'armor',
      rarity: 'uncommon',
      iconKey: 'scale_armor',
      category: 'الدروع',
      name: 'درع حراشف فولاذي',
      desc: 'يقلل خسائر الصحة ويعزز فحوصات الصمود (+5 دفاع).',
      price: 72,
      minAge: 11,
      armor: { name: 'درع حراشف فولاذي', defense: 5, rarity: 'uncommon', icon: 'scale_armor' }
    },
    {
      id: 'wpn_royal_blade',
      type: 'weapon',
      rarity: 'rare',
      iconKey: 'sword',
      category: 'الأسلحة',
      name: 'نصل الفارس الملكي',
      desc: 'سلاح حرب رفيع (+8 قوة سلاح). خصم 20% لحلفاء البشر (25+).',
      price: 165,
      minAge: 14,
      discountFaction: { key: 'humans', min: 25, rate: 0.8 },
      weapon: { name: 'نصل الفارس الملكي', power: 8, rarity: 'rare', icon: 'sword' }
    },
    {
      id: 'arm_fortress_plate',
      type: 'armor',
      rarity: 'rare',
      iconKey: 'plate_armor',
      category: 'الدروع',
      name: 'درع صفائح محصّن',
      desc: 'حماية ثقيلة للمعارك الكبرى (+8 دفاع). خصم 15% لحلفاء البشر (25+).',
      price: 155,
      minAge: 14,
      discountFaction: { key: 'humans', min: 25, rate: 0.85 },
      armor: { name: 'درع صفائح محصّن', defense: 8, rarity: 'rare', icon: 'plate_armor' }
    },
    {
      id: 'wpn_dawn_legend',
      type: 'weapon',
      rarity: 'legendary',
      iconKey: 'meteor_blade',
      category: 'الأسلحة',
      name: 'نصل الفجر الملكي المصفّى',
      desc: 'تحفة نادرة بسبائك الشمال (+11 قوة سلاح) وتزيد القتال (+1).',
      price: 290,
      minAge: 16,
      weapon: { name: 'نصل الفجر الملكي المصفّى', power: 11, rarity: 'legendary', icon: 'meteor_blade' },
      bonusEffects: { skill: { combat: 1 } }
    },
    {
      id: 'arm_meteor_plate',
      type: 'armor',
      rarity: 'epic',
      iconKey: 'mithril_armor',
      category: 'الدروع',
      name: 'درع ميثريل محصّن نادر',
      desc: 'خفيف الوزن فائق الصلابة للمواجهات النهائية (+11 دفاع).',
      price: 240,
      minAge: 15,
      armor: { name: 'درع ميثريل محصّن نادر', defense: 11, rarity: 'epic', icon: 'mithril_armor' }
    },

    // --- Racial Exclusive Gear (Available even if equal power because of unique bonuses!) ---
    {
      id: 'wpn_elven_whisper',
      type: 'weapon',
      rarity: 'epic',
      iconKey: 'elven_blade',
      category: 'عروض الأعراق',
      name: 'نصل همس الغابة (إلف)',
      desc: 'متاح لودّ الجان (18+): +7 قوة سلاح ويعزز الظلال والمكائد (+2) والبراعة (+1).',
      price: 120,
      minAge: 12,
      minFaction: { elves: 18 },
      allowSpecialBuy: true,
      weapon: { name: 'نصل همس الغابة', power: 7, rarity: 'epic', icon: 'elven_blade' },
      bonusEffects: { skill: { shadow: 2 }, attr: { agi: 1 } }
    },
    {
      id: 'wpn_demon_ember',
      type: 'weapon',
      rarity: 'epic',
      iconKey: 'demon_sword',
      category: 'عروض الأعراق',
      name: 'سيف جمر الهاوية (شياطين)',
      desc: 'متاح لودّ الشياطين (18+): سلاح فتاك (+10 قوة سلاح، +1 قتال) يرفع التهديد.',
      price: 190,
      minAge: 14,
      minFaction: { demons: 18 },
      allowSpecialBuy: true,
      weapon: { name: 'سيف جمر الهاوية', power: 10, rarity: 'epic', icon: 'demon_sword' },
      bonusEffects: { skill: { combat: 1 }, threat: 6 }
    },

    // --- Self-Forging Upgrades ---
    {
      id: 'forge_self_blade',
      type: 'weapon',
      rarity: 'rare',
      iconKey: 'anvil_sword',
      category: 'صياغة ذاتية بالحدادة',
      name: 'سبك نصل فولاذي مضاعف السقي',
      desc: 'متاح بمهارة الحدادة (5+): تدفع ثمن الخام فقط لصياغة سلاح (+7 قوة).',
      price: 58,
      minAge: 11,
      minSkill: { smithing: 5 },
      weapon: { name: 'نصل مزدوج السقي (صنع يدك)', power: 7, rarity: 'rare', icon: 'anvil_sword' }
    },
    {
      id: 'forge_master_armor',
      type: 'armor',
      rarity: 'epic',
      iconKey: 'plate_armor',
      category: 'صياغة ذاتية بالحدادة',
      name: 'تطريق درع فولاذي متداخل',
      desc: 'متاح بمهارة الحدادة (8+): تصنع درعاً فائقاً (+9 دفاع) بتكلفة الخام فقط.',
      price: 85,
      minAge: 13,
      minSkill: { smithing: 8 },
      armor: { name: 'درع السندان الخاص (صنع يدك)', defense: 9, rarity: 'epic', icon: 'plate_armor' }
    },

    // --- Accessories (Saved in Wardrobe!) ---
    {
      id: 'acc_wood_charm',
      type: 'accessory',
      rarity: 'uncommon',
      iconKey: 'charm_wood',
      category: 'التمائم والأدوات (تُحفظ للتبديل)',
      name: 'تميمة الخشب الحارس',
      desc: 'ترفع فرص اختبارات الظلال والمكائد والحدس (+6%).',
      price: 36,
      minAge: 8,
      accessory: {
        name: 'تميمة الخشب الحارس',
        desc: '+6% للظلال والحدس',
        rarity: 'uncommon',
        icon: 'charm_wood',
        bonus: { shadow: 6, ins: 6 }
      }
    },
    {
      id: 'acc_smith_lens',
      type: 'accessory',
      rarity: 'rare',
      iconKey: 'lens',
      category: 'التمائم والأدوات (تُحفظ للتبديل)',
      name: 'عدسة الصائغ الدقيق',
      desc: 'أداة معايرة ترفع فرص نجاح الحدادة والكيمياء (+9%).',
      price: 68,
      minAge: 11,
      accessory: {
        name: 'عدسة الصائغ الدقيق',
        desc: '+9% للحدادة والكيمياء',
        rarity: 'rare',
        icon: 'lens',
        bonus: { smithing: 9, alchemy: 9 }
      }
    },
    {
      id: 'acc_merchant_compass',
      type: 'accessory',
      rarity: 'rare',
      iconKey: 'compass',
      category: 'التمائم والأدوات (تُحفظ للتبديل)',
      name: 'بوصلة القوافل الذهبية',
      desc: 'ترفع فرص الصفقات والكاريزما (+9% تجارة، +6% كاريزما).',
      price: 72,
      minAge: 11,
      accessory: {
        name: 'بوصلة القوافل الذهبية',
        desc: '+9% للتجارة، +6% كاريزما',
        rarity: 'rare',
        icon: 'compass',
        bonus: { trade: 9, cha: 6 }
      }
    },
    {
      id: 'acc_silver_ring',
      type: 'accessory',
      rarity: 'rare',
      iconKey: 'ring',
      category: 'التمائم والأدوات (تُحفظ للتبديل)',
      name: 'خاتم الفضة الكاشف للسموم',
      desc: 'يرفع فرص كشف المكائد والظلال والحدس (+9% ظلال، +6% كيمياء).',
      price: 82,
      minAge: 11,
      accessory: {
        name: 'خاتم الفضة الكاشف للسموم',
        desc: '+9% ظلال ومكائد، +6% كيمياء',
        rarity: 'rare',
        icon: 'ring',
        bonus: { shadow: 9, alchemy: 6 }
      }
    },
    {
      id: 'acc_clarity_pendant',
      type: 'accessory',
      rarity: 'epic',
      iconKey: 'pendant',
      category: 'التمائم والأدوات (تُحفظ للتبديل)',
      name: 'قلادة البصيرة الصافية',
      desc: 'ترفع فرص نجاح اختبارات الذكاء والقتال والحدس (+8%).',
      price: 125,
      minAge: 13,
      accessory: {
        name: 'قلادة البصيرة الصافية',
        desc: '+8% للذكاء والقتال والحدس',
        rarity: 'epic',
        icon: 'pendant',
        bonus: { int: 8, combat: 8, ins: 8 }
      }
    },
    {
      id: 'acc_sword_crest',
      type: 'accessory',
      rarity: 'legendary',
      iconKey: 'crest_crown',
      category: 'التمائم والأدوات (تُحفظ للتبديل)',
      name: 'شارة النصل الأسمى',
      desc: 'تحفة نادرة ترفع فرص القتال ومسار السيف والبراعة (+10% قتال/سيف، +6% براعة).',
      price: 210,
      minAge: 15,
      accessory: {
        name: 'شارة النصل الأسمى',
        desc: '+10% قتال ومسار السيف، +6% براعة',
        rarity: 'legendary',
        icon: 'crest_crown',
        bonus: { combat: 10, sword_path: 10, agi: 6 }
      }
    },

    // --- Investments & Security Assets ---
    {
      id: 'asset_caravan',
      type: 'asset',
      assetKey: 'caravanShare',
      rarity: 'rare',
      iconKey: 'caravan',
      category: 'استثمارات خفيفة',
      name: 'حصة في قافلة تجارية',
      desc: 'استثمار مبكر يدر +22 ذهباً تلقائياً في نهاية كل عام (+30 إذا تجاوزت تجارتك 10).',
      price: 75,
      minAge: 9
    },
    {
      id: 'asset_safehouse',
      type: 'asset',
      assetKey: 'safeHouse',
      rarity: 'rare',
      iconKey: 'safehouse',
      category: 'استثمارات خفيفة',
      name: 'تحصين بيت العائلة',
      desc: 'أقفال وحراسة تخفض التهديد (-8 كل عام) وتقلل أضرار الكمائن (-2 صحة) وتعزز أمن الأسرة.',
      price: 85,
      minAge: 10
    }
  ];

  function isBlackMarket(state) {
    return (state.threat || 0) >= 55;
  }

  function getTradeDiscountPct(state) {
    var trade = (state.skills && state.skills.trade) || 0;
    var pct = trade >= 4 ? Math.min(32, Math.floor(trade / 3) * 3) : 0;
    var TDefs = GameApp.State && GameApp.State.TRAIT_EFFECTS;
    if (TDefs && Array.isArray(state.traits)) {
      state.traits.forEach(function (tr) {
        if (TDefs[tr] && TDefs[tr].shopDiscountPct) {
          pct += TDefs[tr].shopDiscountPct;
        }
      });
    }
    return Math.min(40, pct);
  }

  function getItemPrice(item, state) {
    var p = item.price;
    if (item.discountFaction && state.factions && !isBlackMarket(state)) {
      var val = state.factions[item.discountFaction.key] || 0;
      if (val >= item.discountFaction.min) {
        p = Math.round(p * item.discountFaction.rate);
      }
    }
    if (isBlackMarket(state) && item.id !== 'service_clear_threat') {
      p = Math.round(p * 1.3);
    }
    var discPct = getTradeDiscountPct(state);
    if (discPct > 0) {
      p = Math.max(10, Math.round(p * (1 - discPct / 100)));
    }
    return p;
  }

  function isItemVisible(item, state, shopAge) {
    var ageCheck = typeof shopAge === 'number' ? shopAge : state.age;
    if (typeof item.minAge === 'number' && ageCheck < item.minAge) return false;
    if (typeof item.maxAge === 'number' && ageCheck > item.maxAge) return false;

    if (!item.repeatable && state.boughtShopItems && state.boughtShopItems.indexOf(item.id) !== -1) {
      return false;
    }
    if (item.type === 'asset' && state.assets && state.assets[item.assetKey]) {
      return false;
    }
    if (item.type === 'weapon' && state.gear && state.gear.weaponPower >= item.weapon.power && !item.allowSpecialBuy) {
      return false;
    }
    if (item.type === 'armor' && state.gear && state.gear.armorDefense >= item.armor.defense && !item.allowSpecialBuy) {
      return false;
    }
    if (item.type === 'accessory' && state.ownedAccessories) {
      for (var k = 0; k < state.ownedAccessories.length; k++) {
        if (state.ownedAccessories[k].name === item.accessory.name) return false;
      }
    }
    if (item.minSkill) {
      var sks = Object.keys(item.minSkill);
      for (var i = 0; i < sks.length; i++) {
        if (((state.skills && state.skills[sks[i]]) || 0) < item.minSkill[sks[i]]) return false;
      }
    }
    if (item.minFaction) {
      var fks = Object.keys(item.minFaction);
      for (var j = 0; j < fks.length; j++) {
        if (((state.factions && state.factions[fks[j]]) || 0) < item.minFaction[fks[j]]) return false;
      }
    }
    return true;
  }

  function getAvailableShopItems(state) {
    var shopAge = state.shopYear || state.age;
    var items = SHOP_ITEMS.filter(function (item) {
      return isItemVisible(item, state, shopAge);
    }).map(function (item) {
      return {
        item: item,
        finalPrice: getItemPrice(item, state)
      };
    });

    // Prioritize items matching player's affordable needs / higher rarity upgrades first within categories
    items.sort(function (a, b) {
      var aAff = state.gold >= a.finalPrice ? 0 : 1;
      var bAff = state.gold >= b.finalPrice ? 0 : 1;
      if (aAff !== bAff) return aAff - bAff;
      return a.finalPrice - b.finalPrice;
    });
    return items;
  }

  GameApp.ShopData = {
    SHOP_ITEMS: SHOP_ITEMS,
    isBlackMarket: isBlackMarket,
    getTradeDiscountPct: getTradeDiscountPct,
    getItemPrice: getItemPrice,
    isItemVisible: isItemVisible,
    getAvailableShopItems: getAvailableShopItems
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.ShopData;
  }
})(typeof window !== 'undefined' ? window : globalThis);

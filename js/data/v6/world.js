(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var SEASON_LABELS = {
    1: ['الربيع', 'الصيف', 'الخريف', 'الشتاء'],
    2: ['مطلع الربيع', 'ذروة الربيع', 'قيظ الصيف', 'مطلع الخريف', 'صقيع الخريف', 'قلب الشتاء'],
    3: ['موسم الضرائب', 'الحملة الصيفية', 'الحصاد والقوافل', 'مؤتمرات الخريف', 'حصار الشتاء']
  };

  var CITIES = {
    ash_frontier: {
      id: 'ash_frontier',
      name: 'ثغر الرماد',
      regionTitle: 'الثغر الحدودي',
      sceneId: 'ash_frontier',
      minAge: 7,
      taxLevel: 0.85,
      dangerBase: 0.14,
      dominantFaction: 'legion',
      description: 'بلدة حدودية يختنق هواؤها برماد الحروب وأبخرة الحدادة. هنا تبدأ خطوات الغريب الأولى.',
      activities: ['الحدادة والحرف', 'مهام الفيلق', 'حراسة القوافل']
    },
    underbelly: {
      id: 'underbelly',
      name: 'الأحياء السفلى',
      regionTitle: 'تحت العاصمة',
      sceneId: 'underbelly',
      minAge: 9,
      unlockFlag: 'knows_underbelly',
      autoUnlockAge: 12,
      taxLevel: 0.4,
      dangerBase: 0.24,
      dominantFaction: 'shadow',
      description: 'متاهة من الأزقة المبللة بالمطر والأقبية السرية، حيث لا يرحم قانون نقابة الظل ضعيفاً.',
      activities: ['عقود الظل', 'السوق السوداء', 'مختبرات السموم']
    },
    royal_capital: {
      id: 'royal_capital',
      name: 'العاصمة الملكية',
      regionTitle: 'قلب الإمارات',
      sceneId: 'royal_capital',
      minAge: 12,
      taxLevel: 1.35,
      dangerBase: 0.1,
      dominantFaction: 'legion',
      description: 'أبراج حجرية باذخة تخفي خلف راياتها دسائس الأمراء ومجالس النفوذ والمصارف.',
      activities: ['سياسة البلاط', 'مناظرات النبلاء', 'شراء العقارات']
    },
    salt_port: {
      id: 'salt_port',
      name: 'ميناء الملح',
      regionTitle: 'الساحل الغربي',
      sceneId: 'salt_port',
      minAge: 12,
      taxLevel: 1.15,
      dangerBase: 0.16,
      dominantFaction: 'merchants',
      description: 'أرصفة السفن الخشبية وعقود التجارة البحرية حيث تُباع البضائع وتُغرق الديون أصحابها.',
      activities: ['تجارة القوافل', 'المصارف والقروض', 'صفقات التهريب']
    },
    iron_abbey: {
      id: 'iron_abbey',
      name: 'الدير الحصين',
      regionTitle: 'المرتفعات الصخرية',
      sceneId: 'iron_abbey',
      minAge: 12,
      taxLevel: 1.0,
      dangerBase: 0.12,
      dominantFaction: 'church',
      description: 'حصن النظام المقدس ومحاكم التفتيش؛ لا يصعد إليها إلا طالب عقيدة أو متهم يساق إلى الاعتراف.',
      activities: ['مكتبة المخطوطات', 'خدمة التفتيش', 'تطهير الشبهات']
    }
  };

  // Adjacency travel costs (stamina + gold + bandit risk)
  var TRAVEL_ROUTES = {
    ash_frontier: {
      royal_capital: { gold: 8, stamina: 18, risk: 0.14 },
      underbelly: { gold: 10, stamina: 20, risk: 0.18 },
      salt_port: { gold: 12, stamina: 24, risk: 0.2 },
      iron_abbey: { gold: 14, stamina: 28, risk: 0.22 }
    },
    royal_capital: {
      ash_frontier: { gold: 8, stamina: 18, risk: 0.12 },
      underbelly: { gold: 3, stamina: 10, risk: 0.16 },
      salt_port: { gold: 9, stamina: 16, risk: 0.12 },
      iron_abbey: { gold: 10, stamina: 20, risk: 0.14 }
    },
    underbelly: {
      royal_capital: { gold: 3, stamina: 10, risk: 0.15 },
      ash_frontier: { gold: 10, stamina: 20, risk: 0.18 },
      salt_port: { gold: 9, stamina: 18, risk: 0.17 },
      iron_abbey: { gold: 15, stamina: 26, risk: 0.24 }
    },
    salt_port: {
      royal_capital: { gold: 9, stamina: 16, risk: 0.12 },
      ash_frontier: { gold: 12, stamina: 24, risk: 0.2 },
      underbelly: { gold: 9, stamina: 18, risk: 0.18 },
      iron_abbey: { gold: 13, stamina: 24, risk: 0.19 }
    },
    iron_abbey: {
      royal_capital: { gold: 10, stamina: 20, risk: 0.13 },
      ash_frontier: { gold: 14, stamina: 28, risk: 0.21 },
      salt_port: { gold: 13, stamina: 24, risk: 0.18 },
      underbelly: { gold: 15, stamina: 26, risk: 0.25 }
    }
  };

  var PROPERTIES = {
    smithy_stall: {
      id: 'smithy_stall',
      name: 'ورشة حدادة حدودية',
      cityId: 'ash_frontier',
      minAge: 16,
      cost: 140,
      incomePerTurn: 28,
      upkeep: 6,
      suspicionDelta: 0,
      desc: 'ورشة تصليح أسلحة ودروع في الثغر؛ تدرّ دخلاً ثابتاً وتخفّض كلفة الصيانة.'
    },
    tavern_inn: {
      id: 'tavern_inn',
      name: 'نُزُل الحانة الحمراء',
      cityId: 'royal_capital',
      minAge: 18,
      cost: 190,
      incomePerTurn: 40,
      upkeep: 10,
      suspicionDelta: -2,
      desc: 'حانة يرتادها الجنود والجواسيس؛ توفر ذهباً موسمياً وأخباراً تخفّف عنك الشبهات.'
    },
    shadow_safehouse: {
      id: 'shadow_safehouse',
      name: 'مخبأ ظلال حصين',
      cityId: 'underbelly',
      minAge: 18,
      cost: 220,
      incomePerTurn: 26,
      upkeep: 6,
      suspicionDelta: -7,
      desc: 'قبو مخفي بممر هروب مزدوج؛ يقلّص الشبهة كل موسم ويؤمّن أتباعك.'
    },
    port_warehouse: {
      id: 'port_warehouse',
      name: 'مستودع ميناء الملح',
      cityId: 'salt_port',
      minAge: 18,
      cost: 240,
      incomePerTurn: 54,
      upkeep: 12,
      suspicionDelta: 1,
      desc: 'مخزن بضائع ساحلي يضاعف أرباح المواسم التجارية لكنه يلفت أعين المفتشين عند ارتفاع الشبهة.'
    },
    caravan_share: {
      id: 'caravan_share',
      name: 'حصة قافلة محروسة',
      cityId: 'salt_port',
      minAge: 19,
      cost: 320,
      incomePerTurn: 76,
      upkeep: 16,
      suspicionDelta: 0,
      desc: 'شراكة تجارية بين ثلاث إمارات؛ أعلى عائد في اللعبة لكنها حساسة للضرائب واضطرابات الطرق.'
    }
  };

  var SCARS_CATALOG = {
    scar_eye: {
      id: 'scar_eye',
      name: 'عين مفقودة',
      desc: 'نصلٌ أفقدك البصر في إحدى عينيك؛ يقلّل براعتك لكنه يمنحك هيبةً وفرصةً نادرة عند المرتزقة.',
      mods: { agi: -1, ins: 1 }
    },
    scar_leg: {
      id: 'scar_leg',
      name: 'عرج الثغور',
      desc: 'جرح قديم في الركبة لم يلتئم تماماً؛ يبطئ حركتك ويستنزف جهداً أكبر في السفر.',
      mods: { agi: -2 },
      travelStaminaPenalty: 6
    },
    scar_burn: {
      id: 'scar_burn',
      name: 'ندبة الحريق',
      desc: 'حروق النار تكسو كتفك وعنقك؛ تخيف الغرباء وتُصعّب الإقناع الناعم.',
      mods: { cha: -1, str: 1 }
    },
    scar_brand: {
      id: 'scar_brand',
      name: 'وسم الخيانة',
      desc: 'ختم حديدي ساخن من محاكم التفتيش أو الظل؛ يرفع الشبهة الدائمة ويغلق بعض أبواب البلاط.',
      mods: { cha: -2 },
      suspicionFloor: 15
    },
    scar_tremor: {
      id: 'scar_tremor',
      name: 'رجفة السموم',
      desc: 'أثر مزمن من سموم أو تعذيب قاسٍ؛ يضعف ثباتك البدني مقابل صلابة ذهنية.',
      mods: { str: -1, int: 1 }
    }
  };

  var LOAN_TERMS = {
    merchants: {
      id: 'merchants',
      name: 'مصرف اتحاد التجار',
      interestRate: 0.25,
      termTurns: 6,
      suspicionPenaltyOnDefault: 15
    },
    shadow: {
      id: 'shadow',
      name: 'مرابو نقابة الظل',
      interestRate: 0.45,
      termTurns: 4,
      suspicionPenaltyOnDefault: 28
    }
  };

  GameApp.V6WorldData = {
    SEASON_LABELS: SEASON_LABELS,
    CITIES: CITIES,
    TRAVEL_ROUTES: TRAVEL_ROUTES,
    PROPERTIES: PROPERTIES,
    SCARS_CATALOG: SCARS_CATALOG,
    LOAN_TERMS: LOAN_TERMS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6WorldData;
  }
})(typeof window !== 'undefined' ? window : globalThis);

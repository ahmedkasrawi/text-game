(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var QUARTERS = [
    { id: 1, name: 'الربيع', season: 'ربيع' },
    { id: 2, name: 'الصيف', season: 'صيف' },
    { id: 3, name: 'الخريف', season: 'خريف' },
    { id: 4, name: 'الشتاء', season: 'شتاء' }
  ];

  // 6 seasonal turns per year for ages 11 to 18 (48 youth turns + 16 childhood = 64 total)
  var PERIODS = [
    { id: 1, name: 'مطلع الربيع', season: 'ربيع' },
    { id: 2, name: 'أواخر الربيع', season: 'ربيع' },
    { id: 3, name: 'قلب الصيف', season: 'صيف' },
    { id: 4, name: 'أوائل الخريف', season: 'خريف' },
    { id: 5, name: 'أواخر الخريف', season: 'خريف' },
    { id: 6, name: 'قلب الشتاء', season: 'شتاء' }
  ];

  var ATTR_LABELS = {
    str: 'القوة',
    int: 'الذكاء',
    agi: 'البراعة',
    cha: 'الكاريزما',
    ins: 'الحدس'
  };

  var SKILL_LABELS = {
    smithing: 'الحدادة',
    combat: 'القتال',
    trade: 'التجارة',
    shadow: 'الظلال والمكائد',
    alchemy: 'الكيمياء والعلوم',
    sword_path: 'مسار السيف'
  };

  var FACTION_LABELS = {
    family: 'العائلة',
    humans: 'مملكة البشر',
    elves: 'عشائر الجان',
    demons: 'فيالق الشياطين'
  };

  var CAREER_LABELS = {
    apprentice: 'متدرب',
    smith: 'حداد',
    adventurer: 'مغامر',
    merchant: 'تاجر'
  };

  var ALIGNMENT_LABELS = {
    none: 'غير منحاز بعد',
    humans: 'صف البشر',
    elves: 'صف الجان',
    demons: 'صف الشياطين',
    neutral: 'محايد مستقل'
  };

  var ELIXIR_LABELS = {
    healing: 'إكسير الشفاء',
    antidote: 'ترياق السموم',
    focus: 'جرعة التركيز'
  };

  var RARITY_META = {
    common: { id: 'common', label: 'شائع', color: '#9ca3af' },
    uncommon: { id: 'uncommon', label: 'غير شائع', color: '#48a878' },
    rare: { id: 'rare', label: 'نادر', color: '#52a9ff' },
    epic: { id: 'epic', label: 'ملحمي', color: '#b482f5' },
    legendary: { id: 'legendary', label: 'أسطوري', color: '#f0c276' }
  };

  // Mechanical definitions for every earnable Trait (الوسام)
  var TRAIT_EFFECTS = {
    'صديق الظل الأخضر': {
      desc: '+6% مع الجان والظلال، و+2 ود إضافي عند لقاء الجان',
      checkBonus: { skill: 'shadow', val: 6 },
      factionBonus: { elves: 2 }
    },
    'صياد الكمائن': {
      desc: '+6% عند صد الاغتيالات والكمائن، وتخفيف ضررها (-2)',
      assassinCheckBonus: 6,
      assassinDmgReduction: 2
    },
    'أنف حذر': {
      desc: '+5% في اختبارات الكيمياء والظلال، و-5 ضرر من السموم',
      checkBonusSkills: ['alchemy', 'shadow'],
      checkBonusVal: 5,
      assassinDmgReduction: 3
    },
    'نجم السندان': {
      desc: '+6% للحدادة وخصم 6% في المتجر',
      checkBonus: { skill: 'smithing', val: 6 },
      shopDiscountPct: 6
    },
    'شبح الغابة الصغيرة': {
      desc: '+6% لاختبارات البراعة والظلال',
      checkBonusAttr: 'agi',
      checkBonusSkill: 'shadow',
      checkBonusVal: 6
    },
    'عين لا تنخدع': {
      desc: '+6% لاختبارات الحدس والظلال والمكائد',
      checkBonusAttr: 'ins',
      checkBonusSkill: 'shadow',
      checkBonusVal: 6
    },
    'صانع الأسطورة': {
      desc: '+8% للحدادة والقتال عند حمل سلاح نادر أو أرقى',
      checkBonusSkills: ['smithing', 'combat'],
      checkBonusVal: 8
    },
    'أستاذ السقي': {
      desc: '+6% لاختبارات الحدادة والكيمياء',
      checkBonusSkills: ['smithing', 'alchemy'],
      checkBonusVal: 6
    },
    'بطل الحلبة': {
      desc: '+6% للقتال و-2 ضرر في المواجهات المباشرة',
      checkBonus: { skill: 'combat', val: 6 },
      combatDmgReduction: 2
    },
    'عقل السلسلة': {
      desc: '+6% للتجارة و+5 ذهب سنوياً عند نهاية العام',
      checkBonus: { skill: 'trade', val: 6 },
      annualGold: 5
    },
    'عين السوق': {
      desc: '+5% للتجارة والظلال وخصم 5% إضافي بالمتجر',
      checkBonusSkills: ['trade', 'shadow'],
      checkBonusVal: 5,
      shopDiscountPct: 5
    },
    'نور التعقيم': {
      desc: 'يزيد فاعلية إكسير الشفاء (+12 صحة) و+5% للكيمياء',
      healBonus: 12,
      checkBonus: { skill: 'alchemy', val: 5 }
    },
    'معلم السندان الأول': {
      desc: '+8% للحدادة وتخفيف الضرر (-2)',
      checkBonus: { skill: 'smithing', val: 8 },
      combatDmgReduction: 2
    },
    'نصل الطليعة': {
      desc: '+7% للقتال ومسار السيف',
      checkBonusSkills: ['combat', 'sword_path'],
      checkBonusVal: 7
    },
    'سيد التوازن الذهبي': {
      desc: '+6% للكاريزما والتجارة',
      checkBonusAttr: 'cha',
      checkBonusSkill: 'trade',
      checkBonusVal: 6
    },
    'بنك القارة الخفي': {
      desc: '+12 ذهب سنوياً عند نهاية العام وخصم 6% في المتجر',
      annualGold: 12,
      shopDiscountPct: 6
    },
    'مبارز الصمت': {
      desc: '+8% لقتال مسار السيف وتخفيف -2 ضرر كمائن',
      checkBonusSkills: ['combat', 'sword_path'],
      checkBonusVal: 8,
      assassinDmgReduction: 2
    },
    'ذاكرة العائد': {
      desc: 'إرث الرحلات السابقة: +4% لجميع الفحوصات الأولى حتى عمر 12',
      earlyCheckBonus: 4
    }
  };

  var INT_THRESHOLDS = [9, 11, 14, 17, 21];

  function createInitialState() {
    return {
      version: 5,
      phase: 'childhood',
      age: 7,
      quarter: 1,
      period: 1,
      turnIndex: 1,
      totalTurns: 64,
      career: 'apprentice',
      warAlignment: 'none',
      hp: 95,
      maxHp: 95,
      gold: 20,
      rep: 5,
      threat: 8,
      tempCheckBonus: 0,
      pendingShop: false,
      shopYear: 0,
      lastYearTax: 0,
      boughtShopItems: [],
      attributes: {
        str: 5,
        int: 6,
        agi: 5,
        cha: 5,
        ins: 5
      },
      skills: {
        smithing: 0,
        combat: 0,
        trade: 0,
        shadow: 0,
        alchemy: 0,
        sword_path: 0
      },
      factions: {
        family: 45,
        humans: 15,
        elves: 0,
        demons: -10
      },
      gear: {
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
      },
      ownedAccessories: [],
      elixirs: {
        healing: 0,
        antidote: 0,
        focus: 0
      },
      assets: {
        caravanShare: false,
        safeHouse: false
      },
      traits: [],
      flags: {},
      pendingRipples: [],
      usedEvents: [],
      currentEventId: null,
      awaitingNext: false,
      lastOutcome: null,
      endingId: null,
      chronicle: []
    };
  }

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function getPeriodLabel(state) {
    if (state.phase === 'ended') {
      return 'ختام المسيرة';
    }
    if (state.phase === 'childhood') {
      var q = QUARTERS[state.quarter - 1] || QUARTERS[0];
      return q.name + ' (الربع ' + state.quarter + ')';
    }
    var p = PERIODS[(state.period || 1) - 1] || PERIODS[0];
    return p.name + ' (فترة ' + (state.period || 1) + '/6)';
  }

  function getThreatLabel(threat) {
    if (threat >= 75) return { label: 'مطلوب خطير', cls: 'threat-high' };
    if (threat >= 55) return { label: 'سوق سوداء / مطارد', cls: 'threat-high' };
    if (threat >= 35) return { label: 'مراقَب', cls: 'threat-mid' };
    return { label: 'هادئ', cls: 'threat-low' };
  }

  GameApp.State = {
    QUARTERS: QUARTERS,
    PERIODS: PERIODS,
    ATTR_LABELS: ATTR_LABELS,
    SKILL_LABELS: SKILL_LABELS,
    FACTION_LABELS: FACTION_LABELS,
    CAREER_LABELS: CAREER_LABELS,
    ALIGNMENT_LABELS: ALIGNMENT_LABELS,
    ELIXIR_LABELS: ELIXIR_LABELS,
    RARITY_META: RARITY_META,
    TRAIT_EFFECTS: TRAIT_EFFECTS,
    INT_THRESHOLDS: INT_THRESHOLDS,
    createInitialState: createInitialState,
    cloneState: cloneState,
    getPeriodLabel: getPeriodLabel,
    getThreatLabel: getThreatLabel
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.State;
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var SCHEMA_VERSION = 6;
  var GAME_TITLE = 'الظل التاه';
  var GAME_SUBTITLE = 'غريبٌ تائه في عالمٍ لا يعرفه، بين السيف والمكيدة حتى سن الخامسة والعشرين';

  var LEGACY_V5_KEYS = {
    AUTO: 'salil_anvil_autosave_v1',
    SLOTS: 'salil_anvil_slots_v1',
    ENDINGS: 'salil_anvil_endings_v1',
    SETTINGS: 'salil_anvil_settings_v1'
  };

  var STORAGE_KEYS = {
    AUTO: 'alzel_altaeh_autosave_v6',
    SLOTS: 'alzel_altaeh_slots_v6',
    PROFILE: 'alzel_altaeh_profile_v6',
    SETTINGS: 'alzel_altaeh_settings_v6'
  };

  var CHAPTERS = {
    1: { id: 1, name: 'الجذور والندوب', minAge: 7, maxAge: 11, turnsPerYear: 4 },
    2: { id: 2, name: 'التكوين والولاءات', minAge: 12, maxAge: 17, turnsPerYear: 6 },
    3: { id: 3, name: 'النضج والمصير', minAge: 18, maxAge: 25, turnsPerYear: 5 }
  };

  var DIFFICULTIES = {
    normal: { id: 'normal', label: 'عادي', hpMult: 1.0, damageMult: 1.0, taxMult: 1.0 },
    hard: { id: 'hard', label: 'قاسٍ', hpMult: 0.9, damageMult: 1.2, taxMult: 1.25 },
    nightmare: { id: 'nightmare', label: 'كابوسي (بلا رحمة)', hpMult: 0.8, damageMult: 1.4, taxMult: 1.45 }
  };

  var FACTIONS = {
    legion: { id: 'legion', name: 'فيلق الإمارات', role: 'القوة العسكرية والنبلاء' },
    shadow: { id: 'shadow', name: 'نقابة الظل', role: 'الاغتيالات والعالم السفلي' },
    merchants: { id: 'merchants', name: 'اتحاد التجار والمصارف', role: 'المال والقوافل والديون' },
    church: { id: 'church', name: 'النظام المقدس', role: 'الكنيسة ومحاكم التفتيش' }
  };

  var CITIES = {
    ash_frontier: { id: 'ash_frontier', name: 'ثغر الرماد', scene: 'assets/scenes/ash_frontier.webp' },
    royal_capital: { id: 'royal_capital', name: 'العاصمة الملكية', scene: 'assets/scenes/royal_capital.webp' },
    salt_port: { id: 'salt_port', name: 'ميناء الملح', scene: 'assets/scenes/salt_port.webp' },
    underbelly: { id: 'underbelly', name: 'الأحياء السفلى', scene: 'assets/scenes/underbelly.webp' },
    iron_abbey: { id: 'iron_abbey', name: 'الدير الحصين', scene: 'assets/scenes/iron_abbey.webp' }
  };

  var WEAPON_TYPES = {
    sword: { id: 'sword', name: 'سيف', trait: 'متوازن في الصد والضربات المتتابعة' },
    axe: { id: 'axe', name: 'فأس', trait: 'كاسر للدروع بثبات مرتفع وأبطأ مبادرة' },
    spear: { id: 'spear', name: 'رمح', trait: 'تفوّق بالمدى وردّ الهجوم الأول' },
    bow: { id: 'bow', name: 'قوس', trait: 'ضربة استباقية قبل التحام الخصم' }
  };

  var SCAR_TYPES = [
    'scar_eye',
    'scar_leg',
    'scar_burn',
    'scar_brand',
    'scar_tremor'
  ];

  var PRESTIGE_ACHIEVEMENTS = [
    'the_strongest',      // الأقوى
    'king_of_humans',     // ملك البشر
    'sovereign_of_shadow',// سيد الظل المطلق
    'unscarred_survivor'  // الناجي بلا ندوب
  ];

  function createDefaultV6State(difficulty) {
    var diffKey = DIFFICULTIES[difficulty] ? difficulty : 'hard';
    var diff = DIFFICULTIES[diffKey];
    var baseHp = Math.round(45 * diff.hpMult);
    var baseStamina = Math.round(45 * diff.hpMult);

    return {
      schemaVersion: SCHEMA_VERSION,
      gameTitle: GAME_TITLE,
      difficulty: diffKey,

      timeline: {
        chapter: 1,
        age: 7,
        season: 1,
        turn: 1,
        maxTurns: 96,
        locationId: 'ash_frontier'
      },

      vitals: {
        hp: baseHp,
        maxHp: baseHp,
        stamina: baseStamina,
        maxStamina: baseStamina,
        gold: 6,
        debt: 0,
        debtDueTurn: 0,
        reputation: 0,
        suspicion: 0
      },

      economy: {
        properties: [],
        retinueUpkeep: 0,
        taxRate: diff.taxMult
      },

      stats: {
        str: 3,
        int: 3,
        agi: 3,
        cha: 3,
        ins: 3
      },

      skills: {
        combat: 0,
        stealth: 0,
        trade: 0,
        smithing: 0,
        alchemy: 0,
        politics: 0
      },

      scars: [],

      factions: {
        legion: 0,
        shadow: 0,
        merchants: 0,
        church: 0,
        joinedFaction: 'none'
      },

      loadout: {
        weaponId: null,
        armorId: null,
        accessoryId: null,
        potionSlots: [null, null, null],
        ownedWeapons: [],
        ownedArmors: [],
        ownedAccessories: [],
        potionsInventory: {}
      },

      characters: {
        roster: {},
        companionId: null,
        encounteredTransient: {}
      },

      progression: {
        flags: {},
        pendingRipples: [],
        timelineNodes: [],
        prestigeProgress: {},
        endingId: null,
        isEnded: false
      }
    };
  }

  function safeParseJson(raw, fallback) {
    if (!raw || typeof raw !== 'string') return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  // Reads v5 localStorage keys strictly read-only without mutating or deleting old saves
  function readLegacyV5Bridge(store) {
    var result = {
      hasLegacyData: false,
      legacyEndingsCount: 0,
      legacyTitle: 'سليل السندان',
      inheritedSettings: null,
      veteranBadge: null
    };
    if (!store || typeof store.getItem !== 'function') return result;

    var rawEndings = safeParseJson(store.getItem(LEGACY_V5_KEYS.ENDINGS), null);
    if (rawEndings && typeof rawEndings === 'object') {
      var unlocked = Object.keys(rawEndings).filter(function (k) { return Boolean(rawEndings[k]); });
      if (unlocked.length > 0) {
        result.hasLegacyData = true;
        result.legacyEndingsCount = unlocked.length;
        result.veteranBadge = {
          id: 'v5_veteran_traveler',
          name: 'عابر العوالم القديم',
          unlockedLegacyEndings: unlocked.length
        };
      }
    }

    var rawSettings = safeParseJson(store.getItem(LEGACY_V5_KEYS.SETTINGS), null);
    if (rawSettings && typeof rawSettings === 'object') {
      result.hasLegacyData = true;
      result.inheritedSettings = {
        textSpeed: rawSettings.textSpeed || 'normal',
        soundEnabled: rawSettings.soundEnabled !== false
      };
    }

    if (store.getItem(LEGACY_V5_KEYS.AUTO) || store.getItem(LEGACY_V5_KEYS.SLOTS)) {
      result.hasLegacyData = true;
    }

    return result;
  }

  GameApp.V6Schema = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    GAME_TITLE: GAME_TITLE,
    GAME_SUBTITLE: GAME_SUBTITLE,
    LEGACY_V5_KEYS: LEGACY_V5_KEYS,
    STORAGE_KEYS: STORAGE_KEYS,
    CHAPTERS: CHAPTERS,
    DIFFICULTIES: DIFFICULTIES,
    FACTIONS: FACTIONS,
    CITIES: CITIES,
    WEAPON_TYPES: WEAPON_TYPES,
    SCAR_TYPES: SCAR_TYPES,
    PRESTIGE_ACHIEVEMENTS: PRESTIGE_ACHIEVEMENTS,
    createDefaultV6State: createDefaultV6State,
    readLegacyV5Bridge: readLegacyV5Bridge
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6Schema;
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var UI = {
    game_crest: { id: 'game_crest', name: 'شعار الظل التاه', path: 'assets/ui/game_crest.jpg' },
    continent_map: { id: 'continent_map', name: 'خريطة القارة الممزقة', path: 'assets/ui/continent_map.jpg' }
  };

  var SCENES = {
    burning_origin: {
      id: 'burning_origin',
      name: 'ليلة الرماد الأولى',
      subtitle: 'بداية الغريب في سن السابعة',
      path: 'assets/scenes/burning_origin.jpg'
    },
    ash_frontier: {
      id: 'ash_frontier',
      name: 'ثغر الرماد',
      subtitle: 'الحدود المشتعلة وورشة الحدادة',
      path: 'assets/scenes/ash_frontier.jpg'
    },
    royal_capital: {
      id: 'royal_capital',
      name: 'العاصمة الملكية',
      subtitle: 'بلاط الإمارات ومؤامرات القصر',
      path: 'assets/scenes/royal_capital.jpg'
    },
    salt_port: {
      id: 'salt_port',
      name: 'ميناء الملح',
      subtitle: 'أرصفة القوافل والتهريب والذهب',
      path: 'assets/scenes/salt_port.jpg'
    },
    underbelly: {
      id: 'underbelly',
      name: 'الأحياء السفلى',
      subtitle: 'أزقة نقابة الظل والسوق المظلمة',
      path: 'assets/scenes/underbelly.jpg'
    },
    iron_abbey: {
      id: 'iron_abbey',
      name: 'الدير الحصين',
      subtitle: 'معقل النظام المقدس ومحاكم التفتيش',
      path: 'assets/scenes/iron_abbey.jpg'
    }
  };

  var CHARACTERS = {
    protagonist: {
      id: 'protagonist',
      name: 'الظل التاه (أنت)',
      faction: 'none',
      role: 'الغريب المجهول الأصل',
      path: 'assets/characters/protagonist.jpg'
    },
    gharon_mentor: {
      id: 'gharon_mentor',
      name: 'المعلم غارون',
      faction: 'legion',
      role: 'حداد الثغر والجندي المتقاعد',
      path: 'assets/characters/gharon_mentor.jpg'
    },
    lyra_shadow: {
      id: 'lyra_shadow',
      name: 'ليرا',
      faction: 'shadow',
      role: 'مبعوثة نقابة الظل وصاحبة الأسرار',
      path: 'assets/characters/lyra_shadow.jpg'
    },
    marcus_legion: {
      id: 'marcus_legion',
      name: 'القائد ماركوس',
      faction: 'legion',
      role: 'قائد فرسان ثغور الإمارات',
      path: 'assets/characters/marcus_legion.jpg'
    },
    salim_merchant: {
      id: 'salim_merchant',
      name: 'التاجر سليم',
      faction: 'merchants',
      role: 'وسيط اتحاد التجار والمصارف',
      path: 'assets/characters/salim_merchant.jpg'
    },
    inquisitor_malik: {
      id: 'inquisitor_malik',
      name: 'المحقق مالك',
      faction: 'church',
      role: 'كبير مفتشي النظام المقدس',
      path: 'assets/characters/inquisitor_malik.jpg'
    },
    vera_alchemist: {
      id: 'vera_alchemist',
      name: 'فيرا الخيميائية',
      faction: 'none',
      role: 'خيميائية مطاردة ومصنّعة سموم وترياق',
      path: 'assets/characters/vera_alchemist.jpg'
    },
    tark_rival: {
      id: 'tark_rival',
      name: 'طارق',
      faction: 'legion',
      role: 'رفيق الطفولة والخصم العنيد',
      path: 'assets/characters/tark_rival.jpg'
    }
  };

  var ITEMS = {
    // Swords
    sword_iron: { id: 'sword_iron', category: 'weapon', weaponType: 'sword', name: 'سيف حديدي عتيق', rarity: 'common', path: 'assets/items/weapons/swords/sword_iron.jpg' },
    sword_steel: { id: 'sword_steel', category: 'weapon', weaponType: 'sword', name: 'سيف الفولاذ المصفّى', rarity: 'rare', path: 'assets/items/weapons/swords/sword_steel.jpg' },
    sword_royal: { id: 'sword_royal', category: 'weapon', weaponType: 'sword', name: 'نصل الفيلق الملكي', rarity: 'epic', path: 'assets/items/weapons/swords/sword_royal.jpg' },

    // Axes
    axe_woodman: { id: 'axe_woodman', category: 'weapon', weaponType: 'axe', name: 'فأس الثغر الثقيل', rarity: 'common', path: 'assets/items/weapons/axes/axe_woodman.jpg' },
    axe_war: { id: 'axe_war', category: 'weapon', weaponType: 'axe', name: 'فأس كاسر الدروع', rarity: 'rare', path: 'assets/items/weapons/axes/axe_war.jpg' },
    axe_executioner: { id: 'axe_executioner', category: 'weapon', weaponType: 'axe', name: 'فأس الجلاد المزدوج', rarity: 'epic', path: 'assets/items/weapons/axes/axe_executioner.jpg' },

    // Spears
    spear_militia: { id: 'spear_militia', category: 'weapon', weaponType: 'spear', name: 'رمح الحرس الخشبي', rarity: 'common', path: 'assets/items/weapons/spears/spear_militia.jpg' },
    spear_knight: { id: 'spear_knight', category: 'weapon', weaponType: 'spear', name: 'رمح الفرسان المجنّح', rarity: 'rare', path: 'assets/items/weapons/spears/spear_knight.jpg' },
    spear_halberd: { id: 'spear_halberd', category: 'weapon', weaponType: 'spear', name: 'مطرد الثغور الحديدي', rarity: 'epic', path: 'assets/items/weapons/spears/spear_halberd.jpg' },

    // Bows
    bow_hunter: { id: 'bow_hunter', category: 'weapon', weaponType: 'bow', name: 'قوس الصيد الخشبي', rarity: 'common', path: 'assets/items/weapons/bows/bow_hunter.jpg' },
    bow_recurve: { id: 'bow_recurve', category: 'weapon', weaponType: 'bow', name: 'قوس الحرب المنحني', rarity: 'rare', path: 'assets/items/weapons/bows/bow_recurve.jpg' },
    bow_assassin: { id: 'bow_assassin', category: 'weapon', weaponType: 'bow', name: 'قوس الظل الصامت', rarity: 'legendary', path: 'assets/items/weapons/bows/bow_assassin.jpg' },

    // Armors
    armor_traveler: { id: 'armor_traveler', category: 'armor', name: 'عباءة السفر المبطنة', rarity: 'common', path: 'assets/items/armors/armor_traveler.jpg' },
    armor_shadow_cloak: { id: 'armor_shadow_cloak', category: 'armor', name: 'رداء نقابة الظل', rarity: 'rare', path: 'assets/items/armors/armor_shadow_cloak.jpg' },
    armor_legion_plate: { id: 'armor_legion_plate', category: 'armor', name: 'درع صفائح الفيلق', rarity: 'epic', path: 'assets/items/armors/armor_legion_plate.jpg' },
    armor_merchant_coat: { id: 'armor_merchant_coat', category: 'armor', name: 'معطف المخمل المزرّد', rarity: 'rare', path: 'assets/items/armors/armor_merchant_coat.jpg' },
    armor_inquisitor: { id: 'armor_inquisitor', category: 'armor', name: 'كسوة المحقق المدرّعة', rarity: 'epic', path: 'assets/items/armors/armor_inquisitor.jpg' },

    // Potions
    potion_heal: { id: 'potion_heal', category: 'potion', name: 'قارورة الشفاء القرمزية', rarity: 'common', path: 'assets/items/potions/potion_heal.jpg' },
    potion_stamina: { id: 'potion_stamina', category: 'potion', name: 'شراب العزم العنبري', rarity: 'uncommon', path: 'assets/items/potions/potion_stamina.jpg' },
    potion_poison: { id: 'potion_poison', category: 'potion', name: 'سمّ النصل الصامت', rarity: 'rare', path: 'assets/items/potions/potion_poison.jpg' },
    potion_antidote: { id: 'potion_antidote', category: 'potion', name: 'ترياق فيرا الفضي', rarity: 'rare', path: 'assets/items/potions/potion_antidote.jpg' },

    // Accessories
    acc_signet: { id: 'acc_signet', category: 'accessory', name: 'خاتم الختم النبيل', rarity: 'epic', path: 'assets/items/accessories/acc_signet.jpg' },
    acc_medallion: { id: 'acc_medallion', category: 'accessory', name: 'قلادة التائه الغامضة', rarity: 'rare', path: 'assets/items/accessories/acc_medallion.jpg' },
    acc_cipher: { id: 'acc_cipher', category: 'accessory', name: 'ختم الشيفرة النحاسي', rarity: 'rare', path: 'assets/items/accessories/acc_cipher.jpg' }
  };

  function getAssetPath(category, id) {
    if (category === 'scene' && SCENES[id]) return SCENES[id].path;
    if (category === 'character' && CHARACTERS[id]) return CHARACTERS[id].path;
    if (category === 'item' && ITEMS[id]) return ITEMS[id].path;
    if (category === 'ui' && UI[id]) return UI[id].path;
    return null;
  }

  function getAllAssetPaths() {
    var list = [];
    [UI, SCENES, CHARACTERS, ITEMS].forEach(function (group) {
      Object.keys(group).forEach(function (key) {
        if (group[key] && group[key].path) list.push(group[key].path);
      });
    });
    return list;
  }

  GameApp.V6Assets = {
    UI: UI,
    SCENES: SCENES,
    CHARACTERS: CHARACTERS,
    ITEMS: ITEMS,
    getAssetPath: getAssetPath,
    getAllAssetPaths: getAllAssetPaths
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6Assets;
  }
})(typeof window !== 'undefined' ? window : globalThis);

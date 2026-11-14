(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var MAIN_CHARACTERS = {
    gharon_mentor: {
      id: 'gharon_mentor',
      name: 'المعلم غارون',
      faction: 'legion',
      homeCity: 'ash_frontier',
      portrait: 'assets/characters/gharon_mentor.jpg',
      role: 'حداد الثغر والجندي المخضرم',
      romanceable: false,
      bondLabel: 'أب روحي',
      upkeep: 0,
      companionBonus: { poise: 6, armorBreak: 3, smithing: 1 },
      betrayalRule: { flag: 'betrayed_frontier_massacre', minLoyalty: -45 }
    },
    lyra_shadow: {
      id: 'lyra_shadow',
      name: 'ليرا',
      faction: 'shadow',
      homeCity: 'underbelly',
      portrait: 'assets/characters/lyra_shadow.jpg',
      role: 'مبعوثة نقابة الظل وصاحبة الأسرار',
      romanceable: true,
      bondLabel: 'شريكة مصير',
      upkeep: 8,
      companionBonus: { stealth: 2, ambushAvoid: 0.25, dodgeBonus: 0.08 },
      betrayalRule: { flag: 'sold_shadow_secrets', minLoyalty: -25 }
    },
    marcus_legion: {
      id: 'marcus_legion',
      name: 'القائد ماركوس',
      faction: 'legion',
      homeCity: 'royal_capital',
      portrait: 'assets/characters/marcus_legion.jpg',
      role: 'قائد فرسان ثغور الإمارات',
      romanceable: true,
      bondLabel: 'شراكة سيف ونسب',
      upkeep: 10,
      companionBonus: { attack: 5, poise: 8 },
      betrayalRule: { flag: 'deserted_legion_siege', minLoyalty: -20 }
    },
    salim_merchant: {
      id: 'salim_merchant',
      name: 'التاجر سليم',
      faction: 'merchants',
      homeCity: 'salt_port',
      portrait: 'assets/characters/salim_merchant.jpg',
      role: 'وسيط اتحاد التجار والمصارف',
      romanceable: false,
      bondLabel: 'شريك مصالح',
      upkeep: 9,
      companionBonus: { debateAttack: 6, tradeDiscount: 0.08 },
      betrayalRule: { flag: 'debt_defaulted', minLoyalty: -25 }
    },
    inquisitor_malik: {
      id: 'inquisitor_malik',
      name: 'المحقق مالك',
      faction: 'church',
      homeCity: 'iron_abbey',
      portrait: 'assets/characters/inquisitor_malik.jpg',
      role: 'كبير مفتشي النظام المقدس',
      romanceable: false,
      bondLabel: 'عهد عقيدة',
      upkeep: 6,
      companionBonus: { suspicionShield: 4, debatePoise: 8 },
      betrayalRule: { flag: 'caught_forbidden_alchemy', minLoyalty: -15 }
    },
    vera_alchemist: {
      id: 'vera_alchemist',
      name: 'فيرا الخيميائية',
      faction: 'none',
      homeCity: 'underbelly',
      portrait: 'assets/characters/vera_alchemist.jpg',
      role: 'خيميائية مطاردة ومصنّعة سموم وترياق',
      romanceable: true,
      bondLabel: 'رفيقة سرّ وزواج',
      upkeep: 5,
      companionBonus: { alchemy: 2, poisonResist: true },
      betrayalRule: { flag: 'handed_vera_to_church', minLoyalty: -10 }
    },
    tark_rival: {
      id: 'tark_rival',
      name: 'طارق',
      faction: 'legion',
      homeCity: 'ash_frontier',
      portrait: 'assets/characters/tark_rival.jpg',
      role: 'رفيق الطفولة والخصم العنيد',
      romanceable: false,
      bondLabel: 'أخ سلاح أو ندّ لدود',
      upkeep: 7,
      companionBonus: { attack: 4, counterBonus: 0.12 },
      betrayalRule: { flag: 'humiliated_tark_publicly', minLoyalty: -30 }
    }
  };

  // Conditional transient NPCs that may or may not appear depending on city/age/flags
  var TRANSIENT_NPCS = {
    blind_scribe: { id: 'blind_scribe', name: 'الناسخ الضرير', cityId: 'iron_abbey', minAge: 13, hint: 'يحفظ فهرس الأختام الملكية المفقودة.' },
    old_navigator: { id: 'old_navigator', name: 'الملاح العجوز', cityId: 'salt_port', minAge: 12, hint: 'يمرّ بحانة المرفأ مرة كل عدة مواسم.' },
    alley_courier: { id: 'alley_courier', name: 'ساعي الأزقة الصغير', cityId: 'underbelly', minAge: 8, hint: 'قد يحمل رسالة منقذة أو يمرّ عابراً دون أثر.' },
    wounded_courier: { id: 'wounded_courier', name: 'الفارس الجريح', cityId: 'ash_frontier', minAge: 9, hint: 'يحمل ختماً مشفراً من العاصمة إن ساعدته.' },
    masked_patron: { id: 'masked_patron', name: 'المموّل المقنّع', cityId: 'royal_capital', minAge: 18, hint: 'يراقب الطامحين في مجالس النبلاء بصمت.' },
    retired_duelist: { id: 'retired_duelist', name: 'المبارز المنعزل', cityId: 'ash_frontier', minAge: 15, hint: 'لا يُلقي بالاً إلا لمن يرفض الهرب من النزال.' }
  };

  // Multi-chapter interlocking Prestige Achievements (much harder than normal endings)
  var PRESTIGE_ACHIEVEMENTS = {
    the_strongest: {
      id: 'the_strongest',
      name: 'الأقوى',
      tier: 'mythic',
      desc: 'قهر أعتى مبارزي القارة عبر الفصول الثلاثة دون انسحاب واحد، بمهارة قتالية وعتاد نخبوي.',
      checks: [
        { key: 'age23', label: 'بلوغ سن 23+' },
        { key: 'trial1', label: 'الفوز في اختبار ثغر الرماد (الفصل 1)' },
        { key: 'trial2', label: 'الفوز في حلبة الأحياء/العاصمة (الفصل 2)' },
        { key: 'trial3', label: 'هزيمة بطل القارة الأعظم (الفصل 3)' },
        { key: 'combatStats', label: 'القتال 6+ والقوة 10+ مع 8 انتصارات بلا أي انسحاب' },
        { key: 'epicLoadout', label: 'امتلاك وتجهيز سلاح ودرع نادرين (Epic/Legendary)' }
      ]
    },
    king_of_humans: {
      id: 'king_of_humans',
      name: 'ملك البشر',
      tier: 'mythic',
      desc: 'انتزاع التاج البشري بتوحيد خيوط الدم والذهب والجيش عبر 18 عاماً من المؤامرات.',
      checks: [
        { key: 'cipherCh1', label: 'العثور على الختم الملكي المفقود في الطفولة (الفصل 1)' },
        { key: 'factionsCh2', label: 'كسب ثقة الفيلق (45+) واتحاد التجار (40+) معاً' },
        { key: 'councilCh3', label: 'حسم مجلس الأمراء في العاصمة (الفصل 3)' },
        { key: 'rulerStats', label: 'السياسة 6+ والكاريزما 10+ مع عقارين+ و0 ديون' },
        { key: 'loyalBacker', label: 'ولاء القائد ماركوس أو التاجر سليم (45+)' }
      ]
    },
    sovereign_of_shadow: {
      id: 'sovereign_of_shadow',
      name: 'سيد الظل المطلق',
      tier: 'mythic',
      desc: 'حكم العالم السفلي من الخفاء دون انكشاف أو وسم، بعد تصفية مجلس الظل القديم.',
      checks: [
        { key: 'earlyShadow', label: 'دخول الأحياء السفلى مبكراً في الطفولة' },
        { key: 'noBrand', label: 'عدم الوقوع في وسم التفتيش مطلقاً' },
        { key: 'purgeCouncil', label: 'كشف وتصفية خائن مجلس الظل (الفصل 2)' },
        { key: 'twinRegicide', label: 'تنفيذ ضربة القصر الكبرى دون انكشاف (الفصل 3)' },
        { key: 'phantomStats', label: 'التخفي 7+ وشبهة 35 أو أقل عند سن 24+ مع ولاء ليرا' }
      ]
    },
    unscarred_survivor: {
      id: 'unscarred_survivor',
      name: 'الناجي بلا ندوب',
      tier: 'legendary',
      desc: 'بلوغ سن 25 على صعوبة قاسية أو كابوسية دون ندبة دائمة واحدة أو دين، ودون تلويث اليد بعقود الظل.',
      checks: [
        { key: 'hardDiff', label: 'صعوبة قاسية أو كابوسية' },
        { key: 'age25', label: 'النجاة حتى سن 25' },
        { key: 'zeroScars', label: 'سجل خالٍ من الندوب الدائمة (0 ندوب) و0 ديون' },
        { key: 'fiveWins', label: '5 انتصارات قتالية ورفض عقود القتل' }
      ]
    },
    alchemist_prophet: {
      id: 'alchemist_prophet',
      name: 'سيد الترياق المحرّم',
      tier: 'legendary',
      desc: 'إتقان الخيمياء السرية مع فيرا والانتصار أمام محاكم التفتيش لصنع الإكسير المحظور.',
      checks: [
        { key: 'veraBond', label: 'ثقة وولاء فيرا الخيميائية (50+)' },
        { key: 'trialWon', label: 'الانتصار في محاكمة النظام المقدس' },
        { key: 'panacea', label: 'تخليق الترياق الأعظم في الفصل 3 (خيمياء 6+ وذكاء 11+)' }
      ]
    }
  };

  GameApp.V6NarrativeMeta = {
    MAIN_CHARACTERS: MAIN_CHARACTERS,
    TRANSIENT_NPCS: TRANSIENT_NPCS,
    PRESTIGE_ACHIEVEMENTS: PRESTIGE_ACHIEVEMENTS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6NarrativeMeta;
  }
})(typeof window !== 'undefined' ? window : globalThis);

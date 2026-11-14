(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Built-in starter events used until Chapters 1-3 full narrative files (Steps 7-9) are registered
  var STARTER_EVENTS = [
    {
      id: 'v6_origin_awakening',
      chapter: 1,
      minAge: 7,
      sceneId: 'burning_origin',
      speakerId: 'protagonist',
      title: 'ليلة الرماد الأولى — وعيٌ في عالمٍ غريب',
      body: 'تفتح عينيك وسط دخانٍ خانق وأخشابٍ محترقة؛ ثغرٌ بشري لم تره من قبل ينهار تحت سنابك الخيول. أنت في جسد طفلٍ بالسابعة، لكن وعيك يحمل ذكريات عالمٍ آخر لا يشبه هذه القسوة. كل من هنا غريب، وكل خطوة ستحدد من يلتقطك قبل أن يبتلعك الرماد.',
      choices: [
        {
          id: 'follow_smith',
          label: 'الركض نحو صوت المطرقة وورشة الحدادة المشتعلة',
          hint: '+قوة +حدادة • التعرّف على المعلم غارون',
          effects: { stats: { str: 1 }, skills: { smithing: 1 }, factions: { legion: 6 }, flags: { origin_path: 'smithy' } },
          meet: { charId: 'gharon_mentor', loyalty: 20, trust: 15 },
          nextEventId: 'v6_ch1_gharon_forge',
          outcome: 'أمسكك المعلم غارون من وسط الدخان؛ جرحٌ قديم على ساعده يروي حروب الإمارات، وأصبح مأواك الأول.'
        },
        {
          id: 'slip_alley',
          label: 'الانسلال مع فتيان الأزقة نحو سراديب القافلة الهاربة',
          hint: '+براعة +تخفي • كشف طريق الأحياء السفلى مبكراً',
          effects: { stats: { agi: 1, ins: 1 }, skills: { stealth: 1 }, factions: { shadow: 8 }, flags: { origin_path: 'alley', knows_underbelly: true } },
          meet: { charId: 'lyra_shadow', loyalty: 15, trust: 10 },
          nextEventId: 'v6_ch1_alley_knife',
          outcome: 'التقطتك فتاة حادة النظرات تُدعى ليرا؛ علّمتك أن البقاء في هذا العالم لا يُمنح بل يُسرق.'
        },
        {
          id: 'bargain_caravan',
          label: 'الاحتماء بعربة التاجر سليم وحفظ دفاتره وسط الفوضى',
          hint: '+ذكاء +تجارة +12 ذهب',
          effects: { stats: { int: 1 }, skills: { trade: 1 }, vitals: { gold: 12 }, factions: { merchants: 8 }, flags: { origin_path: 'caravan' } },
          meet: { charId: 'salim_merchant', loyalty: 15, trust: 12 },
          nextEventId: 'v6_ch1_salim_ledger',
          outcome: 'لاحظ التاجر سليم هدوءك غير المألوف لطفل، فسمح لك بالبقاء قرب صناديق القافلة.'
        }
      ]
    },
    {
      id: 'v6_ch1_gharon_forge',
      chapter: 1,
      sceneId: 'ash_frontier',
      speakerId: 'gharon_mentor',
      title: 'أول درسٍ أمام السندان',
      body: 'في ورشة ثغر الرماد، يضع المعلم غارون مطرقةً ثقيلة بيديك ويشير إلى رفيق طفولتك طارق الذي يراقبك بريبة. «العالم يا بُني لا يرحم الغرباء؛ إن لم تصنع سلاحك بيدك ستُصبح وقوداً لحروب الأمراء.»',
      choices: [
        {
          id: 'forge_blade',
          label: 'منافسة طارق في تطريق نصلٍ حديدي',
          hint: '+قوة +قتال • لقاء طارق',
          effects: { stats: { str: 1 }, skills: { combat: 1, smithing: 1 }, flags: { won_frontier_trial_ch1: true } },
          meet: { charId: 'tark_rival', loyalty: 12, trust: 8 },
          outcome: 'أعجب غارون بثبات يديك رغم صغر سنك، وبقيت عينا طارق عالقتين بتحدٍّ طويل.'
        },
        {
          id: 'study_seals',
          label: 'تفحّص الختم المعدني الغريب بين مخلفات الغارة',
          hint: '+حدس +ذكاء • خيط ملكي سري',
          effects: { stats: { int: 1, ins: 1 }, flags: { found_royal_cipher: true } },
          outcome: 'خبّأتَ الختم المكسور تحت حجر السندان؛ لم تفهم نقوشه بعد، لكنه يخص بيتاً ملكياً ساقطاً.'
        }
      ]
    },
    {
      id: 'v6_ch1_alley_knife',
      chapter: 1,
      sceneId: 'underbelly',
      speakerId: 'lyra_shadow',
      title: 'اختبار الأزقة والظل',
      body: 'في دهليز رطب تحت الأسوار، تضع ليرا خنجراً صدئاً أمامك بينما يعبر قاطع طريقٍ غاضب الزقاق المقابل. «إن أردتَ أن تفهم هذا العالم التائه، تعلّم كيف تكسر خصماً أكبر منك حجماً.»',
      choices: [
        {
          id: 'duel_cutthroat',
          label: 'مواجهة اللص تكتيكياً لإثبات جدارتك',
          hint: 'مواجهة تكتيكية بجولات!',
          encounterId: 'alley_cutthroat',
          outcome: 'اندفعتَ إلى الزقاق لمواجهته وجهاً لوجه.'
        },
        {
          id: 'bribe_slip',
          label: 'استخدام ذكائك وتضليله نحو دورية الحرس',
          hint: '+سياسة +تخفي',
          effects: { stats: { cha: 1 }, skills: { stealth: 1, politics: 1 }, vitals: { suspicion: -4 } },
          outcome: 'تركت الحرس يتكفلون به بينما اختفيت أنت وليرا بين السقوف.'
        }
      ]
    },
    {
      id: 'v6_ch1_salim_ledger',
      chapter: 1,
      sceneId: 'salt_port',
      speakerId: 'salim_merchant',
      title: 'حسابات الدم والذهب',
      body: 'يفتح التاجر سليم دفتراً جلديّاً تفوح منه رائحة الملح والعرق. بينما تمرّ عربة محاكم التفتيش قرب المرفأ، يلتفت إليك سليم: «المقاتل يموت في الثغور، أما من يملك الديون والوثائق فيشتري الفرسان والمحققين معاً.»',
      choices: [
        {
          id: 'learn_accounts',
          label: 'مراجعة عقود القوافل والضرائب باحتراف',
          hint: '+تجارة +سياسة +18 ذهب',
          effects: { skills: { trade: 2, politics: 1 }, vitals: { gold: 18 } },
          outcome: 'أدركتَ منذ الصغر كيف تتحكم مصارف الميناء بمصير الملوك.'
        },
        {
          id: 'seek_vera',
          label: 'التسلل إلى مستودع الأعشاب للقاء الخيميائية المطاردة فيرا',
          hint: '+خيمياء • فتح خيط فيرا',
          effects: { skills: { alchemy: 1 }, stats: { int: 1 } },
          meet: { charId: 'vera_alchemist', loyalty: 20, trust: 18 },
          outcome: 'سلمتك فيرا قارورة غامضة وحذرتك من أعين المحقق مالك.'
        }
      ]
    }
  ];

  function getRegistryEvents() {
    if (Array.isArray(GameApp.V6StoryEvents) && GameApp.V6StoryEvents.length > 0) {
      return GameApp.V6StoryEvents;
    }
    return STARTER_EVENTS;
  }

  function createNewGame(difficulty, useLegacyBonus) {
    var Schema = GameApp.V6Schema;
    var Cast = GameApp.V6CastEngine;
    var Storage = GameApp.V6Storage;

    var state = Schema.createDefaultV6State(difficulty || 'hard');
    Cast.initCharactersState(state);

    if (Storage) {
      var profile = Storage.getProfile();

      // Apply persistent upgrades from Reincarnation Soul Shop
      if (profile && profile.reincarnationUpgrades) {
        var up = profile.reincarnationUpgrades;
        if (up.stats) {
          Object.keys(up.stats).forEach(function (k) {
            state.stats[k] = (state.stats[k] || 0) + (up.stats[k] || 0);
          });
        }
        if (up.skills) {
          Object.keys(up.skills).forEach(function (k) {
            state.skills[k] = (state.skills[k] || 0) + (up.skills[k] || 0);
          });
        }
        if (up.startingGold) {
          state.vitals.gold += up.startingGold;
        }

        var bonusHp = ((up.stats && up.stats.str) || 0) * 5;
        var bonusStam = ((up.stats && up.stats.agi) || 0) * 4;
        state.vitals.hp += bonusHp;
        state.vitals.maxHp += bonusHp;
        state.vitals.stamina += bonusStam;
        state.vitals.maxStamina += bonusStam;
      }

      if (useLegacyBonus && profile.legacyBridge && profile.legacyBridge.hasLegacyData) {
        state.vitals.gold += 15;
        state.stats.ins += 1;
        state.progression.flags.legacy_v5_traveler = true;
      }
    }

    var startEv = getNextEvent(state);
    state.progression.currentEventId = startEv.id;
    recordTimelineNode(state, startEv.id, startEv.title, 'بداية الرحلة', state.timeline.locationId);
    return { state: state, event: startEv };
  }

  function recordTimelineNode(state, eventId, title, choiceLabel, cityId) {
    state.progression.timelineNodes = state.progression.timelineNodes || [];
    state.progression.timelineNodes.push({
      turn: state.timeline.turn,
      age: state.timeline.age,
      chapter: state.timeline.chapter,
      cityId: cityId || state.timeline.locationId,
      eventId: eventId,
      title: title,
      choiceLabel: choiceLabel || '',
      scarsCount: (state.scars || []).length
    });
  }

  function getEventById(id) {
    var all = getRegistryEvents();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function getNextEvent(state) {
    var all = getRegistryEvents();
    if (state.progression.forcedNextEventId) {
      var forced = getEventById(state.progression.forcedNextEventId);
      state.progression.forcedNextEventId = null;
      if (forced) return forced;
    }

    if (state.timeline.turn === 1 && !state.progression.flags.origin_done) {
      var originEv = getEventById('v6_origin_awakening');
      if (originEv) return originEv;
    }

    var cityId = state.timeline.locationId;
    var ch = state.timeline.chapter;
    var seen = state.progression.flags._seenEvents || {};

    // Filter eligible events from story pool
    var candidates = all.filter(function (ev) {
      if (ev.id === 'v6_origin_awakening') return false;
      if (ev.chapter && ev.chapter !== ch && all.length > 6) return false;
      if (ev.minAge && state.timeline.age < ev.minAge) return false;
      if (ev.maxAge && state.timeline.age > ev.maxAge) return false;
      if (ev.minTurn && state.timeline.turn < ev.minTurn) return false;
      if (ev.maxTurn && state.timeline.turn > ev.maxTurn) return false;
      if (ev.cityId && ev.cityId !== cityId) return false;
      if (ev.requireFlag && !state.progression.flags[ev.requireFlag]) return false;
      if (ev.excludeFlag && state.progression.flags[ev.excludeFlag]) return false;
      if (ev.once && seen[ev.id]) return false;
      return true;
    });

    if (candidates.length === 0) {
      return buildProceduralCityEvent(state);
    }

    // Sort by priority descending if specified
    candidates.sort(function (a, b) {
      return (b.priority || 0) - (a.priority || 0);
    });

    var topPriority = candidates[0].priority || 0;
    var topCandidates = candidates.filter(function (c) {
      return (c.priority || 0) === topPriority;
    });

    return topCandidates[state.timeline.turn % topCandidates.length];
  }

  function buildProceduralCityEvent(state) {
    var World = GameApp.V6WorldData;
    var city = World.CITIES[state.timeline.locationId] || World.CITIES.ash_frontier;
    var ch = state.timeline.chapter;
    var citySpeakers = {
      ash_frontier: 'gharon_mentor',
      underbelly: 'lyra_shadow',
      royal_capital: 'marcus_legion',
      salt_port: 'salim_merchant',
      iron_abbey: 'inquisitor_malik'
    };
    var speakerId = citySpeakers[city.id] || 'protagonist';
    var debateMode = city.id === 'iron_abbey' || city.id === 'royal_capital';

    return {
      id: 'proc_' + city.id + '_' + state.timeline.turn,
      chapter: ch,
      sceneId: city.sceneId,
      speakerId: speakerId,
      title: 'موسم في ' + city.name + ' (عمر ' + state.timeline.age + ')',
      body: 'تتقلّب موازين القوى في ' + city.name + '. الهمس في الحانات يتحدث عن صفقات سلاحٍ سرية ومطاردات في الأزقة. كيف تقضي هذا الموسم لبناء قوتك ومكانتك؟',
      choices: [
        {
          id: 'proc_train',
          label: 'تدريب قتالي شاق وممارسة مهارات السلاح',
          hint: '+قتال +قوة -15 جهد',
          effects: { stats: { str: 1 }, skills: { combat: 1 }, vitals: { stamina: -15, gold: 8 } },
          outcome: 'تدرّبت لساعات طويلة حتى تصلّب عودك وكسبت أجراً بسيطاً.'
        },
        {
          id: 'proc_trade',
          label: 'إبرام صفقات ومراقبة حركة التجار والسياسة',
          hint: '+ذهب +تجارة/سياسة',
          effects: { skills: { trade: 1, politics: 1 }, vitals: { gold: 18 + ch * 8 } },
          outcome: 'أدرتَ صفقة رابحة ووسّعت شبكة معلوماتك داخل المدينة.'
        },
        {
          id: 'proc_encounter',
          label: debateMode ? 'خوض مناظرة سياسية/تفتيشية ساخنة' : 'خوض نزال تكتيكي في القطاع المظلم',
          hint: debateMode ? 'مواجهة حُجّة تكتيكية!' : 'قتال تكتيكي بجولات!',
          encounterId: debateMode ? 'inquisition_trial' : (ch >= 2 ? 'armored_deserter' : 'alley_cutthroat'),
          outcome: 'قررتَ اقتحام الاختبار الحقيقي وجهاً لوجه.'
        }
      ]
    };
  }

  function applyDeltaEffects(state, effects) {
    if (!effects) return;
    if (effects.stats) {
      Object.keys(effects.stats).forEach(function (k) {
        state.stats[k] = clamp((state.stats[k] || 0) + effects.stats[k], 1, 30);
      });
    }
    if (effects.skills) {
      Object.keys(effects.skills).forEach(function (k) {
        state.skills[k] = clamp((state.skills[k] || 0) + effects.skills[k], 0, 15);
      });
    }
    if (effects.vitals) {
      Object.keys(effects.vitals).forEach(function (k) {
        if (k === 'hp') state.vitals.hp = clamp(state.vitals.hp + effects.vitals.hp, 0, state.vitals.maxHp);
        else if (k === 'stamina') state.vitals.stamina = clamp(state.vitals.stamina + effects.vitals.stamina, 0, state.vitals.maxStamina);
        else if (k === 'suspicion') state.vitals.suspicion = clamp(state.vitals.suspicion + effects.vitals.suspicion, 0, 100);
        else if (typeof state.vitals[k] === 'number') state.vitals[k] += effects.vitals[k];
      });
    }
    if (effects.factions) {
      Object.keys(effects.factions).forEach(function (k) {
        if (typeof state.factions[k] === 'number') {
          state.factions[k] = clamp(state.factions[k] + effects.factions[k], -100, 100);
        }
      });
    }
    if (effects.flags) {
      Object.keys(effects.flags).forEach(function (k) {
        state.progression.flags[k] = effects.flags[k];
      });
    }
    if (effects.grantWeapon) {
      state.equipment = state.equipment || {};
      state.equipment.weapon = effects.grantWeapon;
      state.inventory = state.inventory || { items: [], weapons: [], armors: [], accessories: [], potions: [] };
      state.inventory.weapons = state.inventory.weapons || [];
      if (state.inventory.weapons.indexOf(effects.grantWeapon) === -1) {
        state.inventory.weapons.push(effects.grantWeapon);
      }
    }
    if (effects.grantArmor) {
      state.equipment = state.equipment || {};
      state.equipment.armor = effects.grantArmor;
      state.inventory = state.inventory || { items: [], weapons: [], armors: [], accessories: [], potions: [] };
      state.inventory.armors = state.inventory.armors || [];
      if (state.inventory.armors.indexOf(effects.grantArmor) === -1) {
        state.inventory.armors.push(effects.grantArmor);
      }
    }
    if (effects.grantPotion) {
      state.equipment = state.equipment || {};
      state.equipment.belt = state.equipment.belt || [null, null, null];
      for (var b = 0; b < state.equipment.belt.length; b++) {
        if (!state.equipment.belt[b]) {
          state.equipment.belt[b] = effects.grantPotion;
          break;
        }
      }
      state.inventory = state.inventory || { items: [], weapons: [], armors: [], accessories: [], potions: [] };
      state.inventory.potions = state.inventory.potions || [];
      state.inventory.potions.push(effects.grantPotion);
    }
    if (effects.setLocation) {
      state.timeline.locationId = effects.setLocation;
    }
  }

  function resolveEndingSummary(state) {
    var id = state.progression.endingId;
    var f = state.factions;
    var flags = (state.progression && state.progression.flags) || {};

    if (!id || id === 'ending_early_death' || (id === 'ending_slain' && (state.timeline.age < 18 || state.timeline.chapter < 3))) {
      if (state.vitals.hp <= 0) {
        if (state.timeline.age < 18 || state.timeline.chapter < 3) {
          id = 'ending_death_without_trace';
        } else if (flags.debt_defaulted) {
          id = 'ending_debt_ruin';
        } else {
          id = 'ending_slain';
        }
      }
      else if (flags.ending_emperor_iron) id = 'ending_emperor_iron';
      else if (flags.ending_alchemist_prophet || flags.created_panacea) id = 'ending_alchemist_prophet';
      else if (flags.ending_companion_dynasty) id = 'ending_companion_dynasty';
      else if (flags.ending_merchant_kingmaker) id = 'ending_merchant_kingmaker';
      else if (flags.ending_shadow_phantom_king) id = 'ending_shadow_phantom_king';
      else if (flags.ending_rebel_liberator) id = 'ending_rebel_liberator';
      else if (flags.ending_betrayed_fall) id = 'ending_betrayed_fall';
      else if (f.shadow >= 45) id = 'ending_shadow_sovereign';
      else if (f.legion >= 45) id = 'ending_legion_marshal';
      else if (f.merchants >= 45) id = 'ending_merchant_baron';
      else if (f.church >= 45) id = 'ending_inquisitor_lord';
      else id = 'ending_wandering_shadow';
      state.progression.endingId = id;
    }

    var catalog = {
      ending_death_without_trace: {
        id: 'ending_death_without_trace',
        title: 'موتٌ بلا أثر',
        desc: 'سقط جسدك النحيل في صمتٍ موحش بين ركام الرماد وأوحال الأزقة؛ لم يعلم أحد باسمك ولا من أين أتيت، ومضى هذا العالم القاسي في صراعاته كأنك لم تكن يوماً سوى ظلٍ عابر.'
      },
      ending_early_death: { id: 'ending_early_death', title: 'سقوطٌ قبل الأوان', desc: 'ابتلعت قسوة هذا العالم الغريب خطواتك قبل أن تكتمل الرحلة.' },
      ending_debt_ruin: { id: 'ending_debt_ruin', title: 'أسير الديون والملاحقة', desc: 'أحكم المرابون قبضتهم على حريتك حتى سقطت في السجون المنسية.' },
      ending_slain: { id: 'ending_slain', title: 'نصلٌ في الرماد', desc: 'خسرتَ نزالاً قاتلاً، وبقيت قصتك محفورة كتحذير في طرقات الثغور.' },
      ending_executed: { id: 'ending_executed', title: 'حكم التطهير الكنسي', desc: 'أُدينتَ أمام منصة النظام المقدس، وانتهى جدلك مع العالم تحت الفأس.' },
      ending_betrayed_fall: { id: 'ending_betrayed_fall', title: 'سقوط الخيانة الكبرى', desc: 'طعنة غادرة في الظهر من أقرب الحلفاء عند عتبات النصر.' },
      ending_shadow_sovereign: { id: 'ending_shadow_sovereign', title: 'سيّد الظلال والأزقة', desc: 'من تائهٍ بلا مأوى إلى حاكم الخفاء الذي ترتعد له قصور الإمارات.' },
      ending_shadow_phantom_king: { id: 'ending_shadow_phantom_king', title: 'ملك الأشباح والشفرة الملكية', desc: 'جمعتَ بين أسرار العرش البائد وشبكة اغتيالات الظل لحكم القارة دون أن يراك أحد.' },
      ending_legion_marshal: { id: 'ending_legion_marshal', title: 'قائد ثغور الإمارات', desc: 'صنعتَ مجدك بالدم والفولاذ، وصرت الدرع الحديدي الذي يهاب العدو اقتحامه.' },
      ending_emperor_iron: { id: 'ending_emperor_iron', title: 'إمبراطور الفولاذ والعرش المسترد', desc: 'أشهرتَ الختم الملكي وقدت الجيوش لاسترداد العرش وتوحيد القارة الممزقة.' },
      ending_merchant_baron: { id: 'ending_merchant_baron', title: 'أمير المصارف والقوافل', desc: 'فهمتَ لغة الذهب قبل السيف؛ تتحرك الجيوش اليوم بإشارة من دفترك.' },
      ending_merchant_kingmaker: { id: 'ending_merchant_kingmaker', title: 'صانع الملوك الذهبي', desc: 'اشتريتَ ولاءات البلاط والفرسان بالذهب ونصّبت ملكاً دمية تحركه مصارفك.' },
      ending_inquisitor_lord: { id: 'ending_inquisitor_lord', title: 'سيف العقيدة المقدسة', desc: 'أخضعتَ الأسرار المحرمة وفرضت نظامك الصارم على الملوك والسوقة.' },
      ending_alchemist_prophet: { id: 'ending_alchemist_prophet', title: 'نبي الخيمياء وإكسير الحياة', desc: 'أتممتَ تخليق الترياق المعجزة وكسرت سطوة المحاكم وأنقذت الملايين من الوباء.' },
      ending_rebel_liberator: { id: 'ending_rebel_liberator', title: 'محرر الثغور والفقراء', desc: 'قدتَ ثورة الجياع والمشردين وأسقطت حصون الأمراء والمحتكرين.' },
      ending_companion_dynasty: { id: 'ending_companion_dynasty', title: 'سلالة العهد والدم', desc: 'تزوجتَ رفيق العمر وأسستما حلفاً حصيناً وسلالة حكم جديدة تدير المدن.' },
      ending_wandering_shadow: { id: 'ending_wandering_shadow', title: 'الظل التاه الحر', desc: 'عبرتَ الـ 25 عاماً دون أن تمتلكك إمارة أو نقابة؛ غريبٌ نجا بنفسه وظلّ لغزاً للعالم.' }
    };
    return catalog[id] || catalog.ending_wandering_shadow;
  }

  function computeDiamondsReward(state, endingId) {
    var age = (state.timeline && state.timeline.age) || 7;
    // 1. موت بلا أثر
    if (endingId === 'ending_death_without_trace') {
      return age < 10 ? 0 : 1;
    }
    // 2. وفيات مبكرة / إفلاس / إعدام
    if (endingId === 'ending_early_death' || endingId === 'ending_slain' || endingId === 'ending_debt_ruin' || endingId === 'ending_executed' || endingId === 'ending_betrayed_fall') {
      if (age < 10) return 0;
      if (age < 12) return 1;
      if (age < 18) return 2;
      return 4;
    }
    // 3. النهايات العادية / السالك الحر
    if (endingId === 'ending_wandering_shadow' || endingId === 'ending_rebel_liberator') {
      return 8;
    }
    // 4. نهايات الفصائل والحكام الكبار
    if (endingId === 'ending_legion_marshal' || endingId === 'ending_shadow_sovereign' || endingId === 'ending_merchant_baron' || endingId === 'ending_inquisitor_lord') {
      return 12;
    }
    // 5. النهايات الأسطورية (الإمبراطور، نبي الخيمياء، سلالة العهد، صانع الملوك، ملك الأشباح)
    if (endingId === 'ending_emperor_iron' || endingId === 'ending_alchemist_prophet' || endingId === 'ending_merchant_kingmaker' || endingId === 'ending_companion_dynasty' || endingId === 'ending_shadow_phantom_king') {
      return 18;
    }
    return Math.max(1, Math.floor(age / 4));
  }

  function formatConsequenceNote(effects) {
    if (!effects) return '';
    var parts = [];
    var statNames = { str: 'قوة', agi: 'براعة', int: 'ذكاء', ins: 'حدس', cha: 'كاريزما' };
    var skillNames = { combat: 'قتال', smithing: 'حدادة', stealth: 'تخفي', trade: 'تجارة', alchemy: 'خيمياء', politics: 'سياسة' };
    var facNames = { legion: 'الفيلق', shadow: 'الظل', merchants: 'التجار', church: 'الكنيسة' };

    if (effects.stats) {
      Object.keys(effects.stats).forEach(function (k) {
        var v = effects.stats[k];
        parts.push((v > 0 ? '+' : '') + v + ' ' + (statNames[k] || k));
      });
    }
    if (effects.skills) {
      Object.keys(effects.skills).forEach(function (k) {
        var v = effects.skills[k];
        parts.push((v > 0 ? '+' : '') + v + ' ' + (skillNames[k] || k));
      });
    }
    if (effects.vitals) {
      if (effects.vitals.hp) parts.push((effects.vitals.hp > 0 ? '+' : '') + effects.vitals.hp + ' صحة');
      if (effects.vitals.stamina) parts.push((effects.vitals.stamina > 0 ? '+' : '') + effects.vitals.stamina + ' جهد');
      if (effects.vitals.gold) parts.push((effects.vitals.gold > 0 ? '+' : '') + effects.vitals.gold + ' ذهب');
      if (effects.vitals.suspicion) parts.push((effects.vitals.suspicion > 0 ? '+' : '') + effects.vitals.suspicion + ' شبهة');
    }
    if (effects.factions) {
      Object.keys(effects.factions).forEach(function (k) {
        var v = effects.factions[k];
        parts.push((v > 0 ? '+' : '') + v + ' سمعة ' + (facNames[k] || k));
      });
    }
    if (effects.grantWeapon) parts.push('تجهيز سلاح جديد');
    if (effects.grantArmor) parts.push('تجهيز درع جديد');
    if (effects.grantPotion) parts.push('تجهيز جرعة');
    if (parts.length === 0) return '';
    return '【 ' + parts.join(' • ') + ' 】';
  }

  function chooseOption(state, event, choiceId, rng) {
    if (!state || state.progression.isEnded || !event) {
      return { ok: false, reason: 'الرحلة منتهية.' };
    }
    var choice = null;
    for (var i = 0; i < event.choices.length; i++) {
      if (event.choices[i].id === choiceId) {
        choice = event.choices[i];
        break;
      }
    }
    if (!choice) return { ok: false, reason: 'خيار غير صالح.' };

    state.progression.flags.origin_done = true;
    state.progression.flags._seenEvents = state.progression.flags._seenEvents || {};
    state.progression.flags._seenEvents[event.id] = true;

    applyDeltaEffects(state, choice.effects);

    if (choice.meet && GameApp.V6CastEngine) {
      GameApp.V6CastEngine.meetCharacter(state, choice.meet.charId, {
        loyalty: choice.meet.loyalty || 0,
        trust: choice.meet.trust || 0
      });
    }

    if (choice.nextEventId) {
      state.progression.forcedNextEventId = choice.nextEventId;
    }

    recordTimelineNode(state, event.id, event.title, choice.label, state.timeline.locationId);

    var note = formatConsequenceNote(choice.effects);
    var outcomeWithNote = choice.outcome + (note ? ('\n\n' + note) : '');

    // If choice triggers tactical encounter, pause turn advance until encounter resolves
    if (choice.encounterId && GameApp.V6Combat) {
      var enc = GameApp.V6Combat.startEncounter(state, choice.encounterId, rng);
      return {
        ok: true,
        startedEncounter: true,
        encounter: enc,
        outcomeText: outcomeWithNote,
        turnStep: null,
        nextEvent: event
      };
    }

    return finalizeTurnAfterChoice(state, outcomeWithNote, rng);
  }

  function finalizeTurnAfterChoice(state, outcomeText, rng) {
    var turnStep = GameApp.V6WorldTime.advanceTurn(state, rng);
    var achResult = GameApp.V6CastEngine.evaluatePrestigeAchievements(state);

    var nextEvent = null;
    var ending = null;

    if (state.progression.isEnded) {
      ending = resolveEndingSummary(state);
      var diamondsEarned = computeDiamondsReward(state, state.progression.endingId);
      state.progression.diamondsEarned = diamondsEarned;
      if (GameApp.V6Storage) {
        GameApp.V6Storage.recordProfileUnlock(state.progression.endingId, achResult.newlyUnlocked);
        GameApp.V6Storage.addDiamonds(diamondsEarned);
      }
    } else {
      nextEvent = getNextEvent(state);
      state.progression.currentEventId = nextEvent.id;
    }

    if (GameApp.V6Storage) {
      GameApp.V6Storage.saveAuto(state);
    }

    return {
      ok: true,
      startedEncounter: false,
      outcomeText: outcomeText || '',
      turnStep: turnStep,
      newlyUnlockedPrestige: achResult.newlyUnlocked,
      nextEvent: nextEvent,
      ending: ending,
      diamondsEarned: state.progression.diamondsEarned || 0
    };
  }

  GameApp.V6Engine = {
    clone: clone,
    createNewGame: createNewGame,
    getNextEvent: getNextEvent,
    getEventById: getEventById,
    chooseOption: chooseOption,
    finalizeTurnAfterChoice: finalizeTurnAfterChoice,
    resolveEndingSummary: resolveEndingSummary,
    computeDiamondsReward: computeDiamondsReward,
    formatConsequenceNote: formatConsequenceNote
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6Engine;
  }
})(typeof window !== 'undefined' ? window : globalThis);

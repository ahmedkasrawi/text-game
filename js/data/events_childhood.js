(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});
  GameApp.Data = GameApp.Data || {};

  GameApp.Data.childhoodEvents = [
    // ================= AGE 7 =================
    {
      id: 'child_7_q1',
      phase: 'childhood',
      age: 7,
      quarter: 1,
      priority: 100,
      category: 'family',
      categoryLabel: 'بداية الوعي',
      title: 'استيقاظ في وهج الكير',
      text: 'في السابعة من عمرك، تنقشع الضبابية عن ذهنك فتدرك أنك تحمل ذكريات عالمٍ آخر. أنت الآن ابن «غارون» حداد المدينة الصلب، و«سيرين» المغامرة التي اعتزلت المهام وعلّقت سيفها فوق الموقد. أمامك ربيعك الأول لتختار كيف تقضي صباحاتك.',
      choices: [
        {
          id: 'forge_watch',
          label: 'الوقوف قرب السندان ومراقبة طرق الأب للحديد',
          sub: 'تقوية البنية وتعلّم أساسيات الحدادة',
          success: {
            text: 'تتعود يداك الصغيرتان على حرارة الجمر ووزن المطرقة الخفيفة، فيبتسم والدك غارون وهو يراك تفهم إيقاع الطرق سريعاً.',
            effects: { attr: { str: 1 }, skill: { smithing: 2 }, faction: { family: 6 } }
          }
        },
        {
          id: 'mother_lessons',
          label: 'مرافقة أمك في باحة المنزل لتعلم التوازن والمناورة',
          sub: 'بناء الرشاقة واكتساب أساسيات القتال',
          success: {
            text: 'ترميك سيرين بعصي خشبية لتفاديها، وتهمس لك: «في هذا العالم، البطيء يموت قبل أن يدرك من ضربه».',
            effects: { attr: { agi: 1, ins: 1 }, skill: { combat: 2 }, faction: { family: 6 } }
          }
        },
        {
          id: 'study_ledgers',
          label: 'قراءة دفاتر الحسابات ومذكرات الأعشاب والمعادن في الزاوية',
          sub: 'صقل الذكاء واكتساب أساسيات التجارة أو الكيمياء',
          success: {
            text: 'تمزج بين معرفتك الحديثة بالرياضيات والتركيبات المحلية، فتفهم سريعاً كيف تتحرك الأموال والمواد.',
            effects: { attr: { int: 2 }, skill: { trade: 1, alchemy: 1 }, flags: { earlyScholar: true } }
          }
        },
        {
          id: 'market_observe',
          label: 'التسلل بين أزقة السوق لمراقبة المسافرين دون لفت الأنظار',
          sub: 'اكتساب أساسيات الظلال والمكائد',
          success: {
            text: 'تتعلم التحرك بخفة بين العربات المزدحمة وسماع همسات الغرباء عن توتر الحدود دون أن يشعر بك أحد.',
            effects: { attr: { cha: 1, agi: 1 }, skill: { shadow: 2 }, rep: 2, faction: { humans: 4 } }
          }
        }
      ]
    },
    {
      id: 'child_7_q2',
      phase: 'childhood',
      age: 7,
      quarter: 2,
      priority: 100,
      category: 'world',
      categoryLabel: 'حياة المدينة',
      title: 'قافلة الحدود الصيفية',
      text: 'في حرّ الصيف تصل قافلة تجارية منهكة من تخوم الغابة الشرقية. عرباتها مثلومة بسهام خفيفة، ورجالها يتكتمون على ما واجهوه في الطريق.',
      choices: [
        {
          id: 'help_repair',
          label: 'مساعدة الحوذية في تثبيت إطارات العجلات الحديدية',
          check: { attr: 'str', skill: 'smithing', base: 34 },
          success: {
            text: 'تثبت المسامير بإتقان يفوق عمرك، فيكافئك كبير القافلة بعملات فضية ويدعو لك بالبركة.',
            effects: { gold: 12, rep: 3, skill: { smithing: 1 }, faction: { humans: 5 } }
          },
          fail: {
            text: 'تنزلق المطرقة فتجرح يدك قليلاً لأن خبرتك بالحدادة ما زالت محدودة، لكنك تتعلم ثمن التسرع أمام المعدن.',
            effects: { hp: -9, skill: { smithing: 1 } }
          }
        },
        {
          id: 'inspect_arrows',
          label: 'التسلل لفحص رؤوس السهام العالقة في الخشب خفية',
          sub: 'تعلّم القراءة الميدانية وتنمية الظلال والحدس',
          success: {
            text: 'تكتشف أن السهام مصنوعة من خشب الرماد الأخضر بريشٍ متشقق؛ إنها تحذير من دوريات الجان لا محاولة قتل.',
            effects: { attr: { ins: 1 }, skill: { shadow: 1 }, flags: { knowsElvenWarning: true } }
          }
        },
        {
          id: 'int_inspect_cargo',
          minInt: 8,
          label: 'ملاحظة بقع الصمغ والملح على الصناديق المخبأة',
          sub: 'بصيرة ذكاء (8+): استنتاج طبيعة الشحنة الحقيقية مقابل خطر الملاحقة',
          success: {
            text: 'تدرك من الوزن ونوع الأختام أن القافلة تهرب خاماً محظوراً عبر طرق الجان! تستخلص عمولة صمت لكنك تلفت أنظار المهربين.',
            effects: {
              gold: 16,
              threat: 5,
              skill: { trade: 1, shadow: 1 },
              flags: { spottedSmugglers: true },
              queueRipple: { eventId: 'ripple_smuggler_retaliation', delayMin: 16, delayMax: 24, expiresAfter: 34 }
            }
          }
        },
        {
          id: 'ask_guards',
          label: 'ملازمة الحراس والتدرب معهم عند البوابة',
          success: {
            text: 'يعلمك أحد المخضرمين وقفة الدرع الصحيحة ويمنحك نصائح عن البقاء في الكمائن.',
            effects: { attr: { str: 1 }, skill: { combat: 1 }, faction: { humans: 4 } }
          }
        }
      ]
    },
    {
      id: 'child_7_q3',
      phase: 'childhood',
      age: 7,
      quarter: 3,
      priority: 100,
      category: 'family',
      categoryLabel: 'أسرار العائلة',
      title: 'الصندوق المغلق في العلية',
      text: 'بينما تهطل أمطار الخريف، تعثر في علية المنزل على صندوق حديدي قديم يخص والدتك سيرين، وله قفل غريب لم تشاهده في متاجر المدينة.',
      choices: [
        {
          id: 'pick_lock',
          label: 'التسلل ليلاً ومحاولة فتح القفل بأسلاك دقيقة دون صوت',
          check: { attr: 'agi', skill: 'shadow', base: 34 },
          success: {
            text: 'ينفتح القفل بتكة خفيفة! تجد خريطة لممرات الغابة القديمة وخاتماً فضياً منقوشاً عليه شعار نقابة سرية.',
            effects: { attr: { agi: 1 }, skill: { shadow: 2 }, flags: { foundMotherMap: true }, rep: 2, faction: { family: -3 } }
          },
          fail: {
            text: 'ينكسر السلك داخل القفل وتصدر ضجة تنبه والدتك فتغلق الصندوق بهدوء حازم وتطلب منك احترام حدودك.',
            effects: { faction: { family: -8 }, attr: { ins: 1 }, skill: { shadow: 1 } }
          }
        },
        {
          id: 'ask_mother_honest',
          label: 'مصادقة أمك وسؤالها مباشرة عن تاريخ الصندوق',
          success: {
            text: 'تتأمل سيرين عينيك الجادتين ثم تفتح الصندوق بنفسها وتريك تذكار رفيق قديم فقدته في إحدى الغارات، فتزداد ثقتها بك.',
            effects: { faction: { family: 10 }, attr: { cha: 1, ins: 1 }, flags: { motherSharedPast: true } }
          }
        },
        {
          id: 'int_study_seal',
          minInt: 8,
          label: 'رسم نقوش القفل وتصنيفها ذهنياً دون لمسها',
          sub: 'بصيرة ذكاء (8+): تحليل آلية القفل ومصدره',
          success: {
            text: 'تتعرف على آلية الزنبرك المزدوج من تصميم أقزام الشمال، وتستنتج أن ماضي والدتك يتجاوز حدود هذه المقاطعة بكثير.',
            effects: { attr: { int: 1 }, skill: { smithing: 1, shadow: 1 }, flags: { analyzedLock: true } }
          }
        }
      ]
    },
    {
      id: 'child_7_q4',
      phase: 'childhood',
      age: 7,
      quarter: 4,
      priority: 100,
      category: 'world',
      categoryLabel: 'اختبار الشتاء',
      title: 'صقيع ندرة الفحم',
      text: 'يحل شتاء قارس تنقطع فيه طرق التلال، فيرتفع سعر الفحم والحديد. الورشة مزدحمة بطلبات الفلاحين لإصلاح الفؤوس وسط نقص حاد في الوقود.',
      choices: [
        {
          id: 'quench_idea',
          label: 'اقتراح تنظيم دورة النفخ ومعالجة الفحم الرطب لتوفير الوقود',
          check: { attr: 'int', skill: 'smithing', base: 34 },
          success: {
            text: 'تساعد فكرتك المنظمة في توفير ربع الفحم المعتاد وإنجاز الطلبات كلها قبل العاصفة.',
            effects: { gold: 16, rep: 4, skill: { smithing: 1, alchemy: 1 }, faction: { family: 6 } }
          },
          fail: {
            text: 'تبذل جهداً كبيراً لكن الحسابات الأولية لم تناسب نوع الخشب الرطب، فتكتفي بمساعدة يدوية متعبة.',
            effects: { hp: -9, skill: { smithing: 1 } }
          }
        },
        {
          id: 'haul_wood',
          label: 'مرافقة الحطابين لجمع الأخشاب الصلبة رغم الصقيع',
          success: {
            text: 'يعود جسدك أكثر صلابة وتحملاً، وتكسب احترام أهالي الحي.',
            effects: { attr: { str: 2 }, hp: -6, rep: 3, faction: { humans: 4 } }
          }
        },
        {
          id: 'barter_coal',
          label: 'التفاوض مع أصحاب المخازن لمقايضة أدوات مرممة بالفحم',
          success: {
            text: 'بذكائك في العرض والطلب، تخرج الورشة بربح معقول دون أن ينقصكم دفء الموقد.',
            effects: { gold: 18, attr: { cha: 1 }, skill: { trade: 2 } }
          }
        }
      ]
    },

    // ================= AGE 8 =================
    {
      id: 'child_8_q1',
      phase: 'childhood',
      age: 8,
      quarter: 1,
      priority: 100,
      category: 'family',
      categoryLabel: 'التدريب المزدوج',
      title: 'القوس والمطرقة',
      text: 'تبلغ الثامنة وقد صار جسدك أقدر على التدريب الجاد. يجتمع غارون وسيرين في الفناء، ولكل منهما رغبة في توجيه طاقتك هذا الربيع.',
      choices: [
        {
          id: 'focus_smithing',
          label: 'تكريس الربيع لسبك السكاكين والتعرف على الفولاذ',
          success: {
            text: 'تتعلم قراءة لون الجمر عند الطرق وتصنع بمساعدة أبيك سكيناً أفضل وأكثر توازناً.',
            effects: { attr: { str: 1 }, skill: { smithing: 2 }, setWeapon: { name: 'خنجر ورشة مقسّى', power: 2, rarity: 'common', icon: 'dagger' }, faction: { family: 5 } }
          }
        },
        {
          id: 'focus_combat',
          label: 'تدريب قاسي مع أمك على حركات الاقتحام والدفاع',
          success: {
            text: 'تتحسن ردود فعلك وتكسب قدرة أوضح على قراءة اتجاه الضربات قبل انطلاقها.',
            effects: { attr: { agi: 2 }, skill: { combat: 2 }, maxHp: 5, hp: 5 }
          }
        },
        {
          id: 'focus_stealth_shadows',
          label: 'طلب دروس خاصة من أمك في التحرك الصامت والاختفاء بين الظلال',
          success: {
            text: 'تضحك سيرين بإعجاب وتعلمك كيف تخطو على الأوراق اليابسة بلا حفيف وكيف تندمج مع حواف الجدران.',
            effects: { attr: { agi: 1, ins: 1 }, skill: { shadow: 2 } }
          }
        },
        {
          id: 'balance_both',
          label: 'الجمع بين تجارب الخلطات والتقطير ليلاً والتأمل الصباحي',
          success: {
            text: 'تُرسّخ أساساً في العلوم التطبيقية والحدس الدقيق، وإن أرهقك السهر قليلاً.',
            effects: { attr: { int: 1, ins: 1 }, skill: { alchemy: 2 }, hp: -6 }
          }
        }
      ]
    },
    {
      id: 'child_8_q2',
      phase: 'childhood',
      age: 8,
      quarter: 2,
      priority: 100,
      category: 'world',
      categoryLabel: 'لقاء نادر',
      title: 'الهارب ذو الأذنين المدببتين',
      text: 'عند غسق الصيف، تلمح شابةً جريحةً من الجان الغابويين تُدعى «إيلارين» تختبئ خلف كومة الفحم في باحة الورشة وهي تضغط على كتفها النازف. من بعيد تتصاعد أصوات صيادي جوائز يمشطون الزقاق بحثاً عنها.',
      choices: [
        {
          id: 'hide_elf',
          label: 'إخفاؤها في المخزن وتضليل الصيادين بهدوء',
          check: { attr: 'cha', skill: 'shadow', base: 34, flagBonuses: [{ flag: 'knowsElvenWarning', bonus: 10 }] },
          success: {
            text: 'تغطيها بأكياس الفحم وتصرف الصيادين نحو البوابة الشمالية. تترك لك إيلارين تميمة خشبية وتهمس: «الغابة لا تنسى دينها، سنلتقي حين يكبر ظلنا».',
            effects: {
              faction: { elves: 22 },
              attr: { cha: 1 },
              skill: { shadow: 1 },
              flags: { helpedElvenFugitive: true },
              addTrait: 'صديق الظل الأخضر',
              queueRipple: { eventId: 'ripple_elven_gift', delayMin: 16, delayMax: 24, expiresAfter: 40 }
            }
          },
          fail: {
            text: 'يرتبك صوتك فيشك الصيادون بك ويفتشون الباحة؛ تندفع إيلارين هاربةً ويصيبك صياد بضربة غاضبة قبل أن ينسحبوا.',
            effects: { hp: -16, faction: { elves: 6, humans: -6 }, threat: 7 }
          }
        },
        {
          id: 'report_elf',
          label: 'إبلاغ الصيادين بمكانها لكسب المكافأة ورضا الحرس',
          success: {
            text: 'يقبضون عليها ويلقون إليك كيساً من الفضة، لكن نظرتها الباردة وهي تهمس باسمك تلاحقك وتغلق أمامك أبواب الغابة طويلاً.',
            effects: { gold: 25, rep: 3, faction: { humans: 12, elves: -26 }, flags: { betrayedElvenFugitive: true } }
          }
        },
        {
          id: 'int_treat_trade',
          minInt: 9,
          label: 'تضميد جرحها بمطهر مغلي مقابل خرائط الدوريات في الغابة',
          sub: 'بصيرة ذكاء (9+): إسعاف علمي ومقايضة معلوماتية ترفع الشبهة قليلاً',
          check: { attr: 'int', skill: 'alchemy', base: 38, noAgeScale: true },
          success: {
            text: 'تداوي كتف إيلارين بفعالية وتطلب منها خارطة الدوريات الآمنة. تقدر ذكاءك وتمنحك مسارات لا يعرفها البشر.',
            effects: {
              faction: { elves: 16 },
              attr: { ins: 1 },
              skill: { alchemy: 1, trade: 1 },
              flags: { helpedElvenFugitive: true, knowsForestPaths: true },
              queueRipple: { eventId: 'ripple_elven_gift', delayMin: 16, delayMax: 24, expiresAfter: 40 }
            }
          },
          fail: {
            text: 'يطول التضميد فيقترب الصيادون؛ تفر إيلارين وتتعرض لدفعة قاسية أثناء تغطيتها.',
            effects: { hp: -14, faction: { elves: 10 }, threat: 6, flags: { helpedElvenFugitive: true } }
          }
        }
      ]
    },
    {
      id: 'child_8_q3',
      phase: 'childhood',
      age: 8,
      quarter: 3,
      priority: 100,
      category: 'assassin',
      categoryLabel: 'همس الظلال',
      title: 'العلامة السوداء في الحانة',
      text: 'أثناء توصيل سكين مرمّم لحانة «الجرس المكسور»، ترى رجلاً ملثماً يمرر قطعة نحاس سوداء لصاحب الحانة ويهمس باسم والدتك القديم.',
      choices: [
        {
          id: 'eavesdrop',
          label: 'الاندساس في الظل قرب البرميل لاستراق السمع حتى النهاية',
          check: { attr: 'agi', skill: 'shadow', base: 34, flagBonuses: [{ flag: 'foundMotherMap', bonus: 8 }] },
          success: {
            text: 'تلتقط بصمت أن هناك جهة في العاصمة تبحث عن «سيرين ذات الندبة». تحذر أمك مبكراً وتستعدان لما قد يأتي.',
            effects: { skill: { shadow: 2 }, attr: { ins: 1 }, faction: { family: 8 }, flags: { warnedMotherEarly: true }, threat: 6 }
          },
          fail: {
            text: 'تتحرك صفيحة معدنية تحت قدمك فتلتفت العيون نحوك؛ تنسحب مسرعاً لكن الملثم يرى ملامح وجهك جيداً!',
            effects: {
              threat: 16,
              hp: -8,
              skill: { shadow: 1 },
              flags: { spottedByScout: true },
              queueRipple: { eventId: 'ripple_scar_vendetta', delayMin: 14, delayMax: 24, expiresAfter: 38 }
            }
          }
        },
        {
          id: 'leave_fast',
          label: 'تسليم الطلب والمغادرة فوراً وإبلاغ والدك بما رأيت',
          success: {
            text: 'تفضل السلامة على المجازفة؛ يتفهم غارون الأمر ويعزز أقفال الورشة ليلاً.',
            effects: { attr: { ins: 1 }, faction: { family: 5 }, threat: 3 }
          }
        },
        {
          id: 'int_coin_code',
          minInt: 9,
          label: 'حفظ شكل النحاس المثلّم وتحليل سبيكته ومعناه',
          sub: 'بصيرة ذكاء (9+): تمييز عملة التعاقد (+3 تهديد للاقتراب)',
          success: {
            text: 'من خبرتك بالمعادن تلاحظ أن النحاس مطبوع بختم مكسور تستخدمه نقابة «الإبرة الصامتة» للاغتيالات؛ معلومة تساوي ذهباً.',
            effects: { threat: 3, skill: { shadow: 2, smithing: 1 }, flags: { knowsSilentNeedle: true, warnedMotherEarly: true } }
          }
        },
        {
          id: 'ins_read_bartender',
          minAttr: { ins: 7 },
          label: 'قراءة ارتجاف يدي صاحب الحانة وتحديد مخرج القاتل دون الاقتراب',
          sub: 'بصيرة حدس (7+): قراءة التوتر الجسدي وتجنب الكشف كلياً',
          success: {
            text: 'حدسك ينقذك من التهور؛ تلاحظ خوف النادل من النصل المخفي تحت معطف الضيف وتنذر أمك بهدوء بلا أي أثر!',
            effects: { attr: { ins: 1 }, skill: { shadow: 1 }, faction: { family: 8 }, flags: { warnedMotherEarly: true } }
          }
        }
      ]
    },
    {
      id: 'child_8_q4',
      phase: 'childhood',
      age: 8,
      quarter: 4,
      priority: 100,
      category: 'world',
      categoryLabel: 'نذير الشياطين',
      title: 'العملة القرمزية على العتبة',
      text: 'في صباح مثلج، تجد عملة من حديد داكن دافئة الملمس رغم الصقيع، محفوراً عليها قرن مكسور — رمز التجار المتعاملين مع تخوم الشياطين.',
      choices: [
        {
          id: 'keep_coin',
          label: 'إخفاء العملة ودراستها في غرفتك سراً',
          success: {
            text: 'تشعر بنبض حراري خفيف فيها؛ إنها سبيكة من خام الأراضي القاحلة، وقد تنفعك مستقبلاً في التفاوض أو الصهر.',
            effects: { attr: { int: 1, ins: 1 }, faction: { demons: 6 }, flags: { keptDemonCoin: true }, noCounterFaction: true }
          }
        },
        {
          id: 'give_parents',
          label: 'تسليمها لوالديك فوراً دون لمسها طويلاً',
          success: {
            text: 'يشحب وجه أمك لحظة ثم تلقمها الكير لتصهرها وتثني على يقظتك وحسن تصرفك.',
            effects: { faction: { family: 8, humans: 4 }, threat: -4 }
          }
        },
        {
          id: 'sell_collector',
          label: 'عرضها بهدوء على تاجر التحف الغامض في السوق',
          success: {
            text: 'يشتريها التاجر صامتاً بسعر سخي، وينظر إليك بفضول كمن يراقب موهبة ناشئة.',
            effects: { gold: 24, skill: { trade: 2 }, threat: 7, faction: { family: -3 } }
          }
        }
      ]
    },

    // ================= AGE 9 =================
    {
      id: 'child_9_q1',
      phase: 'childhood',
      age: 9,
      quarter: 1,
      priority: 100,
      category: 'family',
      categoryLabel: 'طلبية غامضة',
      title: 'نصل الفضة الباردة',
      text: 'يزور الورشة فارس صامت برداء رمادي ويطلب من أبيك صياغة نصل مطلي بالفضة خلال أسبوع دون تسجيل اسمه في الدفاتر.',
      choices: [
        {
          id: 'assist_forge',
          label: 'مساعدة أبيك في صقل الشفرة وإتقان حدها',
          success: {
            text: 'تتعلم كيف تتماسك الفضة مع الحديد دون تشقق، ويرفع غارون من مهاراتك العملية.',
            effects: { skill: { smithing: 2 }, attr: { str: 1 }, gold: 12 }
          }
        },
        {
          id: 'observe_knight',
          label: 'مراقبة مشية الفارس وحفظ علامات درعه ولهجته',
          success: {
            text: 'تنتبه إلى طريقته في إخفاء يده اليسرى وشعار مخفي تحت الياقة؛ هو مبعوث من كبار النبلاء لا فارس عابر.',
            effects: { skill: { shadow: 1 }, attr: { ins: 2 }, flags: { noticedNobleKnight: true } }
          }
        },
        {
          id: 'charm_knight',
          label: 'التحدث معه بلباقة عن أخبار القلعة والطرق',
          check: { attr: 'cha', skill: 'trade', base: 34 },
          success: {
            text: 'يرق قلب الفارس لذكائك ولباقتك فيرمي لك بقشيشاً جيداً ويذكر لك أن الجيش بدأ تجنيد صناع السلاح.',
            effects: { gold: 18, rep: 4, attr: { cha: 1 }, faction: { humans: 8 }, skill: { trade: 1 } }
          },
          fail: {
            text: 'يكتفي الفارس بنظرة باردة ويطلب منك الالتزام بالصمت أثناء العمل.',
            effects: { rep: -2 }
          }
        },
        {
          id: 'cha_extract_patron',
          minAttr: { cha: 7 },
          label: 'التحدث بثقة ولباقة تقنع الفارس بتزويد الورشة بحصة فضة إضافية',
          sub: 'بصيرة كاريزما (7+): كسب رعاية النبلاء دون إثارة الريبة',
          success: {
            text: 'يرتاح الفارس لنضجك اللافت ويترك سبيكة فضة إضافية وخاتماً توصية عند الحرس.',
            effects: { gold: 22, rep: 5, faction: { humans: 8 }, flags: { noticedNobleKnight: true } }
          }
        }
      ]
    },
    {
      id: 'child_9_q2',
      phase: 'childhood',
      age: 9,
      quarter: 2,
      priority: 100,
      category: 'assassin',
      categoryLabel: 'محاولة اغتيال',
      title: 'ظلان فوق سقف الورشة',
      text: function (s) {
        if (s.flags.warnedMotherEarly) {
          return 'في ليلة صيفية خانقة، يرن الجرس المخفي الذي وضعته أمك بعد تحذيرك المبكر! قاتلان مأجوران يتسللان إلى الطابق العلوي لإنهاء حياة سيرين قبل أن يستيقظ الحي.';
        }
        return 'في ليلة صيفية خانقة، تنبهك رائحة زيت غريب عند النافذة. قاتلان مأجوران يتسللان إلى الطابق العلوي لإنهاء حياة أمك قبل أن يستيقظ الحي!';
      },
      choices: [
        {
          id: 'fight_alert',
          label: 'إطلاق صيحة التحذير ومهاجمة أقربهما بخنجرك',
          check: {
            attr: 'agi',
            skill: 'combat',
            gearBonus: 'weapon',
            base: 32,
            flagBonuses: [
              { flag: 'warnedMotherEarly', bonus: 14 },
              { flag: 'knowsSilentNeedle', bonus: 10 }
            ]
          },
          success: {
            text: 'يباغت صراخك القاتلين وتجرح كتف أحدهما، فتقفز سيرين من فراشها بسيفها وتطردهما نحو السطح!',
            effects: { skill: { combat: 2 }, rep: 5, faction: { family: 10 }, threat: 6, flags: { repelledNightRaid: true } }
          },
          fail: {
            text: 'تتلقى طعنة مؤلمة في ذراعك قبل أن تتدخل أمك وتجهز على أحدهما بينما يفر الثاني — المدعو «كايل» — جريحاً في الظلام متوعداً.',
            effects: {
              hp: -28,
              skill: { combat: 1 },
              threat: 12,
              flags: { scarredInChildhood: true },
              queueRipple: { eventId: 'ripple_scar_vendetta', delayMin: 14, delayMax: 24, expiresAfter: 38 }
            }
          }
        },
        {
          id: 'stealth_backstab',
          minSkill: { shadow: 3 },
          label: 'الالتفاف في العتمة وقطع حزام السموم عن القاتل الخلفي قبل أن ينتبه',
          sub: 'تخصص الظلال (3+): مباغتة صامتة تتطلب اختبار براعة عالٍ',
          check: { attr: 'agi', skill: 'shadow', base: 42, noAgeScale: true },
          success: {
            text: 'تتحرك كظل حقيقي فتطيح بالقاتل الخلفي بضربة خاطفة على عنقه، وتُطبق أمك على الآخر بلا جهد!',
            effects: { skill: { shadow: 2, combat: 1 }, faction: { family: 12 }, flags: { capturedAssassin: true, repelledNightRaid: true } }
          },
          fail: {
            text: 'يتنبّه القاتل لحركتك في اللحظة الأخيرة ويجرح جانبك قبل أن تطرده سيرين.',
            effects: { hp: -20, threat: 8, skill: { shadow: 1 } }
          }
        },
        {
          id: 'int_forge_trap',
          minInt: 10,
          label: 'رش مسحوق الجير والفحم الساخن قرب الدرج لإعمائهما',
          sub: 'بصيرة ذكاء (10+): فخ علمي يرفع التهديد لجرأة تكتيكك',
          check: { attr: 'int', skill: 'alchemy', base: 40, noAgeScale: true },
          success: {
            text: 'يسعل المتسللان وتلتبس رؤيتهما وسط سحابة الرماد والشرر، فتتمكن أمك وأبوك من محاصرتهما بسهولة وتأسران أحدهما للاستجواب!',
            effects: { skill: { alchemy: 1, shadow: 1 }, faction: { family: 12 }, threat: 5, addTrait: 'صياد الكمائن', flags: { capturedAssassin: true } }
          },
          fail: {
            text: 'تتبعثر سحابة الرماد بعيداً عن الممر فتتلقى ضربة خفيفة وأنت تتراجع نحو أمك.',
            effects: { hp: -16, threat: 8 }
          }
        },
        {
          id: 'evade_call_guards',
          label: 'إيقاظ والدك والتسلل من الباب الخلفي لاستدعاء حرس المدينة',
          success: {
            text: 'تصل مع الدورية في الوقت المناسب لترغم القاتلين على الانسحاب من السطوح، وإن لم تكشفوا هويتهما كاملة.',
            effects: { attr: { agi: 1 }, skill: { shadow: 1 }, faction: { humans: 6, family: 5 }, threat: 4 }
          }
        }
      ]
    },
    {
      id: 'child_9_q3',
      phase: 'childhood',
      age: 9,
      quarter: 3,
      priority: 100,
      category: 'assassin',
      categoryLabel: 'ما بعد العاصفة',
      title: 'درس السموم والترياق',
      text: 'بعد حادثة الليل، تقرر والدتك ألا تبقى جاهلاً بأساليب الغدر. تفتح أمامك حقيبة أعشاب وسموم نادرة جمعتها في رحلاتها السابقة.',
      choices: [
        {
          id: 'learn_poisons',
          label: 'حفظ روائح السموم الشائعة وطرق إبطالها كيميائياً',
          success: {
            text: 'تتمرن على تمييز التغير الطفيف في لون المعادن عند ملامسة السموم، وتهديك أمك قارورة ترياق نقي لتحفظه لحالات الطوارئ.',
            effects: { attr: { ins: 1 }, skill: { alchemy: 2, shadow: 1 }, giveElixir: { antidote: 1 }, addTrait: 'أنف حذر', threat: -4 }
          }
        },
        {
          id: 'craft_armor',
          label: 'العمل مع والدك على تدعيم سترتك بصفائح جلدية مبطنة',
          success: {
            text: 'تخرج بدرع تدريب خفيف يحميك من الجروح القاتلة دون إعاقة حركتك.',
            effects: { skill: { smithing: 2 }, setArmor: { name: 'سترة جلدية مدعمة بالحديد', defense: 3, rarity: 'common', icon: 'leather_armor' } }
          }
        },
        {
          id: 'patrol_streets',
          minGold: 6,
          label: 'توزيع 6 ذهباً لتكوين شبكة عيون من أطفال السوق وبائعي الخبز',
          success: {
            text: 'بضع قطع نقدية وحلوى تجعل أخبار الغرباء تصل إلى أذنيك وتعلّمك فن المراقبة الخفية.',
            effects: { gold: -6, attr: { cha: 1 }, skill: { shadow: 2 }, threat: -7 }
          }
        }
      ]
    },
    {
      id: 'child_9_q4',
      phase: 'childhood',
      age: 9,
      quarter: 4,
      priority: 100,
      category: 'world',
      categoryLabel: 'شتاء الاستعداد',
      title: 'ثلوج الترقب الطويل',
      text: 'تتزايد أخبار حشود الشياطين في الهضاب البركانية، وتغلق القلعة بواباتها ليلاً. هذا الشتاء هو الوقت المثالي لترسيخ ميزة تقف معك لسنوات.',
      choices: [
        {
          id: 'body_conditioning',
          label: 'تمارين شاقة في البرد لزيادة التحمل والقوة',
          success: {
            text: 'تزداد عضلاتك صلابة وترتفع طاقتك الحيوية لمواجهة قسوة القتال القادم.',
            effects: { attr: { str: 2 }, maxHp: 6, hp: 6, skill: { combat: 2 } }
          }
        },
        {
          id: 'deep_reading',
          label: 'قراءة كتب التاريخ العسكري والكيمياء التطبيقية وتدوين ملاحظاتك',
          success: {
            text: 'تربط بين علوم عالمك القديم وخرائط هذه القارة فتزداد بصيرتك الفكرية والعلمية.',
            effects: { attr: { int: 1, ins: 1 }, skill: { alchemy: 2, trade: 1 } }
          }
        },
        {
          id: 'winter_trade',
          label: 'تصنيع أدوات تدفئة وإبزيمات وبيعها للتجار المحاصرين',
          success: {
            text: 'تحقق أرباحاً ممتازة تبدأ بها العام الجديد بجيبٍ ممتلئ.',
            effects: { gold: 26, skill: { smithing: 1, trade: 2 } }
          }
        },
        {
          id: 'night_shadow_drill',
          label: 'التدرّب ليلاً على تسلق الأسوار وتبديل المواقع في الثلج دون أثر',
          success: {
            text: 'تتعلم إخفاء آثار خطواتك والتحرك في البرد القارس كطيف صامت.',
            effects: { attr: { agi: 2 }, skill: { shadow: 2 } }
          }
        }
      ]
    },

    // ================= AGE 10 =================
    {
      id: 'child_10_q1',
      phase: 'childhood',
      age: 10,
      quarter: 1,
      priority: 100,
      category: 'story',
      categoryLabel: 'نذير الحرب',
      title: 'طبول التعبئة الأولى',
      text: 'في عامك العاشر، يصل منادو الملك إلى الساحة ليعلنوا زيادة الضرائب على الحديد استعداداً لنزاعات الحدود مع عشائر الجان ومناوشات الشياطين.',
      choices: [
        {
          id: 'stock_iron',
          label: 'إقناع أبيك بشراء خام الحديد الآن قبل تضاعف الأسعار',
          check: { attr: 'int', skill: 'trade', base: 34 },
          success: {
            text: 'تتضاعف قيمة الخام خلال أسابيع! تحصل الورشة على فائض مالي ومعدني يضمن استقراركم.',
            effects: { gold: 24, skill: { trade: 2 }, faction: { family: 6 } }
          },
          fail: {
            text: 'يصل التجار الكبار قبلك للخام الجيد فتضطران لدفع سعر عالٍ مقابل كمية متوسطة.',
            effects: { gold: -8, skill: { trade: 1 } }
          }
        },
        {
          id: 'listen_envoys',
          label: 'الاندساس وسط الحشود لسماع مبعوثي المقاطعات سراً',
          success: {
            text: 'تلتقط أن بعض النبلاء يتمنون اندلاع الحرب للتغطية على صفقاتهم الفاسدة.',
            effects: { attr: { ins: 1 }, skill: { shadow: 2 }, flags: { suspectsNobles: true } }
          }
        },
        {
          id: 'train_militia',
          label: 'التطوع في تدريبات الفتيان للرماية والمشاة',
          success: {
            text: 'يمدح القائد المحلي شجاعتك ويدرج اسمك ضمن الشباب الواعدين.',
            effects: { attr: { str: 1, agi: 1 }, skill: { combat: 2 }, faction: { humans: 8 }, rep: 4 }
          }
        }
      ]
    },
    {
      id: 'child_10_q2',
      phase: 'childhood',
      age: 10,
      quarter: 2,
      priority: 100,
      category: 'world',
      categoryLabel: 'اختبار المدينة',
      title: 'مهرجان المواهب الصيفية',
      text: 'تُقيم المدينة منافسة سنوية للصغار قبل سن التكليف، ويتبختر فيها الفتى المغرور «كاسر» ابن رئيس نقابة الحدادين متوعداً بسحق الجميع. أي منافسة تدخلها لتثبت اسمك؟',
      choices: [
        {
          id: 'contest_forge',
          label: 'دخول مسابقة الحدادة ومنازلة كاسر على السندان',
          check: { attr: 'str', skill: 'smithing', base: 32, skillMult: 3.5 },
          success: {
            text: 'تفوز بالمركز الأول أمام أنظار كاسر المصدوم، وتهديك النقابة إكسير شفاء ووسام نجم السندان!',
            effects: { rep: 10, gold: 22, skill: { smithing: 2 }, giveElixir: { healing: 1 }, addTrait: 'نجم السندان', flags: { beatKaserEarly: true } }
          },
          fail: {
            text: 'يتفوق عليك كاسر في الصقل الأخير وتكتفي بالمركز الثاني بنظرة تحدٍّ لمستقبل قريب.',
            effects: { rep: 2, skill: { smithing: 1 } }
          }
        },
        {
          id: 'contest_duel',
          label: 'خوض حلبة المبارزة الخشبية أمام أقرانك',
          check: { attr: 'agi', skill: 'combat', base: 32, skillMult: 3.5 },
          success: {
            text: 'تُسقط خصمك النهائي بخدعة قدم علّمتك إياها أمك، وتهتف الساحة باسمك!',
            effects: { rep: 10, gold: 20, skill: { combat: 2 }, faction: { humans: 6 } }
          },
          fail: {
            text: 'تتعثر في الجولة الأخيرة وتسقط بضربة قوية، لكنك تكتسب صلابة نفسية.',
            effects: { hp: -12, rep: 2, skill: { combat: 1 } }
          }
        },
        {
          id: 'contest_trade',
          label: 'المشاركة في تحدي حساب القيم وكشف العملات المزيفة',
          check: { attr: 'int', skill: 'trade', base: 32, skillMult: 3.5 },
          success: {
            text: 'تكشف ثلاث عملات مغشوشة في ثوانٍ بفضل ملاحظتك للوزن واللمعان، فيعرض عليك كبار التجار التتلمذ لديهم.',
            effects: { rep: 9, gold: 24, skill: { trade: 2, alchemy: 1 } }
          },
          fail: {
            text: 'تنخدع بعملة مطلية بإتقان وتخسر الجولة الحاسمة، فتعقد العزم على ألا تفوتك التفاصيل ثانية.',
            effects: { rep: 2, skill: { trade: 1 } }
          }
        },
        {
          id: 'contest_stealth',
          label: 'دخول مسابقة تعقّب الراية في الغابة دون أن يراك المراقبون',
          check: { attr: 'agi', skill: 'shadow', base: 32, skillMult: 3.5 },
          success: {
            text: 'تخطف الراية وتعود من بين الأشجار دون أن يرصدك مراقب واحد! يصفق لك الحضور بدهشة.',
            effects: { rep: 10, gold: 22, skill: { shadow: 2 }, addTrait: 'شبح الغابة الصغيرة' }
          },
          fail: {
            text: 'يكتشفك أحد الكشافة قرب الخيمة الرئيسية، لكنك تخرج أسرع وأكثر حذراً.',
            effects: { hp: -8, rep: 2, skill: { shadow: 1 } }
          }
        }
      ]
    },
    {
      id: 'child_10_q3',
      phase: 'childhood',
      age: 10,
      quarter: 3,
      priority: 100,
      category: 'family',
      categoryLabel: 'إرث الدم',
      title: 'خروج مع الأم خارج الأسوار',
      text: 'في خريفك العاشر، تصطحبك سيرين إلى تل يشرف على الغابة الرمادية وتكشف لك الحقيقة: «ما زال هناك من يطاردني بسبب مهمة قديمة جمعتني بوالدك».',
      choices: [
        {
          id: 'swear_protect',
          label: 'أقسم أن أقف في وجه أي عدو يهدد هذه العائلة',
          success: {
            text: 'تشد أمك على كتفك وتمنحك خنجرها الاحتياطي المتقن قائلة: «احتفظ به دون أن ترفعه إلا للضرورة».',
            effects: { faction: { family: 12 }, attr: { cha: 1, str: 1 }, setWeapon: { name: 'خنجر سيرين الاحتياطي', power: 4, rarity: 'uncommon', icon: 'dagger' }, flags: { vowedFamily: true } }
          }
        },
        {
          id: 'ask_enemies',
          label: 'سؤالها بهدوء عن أسماء الأعداء ونقاط ضعفهم',
          success: {
            text: 'تكشف لك عن خيانة نبيل بشري سابق تحالف مع قادة من الظل، مما يمنحك خريطة ذهنية أوضح للصراع القادم.',
            effects: { attr: { ins: 1 }, skill: { shadow: 2 }, flags: { knowsBetrayalOrigin: true } }
          }
        },
        {
          id: 'int_analyze_truth',
          minInt: 11,
          label: 'استنتاج صلة تلك المهمة بالتوتر الحالي بين البشر والجان',
          sub: 'بصيرة ذكاء (11+): ربط القرائن القديمة بحاضر الحرب',
          success: {
            text: 'ترتب القطع فتسأل أمك عن «ميثاق الرماد». تتوقف أنفاسها للحظة، ثم تعترف بأنك أصبت لب السر، وتزودك بوثيقة مرمزة قد تنقذك يوماً.',
            effects: { attr: { int: 1 }, skill: { shadow: 1 }, faction: { family: 8 }, flags: { knowsBetrayalOrigin: true, holdsAshenCipher: true } }
          }
        },
        {
          id: 'str_carry_mother_gear',
          minAttr: { str: 7 },
          label: 'حمل صندوق عتاد التدريب الثقيل مع والدتك عبر التل لإثبات صمودك',
          sub: 'بصيرة قوة (7+): كسب ثقة سيرين الجسدية وتعلّم ضربات الحسم',
          success: {
            text: 'تبتسم سيرين لصلابتك وتعلمك حركة رد الضربات المزدوجة التي لم تمنحها لأحد.',
            effects: { attr: { str: 1 }, skill: { combat: 2 }, faction: { family: 10 }, flags: { vowedFamily: true } }
          }
        }
      ]
    },
    {
      id: 'child_10_q4',
      phase: 'childhood',
      age: 10,
      quarter: 4,
      priority: 100,
      category: 'family',
      categoryLabel: 'نهاية الطفولة',
      title: 'ليلة ما قبل الحادية عشرة',
      text: 'تنقضي السنوات الأربع الأولى سريعاً. في نهاية شتاء عامك العاشر، تشتعل نار الكير بدفء بينما يستعد والدك وأمك لمنحك حرية اختيار طريقك ابتداءً من العام القادم.',
      choices: [
        {
          id: 'prep_smith',
          label: 'مساعدة الأب في جرد المطارق والسبائك والاستعداد للحرفة',
          success: {
            text: 'تنام ويداك تعبقان برائحة الحديد المصهور؛ مستعداً لأسرار الصنعة.',
            effects: { skill: { smithing: 2 }, attr: { str: 1 }, gold: 10, hp: 6 }
          }
        },
        {
          id: 'prep_adventurer',
          label: 'تفقد الخرائط وشحذ نصل التدريب للاستطلاع والمغامرة',
          success: {
            text: 'يتسارع نبضك شوقاً إلى الطرق المفتوحة ومهام النقابة والمواجهات.',
            effects: { skill: { combat: 2 }, attr: { agi: 1 }, hp: 6, rep: 3 }
          }
        },
        {
          id: 'prep_merchant',
          label: 'مراجعة دفاتر الأسعار ومسارات القوافل والاستخبارات',
          success: {
            text: 'توقن أن الذهب والمعلومة الصحيحة قد يفتحان أبواباً يعجز عنها السيف.',
            effects: { skill: { trade: 2, shadow: 1 }, attr: { cha: 1 }, gold: 14 }
          }
        }
      ]
    }
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.Data.childhoodEvents;
  }
})(typeof window !== 'undefined' ? window : globalThis);

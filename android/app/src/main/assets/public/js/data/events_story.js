(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});
  GameApp.Data = GameApp.Data || {};

  GameApp.Data.storyEvents = [
    // Age 11 Period 1: Choose starting career path
    {
      id: 'story_11_m1_career',
      phase: 'youth',
      age: 11,
      period: 1,
      priority: 100,
      category: 'story',
      categoryLabel: 'مفترق البداية',
      title: 'أول خطوة في سن الحادية عشرة',
      text: 'في مطلع ربيعك الحادي عشر، تنتقل الحياة من لهو الطفولة وتدريباتها إلى اختبار العالم الحقيقي بست محطات موسمية حاسمة كل عام. يقف والدك غارون بساعديه المفتولين بجانب الكير المتوهج، وأمك سيرين عند عتبة الدار وهي تربط شعرها استعداداً ليوم جديد. «لن نختار عنك بعد اليوم يا بني»، تقول أمك بنظرة فخر ممزوجة بالقلق، «اختر الحرفة التي ستصنع بها اسمك قبل أن تعصف الحرب بالجميع».',
      choices: [
        {
          id: 'choose_smith',
          label: 'مسار الحداد: تسلّم سندان الورشة الفرعي وصناعة العتاد',
          sub: 'التركيز على الصياغة، الأسرار المعدنية، وتزويد المقاتلين بالسلاح',
          success: {
            text: 'ترتدي مئزر الحداد الرسمي وترفع المطرقة الثقيلة؛ يهديك غارون أداة قياس عتيقة، ومن هنا ستصوغ مصير المعارك بسبائكك.',
            effects: { setCareer: 'smith', skill: { smithing: 2 }, attr: { str: 1 }, faction: { family: 5 } }
          }
        },
        {
          id: 'choose_adventurer',
          label: 'مسار المغامر: الانضمام لنقابة المغامرين ومهام الميدان',
          sub: 'التركيز على القتال، الاستطلاع، وحراسة القوافل وكشف الأخطار',
          success: {
            text: 'تعلق شارة المتدرب النحاسية في نقابة المغامرين وتمنحك سيرين قارورة إكسير شفاء طارئ لمهماتك خارج الأسوار.',
            effects: { setCareer: 'adventurer', skill: { combat: 2 }, attr: { agi: 1 }, rep: 4, giveElixir: { healing: 1 } }
          }
        },
        {
          id: 'choose_merchant',
          label: 'مسار التاجر: إدارة القوافل وتجارة المعلومات والموارد',
          sub: 'التركيز على الصفقات، الدبلوماسية، ورصد تحركات الفصائل',
          success: {
            text: 'تشتري دفتر صفقات جلدي وتدخل سوق المقاطعة؛ ستقاتل بالذهب والمعلومة حيث يعجز السيف.',
            effects: { setCareer: 'merchant', skill: { trade: 2, shadow: 1 }, attr: { cha: 1 }, gold: 24 }
          }
        }
      ]
    },

    // Age 11 Period 5
    {
      id: 'story_11_m7_border_bodies',
      phase: 'youth',
      age: 11,
      period: 5,
      priority: 100,
      category: 'war',
      categoryLabel: 'بوادر الصراع',
      title: 'جثث المعبر الجنوبي',
      text: 'تهب رياح الخريف الباردة حاملةً نبأً صادماً: عُثر عند المعبر الجنوبي على قافلة حراسة بشرية ممزقة بمخالب شيطانية، وحولها سهام جان مكسورة مغروسة في التراب. يخرج وجهاء المدينة إلى الساحة للمطالبة بتعبئة عاجلة وتضييق الخناق على كل من يتعامل مع الغابة.',
      choices: [
        {
          id: 'rally_humans',
          label: 'تأييد دعوات الحرس لتسليح الحدود والرد الحازم',
          success: {
            text: 'ترتفع مكانتك بين المدافعين البشر وتنال عقوداً ومكافآت إضافية من الحامية.',
            effects: { faction: { humans: 10, elves: -8 }, rep: 4, gold: 18 }
          }
        },
        {
          id: 'urge_caution',
          label: 'دعوة التجار والحكماء للتحقق قبل إشعال المعارك',
          success: {
            text: 'يرى العقلاء في كلامك حكمة نادرة في سنك، وتصل أصداء اعتدالك إلى الغابة دون إثارة سخط البشر.',
            effects: { attr: { cha: 1 }, faction: { elves: 8 }, rep: 3 }
          }
        },
        {
          id: 'int_forensics',
          minInt: 10,
          label: 'فحص تقارير الجروح وملاحظة عدم تزامن آثار المخالب والسهام',
          sub: 'بصيرة ذكاء (10+): تحقيق جنائي يثير التوجس حولك (+5 تهديد)',
          check: {
            attr: 'int',
            skill: 'alchemy',
            base: 36,
            flagBonuses: [{ flag: 'earlyScholar', bonus: 10 }]
          },
          success: {
            text: 'تلاحظ من تخثر الدم أن سهام الجان رُشقت بعد الوفاة بساعات لتضليل المحققين! توثق ملاحظتك وتبدأ برؤية يدٍ ثالثة تدفع الأعراق نحو الصدام.',
            effects: { attr: { ins: 1 }, skill: { shadow: 2 }, flags: { sawFalseFlagEvidence: true }, threat: 6 }
          },
          fail: {
            text: 'يطردك الضابط قبل استكمال الفحص وتثير تساؤلاتك غيظ المتشددين.',
            effects: { threat: 8, rep: -3 }
          }
        },
        {
          id: 'ins_sense_setup',
          minAttr: { ins: 8 },
          label: 'استشعار توتر الشهود عند ذكر اسم النبيل المسؤول عن المعبر',
          sub: 'بصيرة حدس (8+): ملاحظة الارتباك الخفي في الرواية الرسمية',
          success: {
            text: 'يدلك حدسك على أن التقرير الرسمي مرتب أكثر من اللازم؛ تحفظ شكوكك في صمت بعيداً عن العيون.',
            effects: { attr: { ins: 1 }, skill: { shadow: 1 }, flags: { sawFalseFlagEvidence: true } }
          }
        }
      ]
    },

    // Age 12 Period 2
    {
      id: 'story_12_m3_guild_poison',
      phase: 'youth',
      age: 12,
      period: 2,
      priority: 100,
      category: 'assassin',
      categoryLabel: 'مؤامرة في الكأس',
      title: 'مأدبة النبيل المسمومة',
      text: function (s) {
        if (s.flags.capturedAssassin) {
          return 'ترافق والدك إلى مجلس تجاري في قصر أحد الوجهاء، وتلمح نادلاً يضع مسحوقاً في كأسكم — تتذكر من استجواب قاتل الطفولة أن هذه بالضبط طريقة عملاء العاصمة في التصفية الصامتة!';
        }
        return 'ترافق والدك إلى مجلس تجاري في قصر أحد الوجهاء، وتُقدّم للجميع كؤوس عنب دافئ على أضواء الشموع. فجأة تلاحظ أن مضيفكم التاجر يتأخر عن رشف كأسه ويلتفت نحو الباب بتوتر غريب.';
      },
      choices: [
        {
          id: 'elixir_antidote_banquet',
          requiresElixir: 'antidote',
          label: 'استخدام ترياق السموم في الحقيبة لإبطال السم سراً ثم فضح الجاني فوراً',
          sub: '🧪 حقيبة الإكسير: استهلاك ترياق السموم لنجاة مضمونة',
          success: {
            text: 'تصب قطرة من ترياقك النقي في كأسك وكأس والدك فتتعكر كؤوس السم أمام الحضور كالرماد! ينفضح الخائن بلا ضحايا وتنال مكافأة فورية!',
            effects: { consumeElixir: 'antidote', rep: 10, gold: 28, faction: { family: 10, humans: 8 }, skill: { alchemy: 2, shadow: 1 }, flags: { caughtBanquetPoisoner: true } }
          }
        },
        {
          id: 'knock_cup',
          label: 'إسقاط كأس والدك بحجة الانزلاق والاندفاع نحو المخرج',
          check: {
            attr: 'agi',
            skill: 'shadow',
            base: 32,
            flagBonuses: [
              { flag: 'capturedAssassin', bonus: 14 },
              { flag: 'warnedMotherEarly', bonus: 8 }
            ]
          },
          success: {
            text: 'يتدحرج الكأس على البلاط فيتفور السائل مبقياً بقعة سوداء! ينكشف الجاني ويُعتقل قبل أن يصيبكم أذى.',
            effects: { rep: 6, faction: { family: 8, humans: 6 }, skill: { shadow: 2 }, threat: 6 }
          },
          fail: {
            text: 'تتعثر متأخراً بعد رشفة بسيطة؛ يفتك السم بجسدك أياماً قبل أن ينقذك ترياق أمك.',
            effects: { hp: -28, threat: 10 }
          }
        },
        {
          id: 'stealth_swap_cups',
          minSkill: { shadow: 4 },
          label: 'تبديل الكؤوس بخفة يد وصمت تام بينما يلتفت المضيف',
          sub: 'تخصص الظلال (4+): تدوير الفخ ضد مدبره عبر فحص براعة',
          check: { attr: 'agi', skill: 'shadow', base: 34 },
          success: {
            text: 'تبدل الكأس في غمضة عين دون أن ترف عينك! يتعرق المتآمر ويمتنع عن الشرب مرتبكاً فينفضح أمره تلقائياً.',
            effects: { skill: { shadow: 2 }, faction: { family: 10 }, rep: 8, flags: { caughtBanquetPoisoner: true } }
          },
          fail: {
            text: 'يلمح النادل حركتك ويسحب الكؤوس مسرعاً فتنجو لكن بعد خدش سكين خفي في الممر.',
            effects: { hp: -22, threat: 8 }
          }
        },
        {
          id: 'int_silver_test',
          minInt: 11,
          label: 'ملامسة السائل بطرف عملة فضية ومراقبة التفاعل الكيميائي بصمت',
          sub: 'بصيرة ذكاء (11+): كشف سم الزرنيخ البارد',
          success: {
            text: 'تسودّ حافة الفضة فوراً! تهمس لوالدك فتغادران بأمان مع الاحتفاظ بعينة السم كدليل دامغ.',
            effects: { skill: { alchemy: 2, shadow: 1 }, faction: { family: 8 }, threat: 4, flags: { caughtBanquetPoisoner: true }, addTrait: 'عين لا تنخدع' }
          }
        },
        {
          id: 'ignore_focus',
          label: 'الاعتذار عن الشرب والاكتفاء بمراقبة المداخل',
          success: {
            text: 'تمتنع عن الشرب وتدفع والدك للانسحاب مبكراً بدعوى العمل، فتنجوان وإن ضاعت فرصة كشف المدبر.',
            effects: { attr: { ins: 1 }, threat: -2 }
          }
        }
      ]
    },

    // Age 12 Period 5: Elarin Returns!
    {
      id: 'story_12_m10_elven_envoy',
      phase: 'youth',
      age: 12,
      period: 5,
      priority: 100,
      category: 'war',
      categoryLabel: 'رسل الغابة',
      title: 'عودة إيلارين عند الغدير',
      text: function (s) {
        if (s.flags.helpedElvenFugitive) {
          return 'عند حافة الغدير الضبابي، تخرج من بين الأشجار مبعوثة من الجان برداء أخضر وتحني رأسها بابتسامة تعرفها جيداً؛ إنها «إيلارين»، الشابة التي أخفيتها في الثامنة من عمرك! أصبحت اليوم قائدة كشافة وتعرض عليك قناة اتصال سرية بين الغابة والمدينة.';
        }
        if (s.flags.betrayedElvenFugitive) {
          return 'عند حافة الغدير، تطوقك فجأة كشافة الجان بأقواس مشدودة؛ تتقدم قائدتهم «إيلارين» وبجبهتها ندبة من أسرها القديم حين سلمتها للصيادين في الثامنة! تتوقف سهامهم على بُعد خطوات وتطلب حساباً فورياً.';
        }
        return 'عند حافة الغدير، يعترض طريقك كشافة من الجان الغابويين بقيادة المبعوثة «إيلارين»؛ يتهمون البشر بقطع أشجارهم المقدسة ويسألونك إن كنت خصماً أم رسولاً.';
      },
      choices: [
        {
          id: 'open_elven_channel',
          condition: function (s) { return !s.flags.betrayedElvenFugitive; },
          label: 'قبول الحوار السري مع إيلارين وتبادل الضمانات لخفض التوتر',
          success: {
            text: 'تُثبت أن في المدينة من يفضل العقل على الدماء، فتمنحك إيلارين خريطة نقاط الالتقاء الهادئة وتزودك بقارورة إكسير عشبي.',
            effects: { faction: { elves: 18 }, skill: { trade: 1, shadow: 1 }, giveElixir: { healing: 1 }, flags: { elvenContactOpen: true } }
          }
        },
        {
          id: 'atone_elves',
          requiresFlags: ['betrayedElvenFugitive'],
          minGold: 20,
          label: 'تقديم 20 ذهباً واعتذار عملي لإيلارين لإغلاق جرح الطفولة',
          sub: 'أثر قرار سابق: دفع دية السلام مع الغابة',
          success: {
            text: 'تتأمل إيلارين صدقك القاسي ثم تخفض قوسها؛ تأخذ الذهب لجرحى عشيرتها وتمنحك فرصة أخيرة للندم.',
            effects: { gold: -20, faction: { elves: 18 }, flags: { elvenContactOpen: true } }
          }
        },
        {
          id: 'stand_human_pride',
          label: 'الرد بحزم أو اختراق الطوق نحو طريق الحرس البشري',
          check: { attr: 'str', skill: 'combat', gearBonus: 'weapon', base: 30 },
          success: {
            text: 'تصد أول سهمين وتتراجع بانتظام نحو نقطة الحراسة، فيشيد قادة الحدود بشجاعتك.',
            effects: { faction: { humans: 12, elves: -18 }, rep: 4, skill: { combat: 2 } }
          },
          fail: {
            text: 'يصيبك سهم في ساقك أثناء الانسحاب السريع قبل وصول الحرس.',
            effects: { hp: -26, faction: { humans: 8, elves: -20 } }
          }
        },
        {
          id: 'stealth_slip_away',
          minSkill: { shadow: 4 },
          label: 'الانزلاق بين الأشجار في الضباب وتركهم يبحثون عن سراب',
          sub: 'تخصص الظلال (4+): انسحاب صامت بلا دماء',
          success: {
            text: 'تتوارى بين الأشجار كأنك من أهل الغابة؛ تبتسم إيلارين بدهشة لاحترافك ولا تتكبد أي خسائر.',
            effects: { skill: { shadow: 2 }, attr: { agi: 1 } }
          }
        },
        {
          id: 'trade_info_elves',
          condition: function (s) { return !s.flags.betrayedElvenFugitive; },
          label: 'عرض تزويدها بأخبار تحركات الشياطين مقابل أمان القوافل',
          check: {
            attr: 'cha',
            skill: 'trade',
            base: 32,
            flagBonuses: [{ flag: 'knowsForestPaths', bonus: 14 }]
          },
          success: {
            text: 'توافق إيلارين على اتفاقية صامتة تضمن سلامة بضائعك وأصدقائك عبر ممرات الغابة.',
            effects: { faction: { elves: 14 }, gold: 22, skill: { trade: 2 }, flags: { elvenSafePassage: true } }
          },
          fail: {
            text: 'تشك إيلارين بنواياك وتنصحك ألا تخلط التجارة بالسياسة قبل أن تختفي بين الأشجار.',
            effects: { faction: { elves: -6 }, attr: { cha: 1 } }
          }
        }
      ]
    },

    // Age 13 Period 2: Arkan the Broker
    {
      id: 'story_13_m4_demon_broker',
      phase: 'youth',
      age: 13,
      period: 2,
      priority: 100,
      category: 'war',
      categoryLabel: 'صفقة الأراضي القاحلة',
      title: 'أركان سمسار الجمر الأسود',
      text: function (s) {
        if (s.flags.keptDemonCoin) {
          return 'في زقاق السوق الليلي يقف التاجر المقنّع «أركان» بردائه المصنوع من جلد السحالي النارية. يتوقف عن الحديث فجأة حين يلمح العملة القرمزية التي احتفظت بها منذ الثامنة ويهمس: «لقد احتفظت بدعوتنا كل هذه السنوات أيها الشاب الذكي!»';
        }
        return 'في زقاق السوق الليلي يقف تاجر مقنّع يُدعى «أركان» يعرض سبيكة «حديد الجحيم» النادر بثمن زهيد مقارنة بقيمتها، مقابل التزامٍ غامض ترده له حين تبدأ الحرب.';
      },
      choices: [
        {
          id: 'deal_demons',
          label: 'عقد الصفقة مع أركان وأخذ السبيكة مع قبول دين مستقبلي للفيلق',
          success: {
            text: 'تحصل على معدن حاد لا يصدأ ولا يثلم، ويهمس أركان قبل رحيله أنه سيعود لطلب دَينه في قلب العاصفة.',
            effects: {
              faction: { demons: 18 },
              skill: { smithing: 1, trade: 1 },
              setWeapon: { name: 'نصل مطعّم بحديد الجحيم', power: 5, rarity: 'uncommon', icon: 'demon_sword' },
              flags: { tookDemonSteel: true },
              threat: 10,
              queueRipple: { eventId: 'ripple_demon_debt', delayMin: 10, delayMax: 18, expiresAfter: 35 }
            }
          }
        },
        {
          id: 'cash_demon_coin',
          requiresFlags: ['keptDemonCoin'],
          label: 'استبدال العملة القرمزية القديمة بسبيكة حديد جحيم حرة بلا أي دين!',
          sub: 'أثر قرار سابق: استثمار العملة المحفوظة منذ الطفولة',
          success: {
            text: 'يحني أركان رأسه احتراماً لقوانين التجار القاحلة ويسلمك السبيكة كاملةً بلا شروط أو التزامات!',
            effects: { faction: { demons: 12 }, setWeapon: { name: 'نصل حديد الجحيم الحر', power: 6, rarity: 'rare', icon: 'demon_sword' }, skill: { trade: 2 } }
          }
        },
        {
          id: 'refuse_clean',
          label: 'رفض الصفقة والإبلاغ بهدوء عن تحرك المهربين',
          success: {
            text: 'تغسل يدك من بضاعة الشياطين وتنال مكافأة محترمة من نقابة الحراسة.',
            effects: { gold: 20, faction: { humans: 10, demons: -15 }, rep: 4 }
          }
        },
        {
          id: 'int_extract_map',
          minInt: 12,
          label: 'مساومة أركان على خريطة مناجمهم بدلاً من الذهب والولاء',
          sub: 'بصيرة ذكاء (12+): اختبار دهاء تجاري لنيل المعلومة بأقل التزام',
          check: { attr: 'int', skill: 'trade', base: 30 },
          success: {
            text: 'يُدهش أركان من دهائك التجاري فيعطيك رسم الممرات البركانية دون أن يربطك بتعهد عسكري.',
            effects: { skill: { trade: 2, shadow: 1 }, faction: { demons: 8 }, flags: { knowsDemonRoutes: true } }
          },
          fail: {
            text: 'يرفض أركان المساومة ويترك لك تحذيراً لاذعاً يرفع الترقب حولك.',
            effects: { threat: 6 }
          }
        }
      ]
    },

    // Age 13 Period 5
    {
      id: 'story_13_m11_mother_secret',
      phase: 'youth',
      age: 13,
      period: 5,
      priority: 100,
      category: 'family',
      categoryLabel: 'سر الماضي',
      title: 'حجر المعاهدة المكسور',
      text: function (s) {
        var extra = '';
        if (s.flags.motherSharedPast) extra = ' تبتسم أمك لأنها مهّدت لك هذا السر منذ كنت في السابعة حين فتحت لك الصندوق.';
        else if (s.flags.analyzedLock) extra = ' تؤكد تحليلاتك القديمة لقفل أقزام الشمال صحة ما تكشفه سيرين الآن.';
        return 'في أمسية شتوية ثقيلة، تغلق سيرين نوافذ الورشة وتفتح أمامك الخريطة القديمة أخيراً. تروي لك بصوت خافت الحقيقة الكاملة: قبل ولادتك، سرق غارون وسيرين «ختم الهدنة» من خزينة جنرال فاسد ليمنعا إشعال حرب كبرى، ومنذ ذلك الحين ونقابة القتلة تطاردكم لاسترجاعه أو إتلافه!' + extra;
      },
      choices: [
        {
          id: 'guard_seal',
          label: 'التعهد بحماية الختم مهما كلف الثمن',
          success: {
            text: 'يتحد شمل العائلة على هدف واضح؛ يمنحك غارون درعاً مصقولاً يحميك من الضربات القاتلة.',
            effects: { faction: { family: 14 }, setArmor: { name: 'درع السندان المصفح', defense: 4, rarity: 'uncommon', icon: 'scale_armor' }, flags: { swornToSeal: true } }
          }
        },
        {
          id: 'study_seal',
          label: 'تفحص نقوش الختم ومقارنتها بوثائق الممالك الثلاث',
          success: {
            text: 'تفهم آلية عمل الختم؛ إنه ليس سحراً بل صكّ شرعي يفضح خيانة الأطراف الثلاثة إذا عُرض أمام المجالس.',
            effects: { attr: { int: 1, ins: 1 }, skill: { shadow: 2 }, flags: { knowsSealPower: true } }
          }
        },
        {
          id: 'hide_seal_far',
          label: 'تقسيم الختم وإخفاء آثاره في مخبأ سري بعيداً عن الورشة',
          success: {
            text: 'خطوة احترازية بارعة تُقلل مطاردة القتلة لعائلتك وتنمّي براعتك في التمويه، مع إهدائك قارورة تركيز.',
            effects: { threat: -10, skill: { shadow: 2 }, faction: { family: 8 }, giveElixir: { focus: 1 } }
          }
        }
      ]
    },

    // Age 14 Period 1: War Outbreak!
    {
      id: 'story_14_m2_war_outbreak',
      phase: 'youth',
      age: 14,
      period: 1,
      priority: 100,
      category: 'war',
      categoryLabel: 'اندلاع الحرب',
      title: 'شرارة الحرب الثلاثية',
      text: 'دقت أجراس القلعة مع الفجر معلنةً النفير العام! التهمت نيران الشياطين حصن الوادي، وردّت كتائب البشر باجتياح أطراف غابة الجان. القارة كلها الآن ساحة صراع بين البشر والجان والشياطين. أين تضع قدمك الأولى وسط هذا الطوفان؟',
      choices: [
        {
          id: 'align_humans',
          label: 'الوقوف في صف مملكة البشر لحماية المدينة والأبرياء',
          success: {
            text: 'تعلن التزامك بدعم الجبهة البشرية سواء بالحديد أو السيف أو الإمداد.',
            effects: { setAlignment: 'humans', faction: { humans: 18, elves: -6, demons: -16 }, rep: 8 }
          }
        },
        {
          id: 'align_elves',
          label: 'فتح خط دعم سري لعشائر الجان المدافعة عن الغابة',
          success: {
            text: 'ترى أن الجان ظُلموا في هذه الشرارة وتقرر مساندتهم عبر المسالك الخلفية دون معاداة أهل مدينتك.',
            effects: { setAlignment: 'elves', faction: { elves: 20, humans: -2 }, threat: 6 }
          }
        },
        {
          id: 'align_demons',
          label: 'التواصل مع مبعوثي الشياطين لبيع الولاء والخبرة للأقوى',
          success: {
            text: 'تراهن على قوة فيالق الشياطين الجارفة وتسعى لحجز مقعد نفوذ مبكر معهم على حساب سمعتك لدى البشر وعائلتك.',
            effects: { setAlignment: 'demons', faction: { demons: 24, humans: -22, elves: -10, family: -5 }, gold: 45, threat: 14 }
          }
        },
        {
          id: 'align_neutral',
          label: 'إعلان الحياد والعمل كصانع أسلحة وتاجر مستقل يجمع الأدلة',
          success: {
            text: 'ترفض أن تكون وقوداً لجنون الملوك؛ تخدم مصالحك وعائلتك وتبحث عن فرصة لفرض سلام أو ثروة.',
            effects: { setAlignment: 'neutral', attr: { cha: 1 }, skill: { trade: 2 }, gold: 30 }
          }
        }
      ]
    },

    // Age 14 Period 5
    {
      id: 'story_14_m9_refugee_gate',
      phase: 'youth',
      age: 14,
      period: 5,
      priority: 100,
      category: 'war',
      categoryLabel: 'مآسي الحرب',
      title: 'مخيم النازحين عند البوابة',
      text: 'مع اتساع القتال، يتجمع مئات النازحين ومن بينهم عائلات نصف-جان عند بوابات المدينة المغلقة في أمطار الخريف، بينما يطالب المتشددون بطردهم خشية الجواسيس.',
      choices: [
        {
          id: 'shelter_refugees',
          minGold: 22,
          label: 'إنفاق 22 ذهباً لتأمين طعام وخيام وتوظيف القادرين منهم',
          success: {
            text: 'تنقذ عشرات الأسر من الجوع والشتاء القادم، وتكسب ولاءً شعبياً جارفاً ومخبرين مخلصين.',
            effects: { gold: -22, rep: 12, faction: { humans: 8, elves: 12 }, skill: { shadow: 1 } }
          }
        },
        {
          id: 'screen_carefully',
          label: 'تنظيم عملية تفتيش عادلة لإدخال الأسر السلمية ومنع الجواسيس',
          check: { attr: 'ins', skill: 'shadow', base: 30 },
          success: {
            text: 'تكشف عميلين مندسين دون ظلم البقية، فيثق بك القائد والنازحون على حد سواء.',
            effects: { rep: 8, faction: { humans: 10, elves: 6 }, threat: -4, skill: { shadow: 2 } }
          },
          fail: {
            text: 'ينزلق أحد المخربين وسط الزحام ويضرم حريقاً في الإسطبلات فتصاب بحروق وتلام على التراخي.',
            effects: { hp: -16, rep: -5, threat: 10 }
          }
        },
        {
          id: 'profit_supplies',
          label: 'توريد الأدوات والبطانيات للسلطة بأسعار الحرب المرتفعة',
          success: {
            text: 'يمتلئ صندوقك بالذهب، لكن نظرات الجوعى تذكّرك بثمن قسوة التجارة.',
            effects: { gold: 44, rep: -6, skill: { trade: 2 } }
          }
        }
      ]
    },

    // Age 15 Period 2: Major Assassination Plot
    {
      id: 'story_15_m3_silent_needle',
      phase: 'youth',
      age: 15,
      period: 2,
      priority: 100,
      category: 'assassin',
      categoryLabel: 'كمين قاتل',
      title: 'فخ «الإبرة الصامتة»',
      text: function (s) {
        if (s.flags.spottedByScout || s.flags.scarredInChildhood) {
          return 'في طريق عودتك عبر الزقاق الضبابي، تُطفأ الفوانيس فجأة ويحيط بك ثلاثة قتلة محترفين من «الإبرة الصامتة»! يتقدم أحدهم قائلاً: «الطفل الذي أفلت منا في الماضي كبر، ولن يغادر هذا الزقاق حياً!»';
        }
        return 'في طريق عودتك عبر الزقاق الضبابي، تُطفأ الفوانيس فجأة ويحيط بك ثلاثة قتلة محترفين من نقابة «الإبرة الصامتة» بأقواس صغيرة ومخالب مطلية بسم مخدّر!';
      },
      choices: [
        {
          id: 'elixir_antidote_ambush',
          requiresElixir: 'antidote',
          label: 'تجرع ترياق السموم والهجوم بثقة رغم سهامهم المسمومة!',
          sub: '🧪 حقيبة الإكسير: استهلاك الترياق لإبطال تأثير السم والانقضاض',
          success: {
            text: 'تتجاهل خَدَش السهم المسموم بفضل الترياق فتصعق القتلة باندفاعك الجريء وتجبرهم على الفرار مذعورين!',
            effects: { consumeElixir: 'antidote', skill: { combat: 2 }, rep: 10, threat: -8, flags: { defeatedNeedleSquad: true } }
          }
        },
        {
          id: 'fight_through',
          label: 'شق الصفوف بالسلاح والاندفاع نحو نقطة الضوء الوحيدة',
          check: {
            attr: 'str',
            skill: 'combat',
            gearBonus: 'both',
            base: 26,
            flagBonuses: [
              { flag: 'repelledNightRaid', bonus: 10 },
              { flag: 'knowsSilentNeedle', bonus: 8 },
              { flag: 'swornToSeal', bonus: 6 }
            ]
          },
          success: {
            text: 'تصرع أحدهم بضربة قاطعة وتجرح الثاني فتجبر البقية على التراجع المذعور!',
            effects: { skill: { combat: 2 }, rep: 8, threat: -6, flags: { defeatedNeedleSquad: true } }
          },
          fail: {
            text: 'تُصاب بسهم مسموم في كتفك وتنزف بشدة قبل أن تزحف إلى حانة قريبة وتنجو بأعجوبة.',
            effects: { hp: -38, skill: { combat: 1 }, threat: 8 }
          }
        },
        {
          id: 'stealth_shadow_vanish',
          minSkill: { shadow: 7 },
          label: 'الذوبان في ضباب الزقاق وتسلق المزاريب لتعقب مدبرهم من الخلف',
          sub: 'تخصص الظلال (7+): اختبار تسلل متقدم لتعقب القتلة المحترفين',
          check: { attr: 'agi', skill: 'shadow', base: 30 },
          success: {
            text: 'تختفي من مرمى سهامهم في ثانية وتتسلق السطح لتتبع منسّقهم حتى مقره السري!',
            effects: { skill: { shadow: 2 }, threat: -8, flags: { tracedNeedleLeader: true } }
          },
          fail: {
            text: 'يلتقط قناص السطح ظلك ويصيبك بسهم في الفخذ أثناء هبوطك.',
            effects: { hp: -30, threat: 5 }
          }
        },
        {
          id: 'outsmart_smoke',
          label: 'استخدام عبوة مسحوق شرار أو خدعة صوتية لتشتيتهم والهرب',
          check: { attr: 'agi', skill: 'alchemy', base: 28, flagBonuses: [{ flag: 'capturedAssassin', bonus: 12 }] },
          success: {
            text: 'يطلق انفجار الشرار دخاناً أبيض يعمي القتلة فتتسلل فوق السطوح وتلتقط شعار زعيمهم.',
            effects: { skill: { alchemy: 1, shadow: 1 }, attr: { agi: 1 }, flags: { tracedNeedleLeader: true } }
          },
          fail: {
            text: 'تتأخر لحظة فتخدش شفرتهم جانبك وأنت تقفز من السور.',
            effects: { hp: -32, threat: 7 }
          }
        },
        {
          id: 'int_counter_ambush',
          minInt: 13,
          label: 'قراءة تمركز القوس في الأعلى واستدراجه لإصابة زميله',
          sub: 'بصيرة ذكاء (13+): اختبار هندسي خطير في قلب الكمين',
          check: {
            attr: 'int',
            skill: 'shadow',
            base: 28,
            flagBonuses: [{ flag: 'knowsBetrayalOrigin', bonus: 10 }]
          },
          success: {
            text: 'تقدر زاوية الرمي وتقفز في لحظة الانحناء لتصيب طلقة القناص ظهر المهاجم الأمامي، ثم تأسر الناجي وتنتزع منه اسم الممول!',
            effects: { attr: { ins: 1 }, skill: { shadow: 2, combat: 1 }, threat: -10, flags: { defeatedNeedleSquad: true, tracedNeedleLeader: true, knowsFinancierName: true } }
          },
          fail: {
            text: 'تتغير زاوية الرمي بالريح فيخترق السهم كتفك قبل وصول الحرس.',
            effects: { hp: -34, threat: 8 }
          }
        }
      ]
    },

    // Age 15 Period 5
    {
      id: 'story_15_m10_legendary_alloy',
      phase: 'youth',
      age: 15,
      period: 5,
      priority: 100,
      category: 'story',
      categoryLabel: 'معدن العوالم',
      title: 'مذنب السماء المتساقط',
      text: 'في سماء الشتاء، يشق نيزك معدني لامع الغيوم ويسقط على أطراف الهضبة المتنازع عليها بين الجيوش. يحتوي على سبيكة فائقة الصلابة تتنافس القوى الثلاث على انتزاعها لتغيير ميزان الحرب.',
      choices: [
        {
          id: 'forge_personal',
          label: 'جمع شظايا النيزك وصياغة سلاح شخصي فائق الجودة',
          check: {
            attr: 'str',
            skill: 'smithing',
            base: 26,
            flagBonuses: [
              { flag: 'builtDoubleBellows', bonus: 14 },
              { flag: 'masteredDemonSteel', bonus: 8 }
            ]
          },
          success: {
            text: 'تدمج علم المعادن من عالمك القديم بنار الكير لتصنع سيفاً نيزكياً مهيباً يذهل والدك غارون!',
            effects: { skill: { smithing: 3 }, setWeapon: { name: 'نصل الشهاب الفولاذي', power: 9, rarity: 'epic', icon: 'meteor_blade' }, rep: 12, addTrait: 'صانع الأسطورة', flags: { craftedMeteorBlade: true } }
          },
          fail: {
            text: 'ينفجر القالب الأول تحت الحرارة العالية فتصاب بحروق قاسية وتخسر خام النيزك النادر.',
            effects: { hp: -18, gold: -15, skill: { smithing: 1 } }
          }
        },
        {
          id: 'alchemy_meteor_distill',
          minSkill: { alchemy: 4 },
          label: 'تقطير شوائب النيزك المعدنية لاستخلاص جرعات تركيز وشفاء عالية النقاء',
          sub: 'تخصص الكيمياء (4+): استغلال خواص المعدن الفضائي طبياً',
          success: {
            text: 'تستخرج خلاصة طاقة نادرة تصنع منها جرعتي تركيز وإكسير شفاء ممتاز!',
            effects: { skill: { alchemy: 2 }, giveElixir: { focus: 1, healing: 1 }, rep: 8 }
          }
        },
        {
          id: 'auction_alloy',
          label: 'احتكار القطع وبيعها بمزاد سري بين الفصائل المتناحرة',
          success: {
            text: 'تدفع القوى الثلاث مبالغ مجزية فتخرج بربح ممتاز يرفع رصيدك الاقتصادي وتهديد المتربصين.',
            effects: { gold: 65, skill: { trade: 2 }, rep: 6, threat: 12 }
          }
        },
        {
          id: 'gift_faction',
          label: 'إهداء المعدن لحليفك الأكبر لكسب رتبة ومقعد قرار في الحرب',
          success: {
            text: 'يرفع هذا الإهداء رصيدك الدبلوماسي إلى مستوى القادة والمستشارين وتنال جرعة تركيز ثمينة.',
            effects: { rep: 14, faction: { humans: 10, elves: 8 }, attr: { cha: 1 }, giveElixir: { focus: 1 } }
          }
        }
      ]
    },

    // Age 16 Period 2: City Siege
    {
      id: 'story_16_m2_city_siege',
      phase: 'youth',
      age: 16,
      period: 2,
      priority: 100,
      category: 'war',
      categoryLabel: 'حصار المدينة',
      title: 'أبواب السندان تحت الحصار',
      text: function (s) {
        var extra = '';
        if (s.factions.elves >= 20) extra = ' تصل همسات من إيلارين أن فرقة من رماة الجان تراقب الموقف من التلال مستعدة للتدخل إذا طلبت ذلك.';
        else if (s.factions.demons >= 20) extra = ' يبعث أركان بإشارة نارية من الأفق معلناً أن الشياطين لن تقصف حي الورشة إذا رفعت رايتهم السرية.';
        return 'يصل زحف الحرب إلى أسوار مدينتك الأم! جيش محاصر من الخارج ونقص في الإمدادات من الداخل، وأبواك يرفضان ترك الورشة التي قضيا فيها العمر.' + extra;
      },
      choices: [
        {
          id: 'defend_walls',
          label: 'القتال على الأسوار وتنظيم تسليح الحامية ليلاً ونهاراً',
          check: {
            attr: 'str',
            skill: 'combat',
            gearBonus: 'both',
            base: 24,
            flagBonuses: [
              { flag: 'craftedMeteorBlade', bonus: 12 },
              { flag: 'vowedFamily', bonus: 6 }
            ]
          },
          success: {
            text: 'تصمدون أسبوعاً دامياً حتى تصل النجدة وتُكسر موجة الاقتحام، ويُخلّد اسمك كدرع المدينة!',
            effects: { rep: 16, faction: { humans: 16, family: 8 }, skill: { combat: 2, smithing: 1 }, flags: { heroOfTheSiege: true } }
          },
          fail: {
            text: 'تُجرح بجرح غائر خلال صد الثغرة الشرقية وينجح الحرس بصعوبة في إغلاق البوابة.',
            effects: { hp: -34, rep: 6, faction: { humans: 8 } }
          }
        },
        {
          id: 'sword_path_siege_duel',
          minSkill: { sword_path: 1 },
          label: 'تقدّم الأسوار منفرداً بوقفة «مسار السيف» لقطع رأس حربة المهاجمين بضربة حاسمة',
          sub: '⚔ مسار السيف: مباغتة قائد الكتيبة المقتحمة وإنهاء الحصار بمبارزة خاطفة',
          check: { attr: 'agi', skill: 'sword_path', gearBonus: 'weapon', base: 30 },
          success: {
            text: 'بضربة صاعقة من فنون السيف المنسية تسقط قائد كتيبة الاقتحام أمام جيشه، فتعم الفوضى صفوفهم وينكسر الحصار!',
            effects: { rep: 24, skill: { sword_path: 1, combat: 2 }, faction: { humans: 18, family: 10 }, flags: { heroOfTheSiege: true } }
          },
          fail: {
            text: 'تكسر رمحين قبل أن تجبرك السهام على التراجع نحو السور مصاباً.',
            effects: { hp: -28, rep: 10 }
          }
        },
        {
          id: 'elven_siege_relief',
          minFaction: { elves: 20 },
          label: 'توجيه إيلارين وكشافة الجان لضرب خطوط إمداد المحاصرين وفتح طريق السلام!',
          sub: '🤝 تحالف الجان (20+): تدخل مباشر من الغابة يفك الحصار',
          success: {
            text: 'تمطر سهام الجان معسكرات المهاجمين من الخلف بينما تصمدون على الأسوار، فينهار الحصار وتنذهل المدينة من هذا التحالف التاريخي!',
            effects: { rep: 18, faction: { elves: 12, humans: 10, family: 8 }, flags: { heroOfTheSiege: true, brokeredSiegeTruce: true } }
          }
        },
        {
          id: 'demon_siege_deterrence',
          minFaction: { demons: 20 },
          label: 'إرسال إشارة أركان لتهديد مؤخرة المهاجمين بفرقة رعب شيطانية',
          sub: '🔥 نفوذ الشياطين (20+): ردع عسكري يفرض انسحاب المحاصرين',
          success: {
            text: 'يظهر طلائع الشياطين على التلال فتتفكك صفوف المحاصرين ذعراً؛ تنجو المدينة بفضلك المرهوب، وإن تصاعد الشك بين البشر!',
            effects: { rep: 10, faction: { demons: 12, humans: -12, family: -3 }, threat: 12 }
          }
        },
        {
          id: 'smith_reinforce_gates',
          minSkill: { smithing: 7 },
          label: 'تثبيت أذرع حديدية ونبال منجنيق على البوابة تحت القصف',
          sub: 'تخصص الحدادة (7+): تحويل الهندسة الحديدية إلى درع للمدينة (اختبار صمود)',
          check: { attr: 'str', skill: 'smithing', gearBonus: 'armor', base: 28 },
          success: {
            text: 'تصمد البوابة أمام الكباش الحديدية وتُسحق آلات المهاجمين بنبال ورشتك الدقيقة!',
            effects: { rep: 16, faction: { humans: 14, family: 8 }, skill: { smithing: 2 }, flags: { heroOfTheSiege: true } }
          },
          fail: {
            text: 'تصيبك شظية خشبية من المنجنيق أثناء تثبيت المفصل فتؤمن البوابة بجراح واضحة.',
            effects: { hp: -26, faction: { humans: 10 }, skill: { smithing: 1 } }
          }
        },
        {
          id: 'negotiate_corridor',
          label: 'التفاوض عبر القنوات الخلفية لتأمين ممر آمن ووقف القصف',
          check: {
            attr: 'cha',
            skill: 'trade',
            base: 28,
            flagBonuses: [{ flag: 'elvenContactOpen', bonus: 14 }]
          },
          success: {
            text: 'تصل لاتفاق هدنة محلية يحفظ دماء المدنيين ويفتح خطوط الإغاثة أمام الجان والبشر معاً.',
            effects: { rep: 14, faction: { elves: 12, humans: 10, family: 8 }, skill: { trade: 2 }, flags: { brokeredSiegeTruce: true } }
          },
          fail: {
            text: 'يرفض قادة الحصار شروطك فتضطر لرشوة حارس لإدخال القمح لأسرتك سراً.',
            effects: { gold: -30, hp: -14, faction: { family: 4 } }
          }
        },
        {
          id: 'smuggle_escape',
          label: 'تجهيز عربة سرية وتأمين خط هروب بديل لعائلتك وبضائعك',
          success: {
            text: 'تنقذ والديك إلى مزرعة آمنة في التلال قبل سقوط الضاحية الخارجية، وتضمن بقاءهم سالمين.',
            effects: { faction: { family: 14 }, gold: 15, skill: { shadow: 1 }, threat: -6, flags: { evacuatedFamilySafe: true } }
          }
        }
      ]
    },

    // Age 16 Period 5
    {
      id: 'story_16_m8_traitor_reveal',
      phase: 'youth',
      age: 16,
      period: 5,
      priority: 100,
      category: 'assassin',
      categoryLabel: 'كشف الخيانة',
      title: 'خيط الذهب الملطخ بالدم',
      text: 'بعد انقشاع الحصار، تتسرب إليك أخيراً وثائق تثبت أن «اللورد فالكور» في مجلس التجارة البشري كان يبيع خطط الحامية ويموّل نقابة الإبرة الصامتة منذ سنوات لإشعال الحرب بين الأعراق الثلاثة وجني الأرباح من الدماء!',
      choices: [
        {
          id: 'expose_council',
          label: 'تقديم الأدلة علناً أمام قادة المدينة والحلفاء',
          check: {
            attr: 'cha',
            skill: 'shadow',
            base: 24,
            flagBonuses: [
              { flag: 'sawFalseFlagEvidence', bonus: 12 },
              { flag: 'caughtBanquetPoisoner', bonus: 10 },
              { flag: 'holdsAshenCipher', bonus: 14 },
              { flag: 'noticedNobleKnight', bonus: 8 },
              { flag: 'suspectsNobles', bonus: 8 }
            ]
          },
          success: {
            text: 'تنهار دفاعات فالكور أمام الوثائق والأختام، فيُلقى القبض عليه وتنكشف مؤامرة تأجيج الحرب!',
            effects: { rep: 18, faction: { humans: 14, elves: 12 }, threat: -10, flags: { exposedLordValkor: true } }
          },
          fail: {
            text: 'يرشي فالكور بعض القضاة ليشكك في أوراقك، فتضطر للانسحاب سريعاً وقد أصبحت هدفه الأول.',
            effects: { threat: 22, hp: -16, rep: -5 }
          }
        },
        {
          id: 'int_double_evidence',
          minInt: 14,
          label: 'الربط بين سجلات المناجم وشفرة «ميثاق الرماد» لإثبات التهمة بلا ثغرة',
          sub: 'بصيرة ذكاء (14+): عرض استنتاجي حاسم يتعزز بقرائنك السابقة',
          check: {
            attr: 'int',
            skill: 'shadow',
            base: 26,
            flagBonuses: [
              { flag: 'earlyScholar', bonus: 8 },
              { flag: 'analyzedLock', bonus: 8 },
              { flag: 'knowsSealPower', bonus: 10 },
              { flag: 'holdsAshenCipher', bonus: 12 }
            ]
          },
          success: {
            text: 'عرضك المنطقي المتسلسل يخرس حلفاء فالكور جميعاً؛ يُجرد من ألقابه ويصادر ذهبه لصالح ضحايا الحرب!',
            effects: { rep: 20, gold: 45, faction: { humans: 15, elves: 14 }, threat: -12, flags: { exposedLordValkor: true, fullConspiracySolved: true } }
          },
          fail: {
            text: 'يطعن وكلاء فالكور في سلسلة الدفاتر وتندلع مواجهة عند الخروج من المجلس.',
            effects: { hp: -22, threat: 16 }
          }
        },
        {
          id: 'stealth_steal_ledger',
          minSkill: { shadow: 7 },
          label: 'التسلل إلى قصر فالكور ليلاً وسرقة دفتر الحسابات الأصلي من خزنته',
          sub: 'تخصص الظلال (7+): اقتحام صامت يسقط الخائن بأوراقه الأصلية',
          check: { attr: 'agi', skill: 'shadow', base: 28 },
          success: {
            text: 'تنتزع السجل الأصلي الممهور بدم التوقيعات وتتركه فوق طاولة القاضي الأكبر قبل الفجر!',
            effects: { skill: { shadow: 2 }, rep: 20, faction: { humans: 14, elves: 12 }, threat: -10, flags: { exposedLordValkor: true, fullConspiracySolved: true } }
          },
          fail: {
            text: 'تنطلق صفارة الحرس داخل القصر فتقفز من الشرفة مصاباً ويزداد تعقب القتلة لك.',
            effects: { hp: -30, threat: 18 }
          }
        },
        {
          id: 'blackmail_valkor',
          label: 'ابتزازه سراً بالملفات للحصول على ذهب ونفوذ وتصفية ديونه لك',
          success: {
            text: 'يركع فالكور لسطوتك في الظل ويفتح لك خزائنه وعملاءه خوفاً من الفضيحة.',
            effects: { gold: 75, skill: { shadow: 2 }, threat: 14, faction: { family: -4 }, flags: { blackmailedValkor: true } }
          }
        }
      ]
    },

    // Age 17 Period 2
    {
      id: 'story_17_m3_faction_summit',
      phase: 'youth',
      age: 17,
      period: 2,
      priority: 100,
      category: 'war',
      categoryLabel: 'مفترق القارة',
      title: 'مبعوثو القوى الثلاث',
      text: 'في السابعة عشرة لم تعد شاباً عادياً؛ أفعالُك أوصلت صدى اسمك إلى قادة البشر وشيوخ الجان وأمراء الشياطين. تصلك اليوم دعوات متزامنة لتثبيت تحالفك النهائي الذي سيغلق أو يفتح أبواب الخاتمة.',
      choices: [
        {
          id: 'commit_humans',
          condition: function (s) { return s.factions.humans >= 10 && s.warAlignment !== 'demons'; },
          label: 'مبايعة قيادة الجبهة البشرية وتجهيز الخطوط الأمامية',
          sub: '🤝 يتطلب ود البشر (10+) وعدم الانحياز للشياطين — يثبّت صف البشر',
          success: {
            text: 'تتسلم تفويضاً عالياً في القيادة أو الإمداد وتتوحد جهودك مع الدفاع البشري.',
            effects: { setAlignment: 'humans', faction: { humans: 18 }, rep: 12 }
          }
        },
        {
          id: 'commit_elves',
          condition: function (s) { return s.factions.elves >= 15; },
          label: 'التوجه إلى قدس الغابة والتحالف مع مجلس الجان بوساطة إيلارين',
          sub: '🤝 يتطلب ود الجان (15+) — يثبّت صف الجان',
          success: {
            text: 'تعقد ميثاق الشرف الأخضر وتصبح الجسر البشري الأوثق لدى الجان.',
            effects: { setAlignment: 'elves', faction: { elves: 20 }, rep: 10 }
          }
        },
        {
          id: 'commit_demons',
          condition: function (s) { return s.factions.demons >= 15 && s.warAlignment !== 'humans'; },
          label: 'دخول قصر الرماد وإبرام ميثاق قوة مع جنرال الشياطين عبر أركان',
          sub: '🔥 يتطلب نفوذ الشياطين (15+) وعدم الانحياز للبشر — يثبّت صف الشياطين',
          success: {
            text: 'يعترف فيلق الشياطين بجرأتك ويمنحك حلفاً مرهوب الجانب في القارة.',
            effects: { setAlignment: 'demons', faction: { demons: 22 }, gold: 55, rep: 8, threat: 10 }
          }
        },
        {
          id: 'commit_peace_or_shadow',
          label: 'رفض التبعية لأي عرش والعمل على خطتك المستقلة (السلام أو النفوذ)',
          success: {
            text: 'تحافظ على أوراقك المستقلة، وتجمع من حولك حلفاء يثقون بك شخصياً لا برايات الملوك.',
            effects: { setAlignment: 'neutral', attr: { cha: 1 }, skill: { trade: 1, shadow: 1 } }
          }
        }
      ]
    },

    // Age 17 Period 5
    {
      id: 'story_17_m9_shadow_master',
      phase: 'youth',
      age: 17,
      period: 5,
      priority: 100,
      category: 'assassin',
      categoryLabel: 'تصفية الحسابات',
      title: 'سيد «الإبرة الصامتة»',
      text: function (s) {
        if (s.flags.blackmailedValkor) {
          return 'تحت ثلوج الشتاء البارد، يظهر رئيس نقابة القتلة فوق جسر النهر. يبتسم بسخرية: «فالكور يدفع بسخاء لأنك ابتززته.. واليوم قرر التخلص من الشاهد الأخطر!»';
        }
        return 'تحت ثلوج الشتاء البارد، يظهر أخيراً رئيس نقابة القتلة بنفسه فوق جسر النهر ليُنهي مطاردة بدأت منذ كنت في التاسعة. خنجراه المزدوجان يلمعان تحت القمر وهو يناديك باسم عائلتك.';
      },
      choices: [
        {
          id: 'duel_master',
          label: 'مبارزته وجهاً لوجه لإغلاق هذا الفصل بيديك',
          check: {
            attr: 'agi',
            skill: 'combat',
            gearBonus: 'both',
            base: 22,
            flagBonuses: [
              { flag: 'defeatedNeedleSquad', bonus: 12 },
              { flag: 'craftedMeteorBlade', bonus: 12 },
              { flag: 'swornToSeal', bonus: 6 }
            ]
          },
          success: {
            text: 'تصد نصلَيه بخبرة سنين وتُسقطه فوق الجسر، فتنحل مطاردة النقابة لك ولعائلتك!',
            effects: { rep: 15, threat: -16, skill: { combat: 2 }, flags: { killedShadowMaster: true } }
          },
          fail: {
            text: 'يباغتك بجرح غائر في الصدر قبل أن تجبره شجاعتك على القفز في النهر هارباً.',
            effects: { hp: -42, threat: -4 }
          }
        },
        {
          id: 'sword_path_master_cut',
          minSkill: { sword_path: 1 },
          label: 'تطبيق استقامة «مسار السيف» وقطع نصليه المزدوجين بحركة واحدة صامتة',
          sub: '⚔ مسار السيف: حسم مبارزة الأسياد بتفوق فني ساحق',
          check: { attr: 'agi', skill: 'sword_path', gearBonus: 'weapon', base: 34 },
          success: {
            text: 'ينكسر خنجراه في الهواء ويهوي ساقطاً قبل أن يرمش جفنه؛ لقد انتهى عصر الإبرة الصامتة!',
            effects: { rep: 20, threat: -22, skill: { sword_path: 1 }, flags: { killedShadowMaster: true } }
          },
          fail: {
            text: 'يرتد القاتل في اللحظة الأخيرة فيجرح ذراعك قبل أن يلوذ بالضباب.',
            effects: { hp: -32, threat: -6 }
          }
        },
        {
          id: 'outmaneuver_master',
          label: 'نصب فخ مضاد أو السيطرة على النقابة عبر كشف أسرارها',
          check: {
            attr: 'int',
            skill: 'shadow',
            base: 24,
            flagBonuses: [
              { flag: 'tracedNeedleLeader', bonus: 14 },
              { flag: 'knowsFinancierName', bonus: 12 },
              { flag: 'blackmailedValkor', bonus: 10 }
            ]
          },
          success: {
            text: 'يحاصر رجالك المخلصون الجسر فيذعن القاتل أو يسقط في قبضتك؛ لقد أصبحت أنت من يحرك الخيوط في الظلام!',
            effects: { skill: { shadow: 3 }, threat: -18, flags: { tookOverShadowGuild: true, killedShadowMaster: true } }
          },
          fail: {
            text: 'ينجو من الفخ بصعوبة ويترك وراءه سمّاً حارقاً يصيبك أثناء انسحابه.',
            effects: { hp: -34, threat: 4 }
          }
        },
        {
          id: 'stealth_ambush_master',
          minSkill: { shadow: 9 },
          label: 'انتظاره من ظلال القوس الحجري ووضع نصلك على عنقه قبل أن يراك',
          sub: 'تخصص الظلال (9+): مباغتة أستاذ الظلال بفحص حاسم',
          check: { attr: 'agi', skill: 'shadow', base: 28 },
          success: {
            text: 'يتجمد سيد القتلة عندما يلامس نصلك عنقه من العتمة؛ يخضع لهيبتك ويسلمك خاتم القيادة للنقابة!',
            effects: { skill: { shadow: 2 }, threat: -20, flags: { tookOverShadowGuild: true, killedShadowMaster: true } }
          },
          fail: {
            text: 'يحس بأنفاسك فوق القوس ويلقي خنجراً يصيب صدرك قبل انسحابه.',
            effects: { hp: -34, threat: 4 }
          }
        },
        {
          id: 'int_negotiate_truce',
          minInt: 14,
          requiresFlags: ['exposedLordValkor'],
          label: 'إبراز أدلة سقوط اللورد فالكور وعرض إنهاء العقد مقابل سلامة عائلتك',
          sub: 'بصيرة ذكاء (14+) + أثر سقوط فالكور: تفكيك دافع القاتل منطقياً',
          success: {
            text: 'يتوقف القاتل عندما يرى إفلاس مموله وضياع العقد؛ يمزق ورقة الدم أمامك ويمنحك كلمة الشرف المظلمة بألا يطرقوا بابك ثانية.',
            effects: { attr: { cha: 1 }, threat: -22, skill: { shadow: 1 }, flags: { shadowTruceMade: true } }
          }
        }
      ]
    },

    // Age 18 Period 1
    {
      id: 'story_18_m1_final_year',
      phase: 'youth',
      age: 18,
      period: 1,
      priority: 100,
      category: 'story',
      categoryLabel: 'عام الحسم',
      title: 'فجر الثامنة عشرة',
      text: 'دخلت عامك الثامن عشر والحرب تدخل فصلها الأخير في سهل الرماد. كل ما زرعته في السنوات الإحدى عشرة الماضية — من صداقات وعداوات وعتاد ومعرفة — يقترب الآن من لحظة الحصاد الكبرى.',
      choices: [
        {
          id: 'prep_final_forge',
          label: 'صقل عتادك الأخير وإعداد التجهيزات العسكرية أو الطبية',
          success: {
            text: 'تعمل بلا كلل فتخرج بأعلى جاهزية بدنية ومعدنية لهذا العام المصيري ومعك إكسير شفاء إضافي.',
            effects: { hp: 14, skill: { smithing: 2, combat: 1 }, gold: 25, giveElixir: { healing: 1 } }
          }
        },
        {
          id: 'prep_final_diplomacy',
          label: 'إرسال الرسل لتثبيت التحالفات ومراقبة موازين القوى',
          success: {
            text: 'ترتب أوراقك الدبلوماسية والاستخباراتية لتكون الكلمة الفاصلة بيدك.',
            effects: { attr: { cha: 1 }, skill: { trade: 1, shadow: 2 }, rep: 6, giveElixir: { focus: 1 } }
          }
        }
      ]
    },

    // Age 18 Period 3
    {
      id: 'story_18_m6_turning_point',
      phase: 'youth',
      age: 18,
      period: 3,
      priority: 100,
      category: 'war',
      categoryLabel: 'مفترق المصير',
      title: 'معركة الجسر المعلق',
      text: 'تشتبك طلائع البشر والجان والشياطين عند الجسر المعلق فوق وادي الصدى، والمجالس تنتظر مساهمتك الحاسمة قبل المعركة الفاصلة في سهل الرماد.',
      choices: [
        {
          id: 'lead_charge',
          label: 'التقدم نحو خطوط القتال أو قيادة الدعم اللوجستي للجبهة',
          check: {
            attr: 'str',
            skill: 'combat',
            gearBonus: 'both',
            base: 22,
            flagBonuses: [
              { flag: 'heroOfTheSiege', bonus: 12 },
              { flag: 'purgedGuild', bonus: 10 },
              { flag: 'sparedDeserter', bonus: 8 }
            ]
          },
          success: {
            text: 'تقلب كفة المواجهة لصالح من تدعمهم ويتردد اسمك في أرجاء المعسكرات.',
            effects: { rep: 15, skill: { combat: 2 }, flags: { wonBridgeBattle: true } }
          },
          fail: {
            text: 'تنهكك المواجهة وتتعرض لإصابة بالغة في الاشتباك قبل أن تتراجع لصفوف الاحتياط.',
            effects: { hp: -32, rep: 4 }
          }
        },
        {
          id: 'deliver_peace_dossier',
          label: 'نشر وثائق مؤامرة الحرب ودعوة المعتدلين إلى هدنة عاجلة',
          check: {
            attr: 'int',
            skill: 'trade',
            base: 22,
            flagBonuses: [
              { flag: 'exposedLordValkor', bonus: 14 },
              { flag: 'preventedForestMassacre', bonus: 12 },
              { flag: 'brokeredSiegeTruce', bonus: 10 }
            ]
          },
          success: {
            text: 'تتراجع رغبة القتال لدى عدد من القادة البشر والجان مع انكشاف خيوط اللعبة القذرة!',
            effects: { rep: 14, faction: { humans: 10, elves: 12 }, flags: { peaceMovementActive: true } }
          },
          fail: {
            text: 'تضيع نداءات العقل وسط ضجيج السيوف وتصيبك شظية سهم طائش.',
            effects: { hp: -18, attr: { cha: 1 } }
          }
        },
        {
          id: 'supply_war_empire',
          label: 'إمداد الجبهات المتصارعة بالإمدادات والعتاد وفق شروطك الذهبية',
          success: {
            text: 'تُثبت أن الاقتصاد والسندان هما العمود الفقري الذي لا تستغني عنه أي قوة.',
            effects: { gold: 70, skill: { trade: 2, smithing: 1 }, flags: { warMagnate: true }, threat: 6 }
          }
        }
      ]
    },

    // Age 18 Period 5: Eve of Battle (Reacts strongly to Family Standing!)
    {
      id: 'story_18_m10_eve_of_battle',
      phase: 'youth',
      age: 18,
      period: 5,
      priority: 100,
      category: 'family',
      categoryLabel: 'أمام الموقد',
      title: 'حديث أخير مع الأبوين',
      text: function (s) {
        if ((s.factions.family || 0) < 30) {
          return 'في ليلة باردة عشية معركة سهل الرماد، يسود الصمت الثقيل أرجاء الورشة. ينظر إليك غارون وسيرين بفتور وخيبة أمل من جفائك وتجاهلك للعائلة طوال هذه السنوات، ويسألانك ببرود عن وجهتك غداً.';
        }
        if (s.flags.evacuatedFamilySafe) {
          return 'في المزرعة الجبلية الآمنة التي نقلتهم إليها وقت الحصار، يجلس غارون وسيرين معك في ليلة شتوية هادئة قبل الفجر الأخير. يبتسمان بامتنان لإنقاذك لهما ويسألانك عن الصورة التي تريد أن يذكرك بها هذا العالم.';
        }
        return 'يجلس غارون وسيرين معك بجانب الكير الدافئ في ليلة شتوية هادئة قبل الفجر الأخير. يضع والدك يده الثقيلة على كتفك بينما تبتسم أمك بفخر، ويسألانك عن الصورة التي تريد أن يذكرك بها هذا العالم.';
      },
      choices: [
        {
          id: 'goal_honor',
          condition: function (s) { return (s.factions.family || 0) >= 30; },
          label: '«أريد حماية هذا الوطن وحلفائي بصفتي مقاتلاً أو قائداً»',
          success: {
            text: 'يهديك والدك أفضل ما صنعه بيديه ليكون رفيقك في معركة الغد الفاصلة.',
            effects: { faction: { family: 10 }, hp: 16, setArmor: { name: 'درع الإرث العائلي الفاخر', defense: 7, rarity: 'epic', icon: 'plate_armor' } }
          }
        },
        {
          id: 'goal_honor_cold',
          condition: function (s) { return (s.factions.family || 0) < 30; },
          label: '«سأخوض معركة الغد وحدي للدفاع عن اسمي رغم ما بيننا»',
          sub: 'علاقة العائلة فاترة (< 30): لن تحصل على درع الإرث الفاخر',
          success: {
            text: 'يمد لك غارون صفيحة جلدية عادية بصمتٍ ثقيل؛ لم يبقَ في القلب ما يكفي لمنحك تحفة الورشة.',
            effects: { hp: 8, setArmor: { name: 'درع حراسة بسيط', defense: 4, rarity: 'common', icon: 'leather_armor' } }
          }
        },
        {
          id: 'goal_peace',
          label: '«سأجمع خيوط الذكاء والسلام لإنهاء هذه الحرب بلا إبادة»',
          success: {
            text: function (s) {
              if ((s.factions.family || 0) < 30) return 'تضع سيرين نسخة الختم على الطاولة دون عناق؛ تنجز واجبها كحارسة سابقة فقط.';
              return 'تسلمك أمك الصيغة الأخيرة من ختم المعاهدة متمنية لك نجاحاً عجز عنه جيلها.';
            },
            effects: { faction: { family: 6 }, attr: { cha: 1 }, flags: { carriesOriginalSeal: true } }
          }
        },
        {
          id: 'goal_freedom',
          label: '«يكفيني أن تبقيا سالمين؛ بعد العاصفة قد نرحل أو نبني إمبراطوريتنا»',
          success: {
            text: function (s) {
              if ((s.factions.family || 0) < 30) return 'يهز والدك رأسه بمرارة؛ لا يصدقان تماماً استعدادك للتضحية من أجلهما بعد سنوات الجفاء.';
              return 'يحتضنانك بدفء؛ فقد اكتشفت أن أغلى ما في العالم الجديد لم يكن المعدن بل هذه العائلة.';
            },
            effects: { faction: { family: 10 }, gold: 25, flags: { prioritizesFamilyEscape: true } }
          }
        }
      ]
    },

    // Age 18 Period 6: Real Climax Showdown in Plain of Ash!
    {
      id: 'story_18_m12_climax',
      phase: 'youth',
      age: 18,
      period: 6,
      priority: 100,
      category: 'story',
      categoryLabel: 'معركة سهل الرماد',
      title: 'فجر الخاتمة في سهل الرماد',
      text: 'في المحطة الأخيرة من عامك الثامن عشر، تصطدم الرايات الثلاث تحت سماء مثقلة بالدخان والرماد! كل ما اعددته من سلاح، ودرع، وتمائم، وإكسير تركيز، ومهارات، وتحالفات يوضع الآن على المحك الحقيقي لانتزاع مصيرك الأخير.',
      choices: [
        {
          id: 'climax_crown',
          label: 'قيادة الاقتحام الحاسم تحت راية مملكة البشر وكسر الحصار الأخير',
          condition: function (s) {
            return (s.warAlignment === 'humans' || (s.warAlignment === 'none' && s.factions.humans >= 25))
              && s.warAlignment !== 'demons' && s.factions.humans >= 15;
          },
          check: {
            attr: 'str',
            skill: 'combat',
            gearBonus: 'both',
            base: 16,
            flagBonuses: [
              { flag: 'heroOfTheSiege', bonus: 12 },
              { flag: 'wonBridgeBattle', bonus: 10 },
              { flag: 'purgedGuild', bonus: 8 },
              { flag: 'vowedFamily', bonus: 6 }
            ]
          },
          success: {
            text: 'تخترق الخطوط في اللحظة الحاسمة بسلاحك ودرعك الصلب لتثبت أركان المملكة وتستقبل فجر النصر!',
            effects: { rep: 25, flags: { climaxChoice: 'humans' } }
          },
          fail: {
            text: 'تنهار دفاعات فرقتك أمام طوفان السهام وتُصاب بجرح قاتل في قلب السهل قبل أن تتكسر رايتك!',
            effects: { hp: -46, flags: { climaxChoice: 'humans', climaxFailed: true } }
          }
        },
        {
          id: 'climax_truce',
          label: 'اقتحام منصة القادة وتقديم الأدلة وختم المعاهدة لفرض هدنة تاريخية',
          condition: function (s) {
            return s.warAlignment !== 'demons'
              && (s.attributes.int >= 12 || s.flags.peaceMovementActive || s.flags.exposedLordValkor || s.flags.carriesOriginalSeal);
          },
          check: {
            attr: 'int',
            skill: 'trade',
            gearBonus: 'armor',
            base: 14,
            flagBonuses: [
              { flag: 'exposedLordValkor', bonus: 14 },
              { flag: 'brokeredSiegeTruce', bonus: 10 },
              { flag: 'knowsSealPower', bonus: 8 },
              { flag: 'preventedForestMassacre', bonus: 10 },
              { flag: 'carriesOriginalSeal', bonus: 10 }
            ]
          },
          success: {
            text: 'تقف بين الجيوش المتأهبة وتكشف الحقيقة كاملةً بالأختام والبراهين، فتُسكت طبول الحرب صوت العقل والبرهان!',
            effects: { rep: 25, flags: { climaxChoice: 'truce' } }
          },
          fail: {
            text: 'يمزق صقور الحرب رسائلك تحت وابل النيران وتصيبك طعنة غادرة قبل وصول الحلفاء!',
            effects: { hp: -42, flags: { climaxChoice: 'truce', climaxFailed: true } }
          }
        },
        {
          id: 'climax_elves',
          label: 'القتال بجانب إيلارين وعشائر الجان لحماية قدس الغابة القديمة',
          condition: function (s) {
            return (s.warAlignment === 'elves' || (s.warAlignment !== 'demons' && s.factions.elves >= 25))
              && s.factions.elves >= 15;
          },
          check: {
            attr: 'agi',
            skill: 'combat',
            gearBonus: 'weapon',
            base: 16,
            flagBonuses: [
              { flag: 'elvenSafePassage', bonus: 10 },
              { flag: 'helpedElvenFugitive', bonus: 8 },
              { flag: 'brokeredSiegeTruce', bonus: 8 }
            ]
          },
          success: {
            text: 'تقود المقاتلين من ممر الأشجار العتيقة وتدحر الغزاة عن قلب الغابة الخضراء!',
            effects: { rep: 22, flags: { climaxChoice: 'elves' } }
          },
          fail: {
            text: 'تحاصر نيران المنجنيق طرف الغابة وتسقط مصاباً وأنت تغطي انسحاب الكشافة!',
            effects: { hp: -44, flags: { climaxChoice: 'elves', climaxFailed: true } }
          }
        },
        {
          id: 'climax_demons',
          label: 'الزحف مع طليعة الشياطين وإعادة رسم خريطة القوة بالنار والفولاذ',
          condition: function (s) {
            return (s.warAlignment === 'demons' || (s.warAlignment !== 'humans' && s.factions.demons >= 25))
              && s.factions.demons >= 15;
          },
          check: {
            attr: 'str',
            skill: 'combat',
            gearBonus: 'weapon',
            base: 16,
            flagBonuses: [
              { flag: 'tookDemonSteel', bonus: 10 },
              { flag: 'masteredDemonSteel', bonus: 12 },
              { flag: 'knowsDemonRoutes', bonus: 8 }
            ]
          },
          success: {
            text: 'تفتح أبواب النفوذ الجهنمي بنصل لا يلين وتثبت مكانتك المهيبة بين أمراء الأراضي القاحلة!',
            effects: { rep: 18, flags: { climaxChoice: 'demons' } }
          },
          fail: {
            text: 'يخونك جناح الفيلق عند الانهيار وتلتهمك شظايا اللهب قبل تراجعك مثخناً!',
            effects: { hp: -46, flags: { climaxChoice: 'demons', climaxFailed: true } }
          }
        },
        {
          id: 'climax_forge',
          label: 'صمود ورشة السندان الكبرى وتتويج إرثك المعدني وسط نيران الحسم',
          condition: function (s) { return s.skills.smithing >= 10 || s.career === 'smith' || s.flags.craftedMeteorBlade; },
          check: {
            attr: 'str',
            skill: 'smithing',
            gearBonus: 'both',
            base: 16,
            flagBonuses: [
              { flag: 'builtDoubleBellows', bonus: 10 },
              { flag: 'unlockedDawnSteel', bonus: 12 },
              { flag: 'craftedMeteorBlade', bonus: 12 },
              { flag: 'kaserArc1Won', bonus: 6 }
            ]
          },
          success: {
            text: 'تصمد معداتك وتحصيناتك في الساحة الفاصلة فيظل اسم سندانك المرجع الخالد لكل مقاتل!',
            effects: { rep: 20, flags: { climaxChoice: 'forge' } }
          },
          fail: {
            text: 'تنهار إحدى المنشآت الميدانية تحت القصف فتنجو من تحت الركام بجراح قاسية.',
            effects: { hp: -40, flags: { climaxChoice: 'forge', climaxFailed: true } }
          }
        },
        {
          id: 'climax_trade',
          label: 'تثبيت قبضة الإمبراطورية التجارية وإحكام عقود الإمداد على الجبهات',
          condition: function (s) { return s.gold >= 130 || s.skills.trade >= 10 || s.career === 'merchant'; },
          check: {
            attr: 'cha',
            skill: 'trade',
            gearBonus: 'armor',
            base: 16,
            flagBonuses: [
              { flag: 'warMagnate', bonus: 12 },
              { flag: 'absorbedDalosEmpire', bonus: 12 },
              { flag: 'beatDalosPort', bonus: 8 }
            ]
          },
          success: {
            text: 'تُبرم العقود النهائية بينما تهدأ العواصف؛ لقد كسبت الحرب بالذهب والنفوذ الاقتصادي!',
            effects: { gold: 80, flags: { climaxChoice: 'trade' } }
          },
          fail: {
            text: 'تُنهب قافلة الإمداد الرئيسية وسط المعركة وتتعرض لكمين مسلّح يهدد حياتك!',
            effects: { hp: -38, gold: -60, flags: { climaxChoice: 'trade', climaxFailed: true } }
          }
        },
        {
          id: 'climax_shadow',
          label: 'تنفيذ عملية الظلال النهائية لإخضاع قادة الجبهات من الخلف',
          condition: function (s) { return s.flags.tookOverShadowGuild || s.skills.shadow >= 10; },
          check: {
            attr: 'agi',
            skill: 'shadow',
            gearBonus: 'weapon',
            base: 16,
            flagBonuses: [
              { flag: 'tookOverShadowGuild', bonus: 14 },
              { flag: 'blackmailedValkor', bonus: 10 },
              { flag: 'tracedNeedleLeader', bonus: 8 }
            ]
          },
          success: {
            text: 'تنسحب نحو العتمة بينما ترضخ العروش لرسائلك السرية؛ كل الخيوط باتت بيدك!',
            effects: { rep: 14, flags: { climaxChoice: 'shadow' } }
          },
          fail: {
            text: 'ينقلب أحد عملاء الظل عليك عند المعبر فتنجو مطعوناً في ضباب الفجر!',
            effects: { hp: -42, flags: { climaxChoice: 'shadow', climaxFailed: true } }
          }
        },
        {
          id: 'climax_escape_family',
          label: 'تأمين والديك وأحبائك والانطلاق بقافلة النجاة خارج حدود الحرب',
          check: {
            attr: 'ins',
            skill: 'shadow',
            gearBonus: 'armor',
            base: 28,
            flagBonuses: [
              { flag: 'evacuatedFamilySafe', bonus: 20 },
              { flag: 'prioritizesFamilyEscape', bonus: 16 },
              { flag: 'elvenSafePassage', bonus: 10 }
            ]
          },
          success: {
            text: 'تترك الملوك لصراعاتهم وتعبر الممرات الجبلية بوالديك نحو أفق جديد هادئ.',
            effects: { faction: { family: 10 }, flags: { climaxChoice: 'traveler' } }
          },
          fail: {
            text: 'تعترضكم دورية شاردة على حافة الوادي فتقاتل لتغطية هروبهم وسط نزيف خطير!',
            effects: { hp: -36, flags: { climaxChoice: 'traveler', climaxFailed: true } }
          }
        }
      ]
    }
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.Data.storyEvents;
  }
})(typeof window !== 'undefined' ? window : globalThis);

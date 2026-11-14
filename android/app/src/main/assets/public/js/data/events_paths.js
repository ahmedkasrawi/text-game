(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});
  GameApp.Data = GameApp.Data || {};

  GameApp.Data.pathEvents = [
    // =========================================================================
    // DELAYED CONSEQUENCE RIPPLES (Triggered O(1) via state.pendingRipples)
    // =========================================================================
    {
      id: 'ripple_elven_gift',
      isRipple: true,
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      priority: 85,
      category: 'family',
      categoryLabel: 'امتداد قرار سابق',
      title: 'رد الجميل من الغابة الخضراء',
      text: 'في غسق المساء، تهبط حمامة خضراء عند نافذة الورشة مع حزمة صغيرة مربوطة بتميمة الخشب القديمة؛ لقد تذكّر الهارب الذي ساعدته في الثامنة دَينَه القديم وأرسل لك سلاحاً ومؤونة نادرة.',
      choices: [
        {
          id: 'accept_elven_moonblade',
          label: 'قبول هدية الغابة والحفاظ على العهد الصامت',
          success: {
            text: 'تجد داخل الحزمة نصل قمر خفيف وعشباً شافياً يزيد حيويتك!',
            effects: { hp: 16, faction: { elves: 12 }, setWeapon: { name: 'نصل القمر الغابوي', power: 7, rarity: 'rare', icon: 'elven_blade' }, skill: { shadow: 1 } }
          }
        },
        {
          id: 'trade_elven_herbs',
          label: 'بيع الأعشاب النادرة لكبار الأطباء مع حفظ السر',
          success: {
            text: 'تدر الأعشاب أرباحاً ممتازة مع الحفاظ على ود الجان.',
            effects: { gold: 55, faction: { elves: 6 }, skill: { trade: 1, alchemy: 1 } }
          }
        }
      ]
    },
    {
      id: 'ripple_scar_vendetta',
      isRipple: true,
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      priority: 86,
      category: 'assassin',
      categoryLabel: 'امتداد قرار سابق',
      title: 'عودة القاتل الجريح',
      text: 'رجل بعين مغطاة وندبة قديمة يسد طريقك في الممر المعتم هامساً: «تذكر ليلة السقف أو الحانة؟ لقد بقيت حياً لأختم الحساب بنفسي!»',
      choices: [
        {
          id: 'finish_vendetta_combat',
          label: 'مواجهته بالسلاح وإنهاء الثأر للأبد',
          check: {
            attr: 'agi',
            skill: 'combat',
            gearBonus: 'weapon',
            base: 26,
            flagBonuses: [{ flag: 'repelledNightRaid', bonus: 10 }]
          },
          success: {
            text: 'تسقطه هذه المرة بلا رجعة وتصادر عقود الاغتيال التي بحوزته!',
            effects: { skill: { combat: 2, shadow: 1 }, gold: 38, threat: -8, rep: 8, flags: { defeatedNeedleSquad: true } }
          },
          fail: {
            text: 'جرحه القديم جعله أكثر قسوة؛ يصيبك بطعنة غائرة قبل أن تلوذ بالفرار.',
            effects: { hp: -36, threat: 4 }
          }
        },
        {
          id: 'vanish_vendetta_stealth',
          minSkill: { shadow: 5 },
          label: 'إلقاء عباءتك على وجهه والاختفاء عبر السطوح في لحظة',
          sub: 'تخصص الظلال (5+): اختبار تملص للإفلات من الثأر',
          check: { attr: 'agi', skill: 'shadow', base: 34 },
          success: {
            text: 'تتوارى فوق أسطح القرميد وتتركه يطعن الهواء غيظاً، ثم تبلغ الحرس بمكانه!',
            effects: { skill: { shadow: 2 }, threat: -10, rep: 6 }
          },
          fail: {
            text: 'يتعلق بعباءتك فيجرح ظهرك قبل أن تنفلت إلى الزقاق.',
            effects: { hp: -26, threat: 4 }
          }
        },
        {
          id: 'int_disarm_vendetta',
          minInt: 12,
          label: 'كشف أن رؤساءه تخلوا عنه وإقناعه بترك السلاح مقابل حريته',
          sub: 'بصيرة ذكاء (12+): كشف الحقيقة يتطلب إقناعاً حاداً تحت الخطر',
          check: { attr: 'cha', skill: 'shadow', base: 32 },
          success: {
            text: 'يدرك أن نقابته باعته منذ سنوات؛ يرمي خنجره في النهر ويمنحك أسماء اثنين من وسطائهم.',
            effects: { skill: { shadow: 2 }, threat: -12, attr: { cha: 1 }, flags: { tracedNeedleLeader: true } }
          },
          fail: {
            text: 'لا يصغي لكلامك ويطعن كتفك قبل اختفائه.',
            effects: { hp: -30, threat: 6 }
          }
        }
      ]
    },
    {
      id: 'ripple_smuggler_retaliation',
      isRipple: true,
      phase: 'youth',
      minAge: 12,
      maxAge: 18,
      priority: 82,
      category: 'assassin',
      categoryLabel: 'امتداد قرار سابق',
      title: 'ثمن سر القافلة القديم',
      text: 'أعضاء شبكة التهريب التي كشفتَ شحنتها المحظورة في طفولتك يجدونك الآن عند بوابة المخازن، ويطالبونك بالصمت التام أو رد الأموال مضاعفة.',
      choices: [
        {
          id: 'pay_smugglers_off',
          minGold: 35,
          label: 'دفع 35 ذهباً لإغلاق الملف وشراء هدنة تجارية',
          success: {
            text: 'يأخذون الذهب ويرحلون؛ تستمر علاقاتك التجارية بهدوء.',
            effects: { gold: -35, threat: -8 }
          }
        },
        {
          id: 'outsmart_smugglers',
          label: 'مواجهتهم بتهديد فضح أسمائهم لدى حرس الحدود',
          check: { attr: 'cha', skill: 'shadow', base: 30 },
          success: {
            text: 'يرتدع المهربون أمام ثقتك الصلبة ويعرضون عليك حصة من بضاعتهم لكسب صمتك!',
            effects: { gold: 40, skill: { shadow: 2, trade: 1 } }
          },
          fail: {
            text: 'يضربك حارسهم بعصا ثقيلة في الزقاق قبل أن تتفرق الجموع.',
            effects: { hp: -26, threat: 8 }
          }
        }
      ]
    },
    {
      id: 'ripple_demon_debt',
      isRipple: true,
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      priority: 86,
      category: 'war',
      categoryLabel: 'امتداد قرار سابق',
      title: 'استحقاق دين حديد الجحيم',
      text: 'يعود سمسار الجمر الأسود كما وعد حين أخذت السبيكة؛ الحرب مشتعلة وهو يطالب الآن بالوفاء بالدين: تمرير شحنة رماد حارقة داخل المدينة أو شحذ أسلحة طليعة الشياطين.',
      choices: [
        {
          id: 'fulfill_demon_debt',
          label: 'تنفيذ الشرط وتمرير الشحنة سراً للوفاء بالعهد',
          success: {
            text: 'يفي الفيلق بوعوده ويكافئك بذهب غزير ومكانة عالية لديهم، وسط غليان الشكوك بين البشر وعائلتك.',
            effects: { gold: 70, faction: { demons: 18, humans: -16, family: -4 }, threat: 14, skill: { shadow: 1 } }
          }
        },
        {
          id: 'betray_demon_broker',
          label: 'تسليم المخطط لحامية البشر وكسر ميثاق السمسار',
          success: {
            text: 'تحبط عملية تخريب خطيرة في المدينة وتكسب تقدير البشر وعداء الشياطين الشرس!',
            effects: { rep: 14, faction: { humans: 16, demons: -26 }, threat: 10 }
          }
        },
        {
          id: 'int_loophole_debt',
          minInt: 14,
          label: 'استغلال ثغرة حرفية في العقد لتسليم خام غير قتالي وسداد الدين قانونياً',
          sub: 'بصيرة ذكاء (14+): اختبار مفاوضة قانونية مع سمسار الشياطين',
          check: { attr: 'int', skill: 'trade', base: 28 },
          success: {
            text: 'يحترم السمسار براعتك القانونية الدقيقة؛ يُشطب الدين وتخرج بريء الذمة أمام البشر والشياطين معاً!',
            effects: { skill: { trade: 2, shadow: 1 }, faction: { demons: 6 }, noCounterFaction: true }
          },
          fail: {
            text: 'يفقد السمسار صبره ويلهب ذراعك بجمر قاسٍ قبل اختفائه في الظلام!',
            effects: { hp: -28, faction: { demons: -14 }, threat: 8 }
          }
        }
      ]
    },
    {
      id: 'ripple_deserter_gratitude',
      isRipple: true,
      phase: 'youth',
      minAge: 16,
      maxAge: 18,
      priority: 84,
      category: 'war',
      categoryLabel: 'امتداد قرار سابق',
      title: 'رسالة الجندي الناجي',
      text: 'في ليلة ممطرة يتسلل إلى عتبتك الجندي الهارب الذي أنقذتَه مع الأيتام سابقاً؛ يسلمك خريطة كمين شيطاني وشيك وصرة ذهب جمعها مع رفاقه.',
      choices: [
        {
          id: 'use_deserter_intel',
          label: 'قبول الخريطة وتمرير التحذير إلى الحلفاء دون كشف هويته',
          success: {
            text: 'تُنقذ كتيبة كاملة من الإبادة وتنال مكافأة ومهارة استخباراتية قيمة!',
            effects: { gold: 50, rep: 14, faction: { humans: 10 }, skill: { shadow: 2 }, threat: -6 }
          }
        },
        {
          id: 'recruit_deserter_scout',
          label: 'ضمه هو ورفاقه كعيون سرية لك بدلاً من تسليم الخريطة للجيش',
          success: {
            text: 'تحصل على خلية استطلاع مخلصة تعمل لصالحك في الخفاء وتؤمّن تحركاتك!',
            effects: { gold: 28, skill: { shadow: 3 }, threat: -12, attr: { cha: 1 } }
          }
        }
      ]
    },

    // =========================================================================
    // ULTRA-RARE SWORD PATH («مسار السيف» - sword_path)
    // =========================================================================
    {
      id: 'rare_sword_path_trial',
      phase: 'youth',
      minAge: 14,
      maxAge: 17,
      priority: 89,
      condition: function (s) {
        return (s.skills.sword_path || 0) === 0
          && s.attributes.agi >= 10
          && s.attributes.ins >= 9
          && (s.skills.combat || 0) >= 8
          && Boolean(s.flags.heardSwordMasterRumors || s.flags.knowsSwordRumorLegacy);
      },
      category: 'story',
      categoryLabel: 'سر نادر جداً',
      title: 'الزاهد ذو السيف المغمود',
      text: 'على قمة التل المهجور وقت الغروب، تقف أمام عجوز أعمى يغرس سيفاً خشبياً مكسوراً في الصخر. ينصت لخطواتك ويقول بصوت كالفولاذ: «سمعت همس القاعة عن سرعتك وحدسك.. إن كنت تطلب ما وراء القتال العادي، فاصمد أمام ثلاث ضربات منّي دون تراجع!»',
      choices: [
        {
          id: 'accept_sword_trial',
          label: 'استلال سلاحك وقبول اختبار «مسار السيف» مهما كان الخطر',
          sub: '⚔ تحدٍ نادر جداً: اجتيازه يفتح مهارة «مسار السيف» الأسطورية',
          check: { attr: 'agi', skill: 'combat', gearBonus: 'weapon', base: 18 },
          success: {
            text: 'في الضربة الثالثة يتوقف السيف الخشبي على بُعد شعرة من عنقك؛ تبتسم عينا الزاهد الفارغتان وهو يسلّمك نصله الموروث: «قد ولدتَ لمسار السيف!»',
            effects: {
              skill: { sword_path: 2, combat: 1 },
              attr: { agi: 1, ins: 1 },
              rep: 16,
              addTrait: 'مبارز الصمت',
              setWeapon: { name: 'نصل الصمت الموروث', power: 8, rarity: 'epic', icon: 'elven_blade' },
              flags: { unlockedSwordPath: true }
            }
          },
          fail: {
            text: 'تطير بك ضربة خشبية كالصاعقة فتكسر ضلعين وتنزف فوق الصخر؛ يرحل الزاهد في الضباب: «ما زلت أبطأ من أنفاس الريح»!',
            effects: { hp: -36, skill: { combat: 1 } }
          }
        },
        {
          id: 'observe_sword_stance',
          label: 'الانحناء باحترام ومراقبة وقفة الزاهد دون المجازفة بموتٍ محقق',
          success: {
            text: 'يحترم العجوز تواضعك ويلقّنك مبدأً سريعاً في التوازن دون أن يسلّمك أسرار السيف.',
            effects: { attr: { ins: 1 }, skill: { combat: 1 } }
          }
        }
      ]
    },
    {
      id: 'rare_sword_path_echo',
      phase: 'youth',
      minAge: 15,
      maxAge: 18,
      priority: 87,
      condition: function (s) { return (s.skills.sword_path || 0) >= 1; },
      category: 'story',
      categoryLabel: 'إتقان مسار السيف',
      title: 'مرآة النصل في الضباب',
      text: 'في فجر بارد قبل اندلاع المواجهات الكبرى، تستعيد إيقاع أنفاسك على ضفة النهر لتكسر الحاجز بين النصل وجسدك وتبلغ ذروة «مسار السيف».',
      choices: [
        {
          id: 'perfect_sword_flow',
          label: 'خوض تمرين الإتقان الصامت بقطع قطرات المطر المتساقطة',
          check: { attr: 'ins', skill: 'sword_path', base: 30 },
          success: {
            text: 'ينساب السيف كامتداد لإرادتك؛ تصبح ضرباتك قادرة على حسم المبارزات الكبرى في لحظة واحدة!',
            effects: { skill: { sword_path: 2 }, attr: { agi: 1 } }
          },
          fail: {
            text: 'يرتد اهتزاز النصل في معصمك فيرهقك التمرين الشاق دون أن تبلغ الذروة الكاملة.',
            effects: { hp: -16, skill: { sword_path: 1 } }
          }
        },
        {
          id: 'meditate_inner_calm',
          label: 'تثبيت رباطة الجأش والاستعداد لحسم سهل الرماد',
          success: {
            text: 'تهدأ نبضاتك وتخفف آثار الملاحقة وتستعيد قدراً من عافيتك.',
            effects: { hp: 12, skill: { sword_path: 1 }, threat: -6 }
          }
        }
      ]
    },

    // =========================================================================
    // NEGATIVE FACTION & FAMILY PENALTY EVENTS (Triggered when relations drop!)
    // =========================================================================
    {
      id: 'penalty_family_estrangement',
      phase: 'youth',
      minAge: 12,
      maxAge: 18,
      maxFaction: { family: 25 },
      priority: 85,
      category: 'family',
      categoryLabel: 'أزمة عائلية',
      title: 'عتاب على عتبة الكير',
      text: 'تعود إلى الورشة متأخراً فتجد غارون وسيرين صامتين عند الباب؛ جفاؤك وقراراتك الأنانية جعلتا العائلة تشعر أنك غريب عن هذا البيت.',
      choices: [
        {
          id: 'family_mend_humble',
          minGold: 20,
          label: 'الاعتذار بصدق وتقديم 20 ذهباً لإصلاح الورشة وتخصيص وقت للوالدين',
          success: {
            text: 'تتنهّد سيرين وتلين ملامح غارون؛ خطوة أولى لترميم ما انكسر بينكم.',
            effects: { gold: -20, faction: { family: 16 }, threat: -4 }
          }
        },
        {
          id: 'family_leave_cold',
          label: 'الرد بفتور أن طريقك القادم لا يحتاج عاطفة',
          success: {
            text: 'يزداد الجدار بينكم سمكاً؛ لن تعتمد بعد الآن على دفء الورشة في الأزمات.',
            effects: { faction: { family: -10 }, rep: -4 }
          }
        }
      ]
    },
    {
      id: 'penalty_human_crackdown',
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      maxFaction: { humans: -15 },
      priority: 85,
      category: 'war',
      categoryLabel: 'سخط المملكة',
      title: 'مذكرة ملاحقة من حرس التاج',
      text: 'بسبب عدائك الواضح لمملكة البشر أو تعاملك مع خصومها، تحاصرك دورية من فرسان الحامية عند ساحة المدينة وتطالب بتفتيشك ومصادرة عتادك!',
      choices: [
        {
          id: 'bribe_or_fight_guards',
          label: 'مقاومة الدورية وفتح ثغرة للهرب من الحصار',
          check: { attr: 'agi', skill: 'combat', gearBonus: 'both', base: 24 },
          success: {
            text: 'تكسر طوق الحرس بصعوبة وتنسحب إلى الأزقة الخلفية متخفياً!',
            effects: { threat: 12, skill: { combat: 1 } }
          },
          fail: {
            text: 'ينهال الحرس عليك بالهراوات ويصادرون غرامة مالية موجعة!',
            effects: { hp: -30, gold: -35, threat: 14 }
          }
        },
        {
          id: 'shadow_slip_guards',
          minSkill: { shadow: 4 },
          label: 'التواري في قنوات الصرف والالتفاف على الدورية بصمت',
          sub: 'تخصص الظلال (4+): هروب صامت من الملاحقة الرسمية',
          check: { attr: 'agi', skill: 'shadow', base: 30 },
          success: {
            text: 'تختفي عن أعين الدورية قبل أن تبلغهم صفارتهم.',
            effects: { skill: { shadow: 1 }, threat: 6 }
          },
          fail: {
            text: 'يلمحك رقيب البوابة وتُجرح بسهم في ذراعك أثناء الهرب.',
            effects: { hp: -24, threat: 12 }
          }
        },
        {
          id: 'pay_crown_fine',
          minGold: 45,
          label: 'دفع غرامة ثقيلة (45 ذهباً) لتهدئة الضابط وتخفيف الشبهة مؤقتاً',
          success: {
            text: 'يأخذ الضابط الصرة ويغض الطرف، فتتحسن علاقتك قليلاً على حساب خزينتك.',
            effects: { gold: -45, faction: { humans: 10 }, noCounterFaction: true }
          }
        }
      ]
    },
    {
      id: 'penalty_elven_ambush',
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      maxFaction: { elves: -20 },
      priority: 85,
      category: 'war',
      categoryLabel: 'ثأر الغابة',
      title: 'سهام من أطراف الغابة',
      text: 'لم تنسَ عشائر الجان عداءك لها؛ أثناء عبورك طريق الأشجار تنهال السهام الخضراء محاصرةً قافلتك الصغيرة!',
      choices: [
        {
          id: 'dodge_elven_arrows',
          label: 'الاحتماء بالعربة والمناورة للخروج من مرمى الأقواس',
          check: { attr: 'agi', skill: 'combat', gearBonus: 'armor', base: 24 },
          success: {
            text: 'تتفادى الوابل القاتل بفضل درعك وتخرج من الغابة سالماً.',
            effects: { skill: { combat: 1 } }
          },
          fail: {
            text: 'يخترق سهمان كتفك ويفقدك الألم توازنك قبل أن تبتعد.',
            effects: { hp: -32, gold: -20 }
          }
        },
        {
          id: 'parley_elven_truce',
          minAttr: { cha: 9 },
          label: 'إلقاء سلاحك أرضاً ومخاطبة قائدهم لإيقاف العداء دون دماء',
          sub: 'بصيرة كاريزما (9+): إقناع رماة الجان بخفض أقواسهم',
          success: {
            text: 'يتوقف الرماة بريبة ويقبلون انسحابك دون مزيد من القتل.',
            effects: { faction: { elves: 8 }, rep: 4 }
          }
        }
      ]
    },
    {
      id: 'penalty_demon_hunt',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      maxFaction: { demons: -30 },
      priority: 83,
      category: 'war',
      categoryLabel: 'مطاردة جهنمية',
      title: 'فرقة المطاردة الجهنمية',
      text: 'أثارت ضرباتك ضد فيالق الشياطين غضب أمرائهم؛ يرسلون خلفك ثلاثة مقاتلين ملثمين يشتعل الجمر حول سيوفهم عند غسق الطريق!',
      choices: [
        {
          id: 'clash_demon_hunters',
          label: 'الاستبسال في القتال ورد هجومهم بنصلك',
          check: { attr: 'str', skill: 'combat', gearBonus: 'both', base: 22 },
          success: {
            text: 'تصرع متقدّمهم وتصد لهيب سيوفهم حتى يفر الباقون نحو التلال!',
            effects: { rep: 12, skill: { combat: 2 }, faction: { humans: 8 }, noCounterFaction: true }
          },
          fail: {
            text: 'تحرقك نيران الجحيم وجروحهم العميقة قبل أن تتدخل دورية قريبة!',
            effects: { hp: -38, rep: 4 }
          }
        },
        {
          id: 'alchemy_douse_flames',
          minSkill: { alchemy: 4 },
          label: 'إلقاء قوارير ملح الرماد والأمونيا لإخماد لهب سيوفهم وإرباكهم',
          sub: 'تخصص الكيمياء (4+): تحييد السلاح الناري علمياً',
          success: {
            text: 'ينطفئ وهج أسلحتهم في لحظة صاعقة فتنسحب بأمان وسط دهشتهم!',
            effects: { skill: { alchemy: 2 }, rep: 8 }
          }
        }
      ]
    },

    // =========================================================================
    // SMITH PATH UNIQUE EVENTS (career: 'smith')
    // =========================================================================
    {
      id: 'smith_quench_oil',
      phase: 'youth',
      career: 'smith',
      minAge: 11,
      maxAge: 18,
      priority: 40,
      weight: 11,
      category: 'path',
      categoryLabel: 'مهنة الحداد',
      title: 'سر التبريد بالزيت والماء',
      text: 'بينما يشتكي حدادو السوق من تشقق السيوف الطويلة أثناء السقي، تستعيد من ذكرياتك فكرة التدرج الحراري بالزيت الدافئ لتخفيف الهشاشة.',
      choices: [
        {
          id: 'test_quench',
          label: 'تجربة الطريقة على دفعة سيوف الحرس الليلية',
          check: { attr: 'int', skill: 'smithing', base: 30 },
          success: {
            text: 'تخرج الشفرات بمرونة مذهلة لا تنكسر عند الصدم؛ يتهافت المقاتلون على ورشتكم!',
            effects: { skill: { smithing: 2, alchemy: 1 }, gold: 32, rep: 8, addTrait: 'أستاذ السقي' }
          },
          fail: {
            text: 'يشتعل الزيت فجأة فتصاب بحرق خفيف وتخسر جزءاً من الدفعة.',
            effects: { hp: -14, gold: -10, skill: { smithing: 1 } }
          }
        },
        {
          id: 'keep_traditional',
          label: 'الالتزام بتقنية أبيك التقليدية مع مضاعفة ساعات الطرق',
          success: {
            text: 'يكافئ العمل الدؤوب صلابة ساعديك وجودة أدواتك المضمونة.',
            effects: { attr: { str: 1 }, skill: { smithing: 2 }, gold: 20 }
          }
        }
      ]
    },
    {
      id: 'smith_sabotaged_ore',
      phase: 'youth',
      career: 'smith',
      minAge: 11,
      maxAge: 18,
      priority: 42,
      weight: 10,
      category: 'path',
      categoryLabel: 'مكيدة صناعية',
      title: 'شحنة الخام المغشوش',
      text: 'تصلك عشر سبائك حديد رخيصة بشكل مريب من مورد جديد. تبدو لامعة من الخارج لكن وزنها مريب قبل تسليم طلبية الحامية غداً.',
      choices: [
        {
          id: 'hammer_test',
          label: 'كسر سبيكة واحدة على السندان وفحص القلب الداخلي',
          success: {
            text: 'تكتشف فقاعات هوائية وشوائب كبريتية تجعل السلاح يتحطم في القتال! ترفض الشحنة وتنقذ سمعة الورشة.',
            effects: { skill: { smithing: 2, shadow: 1 }, rep: 6, faction: { humans: 6 } }
          }
        },
        {
          id: 'smith_reclaim_ore',
          minSkill: { smithing: 6 },
          label: 'إعادة صهر السبائك مع الفحم الجيري لتنقيتها من الكبريت ومضاعفة الربح',
          sub: 'تخصص الحدادة (6+): معالجة كيميائية حرارية صعبة',
          check: { attr: 'str', skill: 'alchemy', base: 30 },
          success: {
            text: 'تنقّي المعدن ببراعة وتبيعه بأعلى جودة كفولاذ مصفّى؛ مهارة تدهش كبار الحرفيين!',
            effects: { gold: 52, rep: 10, skill: { smithing: 2, alchemy: 1 } }
          },
          fail: {
            text: 'تتفكك البوتقة فتتلقى شظية جمر وتكتفي ببيع الخردة بنصف السعر.',
            effects: { hp: -16, gold: 15, skill: { smithing: 1 } }
          }
        },
        {
          id: 'int_trace_supplier',
          minInt: 12,
          label: 'فحص الشوائب لمعرفة المنجم المخادع ومقاضاته أمام النقابة',
          sub: 'بصيرة ذكاء (12+): تحليل مصدر الكبريت ورفع شكوى رسمية (+5 تهديد)',
          success: {
            text: 'تثبت بالأدلة أن الشحنة كانت فخاً لتدمير سمعة عائلتك وتكسب تعويضاً ذهبياً مجزياً.',
            effects: { gold: 42, rep: 8, threat: 5, skill: { smithing: 1, trade: 1 } }
          }
        },
        {
          id: 'forge_anyway',
          label: 'استخدامها سريعاً في أدوات زراعية غير قتالية لتجنب الخسارة',
          success: {
            text: 'تحقق ربحاً سريعاً لكن بعض الزبائن يتذمرون من قصر عمر الأدوات.',
            effects: { gold: 24, rep: -5 }
          }
        }
      ]
    },
    {
      id: 'smith_royal_armor',
      phase: 'youth',
      career: 'smith',
      minAge: 12,
      maxAge: 18,
      priority: 40,
      weight: 10,
      category: 'path',
      categoryLabel: 'طلبية رفيعة',
      title: 'درع قائد الفرسان',
      text: 'يصل أحد ضباط الفرسان بدرع صدري مشقوق ووقت ضيق قبل دورية الحدود، ويعرض أجراً ضخماً إن أصلحته وخففت وزنه.',
      choices: [
        {
          id: 'precision_mend',
          label: 'إعادة تطريق الصفائح بتدعيم مفصلي دقيق',
          check: {
            attr: 'str',
            skill: 'smithing',
            base: 28,
            flagBonuses: [{ flag: 'builtDoubleBellows', bonus: 12 }]
          },
          success: {
            text: 'يعود الدرع أخف وزناً وأقوى تحملاً! يمنحك الضابط توصية رسمية لدى قيادة القلعة.',
            effects: { gold: 50, rep: 10, faction: { humans: 10 }, skill: { smithing: 2 } }
          },
          fail: {
            text: 'يبدو اللحام مقبولاً لكنه يترك أثراً خشناً، فتتقاضى أجراً متواضعاً.',
            effects: { gold: 18, skill: { smithing: 1 } }
          }
        },
        {
          id: 'craft_extra_shield',
          label: 'الاعتذار عن التعديل والتركيز على صنع درع متين لنفسك',
          success: {
            text: 'تستثمر الحديد الفائض في ترقية وقايتك الشخصية.',
            effects: { skill: { smithing: 2 }, setArmor: { name: 'درع صفائح متداخل الصنع', defense: 6, rarity: 'rare', icon: 'scale_armor' } }
          }
        }
      ]
    },
    {
      id: 'smith_elven_silver',
      phase: 'youth',
      career: 'smith',
      minAge: 13,
      maxAge: 18,
      priority: 40,
      weight: 10,
      category: 'path',
      categoryLabel: 'فن الغابة',
      title: 'سر النصل الفضي الرقيق',
      text: 'يعرض عليك صائغ متجول نصف-جان تعلم تقنية تطعيم الشفرات بفضة الغابة الخفيفة مقابل صيانة أدواته الدقيقة.',
      choices: [
        {
          id: 'learn_filigree',
          label: 'تبادل الخبرات والتمرن على السبائك الهجينة',
          success: {
            text: 'تمزج دقة الجان بمتانة السندان البشري وتنتج سلاحاً رشيقاً متفوق التوازن.',
            effects: { skill: { smithing: 2 }, attr: { agi: 1 }, faction: { elves: 8 }, setWeapon: { name: 'سيف هجين مطعم بالفضة', power: 6, rarity: 'rare', icon: 'elven_blade' } }
          }
        },
        {
          id: 'buy_silver_stock',
          minGold: 25,
          label: 'شراء مخزونه الفضي بالكامل بـ 25 ذهباً لبيعه للحرس وقت الحرب',
          success: {
            text: 'تتضاعف قيمة الفضة سريعاً وتجني أرباحاً ممتازة.',
            effects: { gold: 40, skill: { trade: 2 } }
          }
        }
      ]
    },
    {
      id: 'smith_bellows_innovation',
      phase: 'youth',
      career: 'smith',
      minAge: 12,
      maxAge: 18,
      priority: 38,
      weight: 10,
      category: 'path',
      categoryLabel: 'ابتكار الورشة',
      title: 'كير بدوّاس مزدوج',
      text: 'تتأمل إجهاد المتدربين في نفخ الكير طوال النهار، وتفكر في تركيب ذراع ميكانيكي بدوّاس قدم ورافعة هوائية مضاعفة.',
      choices: [
        {
          id: 'build_bellows',
          minGold: 15,
          label: 'إنفاق 15 ذهباً لبناء نظام النفخ الجديد وتجربته',
          success: {
            text: 'ترتفع حرارة الفرن بثلث المجهود المعتاد! تتسارع إنتاجية الورشة وتزيد قدرتك على صهر المعادن الصعبة.',
            effects: { gold: 28, skill: { smithing: 2, alchemy: 1 }, flags: { builtDoubleBellows: true } }
          }
        },
        {
          id: 'train_endurance',
          label: 'تجاهل التعديل والاعتماد على قوة الذراعين المباشرة',
          success: {
            text: 'تزداد قوتك البدنية بفضل الجهد العضلي المتواصل.',
            effects: { attr: { str: 2 }, skill: { smithing: 1 } }
          }
        }
      ]
    },
    {
      id: 'smith_war_contract',
      phase: 'youth',
      career: 'smith',
      minAge: 14,
      maxAge: 18,
      priority: 45,
      weight: 10,
      category: 'war',
      categoryLabel: 'تموين الجبهة',
      title: 'عقد الرماح المئة',
      text: 'تطلب القيادة العسكرية مئة رأس رمح في أسبوعين فقط لتسليح فرقة مستعجلة متجهة للجبهة.',
      choices: [
        {
          id: 'work_overtime',
          label: 'مواصلة العمل ليلاً ونهاراً لتسليم العقد بأعلى جودة',
          check: {
            attr: 'str',
            skill: 'smithing',
            base: 26,
            flagBonuses: [{ flag: 'builtDoubleBellows', bonus: 14 }]
          },
          success: {
            text: 'تنهي الطلبية في الموعد بجودة مذهلة، فتنهال عليك عقود التسليح والذهب.',
            effects: { gold: 52, rep: 10, faction: { humans: 10 }, skill: { smithing: 2 }, hp: -10 }
          },
          fail: {
            text: 'يرهقك السهر فتُصاب بحروق ويضيع نصف الربح في أجور المساعدين.',
            effects: { gold: 15, hp: -20, skill: { smithing: 1 } }
          }
        },
        {
          id: 'int_jig_production',
          minInt: 13,
          label: 'صنع قالب طرق موحد لإنتاج متسلسل سريع بأقل جهد',
          sub: 'بصيرة ذكاء (13+): خط إنتاج متسلسل (يكلف 12 ذهباً للمواد)',
          minGold: 12,
          success: {
            text: 'بفكرة التصنيع المتسلسل تنهي المئة رمح في أربعة أيام فقط وبربح ممتاز!',
            effects: { gold: 58, rep: 10, skill: { smithing: 2, trade: 1 } }
          }
        }
      ]
    },
    {
      id: 'smith_demon_blade_repair',
      phase: 'youth',
      career: 'smith',
      minAge: 14,
      maxAge: 18,
      priority: 42,
      weight: 9,
      category: 'war',
      categoryLabel: 'سلاح ملعون',
      title: 'السيف المتشقق من جبهة الرماد',
      text: 'يحضر إليك مرتزق جريح سيفاً أسود منتزعاً من قائد شيطاني، ويطلب إعادة شحذه لأن ناره الداخلية لم تنطفئ بعد.',
      choices: [
        {
          id: 'reforge_dark',
          label: 'صهر حافته برماد العظام لترويض حرارته وإعادة شحذه',
          check: { attr: 'ins', skill: 'smithing', base: 24 },
          success: {
            text: 'يتحول النصل إلى أداة مرعبة؛ يدفع المرتزق بسخاء وتكتسب معرفة نادرة بمعادن الشياطين.',
            effects: { gold: 65, skill: { smithing: 2, alchemy: 1 }, faction: { demons: 8 }, threat: 6, flags: { masteredDemonSteel: true } }
          },
          fail: {
            text: 'تنفجر شرارة ساخنة من المعدن وتلسع ذراعك بقسوة قبل أن تخمدها في الرمل.',
            effects: { hp: -28, skill: { smithing: 1 } }
          }
        },
        {
          id: 'refuse_curse',
          label: 'رفض المساس بسلاح الشياطين وتنظيف الورشة',
          success: {
            text: 'تحافظ على نقاء سمعتك لدى أهل المدينة والكهنة.',
            effects: { faction: { humans: 6 }, rep: 4 }
          }
        }
      ]
    },
    {
      id: 'smith_apprentice_rival',
      phase: 'youth',
      career: 'smith',
      minAge: 12,
      maxAge: 18,
      priority: 35,
      weight: 10,
      category: 'path',
      categoryLabel: 'منافسة الحرفة',
      title: 'تحدي ابن كبير الحدادين',
      text: 'يتهمك ابن رئيس النقابة أمام الزبائن بأن شهرتك سببها مساعدة والدك وأمك فقط، ويتحداك في صياغة خنجر صيد في ساعتين.',
      choices: [
        {
          id: 'accept_craft_duel',
          label: 'قبول التحدي وإبراز مهارتك الخالصة أمام الجميع',
          check: { attr: 'agi', skill: 'smithing', base: 30 },
          success: {
            text: 'تتفوق بحدٍّ أدق وتوازن مثالي؛ يخرس المنافس وتصبح أشهر حداد شاب في السوق!',
            effects: { rep: 12, gold: 28, skill: { smithing: 2 } }
          },
          fail: {
            text: 'يتفوق منافسك بزخرفة المقبض فتخسر التحدي بفارق طفيف، ما يدفعك لمضاعفة تدريباتك.',
            effects: { rep: -4, skill: { smithing: 1 } }
          }
        },
        {
          id: 'decline_gracefully',
          label: 'الرد بأن الساحة الحقيقية هي صمود السلاح في المعركة لا الاستعراض',
          success: {
            text: 'تكسب احترام المحاربين المخضرمين وتتفادى جدالاً عقيماً.',
            effects: { attr: { cha: 1 }, rep: 4 }
          }
        }
      ]
    },
    {
      id: 'smith_cannon_prototype',
      phase: 'youth',
      career: 'smith',
      minAge: 14,
      maxAge: 18,
      priority: 39,
      weight: 9,
      category: 'war',
      categoryLabel: 'هندسة الحصار',
      title: 'مشروع المنجنيق الفولاذي',
      text: 'يطلب منك مهندسو الحامية تصميم نابض فولاذي مضغوط لآلات الرمي قبل زحف الأعداء.',
      choices: [
        {
          id: 'smith_spring_design',
          label: 'تطبيق حسابات المرونة المعدنية وصنع النابض بنفسك',
          check: { attr: 'int', skill: 'smithing', base: 26 },
          success: {
            text: 'يتضاعف مدى القذائف وتنهال عليك مكافأة القلعة وتوصياتها!',
            effects: { gold: 55, rep: 12, faction: { humans: 10 }, skill: { smithing: 2 } }
          },
          fail: {
            text: 'ينكسر النابض أثناء الاختبار ويصيبك برضوض مؤلمة.',
            effects: { hp: -24, skill: { smithing: 1 } }
          }
        },
        {
          id: 'smith_sell_reinforcement',
          label: 'التركيز على تصفيح دروع الطاقم لحمايتهم أثناء القصف',
          success: {
            text: 'عمل متزن ومربح يكسبك تقدير الجنود والمهندسين.',
            effects: { gold: 34, rep: 6, skill: { smithing: 2 } }
          }
        }
      ]
    },

    // =========================================================================
    // ADVENTURER PATH UNIQUE EVENTS (career: 'adventurer')
    // =========================================================================
    {
      id: 'adv_wolf_pack',
      phase: 'youth',
      career: 'adventurer',
      minAge: 11,
      maxAge: 18,
      priority: 40,
      weight: 11,
      category: 'path',
      categoryLabel: 'مهمة نقابة',
      title: 'قطيع الذئاب الرمادية',
      text: 'أول عقد جاد من النقابة: قطيع ذئاب ضخم يهاجم رعاة الوادي الشمالي. الدليل يخشى كميناً وسط الصخور الضبابية.',
      choices: [
        {
          id: 'hunt_headon',
          label: 'تتبع الآثار ومهاجمة زعيم القطيع مباشرة لتشتيتهم',
          check: { attr: 'str', skill: 'combat', gearBonus: 'weapon', base: 30 },
          success: {
            text: 'تسقط الذئب القائد بضربة حاسمة وتطارد القطيع، فتعود بجلود ثمينة ومكافأة النقابة.',
            effects: { gold: 38, rep: 8, skill: { combat: 2 }, attr: { str: 1 } }
          },
          fail: {
            text: 'ينقض ذئب جانبي على ساقك قبل أن تطردها بالنار؛ تنجو وتنهي المهمة بجروح.',
            effects: { hp: -26, gold: 18, skill: { combat: 1 } }
          }
        },
        {
          id: 'trap_wolves',
          label: 'نصب فخاخ وأوتاد بصمت عند الممر الضيق واستدراجهم إليها',
          check: { attr: 'int', skill: 'shadow', base: 30 },
          success: {
            text: 'يسقط القطيع في الكمينة دون أن تخدش ملابسكم؛ يشيد الدليل بدهائك وحسن تخفيك.',
            effects: { gold: 40, rep: 8, skill: { shadow: 1, combat: 1 } }
          },
          fail: {
            text: 'يتجنب الذئب الأكبر الحفرة فتضطر لمواجهته بسلاحك بتكلفة بدنية.',
            effects: { hp: -22, gold: 20, skill: { combat: 1 } }
          }
        }
      ]
    },
    {
      id: 'adv_ruins_riddle',
      phase: 'youth',
      career: 'adventurer',
      minAge: 12,
      maxAge: 18,
      priority: 42,
      weight: 10,
      category: 'path',
      categoryLabel: 'استكشاف أطلال',
      title: 'قبو الآثار المنهار',
      text: 'خلال مرافقة بعثة أثرية، تعثرون على باب حجري مغلق بآلية أثقال حديدية وأسهم فخاخ من عصر قديم.',
      choices: [
        {
          id: 'dodge_corridor',
          label: 'الاندفاع برشاقة لتجاوز ألواح الضغط والوصول للرافعة',
          check: { attr: 'agi', skill: 'combat', gearBonus: 'armor', base: 28 },
          success: {
            text: 'تتجاوز أسهم الفخ بخفة مدهشة وتفتح الخزانة الأثرية لتجد سبيكة فضية وعباءة حماية!',
            effects: { gold: 50, rep: 8, attr: { agi: 1 }, setArmor: { name: 'عباءة آثار مقاومة للسهام', defense: 4, rarity: 'uncommon', icon: 'leather_armor' } }
          },
          fail: {
            text: 'يخدشك سهم حديدي من الجدار أثناء تراجعك فتكتفي بالعودة مثخناً.',
            effects: { hp: -26, skill: { shadow: 1 } }
          }
        },
        {
          id: 'stealth_disable_wires',
          minSkill: { shadow: 5 },
          label: 'التسلل بمحاذاة الجدار وقطع أسلاك الزنبرك بخنجرك دون تحريك أي بلاطة',
          sub: 'تخصص الظلال (5+): تفكيك فخ أثري دقيق (اختبار براعة)',
          check: { attr: 'agi', skill: 'shadow', base: 32 },
          success: {
            text: 'تعطل جميع السهام في صمت مطبق وتستخرج البعثة كامل الكنز!',
            effects: { gold: 65, rep: 10, skill: { shadow: 2 } }
          },
          fail: {
            text: 'ينطلق نابض مسموم فيجرح يدك وتنسحب البعثة بنصف الكنز.',
            effects: { hp: -24, gold: 20 }
          }
        },
        {
          id: 'int_counterweight',
          minInt: 11,
          label: 'تعطيل آلية الأثقال بوضع أكياس رمل مطابقة لوزن الكنز',
          sub: 'بصيرة ذكاء (11+): موازنة الضغط الهندسية',
          success: {
            text: 'يتوقف الفخ بصمت تام وتستخرج البعثة المخطوطات والكنوز كلها بسلام، فتنال حصة الأسد!',
            effects: { gold: 68, rep: 10, skill: { alchemy: 1, shadow: 1 } }
          }
        }
      ]
    },
    {
      id: 'adv_elven_patrol_rescue',
      phase: 'youth',
      career: 'adventurer',
      minAge: 13,
      maxAge: 18,
      priority: 44,
      weight: 10,
      category: 'war',
      categoryLabel: 'مهمة حدودية',
      title: 'كمين في الوادي الأخضر',
      text: 'أثناء دورية استطلاع، تشاهد مجموعة كشافة من الجان محاصرين تحت نيران فرقة وحوش ممسوسة بسحر الشياطين.',
      choices: [
        {
          id: 'save_elves',
          label: 'التدخل الفوري وفك الحصار عن كشافة الجان',
          check: {
            attr: 'agi',
            skill: 'combat',
            gearBonus: 'both',
            base: 26,
            flagBonuses: [{ flag: 'knowsForestPaths', bonus: 14 }]
          },
          success: {
            text: 'تقطعون دابر الوحوش معاً؛ يمنحك قائد الدورية خنجراً خفيفاً ويثبت اسمك في سجلات الغابة كصديق.',
            effects: { faction: { elves: 20, demons: -10 }, rep: 10, skill: { combat: 2 }, setWeapon: { name: 'نصل ورقة البلوط الأخضر', power: 6, rarity: 'rare', icon: 'elven_blade' } }
          },
          fail: {
            text: 'ينسحب الجان بعد إصابتك البالغة خلال الاشتباك، لكنهم يدركون شجاعتك وإخلاصك.',
            effects: { hp: -30, faction: { elves: 10 }, skill: { combat: 1 } }
          }
        },
        {
          id: 'observe_only',
          label: 'التخفي ومراقبة القتال عن بُعد لتدوين تكتيكات الطرفين للنقابة',
          success: {
            text: 'تحصل على معلومات دقيقة عن تحركات وحوش الشياطين ومواقع الجان وتتقاضى أجر الاستطلاع كاملاً.',
            effects: { gold: 32, skill: { shadow: 2 }, faction: { humans: 6 } }
          }
        }
      ]
    },
    {
      id: 'adv_arena_duel',
      phase: 'youth',
      career: 'adventurer',
      minAge: 12,
      maxAge: 18,
      priority: 38,
      weight: 10,
      category: 'path',
      categoryLabel: 'حلبة القتال',
      title: 'بطولة نقابة المحاربين',
      text: 'تفتح نقابة المدينة بطولة الربيع الصغرى بجائزة ذهبية كبيرة وفرصة لرفع تصنيفك بين المغامرين.',
      choices: [
        {
          id: 'enter_arena',
          label: 'خوض البطولة والاعتماد على مهاراتك القتالية',
          check: { attr: 'str', skill: 'combat', gearBonus: 'weapon', base: 26 },
          success: {
            text: 'تنتصر في ثلاث نزالات متتالية وترفع الجائزة وسط هتاف الجماهير!',
            effects: { gold: 60, rep: 14, skill: { combat: 2 }, addTrait: 'بطل الحلبة' }
          },
          fail: {
            text: 'تصل لنصف النهائي وتسقط أمام مقاتل أضخم بإصابة قوية، لكنك تكتسب خبرة وتقديراً.',
            effects: { hp: -26, rep: 4, skill: { combat: 1 }, gold: 15 }
          }
        },
        {
          id: 'combat_feint_win',
          minSkill: { combat: 6 },
          label: 'استخدام سلسلة خِدَع قتالية متقدمة لإسقاط الخصوم بأقل جهد',
          sub: 'تخصص القتال (6+): حسم الحلبة بتكنيك النقابة',
          check: { attr: 'agi', skill: 'combat', base: 34 },
          success: {
            text: 'تهيمن على الحلبة بأناقة فنية مذهلة وتلفت أنظار من يعرفون سر «مسار السيف»!',
            effects: { gold: 65, rep: 14, skill: { combat: 2 }, addTrait: 'بطل الحلبة', flags: { heardSwordMasterRumors: true } }
          },
          fail: {
            text: 'يصد خصمك الخدعة ويضربك بقبضة ثقيلة في أضلاعك.',
            effects: { hp: -22, rep: 4 }
          }
        },
        {
          id: 'bet_smart',
          label: 'تحليل لياقة المتنافسين والمراهنة بذكاء من المدرجات',
          success: {
            text: 'تلاحظ إصابة خفية في ركبة المرشح الأول فتراهن على خصمه وتفوز بمبلغ ممتاز.',
            effects: { gold: 42, skill: { shadow: 1, trade: 1 } }
          }
        }
      ]
    },
    {
      id: 'adv_demon_scouts',
      phase: 'youth',
      career: 'adventurer',
      minAge: 14,
      maxAge: 18,
      priority: 45,
      weight: 10,
      category: 'war',
      categoryLabel: 'مواجهة الجبهة',
      title: 'طليعة الشياطين عند النهر',
      text: 'تُكلف باستطلاع معبر النهر فتفاجأ بمجموعة متقدمة من محاربي الشياطين الصغار يحاولون تفجير الدعامات الخشبية.',
      choices: [
        {
          id: 'strike_commanders',
          label: 'مباغتة حامل المشعل وتدمير عبوة الكبريت قبل إشعالها',
          check: { attr: 'agi', skill: 'combat', gearBonus: 'both', base: 24 },
          success: {
            text: 'تقطع يد المهاجم قبل سقوط الشعلة وتُنقذ الجسر! تكرمك الحامية بوسام الشجاعة.',
            effects: { rep: 14, gold: 48, faction: { humans: 14, demons: -14 }, skill: { combat: 2 } }
          },
          fail: {
            text: 'ينفجر جزء من الدعامة فتصاب بحروق وشظايا حارقة لكنك تمنع الانهيار الكامل.',
            effects: { hp: -34, rep: 5, faction: { humans: 6 } }
          }
        },
        {
          id: 'stealth_sabotage_fuse',
          minSkill: { shadow: 6 },
          label: 'التسلل تحت الجسر وقطع فتيل العبوة وإلقائها في الماء بصمت',
          sub: 'تخصص الظلال (6+): تعطيل التفجير من تحت أنوف الشياطين (اختبار تخفٍ)',
          check: { attr: 'agi', skill: 'shadow', base: 30 },
          success: {
            text: 'تفشل الخطة أمام أعين الشياطين الحائرة فينسحبون ظناً أن العبوة فاسدة دون أن تخسر قطرة دم!',
            effects: { rep: 14, gold: 52, faction: { humans: 12 }, skill: { shadow: 2 } }
          },
          fail: {
            text: 'ينزلق حذاءك على الخشب المبتل فتشتبك مع الحارس تحت الجسر.',
            effects: { hp: -28, faction: { humans: 6 } }
          }
        },
        {
          id: 'parley_demon',
          label: 'التفاوض مع قائد الطليعة مقابل عدم الإبلاغ عن مسلكهم',
          success: {
            text: 'يتعجب الشيطان من جرأتك ويمنحك صرة ذهب وشعار مرور آمن، رغم ما يجلبه ذلك من خيانة للبشر.',
            effects: { gold: 52, faction: { demons: 15, humans: -12, family: -3 }, threat: 12 }
          }
        }
      ]
    },
    {
      id: 'adv_escort_scholar',
      phase: 'youth',
      career: 'adventurer',
      minAge: 13,
      maxAge: 18,
      priority: 38,
      weight: 10,
      category: 'path',
      categoryLabel: 'مهمة مرافقة',
      title: 'حراسة عالمة الأعشاب والنقوش',
      text: 'تطلب باحثة مسنّة حارساً لمرافقتها إلى وادي الضباب لجمع أعشاب نادرة تبطل مفعول السموم العسكرية.',
      choices: [
        {
          id: 'escort_faithful',
          label: 'حراستها بيقظة وتعلم خصائص الأعشاب أثناء السير',
          success: {
            text: 'تعودان سالمين بحصيلة طبية عظيمة، فتزودك بترياقات ترفع صحتك الدائمة وتعلمك أصول الكيمياء.',
            effects: { gold: 36, maxHp: 8, hp: 10, attr: { ins: 1 }, skill: { alchemy: 2, shadow: 1 } }
          }
        },
        {
          id: 'rush_shortcut',
          label: 'اختصار الطريق عبر كهف الجبل للانتهاء في نصف الوقت',
          check: { attr: 'ins', skill: 'combat', base: 28 },
          success: {
            text: 'تتجنب الانهيارات بمهارة وتحصل على أجر إضافي للسرعة.',
            effects: { gold: 56, rep: 6, skill: { combat: 2 } }
          },
          fail: {
            text: 'يهاجمكم وحش كهفي ضخم فتتلقى ضربة موجعة وأنت تحميها.',
            effects: { hp: -28, gold: 25 }
          }
        }
      ]
    },
    {
      id: 'adv_bounty_deserter',
      phase: 'youth',
      career: 'adventurer',
      minAge: 14,
      maxAge: 18,
      priority: 40,
      weight: 9,
      category: 'war',
      categoryLabel: 'عقد مطاردة',
      title: 'مطاردة الجندي الهارب',
      text: 'تعرض القيادة جائزة لمن يقبض على ضابط هارب سرق خرائط الإمداد، لكنك تجده في كوخ يطعم أطفالاً أيتاماً ويقول إن القائد أراد التضحية بفرقته.',
      choices: [
        {
          id: 'arrest_duty',
          label: 'تنفيذ الأمر والقبض عليه لتسليمه واستلام المكافأة',
          success: {
            text: 'تستلم الذهب ورتبة أعلى لدى القيادة، لكن نظرته الصامتة تثقل ضميرك.',
            effects: { gold: 65, faction: { humans: 10 }, rep: 6 }
          }
        },
        {
          id: 'cover_escape',
          label: 'ترك الخرائط فقط للتسليم والسماح له بالفرار مع الأيتام',
          success: {
            text: 'تعيد الخرائط وتدّعي أنه غرق في النهر؛ تنقذ أرواحاً بريئة وتنال أجر الاسترجاع، ويَعِدك الضابط ألا ينسى معروفك.',
            effects: {
              gold: 28,
              rep: 8,
              attr: { cha: 1, ins: 1 },
              flags: { sparedDeserter: true },
              queueRipple: { eventId: 'ripple_deserter_gratitude', delayMin: 10, delayMax: 18, expiresAfter: 35 }
            }
          }
        }
      ]
    },
    {
      id: 'adv_cursed_watchtower',
      phase: 'youth',
      career: 'adventurer',
      minAge: 13,
      maxAge: 18,
      priority: 39,
      weight: 9,
      category: 'path',
      categoryLabel: 'استطلاع صامت',
      title: 'برج المراقبة المهجور',
      text: 'تتسلل أصوات معدنية ليلاً من برج مراقبة مهجور قرب الوادي؛ النقابة تعرض مكافأة لمن يستكشف من يشغله.',
      choices: [
        {
          id: 'storm_watchtower',
          label: 'اقتحام البرج ليلاً وكشف الخلية المسلحة داخله',
          check: { attr: 'str', skill: 'combat', gearBonus: 'both', base: 26 },
          success: {
            text: 'تطرد خلية مهربي أسلحة شيطانية وتصادر مخزنهم الفولاذي!',
            effects: { gold: 55, rep: 10, skill: { combat: 2 }, faction: { humans: 8, demons: -8 } }
          },
          fail: {
            text: 'تسقط من السلم الخشبي المتهالك تحت وابل سهامهم وتنجو بكدمات حادة.',
            effects: { hp: -28, threat: 6 }
          }
        },
        {
          id: 'scout_tower_notes',
          label: 'مراقبة التحركات من التل المجاور ورسم خريطة تبديل الحراسة',
          success: {
            text: 'تسلم تقريراً متقناً للنقابة وتتقاضى أجرك بسلام.',
            effects: { gold: 32, skill: { shadow: 2 }, attr: { ins: 1 } }
          }
        }
      ]
    },

    // =========================================================================
    // MERCHANT PATH UNIQUE EVENTS (career: 'merchant')
    // =========================================================================
    {
      id: 'merc_grain_shortage',
      phase: 'youth',
      career: 'merchant',
      minAge: 11,
      maxAge: 18,
      priority: 40,
      weight: 11,
      category: 'path',
      categoryLabel: 'مناورة سوق',
      title: 'أزمة القمح في القرى الجنوبية',
      text: 'يهدد الجفاف أسعار الحبوب بالارتفاع الحاد؛ بعض التجار يكدّسون المخازن لرفع الأسعار بينما تطلب القرى إمدادات عاجلة.',
      choices: [
        {
          id: 'fair_supply',
          label: 'تأمين قوافل بسعر معقول لكسب عقود طويلة وولاء القرى',
          success: {
            text: 'تحصد أرباحاً مستقرة وسمعة تجارية نزيهة تفتح لك كل المخازن لاحقاً.',
            effects: { gold: 38, rep: 10, skill: { trade: 2 }, faction: { humans: 8 } }
          }
        },
        {
          id: 'hoard_profit',
          label: 'الاستحواذ على نصف المخزون وبيعه عند ذروة الأزمة',
          success: {
            text: 'يتضاعف مالك بسرعة مذهلة، لكن العامة يطلقون عليك لقب تاجر الأزمات.',
            effects: { gold: 78, rep: -8, skill: { trade: 2 }, faction: { family: -3 } }
          }
        },
        {
          id: 'int_barter_chain',
          minInt: 11,
          label: 'إنشاء شبكة مقايضة بين قمح الشمال وحديد أبيك دون وسطاء',
          sub: 'بصيرة ذكاء (11+): دمج سلاسل التوريد',
          success: {
            text: 'تُثبت عبقريتك الاقتصادية: تحصل القرى على الغذاء والأدوات، وتجني أنت عمولة قياسية وبلا خسارة في السمعة!',
            effects: { gold: 66, rep: 12, skill: { trade: 2 }, addTrait: 'عقل السلسلة' }
          }
        }
      ]
    },
    {
      id: 'merc_counterfeit_ring',
      phase: 'youth',
      career: 'merchant',
      minAge: 12,
      maxAge: 18,
      priority: 42,
      weight: 10,
      category: 'path',
      categoryLabel: 'تحقيق مالي',
      title: 'العملات الذهبية الخفيفة',
      text: 'تدخل السوق موجة عملات ذهبية مطلية بالنحاس؛ التجار يتهمون بعضهم والخسائر تهدد قافلتك في هذه الفترة.',
      choices: [
        {
          id: 'scale_check',
          label: 'استخدام ميزان الكثافة المائي والوزن لفرز الصحيح من المزيف',
          success: {
            text: 'بفكرة فيزيائية بسيطة من عالمك السابق تكشف العملات المغشوشة في لحظة وتنقذ رأس مالك وتبيع الخدمة للتجار!',
            effects: { gold: 50, rep: 10, skill: { trade: 2, alchemy: 2 } }
          }
        },
        {
          id: 'trace_minter',
          label: 'التسلل وتتبع مصدر العملات إلى الصائغ الخفي والضغط عليه سراً',
          check: {
            attr: 'cha',
            skill: 'shadow',
            base: 28,
            flagBonuses: [{ flag: 'spottedSmugglers', bonus: 14 }]
          },
          success: {
            text: 'تصل إلى ورشة التزييف بصمت وتنتزع تعويضاً ضخماً لصمتك أو تسليمهم.',
            effects: { gold: 72, skill: { shadow: 2 }, threat: 8 }
          },
          fail: {
            text: 'يهرب المزورون قبل وصولك ويتركون فخاً صوتياً ومهاجماً يجرحك قبل وصول الحراس.',
            effects: { hp: -22, gold: -20, threat: 8 }
          }
        }
      ]
    },
    {
      id: 'merc_elven_herbs',
      phase: 'youth',
      career: 'merchant',
      minAge: 13,
      maxAge: 18,
      priority: 44,
      weight: 10,
      category: 'war',
      categoryLabel: 'تجارة محظورة',
      title: 'قافلة الدواء إلى الغابة',
      text: 'رغم حصار البشر للغابة، يطلب تجار الجان ضمادات وملحاً طبياً لجرحاهم مقابل أعشاب شفاء نادرة وعقود حصرية.',
      choices: [
        {
          id: 'smuggle_medicine',
          label: 'تهريب الشحنة ليلاً عبر الدروب الجبلية لعشائر الجان',
          check: {
            attr: 'agi',
            skill: 'shadow',
            base: 28,
            flagBonuses: [
              { flag: 'elvenSafePassage', bonus: 14 },
              { flag: 'knowsForestPaths', bonus: 12 }
            ]
          },
          success: {
            text: 'تنجح القافلة دون أن يمسكك الحرس! تربح ذهباً وفيراً وعلاقة ذهبية مع الغابة.',
            effects: { gold: 68, faction: { elves: 20, humans: -6 }, skill: { shadow: 2, trade: 1 }, threat: 8 }
          },
          fail: {
            text: 'تصادر الدورية نصف البضاعة فتضطر لدفع رشوة باهظة والاشتباك للنجاة.',
            effects: { hp: -18, gold: -35, threat: 14, faction: { elves: 6 } }
          }
        },
        {
          id: 'decline_smuggling',
          label: 'الالتزام بالحظر التجاري الرسمي وتوجيه القافلة للمعسكر البشري',
          success: {
            text: 'أرباح أقل لكنك تحظى برخصة توريد رسمية مضمونة لدى القلعة.',
            effects: { gold: 38, faction: { humans: 10, elves: -6 }, rep: 6 }
          }
        }
      ]
    },
    {
      id: 'merc_info_broker',
      phase: 'youth',
      career: 'merchant',
      minAge: 12,
      maxAge: 18,
      priority: 42,
      weight: 11,
      category: 'path',
      categoryLabel: 'تجارة الأسرار',
      title: 'سوق المعلومات الخفية',
      text: 'تدرك أن السعاة بين المدن يحملون إشاعات تسبق الجيوش. يعرض عليك ساعٍ عجوز إنشاء مكتب بريد سريع خاص بالتجار.',
      choices: [
        {
          id: 'build_intel_net',
          minGold: 25,
          label: 'استثمار 25 ذهباً لتأسيس شبكة السعاة السريعة',
          success: {
            text: 'تصلك أخبار الأسعار والتحركات قبل الجميع بأيام، وتتحول إلى وسيط معلومات لا يُستهان به.',
            effects: { gold: 40, skill: { trade: 2, shadow: 2 }, attr: { cha: 1 }, threat: 5, addTrait: 'عين السوق' }
          }
        },
        {
          id: 'stay_goods_only',
          label: 'الاكتفاء بتجارة البضائع الملموسة والابتعاد عن أسرار القادة',
          success: {
            text: 'تتجنب عيون الجواسيس وتحقق نمواً تجارياً هادئاً وآمناً.',
            effects: { gold: 34, threat: -4, skill: { trade: 2 } }
          }
        }
      ]
    },
    {
      id: 'merc_demon_caravan',
      phase: 'youth',
      career: 'merchant',
      minAge: 14,
      maxAge: 18,
      priority: 44,
      weight: 10,
      category: 'war',
      categoryLabel: 'مخاطرة قصوى',
      title: 'سوق المقايضة عند فوهة الرماد',
      text: 'وسط الحرب، تحتاج فيالق الشياطين إلى حبوب وملح وأدوية، وتعرض في المقابل أحجار طاقة حمراء ومعادن باهظة الثمن.',
      choices: [
        {
          id: 'trade_with_demons',
          label: 'عقد صفقة مقايضة محايدة عند الحدود تحت راية التجار',
          check: {
            attr: 'cha',
            skill: 'trade',
            base: 26,
            flagBonuses: [{ flag: 'knowsDemonRoutes', bonus: 15 }]
          },
          success: {
            text: 'تعود بأحجار طاقة نادرة تساوي ثروة طيبة، وتكسب احترام قادة الفيلق على حساب غضب حلفاء البشر.',
            effects: { gold: 68, faction: { demons: 18, humans: -14, family: -3 }, skill: { trade: 2 }, threat: 12 }
          },
          fail: {
            text: 'ينهب قطاع الطرق جزءاً من عودتك وتُصاب بجرح عميق وأنت تنجو بباقي الحمولة.',
            effects: { hp: -28, gold: 20, threat: 10 }
          }
        },
        {
          id: 'sell_location',
          label: 'بيع إحداثيات نقطة التبادل السرية لقيادة الجيش البشري',
          success: {
            text: 'تكسب مكافأة مخابراتية كبيرة وتضعف إمدادات الشياطين.',
            effects: { gold: 52, faction: { humans: 14, demons: -22 }, rep: 8 }
          }
        }
      ]
    },
    {
      id: 'merc_guild_monopoly',
      phase: 'youth',
      career: 'merchant',
      minAge: 15,
      maxAge: 18,
      priority: 42,
      weight: 9,
      category: 'path',
      categoryLabel: 'صراع النفوذ',
      title: 'حلف الاحتكار في النقابة',
      text: 'يعرض عليك ثلاثة من أثرى تجار العاصمة الانضمام لحلفهم لرفع أسعار الدواء والحديد على الجبهة وتقاسم الأرباح.',
      choices: [
        {
          id: 'join_cartel',
          label: 'الانضمام للاحتكار وجني الأرباح الكبيرة دون تردد',
          success: {
            text: 'تتدفق السبائك الذهبية إلى خزانتك لكن كراهية عامة الناس والجنود تزداد ضد المحتكرين.',
            effects: { gold: 78, rep: -12, skill: { trade: 2 }, threat: 10, faction: { family: -3 } }
          }
        },
        {
          id: 'trade_leverage_cartel',
          minSkill: { trade: 8 },
          label: 'فرض شروطك الاحتكارية على المجلس لتأخذ الحصة الأكبر بلا مسؤولية علنية',
          sub: 'تخصص التجارة (8+): مساومة احترافية تدر ذهباً أكبر مع أمان قانوني',
          check: { attr: 'cha', skill: 'trade', base: 28 },
          success: {
            text: 'يرضخ التجار لمهارتك في صياغة البنود وتجني ذهباً وفيراً دون تشويه سمعتك!',
            effects: { gold: 88, skill: { trade: 2 }, rep: 4 }
          },
          fail: {
            text: 'ينسحب الأعضاء من الصفقة وتخسر عمولة الوساطة.',
            effects: { gold: -15, rep: -4 }
          }
        },
        {
          id: 'break_cartel',
          label: 'رفض الحلف وكسر أسعارهم بتوريد منافس من الورش الحرة',
          success: {
            text: 'يكسبك موقفك ثقة الملوك والعامة وتنهار خطة الاحتكار في مهدها!',
            effects: { gold: 40, rep: 18, faction: { humans: 12 }, threat: 14 }
          }
        }
      ]
    },
    {
      id: 'merc_diplomatic_escort',
      phase: 'youth',
      career: 'merchant',
      minAge: 14,
      maxAge: 18,
      priority: 38,
      weight: 10,
      category: 'war',
      categoryLabel: 'وساطة خطرة',
      title: 'صفقة تبادل الأسرى',
      text: 'يثق الجانب البشري والجان بسمعتك كتاجر، فيطلبان منك التوسط لشراء وتبادل أسرى نافذين في منطقة محايدة.',
      choices: [
        {
          id: 'broker_honestly',
          label: 'إدارة التبادل بنزاهة تامة لبناء سمعة وسيط دولي',
          success: {
            text: 'يُفرج عن الأسرى بسلام وتنال مكافأة من الطرفين واحتراماً نادراً في زمن الدم.',
            effects: { gold: 58, rep: 14, faction: { humans: 10, elves: 12 }, attr: { cha: 1 } }
          }
        },
        {
          id: 'extract_secrets',
          label: 'استجواب الأسرى قبل تسليمهم لجمع معلومات عسكرية للبيع',
          success: {
            text: 'تحصل على خرائط وتحركات سرية ترفع قوتك التفاوضية في الأشهر المقبلة.',
            effects: { gold: 72, skill: { shadow: 2 }, rep: -5, threat: 10 }
          }
        }
      ]
    },
    {
      id: 'merc_black_ledger',
      phase: 'youth',
      career: 'merchant',
      minAge: 13,
      maxAge: 18,
      priority: 39,
      weight: 9,
      category: 'path',
      categoryLabel: 'مناورة تجارية',
      title: 'مزاد السندات السرية',
      text: 'يعرض صيرفي مسنّ دفاتر ديون متعثرة لثلاثة نبلاء في مزاد مغلق قبل إعلان إفلاس أحدهم.',
      choices: [
        {
          id: 'buy_winning_debt',
          minGold: 30,
          label: 'شراء ديون النبيل الأقوى بـ 30 ذهباً ومطالبته بالامتيازات',
          check: { attr: 'int', skill: 'trade', base: 28 },
          success: {
            text: 'يسدد لك الدين مع فوائده وامتياز مرور معفى من الضرائب!',
            effects: { gold: 75, skill: { trade: 2 }, rep: 6 }
          },
          fail: {
            text: 'يهرب النبيل في الحرب وتخسر مبلغ السند.',
            effects: { gold: -30 }
          }
        },
        {
          id: 'broker_auction_fees',
          label: 'العمل كوسيط بين المزايدين وأخذ عمولة مضمونة',
          success: {
            text: 'دخل هادئ ونظيف دون مخاطرة برأس المال.',
            effects: { gold: 32, skill: { trade: 2 } }
          }
        }
      ]
    },

    // =========================================================================
    // ASSASSINATION & INTRIGUE DYNAMIC POOL (category: 'assassin')
    // =========================================================================
    {
      id: 'assass_rooftop_sniper',
      phase: 'youth',
      minAge: 12,
      maxAge: 18,
      minThreat: 22,
      priority: 65,
      weight: 12,
      category: 'assassin',
      categoryLabel: 'محاولة اغتيال',
      title: 'وميض النشاب فوق السطح',
      text: 'في ساحة السوق المزدحمة، تلمح انعكاس شمس خاطفاً فوق سطح برج الحبوب — قناص يوجه نشاباً مسموماً نحو قلبك مباشرة!',
      choices: [
        {
          id: 'dodge_cover',
          label: 'الارتماء خلف عربة البضائع والتسلل للأعلى لملاحقة القناص',
          check: { attr: 'agi', skill: 'shadow', gearBonus: 'armor', base: 26 },
          success: {
            text: 'تغرز السهم في الخشب خلفك وتتسلل سريعاً للأعلى لتسقط القناص وتنتزع عقده.',
            effects: { skill: { shadow: 2, combat: 1 }, threat: -8, rep: 5 }
          },
          fail: {
            text: 'يخدش السهم ذراعك بسم قوي قبل أن يختفي القناص بين المداخن.',
            effects: { hp: -38, threat: 4 }
          }
        },
        {
          id: 'int_predict_shot',
          minInt: 12,
          label: 'قراءة اتجاه الريح والزاوية لتحتمي بدرع مارّ وتصيح بالحرس لتطويق مخرجه',
          sub: 'بصيرة ذكاء (12+): غلق منفذ القناص بحساب هندسي سريع',
          check: { attr: 'int', skill: 'shadow', base: 30 },
          success: {
            text: 'تتفادى الطلقة ببرود أعصاب ويقع القناص مباشرة في أيدي الحرس عند مخرج البرج!',
            effects: { skill: { shadow: 2 }, threat: -10, rep: 8, gold: 25 }
          },
          fail: {
            text: 'تتأخر الصيحة ثانية فيخترق السهم كتفك قبل فرار القناص.',
            effects: { hp: -32, threat: 3 }
          }
        }
      ]
    },
    {
      id: 'assass_poison_well',
      phase: 'youth',
      minAge: 12,
      maxAge: 18,
      minThreat: 24,
      priority: 64,
      weight: 10,
      category: 'assassin',
      categoryLabel: 'مكيدة خفية',
      title: 'سمّ في بئر الورشة',
      text: 'يبدأ والدك بالسعال صباحاً وتلاحظ طبقة زيتية خافتة على سطح دلو الماء المستخرج من بئر الفناء.',
      choices: [
        {
          id: 'detect_antidote',
          label: 'فحص الماء وتطبيق ترياق والدتك لحماية العائلة',
          check: { attr: 'ins', skill: 'alchemy', base: 28 },
          success: {
            text: 'تبطل مفعول السم سريعاً قبل أن يتأذى والدك وتنصب حراسة ليلية تكشف الجاني.',
            effects: { faction: { family: 10 }, skill: { alchemy: 2 }, threat: -8 }
          },
          fail: {
            text: 'تتأخر الاستجابة فيتضرر جسدك وتُجبر على دفع مال كثير للأطباء.',
            effects: { gold: -28, hp: -22 }
          }
        },
        {
          id: 'int_chemical_neutralize',
          minSkill: { alchemy: 3 },
          label: 'تحييد السم بفحم الكير المنشّط وغلي الماء ثم تعقب أثر المتسلل',
          sub: 'تخصص الكيمياء (3+): امتصاص السم بالكربون المنشط',
          success: {
            text: 'تطهر البئر وتنقذ عائلتك بأقل تكلفة، بل وتترك طعماً كاذباً يكشف الخادم المرتشي في المساء!',
            effects: { faction: { family: 12 }, skill: { alchemy: 2, shadow: 1 }, threat: -10 }
          }
        }
      ]
    },
    {
      id: 'assass_fake_summons',
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      minThreat: 26,
      priority: 64,
      weight: 10,
      category: 'assassin',
      categoryLabel: 'فخ مزور',
      title: 'الاستدعاء المختوم ليلاً',
      text: 'يقرع رسول بابك برسالة عاجلة تحمل ختم النقابة أو الحرس تطلب حضورك منفرداً إلى مخزن الميناء المهجور.',
      choices: [
        {
          id: 'spot_forgery',
          label: 'تفحص الختم الشمعي وطرح أسئلة اختبارية على الرسول',
          check: { attr: 'int', skill: 'shadow', base: 28 },
          success: {
            text: 'يرتبك الرسول فيجري هارباً؛ تكتشف أن المخزن كان مليئاً بالقتلة وتنجو بذكائك!',
            effects: { skill: { shadow: 2 }, threat: -8, rep: 4 }
          },
          fail: {
            text: 'تصدق الحيلة وتذهب فتتعرض لكمين دموي في الظلام قبل أن تهرب بصعوبة.',
            effects: { hp: -40, threat: 4 }
          }
        },
        {
          id: 'stealth_shadow_messenger',
          minSkill: { shadow: 4 },
          label: 'رفض الدعوة متظاهراً بالنوم، ثم التسلل خلف الرسول لمعرفة وكرهم',
          sub: 'تخصص الظلال (4+): تتبع الصياد إلى عرينه',
          check: { attr: 'agi', skill: 'shadow', base: 30 },
          success: {
            text: 'تقودك خطواتك الصامتة إلى نقطة التقاء العصابة فتبلغ الحرس وتقتسم المكافأة!',
            effects: { gold: 40, skill: { shadow: 2 }, threat: -12 }
          },
          fail: {
            text: 'يلتفت المرافقون في الممر الضيق ويسددون لك طعنة غادرة.',
            effects: { hp: -28, threat: 4 }
          }
        },
        {
          id: 'go_with_backup',
          label: 'قبول الدعوة مع إرسال أمك أو حراس خفيين لتطويق المكان مسبقاً',
          success: {
            text: 'تقلب الفخ عليهم! يفر المدبرون وتصادر أسلحتهم وذهبهم.',
            effects: { gold: 40, skill: { combat: 1, shadow: 1 }, threat: -10 }
          }
        }
      ]
    },
    {
      id: 'assass_tavern_blade',
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      minThreat: 30,
      priority: 65,
      weight: 10,
      category: 'assassin',
      categoryLabel: 'هجوم قريب',
      title: 'النديم ذو الخنجر المخفي',
      text: 'أثناء استراحتك في نُزُل على الطريق، يجلس مسافر ودود بقربك ويحاول بلمسة سريعة غرس إبرة مسمومة في عنقك.',
      choices: [
        {
          id: 'counter_grapple',
          label: 'إمساك معصمه قبل الوصول لرقبتك وطرحه أرضاً',
          check: { attr: 'agi', skill: 'combat', gearBonus: 'weapon', base: 26 },
          success: {
            text: 'تلوي ذراعه حتى يسقط الخنجر، ثم تسلمه لضابط القرية وتستولي على جائزته.',
            effects: { gold: 35, skill: { combat: 2 }, threat: -10 }
          },
          fail: {
            text: 'تتلقى جرحاً غائراً مسموماً في كتفك وتضطر للقفز من النافذة للعلاج.',
            effects: { hp: -42, threat: 4 }
          }
        },
        {
          id: 'elixir_antidote_tavern',
          requiresElixir: 'antidote',
          label: 'تجرع ترياق السموم عند الإحساس بالوخز وإسقاط المهاجم بيد حرة',
          sub: '🧪 حقيبة الإكسير: تحييد سم الإبرة فوراً',
          success: {
            text: 'يفقد القاتل توازنه حين يرى أن إبرته السامة لم تخدرك ثانية واحدة؛ تطرحه أرضاً وتستولي على جائزته!',
            effects: { consumeElixir: 'antidote', gold: 38, skill: { combat: 2 }, threat: -10 }
          }
        },
        {
          id: 'bribe_turn',
          minGold: 30,
          label: 'دفع ضعف أجر اغتيالك (30 ذهباً) لشراء ولائه ومعلوماته',
          success: {
            text: 'تغريه الحسبة العملية! يتخلى عن العقد ويمنحك قائمة بأسماء مراقبيك في المقاطعة.',
            effects: { gold: -30, threat: -16, skill: { shadow: 2 } }
          }
        }
      ]
    },
    {
      id: 'assass_warehouse_fire',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      minThreat: 28,
      priority: 62,
      weight: 9,
      category: 'assassin',
      categoryLabel: 'تخريب ليلي',
      title: 'نيران في المخزن الخلفي',
      text: 'تشتعل ألسنة اللهب في مخزن المواد القابل للاشتعال ليلاً بهدف محاصرتكم وإحراق إرث العائلة.',
      choices: [
        {
          id: 'fight_fire_ambush',
          label: 'إخماد النيران بالتعاون مع الجيران والتربص للمهاجم عند السور',
          check: { attr: 'str', skill: 'combat', gearBonus: 'armor', base: 26 },
          success: {
            text: 'تخمدون الحريق سريعاً وتطاردون المخرب وتلقون القبض عليه قبل هربه.',
            effects: { rep: 8, faction: { family: 8, humans: 6 }, threat: -10 }
          },
          fail: {
            text: 'تلتهم النار جزءاً من البضائع وتصاب بحروق واختناق حاد قبل السيطرة على الحريق.',
            effects: { hp: -28, gold: -25 }
          }
        },
        {
          id: 'evacuate_valuables',
          minGold: 15,
          label: 'تأمين الأبوين والسجلات النادرة وإنفاق 15 ذهباً لإعادة ترميم السقف',
          success: {
            text: 'تخرجون جميعاً بلا خدش ومعكم الدفاتر والأسلحة الأثمن.',
            effects: { faction: { family: 10 }, gold: -15, threat: -4 }
          }
        },
        {
          id: 'evacuate_barehanded',
          label: 'انتشال الوالدين والأسلحة المهمة فقط من وسط الدخان دون إنفاق مال',
          success: {
            text: 'تنقذ الأرواح بشق الأنفس لكن لهب الدخان يرهق رئتيك وتضيع بعض البضائع.',
            effects: { faction: { family: 8 }, hp: -14, threat: -2 }
          }
        }
      ]
    },

    // =========================================================================
    // WORLD, FAMILY & THREE-FACTION WAR SHARED POOL
    // =========================================================================
    {
      id: 'world_father_back',
      phase: 'youth',
      minAge: 12,
      maxAge: 17,
      priority: 34,
      weight: 10,
      category: 'family',
      categoryLabel: 'شأن عائلي',
      title: 'إجهاد السندان الطويل',
      text: 'تلاحظ أن والدك غارون بدأ يشكو من ألم متزايد في ظهره بعد عقود من الطرق، لكنه يكابر ليواصل تأمين البيت.',
      choices: [
        {
          id: 'take_burden',
          label: 'تحمّل أعماله الشاقة هذه الفترة وتوفير وقت راحته',
          success: {
            text: 'يمتلئ قلب والدك بالامتنان وتزداد علاقتكما متانة وقوة.',
            effects: { faction: { family: 14 }, attr: { str: 1 }, skill: { smithing: 2 }, hp: -10 }
          }
        },
        {
          id: 'hire_assistant',
          minGold: 25,
          label: 'تخصيص 25 ذهباً لتوظيف مساعد شاب أمين وشراء مرهم علاجي',
          success: {
            text: 'يتعافى غارون سريعاً وتزدهر الورشة بمساعدة إضافية منتظمة.',
            effects: { gold: -25, faction: { family: 15 }, rep: 6 }
          }
        }
      ]
    },
    {
      id: 'world_mother_comrade',
      phase: 'youth',
      minAge: 13,
      maxAge: 17,
      priority: 36,
      weight: 10,
      category: 'family',
      categoryLabel: 'ضيف من الماضي',
      title: 'رفيق سيرين القديم',
      text: 'يطرق الباب رجل ذو عين واحدة يحمل سيفاً مثلوماً؛ إنه رفيق قديم لأمك من أيام فرقتها السابقة، جاء يطلب ملجأً مؤقتاً ومعلومة.',
      choices: [
        {
          id: 'welcome_train',
          label: 'استضافته وطلب تعلّم حركة سيف سرية من خبرته',
          success: {
            text: 'يعلّمك خدعة تفادي نادرة ويثني على أن سيرين أنجبت وريثاً جديراً.',
            effects: { skill: { combat: 2, shadow: 1 }, faction: { family: 8 }, threat: 4 }
          }
        },
        {
          id: 'duel_comrade_sword_hint',
          minSkill: { combat: 6 },
          minAttr: { agi: 8 },
          label: 'مبارزته باستعراض أقصى سرعتك لانتزاع سر الزاهد الأعمى',
          sub: 'تخصص القتال (6+) + براعة (8+): اختبار جدارة لمسار السيف النادر',
          success: {
            text: 'يتراجع الرفيق مدهوشاً من سرعتك ثم يهمس لك باسم قمة مهجورة يأوي إليها «الزاهد ذو السيف المغمود»!',
            effects: { skill: { combat: 2 }, faction: { family: 8 }, flags: { heardSwordMasterRumors: true } }
          }
        },
        {
          id: 'question_motive',
          label: 'التحقق من صدقه أولاً والتأكد أنه لم يأتِ كطُعم من القتلة',
          check: { attr: 'ins', skill: 'shadow', base: 28 },
          success: {
            text: 'يتفهم حذرك بل ويقدره، ويكشف لك عن مخبأ أسلحة قديم للفرقة.',
            effects: { gold: 38, skill: { shadow: 2 }, setWeapon: { name: 'نصل الفرقة العتيق', power: 6, rarity: 'rare', icon: 'sword' } }
          },
          fail: {
            text: 'يغضبه الشك المفرط فيغادر عند الفجر دون أن يترك شيئاً سوى تحذير بارد.',
            effects: { faction: { family: -6 } }
          }
        }
      ]
    },
    {
      id: 'war_elven_forest_fire',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      priority: 38,
      weight: 10,
      category: 'war',
      categoryLabel: 'صراع الغابة',
      title: 'نيران في أطراف الغابة المقدسة',
      text: 'تشتعل حرائق مفتعلة عند أطراف الغابة الشرقية لدفع الجان للخروج إلى العراء حيث تنتظرهم الكمائن.',
      choices: [
        {
          id: 'help_extinguish',
          label: 'مساعدة دوريات الجان في قطع خطوط النار وإنقاذ السكان',
          success: {
            text: 'تحفظ أرواح العشرات وتكسب ودّاً عميقاً من مجالس الغابة دون معاداة أهل المدينة.',
            effects: { faction: { elves: 18 }, rep: 8, hp: -12 }
          }
        },
        {
          id: 'ambush_fleeing',
          label: 'مساعدة الكتائب البشرية في تطويق المنسحبين لتحقيق مكسب عسكري',
          success: {
            text: 'تفرض الكتائب سيطرتها على التل وتنال حصة من الغنائم والتقدير.',
            effects: { faction: { humans: 14, elves: -22 }, gold: 42, rep: 4 }
          }
        },
        {
          id: 'int_spot_arsonist',
          minInt: 13,
          label: 'كشف أن الحريق أُشعل بوقود شيطاني لا بسهام البشر وإبلاغ الطرفين',
          sub: 'بصيرة ذكاء (13+): تحليل بقايا الكبريت الحارق',
          check: { attr: 'int', skill: 'alchemy', base: 28 },
          success: {
            text: 'تمنع مجزرة محققة وتزرع شكاً صحياً يدفع قادة البشر والجان لإيقاف القتال مؤقتاً!',
            effects: { faction: { humans: 10, elves: 14, demons: -14 }, rep: 14, flags: { preventedForestMassacre: true } }
          },
          fail: {
            text: 'تتلف عيناك من الدخان السام وتتعرض لهجوم شاردة من الطرفين.',
            effects: { hp: -24, threat: 6 }
          }
        }
      ]
    },
    {
      id: 'war_demon_emissary_duel',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      priority: 36,
      weight: 9,
      category: 'war',
      categoryLabel: 'مواجهة الأراضي القاحلة',
      title: 'تحدي بطل الفيلق الجهنمي',
      text: 'عند نقطة التماس، يتقدم محارب من الشياطين بقرنين مكسورين ويتحدى أقوى الشباب في المدينة لإثبات تفوق عرقه.',
      choices: [
        {
          id: 'accept_honor_duel',
          label: 'قبول التحدي المبارز لرفع معنويات المدافعين',
          check: { attr: 'str', skill: 'combat', gearBonus: 'both', base: 22 },
          success: {
            text: 'تصمد أمام قوته الغاشمة وتستغل ثقله لتسقطه، فيتراجع محترماً صلابتك!',
            effects: { rep: 16, faction: { humans: 12 }, skill: { combat: 2 } }
          },
          fail: {
            text: 'يتفوق بقوته الجسدية ويترك لك جرحاً غائراً في صدرك قبل أن ينقذك حلفاؤك.',
            effects: { hp: -36, rep: 2, skill: { combat: 1 } }
          }
        },
        {
          id: 'sword_path_demon_duel',
          minSkill: { sword_path: 1 },
          label: 'مواجهته باستقامة «مسار السيف» وقطع نصله الثقيل في لحظة التقاء واحدة',
          sub: '⚔ مسار السيف: إسقاط بطل الشياطين بضربة استثنائية',
          check: { attr: 'agi', skill: 'sword_path', gearBonus: 'weapon', base: 34 },
          success: {
            text: 'ينقسم سيف المحارب الضخم إلى نصفين أمام صمت الجيشين؛ يسقط على ركبتيه مبهوراً بمهارتك!',
            effects: { rep: 22, faction: { humans: 14 }, skill: { sword_path: 1, combat: 1 } }
          },
          fail: {
            text: 'تخطئ المسافة بسنتيمترات فتتلقى ضربة عاصفة في كتفك.',
            effects: { hp: -30, skill: { combat: 1 } }
          }
        },
        {
          id: 'parley_respect',
          label: 'مقابلته بالكلام الهادئ وتبادل الهدايا المعدنية بدلاً من إراقة الدماء',
          success: {
            text: 'يتأثر الشيطان باحترامك للمعايير القتالية ويصبح قناة تواصل مع فيلقه، مما يثير استياء الحامية البشرية.',
            effects: { faction: { demons: 14, humans: -10, family: -2 }, attr: { cha: 1 }, skill: { trade: 1 } }
          }
        }
      ]
    },
    {
      id: 'world_tax_crisis',
      phase: 'youth',
      minAge: 12,
      maxAge: 18,
      priority: 32,
      weight: 10,
      category: 'world',
      categoryLabel: 'سياسة محلية',
      title: 'ضريبة الحرب الاستثنائية',
      text: 'يفرض محصلو القلعة ضريبة إضافية باهظة على أصحاب الورش والتجار لتمويل الحملات العسكرية.',
      choices: [
        {
          id: 'pay_and_lobby',
          minGold: 22,
          label: 'دفع 22 ذهباً وتوقيع عريضة منظمة لتخفيف العبء عن الفقراء',
          success: {
            text: 'تكسب تقدير الإدارة واحترام أهل الحي معاً.',
            effects: { gold: -22, rep: 10, faction: { humans: 8 }, attr: { cha: 1 } }
          }
        },
        {
          id: 'hide_accounts',
          label: 'إخفاء جزء من الدخل في دفاتر مزدوجة لتفادي الخسارة',
          check: { attr: 'int', skill: 'trade', base: 28 },
          success: {
            text: 'تمر المراجعة دون أن يلحظ المحصل شيئاً وتحفظ رأس مالك.',
            effects: { gold: 28, skill: { trade: 2, shadow: 1 } }
          },
          fail: {
            text: 'يكتشف المدقق التفاوت ويغرمك مبلغاً إضافياً مع تصاعد المراقبة عليك.',
            effects: { gold: -35, rep: -6, threat: 8 }
          }
        }
      ]
    },
    {
      id: 'world_isekai_medicine',
      phase: 'youth',
      minAge: 12,
      maxAge: 18,
      priority: 36,
      weight: 10,
      category: 'world',
      categoryLabel: 'معرفة العالم السابق',
      title: 'وباء الجروح المتقيحة',
      text: 'تنتشر حمى قاتلة بين الجرحى في المستشفى الميداني لأنهم يربطون الجروح بأقمشة غير نظيفة ومياه راكدة.',
      choices: [
        {
          id: 'boil_alcohol',
          label: 'تطبيق تعقيم الضمادات بالغلي والخل والكحول المقطر',
          success: {
            text: 'تنخفض الوفيات بشكل مذهل خلال أسبوعين! يلتفت الأطباء والقادة إلى علمك العملي النادر.',
            effects: { rep: 14, skill: { alchemy: 3 }, faction: { humans: 10, family: 6 }, addTrait: 'نور التعقيم' }
          }
        },
        {
          id: 'donate_gold',
          minGold: 18,
          label: 'التبرع بـ 18 ذهباً لشراء أغطية جديدة وأعشاب مهدئة',
          success: {
            text: 'تخفف معاناة المصابين وتنال دعاء الناس ومحبتهم.',
            effects: { gold: -18, rep: 8, faction: { humans: 6 } }
          }
        }
      ]
    },
    {
      id: 'world_alchemist_distillery',
      phase: 'youth',
      minAge: 11,
      maxAge: 17,
      priority: 41,
      weight: 10,
      category: 'world',
      categoryLabel: 'علم العالم الآخر',
      title: 'معمل التقطير السري',
      text: 'تحصل على أنابيب زجاجية وأعشاب من قافلة غريبة؛ فرصة نادرة لبناء وحدة تقطير بسيطة تستخلص منها الترياق أو جرعة التركيز.',
      choices: [
        {
          id: 'distill_elixirs',
          minGold: 15,
          label: 'إنفاق 15 ذهباً وتجربة التقطير المتدرج لإنتاج إكسير نقي',
          check: { attr: 'int', skill: 'alchemy', base: 30 },
          success: {
            text: 'ينجح التقطير بدقة فتخرج بجرعة تركيز وإكسير شفاء!',
            effects: { gold: -15, skill: { alchemy: 2 }, giveElixir: { healing: 1, focus: 1 } }
          },
          fail: {
            text: 'تتشقق القارورة وتنبعث أبخرة حارقة تؤذي رئتيك.',
            effects: { gold: -15, hp: -16, skill: { alchemy: 1 } }
          }
        },
        {
          id: 'sell_glassware',
          label: 'بيع الأنابيب للصيدلي المحلي بأعلى هامش ربح',
          success: {
            text: 'صفقة ذكية تغذي صندوقك النقدي.',
            effects: { gold: 32, skill: { trade: 2 } }
          }
        }
      ]
    },
    {
      id: 'war_battlefield_scavenge',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      priority: 32,
      weight: 10,
      category: 'war',
      categoryLabel: 'غنائم ومخاطر',
      title: 'أرض المعركة بعد الرحيل',
      text: 'بعد اشتباك عنيف في السهل المجاور، بقيت دروع محطمة وبعض القتلى وربما جرحى عالقون قبل هبوط الظلام.',
      choices: [
        {
          id: 'rescue_survivors',
          label: 'البحث عن الناجين وإسعافهم دون تمييز بين العرقين',
          success: {
            text: 'تنقذ جندياً بشرياً وكشافاً من الجان يذيعان قصتك في المعسكرين.',
            effects: { rep: 12, faction: { humans: 8, elves: 10 }, attr: { ins: 1 }, skill: { alchemy: 1 } }
          }
        },
        {
          id: 'salvage_metal',
          label: 'جمع المعادن والأسلحة السليمة لصهرها أو بيعها',
          success: {
            text: 'تجمع خردة حربية ممتازة تدر دخلاً ومواد خام للورشة.',
            effects: { gold: 45, skill: { smithing: 1, trade: 1 } }
          }
        }
      ]
    },
    {
      id: 'war_supply_convoy_raid',
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      priority: 41,
      weight: 10,
      category: 'war',
      categoryLabel: 'طرق الحرب',
      title: 'قافلة الجمر والملح',
      text: 'تعبر الوادي قافلة إمداد مزدوجة تنقل ملحاً علاجياً وباروداً بدائياً نحو الجبهة المتنازعة ليلاً.',
      choices: [
        {
          id: 'escort_convoy_safe',
          label: 'تأمين مرور الملح الطبي إلى القرى والميدان مقابل أجر',
          check: { attr: 'str', skill: 'combat', gearBonus: 'armor', base: 26 },
          success: {
            text: 'تصد قطاع الطرق عند المنعطف وتصل الشحنة الطبية بسلام.',
            effects: { gold: 45, rep: 10, faction: { humans: 8 }, skill: { combat: 2 } }
          },
          fail: {
            text: 'تنفجر عربة البارود قربك فتنجو بجروح بالغة.',
            effects: { hp: -28 }
          }
        },
        {
          id: 'divert_convoy_elves',
          label: 'توجيه الدواء خفيةً نحو جرحى الجان وبيع الذخيرة في السوق السوداء',
          success: {
            text: 'تجني ربحاً مادياً وود الغابة على حساب تصاعد المراقبة عليك.',
            effects: { gold: 52, faction: { elves: 12 }, threat: 12, skill: { shadow: 2 } }
          }
        }
      ]
    },
    {
      id: 'world_crystal_instability',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      priority: 35,
      weight: 9,
      category: 'world',
      categoryLabel: 'ظاهرة غامضة',
      title: 'شحنة البلورات الرنانة',
      text: 'تحمل عربة في السوق بلورات سحرية تهتز بعنف مع اقتراب حر الظهيرة، مهددة بانفجار يهدم الزقاق بأكمله!',
      choices: [
        {
          id: 'clear_crowd',
          label: 'إبعاد الناس بقوة وسحب العربة إلى البركة الرملية',
          check: { attr: 'str', skill: 'combat', gearBonus: 'armor', base: 28 },
          success: {
            text: 'تتحكم بالعربة وتغمر البلورات في الرمل المبلل فتخمد دون ضحايا!',
            effects: { rep: 14, faction: { humans: 10 }, hp: -10 }
          },
          fail: {
            text: 'ينفجر جزء من الشحنة ويصيبك بشظايا وارتجاج قاسٍ.',
            effects: { hp: -34, rep: 6 }
          }
        },
        {
          id: 'int_damping',
          minInt: 14,
          label: 'فصل البلورات بملح جاف وتبريدها بمحلول متوازن',
          sub: 'بصيرة ذكاء (14+) + كيمياء: كسر الرنين الحراري',
          check: { attr: 'int', skill: 'alchemy', base: 28 },
          success: {
            text: 'يتوقف الرنين في ثوانٍ! يصفق التاجر المذعور ويهديك بلورة سليمة باهظة الثمن.',
            effects: { gold: 60, rep: 14, skill: { alchemy: 2 } }
          },
          fail: {
            text: 'تتأخر لحظة في التبريد فتنفجر بلورة قرب يدك!',
            effects: { hp: -28, rep: 4 }
          }
        }
      ]
    },
    {
      id: 'world_night_curfew_patrol',
      phase: 'youth',
      minAge: 12,
      maxAge: 18,
      priority: 37,
      weight: 9,
      category: 'world',
      categoryLabel: 'تضييق أمني',
      title: 'حظر التجول الليلي',
      text: 'تفرض الحامية حظراً ليلياً مشدداً بعد تسرب جواسيس للمدينة، وأنت عالق خارج حيك مع طلبية عاجلة.',
      choices: [
        {
          id: 'stealth_rooftop_curfew',
          minSkill: { shadow: 4 },
          label: 'عبور أسطح المنازل ليلاً والوصول دون احتكاك بالدوريات',
          sub: 'تخصص الظلال (4+): حركة صامتة فوق السطوح',
          success: {
            text: 'تمر فوق الأسطح كأنك ظل وتكمل مهمتك بسلام.',
            effects: { skill: { shadow: 2 }, gold: 20 }
          }
        },
        {
          id: 'charm_patrol_curfew',
          label: 'مخاطبة قائد الدورية بهدوء وتقديم تصريح الورشة',
          check: { attr: 'cha', skill: 'trade', base: 30 },
          success: {
            text: 'يتفهم الضابط دور عائلتك في الإمداد ويرافقك بأمان.',
            effects: { faction: { humans: 6 }, rep: 4 }
          },
          fail: {
            text: 'يحتجزونك حتى الصباح وتدفع غرامة تأخير.',
            effects: { gold: -18, threat: 6 }
          }
        }
      ]
    },

    // =========================================================================
    // ADDITIONAL FAMILY, BORDER & WARTIME UNIQUE EVENTS
    // =========================================================================
    {
      id: 'family_serene_blade_lesson',
      phase: 'youth',
      minAge: 11,
      maxAge: 15,
      priority: 40,
      weight: 10,
      category: 'family',
      categoryLabel: 'تدريب الأم',
      title: 'حيلة سيرين في فك الاشتباك',
      text: 'في صباح ضبابي هادئ، تناديك أمك سيرين إلى الساحة الخلفية وبيدها سيوف خشبية وقارورة عشبية: «القوة وحدها تنكسر أمام الكمائن؛ اليوم ستتعلم كيف تخرج حياً من حصار خصمين».',
      choices: [
        {
          id: 'serene_combat_focus',
          label: 'التمرن على صد ضربتين متزامنتين والارتداد سريعاً',
          success: {
            text: 'تزداد سرعتك القتالية وتهديك سيرين إكسير شفاء طارئ من مخزونها.',
            effects: { skill: { combat: 2 }, attr: { agi: 1 }, faction: { family: 6 }, giveElixir: { healing: 1 } }
          }
        },
        {
          id: 'serene_stealth_focus',
          label: 'التدرب على الانسحاب في الدخان وإخفاء آثار التنقل',
          success: {
            text: 'تتقن حركات الإفلات من المطاردة وتنال ثناء سيرين على دهائك.',
            effects: { skill: { shadow: 2 }, attr: { ins: 1 }, faction: { family: 6 } }
          }
        }
      ]
    },
    {
      id: 'family_garon_secrets',
      phase: 'youth',
      minAge: 12,
      maxAge: 16,
      priority: 40,
      weight: 10,
      category: 'family',
      categoryLabel: 'حكاية الأب',
      title: 'نار السندان وذكرى الشمال',
      text: 'بينما تقلبان الجمر ليلاً، يكشف لك غارون قصة لقائه الأول بأمك في حصار الشمال، ويشرح لك طريقة لحام الشفرات المتصدعة دون فقدان توازنها.',
      choices: [
        {
          id: 'garon_learn_weld',
          label: 'تطبيق طريقة اللحام المتدرج وحفظها في ذاكرتك',
          success: {
            text: 'ترتفع مهارتك في الحدادة وتتعزز صلابة الروابط العائلية.',
            effects: { skill: { smithing: 2 }, attr: { str: 1 }, faction: { family: 8 } }
          }
        },
        {
          id: 'garon_ask_history',
          label: 'استجوابه بلطف عن أعداء تلك الحملة في الشمال',
          success: {
            text: 'تلتقط أسماء نبلاء متورطين وتضيف قطعة أخرى إلى لوحة المؤامرة.',
            effects: { attr: { ins: 1 }, skill: { shadow: 2 }, faction: { family: 6 } }
          }
        }
      ]
    },
    {
      id: 'world_isekai_water_wheel',
      phase: 'youth',
      minAge: 11,
      maxAge: 16,
      priority: 38,
      weight: 10,
      category: 'world',
      categoryLabel: 'ابتكار من عالمك',
      title: 'أزمة الطاحونة المائية',
      text: 'ينخفض منسوب النهر فتتوقف طاحونة القمح الرئيسية عن الدوران قبيل موسم الحصاد، ويلجأ صاحبها إلى أبيك طلباً لترس حديدي جديد.',
      choices: [
        {
          id: 'design_undershot_paddle',
          label: 'تصميم زعانف خشبية وحديدية مائلة تستغل تيار الماء المنخفض',
          check: { attr: 'int', skill: 'smithing', base: 30 },
          success: {
            text: 'تدور الطاحونة أسرع من قبل رغم انخفاض المياه! ينال اسمك إشادة واسعة وأجرة محترمة.',
            effects: { gold: 34, rep: 8, skill: { smithing: 1, alchemy: 1 } }
          },
          fail: {
            text: 'تحتك التروس بقوة زائدة فتضطر لإصلاحها بتكلفة إضافية.',
            effects: { gold: -14, skill: { smithing: 1 } }
          }
        },
        {
          id: 'invest_grain_mill',
          minGold: 20,
          label: 'تمويل ترميم الساقية بـ 20 ذهباً مقابل حصة في أرباح الدقيق',
          success: {
            text: 'تعود استثماراتك بربح مستقر وعلاقات ممتازة مع أهالي القرية.',
            effects: { gold: 36, skill: { trade: 2 }, rep: 5 }
          }
        }
      ]
    },
    {
      id: 'world_war_deserters_camp',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      priority: 39,
      weight: 10,
      category: 'war',
      categoryLabel: 'مآسي الحدود',
      title: 'مصابو العاصفة في التلال',
      text: 'تعثر في كوخ مهجور على جنديين من البشر وكشاف من الجان يحتمون معاً من عاصفة ثلجية وجروحهم تنزف، وقد تعبوا من قتل بعضهم.',
      choices: [
        {
          id: 'treat_all_wounded',
          label: 'مشاركتهم الطعام والأعشاب وتأمين ممر منفصل لعودتهم بسلام',
          success: {
            text: 'يبكون امتناناً ويعدون بأن يرووا قصتك في معسكريهم لتخفيف الكراهية.',
            effects: { rep: 10, faction: { humans: 8, elves: 10 }, attr: { cha: 1 }, skill: { alchemy: 1 } }
          }
        },
        {
          id: 'disarm_capture_elf',
          label: 'مساعدة البشر على أسر كشاف الجان واستجوابه مقابل مكافأة',
          success: {
            text: 'تنال مكافأة حربية من الحامية وتكشف تحركات الجان على الحدود.',
            effects: { gold: 35, faction: { humans: 10, elves: -16 }, skill: { shadow: 1 } }
          }
        }
      ]
    },
    {
      id: 'war_border_bridge_bribe',
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      priority: 38,
      weight: 10,
      category: 'world',
      categoryLabel: 'فساد الحرب',
      title: 'حاجز الضابط المرتشي',
      text: 'يستغل ضابط على معبر التجار حالة الطوارئ ليفرض إتاوات شخصية على العربات والفقراء، ما يعطل مرور الأدوية والمواد.',
      choices: [
        {
          id: 'report_commander',
          label: 'جمع شهادات السائقين وكشف ابتزازه أمام قيادة الحامية',
          check: { attr: 'cha', skill: 'shadow', base: 28 },
          success: {
            text: 'يُطرد الضابط الفاسد ويُفتح المعبر مجاناً للجميع وسط هتاف التجار!',
            effects: { rep: 12, faction: { humans: 10 }, skill: { shadow: 2 } }
          },
          fail: {
            text: 'ينكر الضابط ويحتجز بضاعتك مع غرامة وضرب خفيف قبل رحيلك.',
            effects: { hp: -16, gold: -18, threat: 8 }
          }
        },
        {
          id: 'stealth_bypass_checkpoint',
          minSkill: { shadow: 4 },
          label: 'الالتفاف بالحمولة عبر المخاضة الجافة ليلاً وتجنب إتاوته بالكامل',
          sub: 'تخصص الظلال (4+): عبور صامت بلا رشاوى أو صدام',
          success: {
            text: 'تعبر مع الفجر بكل سلام وتحتفظ بذهبك كاملاً وتكسب خبرة في التمويه.',
            effects: { gold: 28, skill: { shadow: 2, trade: 1 } }
          }
        },
        {
          id: 'pay_bribe_fast',
          minGold: 15,
          label: 'دفع إتاوة 15 ذهباً لتأمين مرور سريع وآمن دون مشاكل',
          success: {
            text: 'تعبر سريعاً وتلحق بالسوق قبل منافسيك.',
            effects: { gold: 22, skill: { trade: 1 } }
          }
        }
      ]
    },
    {
      id: 'war_truce_whisper_night',
      phase: 'youth',
      minAge: 15,
      maxAge: 18,
      priority: 41,
      weight: 10,
      category: 'war',
      categoryLabel: 'دبلوماسية سرية',
      title: 'لقاء الموفدين في القبو',
      text: 'تصل إلى علمك مفاوضات سرية تجري ليلاً بين حكيم من الجان وضابط بشري معتدل يحاولان إيجاد صيغة لتهدئة الجبهة الغربية قبل إراقة مزيد من الدماء.',
      choices: [
        {
          id: 'protect_secret_talks',
          label: 'توفير الحراسة والتمويه للاجتماع ودعم وثيقة التهدئة',
          success: {
            text: 'يخرج الموفدان باتفاق أولي لوقف النار في الوادي وتصبح موثوقاً لديهما!',
            effects: { rep: 12, faction: { humans: 8, elves: 12 }, flags: { peaceMovementActive: true }, skill: { shadow: 1 } }
          }
        },
        {
          id: 'sell_meeting_hawks',
          label: 'تسريب مكان الاجتماع لصقور الحرب مقابل منحة ذهبية كبيرة',
          success: {
            text: 'يُفشل المتشددون المفاوضات وتقبض ثمناً سخياً مع تصاعد غضب الجان.',
            effects: { gold: 60, faction: { elves: -18, humans: 6 }, threat: 12 }
          }
        }
      ]
    },

    // =========================================================================
    // REPEATABLE SEASONAL TACTICAL ROUTINE POOL (priority: 5 — actually appears!)
    // =========================================================================
    {
      id: 'routine_smith_month',
      phase: 'youth',
      career: 'smith',
      minAge: 11,
      maxAge: 18,
      priority: 5,
      weight: 12,
      repeatable: true,
      condition: function (s) { return s.flags.lastRoutineId !== 'routine_smith_month'; },
      category: 'path',
      categoryLabel: 'فترة في الورشة',
      title: 'إيقاع السندان والمطرقة',
      text: 'تمضي هذه الفترة بوتيرة مستقرة نسبياً في المدينة. كيف تستثمر أيامك بين نار الكير وتطوير قدراتك؟',
      choices: [
        {
          id: 'work_orders',
          label: 'إنجاز طلبات الأسلحة والأدوات لزيادة الذهب والخبرة',
          success: {
            text: 'يدر العمل المتقن ذهباً طيباً ويزيد مهارتك في الحدادة.',
            effects: { gold: 18, skill: { smithing: 1 }, attr: { str: 1 }, flags: { lastRoutineId: 'routine_smith_month' } }
          }
        },
        {
          id: 'study_metallurgy',
          label: 'تدوين أبحاث المعادن والسبائك لتطوير الكيمياء والذكاء العملي',
          success: {
            text: 'تدون خلاصة تجاربك الحرارية فتتسع مداركك العلمية.',
            effects: { attr: { int: 1 }, skill: { smithing: 1, alchemy: 1 }, flags: { lastRoutineId: 'routine_smith_month' } }
          }
        },
        {
          id: 'forge_spar',
          label: 'اختبار توازن السيوف في التدريب القتالي مع والدتك',
          success: {
            text: 'يجمع تمرينك بين معرفة السلاح والقتال الفعلي، وتتعزز لياقتك.',
            effects: { skill: { combat: 1 }, attr: { agi: 1 }, hp: 8, flags: { lastRoutineId: 'routine_smith_month' } }
          }
        },
        {
          id: 'rest_fortify',
          label: 'الراحة والعناية بصحتك وتعزيز أمن الورشة من القتلة',
          success: {
            text: 'تستعيد عافيتك وتخفض احتمالات تعقب الخصوم لك.',
            effects: { hp: 14, threat: -6, faction: { family: 3 }, flags: { lastRoutineId: 'routine_smith_month' } }
          }
        }
      ]
    },
    {
      id: 'routine_adv_month',
      phase: 'youth',
      career: 'adventurer',
      minAge: 11,
      maxAge: 18,
      priority: 5,
      weight: 12,
      repeatable: true,
      condition: function (s) { return s.flags.lastRoutineId !== 'routine_adv_month'; },
      category: 'path',
      categoryLabel: 'مهام النقابة',
      title: 'لوحة عقود المغامرين',
      text: 'فترة هادئة نسبياً في نقابة المغامرين؛ أمامك عدة عقود روتينية وفرص لصقل نفسك قبل المواجهة القادمة.',
      choices: [
        {
          id: 'clear_roads',
          label: 'تأمين الطرق الريفية من قطاع الطرق مقابل مكافأة',
          success: {
            text: 'تنهي الدوريات بنجاح وتعود بالذهب والسمعة.',
            effects: { gold: 18, rep: 3, skill: { combat: 1 }, flags: { lastRoutineId: 'routine_adv_month' } }
          }
        },
        {
          id: 'tactical_study',
          label: 'دراسة خرائط الأعداء والتمرن على التسلل وكشف الكمائن',
          success: {
            text: 'تنمي حدسك التحليلي وقدرتك على الظلال والمكائد.',
            effects: { attr: { ins: 1 }, skill: { shadow: 1 }, flags: { lastRoutineId: 'routine_adv_month' } }
          }
        },
        {
          id: 'physical_drill',
          label: 'تدريب بدني مكثف على السلاح واللياقة في الساحة',
          success: {
            text: 'ترفع قوتك ورشاقتك وتزيد متانتك القتالية.',
            effects: { attr: { str: 1, agi: 1 }, maxHp: 3, flags: { lastRoutineId: 'routine_adv_month' } }
          }
        },
        {
          id: 'lay_low',
          label: 'أخذ إجازة علاجية ومسح آثارك عن أعين المطاردين',
          success: {
            text: 'تضمد جراحك القديمة وتختفي عن أنظار المتربصين.',
            effects: { hp: 14, threat: -6, skill: { shadow: 1 }, flags: { lastRoutineId: 'routine_adv_month' } }
          }
        }
      ]
    },
    {
      id: 'routine_merc_month',
      phase: 'youth',
      career: 'merchant',
      minAge: 11,
      maxAge: 18,
      priority: 5,
      weight: 12,
      repeatable: true,
      condition: function (s) { return s.flags.lastRoutineId !== 'routine_merc_month'; },
      category: 'path',
      categoryLabel: 'حركة السوق',
      title: 'حسابات القوافل الموسمية',
      text: 'تتوالى السلع والأنباء في السوق المركزي هذه الفترة. أي ملف تجاري تختاره لإدارة وقتك؟',
      choices: [
        {
          id: 'caravan_profit',
          label: 'تشغيل قافلة إقليمية سريعة لزيادة الأرباح النقدية',
          success: {
            text: 'تعقد صفقات رابحة تزيد خزينتك ومهارتك التجارية.',
            effects: { gold: 24, skill: { trade: 1 }, flags: { lastRoutineId: 'routine_merc_month' } }
          }
        },
        {
          id: 'ledger_analysis',
          label: 'تحليل دفاتر العرض والطلب والأسرار التجارية لرفع ذكائك',
          success: {
            text: 'تستنتج أنماط التسعير والأزمات قبل وقوعها.',
            effects: { attr: { int: 1, cha: 1 }, skill: { trade: 1 }, flags: { lastRoutineId: 'routine_merc_month' } }
          }
        },
        {
          id: 'build_alliances',
          minGold: 6,
          label: 'إنفاق 6 ذهباً لزيارة الوسطاء وتقليص الملاحقة عنك',
          success: {
            text: 'تزداد جاذبيتك وتخف حدة الملاحقة وتصقل مهارات التمويه.',
            effects: { gold: -6, rep: 5, attr: { cha: 1 }, threat: -7, skill: { shadow: 1 }, flags: { lastRoutineId: 'routine_merc_month' } }
          }
        },
        {
          id: 'rest_home',
          label: 'قضاء الفترة مع العائلة والراحة وترتيب السجلات',
          success: {
            text: 'تهدأ وتيرة حياتك وتستعيد نشاطك البدني والعائلي.',
            effects: { hp: 14, faction: { family: 5 }, threat: -4, flags: { lastRoutineId: 'routine_merc_month' } }
          }
        }
      ]
    },
    {
      id: 'routine_war_pulse',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      priority: 5,
      weight: 9,
      repeatable: true,
      condition: function (s) { return s.flags.lastRoutineId !== 'routine_war_pulse'; },
      category: 'war',
      categoryLabel: 'نبض الحرب',
      title: 'تحركات هادئة على الجبهات',
      text: 'رغم ضجيج الحرب المستمرة، تشهد جبهتك هذه الفترة مناوشات متفرقة تمنحك هامش مناورة لتعزيز موقفك.',
      choices: [
        {
          id: 'support_humans_patrol',
          label: 'دعم حامية البشر بمعدات أو استطلاع محلي',
          success: {
            text: 'تعزز رصيدك لدى البشر وتكسب أجراً محترماً.',
            effects: { faction: { humans: 5 }, gold: 15, rep: 3, flags: { lastRoutineId: 'routine_war_pulse' } }
          }
        },
        {
          id: 'whisper_elves',
          label: 'تمرير رسائل طمأنة أو مؤن طبية سراً عبر وسيط للجان',
          success: {
            text: 'تحفظ قنواتك مفتوحة مع عشائر الغابة وتتمرن على الظلال.',
            effects: { faction: { elves: 6 }, skill: { shadow: 1 }, flags: { lastRoutineId: 'routine_war_pulse' } }
          }
        },
        {
          id: 'intel_reading',
          label: 'تحليل تقارير الجبهات الثلاث وتوقع التحرك التالي',
          success: {
            text: 'تزيد حدسك وبصيرتك العسكرية ومناعتك ضد الخداع.',
            effects: { attr: { ins: 1 }, skill: { shadow: 1 }, flags: { lastRoutineId: 'routine_war_pulse' } }
          }
        },
        {
          id: 'heal_sharpen',
          label: 'الاستشفاء وتجهيز السلاح والدرع للمعركة القادمة',
          success: {
            text: 'تعود صحتك لقوتها مع جاهزية أفضل.',
            effects: { hp: 14, skill: { smithing: 1 }, flags: { lastRoutineId: 'routine_war_pulse' } }
          }
        }
      ]
    },
    {
      id: 'routine_city_calm',
      phase: 'youth',
      minAge: 11,
      maxAge: 18,
      priority: 5,
      weight: 9,
      repeatable: true,
      condition: function (s) { return s.flags.lastRoutineId !== 'routine_city_calm'; },
      category: 'world',
      categoryLabel: 'حياة المدينة',
      title: 'ليالٍ هادئة تحت السور',
      text: 'تمر أسابيع هذه الفترة بلا أزمات عاجلة، فتجد فرصة لإعادة ترتيب أولوياتك الشخصية.',
      choices: [
        {
          id: 'self_study',
          label: 'القراءة والكتابة وتجارب التقطير لتنمية الذكاء والحدس والكيمياء',
          success: {
            text: 'تسجل أفكارك وتصقل ذهنك الهادئ ومهارتك العلمية.',
            effects: { attr: { int: 1, ins: 1 }, skill: { alchemy: 1 }, flags: { lastRoutineId: 'routine_city_calm' } }
          }
        },
        {
          id: 'family_forge',
          label: 'العمل جنباً إلى جنب مع والديك في الورشة والمنزل',
          success: {
            text: 'يزداد دفء العائلة وترتفع مهاراتك الأساسية.',
            effects: { faction: { family: 6 }, gold: 14, skill: { smithing: 1 }, flags: { lastRoutineId: 'routine_city_calm' } }
          }
        },
        {
          id: 'street_ears',
          label: 'الاختلاط بالتجار والاندماج في الأزقة لتقليص التهديد وتنمية الظلال',
          success: {
            text: 'تكسب ود الجميع وتهدئ الشبهات المحيطة بك.',
            effects: { attr: { cha: 1 }, threat: -6, rep: 2, skill: { shadow: 1 }, flags: { lastRoutineId: 'routine_city_calm' } }
          }
        }
      ]
    },

    // =========================================================================
    // SEQUENTIAL CAREER ARCS (4 Chapters per Career — priority: 72)
    // =========================================================================

    // --- BLACKSMITH ARC ---
    {
      id: 'arc_smith_1',
      phase: 'youth',
      career: 'smith',
      minAge: 11,
      maxAge: 13,
      priority: 72,
      category: 'path',
      categoryLabel: 'قوس الحداد • فصل 1',
      title: 'شرارة التحدي مع كاسر',
      text: function (s) {
        if (s.flags.beatKaserEarly) {
          return 'تفتح ورشتك الخاصة بجانب أبيك فيطرق الباب «كاسر» ابن رئيس النقابة، ما زال حاقداً منذ هزيمته أمامك في مهرجان الطفولة. يعرض عليك شراكة شكلية في طلبية مسامير وأدوات حراسة، بينما تلمح في عينيه نية توريطك بعقد خاسر.';
        }
        return 'تبدأ أولى عقودك المستقلة في ورشة أبيك، لكن «كاسر» ابن رئيس نقابة الحدادين يسخر من صغر سنك ويعرض أمام الحرفيين رهاناً على إنجاز ثلاثين حدوة وسيف تدريب في يومين فقط.';
      },
      choices: [
        {
          id: 'arc_smith_1_accept',
          label: 'قبول الرهان وصناعة الدفعة بدقة تتفوق على ورشته',
          check: { attr: 'str', skill: 'smithing', base: 30 },
          success: {
            text: 'تسلم الأدوات في موعدها بصلابة مثالية؛ يعترف الحرفيون بتفوقك ويكبر غيظ كاسر.',
            effects: { rep: 10, gold: 32, skill: { smithing: 2 }, flags: { kaserArc1Won: true } }
          },
          fail: {
            text: 'تنهي الدفعة متأخراً بساعات فتكسب أجر العمل لكن كاسر يتفاخر بانتصاره في الحانة.',
            effects: { gold: 16, skill: { smithing: 1 }, flags: { kaserArc1Won: false } }
          }
        },
        {
          id: 'arc_smith_1_peace',
          label: 'دعوة كاسر للعمل معك لتقاسم الأرباح وتبادل الخبرات بدلاً من العداء',
          success: {
            text: 'يتفاجأ كاسر من هدوئك وتواضعك؛ يقبل على مضض وتنخفض حدة التوتر بين ورشتيكما.',
            effects: { attr: { cha: 1 }, gold: 24, skill: { smithing: 1, trade: 1 }, flags: { kaserAllyPath: true } }
          }
        }
      ]
    },
    {
      id: 'arc_smith_2',
      phase: 'youth',
      career: 'smith',
      minAge: 13,
      maxAge: 15,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_smith_1') !== -1; },
      category: 'path',
      categoryLabel: 'قوس الحداد • فصل 2',
      title: 'الرسوم المسروقة من الدفتر',
      text: function (s) {
        if (s.flags.kaserArc1Won) {
          return 'منذ انتصارك على كاسر في الرهان الأول، تضاعفت غيرته؛ واليوم تكتشف أنه بدأ يصنع دروعاً مطابقة لرسوم أبيك السرية ليخطف زبائنك!';
        }
        return 'تكتشف أن كاسر بدأ يصنع دروعاً مفصلية مطابقة لرسوم أبيك غارون السرية! إما أن أحد المتدربين سرب المخططات، أو أن كاسر يتجسس على ورشتكم.';
      },
      choices: [
        {
          id: 'arc_smith_2_expose',
          label: 'صناعة نموذج أدق مع توقيع خفي داخلي وفضح سرقته أمام مجلس النقابة',
          check: {
            attr: 'int',
            skill: 'smithing',
            base: 28,
            flagBonuses: [{ flag: 'kaserArc1Won', bonus: 10 }]
          },
          success: {
            text: 'يرتبك كاسر حين يعجز عن شرح معادلة التبريد في التصميم، فتغرمه النقابة وترد لك الاعتبار!',
            effects: { rep: 14, gold: 42, skill: { smithing: 2, shadow: 1 }, flags: { kaserExposed: true } }
          },
          fail: {
            text: 'ينكر كاسر مدعياً أنه استلهم الفكرة بنفسه فتكتفي النقابة بتحذير متبادل.',
            effects: { skill: { smithing: 1 }, threat: 6 }
          }
        },
        {
          id: 'arc_smith_2_stealth_reclaim',
          minSkill: { shadow: 4 },
          label: 'التسلل إلى ورشته ليلاً واستعادة المخطوطة الأصلية وترك نسخة مشوهة مكانها',
          sub: 'تخصص الظلال (4+): استرداد الحق بهدوء وإفساد تقليده',
          check: { attr: 'agi', skill: 'shadow', base: 30 },
          success: {
            text: 'تسترجع المخطوطة وتفشل دفعة كاسر التالية تلقائياً وسط حيرة الجميع!',
            effects: { skill: { shadow: 2 }, rep: 10, flags: { kaserExposed: true } }
          },
          fail: {
            text: 'توقظ كلاب الحراسة في فناء كاسر وتقفز من السور بجروح!',
            effects: { hp: -22, threat: 8 }
          }
        },
        {
          id: 'arc_smith_2_forgive_partner',
          requiresFlags: ['kaserAllyPath'],
          label: 'مواجهته بهدوء وتقاسم عقد الجيش الكبير معه لإغلاق الخلاف',
          sub: 'أثر قرار سابق: استثمار التحالف السابق مع كاسر',
          success: {
            text: 'يعترف كاسر بضغط والده عليه ويعتذر بصدق؛ تصبحان الآن أقوى ثنائي حدادة في المقاطعة!',
            effects: { gold: 50, skill: { smithing: 2, trade: 1 }, flags: { kaserTrueAlly: true } }
          }
        }
      ]
    },
    {
      id: 'arc_smith_3',
      phase: 'youth',
      career: 'smith',
      minAge: 15,
      maxAge: 17,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_smith_2') !== -1; },
      category: 'path',
      categoryLabel: 'قوس الحداد • فصل 3',
      title: 'قبو السبائك المنسية',
      text: function (s) {
        if (s.flags.kaserTrueAlly) {
          return 'يأتيك كاسر سراً بمفتاح قديم لأقبية النقابة المنهارة؛ عثر في سجلات جده على وصفة «فولاذ الفجر» المقاوم لنيران الشياطين ويعرض عليك خوض التجربة معاً!';
        }
        return 'تحت أنقاض جناح النقابة القديم بعد قصف المناوشات، تعثر على صندوق نحاسي يضم وصفة قديمة لصهر «فولاذ الفجر» المقاوم لنيران الشياطين، ومعها بقايا نادرة من معدن التيتان الصافي!';
      },
      choices: [
        {
          id: 'arc_smith_3_temper',
          label: 'دمج الوصفة بمعارفك المعدنية لإنتاج سبيكة فائقة في كير أبيك',
          check: {
            attr: 'int',
            skill: 'smithing',
            base: 26,
            flagBonuses: [{ flag: 'kaserTrueAlly', bonus: 15 }]
          },
          success: {
            text: 'يتوهج المعدن بلون أزرق نقي! تصنع منه درع فولاذ الفجر الفائق المقاوم للنيران!',
            effects: {
              skill: { smithing: 2 },
              rep: 14,
              setArmor: { name: 'درع فولاذ الفجر المقاوم للنار', defense: 8, rarity: 'epic', icon: 'plate_armor' },
              flags: { unlockedDawnSteel: true }
            }
          },
          fail: {
            text: 'تنكسر السبيكة عند الطرق الأخير بسبب نقص الكربون فتصيبك شظايا محرقة.',
            effects: { skill: { smithing: 1 }, hp: -24 }
          }
        },
        {
          id: 'arc_smith_3_sell_blueprint',
          label: 'نسخ الوصفة وبيع حق التصنيع للقيادة العسكرية بثمن باهظ',
          success: {
            text: 'تمول خزينتك بذهب وفير وتشتري إكسيرين ثمينين للاستعداد للحسم.',
            effects: { gold: 80, giveElixir: { healing: 1, focus: 1 }, faction: { humans: 10 } }
          }
        }
      ]
    },
    {
      id: 'arc_smith_4',
      phase: 'youth',
      career: 'smith',
      minAge: 16,
      maxAge: 18,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_smith_3') !== -1; },
      category: 'path',
      categoryLabel: 'قوس الحداد • الفصل الختامي',
      title: 'تاج السندان العظيم',
      text: 'في ذروة التجهيز للمعارك الأخيرة، تمنحك نقابة الحدادين لقب المعلم الأول وتضع تحت يدك ثلاث أفران متقدة لتحديد مصير إرثك الصناعي أمام الحرب الثلاثية.',
      choices: [
        {
          id: 'arc_smith_4_masterwork',
          label: 'صياغة تحفة خالدة باسمك تتحدى أسلحة البشر والجان والشياطين',
          check: {
            attr: 'str',
            skill: 'smithing',
            base: 24,
            flagBonuses: [{ flag: 'unlockedDawnSteel', bonus: 14 }]
          },
          success: {
            text: 'تطرق النصل سبعة أيام متصلة بقلب لا يعرف الكلل؛ تخرج بسيف أسطوري تدخل به المعارك الختامية!',
            effects: { skill: { smithing: 3 }, rep: 18, setWeapon: { name: 'سيف السندان العظيم', power: 10, rarity: 'legendary', icon: 'anvil_sword' }, addTrait: 'معلم السندان الأول' }
          },
          fail: {
            text: 'يرفض النصل الاندماج في اللحظة الأخيرة فتنال سيفاً ممتازاً فقط وتُصاب بإجهاد شديد.',
            effects: { hp: -22, setWeapon: { name: 'سيف نقابة الحدادين', power: 8, rarity: 'rare', icon: 'sword' }, skill: { smithing: 2 } }
          }
        },
        {
          id: 'arc_smith_4_arm_all',
          label: 'إنتاج مئات الدروع الميسرة لإنقاذ أرواح المقاتلين والمدنيين',
          success: {
            text: 'يتحدث الناس في القرى والمدن عن الحداد الذي فضل حياة الجنود على التفاخر، وتزداد ثروتك وشعبيتك.',
            effects: { gold: 75, rep: 20, faction: { humans: 14, family: 10 } }
          }
        }
      ]
    },

    // --- ADVENTURER ARC ---
    {
      id: 'arc_adv_1',
      phase: 'youth',
      career: 'adventurer',
      minAge: 11,
      maxAge: 13,
      priority: 72,
      category: 'path',
      categoryLabel: 'قوس المغامر • فصل 1',
      title: 'رفيقة الطريق «ليرا»',
      text: 'تُكلفك النقابة بأول مهمة استطلاع مزدوجة برفقة الكشافة الشابة «ليرا» ذات العباءة الخضراء والخنجر السريع؛ تبحثان عن دورية مفقودة في ممر الضباب قبل حلول الظلام.',
      choices: [
        {
          id: 'arc_adv_1_cooperate',
          label: 'تقسيم المهام بذكاء وحماية ظهر ليرا أثناء مسح الأثر',
          success: {
            text: 'تعثران على الدورية المصابة في مغارة وتنقذانها! تبتسم ليرا قائلة: «لم أتوقع أن يكون ابن الحداد بهذه اليقظة».',
            effects: { skill: { combat: 2, shadow: 1 }, rep: 8, gold: 30, flags: { lyraTrustsYou: true } }
          }
        },
        {
          id: 'arc_adv_1_rush_glory',
          label: 'الاندفاع بمفردك لالتقاط شارة القائد وكسب المكافأة كاملة',
          check: { attr: 'agi', skill: 'combat', base: 30 },
          success: {
            text: 'تنهي المهمة سريعاً وتحصد أجراً أكبر، لكن ليرا تغضب من أنانيتك.',
            effects: { gold: 44, rep: 10, flags: { lyraResentsYou: true } }
          },
          fail: {
            text: 'تقع في حفرة فخ صيد فتتولى ليرا سحبك بعتاب بارد.',
            effects: { hp: -22, gold: 18, flags: { lyraResentsYou: true } }
          }
        }
      ]
    },
    {
      id: 'arc_adv_2',
      phase: 'youth',
      career: 'adventurer',
      minAge: 13,
      maxAge: 15,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_adv_1') !== -1; },
      category: 'path',
      categoryLabel: 'قوس المغامر • فصل 2',
      title: 'انهيار الكهف الأحمر',
      text: 'في عمق وادٍ قريب من أراضي الشياطين، تنقض عليكما وحوش محمومة بالرماد وينهار مدخل الكهف خلفكما، فتعلق ساق ليرا تحت صخرة ثقيلة!',
      choices: [
        {
          id: 'arc_adv_2_save_lyra',
          label: 'دفع الصخرة وحمل ليرا عبر الممر المنهار رغم الخطر',
          check: {
            attr: 'str',
            skill: 'combat',
            gearBonus: 'both',
            base: 26,
            flagBonuses: [{ flag: 'lyraTrustsYou', bonus: 14 }]
          },
          success: {
            text: 'تنتزعها من تحت الركام وتقاتل الوحش الحارس لتخرجا معاً تحت النجوم! تصبح ليرا حليفك الأوفى في النقابة.',
            effects: { rep: 14, skill: { combat: 2 }, giveElixir: { healing: 1 }, flags: { savedLyra: true } }
          },
          fail: {
            text: 'تتلقى ضربة قاسية في كتفك أثناء إنقاذها لكنكما تخرجان أحياء بصعوبة.',
            effects: { hp: -32, rep: 8, flags: { savedLyra: true } }
          }
        },
        {
          id: 'arc_adv_2_stealth_escape',
          label: 'جذب انتباه الوحوش بصخرة بعيدة ثم سحب ليرا خفية نحو الفتحة العليا',
          check: { attr: 'agi', skill: 'shadow', base: 28 },
          success: {
            text: 'تخدع الوحوش في الظلام وتخرجان بأمان دون خدش!',
            effects: { skill: { shadow: 2 }, rep: 12, flags: { savedLyra: true } }
          },
          fail: {
            text: 'يلتفت وحش سريع ويمزق كتفك قبل أن تفلتا من الفتحة.',
            effects: { hp: -26, flags: { savedLyra: true } }
          }
        }
      ]
    },
    {
      id: 'arc_adv_3',
      phase: 'youth',
      career: 'adventurer',
      minAge: 15,
      maxAge: 17,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_adv_2') !== -1; },
      category: 'path',
      categoryLabel: 'قوس المغامر • فصل 3',
      title: 'خيانة أمين النقابة',
      text: function (s) {
        if (s.flags.savedLyra) {
          return 'تقتحم ليرا غرفتك ليلاً حاملةً كشوفات سرية: أمين نقابة المغامرين يرسل الفرق الشابة عمداً إلى كمائن الشياطين مقابل رشاوى، وهي تضع ثقتها الكاملة بك لإسقاطه!';
        }
        return 'تكتشف من تقارير المصابين أن أمين نقابة المغامرين يتقاضى رشاوى لتوجيه الفرق نحو مناطق الموت لإنهاك المدافعين!';
      },
      choices: [
        {
          id: 'arc_adv_3_raid_office',
          label: 'اقتحام مكتبه ليلاً مع حلفائك وانتزاع الأدلة قبل هروبه',
          check: {
            attr: 'agi',
            skill: 'shadow',
            base: 26,
            flagBonuses: [{ flag: 'savedLyra', bonus: 15 }]
          },
          success: {
            text: 'يُطاح بالأمين الفاسد ويُعيّن قادة شرفاء في النقابة يرفعونك إلى رتبة قائد فرقة!',
            effects: { rep: 18, gold: 60, skill: { combat: 1, shadow: 2 }, flags: { purgedGuild: true } }
          },
          fail: {
            text: 'يحرق بعض الأوراق ويهرب من النافذة بعد اشتباك دموي مع حراسه.',
            effects: { hp: -28, threat: 10 }
          }
        },
        {
          id: 'arc_adv_3_blackmail',
          label: 'تهديده سراً لنيل أفضل العقود والعتاد من خزينة النقابة',
          success: {
            text: 'يرضخ الأمين الفاسد فيحول إليك ذهباً وفيراً وخاتم حماية ثميناً.',
            effects: { gold: 85, giveElixir: { focus: 1 }, threat: 12, faction: { family: -3 } }
          }
        }
      ]
    },
    {
      id: 'arc_adv_4',
      phase: 'youth',
      career: 'adventurer',
      minAge: 16,
      maxAge: 18,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_adv_3') !== -1; },
      category: 'path',
      categoryLabel: 'قوس المغامر • الفصل الختامي',
      title: 'طليعة سهل الرماد',
      text: function (s) {
        if (s.flags.purgedGuild) {
          return 'تقف على رأس فرقة النخبة في النقابة المُطهّرة عشية الحسم؛ ليرا والقادة الجدد ينتظرون إشارتك لخطة الاختراق الكبرى!';
        }
        return 'تقف على رأس فرقة النخبة في النقابة عشية الحسم؛ ليرا والمقاتلون ينظرون إليك لتحديد خطة الاختراق الكبرى التي ستسبق اصطدام الجيوش.';
      },
      choices: [
        {
          id: 'arc_adv_4_vanguard',
          label: 'قيادة فرقة الاقتحام السريع وتدمير أبراج الإمداد المعادية',
          check: {
            attr: 'str',
            skill: 'combat',
            gearBonus: 'both',
            base: 24,
            flagBonuses: [{ flag: 'purgedGuild', bonus: 12 }]
          },
          success: {
            text: 'تُثبت أنك أحد أشرس المغامرين في جيلك وتغنم سلاحاً ممتازاً من ساحة الطليعة.',
            effects: { rep: 20, skill: { combat: 2 }, setWeapon: { name: 'سيف قائد الطليعة', power: 9, rarity: 'epic', icon: 'sword' }, addTrait: 'نصل الطليعة' }
          },
          fail: {
            text: 'تنهكك الرماح فتتراجع مصاباً بعد تعطيل برج واحد فقط.',
            effects: { hp: -26, rep: 8 }
          }
        },
        {
          id: 'arc_adv_4_ghost_recon',
          label: 'قيادة تسلل صامت لفتح ثغرات الاستطلاع وإنقاذ الأسرى قبل المعركة',
          success: {
            text: 'تنقذ عشرات المقاتلين وتكسب معلومات ذهبية وإعجاب ليرا وقادة الجبهات.',
            effects: { rep: 18, skill: { shadow: 3 }, gold: 55 }
          }
        }
      ]
    },

    // --- MERCHANT ARC ---
    {
      id: 'arc_merc_1',
      phase: 'youth',
      career: 'merchant',
      minAge: 11,
      maxAge: 13,
      priority: 72,
      category: 'path',
      categoryLabel: 'قوس التاجر • فصل 1',
      title: 'مواجهة الميناء مع «دالوس»',
      text: 'ما إن تنزل بضاعتك في سوق النهر حتى يحاول التاجر المتنفذ «دالوس» احتكار أرصفة التفريغ ومنع السفن من التعامل مع تاجر مبتدئ مثلك.',
      choices: [
        {
          id: 'arc_merc_1_outbid',
          label: 'عقد اتفاق سريع مع صيادي النهر لتفريغ البضائع ليلاً بنصف الرسوم',
          check: { attr: 'cha', skill: 'trade', base: 30 },
          success: {
            text: 'تكسر احتكار الرصيف بذكاء ويبدأ التجار الصغار بالالتفاف حولك؛ يشتعل غضب دالوس!',
            effects: { gold: 42, rep: 8, skill: { trade: 2 }, flags: { beatDalosPort: true } }
          },
          fail: {
            text: 'تتأخر شحنتك يومين وتخسر جزءاً من هامش الربح قبل إيجاد منفذ بديل.',
            effects: { gold: 14, skill: { trade: 1 } }
          }
        },
        {
          id: 'arc_merc_1_deal',
          label: 'دفع نسبة رمزية لدالوس مقابل التغلغل داخل شبكته ومعرفة زبائنه',
          success: {
            text: 'تدخل قلب السوق الكبير بأمان وتتعرف على كبار الموردين في العاصمة.',
            effects: { gold: 24, skill: { trade: 1, shadow: 1 }, flags: { alliedDalos: true } }
          }
        }
      ]
    },
    {
      id: 'arc_merc_2',
      phase: 'youth',
      career: 'merchant',
      minAge: 13,
      maxAge: 15,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_merc_1') !== -1; },
      category: 'path',
      categoryLabel: 'قوس التاجر • فصل 2',
      title: 'حصار القوافل عند الجسر',
      text: function (s) {
        if (s.flags.beatDalosPort) {
          return 'انتقاماً لهزيمته في الميناء، يستأجر دالوس مرتزقة لتعطيل عرباتك وتفتيشها بحجة التهريب، مهدداً بإفلاسك قبل الشتاء!';
        }
        return 'يستغل دالوس التوتر الحدودي فيستأجر مرتزقة لتعطيل عرباتك وتفتيشها بحجة التهريب، مهدداً بإفلاسك قبل موسم الشتاء.';
      },
      choices: [
        {
          id: 'arc_merc_2_stealth_route',
          label: 'توجيه قوافلك عبر الممرات الجانبية بتمويه عربات الفحم',
          check: {
            attr: 'int',
            skill: 'shadow',
            base: 26,
            flagBonuses: [
              { flag: 'knowsForestPaths', bonus: 14 },
              { flag: 'beatDalosPort', bonus: 6 }
            ]
          },
          success: {
            text: 'تمر قوافلك كلها بسلام فتصل للسوق قبل دالوس وتبيع بضعف السعر المعتاد!',
            effects: { gold: 72, skill: { shadow: 1, trade: 2 }, rep: 10 }
          },
          fail: {
            text: 'تُضبط عربة واحدة وتُجرح أثناء الاشتباك وتدفع غرامة مالية موجعة.',
            effects: { hp: -20, gold: -30, threat: 8 }
          }
        },
        {
          id: 'arc_merc_2_bribe_guards',
          minGold: 30,
          label: 'شراء شهادة مرور رسمية وإسقاط حجج دالوس قانونياً أمام ضابط الجسر',
          success: {
            text: 'يتلقى رجال دالوس توبيخاً علنياً وتستمر تجارتك مرفوعة الرأس!',
            effects: { gold: 38, rep: 10, faction: { humans: 8 }, skill: { trade: 2 } }
          }
        }
      ]
    },
    {
      id: 'arc_merc_3',
      phase: 'youth',
      career: 'merchant',
      minAge: 15,
      maxAge: 17,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_merc_2') !== -1; },
      category: 'path',
      categoryLabel: 'قوس التاجر • فصل 3',
      title: 'انهيار أو تحالف إمبراطورية دالوس',
      text: 'تعصف الحرب بقوافل دالوس فيقع في أزمة سيولة خانقة، ويأتيك اليوم ليطلب قرضاً أو يعرض بيع نصف مستودعاته بخصم كبير.',
      choices: [
        {
          id: 'arc_merc_3_buyout',
          minGold: 50,
          label: 'دفع 50 ذهباً للاستحواذ على مستودعاته وحقوق توريد الشمال',
          success: {
            text: 'تصبح أكبر مالك خطوط إمداد في الإقليم وتتدفق الأرباح إلى خزانتك كل فترة!',
            effects: { gold: 80, rep: 14, skill: { trade: 3 }, flags: { absorbedDalosEmpire: true } }
          }
        },
        {
          id: 'arc_merc_3_alliance',
          label: 'منحه مهلة وإنشاء تحالف تجاري مشترك يوجه أسعار الحرب',
          success: {
            text: 'يصبح دالوس ذراعك اليمنى في العاصمة ويدفع لك حصة ذهبية وحصانة تجارية.',
            effects: { gold: 60, skill: { trade: 2, shadow: 1 }, attr: { cha: 1 }, giveElixir: { focus: 1 }, flags: { alliedDalos: true } }
          }
        }
      ]
    },
    {
      id: 'arc_merc_4',
      phase: 'youth',
      career: 'merchant',
      minAge: 16,
      maxAge: 18,
      priority: 72,
      condition: function (s) { return s.usedEvents.indexOf('arc_merc_3') !== -1; },
      category: 'path',
      categoryLabel: 'قوس التاجر • الفصل الختامي',
      title: 'قمة التوريد الكبرى',
      text: 'قبيل معركة سهل الرماد، تجد أن مفاتيح القمح والحديد والأدوية في القارة كلها تمر عبر دفاتر مكتبك؛ قادة الجبهات ينتظرون قرارك الأخير.',
      choices: [
        {
          id: 'arc_merc_4_crown_treasury',
          label: 'توجيه الإمدادات لإنقاذ المدنيين وتقوية ميزان التوازن والسلام',
          success: {
            text: 'يكتب الناس اسمك في الأسواق كمنقذ القارة من المجاعة، وتبلغ سمعتك الذروة.',
            effects: { rep: 22, gold: 70, faction: { humans: 12, elves: 12 }, addTrait: 'سيد التوازن الذهبي' }
          }
        },
        {
          id: 'arc_merc_4_war_profiteer',
          label: 'بيع الإمدادات لمن يدفع أكثر من الفصائل الثلاثة ومضاعفة ثروتك',
          success: {
            text: 'تمتلئ خزائنك بالذهب والسبائك حتى تصبح أغنى من نصف النبلاء!',
            effects: { gold: 100, skill: { trade: 2 }, addTrait: 'بنك القارة الخفي', threat: 6 }
          }
        }
      ]
    },

    // =========================================================================
    // RACE-RELATION EXCLUSIVE EVENTS
    // =========================================================================
    {
      id: 'race_elven_sanctuary',
      phase: 'youth',
      minAge: 13,
      maxAge: 18,
      minFaction: { elves: 22 },
      priority: 52,
      category: 'war',
      categoryLabel: 'ثقة الجان',
      title: 'دعوة إيلارين إلى قدس الأشجار',
      text: 'بسبب ودّك المتواصل مع الجان، تصطحبك إيلارين سراً إلى واحة مضيئة في عمق الغابة حيث يبارك الحكماء أصدقاءهم النادرين ويقدمون لك هدية نادرة من مخازن الغابة.',
      choices: [
        {
          id: 'elf_gift_cloak',
          label: 'اختيار «تميمة ورق البلوط المبارك» ونسخة إكسير شفاء غابوي',
          success: {
            text: 'تمنحك الغابة تميمة تعزز تخفيك وقدرتك على تفادي السهام والكمائن!',
            effects: {
              skill: { shadow: 2 },
              giveElixir: { healing: 1 },
              setAccessory: { name: 'تميمة ورق البلوط المبارك', desc: '+8% للظلال والبراعة', rarity: 'epic', icon: 'charm_wood', bonus: { shadow: 8, agi: 8 } }
            }
          }
        },
        {
          id: 'elf_gift_wisdom',
          label: 'طلب دراسة سجلات السلام القديمة بين الجان والبشر',
          success: {
            text: 'تمنحك المعرفة التاريخية فهماً أعمق لمكائد الحرب وترفع حدسك وكيمياء الأعشاب.',
            effects: { attr: { int: 1, ins: 1 }, skill: { alchemy: 2, shadow: 1 }, giveElixir: { focus: 1 } }
          }
        }
      ]
    },
    {
      id: 'race_demon_pact_forge',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      minFaction: { demons: 20 },
      priority: 52,
      category: 'war',
      categoryLabel: 'نفوذ الشياطين',
      title: 'حرارة أفران الأراضي القاحلة',
      text: 'لأن اسمك صار محترماً لدى وسطاء الشياطين، يدعوك أركان إلى نقطة حدودية قرب بركان خامد لصقل معرفتك بقوة الرماد والحصول على امتيازات الأراضي القاحلة.',
      choices: [
        {
          id: 'demon_temper_weapon',
          label: 'سقي سلاحك في الجمر البركاني لزيادة حدته وقوته القتالية',
          success: {
            text: 'يخرج سلاحك متوهجاً بحدة مخيفة، وترتفع هيبتك في المعسكرات على حساب غضب البشر.',
            effects: { setWeapon: { name: 'نصل الرماد الملتهب', power: 8, rarity: 'epic', icon: 'demon_sword' }, skill: { combat: 2, smithing: 1 }, threat: 8 }
          }
        },
        {
          id: 'demon_gold_tribute',
          label: 'قبول منحة ذهب نقي وأدوية مركزة لتمويل مشاريعك',
          success: {
            text: 'تعود بصندوق ثقيل من سبائك الذهب وإكسير تركيز.',
            effects: { gold: 75, giveElixir: { focus: 1 } }
          }
        }
      ]
    },
    {
      id: 'race_human_knight_honor',
      phase: 'youth',
      minAge: 14,
      maxAge: 18,
      minFaction: { humans: 32 },
      priority: 52,
      category: 'war',
      categoryLabel: 'تقدير المملكة',
      title: 'تفويض وسام القلعة',
      text: 'تقديراً لدعمك المتواصل لمملكة البشر في أحلك الأوقات، يستدعيك قائد الحامية إلى ساحة القلعة لتقليدك وسام الصداقة المدنية وتزويدك بمخصصات دفاعية.',
      choices: [
        {
          id: 'human_accept_armor',
          label: 'استلام درع الفرسان المخفف ومنحة التجهيز الحربي',
          success: {
            text: 'تتسلم درعاً متيناً وإكسير شفاء يرفعان فرص نجاتك في أصعب اللحظات.',
            effects: { setArmor: { name: 'درع حامية التاج المرموق', defense: 7, rarity: 'rare', icon: 'plate_armor' }, giveElixir: { healing: 1 }, rep: 10 }
          }
        },
        {
          id: 'human_accept_stipend',
          label: 'طلب منحة ذهبية لدعم ورشة والديك وبناء شبكة أمان للعائلة',
          success: {
            text: 'تحصل على مكافأة مالية سخية وحماية إضافية للورشة في المدينة.',
            effects: { gold: 68, faction: { family: 10 }, threat: -8 }
          }
        }
      ]
    }
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.Data.pathEvents;
  }
})(typeof window !== 'undefined' ? window : globalThis);

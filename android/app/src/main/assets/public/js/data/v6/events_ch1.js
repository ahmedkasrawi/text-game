/**
 * «الظل التاه» — أحداث الفصل الأول: الجذور والندوب (الأعمار 7 إلى 11 سنة)
 * 20 دوراً ثرية متفرعة، 4 مسارات نشأة أولية، 7 شخصيات، نزالات تكتيكية، وقرارات مصيرية ممتدة.
 */
(function (global) {
  'use strict';

  var GameApp = global.GameApp = global.GameApp || {};
  GameApp.V6StoryEvents = GameApp.V6StoryEvents || [];

  var CH1_EVENTS = [
    // ---------------------------------------------------------
    // 1. المشهد الافتتاحي المشترك (سن 7 - الدور 1)
    // ---------------------------------------------------------
    {
      id: 'v6_origin_awakening',
      chapter: 1,
      minAge: 7,
      maxAge: 7,
      cityId: 'ash_frontier',
      sceneId: 'burning_origin',
      speakerId: 'protagonist',
      title: 'ليلة الرماد الأولى — يقظة الغريب',
      body: 'تفتح عينيك وسط سُحب دخانٍ خانقة ورمادٍ يتساقط كالثلج الأسود على بلدة ثغرية تنهار تحت حوافر الخيل وصيحات النهب. أنت في جسد طفلٍ في السابعة، لكن في صدرك وعيٌ كامل ورؤيةٌ حادة لعالمٍ غريب لا تفهمه ولا ينتمي إليك. الجثث مبعثرة حولك وألسنة اللهب تلتهم الأبواب. صوت خطواتٍ يقترب، وقرارك الأول سيحدد من يلتقطك قبل أن يبتلعك الرماد.',
      choices: [
        {
          id: 'origin_smith',
          label: 'الركض نحو دويّ المطارق في ورشة الحدادة الحصينة',
          hint: '+قوة +حدادة +قتال • مسار الحداد والفيلق',
          effects: { stats: { str: 1 }, skills: { smithing: 1, combat: 1 }, factions: { legion: 8 }, flags: { origin_path: 'smithy' } },
          meet: { charId: 'gharon_mentor', loyalty: 22, trust: 18 },
          nextEventId: 'v6_ch1_smithy_initiation',
          outcome: 'جذبك المعلم غارون بساعده المفتول وسط ألسنة اللهب ورماك خلف حجر السندان وهو يصد هجوماً بسيفه العريض.'
        },
        {
          id: 'origin_alley',
          label: 'الانسلال مع فتيان الأزقة نحو سراديب الصرف المعتمة',
          hint: '+براعة +حدس +تخفي • مسار أزقة الظل',
          effects: { stats: { agi: 1, ins: 1 }, skills: { stealth: 1 }, factions: { shadow: 8 }, flags: { origin_path: 'alley', knows_underbelly: true } },
          meet: { charId: 'lyra_shadow', loyalty: 18, trust: 14 },
          nextEventId: 'v6_ch1_alley_initiation',
          outcome: 'سحبتك فتاة ذات نظرات حادة تدعى ليرا إلى فجوة تحت بلاط السوق؛ همست لك: «السطح للأغبياء.. ابقَ في الظل إن أردت العيش.»'
        },
        {
          id: 'origin_caravan',
          label: 'الاحتماء بعربات القافلة المسلحة وإنقاذ صناديق الذهب والدفاتر',
          hint: '+ذكاء +تجارة +15 ذهب • مسار التجار والمصارف',
          effects: { stats: { int: 1 }, skills: { trade: 1, politics: 1 }, vitals: { gold: 15 }, factions: { merchants: 8 }, flags: { origin_path: 'caravan' } },
          meet: { charId: 'salim_merchant', loyalty: 18, trust: 15 },
          nextEventId: 'v6_ch1_caravan_initiation',
          outcome: 'التقطتَ صندوق دفاتر وحسابات تجارية كادت تلتهمه النار وسلمته للتاجر سليم؛ حدق في هدوئك غير المألوف وضمك لحاشيته.'
        },
        {
          id: 'origin_abbey',
          label: 'اللجوء إلى محراب الدير والركوع بثبات أمام المحققين',
          hint: '+بصيرة +سياسة +خيمياء • مسار العقيدة والتفتيش',
          effects: { stats: { ins: 1, cha: 1 }, skills: { politics: 1, alchemy: 1 }, factions: { church: 8 }, flags: { origin_path: 'abbey' } },
          meet: { charId: 'inquisitor_malik', loyalty: 10, trust: 12, fear: 15 },
          nextEventId: 'v6_ch1_abbey_initiation',
          outcome: 'وجدك المحقق مالك راكعاً بصمت بارد لا يليق بطفل مرتعب؛ ومضت عيناه بفضول غامض: «هذا الصمت إما دهاء شيطاني أو نداء قداسة.»'
        }
      ]
    },

    // ---------------------------------------------------------
    // 2. أحداث التأسيس الأربعة (سن 7 - الدور 2)
    // ---------------------------------------------------------
    {
      id: 'v6_ch1_smithy_initiation',
      chapter: 1,
      minAge: 7,
      maxAge: 7,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'gharon_mentor',
      title: 'لهيب الكير ومعدن الغرباء',
      body: 'في ورشة ثغر الرماد، تنفخ في كير النار حتى يحمرّ الحديد. يقف طارق — فتى أكبر منك بعام يتبناه الورشة — يرمقك بحدة وازدراء. يرمي غارون قطعتي حديد خام على السندان: «هنا لا نُطعم أفواهاً عاطلة. من يطرق نصل سكينٍ مستقيم أولاً، ينام بجانب الموقد ويأكل اللحم.»',
      choices: [
        {
          id: 'smith_hammer_hard',
          label: 'تطريق النصل بقوة وسرعة لإثبات تفوقك البدني',
          hint: '+قوة +حدادة • لقاء طارق كمنافس',
          effects: { stats: { str: 1 }, skills: { smithing: 1, combat: 1 }, flags: { won_frontier_trial_ch1_seed: true } },
          meet: { charId: 'tark_rival', loyalty: 8, trust: 10, fear: 12 },
          outcome: 'أنجزت نصلك بضربات واثقة صدمت غارون؛ احمرّ وجه طارق غيظاً وبدأت الخصومة بينكما.'
        },
        {
          id: 'smith_study_grain',
          label: 'دراسة انحناء المعدن وضبط درجات الحرارة بحكمة عقلانية',
          hint: '+ذكاء +حدس • تطريق فائق النقاء',
          effects: { stats: { int: 1, ins: 1 }, skills: { smithing: 1 }, vitals: { stamina: -5 } },
          outcome: 'خرج سكينك متقناً ومتزناً؛ أومأ غارون برأسه متفاجئاً من نضج فهمك للمعدن.'
        },
        {
          id: 'smith_help_tark',
          label: 'تعديل مطرقة طارق سراً لتنقذه من توبيخ المعلم',
          hint: '+ود طارق • غرس بذور أخوة السلاح',
          effects: { stats: { cha: 1 }, factions: { legion: 4 } },
          meet: { charId: 'tark_rival', loyalty: 18, trust: 15 },
          outcome: 'نظر إليك طارق بارتباك؛ لم يشكرك علناً، لكن احتقاره تحول إلى احترام دفين.'
        }
      ]
    },

    {
      id: 'v6_ch1_alley_initiation',
      chapter: 1,
      minAge: 7,
      maxAge: 7,
      cityId: 'ash_frontier',
      sceneId: 'underbelly',
      speakerId: 'lyra_shadow',
      title: 'قانون القيعان: اليد الأسرع تعيش',
      body: 'تقودك ليرا في ممرات الصرف الرطبة خلف أسوار الحامية. تشير بإصبعها النحيل إلى رقيبٍ مخمور نائم قرب براميل المؤن، وتتدلى من حزامه صرة جلدية مليئة بالدنانير: «هذا امتحانك الأول في النقابة. إما أن تجلب تلك الصرة دون أن يصدر خيط قماشك صوتاً، أو ستطردك عصابة الأزقة لتأكلك كلاب الشتاء.»',
      choices: [
        {
          id: 'alley_silent_cut',
          label: 'التسلل بخفة الظل وقطع حبل الصرة بسكين صدئ',
          hint: '+تخفي +براعة +12 ذهب',
          effects: { stats: { agi: 1 }, skills: { stealth: 1 }, vitals: { gold: 12 } },
          meet: { charId: 'lyra_shadow', loyalty: 12, trust: 14 },
          outcome: 'تحركت كشبح فوق الحجارة الزلقة؛ سلمت الصرة لليرا التي اتسعت عيناها إعجاباً بدقتك غير الطفولية.'
        },
        {
          id: 'alley_distract_trick',
          label: 'رمي حجر لجر الجندي بعيداً ثم خطف الصرة والمؤن معاً',
          hint: '+ذكاء +تخفي +طعام وذهب',
          effects: { stats: { int: 1 }, skills: { stealth: 1, politics: 1 }, vitals: { gold: 8, stamina: 10 } },
          outcome: 'استيقظ الجندي مترنحاً يطارد صدى الحجر بينما ظفرت أنت بالصرة وقطعة لحم مقددة.'
        },
        {
          id: 'alley_study_route',
          label: 'حفظ خارطة السراديب ومنافذ الهروب أولاً بدلاً من الطمع',
          hint: '+حدس • كشف شبكة مهربي الموانئ',
          effects: { stats: { ins: 1 }, skills: { stealth: 1 }, flags: { mapped_underbelly_ch1: true } },
          outcome: 'أتقنت جغرافية الأزقة السفلية، وصرت تعرف أين يختبئ رجال الفيلق وأين يفر القتلة.'
        }
      ]
    },

    {
      id: 'v6_ch1_caravan_initiation',
      chapter: 1,
      minAge: 7,
      maxAge: 7,
      cityId: 'ash_frontier',
      sceneId: 'salt_port',
      speakerId: 'salim_merchant',
      title: 'ميزان النحاس وسر الأختام',
      body: 'يجلس التاجر سليم خلف طاولة مغطاة بقماش قرمزي عليها موازين دقيقة وأكوام عملات معدنية. يدفع إليك كومة مختلطة: «في هذا العالم يا بني، اللص يسرق درهماً فيُشنق، والمصرفي يسرق بلدةً فيُركع له. اعزل الدنانير المخلوطة بالرصاص وافرز أختام شحنات الملح.»',
      choices: [
        {
          id: 'caravan_audit_coins',
          label: 'فرز العملات بدقة ووزنها بميزان الشمع',
          hint: '+تجارة +ذكاء +18 ذهب',
          effects: { stats: { int: 1 }, skills: { trade: 1 }, vitals: { gold: 18 } },
          meet: { charId: 'salim_merchant', loyalty: 12, trust: 15 },
          outcome: 'اكتشفت تسع عملات مزيفة ببراعة تاجر مخضرم؛ ابتسم سليم وقال: «يدك ناعمة لكن عينك لا تخطئ الربح.»'
        },
        {
          id: 'caravan_secret_mark',
          label: 'فحص أختام الشحنات وملاحظة رمز عسكري غريب يباع بالخفاء',
          hint: '+حدس +سياسة • كشف خيط تهريب سلاح',
          effects: { stats: { ins: 1 }, skills: { politics: 1 }, flags: { saw_smuggling_mark: true } },
          outcome: 'حفظت الرمز المشبوه في ذاكرتك؛ تجار الحبوب يهربون أسلحة الفيلق عبر قوافل الملح.'
        },
        {
          id: 'caravan_pocket_change',
          label: 'إخفاء عملتين فضيتين خلسة في نعل حذائك لمدخراتك الخاصة',
          hint: '+ذهب +تخفي • مخاطرة خفية',
          effects: { stats: { agi: 1 }, skills: { stealth: 1 }, vitals: { gold: 25, suspicion: 4 } },
          outcome: 'وضعت الفضة في حذائك دون أن يلحظ سليم، واكتسبت درساً مبكراً في الطمع المحسوب.'
        }
      ]
    },

    {
      id: 'v6_ch1_abbey_initiation',
      chapter: 1,
      minAge: 7,
      maxAge: 7,
      cityId: 'ash_frontier',
      sceneId: 'iron_abbey',
      speakerId: 'inquisitor_malik',
      title: 'قسوة المحراب وأسرار الأعشاب',
      body: 'داخل مصلى حجري بارد تفوح منه روائح البخور والشحم المحترق، يقرأ المحقق مالك بنود مرسوم تفتيش جديد بينما تقف فتاة شابة تُدعى فيرا ترتب قوارير زجاجية برعشة خفية. يلتفت مالك إليك ببرود: «يا فتى، العين التي ترى الخطيئة وتصمت شريكةٌ فيها. رتّل عهد الطاعة أو اكتب أسماء المهربين.»',
      choices: [
        {
          id: 'abbey_recite_dogma',
          label: 'تلاوة العهد الكنسي بثبات وإظهار الطاعة والورع التام',
          hint: '+سياسة +نفوذ الكنيسة +حدس',
          effects: { stats: { ins: 1 }, skills: { politics: 1 }, factions: { church: 10 } },
          meet: { charId: 'inquisitor_malik', loyalty: 12, trust: 14 },
          outcome: 'رتلت الكلمات بوقارٍ جامد نال استحسان المحقق؛ منحك رداء المبتدئين وخاتم الصلاة النحاسي.'
        },
        {
          id: 'abbey_help_vera',
          label: 'الاقتراب من فيرا ومساعدتها في إخفاء قارورة عشبية مشبوهة',
          hint: '+خيمياء +ذكاء • كسب ثقة فيرا سراً',
          effects: { stats: { int: 1 }, skills: { alchemy: 1 } },
          meet: { charId: 'vera_alchemist', loyalty: 20, trust: 18 },
          outcome: 'حجبت القارورة بجسدك الصغير عن عين مالك؛ رمقتك فيرا بامتنان عميق وهمست: «أنت ملاكي الحارس.»'
        },
        {
          id: 'abbey_study_inquest',
          label: 'دراسة دفاتر التحقيق وحفظ أساليب انتزاع الاعترافات',
          hint: '+ذكاء +بصيرة • أسلوب المناظرات',
          effects: { stats: { int: 1, ins: 1 }, skills: { politics: 1 } },
          outcome: 'فهمت آلية التفتيش؛ الخوف هنا ليس مجرد شعور، بل أداة سياسية تحكم الملوك والرعايا.'
        }
      ]
    },

    // ---------------------------------------------------------
    // 3. أزمات الشتاء والبقاء في الطفولة (سن 7 - الأدوار 3-4)
    // ---------------------------------------------------------
    {
      id: 'v6_ch1_winter_famine',
      chapter: 1,
      minAge: 7,
      maxAge: 8,
      minTurn: 3,
      maxTurn: 5,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'gharon_mentor',
      title: 'زمهرير الجوع وحصار الجليد',
      body: 'يهبط شتاء قارس يحبس القوافل ويجمد أنهار الثغر. أسعار القمح ترتفع لعنان السماء وأنين الأطفال الجائعين يملأ بيوت الطين والخيام الرثة. غارون يقسم رغيف خبزٍ أسود جاف بينك وبين طارق: «الشتاء لا يقتل بالسقيع وحده، بل باليأس. كيف تتدبر قوتك اليوم؟»',
      choices: [
        {
          id: 'famine_chop_wood',
          label: 'جمع الحطب والأخشاب من الغابة المجاورة ومقايضتها بالخبز',
          hint: '+قوة +جهد -10 +بقاء وطعام',
          effects: { stats: { str: 1 }, vitals: { stamina: -10, hp: 5 } },
          outcome: 'حملت الأخشاب الثقيلة على ظهرك الصغير حتى تصلبت عضلاتك، ونلت كيس دقيق أطعم الورشة.'
        },
        {
          id: 'famine_share_bread',
          label: 'مشاركة كسر الخبز القليلة مع أيتام الحي لكسب ولائهم',
          hint: '+كاريزما +سمعة شعبية +ود المحيطين',
          effects: { stats: { cha: 1 }, factions: { legion: 4, shadow: 4 } },
          outcome: 'التف حولك صبية الحي؛ رأوا فيك حامياً صغيراً وأصبحت لك آذانٌ وعيون في كل زاوية.'
        },
        {
          id: 'famine_raid_granary',
          label: 'مداهمة مخازن الحبوب التابعة للتجار المحتكرين خلسة',
          hint: '+تخفي +ذهب +15 • +شبهة 6',
          effects: { stats: { agi: 1 }, skills: { stealth: 1 }, vitals: { gold: 15, suspicion: 6 } },
          outcome: 'تسللت عبر فتحة التهوية وسرقت أكياساً من الشعير؛ وفرت المؤن لكن أعين الحراس باتت تترصد.'
        }
      ]
    },

    {
      id: 'v6_ch1_wolf_pack',
      chapter: 1,
      minAge: 7,
      maxAge: 8,
      minTurn: 4,
      maxTurn: 6,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'protagonist',
      title: 'مخلب في الثلج — مواجهة الذئب الشارد',
      body: 'أثناء عودتك بحطب ومؤن من أطراف الغابة، يلمع في بياض الثلج بريق عينين صفراوين؛ ذئب بري ضخم هزيل دفعه الجوع لمهاجمة أطراف الثغر، يزمجر كاشفاً عن أنيابه البيضاء ويقطع عليك طريق الرجوع.',
      choices: [
        {
          id: 'wolf_fight',
          label: 'الثبات ومواجهة الذئب بعصا مدببة وحجر حاد',
          hint: 'نزال تكتيكي أول مع وحش بري!',
          encounterId: 'frontier_wolf',
          outcome: 'شددت قبضتك على العصا الحجرية ووقفت في وجه الوحش بثبات رجلٍ بالغ.'
        },
        {
          id: 'wolf_climb_tree',
          label: 'تسلق صخرة عالية والانتظار بصبر وتضليله بقطعة شحم',
          hint: '+حدس +تخفي • تفادي القتال بذكاء',
          effects: { stats: { ins: 1 }, skills: { stealth: 1 }, vitals: { stamina: -8 } },
          outcome: 'رميت له قطعة الشحم وتسلق الصخرة بخفة؛ التهم الطعم وانصرف مبتعداً في الضباب.'
        },
        {
          id: 'wolf_torch_fire',
          label: 'إشعال حزمة قش بصوان النار لإخافته بوهج اللهب',
          hint: '+ذكاء +خيمياء • طرد الوحش',
          effects: { stats: { int: 1 }, skills: { alchemy: 1 } },
          outcome: 'انفجرت شعلة نارية حمراء أضاءت الغابة؛ ارتد الذئب مرعوباً ونجوت بلا خدش.'
        }
      ]
    },

    // ---------------------------------------------------------
    // 4. سن 8 — الأسلحة والخصومات والأسرار (الأدوار 5-8)
    // ---------------------------------------------------------
    {
      id: 'v6_ch1_tark_quarrel',
      chapter: 1,
      minAge: 8,
      maxAge: 8,
      minTurn: 5,
      maxTurn: 7,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'tark_rival',
      title: 'شجار النصال الخشبية — شرارة الخصومة',
      body: 'في فناء التدريب المغبر، يلوح طارق بسيف خشبي ثقيل ويقف أمامك متأهباً والفتيان يصفقون حوله. «يقولون إن المعلم غارون يفضل هذا الغريب التائه عليّ.. لنرَ إن كان رأسك يصمد أمام ضربة سيفٍ حقيقية أم أنك مجرد جبان!»',
      choices: [
        {
          id: 'tark_duel_wooden',
          label: 'قبول التحدي ومبارزته بالسيف الخشبي لإثبات علوك',
          hint: 'نزال تكتيكي بالسلاح الخشبي!',
          encounterId: 'tark_childhood_duel',
          outcome: 'استللت سيفك الخشبي وتقدمت وسط هتاف الفتيان لتلقينه درساً في الاتزان.'
        },
        {
          id: 'tark_provoke_words',
          label: 'استفزازه بالكلمات لكشف ثغراته ثم إسقاطه أرضاً بالحيلة',
          hint: '+براعة +سياسة • تحطيم كبريائه بالحيلة',
          effects: { stats: { agi: 1 }, skills: { politics: 1 }, meet: { charId: 'tark_rival', fear: 14, trust: 6 } },
          outcome: 'استدرجته بخفة حتى تعثر باندفاعه وطرحته على وجهه في الوحل وسط ضحك الجميع.'
        },
        {
          id: 'tark_propose_pact',
          label: 'خفض السيف وعرض رهان على اصطياد طريدة معاً بدلاً من الشجار',
          hint: '+كاريزما +ود طارق • تحويل الخصم لحليف',
          effects: { stats: { cha: 1 }, factions: { legion: 6 } },
          meet: { charId: 'tark_rival', loyalty: 20, trust: 16 },
          outcome: 'تردد طارق وخفض سيفه؛ أدرك أن قوتكما معاً تفوق شجارهما العبثي.'
        }
      ]
    },

    {
      id: 'v6_ch1_lyra_fence',
      chapter: 1,
      minAge: 8,
      maxAge: 8,
      minTurn: 6,
      maxTurn: 8,
      cityId: 'ash_frontier',
      sceneId: 'underbelly',
      speakerId: 'lyra_shadow',
      title: 'خنجر الضابط ومأزق السمسار',
      body: 'تفتح ليرا كفها المرتعشة وترتسم على شفتيها ابتسامة ماكرة؛ خنجر فولاذي مذهب عليه دمغة فرسان الفيلق الملكي. «سرقته البارحة من خيمة ضابط الإمداد.. إن أمسكوا بي سيقطعون يدي، لكن إن هربناه لسمسار الأحياء السفلى فسنشتري لحماً وملابس لعام كامل. هل تدبر إخفاءه وبيعه؟»',
      choices: [
        {
          id: 'lyra_modify_blade',
          label: 'إعادة نقش المقبض ومحو الدمغة العسكرية بمهارة الحدادة',
          hint: '+حدادة +ذكاء +35 ذهب بلا شبهة',
          effects: { stats: { int: 1 }, skills: { smithing: 1 }, vitals: { gold: 35 }, factions: { shadow: 6 } },
          meet: { charId: 'lyra_shadow', loyalty: 16, trust: 18 },
          outcome: 'بردت النصل ومسحت الشارة الملكية باحتراف؛ بيع الخنجر كقطعة عادية وظفرتما بالذهب دون ملاحقة.'
        },
        {
          id: 'lyra_hide_stash',
          label: 'إخفاء الخنجر في سراديب تحت الأرض وبيعه لاحقاً عبر قنوات الظل',
          hint: '+تخفي +ظل +25 ذهب +شبهة 5',
          effects: { stats: { agi: 1 }, skills: { stealth: 1 }, vitals: { gold: 25, suspicion: 5 }, factions: { shadow: 10 } },
          outcome: 'خبأت الخنجر في تجويف سري تحت قنوات الصرف؛ علمتك ليرا كيف تدير صفقات السوق السوداء.'
        },
        {
          id: 'lyra_warn_abandon',
          label: 'إجبارها على رمي الخنجر فوراً في البئر لأن حرس الفيلق يطوق الحي',
          hint: '+حدس -شبهة • تفادي الفخ',
          effects: { stats: { ins: 1 }, vitals: { suspicion: -6 } },
          meet: { charId: 'lyra_shadow', loyalty: 10, trust: 12 },
          outcome: 'غضبت ليرا ورمته في البئر؛ بعد نصف ساعة داهم الفرسان المقر ونجوتما بأعجوبة من حبل المشنقة.'
        }
      ]
    },

    {
      id: 'v6_ch1_vera_herbal_secret',
      chapter: 1,
      minAge: 8,
      maxAge: 9,
      minTurn: 6,
      maxTurn: 8,
      cityId: 'ash_frontier',
      sceneId: 'iron_abbey',
      speakerId: 'vera_alchemist',
      title: 'زهرة الخناق وجمر التفتيش',
      body: 'في قبو مهجور تفوح منه رائحة الكبريت وأعشاب المستنقعات، تجد فيرا تقطر عصارة زرقاء في قوارير بلورية. يداها ملطختان وعيناها مرتعبتان: «هذا مستخلص زهرة الخناق الممزوج بدهن الماعز.. هو العلاج الوحيد لحمى الرئة التي تصيب اللاجئين، لكن المحقق مالك يعتبر كل خيمياء غير مصرحة سحراً ومروقاً. ساعدني في حراسة الباب وجلب نبتة النار.»',
      choices: [
        {
          id: 'vera_help_distill',
          label: 'حراسة المدخل ومساعدتها في تقطير الترياق بإتقان',
          hint: '+خيمياء +2 • الحصول على جرعة شفاء عشبية',
          effects: { stats: { int: 1 }, skills: { alchemy: 2 }, grantPotion: 'potion_heal' },
          meet: { charId: 'vera_alchemist', loyalty: 25, trust: 22 },
          outcome: 'نجح التقطير وسلمتك فيرا قارورة شفاء مركزة: «احتفظ بها.. قد تنقذ حياتك يوماً حين يخذلك الجميع.»'
        },
        {
          id: 'vera_memorize_formula',
          label: 'دراسة تركيب الترياق وحفظ معادلة الخيمياء في ذهنك سراً',
          hint: '+ذكاء +بصيرة • فتح خيط الخيمياء المحرمة',
          effects: { stats: { int: 1, ins: 1 }, skills: { alchemy: 1 }, flags: { learned_vera_tincture: true } },
          outcome: 'طبعت خطوات التحضير في ذاكرتك؛ أدركت أن كيمياء المواد الطبيعية قوة تضاهي السيوف.'
        },
        {
          id: 'vera_report_malik',
          label: 'إبلاغ حراس الدير عن نشاطها السري لنيل الحظوة الكنسية',
          hint: '+كنيسة +15 +20 ذهب • عداوة فيرا الأبدية',
          effects: { factions: { church: 15 }, vitals: { gold: 20 }, flags: { vera_betrayed_ch1: true } },
          meet: { charId: 'inquisitor_malik', loyalty: 18, trust: 20 },
          outcome: 'اقتحم الحراس القبو وصادروا القوارير؛ حدقت فيك فيرا بعينين مشتعلتين بالكراهية قبل أن تُساق للسجن.'
        }
      ]
    },

    {
      id: 'v6_ch1_weapon_calling',
      chapter: 1,
      minAge: 8,
      maxAge: 9,
      minTurn: 7,
      maxTurn: 9,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'gharon_mentor',
      title: 'سلاح النشأة — تحديد هوية المقاتل',
      body: 'يضع المعلم غارون على منضدة خشبية سميكة أربعة أسلحة ابتدائية صُنعت في كور الورشة: «بلغتَ الثامنة يا فتى، وجسدك يشتد كل شهر. في هذه القارة لا تحميك القوانين ولا دموع الضعفاء؛ كل رجل يعيش بحسب السلاح الذي تألفه كفّه. اختر نصلك الذي ستكبر وتتعلم فنونه.»',
      choices: [
        {
          id: 'choose_sword',
          label: 'السيف الحديدي القصير (سلاح متوازن، صد سريع ورد هجوم متتابع)',
          hint: '+سيف حديدي مجهز • +قتال +براعة',
          effects: { stats: { agi: 1 }, skills: { combat: 1 }, grantWeapon: 'sword_iron' },
          outcome: 'أمسكت بمقبض السيف المصقول؛ لمع نصله في ضوء الكير معلناً بداية مسارك كفارسٍ متوازن.'
        },
        {
          id: 'choose_axe',
          label: 'فأس الحطاب الثقيل (ضربات ساحقة لكسر الدروع وثبات الخصم)',
          hint: '+فأس حطاب مجهز • +قوة صلبة',
          effects: { stats: { str: 1 }, skills: { combat: 1 }, grantWeapon: 'axe_woodman' },
          outcome: 'رفعت الفأس الثقيل وضربت به الجذع الخشبي فشطره نصفين؛ ابتسم غارون لقوة ساعدك الفطرية.'
        },
        {
          id: 'choose_spear',
          label: 'رمح الصيد ذو النصل العريض (ضربة استباقية بعيدة وإبقاء الخصم بعيداً)',
          hint: '+رمح عريض مجهز • +حدس وحذر',
          effects: { stats: { ins: 1 }, skills: { combat: 1 }, grantWeapon: 'spear_militia' },
          outcome: 'سددت طعنة خاطفة بالرمح بلغت مركز الهدف؛ سلاح حكيم يبقي الموت بعيداً عن أوردتك.'
        },
        {
          id: 'choose_bow',
          label: 'قوس الطرائد القصير وجعبة السهام (إصابة حاسمة من بعيد وتخفٍ في الظلال)',
          hint: '+قوس قصير مجهز • +تخفي وبراعة',
          effects: { stats: { agi: 1 }, skills: { stealth: 1 }, grantWeapon: 'bow_hunter' },
          outcome: 'وترت القوس وأطلقت سهماً شق العتمة ليستقر في قلب اللوح؛ خيار القناص الذي يقتل قبل أن يُرى.'
        }
      ]
    },

    // ---------------------------------------------------------
    // 5. سن 9 — تفتيش الكبار، الختم السري ومواكب الفيلق (الأدوار 9-12)
    // ---------------------------------------------------------
    {
      id: 'v6_ch1_cipher_discovery',
      chapter: 1,
      minAge: 9,
      maxAge: 9,
      minTurn: 9,
      maxTurn: 11,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'protagonist',
      title: 'الأسطوانة البرونزية والختم الملكي المفقود',
      body: 'بين جذور شجرة محترقة على تخوم الوادي القديم، تعثر على جثة فارس ترتدي بقايا درعٍ غريب الطراز لا يحمل رايات الإمارات. في قبضته الباردة أسطوانة برونزية مدموغة بشفرة ميكانيكية وختم الصقر ثلاثي الرؤوس — الرمز البائد للأسرة الملكية التي أُبيدت قبل عقود.',
      choices: [
        {
          id: 'cipher_keep_secret',
          label: 'إخفاء الأسطوانة والاحتفاظ بالختم الملكي سراً دون إظهاره لأحد',
          hint: '+حدس +ذكاء • مفتاح سر العرش المستقبلي',
          effects: { stats: { int: 1, ins: 1 }, flags: { found_royal_cipher: true } },
          outcome: 'خبأت الأسطوانة في لفافة جلدية مدفونة تحت أرضية غرفتك؛ مفتاح خطير قد يغير خارطة القارة مستقبلاً.'
        },
        {
          id: 'cipher_sell_salim',
          label: 'بيع الأسطوانة كما هي للتاجر سليم مقابل ثروة من الذهب الخالص',
          hint: '+65 ذهب • تعزيز الشراكة التجارية وفقدان الخيط',
          effects: { vitals: { gold: 65 }, skills: { trade: 1 } },
          meet: { charId: 'salim_merchant', loyalty: 18, trust: 20 },
          outcome: 'لمعت عينا سليم بذهول وهو يزن الأسطوانة؛ سلمك كيساً رناناً بالدنانير وحذرك من ذكر الأمر لأي مخلوق.'
        },
        {
          id: 'cipher_turn_church',
          label: 'تسليم الأسطوانة لمحاكم التفتيش بالدير لإبعاد الشبهات ونيل البركة',
          hint: '+كنيسة +16 +25 ذهب',
          effects: { factions: { church: 16 }, vitals: { gold: 25 } },
          meet: { charId: 'inquisitor_malik', loyalty: 14, trust: 16 },
          outcome: 'استلم مالك الختم بجدية بالغة ومنحك صك حماية رسمي؛ لكنك خسرت ورقة ضغط سياسية لا تعوض.'
        }
      ]
    },

    {
      id: 'v6_ch1_marcus_inspection',
      chapter: 1,
      minAge: 9,
      maxAge: 9,
      minTurn: 9,
      maxTurn: 12,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'marcus_legion',
      title: 'موكب الفيلق ونظرة القائد ماركوس',
      body: 'يدخل القائد ماركوس ممتطياً جواداً حربياً أسود يتبعه رتل من فرسان الفيلق المدججين بالفولاذ. تصمت البلدة رهبةً ويصطف الشبان للتفتيش السنوي. تتوقف عينا ماركوس الصقريتان عندك، ينزل عن فرسه ببطء ويحدجك باهتمام: «أنت.. تقدم. ما الذي يجعل الفتى جندياً يستحق البقاء حياً في ميدان الدماء؟»',
      choices: [
        {
          id: 'marcus_discipline',
          label: '«الانضباط الصارم، وطاعة الأوامر حتى آخر قطرة دم.»',
          hint: '+فيلق +14 +قوة • نيل إعجاب القائد العسكري',
          effects: { stats: { str: 1 }, factions: { legion: 14 } },
          meet: { charId: 'marcus_legion', loyalty: 18, trust: 16 },
          outcome: 'ابتسم ماركوس ابتسامة فولاذية نادرة وربت على كتفك: «جواب مقاتل حقيقي. سنلتقي في الأكاديمية يا بني.»'
        },
        {
          id: 'marcus_cunning',
          label: '«قراءة أرض المعركة وكسر خطة العدو قبل أن يستل سيفه.»',
          hint: '+ذكاء +سياسة • احترام ماركوس لعقلك التكتيكي',
          effects: { stats: { int: 1 }, skills: { politics: 1 }, factions: { legion: 8 } },
          meet: { charId: 'marcus_legion', loyalty: 12, trust: 18 },
          outcome: 'عقد ماركوس حاجبيه بدهشة؛ ليس معتاداً على سماع تفكير استراتيجي من فتى في التاسعة من عمره.'
        },
        {
          id: 'marcus_defiant_stare',
          label: 'الثبات في مكانك والنظر في عينيه بصمتٍ لا ينكسر',
          hint: '+هيبة وكاريزما +حدس',
          effects: { stats: { ins: 1, cha: 1 } },
          meet: { charId: 'marcus_legion', fear: 12, loyalty: 10 },
          outcome: 'حدق فيك طويلاً ثم قال لغارون: «هذا الصبي يملك عينين باردتين كالموت.. راقبه جيداً.»'
        }
      ]
    },

    {
      id: 'v6_ch1_underbelly_pits',
      chapter: 1,
      minAge: 9,
      maxAge: 10,
      minTurn: 10,
      maxTurn: 12,
      cityId: 'ash_frontier',
      sceneId: 'underbelly',
      speakerId: 'lyra_shadow',
      title: 'حلبة الأقبية والمراهنات المحرمة',
      body: 'تقودك ليرا إلى قبوٍ حجري واسع تحت مجاري الثغر؛ دخان المشاعل يغشى حلبة رملية دائرية يتعالى حولها صراخ السكارى والقتلة وهم يراهنون على قتال المرتزقة. تشير ليرا لحلقة الرهان: «هنا تصنع الثروات أو تدفن الأسنان.. هل تراهن معنا، أم تتسلل بين الجيوب المنتفخة، أم تجرب يدك في الحلبة؟»',
      choices: [
        {
          id: 'pits_exhibition_fight',
          label: 'نزول الحلبة لمواجهة لص متمرس لإثبات جسارتك أمام النقابة',
          hint: 'نزال تكتيكي داخل الحلبة المظلمة!',
          encounterId: 'alley_cutthroat',
          outcome: 'قفزت فوق الحبال إلى الرمل؛ تعالت الصرخات وأنت تستل سلاحك لمواجهة اللص وجهاً لوجه.'
        },
        {
          id: 'pits_pickpocket_drunk',
          label: 'استغلال صخب المراهنين والتسلل لسرقة أكياس الذهب',
          hint: '+تخفي +براعة +40 ذهب • +شبهة 6',
          effects: { stats: { agi: 1 }, skills: { stealth: 1 }, vitals: { gold: 40, suspicion: 6 } },
          meet: { charId: 'lyra_shadow', loyalty: 14, trust: 16 },
          outcome: 'تحركت بين الأجساد كالأفعى وملأت جيوبك بالدنانير دون أن ينتبه المراهنون الثملون.'
        },
        {
          id: 'pits_analytical_bet',
          label: 'قراءة ثبات المقاتلين والمراهنة بحكمة على الطرف الأقوى',
          hint: '+تجارة +حدس +25 ذهب بلا مخاطرة',
          effects: { stats: { ins: 1 }, skills: { trade: 1 }, vitals: { gold: 25 } },
          outcome: 'لاحظت عرجاً خفياً في ساق المقاتل الأول فراهنت على خصمه وظفرت بمكسبٍ سهل ونظيف.'
        }
      ]
    },

    {
      id: 'v6_ch1_inquisition_curfew',
      chapter: 1,
      minAge: 9,
      maxAge: 10,
      minTurn: 11,
      maxTurn: 13,
      cityId: 'ash_frontier',
      sceneId: 'iron_abbey',
      speakerId: 'inquisitor_malik',
      title: 'حظر التجوال ومطرقة التفتيش',
      body: 'تدق أجراس الدير على نحو مفاجئ ويُعلن حظر التجوال في شوارع الثغر؛ شمامسة التفتيش المسلحون يطوقون الدور بحثاً عن مخطوطات غريبة ورموز غير مرخصة. يستوقفك المحقق مالك مع فرقة من الحراس ويبدأ استجواباً متوتراً حول سبب وجودك في الشارع وحقيقة معتقداتك.',
      choices: [
        {
          id: 'curfew_debate_stand',
          label: 'خوض مناظرة حُجّة وتماسك منطقي لتفنيد كل شبهة بثقة',
          hint: 'مناظرة تكتيكية ضد محققي التفتيش!',
          encounterId: 'inquisition_novice_inquest',
          outcome: 'وقفت بثبات وبدأت تدحض اتهاماتهم بحجج دينية وقانونية محكمة أربكت الشمامسة.'
        },
        {
          id: 'curfew_feign_ignorance',
          label: 'التظاهر بالبلاهة والمسكنة والادعاء بأنك تبحث عن دواء لوالدتك',
          hint: '+كاريزما +تخفي -شبهة',
          effects: { stats: { cha: 1 }, vitals: { suspicion: -8 } },
          outcome: 'انطلت مسكنتك على الحراس ونهروك للعودة إلى البيت؛ نجوت ببراعة الممثل البارع.'
        },
        {
          id: 'curfew_bribe_guard',
          label: 'دس بضع دنانير في يد الحارس وتوجيهه لبيت تاجر مشبوه آخر',
          hint: '+سياسة -10 ذهب -شبهة',
          effects: { skills: { politics: 1 }, vitals: { gold: -10, suspicion: -10 } },
          outcome: 'أخذ الحارس الرشوة بانصياع وأشاح بوجهه عنك متجهاً لتفتيش حي التجار.'
        }
      ]
    },

    // ---------------------------------------------------------
    // 6. سن 10 — الديون، المؤامرات، وحصار المقالع (الأدوار 13-16)
    // ---------------------------------------------------------
    {
      id: 'v6_ch1_furnace_sabotage',
      chapter: 1,
      minAge: 10,
      maxAge: 10,
      minTurn: 13,
      maxTurn: 15,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'gharon_mentor',
      title: 'مؤامرة الكبريت وحريق الفرن الكبير',
      body: 'يستيقظ الثغر على دوي انفجار في فرن الصهر الرئيسي؛ سائل الكبريت المشتعل دمر قوالب السيوف المخصصة لفرسان الفيلق. تجد قطعة قماش ممزقة تخص طارق ملقاة قرب الحطام، وغارون يقف كالمطعون: «إن لم نكتشف الفاعل قبل وصول ضباط الحامية، سيحكم الفيلق بإعدام الورشة بتهمة الخيانة العسكرية!»',
      choices: [
        {
          id: 'furnace_forensic_clear_tark',
          label: 'التحقيق الجنائي وتتبع آثار الأقدام لتبرئة طارق وكشف عميل الظل الحقيقي',
          hint: '+ذكاء +حدس • طارق يدين لك بحياته',
          effects: { stats: { int: 1, ins: 1 }, skills: { smithing: 1 }, flags: { saved_tark_from_execution: true } },
          meet: { charId: 'tark_rival', loyalty: 30, trust: 28 },
          outcome: 'أثبتت أن القماش وُضع عمداً لتوريط طارق، وعثرت على أثر القاتل المأجور؛ بكى طارق امتناناً وأقسم على ولائه لك.'
        },
        {
          id: 'furnace_accuse_tark',
          label: 'تقديم القماش للحامية واتهام طارق علناً للتخلص من منافستك معه للأبد',
          hint: '+فيلق +15 • نفي طارق وتحوله لعدو لدود',
          effects: { factions: { legion: 15 }, flags: { tark_exiled_enemy: true } },
          meet: { charId: 'tark_rival', loyalty: -40, trust: -50, fear: 30 },
          outcome: 'قُبض على طارق ونُفي مقيداً بالأغلال؛ رمقك بنظرة قاتلة لا تُنسى توعدك فيها بالانتقام حين يشتد عوده.'
        },
        {
          id: 'furnace_repair_emergency',
          label: 'استنفار طاقتك وإعادة بناء الفرن مع غارون قبل بزوغ الفجر',
          hint: '+قوة +حدادة +2 • -20 جهد',
          effects: { stats: { str: 1 }, skills: { smithing: 2 }, vitals: { stamina: -20 } },
          outcome: 'واصلتما العمل ليل نهار وسط الجمر المتطاير؛ سُلّمت السيوف في موعدها ونلت لقب صانع معجزات الثغر.'
        }
      ]
    },

    {
      id: 'v6_ch1_salim_loan_trap',
      chapter: 1,
      minAge: 10,
      maxAge: 10,
      minTurn: 13,
      maxTurn: 15,
      cityId: 'ash_frontier',
      sceneId: 'salt_port',
      speakerId: 'salim_merchant',
      title: 'عرض الدين الأول — سيف المصارف ذو الحدين',
      body: 'تحتاج لشراء درعٍ حقيقي وأدوية ومؤن صلبة لدخول مرحلة الشباب، لكن نقودك شحيحة. يبتسم التاجر سليم ويفتح صرة من الدنانير اللامعة: «أعلم أنك طموح يا بني وتريد عتاداً يليق بقوتك. يمكنني إقراضك 60 ديناراً حالاً، مع فائدة بسيطة تُسددها حين تبلغ الثانية عشرة.. ما قولك في هذا العقد؟»',
      choices: [
        {
          id: 'loan_accept_greedy',
          label: 'قبول القرض المصرفي فوراً وشراء عتاد فاخر (60 ذهب مقابل دين 85)',
          hint: '+60 ذهب حالاً • تسجيل دين 85 يستحق عند سن 12',
          effects: { vitals: { gold: 60 } },
          meet: { charId: 'salim_merchant', loyalty: 14, trust: 16 },
          outcome: 'قبضت الدنانير الستين الذهبية ووقعت على العقد بدمك؛ نلت المال لكن حبل المصارف التف حول عنقك.'
        },
        {
          id: 'loan_negotiate_terms',
          label: 'المساومة بحنكة على شروط الدين وخفض الفائدة استناداً لأعراف السوق',
          hint: '+تجارة +سياسة • قرض عادل (50 ذهب مقابل 65)',
          effects: { skills: { trade: 1, politics: 1 }, vitals: { gold: 50 } },
          outcome: 'أبهرت سليماً بحججك القانونية؛ خفض الفائدة وصافحك بإعجاب تاجر كبير لتاجر ناشئ.'
        },
        {
          id: 'loan_reject_proud',
          label: 'رفض الدين بحزم والاعتماد على كفاحك الذاتي فقط دون قيود',
          hint: '+قوة إرادة +هيبة • حرية مالية مطلقة',
          effects: { stats: { str: 1, cha: 1 } },
          outcome: 'أغلقت الصرة وأعدتها إليه؛ ابتسم سليم باحترام: «عزة نفسك ستكلفك الكثير، لكنها ستجعلك سيد مصيرك.»'
        }
      ]
    },

    {
      id: 'v6_ch1_outskirt_fever',
      chapter: 1,
      minAge: 10,
      maxAge: 11,
      minTurn: 14,
      maxTurn: 16,
      cityId: 'ash_frontier',
      sceneId: 'iron_abbey',
      speakerId: 'vera_alchemist',
      title: 'حمى المستنقع وأنياب الوباء',
      body: 'تجتاح حمى خطيرة أكواخ المشردين خارج الأسوار، ويهدد المحقق مالك بحرق الأكواخ بالكامل لمنع انتشار الوباء. تأتيك فيرا لاهثة والشحوب يعلو وجهها: «لدي ترياق فعال استخلصته من جذور المستنقع، لكن حرس الدير أغلقوا البوابات. إن لم نوزعه الليلة سيموت العشرات ويحرق الباقون أحياء!»',
      choices: [
        {
          id: 'fever_smuggle_cure',
          label: 'التسلل ليلاً عبر المجاري مع فيرا لتوزيع الترياق على المصابين',
          hint: '+خيمياء +تخفي • ثقة مطلقة لفيرا وإشادة شعبية',
          effects: { stats: { agi: 1 }, skills: { alchemy: 1, stealth: 1 }, factions: { shadow: 6 } },
          meet: { charId: 'vera_alchemist', loyalty: 25, trust: 25 },
          outcome: 'أنقذتما أرواح الأطفال والفقراء في جنح الظلام؛ صار اسمك تميمة بركة بين أهالي الأحياء الفقيرة.'
        },
        {
          id: 'fever_debate_malik',
          label: 'مواجهة المحقق مالك بالدليل العلمي وإقناعه بالسماح بتجربة العلاج',
          hint: 'مناظرة تكتيكية ضد المحقق مالك!',
          encounterId: 'inquisition_trial',
          outcome: 'واجهت المحقق بالحجة والمنطق؛ ألجمته براهينك وسمح بدخول الأدوية تحت إشرافه المشدد.'
        },
        {
          id: 'fever_protect_self',
          label: 'شراء جرعة وقائية خاصة لنفسك ولرفاقك والابتعاد عن بؤرة المرض',
          hint: '+حفظ النفس • تفادي الخطر والتكاليف',
          effects: { vitals: { hp: 10, stamina: 10 } },
          outcome: 'حصنت نفسك والورشة؛ هدأت العاصفة بعد أيام لكن نظرات الأسى في عيون فيرا ظلت تلاحقك.'
        }
      ]
    },

    {
      id: 'v6_ch1_quarry_ambush',
      chapter: 1,
      minAge: 10,
      maxAge: 11,
      minTurn: 15,
      maxTurn: 17,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'protagonist',
      title: 'حصار الذئاب البشرية في المقالع المهجورة',
      body: 'أثناء استكشافك المقالع الحجرية القديمة تتبعاً لخيط أثر أو بحثاً عن خامات نادرة، يحاصرك رجال مدججون بالفولاذ الصدئ؛ قطاع طرق من الفرسان المنشقين يقودهم قاطع طريق متمرس ذو ندبة عريضة يطلب كل ما تملك أو حياتك.',
      choices: [
        {
          id: 'quarry_fight_bandit',
          label: 'استلال سلاحك والقتال حتى الرمق الأخير مستخدماً كل ما تعلمته',
          hint: 'مواجهة تكتيكية حامية ضد قاطع طريق المقالع!',
          encounterId: 'quarry_bandit',
          outcome: 'استللت نصلك وتراجعت نحو الصخور لتضيق عليه زوايا الهجوم واستعددت للاشتباك.'
        },
        {
          id: 'quarry_smoke_bomb',
          label: 'إلقاء مسحوق كبريتي خانق وإحداث انفجار غباري للفرار بخفة',
          hint: '+خيمياء +تخفي • هروب تكتيكي نظيف',
          effects: { stats: { agi: 1 }, skills: { alchemy: 1, stealth: 1 }, vitals: { stamina: -12 } },
          outcome: 'أعمى المسحوق عيونهم وسعلوا بشدة، بينما قفزت بين الفجوات الصخرية واختفيت في الأفق.'
        },
        {
          id: 'quarry_bribe_parley',
          label: 'التفاوض مع زعيمهم وعرض معلومات عن مسار قافلة تجارية مقبلة',
          hint: '+سياسة +تجارة • نجاة بالدهاء وزيادة الشبهة',
          effects: { stats: { cha: 1 }, skills: { politics: 1 }, vitals: { suspicion: 8 } },
          outcome: 'قبل الزعيم الصفقة وتركك تمر؛ أدركت أن الكلمات في هذا العالم قد تكون أمضى من النصال.'
        }
      ]
    },

    // ---------------------------------------------------------
    // 7. سن 11 — أبطال الثغر، اختبار الانتقال، والرحيل (الأدوار 17-20)
    // ---------------------------------------------------------
    {
      id: 'v6_ch1_tark_reconciliation',
      chapter: 1,
      minAge: 11,
      maxAge: 11,
      minTurn: 16,
      maxTurn: 18,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'tark_rival',
      title: 'لحظة الصدق على سفح الحصن',
      body: 'قبل أشهر من اختبار الثغر الكبير، تجلس مع طارق فوق سور الحصن المطل على البراري اللانهائية. ينظر طارق إلى سيفه ثم إليك بجدية تخلو من الغرور: «قضينا سنوات هنا معاً.. كنا صبية نتشاجر على كسر الخبز. غداً سنصبح رجالاً نقاتل في حروب القارة. قل لي بصدق: هل سنظل نتناحر، أم نعقد حلفاً يحمي ظهر كل منا؟»',
      choices: [
        {
          id: 'tark_blood_vow',
          label: 'مد اليد وعقد حلف دم أخوي: «معاً حتى القمة أو الهلاك.»',
          hint: '+ولاء وثقة طارق القصوى • رفيق مخلص مستقبلاً',
          effects: { stats: { cha: 1 }, factions: { legion: 10 }, flags: { tark_blood_brother: true } },
          meet: { charId: 'tark_rival', loyalty: 40, trust: 35 },
          outcome: 'جرحتما كفيكما وختمتما العهد؛ صار طارق سندك المخلص الذي سيفديك بروحه في قادم السنين.'
        },
        {
          id: 'tark_solemn_rivalry',
          label: '«في ساحة المعركة كل سيف لنفسه يا طارق.. فليربح الأقوى.»',
          hint: '+هيبة وقوة • منافسة شريفة صلبة',
          effects: { stats: { str: 1 }, flags: { tark_solemn_rival: true } },
          meet: { charId: 'tark_rival', loyalty: 15, trust: 15, fear: 18 },
          outcome: 'أومأ طارق برأسه وقبض على مقبض سيفه: «ليكن ذلك.. لن أتساهل معك في الاختبار الكبير.»'
        },
        {
          id: 'tark_subdue_fear',
          label: 'تذكيره بفارق القوة بينكما وإخضاعه لهيبتك القيادية',
          hint: '+خوف طارق +25 • ولاء قائم على الرهبة',
          effects: { stats: { cha: 1 }, flags: { tark_subdued_minion: true } },
          meet: { charId: 'tark_rival', fear: 30, loyalty: 5 },
          outcome: 'أشاح طارق بوجهه خافضاً بصره في انكسار؛ صار يخشى غضبك كقائد صارم لا يعرف الشفقة.'
        }
      ]
    },

    {
      id: 'v6_ch1_war_rumors',
      chapter: 1,
      minAge: 11,
      maxAge: 11,
      minTurn: 17,
      maxTurn: 19,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'gharon_mentor',
      title: 'طبول الحرب وأوامر التعبئة',
      body: 'تصل مراسيم ملكية مدموغة بالشمع الأحمر إلى مقر الحامية؛ اندلعت المعارك بين إمارات الشمال والجنوب، وثغر الرماد أُعلن منطقة عسكرية ذات تعبئة قصوى. ينظر غارون إلى السماء الملبدة بالدخان: «الطفولة انتهت هنا يا ولدي.. الأيام القادمة لن تطلب منك أن تلعب، بل أن تختار فصيلك وتدفع ثمن بقائك.»',
      choices: [
        {
          id: 'war_forge_legion',
          label: 'العمل ليل نهار في ورشة السلاح لتزويد كتائب الفيلق بالفولاذ',
          hint: '+حدادة +فيلق +15 +35 ذهب',
          effects: { skills: { smithing: 1 }, factions: { legion: 15 }, vitals: { gold: 35 } },
          outcome: 'أنجزت سيوفاً ودروعاً صلبة نالت ثناء الضباط ورفعت مكانتك في سجلات الفيلق.'
        },
        {
          id: 'war_gather_intelligence',
          label: 'جمع الشائعات العسكرية وتحركات القوافل وبيعها لشبكة الظل',
          hint: '+تخفي +ظل +15 +45 ذهب',
          effects: { skills: { stealth: 1 }, factions: { shadow: 15 }, vitals: { gold: 45 } },
          outcome: 'سجلت أسرار قوافل الإمداد وسلمتها لليرا؛ نلت مكافأة ذهبية ضخمة ووثقت صلتك بالنقابة.'
        },
        {
          id: 'war_stockpile_grain',
          label: 'مساعدة التاجر سليم في احتكار الحبوب وتأمين مستودعات الميناء',
          hint: '+تجارة +تجار +15 +50 ذهب',
          effects: { skills: { trade: 1 }, factions: { merchants: 15 }, vitals: { gold: 50 } },
          outcome: 'أمنت مخازن القمح بمكاسب خيالية؛ أدركت كيف تصنع الحروب ثروات التجار العظمى.'
        }
      ]
    },

    {
      id: 'v6_ch1_frontier_trial_prep',
      chapter: 1,
      minAge: 11,
      maxAge: 11,
      minTurn: 18,
      maxTurn: 19,
      priority: 8,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'protagonist',
      title: 'عشية اختبار الثغر الكبير',
      body: 'تُفرش الساحة الرئيسية بالرمل الأحمر وتُعلق رايات الفيلق والنقابات. غداً يُقام «اختبار الثغر» السنوي للفتيان الذين أتموا الحادية عشرة؛ الفائز يُتوج بطلاً للثغر وتُفتح أمامه أبواب القلاع والأكاديميات وخزائن التجار. الليلة هي فرصتك الأخيرة للاستعداد وصقل سلاحك وروحك.',
      choices: [
        {
          id: 'prep_hone_weapon',
          label: 'صقل حد السلاح ودرعك والتدرب حتى الفجر على حركات الكسر والرد',
          hint: '+قتال +ثبات • جاهزية بدنية قصوى',
          effects: { stats: { str: 1 }, skills: { combat: 1 }, vitals: { stamina: -8 } },
          outcome: 'صار نصلك حاداً كالشفرة وجسدك متأهباً لأعنف ضربات الخصوم.'
        },
        {
          id: 'prep_tactical_scouting',
          label: 'دراسة حركات المنافسين وشراء جرعة منشطة مركزة من فيرا',
          hint: '+ذكاء +خيمياء • الحصول على جرعة طاقة',
          effects: { stats: { int: 1 }, grantPotion: 'potion_stamina' },
          outcome: 'كشفت نقاط ضعف منافسيك وحصلت على جرعة تمنحك صفاءً ذهنياً فائقاً.'
        },
        {
          id: 'prep_meditation_poise',
          label: 'الاعتكاف والتأمل في غرفتك لاسترجاع هدوء وعيك وعقلك البالغ',
          hint: '+حدس وبصيرة +استعادة كامل الطاقة',
          effects: { stats: { ins: 1 }, vitals: { hp: 15, stamina: 25 } },
          outcome: 'أيقظت تركيزك الذهني العميق؛ دخلت الساحة ببرود رجلٍ خاض مئات المعارك.'
        }
      ]
    },

    {
      id: 'v6_ch1_frontier_trial',
      chapter: 1,
      minAge: 11,
      maxAge: 11,
      minTurn: 18,
      maxTurn: 20,
      priority: 15,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'marcus_legion',
      title: 'نزال أبطال الثغر — التتويج والمجد',
      body: 'تمتلئ مدرجات الساحة بفرسان الفيلق والتجار ورجال المحكمة. يجلس القائد ماركوس في شرفة القيادة بينما يهتف الآلاف في المدرجات. يُنادى اسمك وسط الغبار لمواجهة بطل كتيبة الحرس الصاعد في النزال النهائي الذي سيخلد اسمك في سجلات الثغر!',
      choices: [
        {
          id: 'trial_combat_champion',
          label: 'خوض النزال القتالي النهائي وإسقاط بطل الحرس بمهارة سلاحك',
          hint: 'المواجهة التكتيكية الكبرى للفصل الأول! الفوز يمنح لقب بطل الثغر',
          encounterId: 'armored_deserter',
          outcome: 'اندفعت إلى وسط الساحة وسط هتاف الجماهير والتحمت مع بطل الحرس بقوة وثبات.'
        },
        {
          id: 'trial_outmaneuver_cunning',
          label: 'استخدام الرمل والسرعة والمراوغة لإسقاطه في فخ حركي وإجباره على الاستسلام',
          hint: '+براعة +قتال • الفوز باللقب بالدهاء',
          effects: { stats: { agi: 1 }, skills: { combat: 1 }, flags: { won_frontier_trial_ch1: true }, vitals: { gold: 50 }, factions: { legion: 15 } },
          meet: { charId: 'marcus_legion', loyalty: 18, trust: 20 },
          outcome: 'تفاديت ضربته الفولاذية بخفة وسددت ضربة لمفصل ركبته أسقطته على الرمل؛ وقف ماركوس مصفقاً وأعلنك بطلاً للثغر!'
        },
        {
          id: 'trial_tactical_surrender',
          label: 'إظهار مهارة دفاعية فائقة ثم التراجع بكرامة لحفظ أسرار قوتك وتفادي عيون المحققين',
          hint: '+حدس +تخفي • سلامة تامة وتفادي الشبهات',
          effects: { stats: { ins: 1 }, skills: { stealth: 1 }, vitals: { gold: 20, suspicion: -10 } },
          outcome: 'نلت احترام الجميع بصلابتك الدفاعية وانسحبت بهدوء؛ تجنبت عيون مالك المتربصة وحافظت على غموضك.'
        }
      ]
    },

    {
      id: 'v6_ch1_farewell_vow',
      chapter: 1,
      minAge: 11,
      maxAge: 11,
      minTurn: 19,
      maxTurn: 20,
      priority: 18,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'gharon_mentor',
      title: 'عهد الوداع وسكون الليلة الأخيرة',
      body: 'تنطفئ مشاعل الساحة ويهدأ الثغر تحت ضوء القمر الفضي. يقف معك المعلم غارون والرفاق الذين رافقوا طفولتك قرب بوابات الخروج. ينظر غارون إليك بعينين تلمعان بفخر مشوب بالحزن: «كبرت يا بني ولم تعد ذلك الطفل التائه في الرماد.. غداً تفتح القارة أبوابها أمامك. خذ هذه القطعة المصنوعة بيدك لتذكرك دائماً بمن تكون.»',
      choices: [
        {
          id: 'vow_eternal_loyalty',
          label: 'معانقة المعلم والرفاق وقطع عهد بالعودة لحماية الثغر يوماً ما',
          hint: '+ولاء الطاقم الأقصى +درع المسافر المجهز',
          effects: { stats: { cha: 1 }, grantArmor: 'armor_traveler', factions: { legion: 10 } },
          meet: { charId: 'gharon_mentor', loyalty: 30, trust: 30 },
          outcome: 'ألبسك غارون درع المسافر الجلدي المقوى بيديه؛ دمعت عيناه وقال: «اذهب واصنع مجدك يا فتى.. هذا الثغر بيتك دوماً.»'
        },
        {
          id: 'vow_silent_ambition',
          label: 'مبادلتهم نظرة عازمة: «سأعود ولكن كحاكمٍ أو سيدٍ يملك هذا العالم.»',
          hint: '+هيبة وقوة إرادة +درع المسافر',
          effects: { stats: { str: 1, ins: 1 }, grantArmor: 'armor_traveler' },
          outcome: 'أدرك الجميع أنك لم تعد صبياً عادياً، بل ظلٌ يحمل طموحاً يزلزل عروش الملوك.'
        }
      ]
    },

    {
      id: 'v6_ch1_departure_ch2',
      chapter: 1,
      minAge: 11,
      maxAge: 11,
      minTurn: 20,
      maxTurn: 20,
      priority: 25,
      cityId: 'ash_frontier',
      sceneId: 'ash_frontier',
      speakerId: 'protagonist',
      title: 'عبور البوابات — انطلاق الظل التاه نحو آفاق الشباب (سن 12)',
      body: 'تُفتح بوابات ثغر الرماد العظيمة مع بزوغ أول خيوط الفجر؛ بلغت الثانية عشرة من عمرك ووقفت على مشارف الطريق القاري الممتد. لقد تخلصت من قيود الطفولة وصمدت أمام الجوع والدم والمؤامرات. أمامك الآن قارة كاملة بخمس مدن كبرى وفصائل تتصارع على السيادة.. إلى أين ستتجه خطوتك الأولى في الفصل الثاني؟',
      choices: [
        {
          id: 'dest_royal_capital',
          label: 'السفر إلى العاصمة الملكية (الانضمام لأكاديمية الفيلق أو خوض بلاط الأمراء)',
          hint: 'وجهة الفصل الثاني: العاصمة الملكية • +فيلق',
          effects: { setLocation: 'royal_capital', factions: { legion: 12 }, flags: { ch2_path_chosen: 'legion_court' } },
          outcome: 'امتطيت عربة الفيلق المتجهة إلى العاصمة الملكية؛ أسوارها الرخامية وأبراج أمرائها تلوح في الأفق.'
        },
        {
          id: 'dest_underbelly',
          label: 'النزول إلى الأحياء السفلى (الغوص في دهاليز نقابة الظل والاغتيالات والسوق السوداء)',
          hint: 'وجهة الفصل الثاني: الأحياء السفلى • +ظل',
          effects: { setLocation: 'underbelly', factions: { shadow: 12 }, flags: { ch2_path_chosen: 'shadow_guild' } },
          outcome: 'رافقت ليرا نحو أنفاق وسراديب الأحياء السفلى؛ حيث يُباع ويُشترى كل شيء في الظلام.'
        },
        {
          id: 'dest_salt_port',
          label: 'مرافقة قوافل ميناء الملح (ركوب البحر وتجارة التوابل والقروض المصرفية الكبرى)',
          hint: 'وجهة الفصل الثاني: ميناء الملح • +تجار',
          effects: { setLocation: 'salt_port', factions: { merchants: 12 }, flags: { ch2_path_chosen: 'merchants_union' } },
          outcome: 'ركبت مع قافلة سليم المتجهة لميناء الملح؛ رائحة البحر والسفن الضخمة استقبلت طموحاتك التجارية.'
        },
        {
          id: 'dest_iron_abbey',
          label: 'المسير إلى الدير الحصين (البحث في المخطوطات المحرمة، الخيمياء، ومحاكم التفتيش)',
          hint: 'وجهة الفصل الثاني: الدير الحصين • +كنيسة',
          effects: { setLocation: 'iron_abbey', factions: { church: 12 }, flags: { ch2_path_chosen: 'holy_order' } },
          outcome: 'سلكت طريق المرتفعات الصخرية نحو الدير الحصين؛ جدرانه السوداء وأجراسه تحرس أسرار العالم القديم.'
        }
      ]
    }
  ];

  // Register all events into global story registry
  CH1_EVENTS.forEach(function (ev) {
    GameApp.V6StoryEvents.push(ev);
  });

  GameApp.V6EventsCh1 = CH1_EVENTS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CH1_EVENTS;
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});
  GameApp.Data = GameApp.Data || {};

  var ENDINGS = {
    ending_truce_architect: {
      id: 'ending_truce_architect',
      crest: '🕊',
      title: 'مهندس الهدنة الكبرى',
      tag: 'نهاية الدهاء والسلام',
      hint: 'اكشف المؤامرة، ارفع ذكاءك وتجارتك، واختر فرض الهدنة واجتز اختبار الحسم في سهل الرماد.',
      summary: 'بقوة الأدلة وبصيرة عقلك، فضحت خيوط المحرضين أمام قادة البشر والجان وأرغمت الشياطين على التراجع نحو حدودها. تحوّل ابن حداد المدينة إلى صانع أول سلام مستدام منذ قرن، وتُحفظ وثائقك في أرشيف الممالك الثلاث.'
    },
    ending_crown_champion: {
      id: 'ending_crown_champion',
      crest: '🛡',
      title: 'بطل التاج البشري',
      tag: 'نهاية المجد العسكري',
      hint: 'تحالف مع مملكة البشر، ارفع مهارتك القتالية وعتادك، وانتصر في معركة الحسم لصالح التاج.',
      summary: 'من حراسة الأسوار إلى قيادة معركة سهل الرماد، صمدت كدرعٍ لا يُكسر أمام طوفان الحرب. يُمنح والدك لقب صانع السلاح الملكي وتدخل التاريخ كأصغر قائد قاد المملكة نحو البقاء.'
    },
    ending_eternal_forge: {
      id: 'ending_eternal_forge',
      crest: '⚒',
      title: 'أستاذ السندان الخالد',
      tag: 'نهاية الحرفي الأسطوري',
      hint: 'تخصص في الحدادة (10+) أو اصنع سلاح الشهاب، وتوج إرث السندان في الاختبار الختامي.',
      summary: 'بينما تتبدل حدود العروش، يبقى اسم سندانك محفوراً على أعظم النصال والدروع في القارة. مزجت علوم عالمك السابق بأسرار معادن هذا العالم فصار الملوك يتنافسون على نيل توقيع مطرقتك.'
    },
    ending_elven_guardian: {
      id: 'ending_elven_guardian',
      crest: '🌿',
      title: 'حارس الظلة الخضراء',
      tag: 'نهاية حليف الغابة',
      hint: 'ساعد الجان الغابويين من الطفولة أو الشباب، واكسب ثقتهم حتى الانتصار في معركة الحسم.',
      summary: 'برهنت على أن الوفاء لا تحدّه الدماء ولا الأعراق. بوقوفك مع عشائر الجان في أحلك ساعات الحصار، أُنقذت الغابة القديمة وصرت أول بشري يُمنح موضع الشرف تحت الأشجار المقدسة.'
    },
    ending_demon_counselor: {
      id: 'ending_demon_counselor',
      crest: '🔥',
      title: 'مستشار العرش الجهنمي',
      tag: 'نهاية القوة والمخاطرة',
      hint: 'عقد صفقات مع سماسرة الشياطين وانحز لفيالقهم وانتصر في معركة سهل الرماد.',
      summary: 'لم تكتفِ بحدود البشر الضيقة؛ اخترت التحالف مع قوة الأراضي القاحلة بجرأة لا تعرف التردد. اليوم يجلس ابن الحداد على طاولة أمراء الشياطين، يفرض هيبته على خريطة العالم الجديد.'
    },
    ending_shadow_blade: {
      id: 'ending_shadow_blade',
      crest: '🗡',
      title: 'النصل الخفي',
      tag: 'نهاية الظلال والمكائد',
      hint: 'تفوق في مهارة الظلال والمكائد واستولِ على خيوط نقابة الاغتيالات.',
      summary: 'نجوت من السموم والفخاخ حتى قلبت الطاولة على قتلة الإبرة الصامتة. لا تذكر كتب التاريخ اسمك على المنابر، لكن القادة والمجرمين على السواء يهمسون برعبٍ أمام ظلك الذي يحفظ توازن المدينة من العتمة.'
    },
    ending_trade_emperor: {
      id: 'ending_trade_emperor',
      crest: '🪙',
      title: 'سيد الظل والذهب',
      tag: 'نهاية الثروة والنفوذ',
      hint: 'ابنِ ثروة طائلة وتفوق في التجارة ومساومات الحرب لتسيطر على الإمدادات.',
      summary: 'بينما استنزفت الجيوش خزائنها في ساحات الدم، نسجت شبكة قوافل ومعلومات تربط الأطراف كلها بك. أصبحت أزمات الحرب سلماً لثروتك، وصار قصر عائلتك هو البنك الحقيقي للقارة.'
    },
    ending_wandering_heir: {
      id: 'ending_wandering_heir',
      crest: '🧭',
      title: 'المسافر الحر',
      tag: 'نهاية النجاة والرحيل',
      hint: 'أعطِ الأولوية لسلامة والديك واختر الرحيل بعيداً عن الحرب (أو انجُ مثخناً بعد إخفاق معركة الحسم).',
      summary: 'أدركت أن حروب الملوك لا تنتهي إلا برماد جديد؛ خرجت حياً من قلب العاصفة مع من تبقى حولك، لتعبر الجبال الغربية وتبني حياة هادئة بعيداً عن عرشٍ مسفوك بالدم.'
    },
    ending_assassinated: {
      id: 'ending_assassinated',
      crest: '☠',
      title: 'ضحية الخنجر المسموم',
      tag: 'نهاية مبكرة — اغتيال',
      hint: 'تقع عند نفاد صحتك أثناء مطاردة القتلة أو عند ارتفاع مستوى التهديد.',
      summary: 'رغم حذرك ومهاراتك، أطبق الظلام أخيراً قبل أن يكتمل فصلك. طُويت رحلتك تحت نصل مأجور في أزقة عالمٍ لم يغفر لك معرفتك بالأسرار.'
    },
    ending_fallen: {
      id: 'ending_fallen',
      crest: '🥀',
      title: 'رماد الجبهة',
      tag: 'نهاية مبكرة — سقوط في الميدان',
      hint: 'تقع عند نفاد صحتك في المعارك أو المخاطر الميدانية أو معركة الحسم الأخيرة.',
      summary: 'انهارت قواك أمام قسوة العالم والصراعات الدامية. سقطت واقفاً تدافع عن طريقك وسط لهيب الحديد، وبقي ذكرك في حديث رفاقك ووالديك.'
    }
  };

  function getEndingList() {
    return Object.keys(ENDINGS).map(function (k) { return ENDINGS[k]; });
  }

  function getEndingById(id) {
    return ENDINGS[id] || ENDINGS.ending_wandering_heir;
  }

  function resolveFinalEnding(state) {
    var choice = state.flags.climaxChoice || '';

    // If player failed the climax battle check in المحطة 64 (but survived hp > 0)
    if (state.flags.climaxFailed) {
      return 'ending_wandering_heir';
    }

    // 1. Respect explicit climax direction when backed by journey
    if (choice === 'truce' && (state.attributes.int >= 12 || state.flags.exposedLordValkor || state.flags.peaceMovementActive || state.flags.carriesOriginalSeal)) {
      return 'ending_truce_architect';
    }
    if (choice === 'elves' && (state.factions.elves >= 15 || state.warAlignment === 'elves')) {
      return 'ending_elven_guardian';
    }
    if (choice === 'demons' && (state.factions.demons >= 15 || state.warAlignment === 'demons')) {
      return 'ending_demon_counselor';
    }
    if (choice === 'humans' && (state.factions.humans >= 15 || state.warAlignment === 'humans')) {
      return 'ending_crown_champion';
    }
    if (choice === 'forge' && (state.skills.smithing >= 10 || state.career === 'smith' || state.flags.craftedMeteorBlade)) {
      return 'ending_eternal_forge';
    }
    if (choice === 'trade') {
      return 'ending_trade_emperor';
    }
    if (choice === 'shadow') {
      return 'ending_shadow_blade';
    }
    if (choice === 'traveler') {
      return 'ending_wandering_heir';
    }

    // 2. Fallback automatic scoring
    if (state.flags.tookOverShadowGuild || (state.skills.shadow || 0) >= 16) return 'ending_shadow_blade';
    if (state.flags.fullConspiracySolved && state.attributes.int >= 14) return 'ending_truce_architect';
    if (state.warAlignment === 'elves' && state.factions.elves >= 20) return 'ending_elven_guardian';
    if (state.warAlignment === 'demons' && state.factions.demons >= 20) return 'ending_demon_counselor';
    if (state.warAlignment === 'humans' && state.factions.humans >= 20) return 'ending_crown_champion';
    if (state.career === 'smith' || state.skills.smithing >= 14) return 'ending_eternal_forge';
    if (state.career === 'merchant' || state.gold >= 150) return 'ending_trade_emperor';

    return 'ending_wandering_heir';
  }

  function getCharacterEpilogues(state) {
    var f = state.flags || {};
    var fac = state.factions || {};
    var epilogues = [];
    var isEarlyDeath = state.endingId === 'ending_assassinated' || state.endingId === 'ending_fallen';

    // 1. Parents: Garon & Serene (reacts strongly to family score!)
    if (isEarlyDeath) {
      epilogues.push({ name: 'غارون وسيرين (الوالدان)', fate: 'أُطفئ كير الورشة أياماً حداداً على رحيلك المبكر، وبقي سلاحك الصغير معلقاً فوق الموقد تذكاراً حزيناً.' });
    } else if ((fac.family || 0) < 30) {
      epilogues.push({ name: 'غارون وسيرين (الوالدان)', fate: 'بقي الفتور والجفاء حاجزاً بينكم؛ واصل والدك العمل صامتاً بعد الحرب بينما تباعدت طرقكم نحو مدن مختلفة.' });
    } else if (f.evacuatedFamilySafe || (state.endingId === 'ending_wandering_heir' && (fac.family || 0) >= 45)) {
      epilogues.push({ name: 'غارون وسيرين (الوالدان)', fate: 'نَعِما بأمان تام في مزرعة التلال البعيدة عن رماد الحصار، يشاهدان فخرك ونجاتك.' });
    } else if (f.heroOfTheSiege || (fac.family || 0) >= 65) {
      epilogues.push({ name: 'غارون وسيرين (الوالدان)', fate: 'ظلا في قلب المدينة معزَّزَين بمكانتك الجديدة، وأصبحت ورشتكم رمزاً للصمود والشرف.' });
    } else {
      epilogues.push({ name: 'غارون وسيرين (الوالدان)', fate: 'واصلا حياتهما الهادئة بجانب السندان بعد أن انحسرت العاصفة عن أبوابهما.' });
    }

    // 2. Elarin (Elven Envoy)
    if ((fac.elves || 0) <= -20 || (f.betrayedElvenFugitive && !f.elvenContactOpen)) {
      epilogues.push({ name: 'إيلارين (كشافة الجان)', fate: 'لم تغفر جرح الخيانة والعداء؛ قادت دوريات الغابة بصرامة تمنع اقتراب أي بشري من تخوم الأشجار.' });
    } else if ((fac.elves || 0) >= 22 || state.endingId === 'ending_elven_guardian') {
      epilogues.push({ name: 'إيلارين (مبعوثة الغابة)', fate: 'ارتقت إلى مجلس شيوخ الغابة وحافظت على صداقتك العميقة التي بدأت خلف كومة الفحم في الثامنة.' });
    } else if (f.elvenContactOpen) {
      epilogues.push({ name: 'إيلارين (مبعوثة الغابة)', fate: 'أبقت قنوات الاتصال مفتوحة بين المدينة والغابة بفضل توازنك وعقلك الراجح.' });
    }

    // 3. Arkan (Demon Broker)
    if ((fac.demons || 0) >= 15 || f.tookDemonSteel) {
      epilogues.push({ name: 'أركان (سمسار الجمر)', fate: 'ظل يدير صفقات الحدود القاحلة وهو يذكر اسمه واسمك باحترام تاجر نادر.' });
    }

    // 4. Career-specific ally / rival
    if (state.career === 'smith') {
      if (f.kaserTrueAlly) {
        epilogues.push({ name: 'كاسر (شريك السندان)', fate: 'طوى صفحة الغيرة القديمة وتحول معك إلى أعظم ثنائي حدادة في المقاطعة.' });
      } else if (f.kaserExposed) {
        epilogues.push({ name: 'كاسر (المنافس السابق)', fate: 'انكفأ عن السوق بعد افتضاح سرقة التصاميم وأقر بتفوق مهارتك.' });
      } else {
        epilogues.push({ name: 'كاسر (ابن رئيس النقابة)', fate: 'واصل العمل في ورشته باحترام حذر أمام اسمك الصاعد.' });
      }
    } else if (state.career === 'adventurer') {
      if (f.savedLyra) {
        epilogues.push({ name: 'ليرا (رفيقة النقابة)', fate: 'بقيت ذراعك اليمنى في المهام الكبرى ولم تفارق ابتسامتها ساحات النصر.' });
      } else if (f.lyraResentsYou) {
        epilogues.push({ name: 'ليرا (كشافة النقابة)', fate: 'سلكت طرقاً مستقلة في المقاطعة متجنبة العمل في فرقتك.' });
      }
    } else if (state.career === 'merchant') {
      if (f.absorbedDalosEmpire) {
        epilogues.push({ name: 'دالوس (التاجر المخضرم)', fate: 'تراجع للعمل تحت إدارتك بعد أن استحوذت على معظم حقوق التوريد والأسواق.' });
      } else if (f.alliedDalos) {
        epilogues.push({ name: 'دالوس (حليف القوافل)', fate: 'بقي شريكك التجاري الوثيق في عقود العاصمة والموانئ.' });
      }
    }

    // 5. Shadow Guild
    if (f.tookOverShadowGuild) {
      epilogues.push({ name: 'نقابة «الإبرة الصامتة»', fate: 'تبدلت ولاءاتها في الظل بالكامل لتأتمر بأمرك وتراقب أعداءك بصمت.' });
    } else if (f.killedShadowMaster || f.shadowTruceMade) {
      epilogues.push({ name: 'نقابة «الإبرة الصامتة»', fate: 'انكسرت شوكتها بعد مواجهتك الحاسمة، ومُحي اسم عائلتك من قوائم الاستهداف للأبد.' });
    }

    // 6. Rare Sword Path
    if ((state.skills && state.skills.sword_path > 0) || f.unlockedSwordPath) {
      epilogues.push({ name: 'الزاهد الأعمى (مسار السيف)', fate: 'تناقل المبارزون حكاية الشاب الذي أيقظ فن «مسار السيف» المنسي وأسقط خصومه بضربة واحدة صامتة.' });
    }

    // 7. Climax failure note if survived wounded
    if (f.climaxFailed && !isEarlyDeath) {
      epilogues.push({ name: 'صدى سهل الرماد', fate: 'رغم شجاعتك، لم تكتمل خطتك الكبرى في معركة سهل الرماد فانسحبت حياً لتبدأ فصلاً أهدأ بعيداً عن الصراع.' });
    }

    return epilogues;
  }

  GameApp.Endings = {
    ENDINGS: ENDINGS,
    getEndingList: getEndingList,
    getEndingById: getEndingById,
    resolveFinalEnding: resolveFinalEnding,
    getCharacterEpilogues: getCharacterEpilogues
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.Endings;
  }
})(typeof window !== 'undefined' ? window : globalThis);

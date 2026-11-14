(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var state = null;
  var settings = null;
  var typingTimer = null;
  var fullStoryText = '';
  var lastTypedKey = null;
  var shopFilter = 'all';
  var quickFlowNotice = null;

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function iconHtml(key, rarity, sizeCls) {
    var Icons = GameApp.Icons;
    var svg = Icons ? Icons.getIconSvg(key) : '';
    var rCls = rarity ? ' rarity-' + rarity : '';
    var sCls = sizeCls ? ' ' + sizeCls : '';
    return '<span class="item-icon-badge' + rCls + sCls + '">' + svg + '</span>';
  }

  function rarityPill(rarity) {
    var meta = (GameApp.State.RARITY_META || {})[rarity || 'common'];
    if (!meta) return '';
    return '<span class="rarity-pill rarity-' + escapeHtml(meta.id) + '">' + escapeHtml(meta.label) + '</span>';
  }

  function init() {
    settings = GameApp.Storage.getSettings();
    GameApp.Audio.setEnabled(settings.soundEnabled);

    bindEvents();
    switchSidebarTab(settings.activeSidebarTab || 'character', true);
    renderWelcomeLegacy();
    updateEndingsCountBadge();

    var saved = GameApp.Storage.loadAuto();
    if (saved && saved.phase !== 'ended') {
      $('btn-resume-auto').classList.remove('hidden');
    }

    // Initialize background preview state so HUD isn't blank behind modal
    state = GameApp.Engine.startNewGame();
    lastTypedKey = null;
    renderAll();
  }

  function renderWelcomeLegacy() {
    var box = $('legacy-box');
    var legacy = GameApp.Storage.getLegacyBonus ? GameApp.Storage.getLegacyBonus() : null;
    if (!legacy) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }
    box.classList.remove('hidden');
    box.innerHTML =
      '<label class="legacy-toggle">' +
      '<input type="checkbox" id="chk-use-legacy"' + (settings.useLegacy !== false ? ' checked' : '') + '>' +
      '<span>تفعيل إرث الرحلات السابقة: ' + escapeHtml(legacy.title) + '</span>' +
      '</label>' +
      '<div>' + escapeHtml(legacy.desc) + ' (مفتوح بعد اكتشاف ' + legacy.count + ' نهاية)</div>';

    $('chk-use-legacy').addEventListener('change', function (e) {
      settings.useLegacy = e.target.checked;
      GameApp.Storage.saveSettings(settings);
    });
  }

  function switchSidebarTab(tabId, skipSave) {
    var validTabs = ['character', 'factions', 'gear'];
    if (validTabs.indexOf(tabId) === -1) tabId = 'character';

    validTabs.forEach(function (t) {
      var panel = $('side-panel-' + t);
      if (panel) {
        if (t === tabId) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
    });

    document.querySelectorAll('.side-tab-btn').forEach(function (btn) {
      if (btn.getAttribute('data-side-tab') === tabId) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    if (!skipSave) {
      settings.activeSidebarTab = tabId;
      GameApp.Storage.saveSettings(settings);
    }
  }

  function bindEvents() {
    $('btn-start-fresh').addEventListener('click', function () {
      GameApp.Audio.play('click');
      startFreshRun();
      $('welcome-modal').classList.add('hidden');
    });

    $('btn-resume-auto').addEventListener('click', function () {
      GameApp.Audio.play('click');
      var saved = GameApp.Storage.loadAuto();
      if (saved) {
        state = GameApp.Engine.ensureStateIntegrity(saved);
        if (!state.currentEventId && state.phase !== 'ended') {
          var ev = GameApp.Engine.selectNextEvent(state);
          if (ev) state.currentEventId = ev.id;
        }
        lastTypedKey = null;
        renderAll();
        if (state.pendingShop && state.phase !== 'ended') {
          openShopModal();
        }
      }
      $('welcome-modal').classList.add('hidden');
    });

    $('story-text-box').addEventListener('click', skipTypewriter);

    $('btn-next-turn').addEventListener('click', function () {
      handleNextTurn();
    });

    $('btn-new-game').addEventListener('click', function () {
      GameApp.Audio.play('click');
      openConfirmNewGameModal();
    });

    document.querySelectorAll('.side-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        GameApp.Audio.play('click');
        switchSidebarTab(btn.getAttribute('data-side-tab'));
      });
    });

    $('btn-ending-restart').addEventListener('click', function () {
      GameApp.Audio.play('click');
      startFreshRun();
    });

    $('btn-ending-gallery').addEventListener('click', openEndingsModal);
    $('btn-chronicle').addEventListener('click', openChronicleModal);
    $('btn-endings').addEventListener('click', openEndingsModal);
    $('btn-saves').addEventListener('click', openSavesModal);
    $('btn-settings').addEventListener('click', openSettingsModal);
    $('btn-close-modal').addEventListener('click', closeModal);

    $('modal-overlay').addEventListener('click', function (e) {
      if (e.target === $('modal-overlay')) closeModal();
    });

    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    if (!$('welcome-modal').classList.contains('hidden')) return;

    if (!$('modal-overlay').classList.contains('hidden')) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Enter') {
        var finishShopBtn = $('btn-finish-shop');
        if (finishShopBtn) {
          e.preventDefault();
          finishShopBtn.click();
        }
      }
      return;
    }

    if (state.phase === 'ended') return;

    if (e.key === ' ' && typingTimer !== null) {
      e.preventDefault();
      skipTypewriter();
      return;
    }

    if (state.awaitingNext && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleNextTurn();
      return;
    }

    // Match exact 1-based choice index including disabled buttons so pressing 2 never triggers choice 3!
    if (!state.awaitingNext && e.key >= '1' && e.key <= '9') {
      var idx = parseInt(e.key, 10) - 1;
      var buttons = $('choices-container').querySelectorAll('.choice-btn');
      if (buttons[idx] && !buttons[idx].disabled) {
        buttons[idx].click();
      }
    }

    var lower = e.key.toLowerCase();
    if (lower === 'c') openChronicleModal();
    if (lower === 'e') openEndingsModal();
    if (lower === 's') openSavesModal();
  }

  function startFreshRun() {
    state = GameApp.Engine.startNewGame(undefined, { useLegacy: settings.useLegacy !== false });
    lastTypedKey = null;
    quickFlowNotice = null;
    GameApp.Storage.saveAuto(state);
    renderAll();
  }

  function openConfirmNewGameModal() {
    var html =
      '<p class="story-text">هل تريد بدء رحلة جديدة من عمر السابعة؟ سيؤدي ذلك إلى استبدال الحفظ التلقائي الحالي ما لم تحفظه في إحدى الخانات.</p>' +
      '<div class="confirm-actions">' +
      '<button type="button" id="btn-confirm-save-first" class="secondary-btn">حفظ في الخانة 1 ثم البدء</button>' +
      '<button type="button" id="btn-confirm-restart-now" class="primary-btn">بدء رحلة جديدة الآن</button>' +
      '<button type="button" id="btn-confirm-cancel" class="icon-btn">إلغاء</button>' +
      '</div>';

    openModal('تأكيد بدء رحلة جديدة', html);

    $('btn-confirm-save-first').addEventListener('click', function () {
      GameApp.Storage.saveToSlot(1, state);
      GameApp.Audio.play('success');
      startFreshRun();
      closeModal();
    });
    $('btn-confirm-restart-now').addEventListener('click', function () {
      GameApp.Audio.play('click');
      startFreshRun();
      closeModal();
    });
    $('btn-confirm-cancel').addEventListener('click', closeModal);
  }

  function renderAll() {
    renderHud();
    renderQuickStatus();
    renderSidebar();
    renderStage();
    updateEndingsCountBadge();
  }

  function renderHud() {
    var S = GameApp.State;
    $('hud-phase-label').textContent =
      state.phase === 'childhood'
        ? 'المرحلة الأولى • التنشئة (ربع سنوي)'
        : state.phase === 'youth'
          ? 'المرحلة الثانية • الشباب والحرب (6 قرارات/سنة)'
          : 'نهاية الرحلة';

    var displayAge = state.phase === 'ended' ? Math.min(18, state.age) : state.age;
    $('hud-age').textContent = 'العمر: ' + displayAge + ' سنوات';
    $('hud-period').textContent = S.getPeriodLabel(state);
    $('hud-turn-counter').textContent = 'محطة ' + Math.min(state.turnIndex, state.totalTurns) + ' / ' + state.totalTurns;

    var pct = state.phase === 'ended' ? 100 : Math.min(100, Math.round((state.turnIndex / state.totalTurns) * 100));
    $('hud-progress-fill').style.width = pct + '%';

    $('hud-hp').textContent = state.hp + '/' + state.maxHp;
    $('hud-gold').textContent = state.gold;
    $('hud-rep').textContent = state.rep;

    var threatInfo = S.getThreatLabel(state.threat);
    $('hud-threat').textContent = threatInfo.label + ' (' + state.threat + ')';
    var pill = $('hud-threat-pill');
    pill.className = 'vital-pill vital-threat ' + threatInfo.cls;

    var pathText = S.CAREER_LABELS[state.career] || state.career;
    if (state.warAlignment && state.warAlignment !== 'none') {
      pathText += ' • ' + (S.ALIGNMENT_LABELS[state.warAlignment] || '');
    }
    $('hud-path').textContent = pathText;
  }

  function bindElixirButtons(container) {
    if (!container) return;
    container.querySelectorAll('[data-use-elixir]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-use-elixir');
        var res = GameApp.Engine.useElixir(state, key);
        if (res.ok) {
          GameApp.Audio.play('success');
          GameApp.Storage.saveAuto(state);
          renderAll();
        }
      });
    });
  }

  function renderQuickStatus() {
    var critBanner = $('critical-hp-banner');
    if (state.phase !== 'ended' && state.hp > 0 && state.hp < 35) {
      critBanner.textContent = '⚠ خطر حرج: صحتك (' + state.hp + ')! استخدم إكسير شفاء أو تجنب المواجهات المميتة.';
      critBanner.classList.remove('hidden');
    } else {
      critBanner.classList.add('hidden');
      critBanner.textContent = '';
    }

    var armorMit = GameApp.Engine.getDamageMitigation ? GameApp.Engine.getDamageMitigation(state, 'war') : Math.floor((state.gear.armorDefense || 0) * 0.7);
    var weaponBonus = Math.round((state.gear.weaponPower || 0) * 2.5);
    $('quick-readiness-mini').textContent = 'دفاع -' + armorMit + ' صحة • هجوم +' + weaponBonus + '%';

    var elix = state.elixirs || { healing: 0, antidote: 0, focus: 0 };
    var canUseNow = state.phase !== 'ended' && !state.awaitingNext;
    var items = [
      { key: 'healing', label: 'شفاء', icon: 'elixir_heal', count: elix.healing || 0, disabled: !canUseNow || (elix.healing || 0) <= 0 || state.hp >= state.maxHp },
      { key: 'antidote', label: 'ترياق', icon: 'elixir_anti', count: elix.antidote || 0, disabled: !canUseNow || (elix.antidote || 0) <= 0 },
      { key: 'focus', label: 'تركيز', icon: 'elixir_focus', count: elix.focus || 0, disabled: !canUseNow || (elix.focus || 0) <= 0 || state.tempCheckBonus > 0 }
    ];

    var Icons = GameApp.Icons;
    $('quick-elixir-bar').innerHTML = items
      .map(function (it) {
        var svg = Icons ? Icons.getIconSvg(it.icon) : '';
        return (
          '<button type="button" class="elixir-btn" data-use-elixir="' + it.key + '"' +
          (it.disabled ? ' disabled' : '') + '>' +
          svg + '<span>' + it.label + ' (' + it.count + ')</span>' +
          '</button>'
        );
      })
      .join('');

    bindElixirButtons($('quick-elixir-bar'));
  }

  function renderSidebar() {
    var S = GameApp.State;

    // Attributes
    var attrHtml = '';
    Object.keys(S.ATTR_LABELS).forEach(function (k) {
      attrHtml +=
        '<div class="stat-cell">' +
        '<span class="stat-name">' + escapeHtml(S.ATTR_LABELS[k]) + '</span>' +
        '<span class="stat-val">' + state.attributes[k] + '</span>' +
        '</div>';
    });
    $('attributes-list').innerHTML = attrHtml;

    // Intelligence threshold hint
    var curInt = state.attributes.int;
    var unlockedTiers = 0;
    var nextTier = null;
    S.INT_THRESHOLDS.forEach(function (t) {
      if (curInt >= t) unlockedTiers += 1;
      else if (nextTier === null) nextTier = t;
    });
    $('int-tier-hint').textContent = nextTier
      ? 'بصيرة الذكاء: المستوى ' + unlockedTiers + ' مفتوح • العتبة التالية عند ذكاء ' + nextTier
      : 'بصيرة الذكاء: جميع المستويات الإدراكية مفتوحة!';

    // Combat Readiness & Shop Discount
    var armorMit = GameApp.Engine.getDamageMitigation ? GameApp.Engine.getDamageMitigation(state, 'war') : Math.floor((state.gear.armorDefense || 0) * 0.7);
    var weaponBonus = Math.round((state.gear.weaponPower || 0) * 2.5);
    var tradeDisc = GameApp.ShopData && GameApp.ShopData.getTradeDiscountPct ? GameApp.ShopData.getTradeDiscountPct(state) : 0;
    var readyHtml =
      '<div><strong>الجاهزية القتالية:</strong> تخفيف الضرر (-' + armorMit + ' صحة) • دعم السلاح (+' + weaponBonus + '% قتال)</div>';
    if (tradeDisc > 0) {
      readyHtml += '<div><strong>الميزة التجارية:</strong> خصم ' + tradeDisc + '% في المتجر السنوي</div>';
    }
    if ((state.attributes.ins || 0) >= 8) {
      readyHtml += '<div><strong>تنبيه الحدس:</strong> حدسك العالي يميّز الخيارات عالية الخطورة.</div>';
    }
    $('readiness-box').innerHTML = readyHtml;

    // Skills (only display discovered skills > 0)
    var skillHtml = '';
    Object.keys(S.SKILL_LABELS).forEach(function (k) {
      var val = state.skills[k] || 0;
      if (val <= 0) return;
      var extraCls = k === 'sword_path' ? ' stat-sword' : '';
      skillHtml +=
        '<div class="stat-cell' + extraCls + '">' +
        '<span class="stat-name">' + (k === 'sword_path' ? '⚔ ' : '') + escapeHtml(S.SKILL_LABELS[k]) + '</span>' +
        '<span class="stat-val">' + val + '</span>' +
        '</div>';
    });
    if (!skillHtml) {
      skillHtml = '<div class="skills-empty-hint">لم تكتسب أي مهارة بعد — اختياراتك ستكشف قدراتك وتطوّرها.</div>';
    }
    $('skills-list').innerHTML = skillHtml;

    // Factions
    var factionHtml = '';
    Object.keys(S.FACTION_LABELS).forEach(function (k) {
      var val = state.factions[k];
      var pct = Math.round(((val + 100) / 200) * 100);
      var color = val >= 20 ? '#48a878' : val <= -15 ? '#d94c4c' : '#d4a359';
      var stance = val >= 35 ? 'حليف وثيق' : val >= 10 ? 'ودّ' : val <= -25 ? 'عداء صريح' : val <= -5 ? 'توتر' : 'محايد';
      factionHtml +=
        '<div class="faction-row">' +
        '<div class="faction-top"><span>' + escapeHtml(S.FACTION_LABELS[k]) + '</span><span>' + stance + ' (' + val + ')</span></div>' +
        '<div class="faction-bar-bg"><div class="faction-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '</div>';
    });
    $('factions-list').innerHTML = factionHtml;

    // Gear Detailed Cards with SVG Icons & Rarity
    var wRar = state.gear.weaponRarity || 'common';
    var aRar = state.gear.armorRarity || 'common';
    var accRar = state.gear.accessoryRarity || 'common';
    var gearHtml =
      '<div class="gear-item-card rarity-' + escapeHtml(wRar) + '">' +
      iconHtml(state.gear.weaponIcon || 'sword', wRar) +
      '<div class="gear-item-info">' +
      '<div class="gear-item-title-row"><strong>السلاح: ' + escapeHtml(state.gear.weapon) + '</strong>' + rarityPill(wRar) + '</div>' +
      '<div class="gear-item-sub">+' + state.gear.weaponPower + ' قوة سلاح (+' + Math.round(state.gear.weaponPower * 2.5) + '% قتال)</div>' +
      '</div></div>' +
      '<div class="gear-item-card rarity-' + escapeHtml(aRar) + '">' +
      iconHtml(state.gear.armorIcon || 'leather_armor', aRar) +
      '<div class="gear-item-info">' +
      '<div class="gear-item-title-row"><strong>الدرع: ' + escapeHtml(state.gear.armor) + '</strong>' + rarityPill(aRar) + '</div>' +
      '<div class="gear-item-sub">+' + state.gear.armorDefense + ' دفاع (يخفف الضرر ويدعم فحوصات الصمود)</div>' +
      '</div></div>';

    if (state.gear.accessory && state.gear.accessory !== 'لا يوجد') {
      gearHtml +=
        '<div class="gear-item-card rarity-' + escapeHtml(accRar) + '">' +
        iconHtml(state.gear.accessoryIcon || 'charm_wood', accRar) +
        '<div class="gear-item-info">' +
        '<div class="gear-item-title-row"><strong>التميمة: ' + escapeHtml(state.gear.accessory) + '</strong>' + rarityPill(accRar) + '</div>' +
        '<div class="gear-item-sub">' + escapeHtml(state.gear.accessoryDesc || 'تميمة مجهزة') + '</div>' +
        '</div></div>';
    } else {
      gearHtml +=
        '<div class="gear-item-card rarity-common">' +
        iconHtml('charm_wood', 'common') +
        '<div class="gear-item-info">' +
        '<div class="gear-item-title-row"><strong>التميمة: لا يوجد</strong></div>' +
        '<div class="gear-item-sub">اشترِ أو اكسب تميمة من المتجر أو الأحداث</div>' +
        '</div></div>';
    }

    if (state.assets && state.assets.caravanShare) {
      var carYield = (state.skills && state.skills.trade >= 10) ? 30 : 22;
      gearHtml +=
        '<div class="gear-item-card rarity-rare">' +
        iconHtml('caravan', 'rare') +
        '<div class="gear-item-info">' +
        '<div class="gear-item-title-row"><strong>حصة في قافلة تجارية</strong>' + rarityPill('rare') + '</div>' +
        '<div class="gear-item-sub">دخل سنوي مضمون: +' + carYield + ' ذهب كل عام</div>' +
        '</div></div>';
    }
    if (state.assets && state.assets.safeHouse) {
      gearHtml +=
        '<div class="gear-item-card rarity-rare">' +
        iconHtml('safehouse', 'rare') +
        '<div class="gear-item-info">' +
        '<div class="gear-item-title-row"><strong>بيت عائلي محصّن</strong>' + rarityPill('rare') + '</div>' +
        '<div class="gear-item-sub">-8 تهديد سنوياً، وتقليل إضافي (-2 صحة) للضرر</div>' +
        '</div></div>';
    }
    $('gear-box').innerHTML = gearHtml;

    renderAccessoryWardrobe();
    renderElixirDetailList();
    renderTraitsDetail();
  }

  function renderAccessoryWardrobe() {
    var list = state.ownedAccessories || [];
    if (list.length <= 0) {
      $('accessory-wardrobe').innerHTML = '<div class="skills-empty-hint">لا تملك تمائم في الخزانة بعد.</div>';
      return;
    }
    $('accessory-wardrobe').innerHTML = list
      .map(function (acc) {
        var isEq = state.gear.accessory === acc.name;
        var rar = acc.rarity || 'uncommon';
        return (
          '<button type="button" class="wardrobe-btn rarity-' + escapeHtml(rar) + (isEq ? ' equipped' : '') + '" data-equip-acc="' + escapeHtml(acc.name) + '">' +
          '<span class="wardrobe-main">' + iconHtml(acc.icon || 'charm_wood', rar, 'sm') +
          '<span>' + (isEq ? '✓ ' : '') + escapeHtml(acc.name) + '</span></span>' +
          '<span class="wardrobe-bonus-txt">' + escapeHtml(acc.desc || '') + '</span>' +
          '</button>'
        );
      })
      .join('');

    $('accessory-wardrobe').querySelectorAll('[data-equip-acc]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-equip-acc');
        if (GameApp.Engine.equipAccessory(state, name)) {
          GameApp.Audio.play('click');
          GameApp.Storage.saveAuto(state);
          renderAll();
        }
      });
    });
  }

  function renderElixirDetailList() {
    var elix = state.elixirs || { healing: 0, antidote: 0, focus: 0 };
    var canUseNow = state.phase !== 'ended' && !state.awaitingNext;
    var healAmt = 35 + (state.traits.indexOf('نور التعقيم') !== -1 ? 12 : 0);
    var rows = [
      { key: 'healing', name: 'إكسير الشفاء', icon: 'elixir_heal', rar: 'common', desc: '+' + healAmt + ' صحة فورية', count: elix.healing || 0, disabled: !canUseNow || (elix.healing || 0) <= 0 || state.hp >= state.maxHp },
      { key: 'antidote', name: 'ترياق السموم', icon: 'elixir_anti', rar: 'uncommon', desc: '-14 تهديد و+12% ضد الكمائن', count: elix.antidote || 0, disabled: !canUseNow || (elix.antidote || 0) <= 0 },
      { key: 'focus', name: 'جرعة التركيز', icon: 'elixir_focus', rar: 'rare', desc: '+18% لفرصة نجاح اختبارك القادم', count: elix.focus || 0, disabled: !canUseNow || (elix.focus || 0) <= 0 || state.tempCheckBonus > 0 }
    ];

    $('elixir-pouch').innerHTML = rows
      .map(function (r) {
        return (
          '<div class="elixir-detail-row">' +
          '<div class="elixir-detail-left">' +
          iconHtml(r.icon, r.rar, 'sm') +
          '<div><div><strong>' + r.name + ' (' + r.count + ')</strong></div><div class="elixir-detail-desc">' + r.desc + '</div></div>' +
          '</div>' +
          '<button type="button" class="elixir-btn" data-use-elixir="' + r.key + '"' + (r.disabled ? ' disabled' : '') + '>شرب</button>' +
          '</div>'
        );
      })
      .join('');

    bindElixirButtons($('elixir-pouch'));
  }

  function renderTraitsDetail() {
    var TDefs = GameApp.State.TRAIT_EFFECTS || {};
    if (state.traits.length > 0) {
      $('traits-list').innerHTML = state.traits
        .map(function (tr) {
          var def = TDefs[tr];
          return (
            '<div class="trait-card-row">' +
            '<strong>🏅 ' + escapeHtml(tr) + '</strong>' +
            '<span>' + escapeHtml(def ? def.desc : 'وسم شرف من رحلتك') + '</span>' +
            '</div>'
          );
        })
        .join('');
    } else {
      $('traits-list').innerHTML = '<div class="skills-empty-hint">لا توجد أوسمة فعّالة بعد.</div>';
    }
  }

  function renderActiveBuffsBar() {
    var bar = $('active-buffs-bar');
    var pills = [];
    if (state.phase !== 'ended' && state.hp > 0 && state.hp < 35) {
      pills.push('<span class="buff-pill danger-inline">⚠ صحة حرجة (' + state.hp + ')</span>');
      if ((state.elixirs.healing || 0) > 0 && !state.awaitingNext) {
        pills.push('<button type="button" class="elixir-btn" data-use-elixir="healing">❤ شرب إكسير شفاء (' + state.elixirs.healing + ')</button>');
      }
    }
    if (state.tempCheckBonus > 0) {
      pills.push('<span class="buff-pill">⚡ جرعة التركيز مفعّلة (+' + state.tempCheckBonus + '% للاختبار القادم)</span>');
    }
    if (state.flags && state.flags.antidoteActive) {
      pills.push('<span class="buff-pill">🧪 ترياق السموم نشط (+12% لمكافحة الكمائن)</span>');
    }
    if (state.pendingShop && state.phase !== 'ended') {
      pills.push('<button type="button" id="btn-open-pending-shop" class="secondary-btn">🛒 المتجر السنوي مفتوح — اضغط للتسوق</button>');
    }
    if (pills.length === 0) {
      bar.classList.add('hidden');
      bar.innerHTML = '';
    } else {
      bar.classList.remove('hidden');
      bar.innerHTML = pills.join('');
      var shopBtn = $('btn-open-pending-shop');
      if (shopBtn) shopBtn.addEventListener('click', openShopModal);
      bindElixirButtons(bar);
    }
  }

  function renderStage() {
    var qBanner = $('quick-flow-banner');
    if (quickFlowNotice && state.phase !== 'ended') {
      qBanner.innerHTML = quickFlowNotice;
      qBanner.classList.remove('hidden');
    } else {
      qBanner.classList.add('hidden');
      qBanner.innerHTML = '';
    }

    if (state.phase === 'ended') {
      renderEnding();
      return;
    }

    $('ending-panel').classList.add('hidden');
    $('story-text-box').classList.remove('hidden');

    var event = GameApp.Engine.findEventById(state.currentEventId);
    if (!event) {
      event = GameApp.Engine.selectNextEvent(state);
      if (event) state.currentEventId = event.id;
    }

    if (!event) {
      $('event-title').textContent = 'توقف المسار';
      $('story-text').textContent = 'انتهت الأحداث المتاحة في هذا المسار.';
      return;
    }

    var catBadge = $('event-category');
    catBadge.textContent = event.isRipple ? '🔗 ' + (event.categoryLabel || 'امتداد قرار سابق') : (event.categoryLabel || 'حدث');
    catBadge.className = 'category-badge ' + (event.isRipple ? 'cat-ripple' : getCategoryClass(event.category));

    $('event-season-hint').textContent =
      state.phase === 'childhood' ? 'قرار يحدد ربع السنة' : 'محطة موسمية (6 في السنة)';

    $('event-title').textContent = event.title;
    renderActiveBuffsBar();

    // Prevent restarting typewriter if we are re-rendering the SAME turn event!
    var textContent = GameApp.Engine.resolveText(event.text, state);
    var curTypedKey = state.turnIndex + ':' + event.id;
    if (lastTypedKey !== curTypedKey) {
      lastTypedKey = curTypedKey;
      startTypewriter(textContent);
    } else {
      fullStoryText = textContent;
      if (!typingTimer) {
        $('story-text').textContent = textContent;
      }
    }

    if (state.awaitingNext && state.lastOutcome) {
      $('choices-container').classList.add('hidden');
      renderOutcome(state.lastOutcome);
    } else {
      $('outcome-panel').classList.add('hidden');
      $('choices-container').classList.remove('hidden');
      renderChoices(event);
    }
  }

  function getCategoryClass(category) {
    if (category === 'assassin') return 'cat-assassin';
    if (category === 'war') return 'cat-war';
    if (category === 'family') return 'cat-family';
    if (category === 'story') return 'cat-story';
    return '';
  }

  function startTypewriter(text) {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    fullStoryText = text;
    var el = $('story-text');

    if (settings.textSpeed === 'instant' || settings.quickFlow) {
      el.textContent = fullStoryText;
      return;
    }

    var step = settings.textSpeed === 'fast' ? 3 : 1;
    var delay = settings.textSpeed === 'fast' ? 14 : 22;
    var idx = 0;
    el.textContent = '';

    typingTimer = setInterval(function () {
      idx += step;
      if (idx >= fullStoryText.length) {
        el.textContent = fullStoryText;
        clearInterval(typingTimer);
        typingTimer = null;
      } else {
        el.textContent = fullStoryText.slice(0, idx);
      }
    }, delay);
  }

  function skipTypewriter() {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
      $('story-text').textContent = fullStoryText;
    }
  }

  function renderChoices(event) {
    var container = $('choices-container');
    var choices = GameApp.Engine.getAvailableChoices(state, event);
    var S = GameApp.State;
    container.innerHTML = '';

    choices.forEach(function (ch, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      var isSword = ch.minSkill && ch.minSkill.sword_path;
      var extraCls = isSword ? ' choice-sword' : ch.minInt ? ' choice-int' : (ch.minSkill || ch.minAttr) ? ' choice-skill' : '';
      btn.className = 'choice-btn' + extraCls;

      var afford = GameApp.Engine.canAffordChoice(state, ch);
      if (!afford.ok) {
        btn.disabled = true;
      }

      var tagsHtml = '';
      if (ch.minInt) {
        tagsHtml += '<span class="tag-pill tag-int">بصيرة ذكاء (' + ch.minInt + '+)</span>';
      }
      if (ch.minAttr) {
        Object.keys(ch.minAttr).forEach(function (ak) {
          tagsHtml += '<span class="tag-pill tag-ins">بصيرة ' + escapeHtml(S.ATTR_LABELS[ak] || ak) + ' (' + ch.minAttr[ak] + '+)</span>';
        });
      }
      if (ch.minSkill) {
        Object.keys(ch.minSkill).forEach(function (sk) {
          var cls = sk === 'sword_path' ? 'tag-sword' : 'tag-skill';
          tagsHtml += '<span class="tag-pill ' + cls + '">تخصص ' + escapeHtml(S.SKILL_LABELS[sk] || sk) + ' (' + ch.minSkill[sk] + '+)</span>';
        });
      }
      if (ch.minFaction) {
        Object.keys(ch.minFaction).forEach(function (fk) {
          tagsHtml += '<span class="tag-pill tag-skill">🤝 ' + escapeHtml(S.FACTION_LABELS[fk] || fk) + ' (' + ch.minFaction[fk] + '+)</span>';
        });
      }
      if (ch.requiresElixir) {
        tagsHtml += '<span class="tag-pill tag-skill">🧪 ' + escapeHtml(S.ELIXIR_LABELS[ch.requiresElixir] || ch.requiresElixir) + '</span>';
      }
      if (Array.isArray(ch.requiresFlags) && ch.requiresFlags.length > 0) {
        tagsHtml += '<span class="tag-pill tag-ripple">🔗 أثر قرار سابق</span>';
      }
      var chance = GameApp.Engine.getChoiceChance(state, ch, event);
      if (chance !== null) {
        var checkLabel = S.ATTR_LABELS[ch.check.attr] || '';
        if (ch.check.skill) {
          var hasSkill = (state.skills[ch.check.skill] || 0) > 0;
          checkLabel += ' + ' + (S.SKILL_LABELS[ch.check.skill] || '') + (hasSkill ? '' : ' (غير مكتسبة)');
        }
        var synCount = GameApp.Engine.getChoiceSynergyCount(state, ch);
        if (synCount > 0) checkLabel += ' + أثر قراراتك 🔗';
        tagsHtml += '<span class="tag-pill tag-check">نجاح ' + chance + '% (' + escapeHtml(checkLabel) + ')</span>';
      }

      // Intuition passive whisper when INS >= 8
      if ((state.attributes.ins || 0) >= 8 && ch.fail && ch.fail.effects && (ch.fail.effects.hp || 0) <= -28) {
        tagsHtml += '<span class="tag-pill tag-ins">👁 حدس: خطر قاتل عند الإخفاق</span>';
      }

      if (ch.minGold) {
        tagsHtml += '<span class="tag-pill tag-cost">تكلفة: ' + ch.minGold + ' ذهب</span>';
      }

      var subText = ch.sub || '';
      if (!afford.ok && afford.reason) {
        subText = (subText ? subText + ' • ' : '') + 'غير متاح (' + afford.reason + ')';
      }

      btn.innerHTML =
        '<div class="choice-top">' +
        '<span class="choice-label"><span class="choice-num">' + (index + 1) + '</span>' + escapeHtml(ch.label) + '</span>' +
        '<div class="choice-tags">' + tagsHtml + '</div>' +
        '</div>' +
        (subText ? '<div class="choice-sub">' + escapeHtml(subText) + '</div>' : '');

      btn.addEventListener('click', function () {
        handleChoiceClick(ch.id);
      });

      container.appendChild(btn);
    });
  }

  function formatDeltasHtml(deltas) {
    return (deltas || [])
      .map(function (d) {
        if (d.val === null) {
          return '<span class="delta-pill delta-pos">' + escapeHtml(d.label) + '</span>';
        }
        var isPos = d.invertColor ? d.val < 0 : d.val > 0;
        var sign = d.val > 0 ? '+' : '';
        var cls = d.isNewSkill ? 'delta-new-skill' : isPos ? 'delta-pos' : 'delta-neg';
        return (
          '<span class="delta-pill ' + cls + '">' +
          escapeHtml(d.label) + ' ' + sign + d.val +
          '</span>'
        );
      })
      .join('');
  }

  function handleChoiceClick(choiceId) {
    skipTypewriter();
    quickFlowNotice = null;
    var outcome = GameApp.Engine.resolveChoice(state, choiceId);
    if (!outcome) return;

    if (outcome.status === 'success') GameApp.Audio.play('success');
    else if (outcome.status === 'fail') GameApp.Audio.play('fail');
    else if (state.career === 'smith') GameApp.Audio.play('forge');
    else GameApp.Audio.play('click');

    // Quick-flow option: skip intermediate "Next Turn" screen on routine repeatable events while surfacing summary toast!
    if (settings.quickFlow && outcome.isRoutine && state.phase !== 'ended') {
      quickFlowNotice = '<span>✓ ' + escapeHtml(outcome.text) + '</span>' + formatDeltasHtml(outcome.deltas);
      handleNextTurn();
      return;
    }

    GameApp.Storage.saveAuto(state);
    renderAll();
  }

  function renderOutcome(outcome) {
    var panel = $('outcome-panel');
    panel.classList.remove('hidden');

    var badge = $('outcome-badge');
    if (outcome.status === 'success') {
      badge.textContent = 'نجاح (' + outcome.chance + '%)';
      badge.className = 'outcome-badge';
    } else if (outcome.status === 'fail') {
      badge.textContent = 'إخفاق (' + outcome.chance + '%)';
      badge.className = 'outcome-badge fail';
    } else {
      badge.textContent = 'نتيجة القرار';
      badge.className = 'outcome-badge neutral';
    }

    $('outcome-deltas').innerHTML = formatDeltasHtml(outcome.deltas);
    $('outcome-text').textContent = outcome.text;
  }

  function handleNextTurn() {
    GameApp.Audio.play('click');
    var nextEv = GameApp.Engine.advanceTurn(state);
    if (nextEv && nextEv.category === 'assassin') {
      GameApp.Audio.play('danger');
    } else if (state.phase === 'ended') {
      GameApp.Audio.play('ending');
    }
    GameApp.Storage.saveAuto(state);
    renderAll();
    if (state.pendingShop && state.phase !== 'ended') {
      shopFilter = 'all';
      openShopModal();
    }
  }

  function matchesShopFilter(it) {
    if (shopFilter === 'all') return true;
    if (shopFilter === 'elixirs') return it.type === 'elixir' || it.type === 'service';
    if (shopFilter === 'gear') return it.type === 'weapon' || it.type === 'armor' || it.type === 'accessory';
    if (shopFilter === 'assets') return it.type === 'asset' || Boolean(it.minFaction);
    return true;
  }

  function openShopModal() {
    if (!GameApp.ShopData) return;
    var shopAge = state.shopYear || state.age;
    var isChildhoodShop = shopAge <= 10;
    var title = shopAge === 18
      ? 'سوق التجهيز النهائي قبل معركة سهل الرماد'
      : isChildhoodShop
        ? 'السوق الموسمي الصغير (نهاية عام ' + shopAge + ')'
        : 'المتجر السنوي للمقاطعة (نهاية عام ' + shopAge + ')';

    var entries = GameApp.ShopData.getAvailableShopItems(state);
    var assetNotes = [];
    if (state.assets && state.assets.caravanShare) {
      var carInc = (state.skills && state.skills.trade >= 10) ? 30 : 22;
      assetNotes.push('+' + carInc + ' ذهب من القافلة');
    }
    if (state.assets && state.assets.safeHouse) assetNotes.push('-8 تهديد من تحصين البيت');
    if (state.lastYearTax > 0) assetNotes.push('ضريبة العام (-' + state.lastYearTax + ' ذهب)');

    var html = '';
    if (GameApp.ShopData.isBlackMarket && GameApp.ShopData.isBlackMarket(state)) {
      html += '<div class="shop-blackmarket-banner">⚠ التهديد مرتفع (55+): المتاجر الرسمية أغلقت خوفاً منك! تشتري الآن من السوق السوداء (+30% سعر).</div>';
    }
    html +=
      '<div class="shop-header-bar">' +
      '<div class="shop-note">' +
      (assetNotes.length > 0 ? '<strong>ملخص نهاية العام:</strong> ' + escapeHtml(assetNotes.join(' • ')) : 'جهّز نفسك بالإكسير والعتاد والتمائم للعام القادم.') +
      '</div>' +
      '<div class="shop-gold-badge">🪙 ذهبك: ' + state.gold + '</div>' +
      '</div>';

    var filters = [
      { id: 'all', label: 'الكل' },
      { id: 'elixirs', label: 'إكسير وتطهير' },
      { id: 'gear', label: 'أسلحة ودروع وتمائم' },
      { id: 'assets', label: 'استثمار وأعراق' }
    ];
    html += '<div class="shop-filter-bar">' +
      filters.map(function (f) {
        return '<button type="button" class="shop-filter-btn' + (shopFilter === f.id ? ' active' : '') + '" data-shop-filter="' + f.id + '">' + f.label + '</button>';
      }).join('') +
      '</div>';

    var filtered = entries.filter(function (entry) { return matchesShopFilter(entry.item); });

    // Group items cleanly by category
    var categories = [];
    var byCat = {};
    filtered.forEach(function (entry) {
      var cat = entry.item.category;
      if (!byCat[cat]) {
        byCat[cat] = [];
        categories.push(cat);
      }
      byCat[cat].push(entry);
    });

    if (categories.length === 0) {
      html += '<p class="story-text">لا توجد بضائع مطابقة لهذا التصنيف حالياً.</p>';
    } else {
      categories.forEach(function (cat) {
        html += '<h4 class="shop-category-title">' + escapeHtml(cat) + '</h4><div class="shop-grid">';
        byCat[cat].forEach(function (entry) {
          var it = entry.item;
          var rar = it.rarity || 'common';
          var canAfford = state.gold >= entry.finalPrice;
          html +=
            '<div class="shop-item-card rarity-' + escapeHtml(rar) + '">' +
            '<div class="shop-item-top">' +
            '<div class="shop-item-head">' +
            iconHtml(it.iconKey || 'sword', rar) +
            '<div class="shop-item-titles"><h5>' + escapeHtml(it.name) + '</h5>' + rarityPill(rar) + '</div>' +
            '</div>' +
            '<span class="shop-price">🪙 ' + entry.finalPrice + '</span>' +
            '</div>' +
            '<p>' + escapeHtml(it.desc) + '</p>' +
            '<button type="button" class="' + (canAfford ? 'primary-btn' : 'secondary-btn') + '" data-buy-item="' + escapeHtml(it.id) + '"' +
            (!canAfford ? ' disabled' : '') + '>شراء</button>' +
            '</div>';
        });
        html += '</div>';
      });
    }

    var footerHtml =
      '<div class="shop-footer-info">🪙 ذهبك المتاح: <strong>' + state.gold + '</strong></div>' +
      '<button type="button" id="btn-finish-shop" class="primary-btn">إغلاق المتجر ومتابعة الرحلة ↵</button>';

    openModal(title, html, footerHtml);

    $('modal-body').querySelectorAll('[data-shop-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        GameApp.Audio.play('click');
        shopFilter = btn.getAttribute('data-shop-filter');
        openShopModal();
      });
    });

    $('modal-body').querySelectorAll('[data-buy-item]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-buy-item');
        var res = GameApp.Engine.buyShopItem(state, id);
        if (res.ok) {
          GameApp.Audio.play(id.indexOf('forge') !== -1 ? 'forge' : 'success');
          GameApp.Storage.saveAuto(state);
          renderAll();
          openShopModal();
        }
      });
    });

    $('btn-finish-shop').addEventListener('click', function () {
      GameApp.Audio.play('click');
      GameApp.Engine.closeShop(state);
      GameApp.Storage.saveAuto(state);
      closeModal();
      renderActiveBuffsBar();
    });
  }

  function renderEnding() {
    var ending = GameApp.Endings.getEndingById(state.endingId);
    $('choices-container').classList.add('hidden');
    $('outcome-panel').classList.add('hidden');
    $('story-text-box').classList.add('hidden');

    $('event-category').textContent = 'نهاية الرحلة';
    $('event-category').className = 'category-badge cat-story';
    $('event-season-hint').textContent = 'اكتملت فصول الحكاية';
    $('event-title').textContent = ending.title;

    var panel = $('ending-panel');
    panel.classList.remove('hidden');
    $('ending-crest').textContent = ending.crest;
    $('ending-tag').textContent = ending.tag;
    $('ending-title').textContent = ending.title;
    $('ending-summary').textContent = ending.summary;

    var finalAge = Math.min(18, state.age);
    $('ending-stats-recap').innerHTML =
      '<span class="trait-chip">العمر الختامي: ' + finalAge + '</span>' +
      '<span class="trait-chip">المسار: ' + escapeHtml(GameApp.State.CAREER_LABELS[state.career] || state.career) + '</span>' +
      '<span class="trait-chip">الذهب: ' + state.gold + '</span>' +
      '<span class="trait-chip">السمعة: ' + state.rep + '</span>' +
      '<span class="trait-chip">الذكاء: ' + state.attributes.int + '</span>';

    var epilogues = GameApp.Endings.getCharacterEpilogues ? GameApp.Endings.getCharacterEpilogues(state) : [];
    if (epilogues.length > 0) {
      $('ending-epilogue').innerHTML =
        '<h4>مصير الشخصيات في عالمك:</h4>' +
        epilogues.map(function (ep) {
          return '<div class="epilogue-row"><strong>' + escapeHtml(ep.name) + ':</strong> ' + escapeHtml(ep.fate) + '</div>';
        }).join('');
      $('ending-epilogue').classList.remove('hidden');
    } else {
      $('ending-epilogue').classList.add('hidden');
    }

    renderWelcomeLegacy();
    updateEndingsCountBadge();
  }

  function updateEndingsCountBadge() {
    var unlocked = Object.keys(GameApp.Storage.getUnlockedEndings()).length;
    var total = GameApp.Endings.getEndingList().length;
    $('endings-count-badge').textContent = unlocked + '/' + total;
  }

  function openModal(title, bodyHtml, footerHtml) {
    $('modal-title').textContent = title;
    $('modal-body').innerHTML = bodyHtml;
    var footer = $('modal-footer');
    if (footerHtml) {
      footer.innerHTML = footerHtml;
      footer.classList.remove('hidden');
    } else {
      footer.innerHTML = '';
      footer.classList.add('hidden');
    }
    $('modal-overlay').classList.remove('hidden');
  }

  function closeModal() {
    $('modal-overlay').classList.add('hidden');
    var footer = $('modal-footer');
    if (footer) {
      footer.innerHTML = '';
      footer.classList.add('hidden');
    }
  }

  function openChronicleModal() {
    GameApp.Audio.play('click');
    if (!state.chronicle || state.chronicle.length === 0) {
      openModal('سجل الرحلة', '<p class="story-text">لم تُسجل قرارات بعد في هذه الرحلة.</p>');
      return;
    }

    var html = state.chronicle
      .map(function (entry) {
        return (
          '<div class="chronicle-item">' +
          '<div class="chronicle-meta">' + escapeHtml(entry.turnLabel) + ' — ' + escapeHtml(entry.title) + '</div>' +
          '<div class="chronicle-body"><strong>اختيارك:</strong> ' + escapeHtml(entry.choiceLabel) + '<br>' + escapeHtml(entry.outcomeSummary) + '</div>' +
          '</div>'
        );
      })
      .join('');
    openModal('سجل الرحلة (' + state.chronicle.length + ' قرار)', html);
  }

  function openEndingsModal() {
    GameApp.Audio.play('click');
    var unlockedMap = GameApp.Storage.getUnlockedEndings();
    var list = GameApp.Endings.getEndingList();

    var html = '<div class="gallery-grid">';
    list.forEach(function (end) {
      var isUnlocked = Boolean(unlockedMap[end.id]);
      html +=
        '<div class="gallery-card ' + (isUnlocked ? 'unlocked' : '') + '">' +
        '<h4>' + (isUnlocked ? escapeHtml(end.crest + ' ' + end.title) : '🔒 نهاية مغلقة') + '</h4>' +
        '<p>' + (isUnlocked ? escapeHtml(end.summary) : '<strong>تلميح:</strong> ' + escapeHtml(end.hint)) + '</p>' +
        '</div>';
    });
    html += '</div>';
    openModal('موسوعة النهايات (' + Object.keys(unlockedMap).length + ' / ' + list.length + ')', html);
  }

  function openSavesModal() {
    GameApp.Audio.play('click');
    var slots = GameApp.Storage.getSlots();
    var html = '';

    slots.forEach(function (slot) {
      var info = slot.data
        ? 'العمر ' + Math.min(18, slot.data.meta.age) + ' • محطة ' + slot.data.meta.turnIndex + ' • ' + (GameApp.State.CAREER_LABELS[slot.data.meta.career] || '')
        : 'خانة فارغة';
      html +=
        '<div class="save-slot-row">' +
        '<div class="save-slot-info">' +
        '<h4>خانة الحفظ #' + slot.slotId + '</h4>' +
        '<p>' + escapeHtml(info) + '</p>' +
        '</div>' +
        '<div class="save-slot-btns">' +
        '<button type="button" class="secondary-btn" data-save-slot="' + slot.slotId + '">حفظ</button>' +
        (slot.data ? '<button type="button" class="primary-btn" data-load-slot="' + slot.slotId + '">تحميل</button>' : '') +
        (slot.data ? '<button type="button" class="icon-btn danger-ghost" data-del-slot="' + slot.slotId + '">حذف</button>' : '') +
        '</div>' +
        '</div>';
    });

    openModal('خانات الحفظ اليدوية (بالإضافة للحفظ التلقائي)', html);

    $('modal-body').querySelectorAll('[data-save-slot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-save-slot'), 10);
        GameApp.Storage.saveToSlot(id, state);
        GameApp.Audio.play('success');
        openSavesModal();
      });
    });

    $('modal-body').querySelectorAll('[data-load-slot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-load-slot'), 10);
        var loaded = GameApp.Storage.loadFromSlot(id);
        if (loaded) {
          state = GameApp.Engine.ensureStateIntegrity(loaded);
          lastTypedKey = null;
          quickFlowNotice = null;
          GameApp.Storage.saveAuto(state);
          renderAll();
          closeModal();
          $('welcome-modal').classList.add('hidden');
          if (state.pendingShop && state.phase !== 'ended') {
            shopFilter = 'all';
            openShopModal();
          }
        }
      });
    });

    $('modal-body').querySelectorAll('[data-del-slot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-del-slot'), 10);
        GameApp.Storage.deleteSlot(id);
        openSavesModal();
      });
    });
  }

  function openSettingsModal() {
    GameApp.Audio.play('click');
    var html =
      '<div class="setting-row">' +
      '<span>سرعة ظهور النص التدريجي</span>' +
      '<select id="set-text-speed" class="setting-select">' +
      '<option value="instant"' + (settings.textSpeed === 'instant' ? ' selected' : '') + '>فوري (بدون تأخير)</option>' +
      '<option value="fast"' + (settings.textSpeed === 'fast' ? ' selected' : '') + '>سريع (موصى به)</option>' +
      '<option value="normal"' + (settings.textSpeed === 'normal' ? ' selected' : '') + '>طبيعي</option>' +
      '</select>' +
      '</div>' +
      '<div class="setting-row">' +
      '<span>وضع اللعب السريع (تخطي خطوة المتابعة في المحطات الروتينية)</span>' +
      '<select id="set-quick-flow" class="setting-select">' +
      '<option value="false"' + (!settings.quickFlow ? ' selected' : '') + '>عادي (عرض كل نتيجة)</option>' +
      '<option value="true"' + (settings.quickFlow ? ' selected' : '') + '>سريع (عرض فوري + اختصار الروتين)</option>' +
      '</select>' +
      '</div>' +
      '<div class="setting-row">' +
      '<span>المؤثرات الصوتية الخفيفة</span>' +
      '<select id="set-sound-enabled" class="setting-select">' +
      '<option value="true"' + (settings.soundEnabled ? ' selected' : '') + '>مفعلة</option>' +
      '<option value="false"' + (!settings.soundEnabled ? ' selected' : '') + '>صامت</option>' +
      '</select>' +
      '</div>' +
      '<div class="setting-row">' +
      '<span>اختصارات لوحة المفاتيح</span>' +
      '<span>أرقام 1-7 للخيارات • Enter للمتابعة • Space للتسريع</span>' +
      '</div>';

    openModal('إعدادات التجربة', html);

    $('set-text-speed').addEventListener('change', function (e) {
      settings.textSpeed = e.target.value;
      GameApp.Storage.saveSettings(settings);
    });

    $('set-quick-flow').addEventListener('change', function (e) {
      settings.quickFlow = e.target.value === 'true';
      GameApp.Storage.saveSettings(settings);
    });

    $('set-sound-enabled').addEventListener('change', function (e) {
      settings.soundEnabled = e.target.value === 'true';
      GameApp.Audio.setEnabled(settings.soundEnabled);
      GameApp.Storage.saveSettings(settings);
      if (settings.soundEnabled) GameApp.Audio.play('click');
    });
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
  }
})(typeof window !== 'undefined' ? window : globalThis);

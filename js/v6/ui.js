(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var uiState = {
    selectedDiff: 'hard',
    state: null,
    currentEvent: null,
    activeEncounter: null,
    lastOutcome: '',
    shopFilter: 'all',
    activeTab: 'hero',
    typeTimer: null,
    renderedEventKey: null
  };

  function $(id) {
    return typeof document !== 'undefined' ? document.getElementById(id) : null;
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function playSfx(kind) {
    try {
      if (GameApp.Audio && typeof GameApp.Audio.play === 'function') {
        var settings = GameApp.V6Storage.getSettings();
        if (settings.soundEnabled) GameApp.Audio.play(kind);
      }
    } catch (e) {}
  }

  function showMenu() {
    var menu = $('main-menu-screen');
    var app = $('app');
    if (menu) menu.classList.remove('hidden');
    if (app) app.classList.add('hidden');
    refreshMenuState();
  }

  function showGame() {
    var menu = $('main-menu-screen');
    var app = $('app');
    if (menu) menu.classList.add('hidden');
    if (app) app.classList.remove('hidden');
    renderAll();
  }

  function refreshMenuState() {
    var profile = GameApp.V6Storage.getProfile();
    var auto = GameApp.V6Storage.loadAuto();
    var btnCont = $('btn-menu-continue');
    if (btnCont) {
      if (auto && !auto.progression.isEnded) {
        var city = GameApp.V6WorldData.CITIES[auto.timeline.locationId];
        btnCont.textContent = 'متابعة الرحلة (عمر ' + auto.timeline.age + ' • ' + (city ? city.name : '') + ')';
        btnCont.classList.remove('hidden');
      } else {
        btnCont.classList.add('hidden');
      }
    }

    var legacyEl = $('menu-legacy-banner');
    if (legacyEl) {
      if (profile.legacyBridge && profile.legacyBridge.hasLegacyData) {
        legacyEl.textContent = '✨ تم رصد حفظ سابق من «سليل السندان»: ستحصل على شارة عابر العوالم (+15 ذهب، +1 حدس) في رحلاتك الجديدة.';
        legacyEl.classList.remove('hidden');
      } else {
        legacyEl.classList.add('hidden');
      }
    }
  }

  function startNewRun() {
    playSfx('click');
    var res = GameApp.V6Engine.createNewGame(uiState.selectedDiff, true);
    uiState.state = res.state;
    uiState.currentEvent = res.event;
    uiState.activeEncounter = null;
    uiState.lastOutcome = '';
    uiState.renderedEventKey = null;
    GameApp.V6Storage.saveAuto(uiState.state);
    showGame();
  }

  function resumeAutoRun() {
    var auto = GameApp.V6Storage.loadAuto();
    if (!auto) return;
    playSfx('click');
    uiState.state = auto;
    GameApp.V6CastEngine.initCharactersState(uiState.state);
    uiState.currentEvent = GameApp.V6Engine.getEventById(auto.progression.currentEventId) || GameApp.V6Engine.getNextEvent(auto);
    uiState.activeEncounter = null;
    uiState.lastOutcome = '';
    uiState.renderedEventKey = null;
    showGame();
  }

  function renderAll() {
    if (!uiState.state) return;
    renderHud();
    renderStage();
    renderSidebar();
  }

  function renderHud() {
    var s = uiState.state;
    var Schema = GameApp.V6Schema;
    var World = GameApp.V6WorldData;
    var WT = GameApp.V6WorldTime;
    var city = World.CITIES[s.timeline.locationId] || World.CITIES.ash_frontier;

    $('hud-chapter-city').textContent = 'الفصل ' + s.timeline.chapter + ' • ' + city.name;
    $('hud-age').textContent = 'العمر: ' + s.timeline.age;
    $('hud-season').textContent = WT.getSeasonLabel(s.timeline.chapter, s.timeline.season);
    $('hud-turn-counter').textContent = s.timeline.turn + ' / ' + s.timeline.maxTurns;
    var pct = Math.min(100, Math.max(2, Math.round((s.timeline.turn / s.timeline.maxTurns) * 100)));
    $('hud-progress-fill').style.width = pct + '%';

    $('hud-hp').textContent = s.vitals.hp + '/' + s.vitals.maxHp;
    $('hud-stamina').textContent = s.vitals.stamina + '/' + s.vitals.maxStamina;
    $('hud-gold').textContent = s.vitals.gold;
    $('hud-suspicion').textContent = s.vitals.suspicion + '%';

    var debtPill = $('hud-debt-pill');
    if (s.vitals.debt > 0) {
      debtPill.classList.remove('hidden');
      $('hud-debt').textContent = s.vitals.debt + ' (دور ' + s.vitals.debtDueTurn + ')';
    } else {
      debtPill.classList.add('hidden');
    }

    var diffObj = Schema.DIFFICULTIES[s.difficulty] || Schema.DIFFICULTIES.hard;
    $('scene-city-badge').textContent = city.name;
    $('scene-diff-badge').textContent = 'صعوبة: ' + diffObj.label;
  }

  function renderTypewriter(el, text, key) {
    if (!el) return;
    if (uiState.renderedEventKey === key) return;
    uiState.renderedEventKey = key;
    if (uiState.typeTimer) {
      clearInterval(uiState.typeTimer);
      uiState.typeTimer = null;
    }
    var speed = GameApp.V6Storage.getSettings().textSpeed;
    if (speed === 'instant') {
      el.textContent = text;
      return;
    }
    var step = speed === 'fast' ? 6 : 2;
    var idx = 0;
    el.textContent = '';
    uiState.typeTimer = setInterval(function () {
      idx += step;
      if (idx >= text.length) {
        el.textContent = text;
        clearInterval(uiState.typeTimer);
        uiState.typeTimer = null;
      } else {
        el.textContent = text.slice(0, idx);
      }
    }, 18);
  }

  function renderStage() {
    var s = uiState.state;
    var ev = uiState.currentEvent;
    var World = GameApp.V6WorldData;
    var Assets = GameApp.V6Assets;
    var Meta = GameApp.V6NarrativeMeta;

    var sceneId = (ev && ev.sceneId) || (World.CITIES[s.timeline.locationId] && World.CITIES[s.timeline.locationId].sceneId) || 'ash_frontier';
    var scenePath = Assets.getAssetPath('scene', sceneId) || 'assets/scenes/ash_frontier.jpg';
    $('scene-banner-img').src = scenePath;

    var outEl = $('outcome-banner');
    if (uiState.lastOutcome) {
      outEl.textContent = uiState.lastOutcome;
      outEl.classList.remove('hidden');
    } else {
      outEl.classList.add('hidden');
    }

    // Speaker card
    var spkId = (ev && ev.speakerId) || 'protagonist';
    var spkDef = Meta.MAIN_CHARACTERS[spkId] || Assets.CHARACTERS[spkId] || Assets.CHARACTERS.protagonist;
    var spkRec = s.characters.roster[spkId];
    $('speaker-portrait').src = (spkDef && (spkDef.portrait || spkDef.path)) || 'assets/characters/protagonist.jpg';
    $('speaker-name').textContent = spkDef ? spkDef.name : 'الظل التاه';
    $('speaker-role').textContent = spkDef ? spkDef.role : '';
    var stageLabels = {
      stranger: 'غريب', acquaintance: 'معرفة', ally: 'حليف',
      blood_oath: 'عهد دم', partner: 'شريك مصير', rival: 'خصم', betrayed: 'خيانة', deceased: 'متوفى'
    };
    $('speaker-rel-badge').textContent = spkRec ? (stageLabels[spkRec.relationshipStage] || 'غريب') : 'أنت';

    var choicesEl = $('choices-container');
    var combatEl = $('combat-board');
    var endEl = $('ending-panel');

    if (s.progression.isEnded) {
      choicesEl.classList.add('hidden');
      combatEl.classList.add('hidden');
      endEl.classList.remove('hidden');
      var endSum = GameApp.V6Engine.resolveEndingSummary(s);
      $('ending-title').textContent = endSum.title;
      $('ending-desc').textContent = endSum.desc;
      var diamondsEarned = s.progression.diamondsEarned != null ? s.progression.diamondsEarned : (GameApp.V6Engine.computeDiamondsReward ? GameApp.V6Engine.computeDiamondsReward(s, s.progression.endingId) : 0);
      var currentDiamonds = GameApp.V6Storage ? GameApp.V6Storage.getProfile().diamonds : 0;
      var diamondBox = $('ending-diamonds-box');
      if (diamondBox) {
        diamondBox.innerHTML = '<span>💎 شظايا الماس المكتسبة: <strong>+' + diamondsEarned + '</strong></span>' +
          '<span>إجمالي رصيد العودة: <strong>' + currentDiamonds + ' 💎</strong></span>';
      }
      var achReport = GameApp.V6CastEngine.evaluatePrestigeAchievements(s).report;
      var unlockedNames = Object.keys(achReport).filter(function (k) { return achReport[k].unlocked; }).map(function (k) { return achReport[k].name; });
      $('ending-prestige-box').innerHTML = unlockedNames.length
        ? '🏆 الإنجازات الأسطورية المفتوحة في هذه الرحلة: <strong>' + esc(unlockedNames.join('، ')) + '</strong>'
        : '<span class="muted-label">لم يُفتح أي إنجاز أسطوري في هذه الرحلة — راجع قاعة الإنجازات لمعرفة السلاسل المترابطة.</span>';
      return;
    }

    endEl.classList.add('hidden');

    if (uiState.activeEncounter && uiState.activeEncounter.status === 'active') {
      choicesEl.classList.add('hidden');
      combatEl.classList.remove('hidden');
      renderCombatBoard();
      return;
    }

    combatEl.classList.add('hidden');
    choicesEl.classList.remove('hidden');

    if (ev) {
      $('event-title').textContent = ev.title;
      renderTypewriter($('event-body'), ev.body, ev.id + '_' + s.timeline.turn);
      choicesEl.innerHTML = ev.choices.map(function (c) {
        return '<button type="button" class="choice-btn" data-choice="' + esc(c.id) + '">' +
          '<strong>' + esc(c.label) + '</strong>' +
        '</button>';
      }).join('');
    }
  }

  function renderCombatBoard() {
    var enc = uiState.activeEncounter;
    var s = uiState.state;
    var Shop = GameApp.V6ShopData;
    var p = enc.player;
    var e = enc.enemy;

    $('combat-mode-badge').textContent = enc.mode === 'debate' ? 'مناظرة سياسية/تفتيش' : 'قتال تكتيكي (جولة ' + enc.round + ')';
    $('combat-enemy-name').textContent = e.name;
    $('combat-intent-banner').textContent = '⚠ الخصم يستعد لـ: ' + (e.intentLabel || e.intent);

    $('c-player-hp').textContent = p.hp + '/' + p.maxHp;
    $('c-player-hp-bar').style.width = Math.round((p.hp / p.maxHp) * 100) + '%';
    $('c-player-poise').textContent = p.poise + '/' + p.maxPoise;
    $('c-player-poise-bar').style.width = Math.round((p.poise / Math.max(1, p.maxPoise)) * 100) + '%';
    $('c-player-ap').textContent = '⚡ نقاط الفعل: ' + p.ap + ' / ' + p.maxAp;

    $('c-enemy-hp').textContent = e.hp + '/' + e.maxHp;
    $('c-enemy-hp-bar').style.width = Math.round((e.hp / e.maxHp) * 100) + '%';
    $('c-enemy-poise').textContent = e.poise + '/' + e.maxPoise;
    $('c-enemy-poise-bar').style.width = Math.round((e.poise / Math.max(1, e.maxPoise)) * 100) + '%';

    var tags = [];
    if (e.staggered) tags.push('مترنح!');
    if (e.bleedTicks > 0) tags.push('نزيف (' + e.bleedTicks + ')');
    if (e.poisonTicks > 0) tags.push('مسموم (' + e.poisonTicks + ')');
    $('c-enemy-status').textContent = tags.join(' • ');

    var stripHtml = s.loadout.potionSlots.map(function (pid, idx) {
      if (!pid || !Shop.ITEMS[pid]) return '';
      var qty = s.loadout.potionsInventory[pid] || 0;
      if (qty <= 0) return '';
      return '<button type="button" class="mini-btn" data-cact="use_potion" data-slot="' + idx + '">🧪 ' + esc(Shop.ITEMS[pid].name) + ' (' + qty + ')</button>';
    }).join('');
    $('combat-potion-strip').innerHTML = stripHtml;

    $('combat-log').innerHTML = enc.log.slice(-8).map(function (line) {
      return '<div>• ' + esc(line) + '</div>';
    }).join('');
  }

  function renderSidebar() {
    var s = uiState.state;
    var Meta = GameApp.V6NarrativeMeta;
    var Shop = GameApp.V6ShopData;
    var World = GameApp.V6WorldData;
    var Schema = GameApp.V6Schema;

    // Companion summary
    var cid = s.characters.companionId;
    var cDef = cid ? Meta.MAIN_CHARACTERS[cid] : null;
    $('side-companion-img').src = cDef ? cDef.portrait : 'assets/characters/protagonist.jpg';
    $('side-companion-name').textContent = cDef ? cDef.name : 'لا يوجد مرافق';
    $('side-companion-bonus').textContent = cDef ? (cDef.role + ' • إعالة ' + cDef.upkeep + ' ذهب') : 'تعرّف على الشخصيات لضمّ مرافق';

    // Stats & Skills
    var statLabels = { str: 'القوة', int: 'الذكاء', agi: 'البراعة', cha: 'الكاريزما', ins: 'الحدس' };
    $('stats-grid').innerHTML = Object.keys(statLabels).map(function (k) {
      return '<div class="stat-chip"><span>' + statLabels[k] + '</span><strong>' + (s.stats[k] || 0) + '</strong></div>';
    }).join('');

    var skillLabels = { combat: 'القتال', stealth: 'التخفي', trade: 'التجارة', smithing: 'الحدادة', alchemy: 'الخيمياء', politics: 'السياسة' };
    $('skills-grid').innerHTML = Object.keys(skillLabels).map(function (k) {
      return '<div class="stat-chip"><span>' + skillLabels[k] + '</span><strong>' + (s.skills[k] || 0) + '</strong></div>';
    }).join('');

    $('scars-list').innerHTML = (s.scars || []).length === 0
      ? '<span class="muted-label">لا توجد ندوب دائمة حالياً.</span>'
      : s.scars.map(function (id) {
        var sc = World.SCARS_CATALOG[id];
        return '<div class="scar-pill"><strong>' + esc(sc ? sc.name : id) + '</strong><small class="muted-label">' + esc(sc ? sc.desc : '') + '</small></div>';
      }).join('');

    // Gear paperdoll
    var slots = [
      { label: 'السلاح', item: s.loadout.weaponId ? Shop.ITEMS[s.loadout.weaponId] : null },
      { label: 'الدرع / الزي', item: s.loadout.armorId ? Shop.ITEMS[s.loadout.armorId] : null },
      { label: 'التميمة', item: s.loadout.accessoryId ? Shop.ITEMS[s.loadout.accessoryId] : null }
    ];
    $('paperdoll-grid').innerHTML = slots.map(function (slot) {
      var rarity = slot.item ? 'rarity-' + slot.item.rarity : '';
      var img = slot.item ? slot.item.image : 'assets/ui/game_crest.jpg';
      return '<div class="equip-slot-card ' + rarity + '">' +
        '<img src="' + esc(img) + '" alt="' + esc(slot.label) + '" class="slot-thumb">' +
        '<div><small class="muted-label">' + esc(slot.label) + '</small><strong>' + esc(slot.item ? slot.item.name : 'فارغ') + '</strong></div>' +
      '</div>';
    }).join('');

    $('potion-belt-grid').innerHTML = s.loadout.potionSlots.map(function (pid, idx) {
      var item = pid ? Shop.ITEMS[pid] : null;
      var qty = pid ? (s.loadout.potionsInventory[pid] || 0) : 0;
      return '<button type="button" class="potion-slot-btn" data-belt-use="' + idx + '">' +
        '<img src="' + esc(item ? item.image : 'assets/items/potions/potion_heal.jpg') + '" style="opacity:' + (item && qty > 0 ? 1 : 0.25) + '">' +
        '<span>' + esc(item ? item.name.split(' ')[0] + ' (' + qty + ')' : 'جيب ' + (idx + 1)) + '</span>' +
      '</button>';
    }).join('');

    var ownedIds = [].concat(s.loadout.ownedWeapons || [], s.loadout.ownedArmors || [], s.loadout.ownedAccessories || []);
    $('owned-gear-list').innerHTML = ownedIds.length === 0
      ? '<span class="muted-label">لم تقتنِ عتاداً بعد. زر المتجر!</span>'
      : ownedIds.map(function (id) {
        var it = Shop.ITEMS[id];
        if (!it) return '';
        var isEquipped = s.loadout.weaponId === id || s.loadout.armorId === id || s.loadout.accessoryId === id;
        return '<div class="shop-item-card rarity-' + esc(it.rarity) + '">' +
          '<img src="' + esc(it.image) + '" class="shop-thumb">' +
          '<div class="npc-meta"><strong>' + esc(it.name) + '</strong><small class="muted-label">' + esc(it.desc) + '</small></div>' +
          '<button type="button" class="mini-btn" data-equip="' + esc(id) + '">' + (isEquipped ? 'مجهّز ✓' : 'تجهيز') + '</button>' +
        '</div>';
      }).join('');

    // Factions & Cast
    $('factions-list').innerHTML = Object.keys(Schema.FACTIONS).map(function (fk) {
      var fac = Schema.FACTIONS[fk];
      var val = s.factions[fk] || 0;
      return '<div class="faction-row"><div class="faction-top"><strong>' + esc(fac.name) + '</strong><span>' + val + '</span></div>' +
        '<div class="bar-track"><div class="bar-fill fill-poise" style="width:' + Math.max(0, Math.min(100, val + 50)) + '%"></div></div></div>';
    }).join('');

    $('cast-roster-list').innerHTML = Object.keys(Meta.MAIN_CHARACTERS).map(function (cidKey) {
      var def = Meta.MAIN_CHARACTERS[cidKey];
      var rec = s.characters.roster[cidKey];
      if (!rec || !rec.met) {
        return '<div class="npc-card"><img src="' + esc(def.portrait) + '" class="npc-thumb" style="filter:grayscale(1) brightness(0.45)"><div class="npc-meta"><strong>شخصية لم تُكشف بعد</strong><small class="muted-label">' + esc(def.homeCity) + '</small></div></div>';
      }
      var isActive = s.characters.companionId === cidKey;
      return '<div class="npc-card">' +
        '<img src="' + esc(def.portrait) + '" class="npc-thumb">' +
        '<div class="npc-meta"><strong>' + esc(def.name) + '</strong>' +
        '<small class="muted-label">ولاء: ' + rec.loyalty + ' • ثقة: ' + rec.trust + ' • خوف: ' + rec.fear + '</small></div>' +
        '<button type="button" class="mini-btn" data-companion="' + esc(isActive ? '' : cidKey) + '">' + (isActive ? 'إلغاء' : 'مرافقة') + '</button>' +
      '</div>';
    }).join('');

    // Economy & Estate
    var livCost = GameApp.V6WorldTime.computeSeasonalLivingCost(s);
    var propRep = GameApp.V6WorldTime.computePropertyReport(s);
    $('economy-summary-box').innerHTML =
      '<div class="faction-row"><div class="faction-top"><span>نفقة الموسم والضرائب</span><strong>-' + livCost + ' ذهب</strong></div>' +
      '<div class="faction-top"><span>دخل العقارات الصافي</span><strong>+' + propRep.netIncome + ' ذهب</strong></div>' +
      '<div class="faction-top"><span>الدين القائم</span><strong>' + s.vitals.debt + ' ذهب</strong></div></div>';

    var ownedProps = s.economy.properties || [];
    $('owned-properties-list').innerHTML = ownedProps.length === 0
      ? '<span class="muted-label">لا تمتلك عقارات بعد (تُفتح في فصل الشباب المتأخر والنضج).</span>'
      : ownedProps.map(function (pid) {
        var pr = World.PROPERTIES[pid];
        return pr ? '<div class="faction-row"><strong>' + esc(pr.name) + '</strong><small class="muted-label">+' + pr.incomePerTurn + ' ذهب / موسم</small></div>' : '';
      }).join('');
  }

  function openModal(title, bodyHtml, footerHtml) {
    $('modal-title').textContent = title;
    $('modal-body').innerHTML = bodyHtml;
    var foot = $('modal-footer');
    if (footerHtml) {
      foot.innerHTML = footerHtml;
      foot.classList.remove('hidden');
    } else {
      foot.innerHTML = '';
      foot.classList.add('hidden');
    }
    $('modal-overlay').classList.remove('hidden');
  }

  function closeModal() {
    $('modal-overlay').classList.add('hidden');
  }

  function openMapModal() {
    if (!uiState.state) return;
    var s = uiState.state;
    var World = GameApp.V6WorldData;
    var WT = GameApp.V6WorldTime;

    var cards = Object.keys(World.CITIES).map(function (cityId) {
      var city = World.CITIES[cityId];
      var isCurrent = s.timeline.locationId === cityId;
      var check = WT.canTravelTo(s, cityId);
      return '<div class="city-card ' + (isCurrent ? 'current-city' : '') + '">' +
        '<strong>' + esc(city.name) + (isCurrent ? ' (موقعك الحالي)' : '') + '</strong>' +
        '<small class="muted-label">' + esc(city.description) + '</small>' +
        (!isCurrent ? (check.ok
          ? '<button type="button" class="mini-btn" data-travel="' + esc(cityId) + '">سفر (' + check.goldCost + ' ذهب • ' + check.staminaCost + ' جهد)</button>'
          : '<small class="muted-label">' + esc(check.reason) + '</small>') : '') +
      '</div>';
    }).join('');

    var html = '<div class="map-canvas-wrap"><img src="assets/ui/continent_map.jpg" alt="خريطة القارة" class="map-bg-img"></div>' +
      '<div class="cities-list">' + cards + '</div>';
    openModal('خريطة القارة والتنقّل', html);
  }

  function openShopModal() {
    if (!uiState.state) return;
    var s = uiState.state;
    var Shop = GameApp.V6ShopData;
    var Combat = GameApp.V6Combat;
    var World = GameApp.V6WorldData;

    var filters = [
      { id: 'all', label: 'الكل' },
      { id: 'sword', label: 'سيوف' },
      { id: 'axe', label: 'فؤوس' },
      { id: 'spear', label: 'رماح' },
      { id: 'bow', label: 'أقواس' },
      { id: 'armor', label: 'دروع وأزياء' },
      { id: 'potion', label: 'جرعات' },
      { id: 'accessory', label: 'تمائم' },
      { id: 'estate', label: 'عقارات وقروض' }
    ];

    var filterBar = '<div class="shop-filters">' + filters.map(function (f) {
      return '<button type="button" class="filter-pill ' + (uiState.shopFilter === f.id ? 'active' : '') + '" data-sfilter="' + esc(f.id) + '">' + esc(f.label) + '</button>';
    }).join('') + '</div>';

    var body = filterBar;
    if (uiState.shopFilter === 'estate') {
      body += '<div class="cities-list">' + Object.keys(World.PROPERTIES).map(function (pid) {
        var pr = World.PROPERTIES[pid];
        var owned = (s.economy.properties || []).indexOf(pid) !== -1;
        return '<div class="city-card"><strong>' + esc(pr.name) + '</strong>' +
          '<small class="muted-label">' + esc(pr.desc) + '</small>' +
          '<small>الدخل: +' + pr.incomePerTurn + ' | التكلفة: ' + pr.cost + ' ذهب (سن ' + pr.minAge + '+)</small>' +
          (owned ? '<span>مملوك ✓</span>' : '<button type="button" class="mini-btn" data-buyprop="' + esc(pid) + '">شراء العقار</button>') +
        '</div>';
      }).join('') + '</div>' +
      '<div class="city-card"><strong>المصارف والقروض</strong>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="mini-btn" data-loan="merchants">قرض تجاري (+100 ذهب / سداد 125)</button>' +
      '<button type="button" class="mini-btn" data-loan="shadow">قرض الظل (+100 ذهب / سداد 145)</button>' +
      (s.vitals.debt > 0 ? '<button type="button" class="mini-btn" data-repay="1">سداد الدين القائم (' + s.vitals.debt + ')</button>' : '') +
      '</div></div>';
    } else {
      var list = Object.keys(Shop.ITEMS).map(function (id) { return Shop.ITEMS[id]; }).filter(function (it) {
        if (uiState.shopFilter === 'all') return true;
        if (['sword', 'axe', 'spear', 'bow'].indexOf(uiState.shopFilter) !== -1) return it.weaponType === uiState.shopFilter;
        return it.category === uiState.shopFilter;
      });
      body += '<div class="shop-items-grid">' + list.map(function (it) {
        var check = Combat.canBuyShopItem(s, it.id);
        var price = Combat.getItemPrice(s, it.id);
        return '<div class="shop-item-card rarity-' + esc(it.rarity) + '">' +
          '<img src="' + esc(it.image) + '" class="shop-thumb">' +
          '<div class="npc-meta"><strong>' + esc(it.name) + '</strong>' +
          '<small class="muted-label">' + esc(it.desc) + '</small>' +
          '<small>السعر: ' + price + ' ذهب • سن ' + it.minAge + '+</small>' +
          (check.ok ? '<button type="button" class="mini-btn" data-buyitem="' + esc(it.id) + '">شراء</button>' : '<small class="muted-label">' + esc(check.reason) + '</small>') +
        '</div></div>';
      }).join('') + '</div>';
    }

    openModal('السوق والمصارف (الذهب المتاح: ' + s.vitals.gold + ')', body, '<button type="button" class="secondary-btn" onclick="document.getElementById(\'btn-close-modal\').click()">إغلاق</button>');
  }

  function openHallModal() {
    var profile = GameApp.V6Storage.getProfile();
    var Meta = GameApp.V6NarrativeMeta;
    var liveEval = uiState.state ? GameApp.V6CastEngine.evaluatePrestigeAchievements(uiState.state).report : null;

    var achHtml = Object.keys(Meta.PRESTIGE_ACHIEVEMENTS).map(function (id) {
      var def = Meta.PRESTIGE_ACHIEVEMENTS[id];
      var unlocked = Boolean(profile.unlockedPrestige[id]) || Boolean(liveEval && liveEval[id] && liveEval[id].unlocked);
      var pct = liveEval && liveEval[id] ? liveEval[id].ratio : (unlocked ? 100 : 0);
      return '<div class="ach-card ' + (unlocked ? 'unlocked' : '') + '">' +
        '<strong>' + (unlocked ? '🏆 ' : '🔒 ') + esc(def.name) + '</strong>' +
        '<small class="muted-label">' + esc(def.desc) + '</small>' +
        '<small>التقدّم الحالي: ' + pct + '%</small>' +
      '</div>';
    }).join('');

    openModal('قاعة الإنجازات الأسطورية والنهايات (التختيمات المكتملة: ' + profile.totalRuns + ')', '<div class="hall-grid">' + achHtml + '</div>');
  }

  function openReincarnationModal() {
    var profile = GameApp.V6Storage.getProfile();
    var diamonds = typeof profile.diamonds === 'number' ? profile.diamonds : 0;
    var up = profile.reincarnationUpgrades || {
      stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
      skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
      startingGold: 0
    };
    up.stats = up.stats || {};
    up.skills = up.skills || {};

    var statDefs = [
      { key: 'str', label: 'القوة الجسدية', desc: '+1 ضرر بالأسلحة، +5 صحة أساسية إضافية' },
      { key: 'agi', label: 'البراعة والخفة', desc: '+1 سرعة ومراوغة، +4 جهد أساسي إضافي' },
      { key: 'int', label: 'الذكاء والمعرفة', desc: 'حسابات خيارات الحيلة ودقة تحضير الوصفات' },
      { key: 'ins', label: 'الحدس والاستبصار', desc: 'توقع نوايا العدو في القتال وكشف الخدع' },
      { key: 'cha', label: 'الكاريزما والحضور', desc: 'تخفيض الأسعار والتأثير في المناظرات' }
    ];

    var skillDefs = [
      { key: 'combat', label: 'القتال التكتيكي', desc: 'دقة الضربات وقوة الصد وفك حصار الأعداء' },
      { key: 'smithing', label: 'الحدادة وتطويع الفولاذ', desc: 'صيانة العتاد والنجاح في ورش الإمارات' },
      { key: 'stealth', label: 'التخفي والنشل', desc: 'تجنب الدوريات والانسحاب التكتيكي دون خسائر' },
      { key: 'trade', label: 'التجارة والمفاوضات', desc: 'أرباح الصفقات وتسديد الديون بمرونة' },
      { key: 'alchemy', label: 'الخيمياء وتصنيع الترياق', desc: 'كفاءة الجرعات الطبية وتخليق المركبات النادرة' },
      { key: 'politics', label: 'المناورات السياسية', desc: 'توجيه قرارات النبلاء وتفكيك تفتيش المحاكم' }
    ];

    var html = '<div class="reincarnation-summary">' +
      '<div>' +
        '<div class="reincarnation-balance">💎 رصيد شظايا الماس: ' + diamonds + '</div>' +
        '<small class="muted-label">تُمنح شظايا الماس عند كل نهاية بحسب إنجازاتك وصمودك. تُستخدم لتقوية جوهر روحك في كل دورة حياة جديدة.</small>' +
      '</div>' +
      '<div>' +
        '<button type="button" class="mini-btn btn-warn" data-resetupgrades="1">↺ استرداد الماس وإعادة التوزيع</button>' +
      '</div>' +
    '</div>' +

    '<h4 class="sub-title">السمات الأساسية (1 ماسة = +1 نقطة سمة دائمة)</h4>' +
    '<div class="reincarnation-shop-grid">' +
    statDefs.map(function (sd) {
      var curVal = up.stats[sd.key] || 0;
      var canBuy = diamonds >= 1;
      return '<div class="reincarnation-card">' +
        '<div class="reincarnation-card-header">' +
          '<strong>' + esc(sd.label) + '</strong>' +
          '<span class="reincarnation-card-val">+' + curVal + '</span>' +
        '</div>' +
        '<small class="muted-label">' + esc(sd.desc) + '</small>' +
        '<button type="button" class="mini-btn ' + (canBuy ? 'diamond-btn' : 'btn-muted') + '" data-buyup-cat="stats" data-buyup-key="' + esc(sd.key) + '" data-buyup-cost="1" ' + (!canBuy ? 'disabled' : '') + '>ترقية (+1 سمة) • 1 💎</button>' +
      '</div>';
    }).join('') +
    '</div>' +

    '<h4 class="sub-title" style="margin-top:14px">المهارات المتخصصة (2 ماسة = +1 نقطة مهارة دائمة)</h4>' +
    '<div class="reincarnation-shop-grid">' +
    skillDefs.map(function (sk) {
      var curVal = up.skills[sk.key] || 0;
      var canBuy = diamonds >= 2;
      return '<div class="reincarnation-card">' +
        '<div class="reincarnation-card-header">' +
          '<strong>' + esc(sk.label) + '</strong>' +
          '<span class="reincarnation-card-val">+' + curVal + '</span>' +
        '</div>' +
        '<small class="muted-label">' + esc(sk.desc) + '</small>' +
        '<button type="button" class="mini-btn ' + (canBuy ? 'diamond-btn' : 'btn-muted') + '" data-buyup-cat="skills" data-buyup-key="' + esc(sk.key) + '" data-buyup-cost="2" ' + (!canBuy ? 'disabled' : '') + '>ترقية (+1 مهارة) • 2 💎</button>' +
      '</div>';
    }).join('') +
    '</div>' +

    '<h4 class="sub-title" style="margin-top:14px">المؤونة والذهب الأولي (1 ماسة = +20 ذهب أولي)</h4>' +
    '<div class="reincarnation-card" style="margin-top:6px">' +
      '<div class="reincarnation-card-header">' +
        '<strong>صرة ذهب التجسد الأولي</strong>' +
        '<span class="reincarnation-card-val">+' + (up.startingGold || 0) + ' ذهب</span>' +
      '</div>' +
      '<small class="muted-label">تبدأ رحلتك بذهبٍ إضافي يحميك من الفقر المريع والجوع في سنوات الطفولة الأولى.</small>' +
      '<button type="button" class="mini-btn ' + (diamonds >= 1 ? 'diamond-btn' : 'btn-muted') + '" data-buyup-cat="startingGold" data-buyup-key="gold" data-buyup-cost="1" ' + (diamonds < 1 ? 'disabled' : '') + '>شراء (+20 ذهب) • 1 💎</button>' +
    '</div>';

    openModal('متجر العودة وجوهر التجسد (شظايا الماس)', html);
  }

  function openTimelineModal() {
    if (!uiState.state) return;
    var nodes = uiState.state.progression.timelineNodes || [];
    var World = GameApp.V6WorldData;
    var html = '<div class="timeline-tree">' + nodes.map(function (n, idx) {
      var city = World.CITIES[n.cityId];
      return '<div class="tree-node"><strong>الفصل ' + n.chapter + ' • عمر ' + n.age + ' (' + esc(city ? city.name : '') + ')</strong>' +
        '<div>' + esc(n.title) + '</div>' +
        (n.choiceLabel ? '<small class="choice-hint">قرارك: ' + esc(n.choiceLabel) + '</small>' : '') +
      '</div>' + (idx % 2 === 1 ? '<div class="tree-node unexplored"><small class="muted-label">⑂ مسار بديل غير مستكشف في هذا العمر...</small></div>' : '');
    }).join('') + '</div>';
    openModal('شجرة الخط الزمني (7–25 سنة)', html);
  }

  function openSavesModal() {
    var slots = GameApp.V6Storage.listSlots();
    var html = '<div class="slots-grid">' + slots.map(function (slot, i) {
      return '<div class="save-slot-card"><strong>خانة حفظ ' + (i + 1) + '</strong>' +
        '<small class="muted-label">' + (slot ? esc(slot.label + ' • ' + slot.savedAt.slice(0, 10)) : 'خانة فارغة') + '</small>' +
        '<div style="display:flex;gap:6px">' +
        (uiState.state ? '<button type="button" class="mini-btn" data-saveslot="' + i + '">حفظ هنا</button>' : '') +
        (slot ? '<button type="button" class="mini-btn" data-loadslot="' + i + '">تحميل</button>' : '') +
        '</div></div>';
    }).join('') + '</div>' +
    '<div class="city-card" style="margin-top:14px;padding:12px;background:rgba(212,163,89,0.06);border:1px dashed var(--border-strong);display:flex;flex-direction:column;gap:8px">' +
    '<strong>النسخ الاحتياطي المحلي ونقل التقدم (JSON)</strong>' +
    '<small class="muted-label">تصدير حفظياتك إلى ملف JSON أو استيرادها لاستكمال اللعب بأمان تام على أي جهاز أو متصفح.</small>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<button type="button" class="mini-btn highlight-btn" id="btn-export-save-json">📥 تصدير ملف الحفظ (JSON)</button>' +
    '<label class="mini-btn" style="cursor:pointer;display:inline-flex;align-items:center;">📤 استيراد ملف حفظ' +
    '<input type="file" id="input-import-save-json" accept=".json" style="display:none">' +
    '</label>' +
    '</div></div>';
    openModal('إدارة ملفات الحفظ (3 خانات)', html);
  }

  function openCityQuickModal() {
    var html = '<div class="choices-list">' +
      '<button type="button" class="choice-btn" id="mob-quick-map"><strong>🗺️ خريطة العالم والسفر</strong><span class="choice-hint">التنقل بين مدن القارة ومراكز القوى الأربع</span></button>' +
      '<button type="button" class="choice-btn" id="mob-quick-shop"><strong>🛒 المتجر والمصرف والعقارات</strong><span class="choice-hint">شراء العتاد والجرعات، الاقتراض وسداد الديون</span></button>' +
      '<button type="button" class="choice-btn" id="mob-quick-timeline"><strong>🌿 شجرة الخط الزمني (7–25 سنة)</strong><span class="choice-hint">استعراض مسار العمر والفصول والمحطات</span></button>' +
      '</div>';
    openModal('بوابة المدينة والسفر السريع', html);
  }

  function openMenuQuickModal() {
    var html = '<div class="choices-list">' +
      '<button type="button" class="choice-btn" id="mob-quick-saves"><strong>💾 إدارة ملفات الحفظ (3 خانات)</strong><span class="choice-hint">الحفظ اليدوي، الاستعادة، وتصدير/استيراد JSON</span></button>' +
      '<button type="button" class="choice-btn" id="mob-quick-hall"><strong>🏆 قاعة النهايات والإنجازات</strong><span class="choice-hint">استعراض نهاياتك المكتشفة وميراث الماسات</span></button>' +
      '<button type="button" class="choice-btn" id="mob-quick-settings"><strong>⚙️ إعدادات اللعبة</strong><span class="choice-hint">سرعة ظهور النصوص وتفعيل/كتم الأصوات</span></button>' +
      '<button type="button" class="choice-btn" id="mob-quick-home" style="border-color:rgba(217,76,76,0.4)"><strong>🏠 العودة للقائمة الرئيسية</strong><span class="choice-hint">الخروج إلى شاشة البداية</span></button>' +
      '</div>';
    openModal('قائمة النظام والمفاتيح', html);
  }

  function openSettingsModal() {
    var cur = GameApp.V6Storage.getSettings();
    var html = '<div class="city-card"><strong>سرعة ظهور النص</strong>' +
      '<div style="display:flex;gap:8px">' +
      ['normal', 'fast', 'instant'].map(function (sp) {
        var lbl = sp === 'normal' ? 'عادي' : (sp === 'fast' ? 'سريع' : 'فوري');
        return '<button type="button" class="filter-pill ' + (cur.textSpeed === sp ? 'active' : '') + '" data-speed="' + sp + '">' + lbl + '</button>';
      }).join('') + '</div></div>' +
      '<div class="city-card"><strong>المؤثرات الصوتية</strong>' +
      '<button type="button" class="mini-btn" data-togglesound="1">' + (cur.soundEnabled ? 'الصوت: مفعّل 🔊' : 'الصوت: مكتوم 🔇') + '</button></div>';
    openModal('إعدادات اللعبة', html);
  }

  function handleChoiceClick(choiceId) {
    if (!uiState.state || !uiState.currentEvent) return;
    playSfx('click');
    var res = GameApp.V6Engine.chooseOption(uiState.state, uiState.currentEvent, choiceId);
    if (!res.ok) return;
    uiState.lastOutcome = res.outcomeText || '';
    if (res.startedEncounter) {
      uiState.activeEncounter = res.encounter;
    } else {
      uiState.currentEvent = res.nextEvent;
    }
    renderAll();
  }

  function handleCombatClick(action, slotIdx) {
    if (!uiState.activeEncounter) return;
    playSfx('click');
    var res = GameApp.V6Combat.performEncounterAction(uiState.state, uiState.activeEncounter, action, { slotIdx: slotIdx });
    if (!res.ok) return;

    var status = uiState.activeEncounter.status;
    if (status === 'victory' || status === 'escaped' || status === 'defeat') {
      var summary = status === 'victory' ? 'انتصرتَ في المواجهة!' : (status === 'escaped' ? 'انسحبتَ بسلام.' : 'انتهت المواجهة بالهزيمة.');
      uiState.activeEncounter = null;
      var fin = GameApp.V6Engine.finalizeTurnAfterChoice(uiState.state, summary);
      uiState.lastOutcome = fin.outcomeText;
      uiState.currentEvent = fin.nextEvent;
    }
    renderAll();
  }

  function bindEvents() {
    var diffBtns = typeof document !== 'undefined' ? document.querySelectorAll('.diff-pill') : [];
    for (var i = 0; i < diffBtns.length; i++) {
      diffBtns[i].addEventListener('click', function (ev) {
        var btn = ev.currentTarget;
        uiState.selectedDiff = btn.getAttribute('data-diff');
        for (var j = 0; j < diffBtns.length; j++) diffBtns[j].classList.remove('active');
        btn.classList.add('active');
      });
    }

    var on = function (id, fn) { var el = $(id); if (el) el.addEventListener('click', fn); };
    on('btn-menu-new', startNewRun);
    on('btn-menu-continue', resumeAutoRun);
    on('btn-menu-reincarnation', openReincarnationModal);
    on('btn-menu-saves', openSavesModal);
    on('btn-menu-hall', openHallModal);
    on('btn-menu-settings', openSettingsModal);
    on('btn-open-map', openMapModal);
    on('btn-open-shop', openShopModal);
    on('btn-open-timeline', openTimelineModal);
    on('btn-open-hall', openHallModal);
    on('btn-open-saves', openSavesModal);
    on('btn-back-menu', showMenu);
    on('btn-close-modal', closeModal);
    on('btn-end-reincarnation', openReincarnationModal);
    on('btn-end-timeline', openTimelineModal);
    on('btn-end-new-run', showMenu);

    // Delegate choices & combat & tabs
    var choicesEl = $('choices-container');
    if (choicesEl) {
      choicesEl.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-choice]') : e.target;
        if (btn && btn.getAttribute && btn.getAttribute('data-choice')) {
          handleChoiceClick(btn.getAttribute('data-choice'));
        }
      });
    }

    var combatBoard = $('combat-board');
    if (combatBoard) {
      combatBoard.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('[data-cact]') : e.target;
        if (btn && btn.getAttribute && btn.getAttribute('data-cact')) {
          var slotStr = btn.getAttribute('data-slot');
          handleCombatClick(btn.getAttribute('data-cact'), slotStr ? parseInt(slotStr, 10) : 0);
        }
      });
    }

    var tabBtns = typeof document !== 'undefined' ? document.querySelectorAll('.tab-btn') : [];
    for (var t = 0; t < tabBtns.length; t++) {
      tabBtns[t].addEventListener('click', function (ev) {
        var key = ev.currentTarget.getAttribute('data-tab');
        for (var k = 0; k < tabBtns.length; k++) tabBtns[k].classList.remove('active');
        ev.currentTarget.classList.add('active');
        ['hero', 'gear', 'cast', 'estate'].forEach(function (name) {
          var panel = $('tab-panel-' + name);
          if (panel) panel.classList.toggle('active', name === key);
        });
      });
    }

    var sidebar = typeof document !== 'undefined' ? document.querySelector('.sidebar-panel') : null;
    if (sidebar) {
      sidebar.addEventListener('click', function (e) {
        var eqBtn = e.target.closest ? e.target.closest('[data-equip]') : null;
        if (eqBtn) {
          GameApp.V6Combat.equipItem(uiState.state, eqBtn.getAttribute('data-equip'));
          renderAll();
          return;
        }
        var compBtn = e.target.closest ? e.target.closest('[data-companion]') : null;
        if (compBtn) {
          var res = GameApp.V6CastEngine.setActiveCompanion(uiState.state, compBtn.getAttribute('data-companion') || null);
          if (!res.ok) uiState.lastOutcome = res.reason;
          renderAll();
        }
      });
    }

    var modalBody = $('modal-body');
    if (modalBody) {
      modalBody.addEventListener('click', function (e) {
        var t = e.target;
        var el = t.closest ? t.closest('button') : t;
        if (!el || !el.getAttribute) return;

        if (el.getAttribute('data-travel')) {
          var tr = GameApp.V6WorldTime.travelToCity(uiState.state, el.getAttribute('data-travel'));
          uiState.lastOutcome = tr.message || tr.reason;
          uiState.currentEvent = GameApp.V6Engine.getNextEvent(uiState.state);
          closeModal();
          renderAll();
        } else if (el.getAttribute('data-sfilter')) {
          uiState.shopFilter = el.getAttribute('data-sfilter');
          openShopModal();
        } else if (el.getAttribute('data-buyitem')) {
          var br = GameApp.V6Combat.buyShopItem(uiState.state, el.getAttribute('data-buyitem'));
          uiState.lastOutcome = br.ok ? ('اشتريتَ وجهّزتَ: ' + br.item.name) : br.reason;
          openShopModal();
          renderAll();
        } else if (el.getAttribute('data-buyprop')) {
          var pr = GameApp.V6WorldTime.buyProperty(uiState.state, el.getAttribute('data-buyprop'));
          uiState.lastOutcome = pr.ok ? ('امتلكتَ: ' + pr.property.name) : pr.reason;
          openShopModal();
          renderAll();
        } else if (el.getAttribute('data-loan')) {
          var lr = GameApp.V6WorldTime.takeLoan(uiState.state, 100, el.getAttribute('data-loan'));
          uiState.lastOutcome = lr.ok ? ('اقترضتَ 100 ذهب (مستحق: ' + lr.totalOwed + ').') : lr.reason;
          openShopModal();
          renderAll();
        } else if (el.getAttribute('data-repay')) {
          var rr = GameApp.V6WorldTime.repayDebt(uiState.state, uiState.state.vitals.debt);
          uiState.lastOutcome = rr.ok ? ('تم سداد ' + rr.paid + ' من الدين.') : rr.reason;
          openShopModal();
          renderAll();
        } else if (el.getAttribute('data-saveslot')) {
          GameApp.V6Storage.saveSlot(parseInt(el.getAttribute('data-saveslot'), 10), uiState.state);
          openSavesModal();
        } else if (el.getAttribute('data-loadslot')) {
          var loaded = GameApp.V6Storage.loadSlot(parseInt(el.getAttribute('data-loadslot'), 10));
          if (loaded) {
            uiState.state = loaded;
            uiState.currentEvent = GameApp.V6Engine.getNextEvent(loaded);
            closeModal();
            showGame();
          }
        } else if (el.getAttribute('data-speed')) {
          GameApp.V6Storage.saveSettings({ textSpeed: el.getAttribute('data-speed') });
          openSettingsModal();
        } else if (el.getAttribute('data-togglesound')) {
          var cur = GameApp.V6Storage.getSettings();
          GameApp.V6Storage.saveSettings({ soundEnabled: !cur.soundEnabled });
          openSettingsModal();
        } else if (el.getAttribute('data-buyup-cat')) {
          var cat = el.getAttribute('data-buyup-cat');
          var key = el.getAttribute('data-buyup-key');
          var cost = parseInt(el.getAttribute('data-buyup-cost'), 10);
          var res = GameApp.V6Storage.buyReincarnationUpgrade(cat, key, cost);
          if (!res.ok) {
            alert(res.reason);
          }
          openReincarnationModal();
        } else if (el.getAttribute('data-resetupgrades')) {
          GameApp.V6Storage.resetReincarnationUpgrades();
          openReincarnationModal();
        } else if (el.id === 'mob-quick-map') {
          openMapModal();
        } else if (el.id === 'mob-quick-shop') {
          openShopModal();
        } else if (el.id === 'mob-quick-timeline') {
          openTimelineModal();
        } else if (el.id === 'mob-quick-saves') {
          openSavesModal();
        } else if (el.id === 'mob-quick-hall') {
          openHallModal();
        } else if (el.id === 'mob-quick-settings') {
          openSettingsModal();
        } else if (el.id === 'mob-quick-home') {
          closeModal();
          showMenu();
        } else if (el.id === 'btn-export-save-json') {
          var bundleJson = GameApp.V6Storage.exportAllSaveData();
          var blob = new Blob([bundleJson], { type: 'application/json' });
          var u = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = u;
          a.download = 'aldhll_al_tah_save_' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(u);
        }
      });

      modalBody.addEventListener('change', function (e) {
        if (e.target && e.target.id === 'input-import-save-json' && e.target.files && e.target.files[0]) {
          var reader = new FileReader();
          reader.onload = function (evt) {
            var res = GameApp.V6Storage.importAllSaveData(evt.target.result);
            if (res.ok) {
              alert('تم استيراد ملف الحفظ بنجاح! تم تحديث جميع الخانات والميراث.');
              openSavesModal();
            } else {
              alert(res.reason || 'تعذر قراءة ملف الحفظ.');
            }
          };
          reader.readAsText(e.target.files[0]);
        }
      });
    }

    function updateMobileNavActive(tabKey) {
      var mobBtns = document.querySelectorAll('.mob-nav-btn');
      for (var b = 0; b < mobBtns.length; b++) {
        mobBtns[b].classList.toggle('active', mobBtns[b].getAttribute('data-mob-tab') === tabKey);
      }
    }

    var mobNav = $('mobile-bottom-nav');
    if (mobNav) {
      mobNav.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.mob-nav-btn') : null;
        if (!btn) return;
        var tab = btn.getAttribute('data-mob-tab');
        if (tab === 'stage') {
          document.body.classList.remove('mobile-view-sidebar');
          updateMobileNavActive('stage');
        } else if (tab === 'hero' || tab === 'gear') {
          document.body.classList.add('mobile-view-sidebar');
          updateMobileNavActive(tab);
          var sidebarTab = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
          if (sidebarTab) sidebarTab.click();
        } else if (tab === 'city') {
          openCityQuickModal();
        } else if (tab === 'menu') {
          openMenuQuickModal();
        }
      });
    }

    var mobBackBtn = $('btn-mobile-back-to-stage');
    if (mobBackBtn) {
      mobBackBtn.addEventListener('click', function () {
        document.body.classList.remove('mobile-view-sidebar');
        updateMobileNavActive('stage');
      });
    }

    // Android Hardware Back Button integration via Capacitor
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', function () {
        var modal = $('modal-overlay');
        if (modal && !modal.classList.contains('hidden')) {
          closeModal();
          return;
        }
        if (document.body.classList.contains('mobile-view-sidebar')) {
          document.body.classList.remove('mobile-view-sidebar');
          updateMobileNavActive('stage');
          return;
        }
        var appShell = $('app');
        if (appShell && !appShell.classList.contains('hidden')) {
          if (confirm('هل ترغب بالعودة إلى شاشة البداية؟')) {
            showMenu();
          }
        } else {
          window.Capacitor.Plugins.App.exitApp();
        }
      });
    }
  }

  function init() {
    bindEvents();
    showMenu();
  }

  GameApp.V6UI = {
    init: init,
    showMenu: showMenu,
    startNewRun: startNewRun,
    openMapModal: openMapModal,
    openShopModal: openShopModal,
    openTimelineModal: openTimelineModal,
    openHallModal: openHallModal,
    openReincarnationModal: openReincarnationModal,
    _uiState: uiState
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6UI;
  }
})(typeof window !== 'undefined' ? window : globalThis);

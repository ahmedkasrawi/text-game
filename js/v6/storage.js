(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});
  var memoryFallback = {};

  function getSchema() {
    return GameApp.V6Schema;
  }

  function getStore() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch (e) {}
    return {
      getItem: function (k) { return memoryFallback[k] || null; },
      setItem: function (k, v) { memoryFallback[k] = String(v); },
      removeItem: function (k) { delete memoryFallback[k]; }
    };
  }

  function readJson(key, fallback) {
    try {
      var raw = getStore().getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function syncToNativePreferences(key, value) {
    try {
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
        window.Capacitor.Plugins.Preferences.set({
          key: key,
          value: JSON.stringify(value)
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function writeJson(key, value) {
    try {
      getStore().setItem(key, JSON.stringify(value));
      syncToNativePreferences(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getKeys() {
    return getSchema().STORAGE_KEYS;
  }

  function saveAuto(state) {
    if (!state) return false;
    return writeJson(getKeys().AUTO, {
      savedAt: new Date().toISOString(),
      state: state
    });
  }

  function loadAuto() {
    var payload = readJson(getKeys().AUTO, null);
    return payload && payload.state && payload.state.schemaVersion === 6 ? payload.state : null;
  }

  function listSlots() {
    var slots = readJson(getKeys().SLOTS, [null, null, null]);
    while (slots.length < 3) slots.push(null);
    return slots.slice(0, 3);
  }

  function saveSlot(slotIndex, state, label) {
    if (slotIndex < 0 || slotIndex > 2 || !state) return false;
    var slots = listSlots();
    slots[slotIndex] = {
      savedAt: new Date().toISOString(),
      label: label || ('عمر ' + state.timeline.age + ' • ' + state.timeline.locationId),
      state: JSON.parse(JSON.stringify(state))
    };
    return writeJson(getKeys().SLOTS, slots);
  }

  function loadSlot(slotIndex) {
    var slots = listSlots();
    var item = slots[slotIndex];
    return item && item.state ? item.state : null;
  }

  function deleteSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex > 2) return false;
    var slots = listSlots();
    slots[slotIndex] = null;
    return writeJson(getKeys().SLOTS, slots);
  }

  function getProfile() {
    var def = {
      diamonds: 0,
      reincarnationUpgrades: {
        stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
        skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
        startingGold: 0
      },
      unlockedEndings: {},
      unlockedPrestige: {},
      totalRuns: 0,
      legacyBridge: getSchema().readLegacyV5Bridge(getStore())
    };
    var stored = readJson(getKeys().PROFILE, null);
    if (!stored || typeof stored !== 'object') return def;
    return {
      diamonds: typeof stored.diamonds === 'number' ? stored.diamonds : 0,
      reincarnationUpgrades: stored.reincarnationUpgrades || {
        stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
        skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
        startingGold: 0
      },
      unlockedEndings: stored.unlockedEndings || {},
      unlockedPrestige: stored.unlockedPrestige || {},
      totalRuns: stored.totalRuns || 0,
      legacyBridge: getSchema().readLegacyV5Bridge(getStore())
    };
  }

  function saveProfile(profile) {
    return writeJson(getKeys().PROFILE, {
      diamonds: typeof profile.diamonds === 'number' ? profile.diamonds : 0,
      reincarnationUpgrades: profile.reincarnationUpgrades || {
        stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
        skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
        startingGold: 0
      },
      unlockedEndings: profile.unlockedEndings || {},
      unlockedPrestige: profile.unlockedPrestige || {},
      totalRuns: profile.totalRuns || 0
    });
  }

  function addDiamonds(amount) {
    if (!amount || amount <= 0) return 0;
    var profile = getProfile();
    profile.diamonds = (profile.diamonds || 0) + Math.floor(amount);
    saveProfile(profile);
    return profile.diamonds;
  }

  function buyReincarnationUpgrade(category, key, cost) {
    var profile = getProfile();
    cost = typeof cost === 'number' ? cost : (category === 'stats' ? 1 : (category === 'skills' ? 2 : 1));
    if ((profile.diamonds || 0) < cost) {
      return { ok: false, reason: 'لا تملك ما يكفي من الماسات (' + cost + ' مطلوب).' };
    }
    profile.diamonds -= cost;
    var up = profile.reincarnationUpgrades = profile.reincarnationUpgrades || {
      stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
      skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
      startingGold: 0
    };
    if (category === 'stats') {
      up.stats = up.stats || {};
      up.stats[key] = (up.stats[key] || 0) + 1;
    } else if (category === 'skills') {
      up.skills = up.skills || {};
      up.skills[key] = (up.skills[key] || 0) + 1;
    } else if (category === 'startingGold') {
      up.startingGold = (up.startingGold || 0) + 20;
    }
    saveProfile(profile);
    return { ok: true, profile: profile };
  }

  function resetReincarnationUpgrades() {
    var profile = getProfile();
    var up = profile.reincarnationUpgrades || {};
    var refund = 0;
    if (up.stats) {
      Object.keys(up.stats).forEach(function (k) { refund += (up.stats[k] || 0) * 1; });
    }
    if (up.skills) {
      Object.keys(up.skills).forEach(function (k) { refund += (up.skills[k] || 0) * 2; });
    }
    if (up.startingGold) {
      refund += Math.floor((up.startingGold || 0) / 20) * 1;
    }
    profile.diamonds = (profile.diamonds || 0) + refund;
    profile.reincarnationUpgrades = {
      stats: { str: 0, agi: 0, int: 0, ins: 0, cha: 0 },
      skills: { combat: 0, smithing: 0, stealth: 0, trade: 0, alchemy: 0, politics: 0 },
      startingGold: 0
    };
    saveProfile(profile);
    return { ok: true, refunded: refund, profile: profile };
  }

  function recordProfileUnlock(endingId, prestigeList) {
    var profile = getProfile();
    if (endingId) {
      profile.unlockedEndings[endingId] = new Date().toISOString();
      profile.totalRuns += 1;
    }
    (prestigeList || []).forEach(function (ach) {
      var id = typeof ach === 'string' ? ach : ach.id;
      if (id && !profile.unlockedPrestige[id]) {
        profile.unlockedPrestige[id] = new Date().toISOString();
      }
    });
    saveProfile(profile);
    return profile;
  }

  function getSettings() {
    var bridge = getSchema().readLegacyV5Bridge(getStore());
    var def = {
      textSpeed: (bridge.inheritedSettings && bridge.inheritedSettings.textSpeed) || 'normal',
      soundEnabled: bridge.inheritedSettings ? bridge.inheritedSettings.soundEnabled : true
    };
    var stored = readJson(getKeys().SETTINGS, null);
    if (!stored) return def;
    return {
      textSpeed: stored.textSpeed || def.textSpeed,
      soundEnabled: typeof stored.soundEnabled === 'boolean' ? stored.soundEnabled : def.soundEnabled
    };
  }

  function saveSettings(next) {
    var cur = getSettings();
    var merged = {
      textSpeed: next.textSpeed || cur.textSpeed,
      soundEnabled: typeof next.soundEnabled === 'boolean' ? next.soundEnabled : cur.soundEnabled
    };
    writeJson(getKeys().SETTINGS, merged);
    return merged;
  }

  function exportAllSaveData() {
    var keys = getKeys();
    var bundle = {
      app: 'al_dhll_al_tah',
      schemaVersion: 6,
      exportedAt: new Date().toISOString(),
      autoSave: readJson(keys.AUTO, null),
      slots: readJson(keys.SLOTS, [null, null, null]),
      profile: readJson(keys.PROFILE, null),
      settings: readJson(keys.SETTINGS, null)
    };
    return JSON.stringify(bundle, null, 2);
  }

  function importAllSaveData(rawJson) {
    try {
      var data = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      if (!data || data.schemaVersion !== 6) {
        return { ok: false, reason: 'ملف غير صالح أو إصدار غير متوافق (يتطلب الإصدار 6).' };
      }
      var keys = getKeys();
      if (data.autoSave) writeJson(keys.AUTO, data.autoSave);
      if (data.slots && Array.isArray(data.slots)) writeJson(keys.SLOTS, data.slots);
      if (data.profile) writeJson(keys.PROFILE, data.profile);
      if (data.settings) writeJson(keys.SETTINGS, data.settings);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: 'حدث خطأ في قراءة ملف الحفظ: ' + (e.message || e) };
    }
  }

  GameApp.V6Storage = {
    saveAuto: saveAuto,
    loadAuto: loadAuto,
    listSlots: listSlots,
    saveSlot: saveSlot,
    loadSlot: loadSlot,
    deleteSlot: deleteSlot,
    getProfile: getProfile,
    saveProfile: saveProfile,
    addDiamonds: addDiamonds,
    buyReincarnationUpgrade: buyReincarnationUpgrade,
    resetReincarnationUpgrades: resetReincarnationUpgrades,
    recordProfileUnlock: recordProfileUnlock,
    getSettings: getSettings,
    saveSettings: saveSettings,
    exportAllSaveData: exportAllSaveData,
    importAllSaveData: importAllSaveData
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.V6Storage;
  }
})(typeof window !== 'undefined' ? window : globalThis);

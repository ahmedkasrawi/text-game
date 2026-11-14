(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});

  var KEYS = {
    AUTO: 'salil_anvil_autosave_v1',
    SLOTS: 'salil_anvil_slots_v1',
    ENDINGS: 'salil_anvil_endings_v1',
    SETTINGS: 'salil_anvil_settings_v1'
  };

  var memoryFallback = {};

  function getStore() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch (e) {
      // Fallback for restricted storage contexts
    }
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

  function writeJson(key, value) {
    try {
      getStore().setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveAuto(state) {
    if (!state) return false;
    return writeJson(KEYS.AUTO, {
      savedAt: new Date().toISOString(),
      state: state
    });
  }

  function loadAuto() {
    var payload = readJson(KEYS.AUTO, null);
    return payload && payload.state ? payload.state : null;
  }

  function clearAuto() {
    try {
      getStore().removeItem(KEYS.AUTO);
    } catch (e) {}
  }

  function getSlots() {
    var slots = readJson(KEYS.SLOTS, {});
    return [1, 2, 3].map(function (num) {
      var slot = slots['slot_' + num] || null;
      return {
        slotId: num,
        data: slot
      };
    });
  }

  function saveToSlot(slotId, state) {
    var slots = readJson(KEYS.SLOTS, {});
    slots['slot_' + slotId] = {
      savedAt: new Date().toISOString(),
      meta: {
        age: state.age,
        turnIndex: state.turnIndex,
        career: state.career,
        phase: state.phase
      },
      state: state
    };
    return writeJson(KEYS.SLOTS, slots);
  }

  function loadFromSlot(slotId) {
    var slots = readJson(KEYS.SLOTS, {});
    var entry = slots['slot_' + slotId];
    return entry && entry.state ? entry.state : null;
  }

  function deleteSlot(slotId) {
    var slots = readJson(KEYS.SLOTS, {});
    delete slots['slot_' + slotId];
    return writeJson(KEYS.SLOTS, slots);
  }

  function getUnlockedEndings() {
    return readJson(KEYS.ENDINGS, {});
  }

  function unlockEnding(endingId) {
    if (!endingId) return false;
    var map = getUnlockedEndings();
    if (!map[endingId]) {
      map[endingId] = { unlockedAt: new Date().toISOString() };
      writeJson(KEYS.ENDINGS, map);
      return true;
    }
    return false;
  }

  function getLegacyBonus() {
    var count = Object.keys(getUnlockedEndings()).length;
    if (count <= 0) return null;
    if (count <= 2) {
      return {
        tier: 1,
        count: count,
        title: 'بصمة التجربة الأولى',
        desc: '+10 ذهباً +1 حدس + وسم «ذاكرة العائد» + إكسير شفاء',
        gold: 10,
        ins: 1,
        healing: 1,
        trait: 'ذاكرة العائد'
      };
    }
    if (count <= 5) {
      return {
        tier: 2,
        count: count,
        title: 'ذاكرة المحاولات المتراكمة',
        desc: '+15 ذهباً +1 حدس +1 براعة + كشف مهارة الظلال (1) + وسم «ذاكرة العائد» + إكسير شفاء وترياق',
        gold: 15,
        ins: 1,
        agi: 1,
        skills: { shadow: 1 },
        healing: 1,
        antidote: 1,
        trait: 'ذاكرة العائد'
      };
    }
    return {
      tier: 3,
      count: count,
      title: 'إرث سليل السندان',
      desc: '+20 ذهباً +1 حدس +1 براعة +1 ذكاء + كشف الكيمياء والظلال (1) + جرعة تركيز وشفاء وتلميح سر مسار السيف',
      gold: 20,
      ins: 1,
      agi: 1,
      int: 1,
      skills: { shadow: 1, alchemy: 1 },
      healing: 1,
      focus: 1,
      trait: 'ذاكرة العائد',
      unlockSwordRumors: true
    };
  }

  function getSettings() {
    return Object.assign(
      { textSpeed: 'fast', soundEnabled: true, activeSidebarTab: 'character', useLegacy: true, quickFlow: false },
      readJson(KEYS.SETTINGS, {})
    );
  }

  function saveSettings(settings) {
    return writeJson(KEYS.SETTINGS, settings);
  }

  GameApp.Storage = {
    saveAuto: saveAuto,
    loadAuto: loadAuto,
    clearAuto: clearAuto,
    getSlots: getSlots,
    saveToSlot: saveToSlot,
    loadFromSlot: loadFromSlot,
    deleteSlot: deleteSlot,
    getUnlockedEndings: getUnlockedEndings,
    unlockEnding: unlockEnding,
    getLegacyBonus: getLegacyBonus,
    getSettings: getSettings,
    saveSettings: saveSettings
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameApp.Storage;
  }
})(typeof window !== 'undefined' ? window : globalThis);

(function (root) {
  'use strict';

  var GameApp = (root.GameApp = root.GameApp || {});
  var audioCtx = null;
  var enabled = true;

  function ensureContext() {
    if (!enabled || typeof window === 'undefined') return null;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function playTone(freq, duration, type, gainVal, slideTo) {
    var ctx = ensureContext();
    if (!ctx) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    gain.gain.setValueAtTime(gainVal || 0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  function play(kind) {
    if (!enabled) return;
    if (kind === 'click') {
      playTone(420, 0.06, 'sine', 0.035, 320);
    } else if (kind === 'success') {
      playTone(440, 0.11, 'triangle', 0.05, 580);
      setTimeout(function () { playTone(660, 0.16, 'triangle', 0.05, 740); }, 70);
    } else if (kind === 'fail') {
      playTone(210, 0.18, 'sawtooth', 0.04, 130);
    } else if (kind === 'danger') {
      playTone(170, 0.25, 'sawtooth', 0.05, 110);
    } else if (kind === 'forge') {
      playTone(880, 0.14, 'square', 0.025, 520);
    } else if (kind === 'ending') {
      playTone(392, 0.18, 'triangle', 0.05);
      setTimeout(function () { playTone(494, 0.18, 'triangle', 0.05); }, 110);
      setTimeout(function () { playTone(587, 0.28, 'triangle', 0.06); }, 220);
    }
  }

  function setEnabled(val) {
    enabled = Boolean(val);
  }

  function isEnabled() {
    return enabled;
  }

  GameApp.Audio = {
    play: play,
    setEnabled: setEnabled,
    isEnabled: isEnabled
  };
})(typeof window !== 'undefined' ? window : globalThis);

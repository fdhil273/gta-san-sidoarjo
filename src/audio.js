/**
 * Web Audio API BGM & SFX Engine for GTA: San Sidoarjo.
 * Includes a procedural groovy GTA-inspired West Coast / Lo-Fi Campus BGM loop
 * (warm Rhodes chords + G-funk bassline + crisp soft drum beat) with independent music toggle,
 * plus all game sound effects.
 */
export class SoundFX {
  constructor() {
    this.enabled = true;      // SFX master toggle
    this.bgmEnabled = true;   // Background music toggle
    this.ctx = null;

    // Procedural BGM Sequencer State
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmMood = 'morning'; // 'morning' | 'midday' | 'sunset'
    this.bgmDucked = false;
    this.noiseBuffer = null;
  }

  ensureContext() {
    if (!this.enabled && !this.bgmEnabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.noiseBuffer && this.ctx) {
      const len = Math.floor(this.ctx.sampleRate * 0.25);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    return this.ctx;
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
  }

  setBgmEnabled(val) {
    this.bgmEnabled = Boolean(val);
    if (this.bgmEnabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  setBgmMood(mood) {
    this.bgmMood = mood || 'morning';
  }

  setBgmDucked(val) {
    this.bgmDucked = Boolean(val);
  }

  /**
   * Starts a chill, groovy West-Coast / Lo-Fi GTA-campus beat (~92 BPM, 16th-note step = 163ms).
   */
  startBgm() {
    if (!this.bgmEnabled) return;
    if (this.bgmTimer) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.bgmStep = 0;
    const STEP_MS = 162; // ~92.5 BPM laid-back San Andreas groove
    this.bgmTimer = setInterval(() => {
      if (!this.bgmEnabled) return;
      this.playBgmStep(this.bgmStep);
      this.bgmStep = (this.bgmStep + 1) % 32;
    }, STEP_MS);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playBgmStep(step) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const volScale = this.bgmDucked ? 0.28 : 1.0;

    // 1) Groovy Kick Drum (steps 0, 6, 10, 16, 22, 26)
    if ([0, 6, 10, 16, 22, 26].includes(step)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(118, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);
      gain.gain.setValueAtTime(0.095 * volScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }

    // 2) Crisp Soft Snare / Clap on backbeats (4, 12, 20, 28)
    if ([4, 12, 20, 28].includes(step) && this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1850;
      bp.Q.value = 1.4;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.042 * volScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      src.connect(bp);
      bp.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.12);
    }

    // 3) Subtle Lo-Fi Hi-Hat ticks (every 2 steps)
    if (step % 2 === 0 && this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 6500;
      const gain = ctx.createGain();
      const vol = (step % 4 === 2 ? 0.016 : 0.009) * volScale;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      src.connect(hp);
      hp.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.05);
    }

    // 4) Funky West-Coast Synth Bassline (Am9 -> Fmaj7 -> Dm9 -> E7 vibe!)
    const bassPattern =
      this.bgmMood === 'sunset'
        ? { 0: 110, 6: 110, 8: 87.31, 14: 98.0, 16: 73.42, 22: 82.41, 24: 82.41, 28: 98.0 }
        : { 0: 130.81, 6: 146.83, 8: 110.0, 14: 130.81, 16: 87.31, 22: 98.0, 24: 98.0, 28: 110.0 };

    const bassFreq = bassPattern[step];
    if (bassFreq) {
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, now);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(420, now);
      lp.frequency.exponentialRampToValueAtTime(190, now + 0.28);
      gain.gain.setValueAtTime(0.045 * volScale, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.34);
    }

    // 5) Warm Electric Piano / Rhodes Chords (every 8 steps)
    const chordsMorning = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
    ];
    const chordsSunset = [
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [146.83, 220.0, 261.63, 329.63], // Dm9
      [164.81, 207.65, 246.94, 293.66], // E7
    ];
    if (step % 8 === 0) {
      const bank = this.bgmMood === 'sunset' ? chordsSunset : chordsMorning;
      const chord = bank[(step / 8) % bank.length];
      chord.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.018 * volScale, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.0);
      });
    }

    // 6) Signature Soft G-Funk Whistle / Pluck Lead Accent
    const leadMorning = { 2: 523.25, 4: 659.25, 11: 587.33, 18: 523.25, 20: 440.0, 27: 587.33 };
    const leadSunset = { 2: 659.25, 5: 587.33, 10: 523.25, 18: 440.0, 22: 523.25, 28: 493.88 };
    const leadFreq = (this.bgmMood === 'sunset' ? leadSunset : leadMorning)[step];
    if (leadFreq) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(leadFreq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.022 * volScale, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    }
  }

  tone(freq, duration = 0.14, type = 'sine', volume = 0.1, delay = 0) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  schoolBell() {
    const notes = [659.25, 523.25, 587.33, 392.0];
    notes.forEach((n, idx) => this.tone(n, 0.34, 'triangle', 0.1, idx * 0.22));
  }

  missionPassed() {
    this.tone(261.63, 0.22, 'triangle', 0.11, 0);
    this.tone(329.63, 0.22, 'triangle', 0.11, 0.12);
    this.tone(392.0, 0.22, 'triangle', 0.11, 0.24);
    this.tone(523.25, 0.55, 'triangle', 0.13, 0.36);
    this.tone(659.25, 0.55, 'sine', 0.09, 0.36);
  }

  statPenalty() {
    this.tone(311.13, 0.18, 'sawtooth', 0.08, 0);
    this.tone(277.18, 0.18, 'sawtooth', 0.08, 0.16);
    this.tone(233.08, 0.36, 'sawtooth', 0.09, 0.32);
  }

  easterEggFound() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((n, idx) => this.tone(n, 0.24, 'triangle', 0.1, idx * 0.075));
  }

  ambientPop() {
    this.tone(620, 0.06, 'sine', 0.04, 0);
  }

  dialogueBlip() {
    this.tone(540, 0.07, 'sine', 0.06, 0);
    this.tone(720, 0.06, 'sine', 0.04, 0.05);
  }

  selectChoice() {
    this.tone(587.33, 0.09, 'triangle', 0.09, 0);
    this.tone(880, 0.14, 'triangle', 0.09, 0.07);
  }

  uniformSwap() {
    this.tone(440, 0.08, 'sine', 0.08, 0);
    this.tone(660, 0.1, 'triangle', 0.09, 0.06);
  }

  pickup() {
    this.tone(523.25, 0.1, 'sine', 0.09, 0);
    this.tone(659.25, 0.1, 'sine', 0.09, 0.08);
    this.tone(1046.5, 0.22, 'triangle', 0.1, 0.16);
  }

  pianoNote(laneIdx) {
    const freqs = [523.25, 587.33, 659.25, 783.99];
    const f = freqs[laneIdx % freqs.length];
    this.tone(f, 0.32, 'triangle', 0.12, 0);
    this.tone(f * 2, 0.18, 'sine', 0.045, 0.01);
  }

  pianoWrong() {
    this.tone(195, 0.16, 'sawtooth', 0.07, 0);
  }

  basketSwish() {
    this.tone(440, 0.12, 'triangle', 0.1, 0);
    this.tone(659.25, 0.15, 'triangle', 0.11, 0.09);
    this.tone(880, 0.24, 'sine', 0.12, 0.18);
  }

  basketMiss() {
    this.tone(240, 0.12, 'sawtooth', 0.06, 0);
    this.tone(180, 0.18, 'sawtooth', 0.05, 0.1);
  }

  soccerKick() {
    this.tone(145, 0.11, 'triangle', 0.14, 0);
    this.tone(85, 0.13, 'sine', 0.12, 0.02);
  }

  soccerGoal() {
    this.tone(523.25, 0.14, 'triangle', 0.11, 0);
    this.tone(659.25, 0.14, 'triangle', 0.11, 0.1);
    this.tone(783.99, 0.16, 'triangle', 0.11, 0.2);
    this.tone(1046.5, 0.38, 'triangle', 0.13, 0.3);
  }

  victoryFanfare() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    chord.forEach((n, idx) => this.tone(n, 0.42, 'triangle', 0.1, idx * 0.1));
  }
}

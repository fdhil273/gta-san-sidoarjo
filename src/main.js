import * as THREE from 'three';
import { preloadPolyforkAssets } from './assets.js';
import { SchoolWorld, WORLD_BOUNDS, MAP_ZONES } from './world.js';
import { ComputerVisionController } from './cv.js';
import {
  STORY_STAGES,
  SIDE_INTERACTIONS,
  AMBIENT_FLAVOR_SPOTS,
  PHYSICAL_EASTER_EGGS,
  computeEnding,
} from './story.js';
import { SoundFX } from './audio.js';

const ENDINGS_STORAGE_KEY = 'gta_san_sidoarjo_endings_v1';

const ALL_ENDING_META = [
  { id: 'ending_hacker', label: '🎓 Bintang Cerdas' },
  { id: 'ending_king', label: '🌟 King of San Sidoarjo' },
  { id: 'ending_mvp', label: '🏆 MVP Lapangan' },
  { id: 'secret_master', label: '👑 Secret Legenda' },
];

const els = {
  canvas: document.getElementById('game-canvas'),
  mpBanner: document.getElementById('mission-passed-banner'),
  mpTitle: document.getElementById('mp-title'),
  mpSub: document.getElementById('mp-sub'),
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingStatus: document.getElementById('loading-status'),
  loadingProgress: document.getElementById('loading-progress'),
  loadingCount: document.getElementById('loading-count'),
  chapterBadge: document.getElementById('chapter-badge'),
  timePill: document.getElementById('time-pill'),
  missionText: document.getElementById('mission-text'),
  distanceHint: document.getElementById('distance-hint'),
  btnInteract: document.getElementById('btn-interact'),
  btnSideInteract: document.getElementById('btn-side-interact'),
  statAkademik: document.getElementById('stat-akademik'),
  statSosial: document.getElementById('stat-sosial'),
  statOlahraga: document.getElementById('stat-olahraga'),
  btnToggleCv: document.getElementById('btn-toggle-cv'),
  btnCvLabel: document.getElementById('btn-cv-label'),
  btnToggleRadar: document.getElementById('btn-toggle-radar'),
  btnLowGpu: document.getElementById('btn-low-gpu'),
  btnToggleBgm: document.getElementById('btn-toggle-bgm'),
  btnToggleAudio: document.getElementById('btn-toggle-audio'),
  btnOpenHelp: document.getElementById('btn-open-help'),
  minimapPanel: document.getElementById('minimap-panel'),
  minimapCanvas: document.getElementById('minimap-canvas'),
  btnZoomIn: document.getElementById('btn-zoom-in'),
  btnZoomOut: document.getElementById('btn-zoom-out'),
  cvDock: document.getElementById('cv-dock'),
  cvBody: document.getElementById('cv-body'),
  btnCollapseCv: document.getElementById('btn-collapse-cv'),
  cvVideo: document.getElementById('cv-video'),
  cvCanvas: document.getElementById('cv-canvas'),
  cvPlaceholder: document.getElementById('cv-placeholder'),
  cvEngineBadge: document.getElementById('cv-engine-badge'),
  cvGestureLabel: document.getElementById('cv-gesture-label'),
  cvVectorReadout: document.getElementById('cv-vector-readout'),
  cvDwellWrap: document.getElementById('cv-dwell-wrap'),
  cvDwellLabel: document.getElementById('cv-dwell-label'),
  cvDwellBar: document.getElementById('cv-dwell-bar'),
  ambientToast: document.getElementById('ambient-toast'),
  ambientText: document.getElementById('ambient-text'),
  dialoguePanel: document.getElementById('dialogue-panel'),
  dialogueSpeaker: document.getElementById('dialogue-speaker'),
  dialogueRole: document.getElementById('dialogue-role'),
  dialogueBody: document.getElementById('dialogue-body'),
  dialogueChoices: document.getElementById('dialogue-choices'),
  dialogueContinueWrap: document.getElementById('dialogue-continue-wrap'),
  btnDialogueNext: document.getElementById('btn-dialogue-next'),
  minigamePanel: document.getElementById('minigame-panel'),
  minigameTitle: document.getElementById('minigame-title'),
  minigameScore: document.getElementById('minigame-score'),
  minigameInstruction: document.getElementById('minigame-instruction'),
  pianoUi: document.getElementById('piano-ui'),
  pianoPads: [...document.querySelectorAll('.piano-pad')],
  microscopeUi: document.getElementById('microscope-ui'),
  focusNeedle: document.getElementById('focus-needle'),
  focusLockProgress: document.getElementById('focus-lock-progress'),
  btnFocusUp: document.getElementById('btn-focus-up'),
  btnFocusDown: document.getElementById('btn-focus-down'),
  basketballUi: document.getElementById('basketball-ui'),
  shotPowerProgress: document.getElementById('shot-power-progress'),
  btnShootCharge: document.getElementById('btn-shoot-charge'),
  penaltyUi: document.getElementById('penalty-ui'),
  penaltyLaneBtns: [...document.querySelectorAll('.lane-btn')],
  btnPenaltyKick: document.getElementById('btn-penalty-kick'),
  introDialog: document.getElementById('intro-dialog'),
  helpDialog: document.getElementById('help-dialog'),
  helpEeCount: document.getElementById('help-ee-count'),
  endingDialog: document.getElementById('ending-dialog'),
  endingCode: document.getElementById('ending-code'),
  endingBadge: document.getElementById('ending-badge'),
  endingSummary: document.getElementById('ending-summary'),
  endingCollectionTitle: document.getElementById('ending-collection-title'),
  endingChips: document.getElementById('ending-chips'),
  endingCvStatus: document.getElementById('ending-cv-status'),
  endingCvLabel: document.getElementById('ending-cv-label'),
  endingCvBar: document.getElementById('ending-cv-bar'),
  btnEndingReplay: document.getElementById('btn-ending-replay'),
  btnEndingFreeroam: document.getElementById('btn-ending-freeroam'),
  finalAkademik: document.getElementById('final-akademik'),
  finalSosial: document.getElementById('final-sosial'),
  finalOlahraga: document.getElementById('final-olahraga'),
  srAnnouncer: document.getElementById('sr-announcer'),
};

// Light-dismiss fallback for <dialog closedby="any">
if (!('closedBy' in HTMLDialogElement.prototype)) {
  const isOutside = (e, dialog) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => { pressedOutside = isOutside(e, dialog); });
    dialog.addEventListener('pointerup', (e) => { if (pressedOutside && isOutside(e, dialog)) dialog.close(); });
  }
}

const sfx = new SoundFX();
let world = null;
let cv = null;

const state = {
  mode: 'loading',
  stageIndex: 0,
  stats: { akademik: 10, sosial: 10, olahraga: 10 },
  completedSides: new Set(),
  foundEasterEggs: new Set(),
  seenAmbientCooldowns: new Map(),
  cheatBuffer: '',
  nearbySide: null,
  radarVisible: true,
  camYaw: 0,
  camZoom: 13.5,
  keys: new Set(),
  inTargetRange: false,

  dialogueQueue: [],
  activeChoiceButtons: [],
  pendingPostDialogue: null,
  isSideDialogue: false,

  dwellKey: null,
  dwellTimer: 0,
  cvActionCooldown: 0,

  pianoTargetLane: 0,
  pianoHits: 0,
  pianoCvDwell: 0,

  microscopeFocus: 15,
  microscopeLock: 0,
  focusDir: 0,

  basketGoals: 0,
  basketCharging: false,
  basketPower: 0,
  basketPowerDir: 1,
  basketShotInFlight: false,
  basketLastCvFist: false,

  penaltyGoals: 0,
  penaltyAimLane: 1,
  penaltyGoalieZ: 16.0,
  penaltyKickInFlight: false,
  penaltyCvKickCooldown: 0,
};

let bannerTimer = null;
function showGtaBanner(title, subtitle, variant = 'pass') {
  els.mpTitle.textContent = title;
  els.mpSub.textContent = subtitle || '';
  els.mpBanner.className = 'mission-passed-banner';
  if (variant === 'penalty') els.mpBanner.classList.add('is-penalty');
  if (variant === 'easter') els.mpBanner.classList.add('is-easter');
  els.mpBanner.hidden = false;

  if (variant === 'penalty') sfx.statPenalty();
  else if (variant === 'easter') sfx.easterEggFound();
  else sfx.missionPassed();

  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { els.mpBanner.hidden = true; }, 2500);
}

let ambientTimer = null;
function showAmbientRemark(text) {
  if (state.mode !== 'explore' && state.mode !== 'freeroam') return;
  els.ambientText.textContent = text;
  els.ambientToast.hidden = false;
  sfx.ambientPop();
  clearTimeout(ambientTimer);
  ambientTimer = setTimeout(() => { els.ambientToast.hidden = true; }, 4500);
}

function setBodyFocusMode(mode) {
  document.body.classList.toggle('in-minigame', mode.startsWith('minigame_'));
  document.body.classList.toggle('in-dialogue', mode === 'dialogue');
}

function announce(msg) {
  els.srAnnouncer.textContent = '';
  requestAnimationFrame(() => { els.srAnnouncer.textContent = msg; });
}

function updateStatsUI() {
  els.statAkademik.textContent = String(state.stats.akademik);
  els.statSosial.textContent = String(state.stats.sosial);
  els.statOlahraga.textContent = String(state.stats.olahraga);
}

function addStats(delta) {
  if (!delta) return;
  for (const key of ['akademik', 'sosial', 'olahraga']) {
    if (!delta[key]) continue;
    state.stats[key] = Math.max(0, state.stats[key] + delta[key]);
    if (delta[key] < 0) {
      const pill = document.querySelector(`.stat-pill[data-stat="${key}"]`);
      if (pill) {
        pill.classList.add('is-penalized');
        setTimeout(() => pill.classList.remove('is-penalized'), 900);
      }
    }
  }
  updateStatsUI();
}

function currentStage() {
  return STORY_STAGES[state.stageIndex] || null;
}

function enterStage(idx) {
  state.stageIndex = idx;
  const stage = currentStage();
  if (!stage) {
    state.mode = 'freeroam';
    setBodyFocusMode('freeroam');
    world.setTargetBeacon(null, false);
    els.chapterBadge.textContent = 'Jelajah Bebas · GTA: San Sidoarjo';
    els.missionText.textContent = 'Jelajahi kampus 3D, temukan seluruh Easter Egg & Side-Quest rahasia!';
    els.distanceHint.textContent = 'Mode Bebas';
    els.btnInteract.hidden = true;
    return;
  }

  els.chapterBadge.textContent = stage.chapterTitle;
  els.timePill.textContent = stage.timeLabel;
  els.missionText.textContent = stage.mission;
  world.setLightingPreset(stage.lighting);
  sfx.setBgmMood(stage.lighting);
  sfx.setBgmDucked(false);
  announce(`${stage.chapterTitle}. ${stage.mission}`);

  if (stage.autoTrigger) {
    world.setTargetBeacon(null, false);
    els.btnInteract.hidden = true;
    if (stage.missionPassedTitle) showGtaBanner('MISSION PASSED!', stage.missionPassedTitle, 'pass');
    startStageDialogue(stage, false);
  } else {
    state.mode = 'explore';
    setBodyFocusMode('explore');
    world.setTargetBeacon(stage.targetPos, true);
  }
}

function triggerCurrentStageInteraction() {
  const stage = currentStage();
  if (!stage || state.mode !== 'explore') return;

  if (stage.onInteractEffect === 'pickupBook' && world.homeworkBook) {
    world.homeworkBook.visible = false;
    world.playerAnim?.play('Pick up');
    world.spawnCelebrationBurst(world.homeworkBook.position.clone().add(new THREE.Vector3(0, 0.6, 0)));
    sfx.pickup();
    addStats({ akademik: 5 });
    if (stage.missionPassedTitle) showGtaBanner('MISSION PASSED!', stage.missionPassedTitle, 'pass');
  } else if (stage.onInteractEffect === 'pickupBackpack' && world.lockerBackpack) {
    world.lockerBackpack.visible = false;
    world.playerAnim?.play('Pick up');
    world.spawnCelebrationBurst(world.lockerBackpack.position.clone().add(new THREE.Vector3(0, 0.6, 0)));
    sfx.pickup();
    addStats({ sosial: 5 });
    if (stage.missionPassedTitle) showGtaBanner('MISSION PASSED!', stage.missionPassedTitle, 'pass');
  } else {
    sfx.dialogueBlip();
  }

  startStageDialogue(stage, false);
}

function triggerSideInteraction(side) {
  if (!side || state.completedSides.has(side.id) || (state.mode !== 'explore' && state.mode !== 'freeroam')) return;
  sfx.dialogueBlip();
  startStageDialogue(side, true);
}

function startStageDialogue(stageObj, isSide = false) {
  state.mode = 'dialogue';
  setBodyFocusMode('dialogue');
  state.isSideDialogue = isSide;
  els.btnInteract.hidden = true;
  els.btnSideInteract.hidden = true;
  els.ambientToast.hidden = true;
  state.dialogueQueue = stageObj.dialogue.map((line) => ({ ...line }));
  state.pendingPostDialogue = stageObj;
  showNextDialogueLine();
}

function showNextDialogueLine() {
  clearCvDwell();
  if (state.dialogueQueue.length === 0) {
    els.dialoguePanel.hidden = true;
    const finished = state.pendingPostDialogue;
    const wasSide = state.isSideDialogue;
    state.pendingPostDialogue = null;
    state.isSideDialogue = false;

    for (const [id] of world.npcs) world.playNpcAnim(id, 'Idle');

    if (wasSide && finished) {
      state.completedSides.add(finished.id);
      world.hideSideMarker(finished.id);
      if (finished.missionPassedTitle) showGtaBanner('SIDE MISSION PASSED!', finished.missionPassedTitle, 'pass');
      state.mode = currentStage() ? 'explore' : 'freeroam';
      setBodyFocusMode(state.mode);
      return;
    }

    if (finished?.missionPassedTitle && !finished.autoTrigger && !finished.onInteractEffect) {
      showGtaBanner('MISSION PASSED!', finished.missionPassedTitle, 'pass');
    }

    if (finished?.startMinigameAfter === 'piano') startPianoMinigame();
    else if (finished?.startMinigameAfter === 'microscope') startMicroscopeMinigame();
    else if (finished?.startMinigameAfter === 'basketball') startBasketballMinigame();
    else if (finished?.startMinigameAfter === 'penalty') startPenaltyMinigame();
    else if (finished?.onCompleteTriggerEnding) showEndingReport();
    else enterStage(state.stageIndex + 1);
    return;
  }

  const line = state.dialogueQueue.shift();
  els.dialoguePanel.hidden = false;
  els.dialogueSpeaker.textContent = line.speaker;
  els.dialogueRole.textContent = line.role || '';
  els.dialogueBody.textContent = line.text;

  if (line.npcId) {
    world.faceNpcTowardPlayer(line.npcId);
    world.playNpcAnim(line.npcId, line.npcAnim || 'Talking');
  }

  els.dialogueChoices.innerHTML = '';
  state.activeChoiceButtons = [];

  if (line.choices && line.choices.length > 0) {
    els.dialogueContinueWrap.hidden = true;
    const fingerHints = ['1 Jari ☝️', '2 Jari ✌️', '3 Jari 🤟'];
    line.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-key">${fingerHints[idx] || idx + 1}</span><span>${choice.label}</span>`;
      btn.addEventListener('click', () => pickDialogueChoice(choice));
      els.dialogueChoices.appendChild(btn);
      state.activeChoiceButtons.push({ btn, choice, index: idx });
    });
  } else {
    els.dialogueContinueWrap.hidden = false;
  }
}

function pickDialogueChoice(choice) {
  if (state.mode !== 'dialogue') return;
  addStats(choice.stats);

  if (choice.isPenalty) {
    showGtaBanner('WADUH!', choice.penaltyBanner || 'PILIHAN BERISIKO!', 'penalty');
  } else {
    sfx.selectChoice();
  }

  if (choice.replyText) {
    state.dialogueQueue.unshift({
      speaker: choice.replySpeaker || 'Narator',
      role: choice.replyRole || '',
      npcId: state.pendingPostDialogue?.targetId || state.pendingPostDialogue?.npcId || null,
      npcAnim: choice.replyNpcAnim || 'Agree',
      text: choice.replyText,
    });
  }
  showNextDialogueLine();
}

function showOnlyMinigameUI(kind) {
  setBodyFocusMode(`minigame_${kind}`);
  els.ambientToast.hidden = true;
  els.minigamePanel.hidden = false;
  els.pianoUi.hidden = kind !== 'piano';
  els.microscopeUi.hidden = kind !== 'microscope';
  els.basketballUi.hidden = kind !== 'basketball';
  els.penaltyUi.hidden = kind !== 'penalty';
}

// ===== MINI-GAME 1: PIANO RHYTHM 3D =====
function startPianoMinigame() {
  state.mode = 'minigame_piano';
  state.pianoHits = 0;
  state.pianoCvDwell = 0;
  pickNextPianoLane();

  world.player.position.set(-20.8, 0.06, 1.8);
  world.player.rotation.y = -Math.PI / 2;
  world.setTargetBeacon(null, false);
  world.playNpcAnim('pak_hendra_seni', 'Agree');

  showOnlyMinigameUI('piano');
  sfx.setBgmDucked(true);
  els.minigameTitle.textContent = '🎹 Piano 3D';
  els.minigameScore.textContent = '0 / 6';
  els.minigameInstruction.textContent = 'Geser tangan kiri–kanan di depan kamera ke tuts yang menyala!';
}

function pickNextPianoLane() {
  let next = Math.floor(Math.random() * 4);
  if (next === state.pianoTargetLane) next = (next + 1) % 4;
  state.pianoTargetLane = next;
  world.setPianoOrbs(true, next);
  els.pianoPads.forEach((pad, idx) => pad.classList.toggle('is-target', idx === next));
}

function hitPianoLane(laneIdx) {
  if (state.mode !== 'minigame_piano') return;
  if (laneIdx === state.pianoTargetLane) {
    sfx.pianoNote(laneIdx);
    state.pianoHits += 1;
    state.pianoCvDwell = 0;
    els.minigameScore.textContent = `${state.pianoHits} / 6`;
    world.playerAnim?.play('Interact');
    world.spawnCelebrationBurst(new THREE.Vector3(-23.0, 2.0, 0.55 + laneIdx * 0.62));
    if (state.pianoHits >= 6) {
      world.setPianoOrbs(false);
      sfx.setBgmDucked(false);
      addStats({ sosial: 15, akademik: 5 });
      els.minigamePanel.hidden = true;
      enterStage(state.stageIndex + 1);
    } else {
      pickNextPianoLane();
    }
  } else {
    sfx.pianoWrong();
  }
}

function updatePianoMinigame(dt, cvState) {
  if (!cvState || !cv.active || !cvState.handDetected) {
    els.pianoPads.forEach((p) => p.classList.remove('is-hovered'));
    return;
  }
  const lane = Math.min(3, Math.max(0, Math.floor(cvState.handX * 4)));
  els.pianoPads.forEach((p, idx) => p.classList.toggle('is-hovered', idx === lane));
  if (lane === state.pianoTargetLane) {
    state.pianoCvDwell += dt;
    if (state.pianoCvDwell >= 0.36) hitPianoLane(lane);
  } else {
    state.pianoCvDwell = 0;
  }
}

// ===== MINI-GAME 2: MICROSCOPE CV =====
function startMicroscopeMinigame() {
  state.mode = 'minigame_microscope';
  state.microscopeFocus = 14;
  state.microscopeLock = 0;
  state.focusDir = 0;

  world.setTargetBeacon(null, false);
  world.setMicroscopeBeam(true, 0);
  world.playNpcAnim('dinda', 'Interact');

  showOnlyMinigameUI('microscope');
  els.minigameTitle.textContent = '🔬 Fokus Mikroskop';
  els.minigameScore.textContent = '0%';
  els.minigameInstruction.textContent = 'Naik-turunkan tangan di depan kamera agar jarum stabil di Zona Hijau!';
}

function updateMicroscopeMinigame(dt, cvState) {
  if (cvState && cvState.handDetected) {
    const target = Math.max(4, Math.min(96, (1 - cvState.handY) * 100));
    state.microscopeFocus += (target - state.microscopeFocus) * Math.min(1, dt * 8);
  } else {
    let dir = state.focusDir;
    if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) dir += 1;
    if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) dir -= 1;
    state.microscopeFocus = Math.max(4, Math.min(96, state.microscopeFocus + dir * dt * 52));
  }

  const inZone = state.microscopeFocus >= 38 && state.microscopeFocus <= 62;
  const quality = Math.max(0, 1 - (Math.abs(state.microscopeFocus - 50) / 50) * 1.9);
  state.microscopeLock = inZone
    ? Math.min(100, state.microscopeLock + dt * 38)
    : Math.max(0, state.microscopeLock - dt * 14);

  els.focusNeedle.style.left = `${state.microscopeFocus.toFixed(1)}%`;
  els.focusLockProgress.value = Math.round(state.microscopeLock);
  els.minigameScore.textContent = `${Math.round(state.microscopeLock)}%`;
  world.setMicroscopeBeam(true, quality);

  if (state.microscopeLock >= 100) {
    world.setMicroscopeBeam(false, 1);
    world.spawnCelebrationBurst(world.microscope.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
    sfx.pickup();
    addStats({ akademik: 15 });
    els.minigamePanel.hidden = true;
    enterStage(state.stageIndex + 1);
  }
}

// ===== MINI-GAME 3: 3D BASKETBALL (UNOBSTRUCTED VIEW!) =====
function startBasketballMinigame() {
  state.mode = 'minigame_basketball';
  state.basketGoals = 0;
  state.basketCharging = false;
  state.basketPower = 0;
  state.basketPowerDir = 1;
  state.basketShotInFlight = false;
  state.basketLastCvFist = false;

  world.player.position.set(17.2, 0.06, 12.0);
  world.player.rotation.y = Math.PI / 2;
  world.playerAnim?.play('Idle');
  world.setTargetBeacon(null, false);
  if (world.basketball) world.basketball.position.set(17.65, 1.15, 12.0);

  showOnlyMinigameUI('basketball');
  els.minigameTitle.textContent = '🏀 Basket Senja 3D';
  els.minigameScore.textContent = '0 / 2 Gol';
  els.minigameInstruction.textContent = 'Kepalkan tangan ✊ isi tenaga ke Zona Emas lalu buka telapak 🖐️ untuk melempar!';
}

function releaseBasketballShot() {
  if (!state.basketCharging || state.basketShotInFlight) return;
  state.basketCharging = false;
  state.basketShotInFlight = true;
  const powerNorm = state.basketPower / 100;
  world.playerAnim?.play('Interact');

  world.launchBasketballShot(powerNorm, (scored) => {
    state.basketShotInFlight = false;
    state.basketPower = 0;
    els.shotPowerProgress.value = 0;

    if (scored) {
      state.basketGoals += 1;
      sfx.basketSwish();
      world.playNpcAnim('dimas', 'Agree');
      els.minigameScore.textContent = `${state.basketGoals} / 2 Gol`;
      els.minigameInstruction.textContent =
        state.basketGoals >= 2 ? 'SWISH!! Dua gol masuk!' : 'MASUK! Cetak 1 gol lagi!';
      if (state.basketGoals >= 2) {
        addStats({ olahraga: 20, sosial: 10 });
        setTimeout(() => {
          els.minigamePanel.hidden = true;
          enterStage(state.stageIndex + 1);
        }, 850);
      }
    } else {
      sfx.basketMiss();
      els.minigameInstruction.textContent =
        powerNorm < 0.56 ? 'Kurang kuat! Lepas di Zona Emas.' : 'Terlalu kuat! Lepas di Zona Emas.';
    }
  });
}

function updateBasketballMinigame(dt, cvState) {
  if (state.basketShotInFlight) return;
  if (world.basketball && world.player) {
    world.basketball.position.set(
      world.player.position.x + 0.45,
      1.12 + (state.basketCharging ? Math.sin(performance.now() * 0.02) * 0.04 : 0),
      world.player.position.z
    );
  }
  if (cvState && cvState.handDetected) {
    if (cvState.gesture === 'FIST') {
      state.basketCharging = true;
      state.basketLastCvFist = true;
    } else if (state.basketLastCvFist && state.basketCharging && cvState.gesture === 'OPEN_PALM') {
      state.basketLastCvFist = false;
      releaseBasketballShot();
      return;
    }
  }
  if (state.basketCharging) {
    state.basketPower += state.basketPowerDir * dt * 88;
    if (state.basketPower >= 100) { state.basketPower = 100; state.basketPowerDir = -1; }
    else if (state.basketPower <= 0) { state.basketPower = 0; state.basketPowerDir = 1; }
    els.shotPowerProgress.value = Math.round(state.basketPower);
  }
}

// ===== MINI-GAME 4: SOCCER PENALTY KICK (REAL 3D HUMAN GOALKEEPER!) =====
function startPenaltyMinigame() {
  state.mode = 'minigame_penalty';
  state.penaltyGoals = 0;
  state.penaltyAimLane = 1;
  state.penaltyKickInFlight = false;
  state.penaltyCvKickCooldown = 0.6;

  world.player.position.set(-17.4, 0.06, 16.0);
  world.player.rotation.y = -Math.PI / 2;
  world.playerAnim?.play('Idle');
  world.setTargetBeacon(null, false);
  if (world.soccerBall) world.soccerBall.position.set(-18.2, 0.23, 16.0);
  world.setPenaltyGoalie(true, 16.0);

  showOnlyMinigameUI('penalty');
  els.minigameTitle.textContent = '⚽ Penalti 3D';
  els.minigameScore.textContent = '0 / 2 Gol';
  els.minigameInstruction.textContent = 'Geser tangan ke sisi kosong gawang, lalu Kepal ✊ atau Cubit 🤏 untuk menendang!';
  updatePenaltyLaneUI(-1);
}

function updatePenaltyLaneUI(goalieLaneIdx) {
  els.penaltyLaneBtns.forEach((btn, idx) => {
    btn.classList.toggle('is-selected', idx === state.penaltyAimLane);
    btn.classList.toggle('has-goalie', idx === goalieLaneIdx);
  });
}

function kickPenaltyBall() {
  if (state.mode !== 'minigame_penalty' || state.penaltyKickInFlight) return;
  state.penaltyKickInFlight = true;
  sfx.soccerKick();
  world.playerAnim?.play('Run');

  world.launchPenaltyKick(state.penaltyAimLane, state.penaltyGoalieZ, (scored) => {
    state.penaltyKickInFlight = false;
    state.penaltyCvKickCooldown = 0.7;
    if (world.soccerBall) world.soccerBall.position.set(-18.2, 0.23, 16.0);

    if (scored) {
      state.penaltyGoals += 1;
      sfx.soccerGoal();
      els.minigameScore.textContent = `${state.penaltyGoals} / 2 Gol`;
      els.minigameInstruction.textContent =
        state.penaltyGoals >= 2 ? 'GOOOOL!! Dua penalti masuk!' : 'GOOOL! Cetak 1 gol lagi!';
      if (state.penaltyGoals >= 2) {
        world.setPenaltyGoalie(false, 16.0);
        addStats({ olahraga: 20, sosial: 5 });
        setTimeout(() => {
          els.minigamePanel.hidden = true;
          enterStage(state.stageIndex + 1);
        }, 850);
      }
    } else {
      sfx.basketMiss();
      els.minigameInstruction.textContent = 'Ditepis kiper! Bidik sudut yang kosong lalu tendang lagi!';
    }
  });
}

function updatePenaltyMinigame(dt, elapsedSec, cvState) {
  state.penaltyGoalieZ = 16.0 + Math.sin(elapsedSec * 2.05) * 1.65;
  world.setPenaltyGoalie(true, state.penaltyGoalieZ);
  const goalieLane = state.penaltyGoalieZ > 16.65 ? 0 : state.penaltyGoalieZ < 15.35 ? 2 : 1;

  if (cvState && cv.active && cvState.handDetected) {
    state.penaltyAimLane = cvState.handX < 0.36 ? 0 : cvState.handX > 0.64 ? 2 : 1;
    if (state.penaltyCvKickCooldown > 0) state.penaltyCvKickCooldown -= dt;
    else if ((cvState.gesture === 'FIST' || cvState.gesture === 'PINCH') && !state.penaltyKickInFlight) kickPenaltyBall();
  }
  updatePenaltyLaneUI(goalieLane);
}

// ===== EASTER EGGS & AMBIENT LANDMARK REMARKS =====
function unlockEasterEgg(id, title, stats, toastText) {
  if (state.foundEasterEggs.has(id)) return;
  state.foundEasterEggs.add(id);
  addStats(stats);
  world?.spawnCelebrationBurst(world.player.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
  showGtaBanner('EASTER EGG FOUND!', `${title} (${state.foundEasterEggs.size}/3)`, 'easter');
  showAmbientRemark(toastText);
  if (els.helpEeCount) els.helpEeCount.textContent = `${state.foundEasterEggs.size} / 3`;
}

function checkAmbientAndEasterEggs(elapsedSec) {
  if (!world?.player || (state.mode !== 'explore' && state.mode !== 'freeroam')) return;
  const px = world.player.position.x;
  const pz = world.player.position.z;

  // 1) Check Physical Easter Eggs
  for (const ee of PHYSICAL_EASTER_EGGS) {
    if (state.foundEasterEggs.has(ee.id)) continue;
    const d = Math.hypot(px - ee.pos.x, pz - ee.pos.z);
    if (d <= ee.radius) {
      unlockEasterEgg(ee.id, ee.title, ee.stats, ee.text);
      return;
    }
  }

  // 2) Check Non-Blocking Ambient Landmark Remarks (cooldown 35s per landmark)
  for (const spot of AMBIENT_FLAVOR_SPOTS) {
    const lastTime = state.seenAmbientCooldowns.get(spot.id) || -999;
    if (elapsedSec - lastTime < 35) continue;
    const d = Math.hypot(px - spot.x, pz - spot.z);
    if (d <= spot.radius) {
      state.seenAmbientCooldowns.set(spot.id, elapsedSec);
      const line = spot.lines[Math.floor(Math.random() * spot.lines.length)];
      showAmbientRemark(line);
      break;
    }
  }
}

// ===== ALTERNATIVE ENDINGS =====
function loadUnlockedEndings() {
  try {
    const raw = localStorage.getItem(ENDINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveUnlockedEnding(endingId) {
  const set = loadUnlockedEndings();
  set.add(endingId);
  try { localStorage.setItem(ENDINGS_STORAGE_KEY, JSON.stringify([...set])); } catch { /* ignore */ }
  return set;
}

function showEndingReport() {
  state.mode = 'freeroam';
  setBodyFocusMode('freeroam');
  world.setTargetBeacon(null, false);
  world.playerAnim?.play('Dance');
  for (const [id] of world.npcs) world.playNpcAnim(id, 'Agree');
  sfx.victoryFanfare();
  world.spawnCelebrationBurst(world.player.position.clone().add(new THREE.Vector3(0, 1.8, 0)));

  const ending = computeEnding(state.stats, state.completedSides.size, state.foundEasterEggs.size);
  const unlocked = saveUnlockedEnding(ending.id);

  els.endingCode.textContent = `MISSION PASSED · ${ending.code}`;
  els.endingBadge.textContent = ending.badge;
  els.endingBadge.style.borderColor = ending.themeColor;
  els.endingSummary.textContent = ending.summary;
  els.finalAkademik.textContent = String(state.stats.akademik);
  els.finalSosial.textContent = String(state.stats.sosial);
  els.finalOlahraga.textContent = String(state.stats.olahraga);

  els.endingCollectionTitle.textContent = `Alternative Ending (${unlocked.size} / 4) · Easter Egg (${state.foundEasterEggs.size} / 3):`;
  els.endingChips.innerHTML = ALL_ENDING_META.map((m) => {
    const has = unlocked.has(m.id);
    return `<span class="ending-chip ${has ? 'is-unlocked' : ''}">${has ? '✓ ' : '🔒 '}${m.label}</span>`;
  }).join('');

  if (!els.endingDialog.open) els.endingDialog.showModal();
}

function resetStoryGame() {
  state.stats = { akademik: 10, sosial: 10, olahraga: 10 };
  state.completedSides.clear();
  state.seenAmbientCooldowns.clear();
  updateStatsUI();
  if (world.homeworkBook) world.homeworkBook.visible = true;
  if (world.lockerBackpack) world.lockerBackpack.visible = true;
  world.showAllSideMarkers();
  world.setMicroscopeBeam(false, 0);
  world.setPianoOrbs(false);
  world.setPenaltyGoalie(false, 16.0);
  world.player.position.set(0.0, 0.05, 21.4);
  world.player.rotation.y = Math.PI;
  world.playerAnim?.play('Idle');
  els.dialoguePanel.hidden = true;
  els.minigamePanel.hidden = true;
  sfx.setBgmDucked(false);
  sfx.schoolBell();
  enterStage(0);
}

// ===== CV DWELL HELPERS (100% KEYBOARD-LESS HAND-GESTURE ENGINE!) =====
function clearCvDwell() {
  state.dwellKey = null;
  state.dwellTimer = 0;
  els.cvDwellWrap.hidden = true;
  els.cvDwellBar.value = 0;
  for (const item of state.activeChoiceButtons) item.btn.classList.remove('is-cv-targeted');
  if (els.endingCvStatus) els.endingCvStatus.hidden = true;
  if (els.endingCvBar) els.endingCvBar.value = 0;
  els.btnEndingReplay?.classList.remove('is-cv-targeted');
  els.btnEndingFreeroam?.classList.remove('is-cv-targeted');
}

function processCvGestureDwell(dt, cvState) {
  if (state.cvActionCooldown > 0) {
    state.cvActionCooldown -= dt;
    clearCvDwell();
    return;
  }
  if (!cvState || !cvState.handDetected) {
    clearCvDwell();
    return;
  }

  // 1) Hands-free Ending Dialog control: 1 Jari ☝️ = Main Ulang, 2 Jari ✌️ = Jelajah Bebas
  if (els.endingDialog.open) {
    if (cvState.gesture === 'ONE' || cvState.gesture === 'TWO') {
      const action = cvState.gesture === 'ONE' ? 'replay' : 'free-roam';
      const key = `ending_${action}`;
      if (state.dwellKey !== key) { clearCvDwell(); state.dwellKey = key; }
      state.dwellTimer += dt;
      const pct = Math.min(100, Math.round((state.dwellTimer / 1.0) * 100));
      if (els.endingCvStatus) {
        els.endingCvStatus.hidden = false;
        els.endingCvLabel.textContent =
          action === 'replay' ? '☝️ 1 Jari terdeteksi: Main Ulang...' : '✌️ 2 Jari terdeteksi: Jelajah Bebas...';
        els.endingCvBar.value = pct;
      }
      els.btnEndingReplay?.classList.toggle('is-cv-targeted', action === 'replay');
      els.btnEndingFreeroam?.classList.toggle('is-cv-targeted', action === 'free-roam');
      if (state.dwellTimer >= 1.0) {
        state.cvActionCooldown = 0.85;
        clearCvDwell();
        els.endingDialog.close(action);
      }
      return;
    }
    clearCvDwell();
    return;
  }

  // 2) Hands-free Help Modal control: Pinch 🤏 closes modal
  if (els.helpDialog.open) {
    if (cvState.gesture === 'PINCH') {
      if (state.dwellKey !== 'close_modal') { clearCvDwell(); state.dwellKey = 'close_modal'; }
      state.dwellTimer += dt;
      if (state.dwellTimer >= 0.55) {
        state.cvActionCooldown = 0.7;
        clearCvDwell();
        els.helpDialog.close('close');
      }
      return;
    }
    clearCvDwell();
    return;
  }

  if (els.introDialog.open) {
    clearCvDwell();
    return;
  }

  // 3) Dialogue Quizzes: 1 / 2 / 3 Jari
  if (state.mode === 'dialogue' && state.activeChoiceButtons.length > 0) {
    const map = { ONE: 0, TWO: 1, THREE: 2 };
    const idx = map[cvState.gesture];
    if (idx !== undefined && state.activeChoiceButtons[idx]) {
      const targetKey = `choice_${idx}`;
      if (state.dwellKey !== targetKey) { clearCvDwell(); state.dwellKey = targetKey; }
      state.activeChoiceButtons[idx].btn.classList.add('is-cv-targeted');
      state.dwellTimer += dt;
      els.cvDwellWrap.hidden = false;
      els.cvDwellLabel.textContent = `Opsi ${idx + 1}...`;
      els.cvDwellBar.value = Math.min(100, Math.round((state.dwellTimer / 0.92) * 100));
      if (state.dwellTimer >= 0.92) {
        state.cvActionCooldown = 0.7;
        const chosen = state.activeChoiceButtons[idx].choice;
        clearCvDwell();
        pickDialogueChoice(chosen);
      }
      return;
    }
    clearCvDwell();
    return;
  }

  // 4) Dialogue Next Line: Pinch 🤏
  if (state.mode === 'dialogue' && state.activeChoiceButtons.length === 0 && cvState.gesture === 'PINCH') {
    if (state.dwellKey !== 'next_dialogue') { state.dwellKey = 'next_dialogue'; state.dwellTimer = 0; }
    state.dwellTimer += dt;
    els.cvDwellWrap.hidden = false;
    els.cvDwellLabel.textContent = 'Lanjut...';
    els.cvDwellBar.value = Math.min(100, Math.round((state.dwellTimer / 0.46) * 100));
    if (state.dwellTimer >= 0.46) {
      state.cvActionCooldown = 0.55;
      clearCvDwell();
      showNextDialogueLine();
    }
    return;
  }

  // 5) Explore / Freeroam Hands-Free Actions: Main Mission Pinch, Side-Quest Pinch, Uniform Fist, Secret Peace ✌️
  if (state.mode === 'explore' || state.mode === 'freeroam') {
    if (state.mode === 'explore' && state.inTargetRange && cvState.gesture === 'PINCH') {
      if (state.dwellKey !== 'interact') { state.dwellKey = 'interact'; state.dwellTimer = 0; }
      state.dwellTimer += dt;
      els.cvDwellWrap.hidden = false;
      els.cvDwellLabel.textContent = 'Interaksi...';
      els.cvDwellBar.value = Math.min(100, Math.round((state.dwellTimer / 0.42) * 100));
      if (state.dwellTimer >= 0.42) {
        state.cvActionCooldown = 0.75;
        clearCvDwell();
        triggerCurrentStageInteraction();
      }
      return;
    }

    if (state.nearbySide && cvState.gesture === 'PINCH') {
      if (state.dwellKey !== 'side_interact') { state.dwellKey = 'side_interact'; state.dwellTimer = 0; }
      state.dwellTimer += dt;
      els.cvDwellWrap.hidden = false;
      els.cvDwellLabel.textContent = 'Side-Quest...';
      els.cvDwellBar.value = Math.min(100, Math.round((state.dwellTimer / 0.45) * 100));
      if (state.dwellTimer >= 0.45) {
        state.cvActionCooldown = 0.75;
        clearCvDwell();
        triggerSideInteraction(state.nearbySide);
      }
      return;
    }

    // Hold Peace ✌️ (2 Jari) for 2.0s during exploration to trigger Keyboard-Less Easter Egg #3!
    if (cvState.gesture === 'TWO') {
      if (state.dwellKey !== 'peace_secret') { state.dwellKey = 'peace_secret'; state.dwellTimer = 0; }
      state.dwellTimer += dt;
      els.cvDwellWrap.hidden = false;
      els.cvDwellLabel.textContent = '✌️ Rahasia...';
      els.cvDwellBar.value = Math.min(100, Math.round((state.dwellTimer / 2.0) * 100));
      if (state.dwellTimer >= 2.0) {
        state.cvActionCooldown = 1.4;
        clearCvDwell();
        if (!state.foundEasterEggs.has('ee_cheat_hesoyam')) {
          unlockEasterEgg(
            'ee_cheat_hesoyam',
            'EASTER EGG #3 · SALAM DUA JARI SAN SIDOARJO!',
            { akademik: 25, sosial: 25, olahraga: 25 },
            '✌️ SALAM DUA JARI RAHASIA AKTIF! Kamu membongkar kode rahasia San Sidoarjo tanpa keyboard!'
          );
        } else {
          world?.spawnCelebrationBurst(world.player.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
          showGtaBanner('SALAM DUA JARI!', 'SEMANGAT SAN SIDOARJO!', 'easter');
        }
      }
      return;
    }
  }

  clearCvDwell();
}

// ===== MAIN UPDATE & RENDER LOOP =====
const clock = new THREE.Clock();
const desiredCamPos = new THREE.Vector3();
const desiredLookAt = new THREE.Vector3();

function gameLoop(nowMs) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min(0.05, clock.getDelta());
  const elapsed = clock.elapsedTime;

  const cvState = cv ? cv.update(nowMs) : null;
  if (cvState && cv.active) {
    els.cvGestureLabel.textContent = cvState.gestureLabel;
    const speedMag = Math.hypot(cvState.moveX, cvState.moveY);
    if (speedMag > 0.12) {
      const h = cvState.moveX > 0.25 ? 'Kanan' : cvState.moveX < -0.25 ? 'Kiri' : '';
      const v = cvState.moveY < -0.25 ? 'Maju' : cvState.moveY > 0.25 ? 'Mundur' : '';
      els.cvVectorReadout.textContent = `${v} ${h}`.trim() || 'Gerak';
    } else {
      els.cvVectorReadout.textContent = 'Diam';
    }
  }

  if (state.keys.has('KeyQ')) state.camYaw -= dt * 1.4;
  if (state.keys.has('KeyR')) state.camYaw += dt * 1.4;
  if (state.keys.has('KeyZ')) state.camZoom = Math.max(8.5, state.camZoom - dt * 11);
  if (state.keys.has('KeyX')) state.camZoom = Math.min(28, state.camZoom + dt * 11);

  if ((state.mode === 'explore' || state.mode === 'freeroam') && world?.player) {
    let inX = 0;
    let inZ = 0;
    if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) inX -= 1;
    if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) inX += 1;
    if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) inZ -= 1;
    if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) inZ += 1;

    if (cvState && cv.active && cvState.handDetected && Math.hypot(cvState.moveX, cvState.moveY) > 0.08) {
      inX += cvState.moveX;
      inZ += cvState.moveY;
    }

    const mag = Math.hypot(inX, inZ);
    if (mag > 0.08) {
      const clampedMag = Math.min(1, mag);
      const nx = inX / mag;
      const nz = inZ / mag;
      const cosY = Math.cos(state.camYaw);
      const sinY = Math.sin(state.camYaw);
      const worldDirX = nx * cosY + nz * sinY;
      const worldDirZ = -nx * sinY + nz * cosY;

      const maxSpeed = clampedMag > 0.72 ? 7.8 : 4.8;
      world.movePlayer(worldDirX * maxSpeed * clampedMag * dt, worldDirZ * maxSpeed * clampedMag * dt);

      const targetAngle = Math.atan2(worldDirX, worldDirZ);
      let diff = targetAngle - world.player.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      world.player.rotation.y += diff * Math.min(1, dt * 11);

      world.playerAnim?.play(clampedMag > 0.72 ? 'Run' : 'Walk');
    } else {
      world.playerAnim?.play('Idle');
    }

    const stage = currentStage();
    if (state.mode === 'explore' && stage?.targetPos) {
      const dist = Math.hypot(world.player.position.x - stage.targetPos.x, world.player.position.z - stage.targetPos.z);
      els.distanceHint.textContent = `Jarak: ${dist.toFixed(1)} m`;
      state.inTargetRange = dist <= (stage.interactRadius || 2.8);
      els.btnInteract.hidden = !state.inTargetRange;
    }

    let foundSide = null;
    for (const s of SIDE_INTERACTIONS) {
      if (state.completedSides.has(s.id)) continue;
      if (Math.hypot(world.player.position.x - s.pos.x, world.player.position.z - s.pos.z) <= s.radius) {
        foundSide = s;
        break;
      }
    }
    state.nearbySide = foundSide;
    if (foundSide) {
      els.btnSideInteract.hidden = false;
      els.btnSideInteract.textContent = `★ ${foundSide.label} (Cubit 🤏)`;
    } else {
      els.btnSideInteract.hidden = true;
    }

    checkAmbientAndEasterEggs(elapsed);
  } else if (state.mode === 'minigame_piano') {
    updatePianoMinigame(dt, cvState);
  } else if (state.mode === 'minigame_microscope') {
    updateMicroscopeMinigame(dt, cvState);
  } else if (state.mode === 'minigame_basketball') {
    updateBasketballMinigame(dt, cvState);
  } else if (state.mode === 'minigame_penalty') {
    updatePenaltyMinigame(dt, elapsed, cvState);
  } else if (state.mode === 'dialogue') {
    world?.playerAnim?.play('Idle');
  }

  processCvGestureDwell(dt, cvState);

  // Clean Unobstructed Camera Framing for Exploration & All 4 Mini-Games!
  if (world?.player) {
    if (state.mode === 'minigame_piano') {
      desiredCamPos.set(-16.2, 4.1, 4.4);
      desiredLookAt.set(-22.8, 1.45, 1.5);
    } else if (state.mode === 'minigame_basketball') {
      desiredCamPos.set(13.2, 4.6, 18.8);
      desiredLookAt.set(21.2, 2.25, 12.0);
    } else if (state.mode === 'minigame_microscope') {
      desiredCamPos.set(17.5, 4.0, -7.6);
      desiredLookAt.set(17.5, 1.35, -13.6);
    } else if (state.mode === 'minigame_penalty') {
      desiredCamPos.set(-11.8, 4.2, 18.8);
      desiredLookAt.set(-22.5, 1.2, 16.0);
    } else {
      const px = world.player.position.x;
      const pz = world.player.position.z;
      const dist = state.camZoom;
      const height = state.camZoom * 0.78;
      desiredCamPos.set(px + Math.sin(state.camYaw) * dist, height, pz + Math.cos(state.camYaw) * dist);
      desiredLookAt.set(px, 1.4, pz - 1.5);
    }
    world.camera.position.lerp(desiredCamPos, Math.min(1, dt * 5.2));
    world.camera.lookAt(desiredLookAt);
  }

  world.update(dt, elapsed);
  world.render();
  if (state.radarVisible && !document.body.classList.contains('in-minigame')) {
    drawMinimap(elapsed);
  }
}

// ===== COMPACT GTA RADAR =====
const minimapCtx = els.minimapCanvas?.getContext('2d') || null;
const NPC_RADAR_LETTERS = { pak_budi: 'B', ibu_sari: 'S', dinda: 'D', dimas: 'M', pak_hendra_seni: 'H' };

function drawMinimap(elapsedSec) {
  if (!minimapCtx || !world?.player) return;
  const w = els.minimapCanvas.width;
  const h = els.minimapCanvas.height;
  const pad = 7;
  const spanX = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX;
  const spanZ = WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ;
  const toMx = (wx) => pad + ((wx - WORLD_BOUNDS.minX) / spanX) * (w - pad * 2);
  const toMy = (wz) => pad + ((wz - WORLD_BOUNDS.minZ) / spanZ) * (h - pad * 2);

  minimapCtx.fillStyle = '#0e1b18';
  minimapCtx.fillRect(0, 0, w, h);

  for (const z of MAP_ZONES) {
    const x1 = toMx(z.x);
    const y1 = toMy(z.z);
    const rw = (z.w / spanX) * (w - pad * 2);
    const rh = (z.h / spanZ) * (h - pad * 2);
    minimapCtx.fillStyle = z.color;
    minimapCtx.globalAlpha = 0.24;
    minimapCtx.fillRect(x1, y1, rw, rh);
    minimapCtx.globalAlpha = 0.78;
    minimapCtx.strokeStyle = z.color;
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(x1, y1, rw, rh);
    minimapCtx.fillStyle = '#e2e8f0';
    minimapCtx.font = '700 7px system-ui, sans-serif';
    minimapCtx.textAlign = 'center';
    minimapCtx.fillText(z.label, x1 + rw * 0.5, y1 + rh * 0.5 + 2.5);
  }
  minimapCtx.globalAlpha = 1;

  for (const [id, npc] of world.npcs) {
    const letter = NPC_RADAR_LETTERS[id];
    if (!letter) continue;
    const nx = toMx(npc.mesh.position.x);
    const ny = toMy(npc.mesh.position.z);
    minimapCtx.fillStyle = '#0f172a';
    minimapCtx.beginPath();
    minimapCtx.arc(nx, ny, 4.8, 0, Math.PI * 2);
    minimapCtx.fill();
    minimapCtx.strokeStyle = '#fbbf24';
    minimapCtx.lineWidth = 1.1;
    minimapCtx.stroke();
    minimapCtx.fillStyle = '#fde68a';
    minimapCtx.font = '800 6.5px system-ui, sans-serif';
    minimapCtx.textAlign = 'center';
    minimapCtx.fillText(letter, nx, ny + 2.2);
  }

  for (const s of SIDE_INTERACTIONS) {
    if (state.completedSides.has(s.id)) continue;
    const sx = toMx(s.pos.x);
    const sy = toMy(s.pos.z);
    minimapCtx.fillStyle = '#38bdf8';
    minimapCtx.beginPath();
    minimapCtx.moveTo(sx, sy - 3.6);
    minimapCtx.lineTo(sx + 3.6, sy);
    minimapCtx.lineTo(sx, sy + 3.6);
    minimapCtx.lineTo(sx - 3.6, sy);
    minimapCtx.closePath();
    minimapCtx.fill();
  }

  const stage = currentStage();
  if (state.mode === 'explore' && stage?.targetPos) {
    const tx = toMx(stage.targetPos.x);
    const ty = toMy(stage.targetPos.z);
    const pulse = 4 + Math.sin(elapsedSec * 5) * 2;
    minimapCtx.strokeStyle = 'rgba(253, 224, 71, 0.9)';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.beginPath();
    minimapCtx.arc(tx, ty, pulse, 0, Math.PI * 2);
    minimapCtx.stroke();
    minimapCtx.fillStyle = '#ef4444';
    minimapCtx.beginPath();
    minimapCtx.arc(tx, ty, 3, 0, Math.PI * 2);
    minimapCtx.fill();
  }

  const px = toMx(world.player.position.x);
  const py = toMy(world.player.position.z);
  minimapCtx.save();
  minimapCtx.translate(px, py);
  minimapCtx.rotate(-world.player.rotation.y + Math.PI);
  minimapCtx.fillStyle = '#22c55e';
  minimapCtx.strokeStyle = '#ffffff';
  minimapCtx.lineWidth = 1.1;
  minimapCtx.beginPath();
  minimapCtx.moveTo(0, -5);
  minimapCtx.lineTo(3.6, 3.8);
  minimapCtx.lineTo(-3.6, 3.8);
  minimapCtx.closePath();
  minimapCtx.fill();
  minimapCtx.stroke();
  minimapCtx.restore();
}

// ===== EVENT BINDINGS =====
function bindUIEvents() {
  window.addEventListener('resize', () => world?.resize());

  els.canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      state.camZoom = Math.max(8.5, Math.min(28, state.camZoom + Math.sign(e.deltaY) * 1.8));
    },
    { passive: false }
  );
  els.btnZoomIn?.addEventListener('click', () => { state.camZoom = Math.max(8.5, state.camZoom - 2.5); });
  els.btnZoomOut?.addEventListener('click', () => { state.camZoom = Math.min(28, state.camZoom + 2.5); });

  window.addEventListener('keydown', (e) => {
    if (els.introDialog.open || els.helpDialog.open || els.endingDialog.open) return;
    state.keys.add(e.code);

    // Classic GTA Cheat Code Easter Egg Listener ("HESOYAM" or "SKOMDA")!
    if (/^[a-zA-Z]$/.test(e.key)) {
      state.cheatBuffer = (state.cheatBuffer + e.key.toUpperCase()).slice(-10);
      if (state.cheatBuffer.endsWith('HESOYAM') || state.cheatBuffer.endsWith('SKOMDA')) {
        state.cheatBuffer = '';
        if (!state.foundEasterEggs.has('ee_cheat_hesoyam')) {
          unlockEasterEgg(
            'ee_cheat_hesoyam',
            'CHEAT ACTIVATED · HESOYAM!',
            { akademik: 25, sosial: 25, olahraga: 25 },
            'CHEAT KLASIK GTA AKTIF! +25 Akademik, +25 Sosial, +25 Olahraga & Kembang Api Emas!'
          );
        } else {
          addStats({ akademik: 5, sosial: 5, olahraga: 5 });
          world?.spawnCelebrationBurst(world.player.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
          showGtaBanner('CHEAT ACTIVATED!', '+5 ALL STATS · SAN SIDOARJO', 'easter');
        }
      }
    }

    if ((state.mode === 'explore' || state.mode === 'freeroam') && e.code === 'KeyF' && state.nearbySide) {
      e.preventDefault();
      triggerSideInteraction(state.nearbySide);
      return;
    }

    if (state.mode === 'explore' && (e.code === 'KeyE' || e.code === 'Space')) {
      if (state.inTargetRange) { e.preventDefault(); triggerCurrentStageInteraction(); }
    } else if (state.mode === 'dialogue') {
      if (state.activeChoiceButtons.length > 0) {
        if (e.key === '1' && state.activeChoiceButtons[0]) pickDialogueChoice(state.activeChoiceButtons[0].choice);
        if (e.key === '2' && state.activeChoiceButtons[1]) pickDialogueChoice(state.activeChoiceButtons[1].choice);
        if (e.key === '3' && state.activeChoiceButtons[2]) pickDialogueChoice(state.activeChoiceButtons[2].choice);
      } else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        showNextDialogueLine();
      }
    } else if (state.mode === 'minigame_piano') {
      if (['1', '2', '3', '4'].includes(e.key)) hitPianoLane(Number(e.key) - 1);
    } else if (state.mode === 'minigame_basketball' && e.code === 'Space') {
      e.preventDefault();
      if (!state.basketShotInFlight) state.basketCharging = true;
    } else if (state.mode === 'minigame_penalty') {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.penaltyAimLane = 0;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') state.penaltyAimLane = 1;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') state.penaltyAimLane = 2;
      if (e.code === 'Space') { e.preventDefault(); kickPenaltyBall(); }
    }
  });

  window.addEventListener('keyup', (e) => {
    state.keys.delete(e.code);
    if (state.mode === 'minigame_basketball' && e.code === 'Space') releaseBasketballShot();
  });

  els.btnInteract.addEventListener('click', triggerCurrentStageInteraction);
  els.btnSideInteract.addEventListener('click', () => triggerSideInteraction(state.nearbySide));
  els.btnDialogueNext.addEventListener('click', showNextDialogueLine);

  els.pianoPads.forEach((pad) => pad.addEventListener('click', () => hitPianoLane(Number(pad.dataset.lane))));
  els.penaltyLaneBtns.forEach((btn) => btn.addEventListener('click', () => { state.penaltyAimLane = Number(btn.dataset.penaltyLane); }));
  els.btnPenaltyKick.addEventListener('click', kickPenaltyBall);

  const bindHold = (btn, dir) => {
    btn.addEventListener('pointerdown', () => { state.focusDir = dir; });
    btn.addEventListener('pointerup', () => { state.focusDir = 0; });
    btn.addEventListener('pointerleave', () => { state.focusDir = 0; });
  };
  bindHold(els.btnFocusUp, 1);
  bindHold(els.btnFocusDown, -1);

  els.btnShootCharge.addEventListener('pointerdown', () => { if (!state.basketShotInFlight) state.basketCharging = true; });
  els.btnShootCharge.addEventListener('pointerup', releaseBasketballShot);
  els.btnShootCharge.addEventListener('pointerleave', () => { if (state.basketCharging) releaseBasketballShot(); });

  // Radar & CV Dock Collapse Toggles (Keeps Screen Ultra-Clean!)
  els.btnToggleRadar.addEventListener('click', () => {
    state.radarVisible = !state.radarVisible;
    els.minimapPanel.hidden = !state.radarVisible;
    els.btnToggleRadar.setAttribute('aria-pressed', String(state.radarVisible));
  });

  els.btnCollapseCv.addEventListener('click', () => {
    const collapsed = !els.cvBody.hidden;
    els.cvBody.hidden = collapsed;
    els.cvDock.classList.toggle('is-collapsed', collapsed);
    els.btnCollapseCv.setAttribute('aria-expanded', String(!collapsed));
    els.btnCollapseCv.textContent = collapsed ? '▸' : '▾';
  });

  els.btnLowGpu.addEventListener('click', () => {
    const next = !world?.lowGpuMode;
    world?.setLowGpuMode(next);
    els.btnLowGpu.setAttribute('aria-pressed', String(next));
    els.btnLowGpu.textContent = next ? '⚡ GPU: Hemat' : '⚡ GPU';
  });

  els.btnToggleCv.addEventListener('click', async () => {
    if (cv.active) {
      cv.stop();
      els.btnToggleCv.setAttribute('aria-pressed', 'false');
      els.btnCvLabel.textContent = 'Kamera CV';
      els.cvPlaceholder.hidden = false;
    } else {
      const ok = await cv.start();
      if (ok) {
        els.btnToggleCv.setAttribute('aria-pressed', 'true');
        els.btnCvLabel.textContent = 'CV Aktif';
        els.cvPlaceholder.hidden = true;
      } else {
        els.cvPlaceholder.hidden = false;
        announce('Kamera tidak tersedia. Gunakan keyboard WASD.');
      }
    }
  });

  els.btnToggleBgm.addEventListener('click', () => {
    const next = !sfx.bgmEnabled;
    sfx.setBgmEnabled(next);
    els.btnToggleBgm.setAttribute('aria-pressed', String(next));
    els.btnToggleBgm.textContent = next ? '🎵' : '🎵✕';
  });

  els.btnToggleAudio.addEventListener('click', () => {
    const next = !sfx.enabled;
    sfx.setEnabled(next);
    els.btnToggleAudio.setAttribute('aria-pressed', String(next));
    els.btnToggleAudio.textContent = next ? '🔊' : '🔇';
  });

  els.btnOpenHelp.addEventListener('click', () => {
    if (els.helpEeCount) els.helpEeCount.textContent = `${state.foundEasterEggs.size} / 3`;
    if (!els.helpDialog.open) els.helpDialog.showModal();
  });
  els.helpDialog.addEventListener('close', () => { els.helpDialog.returnValue = ''; });

  els.introDialog.addEventListener('close', async () => {
    const action = els.introDialog.returnValue;
    els.introDialog.returnValue = '';
    sfx.schoolBell();
    sfx.startBgm();
    if (action === 'start-cv') {
      const ok = await cv.start();
      if (ok) {
        els.btnToggleCv.setAttribute('aria-pressed', 'true');
        els.btnCvLabel.textContent = 'CV Aktif';
        els.cvPlaceholder.hidden = true;
      }
    }
    enterStage(0);
  });

  els.endingDialog.addEventListener('close', () => {
    const action = els.endingDialog.returnValue;
    els.endingDialog.returnValue = '';
    if (action === 'replay') resetStoryGame();
    else enterStage(STORY_STAGES.length);
  });
}

// ===== BOOTSTRAP =====
async function init() {
  bindUIEvents();

  cv = new ComputerVisionController({
    videoEl: els.cvVideo,
    canvasEl: els.cvCanvas,
    onStatusChange: ({ mode, label }) => {
      els.cvGestureLabel.textContent = label;
      els.cvEngineBadge.className = 'cv-badge';
      if (mode === 'mediapipe') {
        els.cvEngineBadge.classList.add('cv-badge--active');
        els.cvEngineBadge.textContent = 'CV: MediaPipe';
      } else if (mode === 'motion-fallback') {
        els.cvEngineBadge.classList.add('cv-badge--fallback');
        els.cvEngineBadge.textContent = 'CV: Motion';
      } else if (mode === 'loading') {
        els.cvEngineBadge.classList.add('cv-badge--fallback');
        els.cvEngineBadge.textContent = 'CV: Memuat...';
      } else {
        els.cvEngineBadge.classList.add('cv-badge--idle');
        els.cvEngineBadge.textContent = 'CV: Siap';
      }
    },
  });

  const summary = await preloadPolyforkAssets((done, total, label) => {
    const pct = Math.round((done / total) * 100);
    els.loadingProgress.value = pct;
    els.loadingCount.textContent = `${pct}% (${done}/${total} modul Polyfork)`;
    els.loadingStatus.textContent = `Memuat kampus San Sidoarjo: ${label}`;
  });

  els.loadingStatus.textContent = `Menyusun Grand Telkom Academy: San Sidoarjo (${summary.loadedCount}/${summary.total})...`;
  world = new SchoolWorld(els.canvas);
  await world.buildCampus();
  updateStatsUI();

  requestAnimationFrame(gameLoop);
  els.loadingOverlay.classList.add('is-hidden');
  els.introDialog.showModal();
}

init().catch((err) => {
  console.error('[GTA: San Sidoarjo] Fatal init error:', err);
  els.loadingStatus.textContent = 'Terjadi kendala saat memuat kampus 3D. Muat ulang halaman.';
});

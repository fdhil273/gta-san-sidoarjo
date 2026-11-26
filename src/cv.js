/**
 * Real-time Computer Vision Hand & Gesture Engine for SMA Nusantara 3D.
 * Primary: MediaPipe HandLandmarker (21-point 3D hand tracking via WebAssembly/WebGL).
 * Automatic Fallback: Lightweight Canvas Optical-Motion Centroid tracker if CDN/WASM fails.
 */

const MEDIAPIPE_BUNDLE = new URL('../vendor/mediapipe/vision_bundle.mjs', import.meta.url).href;
const MEDIAPIPE_WASM = new URL('../vendor/mediapipe/wasm', import.meta.url).href;
const HAND_MODEL_URL = new URL('../vendor/mediapipe/models/hand_landmarker.task', import.meta.url).href;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const GESTURE_LABELS_ID = {
  NONE: 'Tidak Ada Tangan',
  OPEN_PALM: 'Telapak (Jalan)',
  FIST: 'Kepal ✊',
  PINCH: 'Cubit 🤏 (Aksi)',
  ONE: '1 Jari ☝️',
  TWO: '2 Jari ✌️',
  THREE: '3 Jari 🤟',
  MOTION: 'Gerak Kamera',
};

export class ComputerVisionController {
  constructor({ videoEl, canvasEl, onStatusChange }) {
    this.video = videoEl;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    this.onStatusChange = onStatusChange;

    this.active = false;
    this.mode = 'idle'; // 'idle' | 'loading' | 'mediapipe' | 'motion-fallback' | 'error'
    this.stream = null;
    this.handLandmarker = null;
    this.lastVideoTime = -1;

    // Fallback motion buffer
    this.motionCanvas = document.createElement('canvas');
    this.motionCanvas.width = 64;
    this.motionCanvas.height = 48;
    this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
    this.prevFrame = null;

    // Public smoothed telemetry read by game loop
    this.state = {
      handDetected: false,
      moveX: 0, // -1 (left) .. +1 (right)
      moveY: 0, // -1 (up/forward) .. +1 (down/back)
      handX: 0.5,
      handY: 0.5,
      gesture: 'NONE',
      gestureLabel: 'Kamera Mati',
      fingerCount: 0,
      pinchStrength: 0,
    };

    // Gesture debounce history (5 frames)
    this.gestureHistory = [];
  }

  async start() {
    if (this.active) return true;
    this.setMode('loading', 'Meminta izin webcam...');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.video.srcObject = this.stream;
      await this.video.play();
    } catch (err) {
      console.warn('[CV] Camera permission/device error:', err);
      this.setMode('error', 'Kamera tidak tersedia');
      return false;
    }

    this.active = true;
    this.setMode('loading', 'Memuat AI Hand Tracker...');

    // Load MediaPipe HandLandmarker (GPU first, fallback to CPU, fallback to motion tracker)
    try {
      if (!this.handLandmarker) {
        const visionPkg = await import(MEDIAPIPE_BUNDLE);
        const fileset = await visionPkg.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
        try {
          this.handLandmarker = await visionPkg.HandLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch {
          this.handLandmarker = await visionPkg.HandLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }
      }
      this.setMode('mediapipe', 'Siap · Tunjukkan Tangan');
    } catch (err) {
      console.warn('[CV] MediaPipe unavailable, switching to Optical-Motion CV fallback:', err);
      this.setMode('motion-fallback', 'Mode Motion CV Aktif');
    }

    return true;
  }

  stop() {
    this.active = false;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.video.srcObject = null;
    this.prevFrame = null;
    this.gestureHistory = [];
    this.resetTelemetry('Kamera Mati');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setMode('idle', 'Kamera Mati');
  }

  setMode(mode, label) {
    this.mode = mode;
    this.state.gestureLabel = label;
    if (this.onStatusChange) {
      this.onStatusChange({ mode, label, active: this.active });
    }
  }

  resetTelemetry(label = 'Tidak Ada Tangan') {
    this.state.handDetected = false;
    this.state.moveX *= 0.65;
    this.state.moveY *= 0.65;
    if (Math.abs(this.state.moveX) < 0.02) this.state.moveX = 0;
    if (Math.abs(this.state.moveY) < 0.02) this.state.moveY = 0;
    this.state.gesture = 'NONE';
    this.state.gestureLabel = label;
    this.state.fingerCount = 0;
    this.state.pinchStrength = 0;
  }

  /**
   * Called every animation frame from main loop.
   */
  update(nowMs) {
    if (!this.active || this.video.readyState < 2) return this.state;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Draw mirrored webcam feed
    this.ctx.save();
    this.ctx.translate(w, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.video, 0, 0, w, h);
    this.ctx.restore();

    // Draw subtle HUD steering ring & deadzone guide
    this.drawSteeringGuides(w, h);

    if (this.mode === 'mediapipe' && this.handLandmarker) {
      if (this.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.video.currentTime;
        try {
          const result = this.handLandmarker.detectForVideo(this.video, nowMs);
          if (result.landmarks && result.landmarks.length > 0) {
            this.processHandLandmarks(result.landmarks[0], w, h);
          } else {
            this.gestureHistory.length = 0;
            this.resetTelemetry('Tunjukkan Tangan');
          }
        } catch (err) {
          console.warn('[CV] Detection frame warning:', err);
        }
      }
    } else if (this.mode === 'motion-fallback') {
      this.processMotionFallback(w, h);
    }

    return this.state;
  }

  processHandLandmarks(lm, w, h) {
    // Draw glowing 21-point hand skeleton (mirrored X)
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      const ax = (1 - lm[a].x) * w;
      const ay = lm[a].y * h;
      const bx = (1 - lm[b].x) * w;
      const by = lm[b].y * h;
      this.ctx.moveTo(ax, ay);
      this.ctx.lineTo(bx, by);
    }
    this.ctx.stroke();

    for (let i = 0; i < lm.length; i++) {
      const px = (1 - lm[i].x) * w;
      const py = lm[i].y * h;
      const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
      this.ctx.fillStyle = isTip ? '#fde047' : '#38bdf8';
      this.ctx.beginPath();
      this.ctx.arc(px, py, isTip ? 3.5 : 2.2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Palm center (average of wrist + MCP knuckles)
    const palmRawX = (lm[0].x + lm[5].x + lm[9].x + lm[13].x + lm[17].x) / 5;
    const palmRawY = (lm[0].y + lm[5].y + lm[9].y + lm[13].y + lm[17].y) / 5;
    const palmX = 1 - palmRawX; // mirrored 0..1
    const palmY = palmRawY;     // 0 (top) .. 1 (bottom)

    // Smooth hand coordinates
    this.state.handDetected = true;
    this.state.handX = this.state.handX * 0.6 + palmX * 0.4;
    this.state.handY = this.state.handY * 0.6 + palmY * 0.4;

    // Palm scale reference (wrist to middle MCP)
    const palmSize = Math.max(0.05, Math.hypot(lm[9].x - lm[0].x, lm[9].y - lm[0].y));

    // Distance helper
    const dist = (i, j) => Math.hypot(lm[i].x - lm[j].x, lm[i].y - lm[j].y);

    // Finger extension check (tip clearly further from wrist than PIP joint)
    const indexUp = dist(8, 0) > dist(6, 0) * 1.15;
    const middleUp = dist(12, 0) > dist(10, 0) * 1.15;
    const ringUp = dist(16, 0) > dist(14, 0) * 1.13;
    const pinkyUp = dist(20, 0) > dist(18, 0) * 1.12;
    const thumbUp = dist(4, 17) > dist(3, 17) * 1.12 && dist(4, 5) > palmSize * 0.42;

    const nonThumbCount = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;
    const fingerCount = nonThumbCount + (thumbUp ? 1 : 0);

    // Pinch ratio (thumb tip 4 to index tip 8)
    const pinchDist = dist(4, 8) / palmSize;
    const isPinch = pinchDist < 0.34;
    this.state.pinchStrength = Math.max(0, Math.min(1, (0.5 - pinchDist) / 0.25));

    // Classify raw gesture
    let rawGesture = 'OPEN_PALM';
    if (isPinch && !ringUp && !pinkyUp) {
      rawGesture = 'PINCH';
    } else if (fingerCount === 0 || (nonThumbCount === 0 && !thumbUp)) {
      rawGesture = 'FIST';
    } else if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      rawGesture = 'ONE';
    } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
      rawGesture = 'TWO';
    } else if (indexUp && middleUp && ringUp && !pinkyUp) {
      rawGesture = 'THREE';
    } else if (fingerCount >= 4) {
      rawGesture = 'OPEN_PALM';
    } else if (isPinch) {
      rawGesture = 'PINCH';
    }

    // Majority-vote smoothing over recent frames to prevent flicker
    this.gestureHistory.push(rawGesture);
    if (this.gestureHistory.length > 5) this.gestureHistory.shift();
    const stableGesture = this.mostCommon(this.gestureHistory);

    this.state.gesture = stableGesture;
    this.state.fingerCount = fingerCount;
    this.state.gestureLabel = GESTURE_LABELS_ID[stableGesture] || stableGesture;

    // Analog joystick steering when holding Open Palm
    if (stableGesture === 'OPEN_PALM') {
      const dx = this.state.handX - 0.5;
      const dy = this.state.handY - 0.52;
      const deadzone = 0.095;
      const radius = 0.28;
      const mag = Math.hypot(dx, dy);

      if (mag > deadzone) {
        const scaled = Math.min(1, (mag - deadzone) / (radius - deadzone));
        const nx = (dx / mag) * scaled;
        const ny = (dy / mag) * scaled;
        this.state.moveX = this.state.moveX * 0.55 + nx * 0.45;
        this.state.moveY = this.state.moveY * 0.55 + ny * 0.45;
      } else {
        this.state.moveX *= 0.6;
        this.state.moveY *= 0.6;
      }

      // Draw steering vector from center to palm
      this.ctx.strokeStyle = '#22c55e';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(w * 0.5, h * 0.52);
      this.ctx.lineTo(this.state.handX * w, this.state.handY * h);
      this.ctx.stroke();
    } else {
      // Stop walking when performing fist/pinch/number gesture
      this.state.moveX *= 0.5;
      this.state.moveY *= 0.5;
      if (Math.abs(this.state.moveX) < 0.02) this.state.moveX = 0;
      if (Math.abs(this.state.moveY) < 0.02) this.state.moveY = 0;
    }

    // Highlight pinch circle when pinching
    if (stableGesture === 'PINCH') {
      const cx = (1 - (lm[4].x + lm[8].x) * 0.5) * w;
      const cy = ((lm[4].y + lm[8].y) * 0.5) * h;
      this.ctx.strokeStyle = '#fde047';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  processMotionFallback(w, h) {
    const mw = this.motionCanvas.width;
    const mh = this.motionCanvas.height;
    this.motionCtx.save();
    this.motionCtx.translate(mw, 0);
    this.motionCtx.scale(-1, 1);
    this.motionCtx.drawImage(this.video, 0, 0, mw, mh);
    this.motionCtx.restore();

    const frame = this.motionCtx.getImageData(0, 0, mw, mh).data;
    if (!this.prevFrame) {
      this.prevFrame = new Uint8ClampedArray(frame);
      return;
    }

    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (let y = 0; y < mh; y++) {
      for (let x = 0; x < mw; x++) {
        const i = (y * mw + x) * 4;
        const diff =
          Math.abs(frame[i] - this.prevFrame[i]) +
          Math.abs(frame[i + 1] - this.prevFrame[i + 1]) +
          Math.abs(frame[i + 2] - this.prevFrame[i + 2]);
        if (diff > 75) {
          sumX += x / mw;
          sumY += y / mh;
          count += 1;
        }
      }
    }
    this.prevFrame.set(frame);

    if (count > 35) {
      const cx = sumX / count;
      const cy = sumY / count;
      this.state.handDetected = true;
      this.state.handX = this.state.handX * 0.65 + cx * 0.35;
      this.state.handY = this.state.handY * 0.65 + cy * 0.35;
      this.state.gesture = 'OPEN_PALM';
      this.state.gestureLabel = GESTURE_LABELS_ID.MOTION;
      this.state.fingerCount = 5;

      const dx = (this.state.handX - 0.5) * 2.4;
      const dy = (this.state.handY - 0.5) * 2.4;
      this.state.moveX = Math.max(-1, Math.min(1, dx));
      this.state.moveY = Math.max(-1, Math.min(1, dy));

      this.ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
      this.ctx.beginPath();
      this.ctx.arc(this.state.handX * w, this.state.handY * h, 9, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.resetTelemetry('Gerakkan Tangan');
    }
  }

  drawSteeringGuides(w, h) {
    const cx = w * 0.5;
    const cy = h * 0.52;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, h * 0.12, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, h * 0.36, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  mostCommon(arr) {
    const counts = new Map();
    let best = arr[arr.length - 1] || 'NONE';
    let bestCount = 0;
    for (const item of arr) {
      const c = (counts.get(item) || 0) + 1;
      counts.set(item, c);
      if (c >= bestCount) {
        bestCount = c;
        best = item;
      }
    }
    return best;
  }
}

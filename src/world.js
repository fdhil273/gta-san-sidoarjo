import * as THREE from 'three';
import { spawnAsset, attachCharacterAnimation, placeOnTopOf, applyStudentUniform } from './assets.js';

export const WORLD_BOUNDS = {
  minX: -26,
  maxX: 28,
  minZ: -20,
  maxZ: 24,
};

/**
 * Zone footprints used by both 3D layout and the live HUD Mini-Map.
 */
export const MAP_ZONES = [
  { id: 'kelas', label: 'Kelas XI', x: -24.5, z: -18.5, w: 15, h: 14, color: '#c99f6b' },
  { id: 'koridor', label: 'Koridor & Piala', x: -9.5, z: -18.5, w: 19, h: 14, color: '#e2dcc8' },
  { id: 'lab', label: 'Ruang Lab', x: 9.5, z: -18.5, w: 16.5, h: 14, color: '#93c5fd' },
  { id: 'seni', label: 'Seni & Musik', x: -24.5, z: -2.5, w: 12.5, h: 11, color: '#d8b4fe' },
  { id: 'bola', label: 'Lap. Bola', x: -25.5, z: 10.5, w: 14, h: 11, color: '#4ade80' },
  { id: 'halaman', label: 'San Sidoarjo', x: -10.5, z: -3.5, w: 21, h: 26, color: '#cbd5e1' },
  { id: 'basket', label: 'Lap. Basket', x: 12, z: 6, w: 14, h: 12, color: '#fb923c' },
];

const LIGHTING_PRESETS = {
  morning: {
    sky: new THREE.Color(0xcce6ff),
    fog: new THREE.Color(0xd9ecff),
    sunColor: new THREE.Color(0xfff6dc),
    sunIntensity: 1.65,
    sunPos: new THREE.Vector3(28, 42, 26),
    hemiSky: new THREE.Color(0xdcf0ff),
    hemiGround: new THREE.Color(0x6e8c58),
    hemiIntensity: 1.15,
    lampIntensity: 0,
  },
  midday: {
    sky: new THREE.Color(0x9bd3ff),
    fog: new THREE.Color(0xcce8ff),
    sunColor: new THREE.Color(0xffffff),
    sunIntensity: 1.85,
    sunPos: new THREE.Vector3(10, 52, 18),
    hemiSky: new THREE.Color(0xe6f4ff),
    hemiGround: new THREE.Color(0x7c8f68),
    hemiIntensity: 1.2,
    lampIntensity: 0,
  },
  sunset: {
    sky: new THREE.Color(0xf6a976),
    fog: new THREE.Color(0xf7be93),
    sunColor: new THREE.Color(0xff9c52),
    sunIntensity: 1.75,
    sunPos: new THREE.Vector3(-34, 17, 22),
    hemiSky: new THREE.Color(0xffcfa6),
    hemiGround: new THREE.Color(0x4c4057),
    hemiIntensity: 1.05,
    lampIntensity: 2.1,
  },
};

function makeZoneSignSprite(title, subtitle, accentColor = '#f59e0b') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 148;
  const ctx = c.getContext('2d');

  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 128, 24);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.font = '700 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle.toUpperCase(), 256, 54);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 42px system-ui, sans-serif';
  ctx.fillText(title, 256, 108);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.2, 1.2, 1);
  return sprite;
}

function makeBasketballCourtTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#c2653b';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#1e3a5f';
  ctx.lineWidth = 28;
  ctx.strokeRect(14, 14, 484, 484);

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 6;
  ctx.strokeRect(32, 32, 448, 448);

  // Center line & circle
  ctx.beginPath();
  ctx.moveTo(140, 32);
  ctx.lineTo(140, 480);
  ctx.stroke();

  // Paint key on right side (+X hoop side)
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(325, 176, 155, 160);
  ctx.strokeRect(325, 176, 155, 160);

  ctx.beginPath();
  ctx.arc(325, 256, 56, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(465, 256, 200, Math.PI * 0.56, Math.PI * 1.44);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSoccerFieldTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  // Striped mowed turf
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#4d9b46' : '#58ab50';
    ctx.fillRect(i * 64, 0, 64, 512);
  }

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, 464, 464);

  // Halfway line & circle
  ctx.beginPath();
  ctx.moveTo(256, 24);
  ctx.lineTo(256, 488);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(256, 256, 62, 0, Math.PI * 2);
  ctx.stroke();

  // Penalty box on west (-X) goal side
  ctx.strokeRect(24, 146, 110, 220);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBasketballTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(256, 64);
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 128);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(64, 64, 44, -0.9, 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(192, 64, 44, Math.PI - 0.9, Math.PI + 0.9);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeIndonesianFlagTexture() {
  const c = document.createElement('canvas');
  c.width = 300;
  c.height = 200; // Official 2:3 Indonesian flag proportion
  const ctx = c.getContext('2d');

  // Top half: Sang Merah (#d91b24)
  ctx.fillStyle = '#d91b24';
  ctx.fillRect(0, 0, 300, 100);

  // Bottom half: Sang Putih (#f8fafc)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 100, 300, 100);

  // Crisp subtle cloth weave & hoist band on mast edge
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 10, 200);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.fillRect(10, 0, 3, 200);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class SchoolWorld {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = LIGHTING_PRESETS.morning.sky.clone();
    this.scene.fog = new THREE.Fog(LIGHTING_PRESETS.morning.fog.clone(), 58, 155);

    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 320);
    this.camera.position.set(0, 12, 32);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Keep Polyfork vertex colors vibrant & unmuddied
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.colliders = [];
    this.animators = [];
    this.npcs = new Map();
    this.lampLights = [];

    this.currentLightingKey = 'morning';
    this.targetPreset = LIGHTING_PRESETS.morning;

    this.player = null;
    this.playerAnim = null;
    this.homeworkBook = null;
    this.lockerBackpack = null;
    this.microscope = null;
    this.microscopeBeam = null;
    this.wallClock = null;
    this.targetBeacon = null;
    this.basketball = null;
    this.soccerBall = null;
    this.penaltyGoalie = null;
    this.penaltyGoalieAnim = null;
    this.penaltyFlight = null;
    this.pianoOrbs = [];
    this.sideMarkers = new Map();
    this.goldenEasterStatue = null;
    this.indoFlag = null;
    this.hoopRimWorldPos = new THREE.Vector3(24.0, 2.85, 12.0);
    this.ballFlight = null;
    this.sparkles = [];
    this.lowGpuMode = false;

    this.setupLights();
  }

  setupLights() {
    const p = LIGHTING_PRESETS.morning;
    this.hemiLight = new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemiIntensity);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(p.sunColor, p.sunIntensity);
    this.sunLight.position.copy(p.sunPos);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 130;
    const d = 44;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);
  }

  addCollider(x, z, halfW, halfD) {
    this.colliders.push({
      minX: x - halfW,
      maxX: x + halfW,
      minZ: z - halfD,
      maxZ: z + halfD,
    });
  }

  addBoxColliderFromObject(obj, shrink = 0.08) {
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return;
    this.colliders.push({
      minX: box.min.x + shrink,
      maxX: box.max.x - shrink,
      minZ: box.min.z + shrink,
      maxZ: box.max.z - shrink,
    });
  }

  async buildCampus() {
    this.buildGroundAndArchitecture();
    this.buildClassroom();
    this.buildHallway();
    this.buildScienceLab();
    this.buildArtMusicStudio();
    this.buildSchoolyardAndGate();
    this.buildBasketballCourt();
    this.buildSoccerField();
    this.buildTargetBeacon();
    await this.buildCharacters();
  }

  buildGroundAndArchitecture() {
    // Expansive lush lawn surrounding the mega campus
    const lawn = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({ color: 0x76ad56, roughness: 0.95 })
    );
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    this.scene.add(lawn);

    // Wide asphalt avenue outside the school front gate
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(120, 0.04, 7.6),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.92 })
    );
    road.position.set(0, 0.01, 28.4);
    road.receiveShadow = true;
    this.scene.add(road);

    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let x = -52; x <= 52; x += 5.2) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 0.2), dashMat);
      dash.position.set(x, 0.015, 28.4);
      this.scene.add(dash);
    }

    // Grand paved courtyard concrete plaza covering the whole walkable campus interior
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(56, 0.06, 44),
      new THREE.MeshStandardMaterial({ color: 0xd9d4c7, roughness: 0.9 })
    );
    plaza.position.set(1.0, 0.01, 2.0);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    // Central grand ceremony walkway carpet/stone strip from front gate to main hallway
    const walkway = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.075, 27),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 })
    );
    walkway.position.set(0, 0.02, 10.5);
    walkway.receiveShadow = true;
    this.scene.add(walkway);

    // === BUILDING WINGS FLOORS ===
    // 1. Classroom XI-A warm wood floor (West-North wing: x -24.5..-9.5, z -18.5..-4.5)
    const classFloor = new THREE.Mesh(
      new THREE.BoxGeometry(15.2, 0.08, 14.2),
      new THREE.MeshStandardMaterial({ color: 0xc99f6b, roughness: 0.85 })
    );
    classFloor.position.set(-17.0, 0.03, -11.5);
    classFloor.receiveShadow = true;
    this.scene.add(classFloor);

    // 2. Main Hallway terrazzo floor (Center-North wing: x -9.5..+9.5, z -18.5..-4.5)
    const hallFloor = new THREE.Mesh(
      new THREE.BoxGeometry(19.0, 0.08, 14.2),
      new THREE.MeshStandardMaterial({ color: 0xe7e2d3, roughness: 0.85 })
    );
    hallFloor.position.set(0.0, 0.03, -11.5);
    hallFloor.receiveShadow = true;
    this.scene.add(hallFloor);

    // 3. Science & Computer Lab floor (East-North wing: x +9.5..+26.0, z -18.5..-4.5)
    const labFloor = new THREE.Mesh(
      new THREE.BoxGeometry(16.6, 0.08, 14.2),
      new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.8 })
    );
    labFloor.position.set(17.8, 0.03, -11.5);
    labFloor.receiveShadow = true;
    this.scene.add(labFloor);

    // 4. Art & Music Studio floor (West-Mid wing: x -24.5..-12.0, z -2.5..+8.5)
    const artFloor = new THREE.Mesh(
      new THREE.BoxGeometry(12.6, 0.08, 11.2),
      new THREE.MeshStandardMaterial({ color: 0xe9d5ff, roughness: 0.84 })
    );
    artFloor.position.set(-18.2, 0.03, 3.0);
    artFloor.receiveShadow = true;
    this.scene.add(artFloor);

    // === MONUMENTAL SCHOOL BUILDING BACKDROP (Polyfork Public School) ===
    const mainSchoolBuilding = spawnAsset('public-school-19ade5');
    mainSchoolBuilding.position.set(0, 0, -27.5);
    mainSchoolBuilding.scale.setScalar(1.35);
    this.scene.add(mainSchoolBuilding);

    // === MODULAR POLYFORK WALLS (Cutaway South for unobstructed 3rd-person view) ===
    // North back wall along z = -18.8 (x = -24.5..+25.5)
    for (let x = -24.5; x <= 25.5; x += 2) {
      const w = spawnAsset('school-wall-module-a09ccd');
      w.position.set(x, 0, -18.8);
      w.scale.set(2, 1.15, 1);
      this.scene.add(w);
    }
    this.addCollider(0.5, -18.8, 26.5, 0.5);

    // West outer wall (Classroom + Art Studio: x = -24.8, z = -18..+8)
    for (let z = -17.5; z <= 7.5; z += 2) {
      const w = spawnAsset('school-wall-module-a09ccd');
      w.position.set(-24.8, 0, z);
      w.rotation.y = Math.PI / 2;
      w.scale.set(2, 1.15, 1);
      this.scene.add(w);
    }
    this.addCollider(-24.8, -5.0, 0.5, 13.8);

    // East outer wall (Science Lab: x = +26.2, z = -18..-5)
    for (let z = -17.5; z <= -5.5; z += 2) {
      const w = spawnAsset('school-wall-module-a09ccd');
      w.position.set(26.2, 0, z);
      w.rotation.y = -Math.PI / 2;
      w.scale.set(2, 1.15, 1);
      this.scene.add(w);
    }
    this.addCollider(26.2, -11.5, 0.5, 7.2);

    // Partial interior dividers (wide open south passages so movement is effortless!)
    for (let z = -17.5; z <= -11.5; z += 2) {
      const d1 = spawnAsset('school-wall-module-a09ccd');
      d1.position.set(-9.5, 0, z);
      d1.rotation.y = Math.PI / 2;
      d1.scale.set(2, 1.15, 1);
      this.scene.add(d1);

      const d2 = spawnAsset('school-wall-module-a09ccd');
      d2.position.set(9.5, 0, z);
      d2.rotation.y = Math.PI / 2;
      d2.scale.set(2, 1.15, 1);
      this.scene.add(d2);
    }
    this.addCollider(-9.5, -14.5, 0.4, 4.2);
    this.addCollider(9.5, -14.5, 0.4, 4.2);

    // Partial divider between Classroom and Art Studio along z = -3.4
    for (let x = -23.5; x <= -15.5; x += 2) {
      const d3 = spawnAsset('school-wall-module-a09ccd');
      d3.position.set(x, 0, -3.4);
      d3.scale.set(2, 1.0, 1);
      this.scene.add(d3);
    }
    this.addCollider(-19.5, -3.4, 5.2, 0.4);

    // === FLOATING ZONE SIGNAGE (GTA: SAN SIDOARJO · GRAND TELKOM ACADEMY) ===
    const texLoader = new THREE.TextureLoader();
    texLoader.load('./assets/logo-san-sidoarjo.png', (logoTex) => {
      logoTex.colorSpace = THREE.SRGBColorSpace;
      const logoSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: logoTex, transparent: true }));
      logoSprite.position.set(0.0, 6.2, -18.5);
      logoSprite.scale.set(5.4, 4.8, 1);
      this.scene.add(logoSprite);
    });

    const signClass = makeZoneSignSprite('KELAS XI', 'Wali Kelas: Ibu Sari', '#38bdf8');
    signClass.position.set(-17.0, 4.3, -18.0);
    this.scene.add(signClass);

    const signHall = makeZoneSignSprite('KORIDOR & PIALA', 'Galeri Prestasi San Sidoarjo', '#fbbf24');
    signHall.position.set(0.0, 3.6, -18.0);
    this.scene.add(signHall);

    const signLab = makeZoneSignSprite('RUANG LAB', 'Klub Sains: Dinda', '#22c55e');
    signLab.position.set(17.8, 4.3, -18.0);
    this.scene.add(signLab);

    const signArt = makeZoneSignSprite('RUANG SENI & MUSIK', 'Pembina: Pak Hendra', '#c084fc');
    signArt.position.set(-18.2, 4.0, -2.5);
    this.scene.add(signArt);

    const signBasket = makeZoneSignSprite('LAPANGAN BASKET', 'Kapten: Dimas', '#fb923c');
    signBasket.position.set(19.0, 4.1, 5.2);
    this.scene.add(signBasket);

    const signSoccer = makeZoneSignSprite('LAPANGAN SEPAK BOLA', 'Tantangan Penalti', '#4ade80');
    signSoccer.position.set(-18.5, 4.1, 10.2);
    this.scene.add(signSoccer);
  }

  buildClassroom() {
    const board = spawnAsset('teaching-board-7ba611');
    board.position.set(-17.2, 0, -18.35);
    board.scale.setScalar(1.25);
    this.scene.add(board);

    const clock = spawnAsset('wall-clock-0c555c');
    clock.position.set(-12.5, 2.55, -18.45);
    this.scene.add(clock);
    this.wallClock = clock;

    const display = spawnAsset('wall-display-board-626293');
    display.position.set(-21.8, 1.5, -18.45);
    this.scene.add(display);

    // Classroom TV trolley in northeast corner of classroom
    const tvTrolley = spawnAsset('class-tv-trolley-2f9fa2');
    tvTrolley.position.set(-11.2, 0.05, -17.0);
    tvTrolley.rotation.y = -0.5;
    this.scene.add(tvTrolley);
    this.addBoxColliderFromObject(tvTrolley, 0.05);

    // Teacher desk + globe + hand bell
    const teacherDesk = spawnAsset('teacher-s-desk-381eeb');
    teacherDesk.position.set(-17.4, 0.05, -15.6);
    this.scene.add(teacherDesk);
    this.addBoxColliderFromObject(teacherDesk, 0.06);

    const globe = spawnAsset('classroom-globe-16a96e');
    placeOnTopOf(globe, teacherDesk, 0.45, 0.04);
    this.scene.add(globe);

    const bell = spawnAsset('hand-bell-cc0a37');
    placeOnTopOf(bell, teacherDesk, -0.45, 0.08);
    this.scene.add(bell);

    // 6 Spacious student desks + chairs (3 columns × 2 rows)
    const deskCols = [-21.5, -17.2, -12.9];
    const deskRows = [-11.5, -8.3];
    for (const z of deskRows) {
      for (const x of deskCols) {
        const desk = spawnAsset('pupil-table-1eebd1', {
          age: 'teen',
          colorway: 'beech-steel',
          term: 0.72,
        });
        desk.position.set(x, 0.05, z);
        desk.rotation.y = Math.PI;
        this.scene.add(desk);
        this.addBoxColliderFromObject(desk, 0.05);

        const chair = spawnAsset('stacking-pupil-chair-738aac');
        chair.position.set(x, 0.05, z + 0.72);
        chair.rotation.y = Math.PI;
        this.scene.add(chair);
      }
    }

    // Bookshelves, coat peg rail, and cubby unit along west classroom wall
    for (const z of [-15.2, -13.6, -12.0]) {
      const shelf = spawnAsset('library-shelf-run-570904');
      shelf.position.set(-24.2, 0.05, z);
      shelf.rotation.y = Math.PI / 2;
      this.scene.add(shelf);
      this.addBoxColliderFromObject(shelf, 0.05);
    }

    const cubby = spawnAsset('tray-cubby-unit-87c1e4');
    cubby.position.set(-24.1, 0.05, -9.2);
    cubby.rotation.y = Math.PI / 2;
    this.scene.add(cubby);
    this.addBoxColliderFromObject(cubby, 0.05);

    const pegs = spawnAsset('coat-peg-rail-5e07ae');
    pegs.position.set(-24.5, 1.45, -6.5);
    pegs.rotation.y = Math.PI / 2;
    this.scene.add(pegs);

    const plant = spawnAsset('floor-houseplant-8fad17');
    plant.position.set(-10.5, 0.05, -17.6);
    this.scene.add(plant);
  }

  buildHallway() {
    // Long row of 7 school lockers along north hallway wall
    for (const x of [-6.8, -5.6, -4.4, -3.2, -2.0, -0.8, 0.4]) {
      const locker = spawnAsset('locker-bank-1784b8');
      locker.position.set(x, 0.05, -18.0);
      this.scene.add(locker);
      this.addBoxColliderFromObject(locker, 0.05);
    }

    // Collectible school backpack resting in front of locker (Chapter 3)
    const backpack = spawnAsset('pupil-backpack-d9b5fb');
    backpack.position.set(-2.0, 0.08, -16.8);
    backpack.rotation.y = 0.35;
    backpack.scale.setScalar(1.25);
    this.scene.add(backpack);
    this.lockerBackpack = backpack;

    // Twin Trophy Cabinets (Galeri Piala Prestasi — Chapter 5 Finale!)
    for (const x of [3.6, 5.4]) {
      const trophy = spawnAsset('trophy-cabinet-e963ac');
      trophy.position.set(x, 0.05, -17.95);
      this.scene.add(trophy);
      this.addBoxColliderFromObject(trophy, 0.05);
    }

    // Bulletin board, plants, benches & safety equipment in grand hallway
    const hallBoard = spawnAsset('wall-display-board-626293');
    hallBoard.position.set(7.8, 1.5, -18.45);
    this.scene.add(hallBoard);

    for (const x of [-8.2, 8.2]) {
      const shrub = spawnAsset('potted-shrub-43bd21');
      shrub.position.set(x, 0.05, -17.4);
      this.scene.add(shrub);
      this.addCollider(x, -17.4, 0.55, 0.55);
    }

    // Central hallway seating lounge
    const hallBenchL = spawnAsset('campus-bench-0d6036');
    hallBenchL.position.set(-4.5, 0.05, -9.5);
    this.scene.add(hallBenchL);
    this.addBoxColliderFromObject(hallBenchL, 0.06);

    const hallBenchR = spawnAsset('campus-bench-0d6036');
    hallBenchR.position.set(4.5, 0.05, -9.5);
    this.scene.add(hallBenchR);
    this.addBoxColliderFromObject(hallBenchR, 0.06);

    const extinguisher = spawnAsset('fire-extinguisher-74d502');
    extinguisher.position.set(-8.6, 0.05, -14.8);
    this.scene.add(extinguisher);

    const firstAid = spawnAsset('wall-first-aid-box-95c087');
    firstAid.position.set(-9.15, 1.5, -15.5);
    firstAid.rotation.y = Math.PI / 2;
    this.scene.add(firstAid);

    const exitSign = spawnAsset('exit-sign-aa48ad');
    exitSign.position.set(0.0, 2.8, -18.45);
    this.scene.add(exitSign);
  }

  buildScienceLab() {
    // Large whiteboard on back lab wall
    const wb = spawnAsset('writing-wall-whiteboard-a3163e');
    wb.position.set(17.5, 0.05, -18.4);
    this.scene.add(wb);

    // Primary Lab Bench (Microscope + Bunsen Burner + Laptop)
    const labBenchMain = spawnAsset('lab-bench-740e7b');
    labBenchMain.position.set(17.5, 0.05, -13.6);
    this.scene.add(labBenchMain);
    this.addBoxColliderFromObject(labBenchMain, 0.06);

    const microscope = spawnAsset('microscope-e7b9d5');
    placeOnTopOf(microscope, labBenchMain, -0.35, 0.05);
    microscope.rotation.y = 0.4;
    this.scene.add(microscope);
    this.microscope = microscope;

    const burner = spawnAsset('bunsen-burner-445465');
    placeOnTopOf(burner, labBenchMain, 0.55, -0.05);
    this.scene.add(burner);

    const laptop = spawnAsset('laptop-e775ba');
    placeOnTopOf(laptop, labBenchMain, 0.08, 0.08);
    laptop.rotation.y = Math.PI;
    this.scene.add(laptop);

    // Secondary Lab Bench for spacious lab atmosphere
    const labBench2 = spawnAsset('lab-bench-740e7b');
    labBench2.position.set(13.2, 0.05, -13.6);
    this.scene.add(labBench2);
    this.addBoxColliderFromObject(labBench2, 0.06);

    const burner2 = spawnAsset('bunsen-burner-445465');
    placeOnTopOf(burner2, labBench2, 0.2, 0);
    this.scene.add(burner2);

    // Holographic green focus beam above microscope (Chapter 3 mini-game)
    const beamGeo = new THREE.ConeGeometry(0.45, 1.6, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    this.microscopeBeam = new THREE.Mesh(beamGeo, beamMat);
    this.microscopeBeam.position.set(microscope.position.x, microscope.position.y + 0.98, microscope.position.z);
    this.microscopeBeam.visible = false;
    this.scene.add(this.microscopeBeam);

    // Lab stools
    for (const x of [12.5, 13.8, 16.8, 18.2]) {
      const stool = spawnAsset('lab-stool-f405c7');
      stool.position.set(x, 0.05, -12.4);
      this.scene.add(stool);
    }

    // Two Computer Bench runs along the East Lab wall
    for (const z of [-14.2, -9.8]) {
      const compBench = spawnAsset('computer-bench-run-lit-87d9cf');
      compBench.position.set(24.4, 0.05, z);
      compBench.rotation.y = -Math.PI / 2;
      this.scene.add(compBench);
      this.addBoxColliderFromObject(compBench, 0.08);
    }

    const labPlant = spawnAsset('floor-houseplant-8fad17');
    labPlant.position.set(24.8, 0.05, -17.4);
    this.scene.add(labPlant);
  }

  buildArtMusicStudio() {
    // Upright Piano against the west wall
    const piano = spawnAsset('upright-piano-c0b0ef');
    piano.position.set(-23.4, 0.05, 1.5);
    piano.rotation.y = Math.PI / 2;
    this.scene.add(piano);
    this.addBoxColliderFromObject(piano, 0.06);

    const pianoStool = spawnAsset('lab-stool-f405c7');
    pianoStool.position.set(-22.1, 0.05, 1.5);
    this.scene.add(pianoStool);

    // Art easels & wheeled presentation board
    const easel1 = spawnAsset('art-easel-078422');
    easel1.position.set(-19.0, 0.05, 0.2);
    easel1.rotation.y = 0.5;
    this.scene.add(easel1);
    this.addBoxColliderFromObject(easel1, 0.05);

    const easel2 = spawnAsset('art-easel-078422');
    easel2.position.set(-15.5, 0.05, 1.4);
    easel2.rotation.y = -0.45;
    this.scene.add(easel2);
    this.addBoxColliderFromObject(easel2, 0.05);

    const wheeledBoard = spawnAsset('wheeled-easel-board-6f9204');
    wheeledBoard.position.set(-18.2, 0.05, -2.0);
    this.scene.add(wheeledBoard);
    this.addBoxColliderFromObject(wheeledBoard, 0.05);

    // Studio shelves & potted greenery
    const artShelf = spawnAsset('library-shelf-run-570904');
    artShelf.position.set(-24.0, 0.05, 5.2);
    artShelf.rotation.y = Math.PI / 2;
    this.scene.add(artShelf);
    this.addBoxColliderFromObject(artShelf, 0.05);

    const studioPlant = spawnAsset('floor-houseplant-8fad17');
    studioPlant.position.set(-13.2, 0.05, -1.6);
    this.scene.add(studioPlant);

    // 4 Glowing 3D Musical Note Orbs hovering above the Piano during Mini-Game 2!
    const noteColors = [0xef4444, 0xf59e0b, 0x22c55e, 0x38bdf8];
    this.pianoOrbs = [];
    for (let i = 0; i < 4; i++) {
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({
          color: noteColors[i],
          emissive: noteColors[i],
          emissiveIntensity: 0.25,
          flatShading: true,
        })
      );
      orb.position.set(-23.2, 1.95, 0.55 + i * 0.62);
      orb.visible = false;
      this.scene.add(orb);
      this.pianoOrbs.push(orb);
    }
  }

  buildSchoolyardAndGate() {
    // Grand Flagpole Ceremony Plaza with Waving 3D Bendera Indonesia (Sang Saka Merah Putih!)
    const flagpole = spawnAsset('flagpole-7b7806', { flag: 'none', mastHeight: 6.0 });
    flagpole.position.set(0.0, 0.04, 6.2);
    flagpole.scale.setScalar(1.15);
    this.scene.add(flagpole);
    this.addCollider(0.0, 6.2, 0.65, 0.65);

    flagpole.updateMatrixWorld(true);
    const poleBox = new THREE.Box3().setFromObject(flagpole);
    const flagW = 2.04;
    const flagH = 1.36; // Official 2:3 ratio
    const flagGeo = new THREE.PlaneGeometry(flagW, flagH, 16, 6);
    flagGeo.translate(flagW * 0.5, 0, 0); // Anchor hoist edge at x = 0 on the mast
    const flagMat = new THREE.MeshStandardMaterial({
      map: makeIndonesianFlagTexture(),
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const indoFlag = new THREE.Mesh(flagGeo, flagMat);
    indoFlag.position.set(0.06, Math.max(5.6, poleBox.max.y - flagH * 0.5 - 0.36), 6.2);
    indoFlag.rotation.y = -0.18;
    indoFlag.castShadow = true;
    indoFlag.userData.flagW = flagW;
    this.scene.add(indoFlag);
    this.indoFlag = indoFlag;

    // West courtyard bench with lost Homework Exercise Book Stack (Chapter 1)
    const yardBench = spawnAsset('campus-bench-0d6036');
    yardBench.position.set(-10.2, 0.03, 12.6);
    yardBench.rotation.y = Math.PI / 2;
    this.scene.add(yardBench);
    this.addBoxColliderFromObject(yardBench, 0.06);

    const bookStack = spawnAsset('exercise-book-stack-266d9d');
    placeOnTopOf(bookStack, yardBench, 0, 0.12);
    bookStack.scale.setScalar(1.55);
    this.scene.add(bookStack);
    this.homeworkBook = bookStack;

    // Extra courtyard benches along the central boulevard
    const benchEast = spawnAsset('campus-bench-0d6036');
    benchEast.position.set(7.6, 0.03, 12.6);
    benchEast.rotation.y = -Math.PI / 2;
    this.scene.add(benchEast);
    this.addBoxColliderFromObject(benchEast, 0.06);

    // Dual Cycle Shelters & Bicycles along South-East entrance plaza
    const shelter1 = spawnAsset('cycle-shelter-714b16');
    shelter1.position.set(-8.2, 0.03, 20.4);
    this.scene.add(shelter1);
    this.addBoxColliderFromObject(shelter1, 0.12);

    for (const x of [-9.2, -7.8, -6.6]) {
      const bike = spawnAsset('city-bicycle-5b67d1');
      bike.position.set(x, 0.03, 20.5);
      this.scene.add(bike);
    }

    // Perimeter railing & gate along z = 24.4 (leaving wide central gate x = -3.8..+3.8)
    for (const x of [-24.0, -20.6, -17.2, -13.8, -10.4, -7.0, 7.0, 10.4, 13.8, 17.2, 20.6, 24.0]) {
      const rail = spawnAsset('railing-and-gate-run-5c8137');
      rail.position.set(x, 0, 24.4);
      this.scene.add(rail);
    }
    this.addCollider(-15.5, 24.4, 10.2, 0.5);
    this.addCollider(15.5, 24.4, 10.2, 0.5);

    // Two Yellow School Buses parked on the avenue outside the gate!
    const bus1 = spawnAsset('yellow-school-bus-0fd3b6');
    bus1.position.set(-9.5, 0.03, 27.6);
    bus1.rotation.y = Math.PI / 2;
    this.scene.add(bus1);

    const bus2 = spawnAsset('yellow-school-bus-0fd3b6');
    bus2.position.set(11.5, 0.03, 27.6);
    bus2.rotation.y = -Math.PI / 2;
    this.scene.add(bus2);

    // Campus Lamp Posts lighting up the boulevard at sunset (kept clear of center sightline)
    const lampCoords = [
      { x: -5.2, z: 1.5 },
      { x: 5.2, z: 1.5 },
      { x: -5.2, z: 10.5 },
      { x: 5.2, z: 10.5 },
      { x: -5.2, z: 21.8 },
      { x: 5.2, z: 21.8 },
    ];
    for (const pos of lampCoords) {
      const lamp = spawnAsset('campus-lamp-post-579291');
      lamp.position.set(pos.x, 0.02, pos.z);
      this.scene.add(lamp);
      this.addCollider(pos.x, pos.z, 0.35, 0.35);

      const pt = new THREE.PointLight(0xffcb7d, 0, 18, 1.7);
      pt.position.set(pos.x, 4.2, pos.z);
      this.scene.add(pt);
      this.lampLights.push(pt);
    }

    // Trees framing the big campus perimeter & courtyard
    const oakCoords = [
      { x: -29.5, z: -14.0, scale: 1.2 },
      { x: -29.5, z: -1.0, scale: 1.1 },
      { x: -29.5, z: 14.0, scale: 1.15 },
      { x: -28.0, z: 24.0, scale: 1.05 },
      { x: 30.5, z: -14.0, scale: 1.15 },
      { x: 30.5, z: 0.0, scale: 1.05 },
      { x: 30.5, z: 14.0, scale: 1.2 },
      { x: 29.0, z: 24.0, scale: 1.0 },
      { x: -18.0, z: -24.5, scale: 1.25 },
      { x: 18.0, z: -24.5, scale: 1.2 },
    ];
    for (const tc of oakCoords) {
      const tree = spawnAsset('broadleaf-oak-997c22');
      tree.position.set(tc.x, 0, tc.z);
      tree.scale.setScalar(tc.scale);
      tree.rotation.y = tc.x * 0.7;
      this.scene.add(tree);
    }

    // Courtyard pit-grate shade trees
    const pitCoords = [
      { x: 7.4, z: 2.0 },
      { x: -7.8, z: 2.0 },
      { x: 7.4, z: 20.0 },
    ];
    for (const pc of pitCoords) {
      const pitTree = spawnAsset('tree-in-pit-grate-ea8010');
      pitTree.position.set(pc.x, 0.02, pc.z);
      pitTree.scale.setScalar(0.85);
      this.scene.add(pitTree);
      this.addCollider(pc.x, pc.z, 0.85, 0.85);
    }
  }

  buildBasketballCourt() {
    const court = new THREE.Mesh(
      new THREE.PlaneGeometry(14.0, 11.4),
      new THREE.MeshStandardMaterial({ map: makeBasketballCourtTexture(), roughness: 0.88 })
    );
    court.rotation.x = -Math.PI / 2;
    court.position.set(19.0, 0.055, 12.0);
    court.receiveShadow = true;
    this.scene.add(court);

    // Basketball post facing -X (toward shooter at x = 16.8)
    const hoop = spawnAsset('yard-basketball-post-b71ee3');
    hoop.position.set(24.6, 0.05, 12.0);
    hoop.rotation.y = -Math.PI / 2;
    this.scene.add(hoop);
    this.addCollider(24.8, 12.0, 0.6, 0.6);

    hoop.updateMatrixWorld(true);
    const hBox = new THREE.Box3().setFromObject(hoop);
    const rimY = Math.max(2.3, hBox.max.y - 0.58);
    this.hoopRimWorldPos.set(hBox.min.x + 0.36, rimY, 12.0);

    const bin = spawnAsset('ball-bin-3198fe');
    bin.position.set(22.2, 0.05, 6.2);
    this.scene.add(bin);
    this.addBoxColliderFromObject(bin, 0.05);

    const bench1 = spawnAsset('campus-bench-0d6036');
    bench1.position.set(15.5, 0.05, 5.4);
    this.scene.add(bench1);
    this.addBoxColliderFromObject(bench1, 0.05);

    const bench2 = spawnAsset('campus-bench-0d6036');
    bench2.position.set(19.2, 0.05, 5.4);
    this.scene.add(bench2);
    this.addBoxColliderFromObject(bench2, 0.05);

    // Interactive 3D Physics Basketball
    this.basketball = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 18, 14),
      new THREE.MeshStandardMaterial({ map: makeBasketballTexture(), roughness: 0.72 })
    );
    this.basketball.castShadow = true;
    this.basketball.position.set(18.0, 0.22, 10.6);
    this.scene.add(this.basketball);
  }

  buildSoccerField() {
    // Painted Soccer Turf Pitch (West-South Wing)
    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(14.0, 11.2),
      new THREE.MeshStandardMaterial({ map: makeSoccerFieldTexture(), roughness: 0.92 })
    );
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.set(-18.5, 0.055, 16.0);
    pitch.receiveShadow = true;
    this.scene.add(pitch);

    // Real Polyfork Football Goal facing +X on the West edge of the pitch
    const goal = spawnAsset('football-goal-78fee1');
    goal.position.set(-24.4, 0.05, 16.0);
    goal.rotation.y = Math.PI / 2;
    this.scene.add(goal);
    this.addCollider(-24.8, 16.0, 0.7, 2.5);

    // Classic black-and-white soccer ball at midfield
    this.soccerBall = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.18, 1),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, flatShading: true })
    );
    this.soccerBall.castShadow = true;
    this.soccerBall.position.set(-18.5, 0.23, 16.0);
    this.scene.add(this.soccerBall);

    // Hidden Easter Egg #2: Golden Monument of Sidoarjo tucked behind the east side!
    const statueGroup = new THREE.Group();
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.42, 0.72, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, flatShading: true })
    );
    ped.position.y = 0.36;
    const gem = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.24, 0.08, 36, 8),
      new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xd97706,
        emissiveIntensity: 0.55,
        metalness: 0.6,
        roughness: 0.25,
      })
    );
    gem.position.y = 1.05;
    gem.name = 'easterGem';
    statueGroup.add(ped, gem);
    statueGroup.position.set(25.0, 0.04, 1.8);
    this.scene.add(statueGroup);
    this.goldenEasterStatue = statueGroup;

    // Cyan floating diamonds marking optional Side-Interactions across campus!
    const sideSpots = [
      { id: 'side_bima_quiz', x: -21.6, z: -9.8 },
      { id: 'side_projector_lab', x: 23.6, z: -12.0 },
      { id: 'side_apar_prank', x: -8.6, z: -14.8 },
      { id: 'side_bus_escape', x: -8.0, z: 22.8 },
    ];
    for (const s of sideSpots) {
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.2, 0),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.7,
          flatShading: true,
        })
      );
      marker.position.set(s.x, 2.2, s.z);
      this.scene.add(marker);
      this.sideMarkers.set(s.id, marker);
    }

    const sidelineBench = spawnAsset('campus-bench-0d6036');
    sidelineBench.position.set(-18.5, 0.05, 9.6);
    this.scene.add(sidelineBench);
    this.addBoxColliderFromObject(sidelineBench, 0.05);
  }

  buildTargetBeacon() {
    const group = new THREE.Group();
    const ring = spawnAsset('floor-target-ring-d55035');
    ring.scale.setScalar(1.75);
    group.add(ring);

    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.65,
        flatShading: true,
      })
    );
    diamond.position.y = 2.6;
    diamond.name = 'beaconDiamond';
    group.add(diamond);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.52, 2.5, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      })
    );
    beam.position.y = 1.25;
    group.add(beam);

    this.targetBeacon = group;
    this.scene.add(group);
  }

  async buildCharacters() {
    // Player: Rafi starts at the grand SKOMDA front gate wearing SKOMDA Merah-Putih uniform!
    this.player = spawnAsset('pupil-standing-0bd6d5', { age: 'teen', expression: 'happy' });
    this.player.position.set(0.0, 0.05, 21.4);
    this.player.rotation.y = Math.PI;
    this.scene.add(this.player);
    applyStudentUniform(this.player, 'skomda_red');

    this.playerAnim = await attachCharacterAnimation(this.player, [
      'Idle',
      'Walk',
      'Run',
      'Interact',
      'Pick up',
      'Agree',
      'Dance',
    ]);
    this.playerAnim.play('Idle');
    this.animators.push(this.playerAnim);

    const npcSpecs = [
      {
        id: 'pak_budi',
        asset: 'school-caretaker-b49fae',
        pos: [-2.2, 0.05, 18.4],
        rotY: 0.35,
        clips: ['Idle', 'Talking', 'Agree'],
      },
      {
        id: 'ibu_sari',
        asset: 'school-teacher-8b8bfc',
        pos: [-15.8, 0.06, -15.1],
        rotY: -0.25,
        clips: ['Idle', 'Talking', 'Agree'],
      },
      {
        id: 'dinda',
        asset: 'student-in-a-hoodie-7c8223',
        pos: [15.8, 0.06, -12.6],
        rotY: 0.6,
        clips: ['Idle', 'Talking', 'Agree', 'Interact'],
      },
      {
        id: 'dimas',
        asset: 'student-with-backpack-65d2b4',
        pos: [19.4, 0.06, 9.2],
        rotY: -0.5,
        clips: ['Idle', 'Talking', 'Agree', 'Dance'],
      },
      {
        id: 'bima_classmate',
        asset: 'schoolkid-da94c1',
        pos: [-21.6, 0.06, -9.8],
        rotY: 1.2,
        clips: ['Idle', 'Agree'],
      },
      {
        id: 'pak_hendra_seni',
        asset: 'professor-14dc4d',
        pos: [-19.2, 0.06, 3.6],
        rotY: 0.4,
        clips: ['Idle', 'Talking', 'Agree'],
      },
    ];

    for (const spec of npcSpecs) {
      const mesh = spawnAsset(spec.asset);
      mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      mesh.rotation.y = spec.rotY;
      this.scene.add(mesh);

      const anim = await attachCharacterAnimation(mesh, spec.clips);
      anim.play('Idle');
      this.animators.push(anim);
      if (spec.id === 'bima_classmate') {
        applyStudentUniform(mesh, 'skomda_red');
      }
      this.npcs.set(spec.id, { mesh, anim });
    }

    // REAL 3D Animated Human Goalkeeper guarding the soccer goal!
    const goalieMesh = spawnAsset('pupil-standing-0bd6d5', { age: 'teen', expression: 'happy' });
    goalieMesh.position.set(-23.4, 0.05, 16.0);
    goalieMesh.rotation.y = Math.PI / 2; // Facing +X toward the penalty taker!
    this.scene.add(goalieMesh);
    applyStudentUniform(goalieMesh, {
      pattern: 'sport',
      shirtHex: '#facc15', // Bright goalkeeper neon yellow jersey
      vestHex: '#15803d',  // Green sleeves
      pantsHex: '#111827', // Black shorts/pants
      useTie: false,
      badgeHex: '#ffffff',
    });
    const goalieAnim = await attachCharacterAnimation(goalieMesh, ['Idle', 'Jog', 'Interact', 'Agree']);
    goalieAnim.play('Idle');
    this.animators.push(goalieAnim);
    this.penaltyGoalie = goalieMesh;
    this.penaltyGoalieAnim = goalieAnim;
  }

  /**
   * Switches Rafi's 3D student uniform live (preset ID OR custom color config object!).
   */
  setPlayerUniform(presetOrConfig) {
    if (!this.player) return;
    applyStudentUniform(this.player, presetOrConfig);
    this.spawnCelebrationBurst(this.player.position.clone().add(new THREE.Vector3(0, 1.1, 0)));
  }

  /**
   * Exhibition Low-GPU / Eco Graphics toggle for cool & smooth performance on laptops.
   */
  setLowGpuMode(enabled) {
    this.lowGpuMode = Boolean(enabled);
    this.renderer.shadowMap.enabled = !this.lowGpuMode;
    this.sunLight.castShadow = !this.lowGpuMode;
    this.renderer.setPixelRatio(this.lowGpuMode ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  hideSideMarker(sideId) {
    const m = this.sideMarkers.get(sideId);
    if (m) m.visible = false;
  }

  showAllSideMarkers() {
    for (const [, m] of this.sideMarkers) m.visible = true;
  }

  setPianoOrbs(visible, activeIdx = -1) {
    this.pianoOrbs.forEach((orb, idx) => {
      orb.visible = visible;
      if (visible) {
        const isLit = idx === activeIdx;
        orb.scale.setScalar(isLit ? 1.65 : 0.85);
        orb.material.emissiveIntensity = isLit ? 1.1 : 0.15;
      }
    });
  }

  setPenaltyGoalie(active, zPos = 16.0) {
    if (!this.penaltyGoalie) return;
    this.penaltyGoalie.position.z = zPos;
    this.penaltyGoalie.rotation.y = Math.PI / 2;
    this.penaltyGoalieAnim?.play(active ? 'Jog' : 'Idle');
  }

  /**
   * Launches the 3D soccer ball into Left (-1.6), Center (0), or Right (+1.6) of the goal!
   */
  launchPenaltyKick(laneIdx, goalieZ, onResult) {
    if (!this.soccerBall) return;
    const laneZs = [17.55, 16.0, 14.45]; // Left, Center, Right from shooter facing -X
    const targetZ = laneZs[laneIdx] ?? 16.0;
    const blocked = Math.abs(targetZ - goalieZ) < 0.85;

    const start = new THREE.Vector3(-18.2, 0.23, 16.0);
    const end = new THREE.Vector3(blocked ? -23.3 : -24.5, blocked ? 0.95 : 1.05, targetZ);

    this.penaltyFlight = {
      start,
      end,
      elapsed: 0,
      duration: 0.56,
      blocked,
      onResult,
    };
  }

  setLightingPreset(key) {
    if (LIGHTING_PRESETS[key]) {
      this.currentLightingKey = key;
      this.targetPreset = LIGHTING_PRESETS[key];
    }
  }

  setTargetBeacon(pos, visible = true) {
    if (!this.targetBeacon) return;
    this.targetBeacon.visible = visible;
    if (pos) {
      this.targetBeacon.position.set(pos.x, 0.06, pos.z);
    }
  }

  playNpcAnim(npcId, clipName) {
    const npc = this.npcs.get(npcId);
    if (npc && npc.anim) {
      npc.anim.play(clipName);
    }
  }

  faceNpcTowardPlayer(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc || !this.player) return;
    const dx = this.player.position.x - npc.mesh.position.x;
    const dz = this.player.position.z - npc.mesh.position.z;
    npc.mesh.rotation.y = Math.atan2(dx, dz);
  }

  setMicroscopeBeam(visible, quality = 0) {
    if (!this.microscopeBeam) return;
    this.microscopeBeam.visible = visible;
    if (visible) {
      const color = quality > 0.7 ? 0x22c55e : quality > 0.35 ? 0xf59e0b : 0xf43f5e;
      this.microscopeBeam.material.color.setHex(color);
      this.microscopeBeam.material.opacity = 0.25 + quality * 0.32;
    }
  }

  launchBasketballShot(powerNorm, onResult) {
    if (!this.basketball || !this.player) return;
    const start = new THREE.Vector3(
      this.player.position.x + 0.45,
      1.55,
      this.player.position.z
    );
    const isScore = powerNorm >= 0.56 && powerNorm <= 0.84;
    const rim = this.hoopRimWorldPos.clone();

    const end = isScore
      ? rim.clone()
      : rim.clone().add(new THREE.Vector3(powerNorm < 0.56 ? -1.1 : 0.85, -0.35, (Math.random() - 0.5) * 0.8));

    this.ballFlight = {
      start,
      end,
      elapsed: 0,
      duration: 0.96,
      arcHeight: 2.5 + powerNorm * 1.25,
      isScore,
      scoredDropElapsed: 0,
      phase: 'arc',
      onResult,
    };
  }

  spawnCelebrationBurst(pos) {
    const colors = [0xfde047, 0x22c55e, 0x38bdf8, 0xfb7185];
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.09, 0),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length] })
      );
      m.position.copy(pos);
      const angle = (i / 16) * Math.PI * 2;
      m.userData.vel = new THREE.Vector3(
        Math.cos(angle) * (1.2 + Math.random() * 1.6),
        2.2 + Math.random() * 2.1,
        Math.sin(angle) * (1.2 + Math.random() * 1.6)
      );
      m.userData.life = 1.0;
      this.scene.add(m);
      this.sparkles.push(m);
    }
  }

  movePlayer(dx, dz) {
    if (!this.player) return;
    const radius = 0.38;
    const tryMove = (nx, nz) => {
      if (
        nx < WORLD_BOUNDS.minX + 0.8 ||
        nx > WORLD_BOUNDS.maxX - 0.8 ||
        nz < WORLD_BOUNDS.minZ + 1.5 ||
        nz > WORLD_BOUNDS.maxZ - 0.6
      ) {
        return false;
      }
      for (const c of this.colliders) {
        if (
          nx + radius > c.minX &&
          nx - radius < c.maxX &&
          nz + radius > c.minZ &&
          nz - radius < c.maxZ
        ) {
          return false;
        }
      }
      return true;
    };

    const curX = this.player.position.x;
    const curZ = this.player.position.z;
    if (tryMove(curX + dx, curZ + dz)) {
      this.player.position.x += dx;
      this.player.position.z += dz;
    } else if (tryMove(curX + dx, curZ)) {
      this.player.position.x += dx;
    } else if (tryMove(curX, curZ + dz)) {
      this.player.position.z += dz;
    }

    // Playful soccer ball kick if Rafi runs near it on the soccer pitch!
    if (this.soccerBall) {
      const sdx = this.soccerBall.position.x - this.player.position.x;
      const sdz = this.soccerBall.position.z - this.player.position.z;
      const dist = Math.hypot(sdx, sdz);
      if (dist > 0.01 && dist < 0.72) {
        this.soccerBall.position.x = Math.max(-24.2, Math.min(-12.2, this.soccerBall.position.x + (sdx / dist) * 0.28));
        this.soccerBall.position.z = Math.max(11.0, Math.min(21.0, this.soccerBall.position.z + (sdz / dist) * 0.28));
        this.soccerBall.rotation.x += 0.4;
        this.soccerBall.rotation.z -= 0.3;
      }
    }
  }

  update(dt, elapsedSec) {
    for (const anim of this.animators) {
      anim.update(dt);
    }

    const p = this.targetPreset;
    const lerpRate = Math.min(1, dt * 1.4);
    this.scene.background.lerp(p.sky, lerpRate);
    this.scene.fog.color.lerp(p.fog, lerpRate);
    this.sunLight.color.lerp(p.sunColor, lerpRate);
    this.sunLight.intensity += (p.sunIntensity - this.sunLight.intensity) * lerpRate;
    this.sunLight.position.lerp(p.sunPos, lerpRate);
    this.hemiLight.color.lerp(p.hemiSky, lerpRate);
    this.hemiLight.groundColor.lerp(p.hemiGround, lerpRate);
    this.hemiLight.intensity += (p.hemiIntensity - this.hemiLight.intensity) * lerpRate;
    for (const light of this.lampLights) {
      light.intensity += (p.lampIntensity - light.intensity) * lerpRate;
    }

    if (this.targetBeacon && this.targetBeacon.visible) {
      this.targetBeacon.rotation.y += dt * 1.4;
      const diamond = this.targetBeacon.getObjectByName('beaconDiamond');
      if (diamond) {
        diamond.position.y = 2.55 + Math.sin(elapsedSec * 3.5) * 0.24;
      }
    }

    if (this.homeworkBook && this.homeworkBook.visible) {
      this.homeworkBook.rotation.y = Math.sin(elapsedSec * 1.5) * 0.25;
    }

    // Gentle real-time wind ripple on Sang Saka Merah Putih (Bendera Indonesia)
    if (this.indoFlag) {
      const pos = this.indoFlag.geometry.attributes.position;
      const fw = this.indoFlag.userData.flagW || 2.04;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const pin = Math.min(1, vx / fw);
        const wave =
          Math.sin(vx * 3.1 - elapsedSec * 4.4 + vy * 0.7) * 0.14 * pin +
          Math.sin(vx * 5.8 - elapsedSec * 6.2) * 0.035 * pin * pin;
        pos.setZ(i, wave);
      }
      pos.needsUpdate = true;
      this.indoFlag.geometry.computeVertexNormals();
    }

    if (this.microscopeBeam && this.microscopeBeam.visible) {
      this.microscopeBeam.rotation.y += dt * 2.2;
    }

    if (this.ballFlight && this.basketball) {
      const f = this.ballFlight;
      if (f.phase === 'arc') {
        f.elapsed += dt;
        const u = Math.min(1, f.elapsed / f.duration);
        const pos = new THREE.Vector3().lerpVectors(f.start, f.end, u);
        pos.y += Math.sin(u * Math.PI) * f.arcHeight;
        this.basketball.position.copy(pos);
        this.basketball.rotation.z -= dt * 8;

        if (u >= 1) {
          if (f.isScore) {
            this.spawnCelebrationBurst(this.hoopRimWorldPos);
          }
          f.phase = 'drop';
          if (f.onResult) f.onResult(f.isScore);
        }
      } else {
        f.scoredDropElapsed += dt;
        const dropT = Math.min(1, f.scoredDropElapsed / 0.55);
        this.basketball.position.y = THREE.MathUtils.lerp(f.end.y, 0.22, dropT * dropT);
        if (dropT >= 1) {
          this.ballFlight = null;
        }
      }
    }

    // Rotate bonus side-quest markers, piano orbs & hidden golden Easter Egg statue
    if (this.goldenEasterStatue) {
      const gem = this.goldenEasterStatue.getObjectByName('easterGem');
      if (gem) {
        gem.rotation.y += dt * 1.8;
        gem.rotation.x += dt * 0.8;
      }
    }
    for (const [, m] of this.sideMarkers) {
      if (m.visible) {
        m.rotation.y += dt * 1.8;
        m.position.y = 2.2 + Math.sin(elapsedSec * 3.0) * 0.16;
      }
    }
    for (const orb of this.pianoOrbs) {
      if (orb.visible) orb.rotation.y += dt * 2.5;
    }

    // Soccer penalty kick 3D ball trajectory
    if (this.penaltyFlight && this.soccerBall) {
      const f = this.penaltyFlight;
      f.elapsed += dt;
      const u = Math.min(1, f.elapsed / f.duration);
      const pos = new THREE.Vector3().lerpVectors(f.start, f.end, u);
      pos.y += Math.sin(u * Math.PI) * 0.85;
      this.soccerBall.position.copy(pos);
      this.soccerBall.rotation.z += dt * 14;
      if (u >= 1) {
        if (!f.blocked) {
          this.spawnCelebrationBurst(f.end);
        }
        const cb = f.onResult;
        this.penaltyFlight = null;
        if (cb) cb(!f.blocked);
      }
    }

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.userData.life -= dt * 1.1;
      s.userData.vel.y -= 6.5 * dt;
      s.position.addScaledVector(s.userData.vel, dt);
      s.scale.setScalar(Math.max(0.01, s.userData.life));
      if (s.userData.life <= 0) {
        this.scene.remove(s);
        this.sparkles.splice(i, 1);
      }
    }
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

import * as THREE from 'three';

const POLYFORK_CDN = new URL('../vendor/polyfork', import.meta.url).href;

/**
 * Authentic SMK Telkom Uniform Presets + Full Custom Color Editor support!
 * Default `skomda_red` matches the real SMK Telkom reference photo:
 * Deep Maroon V-Neck Knit Vest (#6d1526) + grey/white hem trim + crisp white shirt sleeves & collar
 * + slate-grey tie (#64748b) + white/maroon shield crest + black belt + slate-grey trousers (#64748b)!
 */
export const UNIFORM_PRESETS = {
  skomda_red: {
    id: 'skomda_red',
    name: 'Rompi Marun SMK Telkom',
    tag: 'Seragam Resmi Telkom',
    pattern: 'vest',
    shirtHex: '#f8fafc',  // Crisp white shirt sleeves & collar
    vestHex: '#6d1526',   // Authentic deep maroon knit vest
    pantsHex: '#64748b',  // Authentic slate-grey trousers/skirt
    tieHex: '#64748b',    // Authentic grey school tie tucked into V-neck
    useTie: true,
    badgeHex: '#f8fafc',  // White-red Telkom shield crest
  },
  putih_abu: {
    id: 'putih_abu',
    name: 'Putih Abu-Abu',
    tag: 'Seragam Nasional',
    pattern: 'solid',
    shirtHex: '#f8fafc',
    vestHex: '#f1f5f9',
    pantsHex: '#64748b',
    tieHex: '#475569',
    useTie: true,
    badgeHex: '#f59e0b',
  },
  batik_skomda: {
    id: 'batik_skomda',
    name: 'Batik SKOMDA',
    tag: 'Motif Marun-Emas',
    pattern: 'batik',
    shirtHex: '#7f1d1d',
    vestHex: '#d97706',
    pantsHex: '#111827',
    tieHex: '#f59e0b',
    useTie: false,
    badgeHex: '#fef08a',
  },
  olahraga_telkom: {
    id: 'olahraga_telkom',
    name: 'Olahraga Telkom',
    tag: 'Jersey Merah-Hitam',
    pattern: 'sport',
    shirtHex: '#dc2626',
    vestHex: '#18181b',
    pantsHex: '#0f172a',
    tieHex: '#dc2626',
    useTie: false,
    badgeHex: '#f8fafc',
  },
};

export const ASSET_IDS = [
  'pupil-standing-0bd6d5',
  'school-teacher-8b8bfc',
  'school-caretaker-b49fae',
  'student-in-a-hoodie-7c8223',
  'student-with-backpack-65d2b4',
  'schoolkid-da94c1',
  'professor-14dc4d',

  'pupil-table-1eebd1',
  'stacking-pupil-chair-738aac',
  'teacher-s-desk-381eeb',
  'teaching-board-7ba611',
  'library-shelf-run-570904',
  'wall-clock-0c555c',
  'wall-display-board-626293',
  'classroom-globe-16a96e',
  'hand-bell-cc0a37',
  'exercise-book-stack-266d9d',
  'pupil-backpack-d9b5fb',
  'floor-houseplant-8fad17',
  'potted-shrub-43bd21',
  'class-tv-trolley-2f9fa2',
  'coat-peg-rail-5e07ae',
  'tray-cubby-unit-87c1e4',
  'upright-piano-c0b0ef',
  'art-easel-078422',
  'wheeled-easel-board-6f9204',

  'locker-bank-1784b8',
  'trophy-cabinet-e963ac',
  'exit-sign-aa48ad',
  'fire-extinguisher-74d502',
  'wall-first-aid-box-95c087',
  'lab-bench-740e7b',
  'lab-stool-f405c7',
  'microscope-e7b9d5',
  'bunsen-burner-445465',
  'writing-wall-whiteboard-a3163e',
  'computer-bench-run-lit-87d9cf',
  'laptop-e775ba',

  'public-school-19ade5',
  'school-wall-module-a09ccd',
  'railing-and-gate-run-5c8137',
  'flagpole-7b7806',
  'yard-basketball-post-b71ee3',
  'ball-bin-3198fe',
  'football-goal-78fee1',
  'campus-bench-0d6036',
  'campus-lamp-post-579291',
  'cycle-shelter-714b16',
  'city-bicycle-5b67d1',
  'yellow-school-bus-0fd3b6',
  'broadleaf-oak-997c22',
  'tree-in-pit-grate-ea8010',
  'floor-target-ring-d55035',
];

const moduleCache = new Map();
let clipsModule = null;

export async function preloadPolyforkAssets(onProgress) {
  const total = ASSET_IDS.length + 1;
  let loaded = 0;
  let successCount = 0;

  const notify = (label) => {
    loaded += 1;
    if (onProgress) onProgress(loaded, total, label);
  };

  const clipsTask = import(`${POLYFORK_CDN}/clips.mjs`)
    .then((mod) => {
      clipsModule = mod;
      successCount += 1;
      notify('Mesin animasi karakter (clips.mjs)');
    })
    .catch((err) => {
      console.warn('[Polyfork] clips.mjs unavailable, using procedural fallback:', err);
      notify('Animasi cadangan siap');
    });

  const BATCH_SIZE = 8;
  for (let i = 0; i < ASSET_IDS.length; i += BATCH_SIZE) {
    const batch = ASSET_IDS.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((id) =>
        import(`${POLYFORK_CDN}/${id}.mjs`)
          .then((mod) => {
            moduleCache.set(id, mod);
            successCount += 1;
            notify(id);
          })
          .catch((err) => {
            console.warn(`[Polyfork] Failed loading ${id}, fallback mesh ready:`, err);
            moduleCache.set(id, null);
            notify(`${id} (cadangan)`);
          })
      )
    );
  }

  await clipsTask;
  return { loadedCount: successCount, total };
}

export function spawnAsset(id, params = {}) {
  const mod = moduleCache.get(id);
  let group = null;

  if (mod && typeof (mod.createAsset || mod.default) === 'function') {
    const factory = mod.createAsset || mod.default;
    try {
      group = factory(params);
    } catch {
      try {
        group = factory();
      } catch {
        group = null;
      }
    }
  }

  if (!group) {
    group = createFallbackMesh(id);
  }

  group.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  group.userData.polyforkId = id;
  return group;
}

/**
 * Applies authentic SMK Telkom maroon knit V-neck vest uniform (with white collar/sleeves,
 * grey hem stripe, black waist belt, grey tie, shield crest, & slate-grey trousers)
 * OR any user-customized uniform configuration live on the 3D student character!
 */
export function applyStudentUniform(characterGroup, presetOrConfig = 'skomda_red') {
  if (!characterGroup) return;
  const cfg =
    typeof presetOrConfig === 'string'
      ? UNIFORM_PRESETS[presetOrConfig] || UNIFORM_PRESETS.skomda_red
      : { ...UNIFORM_PRESETS.skomda_red, ...presetOrConfig };

  const shirtCol = new THREE.Color(cfg.shirtHex || '#f8fafc');
  const vestCol = new THREE.Color(cfg.vestHex || '#6d1526');
  const pantsCol = new THREE.Color(cfg.pantsHex || '#64748b');
  const trimCol = new THREE.Color(0xdbe2ea); // Light grey/white knit vest trim stripe
  const beltCol = new THREE.Color(0x111827); // Black waist belt
  const shoeCol = new THREE.Color(0x111827); // Black school shoes
  const pattern = cfg.pattern || 'vest';

  if (!characterGroup.userData.uniformBounds) {
    characterGroup.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(characterGroup);
    characterGroup.userData.uniformBounds = {
      minY: box.min.y,
      maxY: box.max.y,
      height: Math.max(0.5, box.max.y - box.min.y),
    };
  }
  const { minY, height } = characterGroup.userData.uniformBounds;

  const tmpPos = new THREE.Vector3();
  const invRoot = new THREE.Matrix4().copy(characterGroup.matrixWorld).invert();

  characterGroup.traverse((obj) => {
    if (!obj.isMesh || obj.userData.isUniformAccessory) return;
    const geom = obj.geometry;
    if (!geom || !geom.attributes.position) return;

    const posAttr = geom.attributes.position;
    const colAttr = geom.attributes.color;
    if (!colAttr) return;

    if (!geom.userData.origVertexColors) {
      geom.userData.origVertexColors = new Float32Array(colAttr.array);
    }
    const orig = geom.userData.origVertexColors;

    obj.updateMatrixWorld(true);
    const toChar = new THREE.Matrix4().multiplyMatrices(invRoot, obj.matrixWorld);

    for (let i = 0; i < posAttr.count; i++) {
      const r0 = orig[i * 3];
      const g0 = orig[i * 3 + 1];
      const b0 = orig[i * 3 + 2];

      tmpPos.fromBufferAttribute(posAttr, i).applyMatrix4(toChar);
      const normY = (tmpPos.y - minY) / height;

      // Preserve natural skin on head, neck, forearms & hands, while turning legs into full-length trousers!
      const isSkinTone = r0 > 0.52 && g0 > 0.34 && b0 > 0.18 && r0 > g0 * 1.08 && g0 > b0 * 1.08 && r0 - b0 > 0.14;
      const isForearmOrHand = Math.abs(tmpPos.x) > 0.165 && normY >= 0.34;
      if (normY > 0.78 || (isSkinTone && (normY > 0.48 || isForearmOrHand))) {
        colAttr.setXYZ(i, r0, g0, b0);
        continue;
      }

      // Black school shoes at bottom
      if (normY < 0.08) {
        colAttr.setXYZ(i, shoeCol.r, shoeCol.g, shoeCol.b);
        continue;
      }

      const lum = Math.min(1.08, Math.max(0.7, (r0 + g0 + b0) / 1.75));

      // Torso & Sleeves
      if (normY >= 0.47 && normY <= 0.78) {
        const isSleeve = Math.abs(tmpPos.x) > 0.165;
        const vOpening = Math.max(0, (normY - 0.655) * 1.05);
        const isVNeckCollar = normY > 0.675 && Math.abs(tmpPos.x) < vOpening && tmpPos.z > -0.01;
        const isVNeckTrim =
          normY > 0.645 &&
          normY <= 0.76 &&
          tmpPos.z > -0.01 &&
          Math.abs(Math.abs(tmpPos.x) - vOpening) < 0.025 &&
          Math.abs(tmpPos.x) < 0.135;
        const isHemStripe = normY >= 0.482 && normY <= 0.514 && !isSleeve;
        let targetCol = shirtCol;

        if (pattern === 'vest') {
          if (isSleeve || isVNeckCollar) targetCol = shirtCol;
          else if (isHemStripe || isVNeckTrim) targetCol = trimCol;
          else targetCol = vestCol;
        } else if (pattern === 'batik') {
          const stripe = Math.floor(tmpPos.y * 14 + tmpPos.x * 12) % 2 === 0;
          targetCol = stripe ? shirtCol : vestCol;
        } else if (pattern === 'sport') {
          targetCol = isSleeve ? vestCol : shirtCol;
        } else {
          targetCol = shirtCol;
        }

        colAttr.setXYZ(
          i,
          Math.min(1, targetCol.r * lum),
          Math.min(1, targetCol.g * lum),
          Math.min(1, targetCol.b * lum)
        );
      } else if (normY >= 0.445 && normY < 0.47 && pattern !== 'sport') {
        // Black belt band right at waist
        colAttr.setXYZ(i, beltCol.r, beltCol.g, beltCol.b);
      } else {
        // Trousers / Skirt
        colAttr.setXYZ(
          i,
          Math.min(1, pantsCol.r * lum),
          Math.min(1, pantsCol.g * lum),
          Math.min(1, pantsCol.b * lum)
        );
      }
    }
    colAttr.needsUpdate = true;
  });

  // Attach / update 3D Tie & SMK Telkom Shield Crest on chest bone
  let chestHost = null;
  characterGroup.traverse((obj) => {
    if (!chestHost && obj.name && /spine2|chest|upperchest/i.test(obj.name)) {
      chestHost = obj;
    }
  });
  const host = chestHost || characterGroup;

  if (characterGroup.userData.uniformAccessoryGroup) {
    characterGroup.userData.uniformAccessoryGroup.removeFromParent();
  }

  const acc = new THREE.Group();
  const yOff = chestHost ? 0.03 : minY + height * 0.65;
  const zOff = chestHost ? 0.118 : 0.138;

  if (pattern === 'vest') {
    // Crisp white shirt V-neck collar peeking above the knit vest
    const collarMat = new THREE.MeshStandardMaterial({ color: shirtCol, flatShading: true });
    const collarL = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.036, 0.02), collarMat);
    collarL.position.set(-0.045, yOff + 0.095, zOff - 0.004);
    collarL.rotation.z = -0.35;
    collarL.userData.isUniformAccessory = true;
    const collarR = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.036, 0.02), collarMat);
    collarR.position.set(0.045, yOff + 0.095, zOff - 0.004);
    collarR.rotation.z = 0.35;
    collarR.userData.isUniformAccessory = true;
    acc.add(collarL, collarR);
  }

  if (cfg.useTie && cfg.tieHex) {
    const tieMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.tieHex), flatShading: true });
    // Compact V-neck tie knot + blade matching the SMK Telkom reference photo
    const knot = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.025), tieMat);
    knot.position.set(0, yOff + 0.065, zOff);
    knot.userData.isUniformAccessory = true;
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14, 4), tieMat);
    blade.rotation.x = Math.PI;
    blade.position.set(0, yOff - 0.015, zOff - 0.005);
    blade.userData.isUniformAccessory = true;
    acc.add(knot, blade);
  }

  // White & Crimson Shield Crest on left chest matching the photo
  const shieldBg = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.072, 0.014),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.badgeHex || '#f8fafc'), flatShading: true })
  );
  shieldBg.position.set(0.078, yOff + 0.025, zOff);
  shieldBg.userData.isUniformAccessory = true;

  const shieldDot = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.038, 0.018),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, flatShading: true })
  );
  shieldDot.position.set(0.078, yOff + 0.025, zOff + 0.002);
  shieldDot.userData.isUniformAccessory = true;

  acc.add(shieldBg, shieldDot);
  host.add(acc);
  characterGroup.userData.uniformAccessoryGroup = acc;
}

export async function attachCharacterAnimation(characterGroup, clipNames) {
  if (!clipsModule || typeof clipsModule.animate !== 'function') {
    return createProceduralAnimator(characterGroup);
  }

  try {
    const ctrl = await clipsModule.animate(characterGroup, {
      clips: clipNames,
      base: `${POLYFORK_CDN}/`,
    });
    let activeClip = null;
    return {
      isRealRig: true,
      play(name) {
        if (!name || activeClip === name) return;
        try {
          ctrl.play(name);
          activeClip = name;
        } catch {
          // Ignore unavailable clip
        }
      },
      update(dt) {
        try {
          ctrl.update(dt);
        } catch {
          // Guard
        }
      },
    };
  } catch (err) {
    console.warn('[Polyfork] animate() fallback triggered:', err);
    return createProceduralAnimator(characterGroup);
  }
}

function createProceduralAnimator(group) {
  let state = 'Idle';
  let t = Math.random() * 6;
  const baseY = group.position.y;
  return {
    isRealRig: false,
    play(name) { state = name || 'Idle'; },
    update(dt) {
      t += dt;
      if (state === 'Walk' || state === 'Run' || state === 'Jog') {
        const speed = state === 'Run' ? 12 : 7.5;
        const amp = state === 'Run' ? 0.08 : 0.04;
        group.position.y = baseY + Math.abs(Math.sin(t * speed)) * amp;
      } else if (state === 'Dance') {
        group.position.y = baseY + Math.abs(Math.sin(t * 7)) * 0.12;
        group.rotation.z = Math.sin(t * 5) * 0.08;
      } else {
        group.position.y = baseY + Math.sin(t * 2.2) * 0.015;
        group.rotation.z *= 0.9;
      }
    },
  };
}

export function placeOnTopOf(prop, surface, offsetX = 0, offsetZ = 0) {
  surface.updateMatrixWorld(true);
  const surfaceBox = new THREE.Box3().setFromObject(surface);
  const center = new THREE.Vector3();
  surfaceBox.getCenter(center);

  prop.position.set(center.x + offsetX, 0, center.z + offsetZ);
  prop.updateMatrixWorld(true);
  const propBox = new THREE.Box3().setFromObject(prop);
  const lift = surfaceBox.max.y - propBox.min.y;
  prop.position.y += lift;
  return prop;
}

function createFallbackMesh(id) {
  const g = new THREE.Group();
  const isCharacter =
    id.includes('pupil-standing') ||
    id.includes('teacher') ||
    id.includes('caretaker') ||
    id.includes('student') ||
    id.includes('schoolkid') ||
    id.includes('professor');

  if (isCharacter) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x6d1526, flatShading: true });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf6c9a5, flatShading: true });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.0, 8), bodyMat);
    body.position.y = 0.7;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), headMat);
    head.position.y = 1.42;
    g.add(body, head);
  } else {
    const mat = new THREE.MeshStandardMaterial({ color: 0xd97706, flatShading: true });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat);
    box.position.y = 0.4;
    g.add(box);
  }
  return g;
}

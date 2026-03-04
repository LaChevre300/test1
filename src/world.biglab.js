import * as THREE from "three";
import { createProceduralTextures } from "./textures.js";

function makeRng(seed0 = 4512) {
  let seed = seed0 >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
}

function cacheWorldAabb(mesh) {
  if (!mesh.geometry) return;
  mesh.updateWorldMatrix(true, false);
  mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox.clone();
  bb.applyMatrix4(mesh.matrixWorld);
  mesh.userData.aabb = {
    minX: bb.min.x,
    maxX: bb.max.x,
    minZ: bb.min.z,
    maxZ: bb.max.z,
  };
}

function setInstance(mesh, i, position, rotY = 0, scale = 1) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0));
  const s = new THREE.Vector3(scale, scale, scale);
  m.compose(position, q, s);
  mesh.setMatrixAt(i, m);
}

function addColliderBox(group, colliders, size, position, name = "collider") {
  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.visible = false;
  group.add(mesh);
  colliders.push(mesh);
  cacheWorldAabb(mesh);
  return mesh;
}

export function createLabWorld() {
  const group = new THREE.Group();
  group.name = "bigLab";

  const colliders = [];
  const lights = [];
  const rand = makeRng(4512);

  // Dimensions globales (énorme labo)
  const half = 72; // ~144m x 144m
  const wallH = 7.2;
  const wallT = 1.0;

  const bounds = {
    minX: -half + 2,
    maxX: half - 2,
    minZ: -half + 2,
    maxZ: half - 2,
  };

  const tex = createProceduralTextures();
  tex.floorBase.repeat.set(18, 18);
  tex.floorRough.repeat.set(18, 18);
  tex.wallBase.repeat.set(10, 4);
  tex.wallRough.repeat.set(10, 4);

  // Matériaux (avec textures)
  const floorMat = new THREE.MeshStandardMaterial({
    map: tex.floorBase,
    roughnessMap: tex.floorRough,
    normalMap: tex.floorNormal,
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.02,
  });
  floorMat.normalScale.set(0.55, 0.55);
  const wallMat = new THREE.MeshStandardMaterial({
    map: tex.wallBase,
    roughnessMap: tex.wallRough,
    normalMap: tex.wallNormal,
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
  });
  wallMat.normalScale.set(0.35, 0.35);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x1b2033, roughness: 0.78, metalness: 0.06 });
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x101422, roughness: 0.85, metalness: 0.08 });
  const plasticMat = new THREE.MeshStandardMaterial({ color: 0x0c111c, roughness: 0.62, metalness: 0.12 });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x091a2a,
    emissive: 0x36d7ff,
    emissiveIntensity: 1.15,
    roughness: 0.35,
    metalness: 0.2,
  });
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0x060b12,
    emissive: 0x85e8ff,
    emissiveIntensity: 1.35,
    roughness: 0.2,
    metalness: 0.0,
  });
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x0a0e18, roughness: 0.75, metalness: 0.25 });
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.92, metalness: 0.02 });

  // Sol
  const floor = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 1, half * 2), floorMat);
  floor.position.set(0, -0.5, 0);
  floor.receiveShadow = true;
  group.add(floor);
  // Le sol ne doit pas bloquer les collisions en XZ (notre collision est 2D).

  // Murs extérieurs (collisions)
  const wallLong = (len, x, z, rotY = 0) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, wallH, wallT), wallMat);
    wall.position.set(x, wallH / 2 - 0.5, z);
    wall.rotation.y = rotY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    colliders.push(wall);
    cacheWorldAabb(wall);
  };
  wallLong(half * 2, 0, -half, 0);
  wallLong(half * 2, 0, half, 0);
  wallLong(half * 2, -half, 0, Math.PI / 2);
  wallLong(half * 2, half, 0, Math.PI / 2);

  // Plafond (dalles)
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x0b0f18, roughness: 0.98, metalness: 0.0 });
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.8, half * 2), ceilingMat);
  ceiling.position.set(0, wallH - 0.15, 0);
  ceiling.receiveShadow = true;
  group.add(ceiling);
  // Idem plafond: on ne le met pas dans les colliders, sinon “murs invisibles” en XZ.

  // Piliers (donne une vraie “pièce”)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0e1220, roughness: 0.9, metalness: 0.02 });
  const pillarGeo = new THREE.BoxGeometry(0.9, wallH - 1.0, 0.9);
  const pillars = new THREE.InstancedMesh(pillarGeo, pillarMat, 140);
  pillars.castShadow = true;
  pillars.receiveShadow = true;
  let pil = 0;
  const step = 12;
  for (let z = -half + 10; z <= half - 10; z += step) {
    for (let x = -half + 10; x <= half - 10; x += step) {
      if (pil >= pillars.count) break;
      setInstance(pillars, pil, new THREE.Vector3(x, (wallH - 1.0) / 2 - 0.5, z), 0, 1);
      pil++;
    }
  }
  group.add(pillars);
  pillars.instanceMatrix.needsUpdate = true;

  // Helper: murs intérieurs (visuel + collider)
  function addWallBox(sizeX, sizeZ, x, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sizeX, wallH - 1.2, wallT), wallMat);
    mesh.position.set(x, (wallH - 1.2) / 2 - 0.5, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    colliders.push(mesh);
    cacheWorldAabb(mesh);
    return mesh;
  }
  function addWallBoxRot(sizeX, sizeZ, x, z, rotY) {
    const geo = new THREE.BoxGeometry(sizeX, wallH - 1.2, wallT);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, (wallH - 1.2) / 2 - 0.5, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    colliders.push(mesh);
    cacheWorldAabb(mesh);
    return mesh;
  }

  // ZONES: grand open-space + salles + couloirs
  // Plan simple:
  // - Sud: entrée + couloir principal
  // - Centre: immense open-space (rangées de postes)
  // - Nord-Ouest: salle serveurs
  // - Nord-Est: salle cours
  // - Ouest: stockage

  const corridorW = 6.0;
  const openW = 70;
  const openD = 52;

  const openCenter = new THREE.Vector3(0, 0, 6);
  const openMinX = openCenter.x - openW / 2;
  const openMaxX = openCenter.x + openW / 2;
  const openMinZ = openCenter.z - openD / 2;
  const openMaxZ = openCenter.z + openD / 2;

  // Cadres de portes (visuel) au niveau de l'ouverture du couloir/open-space
  // (placé ici pour éviter l'accès à openMaxZ avant initialisation)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c101a, roughness: 0.55, metalness: 0.25 });
  const frameSide = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.2, 0.4), frameMat);
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.28, 0.4), frameMat);
  frameSide.position.set(-3.4, 1.1, openMaxZ);
  const frameSide2 = frameSide.clone();
  frameSide2.position.set(3.4, 1.1, openMaxZ);
  frameTop.position.set(0, 2.65, openMaxZ);
  group.add(frameSide, frameSide2, frameTop);

  // Encadrement open-space (murs) AVEC vraie porte vers le couloir sud
  // Nord (mur continu)
  addWallBox(openW - 10, 0, 0, openMinZ);

  // Sud (mur en 2 segments, laisse une ouverture centrée)
  const doorW = corridorW + 2.0; // un peu plus large que le couloir
  const segLen = (openW - 10 - doorW) / 2;
  // Segment gauche
  addWallBox(segLen, 0, -(doorW / 2 + segLen / 2), openMaxZ);
  // Segment droit
  addWallBox(segLen, 0, doorW / 2 + segLen / 2, openMaxZ);
  // Est/Ouest (rot)
  addWallBoxRot(openD - 14, 0, openMinX, openCenter.z, Math.PI / 2);
  addWallBoxRot(openD - 14, 0, openMaxX, openCenter.z, Math.PI / 2);

  // Couloir sud vers entrée
  const entryZ = half - 10;
  const corridorZ0 = openMaxZ;
  const corridorZ1 = entryZ;
  addWallBoxRot(corridorZ1 - corridorZ0, 0, -corridorW / 2, (corridorZ0 + corridorZ1) / 2, Math.PI / 2);
  addWallBoxRot(corridorZ1 - corridorZ0, 0, corridorW / 2, (corridorZ0 + corridorZ1) / 2, Math.PI / 2);

  // Petit “sas” d’entrée: 2 murs courts pour cadrer l’entrée du couloir
  // (On laisse une ouverture au centre au lieu d’un mur plein)
  addWallBox(3.5, 0, -4.5, entryZ);
  addWallBox(3.5, 0, 4.5, entryZ);

  // Salle serveurs (NW)
  const server = {
    minX: -half + 8,
    maxX: -18,
    minZ: -half + 8,
    maxZ: -18,
  };
  // murs de la salle (avec une porte côté sud)
  addWallBox(server.maxX - server.minX, 0, (server.minX + server.maxX) / 2, server.minZ);
  addWallBox(server.maxX - server.minX - 10, 0, (server.minX + server.maxX) / 2 + 5, server.maxZ); // porte à gauche
  addWallBoxRot(server.maxZ - server.minZ, 0, server.minX, (server.minZ + server.maxZ) / 2, Math.PI / 2);
  addWallBoxRot(server.maxZ - server.minZ, 0, server.maxX, (server.minZ + server.maxZ) / 2, Math.PI / 2);

  // Salle cours (NE)
  const classroom = {
    minX: 18,
    maxX: half - 8,
    minZ: -half + 8,
    maxZ: -18,
  };
  addWallBox(classroom.maxX - classroom.minX, 0, (classroom.minX + classroom.maxX) / 2, classroom.minZ);
  addWallBox(classroom.maxX - classroom.minX - 10, 0, (classroom.minX + classroom.maxX) / 2 - 5, classroom.maxZ);
  addWallBoxRot(classroom.maxZ - classroom.minZ, 0, classroom.minX, (classroom.minZ + classroom.maxZ) / 2, Math.PI / 2);
  addWallBoxRot(classroom.maxZ - classroom.minZ, 0, classroom.maxX, (classroom.minZ + classroom.maxZ) / 2, Math.PI / 2);

  // Cloison vitrée côté sud de la salle de cours (plus “réaliste”)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbfd6ff,
    roughness: 0.06,
    metalness: 0.0,
    transmission: 0.92,
    thickness: 0.25,
    ior: 1.45,
    transparent: true,
    opacity: 0.95,
  });
  const glassW = (classroom.maxX - classroom.minX) - 16;
  const glassH = 3.1;
  const glassT = 0.1;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, glassT), glassMat);
  glass.position.set((classroom.minX + classroom.maxX) / 2, 1.35, classroom.maxZ + 0.55);
  glass.castShadow = false;
  glass.receiveShadow = true;
  group.add(glass);
  // collision fine: même dimensions que le verre (évite murs invisibles)
  addColliderBox(group, colliders, new THREE.Vector3(glassW, glassH, glassT + 0.25), glass.position.clone(), "glassWallCollider");

  // Signalétique (panneaux)
  const signTex = (() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext("2d", { alpha: true });
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgba(10,14,22,0.9)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "rgba(160,210,255,0.35)";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, c.width - 20, c.height - 20);
    ctx.fillStyle = "rgba(210,240,255,0.92)";
    ctx.font = "700 54px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("SALLE DE COURS", 42, 106);
    ctx.font = "600 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillStyle = "rgba(210,240,255,0.78)";
    ctx.fillText("Accès réservé", 42, 160);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  })();
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, transparent: true, roughness: 0.6, metalness: 0.1 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), signMat);
  sign.position.set(classroom.minX + 4.4, 2.6, classroom.maxZ + 1.2);
  sign.rotation.y = Math.PI;
  group.add(sign);

  // Stockage (W)
  const storage = {
    minX: -half + 8,
    maxX: -20,
    minZ: 18,
    maxZ: half - 8,
  };
  addWallBox(storage.maxX - storage.minX, 0, (storage.minX + storage.maxX) / 2, storage.minZ);
  addWallBox(storage.maxX - storage.minX - 10, 0, (storage.minX + storage.maxX) / 2 + 5, storage.maxZ);
  addWallBoxRot(storage.maxZ - storage.minZ, 0, storage.minX, (storage.minZ + storage.maxZ) / 2, Math.PI / 2);
  addWallBoxRot(storage.maxZ - storage.minZ, 0, storage.maxX, (storage.minZ + storage.maxZ) / 2, Math.PI / 2);

  // --- Remplissage massif (InstancedMesh) ---
  // Géométries simples, mais beaucoup d’instances.
  const deskGeo = new THREE.BoxGeometry(2.2, 0.85, 1.2);
  const chairSeatGeo = new THREE.BoxGeometry(0.55, 0.08, 0.55);
  const chairBackGeo = new THREE.BoxGeometry(0.55, 0.65, 0.08);
  const pcGeo = new THREE.BoxGeometry(0.32, 0.55, 0.45);
  const screenGeo = new THREE.BoxGeometry(0.65, 0.42, 0.06);
  const kbGeo = new THREE.BoxGeometry(0.55, 0.05, 0.18);
  const rackGeo = new THREE.BoxGeometry(1.15, 3.25, 1.15);
  const boxGeo = new THREE.BoxGeometry(0.9, 0.55, 0.7);
  const neonGeo = new THREE.BoxGeometry(1.6, 0.12, 0.22);

  // Compteurs pour pré-allouer
  const deskCount = 260;
  const chairCount = 260;
  const pcCount = 260;
  const screenCount = 260;
  const kbCount = 260;
  const rackCount = 64;
  const boxCount = 90;
  const neonCount = 72;

  const desks = new THREE.InstancedMesh(deskGeo, deskMat, deskCount);
  desks.castShadow = false;
  desks.receiveShadow = true;

  const chairsSeat = new THREE.InstancedMesh(chairSeatGeo, chairMat, chairCount);
  chairsSeat.castShadow = false;
  chairsSeat.receiveShadow = true;
  const chairsBack = new THREE.InstancedMesh(chairBackGeo, chairMat, chairCount);
  chairsBack.castShadow = false;
  chairsBack.receiveShadow = true;

  const pcs = new THREE.InstancedMesh(pcGeo, plasticMat, pcCount);
  pcs.castShadow = false;
  pcs.receiveShadow = true;
  const screens = new THREE.InstancedMesh(screenGeo, screenMat, screenCount);
  screens.castShadow = false;
  const keyboards = new THREE.InstancedMesh(kbGeo, plasticMat, kbCount);
  keyboards.castShadow = false;
  keyboards.receiveShadow = true;

  const racks = new THREE.InstancedMesh(rackGeo, rackMat, rackCount);
  racks.castShadow = false;
  racks.receiveShadow = true;

  const boxes = new THREE.InstancedMesh(boxGeo, boxMat, boxCount);
  boxes.castShadow = false;
  boxes.receiveShadow = true;

  const neons = new THREE.InstancedMesh(neonGeo, neonMat, neonCount);
  neons.castShadow = false;

  // Placement open-space: rangées de postes
  let di = 0;
  let ci = 0;
  let pi = 0;
  let si = 0;
  let ki = 0;

  const rowCount = 10;
  const colCount = 13;
  const spacingX = 5.0;
  const spacingZ = 3.8;

  for (let rz = 0; rz < rowCount; rz++) {
    for (let rx = 0; rx < colCount; rx++) {
      if (di >= deskCount) break;
      // Positions stables (pas de jitter) => collisions plus cohérentes.
      const x = openMinX + 6 + rx * spacingX;
      const z = openMinZ + 5 + rz * spacingZ;
      const rot = rz % 2 === 0 ? 0 : Math.PI;

      const deskPos = new THREE.Vector3(x, 0.42, z);
      setInstance(desks, di, deskPos, rot, 1);

      // chaise (derrière)
      const chairPos = new THREE.Vector3(x, 0.26, z + (rot === 0 ? 0.95 : -0.95));
      setInstance(chairsSeat, ci, chairPos, rot, 1);
      const backPos = chairPos.clone().add(new THREE.Vector3(0, 0.34, rot === 0 ? 0.26 : -0.26));
      setInstance(chairsBack, ci, backPos, rot, 1);

      // PC tour + écran + clavier
      const pcPos = new THREE.Vector3(x + (rot === 0 ? 0.85 : -0.85), 0.73, z);
      setInstance(pcs, pi, pcPos, rot, 1);
      const screenPos = new THREE.Vector3(x - (rot === 0 ? 0.05 : -0.05), 1.02, z - (rot === 0 ? 0.44 : -0.44));
      setInstance(screens, si, screenPos, rot, 1);
      const kbPos = new THREE.Vector3(x, 0.88, z - (rot === 0 ? 0.10 : -0.10));
      setInstance(keyboards, ki, kbPos, rot, 1);

      di++;
      ci++;
      pi++;
      si++;
      ki++;
    }
  }

  // Colliders: au lieu de “gros murs invisibles” par rangée, on met des segments alignés avec les bureaux.
  // (On garde peu de colliders pour rester fluide.)
  // Colliders un peu plus petits que l’emprise visuelle => évite les “coins” qui bloquent.
  const blockWidth = spacingX * 2 - 1.6; // couvre 2 bureaux mais laisse des marges
  const blockDepth = 1.35;
  for (let rz = 0; rz < rowCount; rz++) {
    const z = openMinZ + 5 + rz * spacingZ;
    for (let rx = 0; rx < colCount; rx += 2) {
      const x = openMinX + 6 + rx * spacingX;
      addColliderBox(
        group,
        colliders,
        new THREE.Vector3(blockWidth, 1.55, blockDepth),
        new THREE.Vector3(x + spacingX * 0.5, 0.78, z),
        "deskBlockCollider"
      );
    }
  }

  // Salle cours: rangées plus serrées
  for (let rz = 0; rz < 6 && di < deskCount; rz++) {
    for (let rx = 0; rx < 8 && di < deskCount; rx++) {
      const x = classroom.minX + 7 + rx * 4.2;
      const z = classroom.minZ + 8 + rz * 3.4;
      const rot = 0;
      setInstance(desks, di, new THREE.Vector3(x, 0.42, z), rot, 1);
      setInstance(chairsSeat, ci, new THREE.Vector3(x, 0.26, z + 0.95), rot, 1);
      setInstance(chairsBack, ci, new THREE.Vector3(x, 0.60, z + 1.21), rot, 1);
      setInstance(pcs, pi, new THREE.Vector3(x + 0.85, 0.73, z), rot, 1);
      setInstance(screens, si, new THREE.Vector3(x, 1.02, z - 0.44), rot, 1);
      setInstance(keyboards, ki, new THREE.Vector3(x, 0.88, z - 0.1), rot, 1);
      di++;
      ci++;
      pi++;
      si++;
      ki++;
    }
  }
  // Colliders salle de cours: segments (2 bureaux) alignés
  const classSpacingX = 4.2;
  const classSpacingZ = 3.4;
  for (let rz = 0; rz < 6; rz++) {
    const z = classroom.minZ + 8 + rz * classSpacingZ;
    for (let rx = 0; rx < 8; rx += 2) {
      const x = classroom.minX + 7 + rx * classSpacingX;
      addColliderBox(
        group,
        colliders,
        new THREE.Vector3(classSpacingX * 2 - 1.6, 1.55, blockDepth),
        new THREE.Vector3(x + classSpacingX * 0.5, 0.78, z),
        "classDeskBlockCollider"
      );
    }
  }

  // Salle serveurs: racks alignés
  let ri = 0;
  const rackRows = 4;
  const rackCols = 6;
  for (let rz = 0; rz < rackRows; rz++) {
    for (let rx = 0; rx < rackCols; rx++) {
      if (ri >= rackCount) break;
      const x = server.minX + 7 + rx * 3.1;
      const z = server.minZ + 7 + rz * 3.8;
      setInstance(racks, ri, new THREE.Vector3(x, 1.62, z), Math.PI / 2, 1);
      ri++;
    }
  }
  // Collider racks rows (gros blocs)
  for (let rz = 0; rz < rackRows; rz++) {
    const z = server.minZ + 7 + rz * 3.8;
    addColliderBox(group, colliders, new THREE.Vector3(20, 3.5, 1.6), new THREE.Vector3(server.minX + 16, 1.6, z), "rackRowCollider");
  }

  // Stockage: cartons empilés
  let bi = 0;
  for (let i = 0; i < boxCount; i++) {
    const x = storage.minX + 6 + rand() * (storage.maxX - storage.minX - 12);
    const z = storage.minZ + 6 + rand() * (storage.maxZ - storage.minZ - 12);
    const y = 0.28 + (rand() > 0.8 ? 0.55 : 0);
    setInstance(boxes, bi, new THREE.Vector3(x, y, z), rand() * Math.PI * 2, 1);
    bi++;
  }
  // Collider stockage: quelques piles (rare)
  for (let i = 0; i < 14; i++) {
    const x = storage.minX + 8 + rand() * (storage.maxX - storage.minX - 16);
    const z = storage.minZ + 8 + rand() * (storage.maxZ - storage.minZ - 16);
    addColliderBox(group, colliders, new THREE.Vector3(2.4, 1.6, 2.4), new THREE.Vector3(x, 0.8, z), "boxPileCollider");
  }

  // Néons plafond (visuels) + lumières
  let ni = 0;
  const neonGrid = 12;
  for (let gz = 0; gz < neonGrid; gz++) {
    for (let gx = 0; gx < neonGrid; gx++) {
      if (ni >= neonCount) break;
      const x = -half + 10 + gx * ((half * 2 - 20) / (neonGrid - 1));
      const z = -half + 10 + gz * ((half * 2 - 20) / (neonGrid - 1));
      if (rand() < 0.45) continue;
      setInstance(neons, ni, new THREE.Vector3(x, wallH - 0.75, z), rand() > 0.5 ? 0 : Math.PI / 2, 1);
      ni++;
    }
  }

  // Panneaux lumineux (plafonniers) visibles, plus crédibles que des points “flottants”
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x060a10, emissive: 0xbfefff, emissiveIntensity: 1.45, roughness: 0.2, metalness: 0.0 });
  const panelGeo = new THREE.BoxGeometry(1.8, 0.08, 1.0);
  const panels = new THREE.InstancedMesh(panelGeo, panelMat, 96);
  let pa = 0;
  for (let i = 0; i < 96; i++) {
    const x = openMinX + 8 + Math.floor(i % 12) * ((openW - 16) / 11);
    const z = openMinZ + 8 + Math.floor(i / 12) * ((openD - 16) / 7);
    if (rand() < 0.18) continue;
    if (pa >= panels.count) break;
    setInstance(panels, pa, new THREE.Vector3(x, wallH - 0.85, z), rand() > 0.5 ? 0 : Math.PI / 2, 1);
    // Les panneaux sont émissifs: on évite de créer une light par panneau (très cher).
    pa++;
  }
  group.add(panels);
  panels.instanceMatrix.needsUpdate = true;

  // Place a bunch of lights (sans que ça devienne une guirlande)
  const mkLight = (x, z, color, intensity, dist) => {
    const l = new THREE.PointLight(color, intensity, dist, 2.0);
    l.position.set(x, wallH - 2.0, z);
    l.castShadow = false;
    lights.push(l);
    return l;
  };

  // Quelques lights seulement (trop de point lights = très cher en forward rendering)
  for (let i = 0; i < 8; i++) {
    const x = openMinX + 6 + rand() * (openMaxX - openMinX - 12);
    const z = openMinZ + 6 + rand() * (openMaxZ - openMinZ - 12);
    mkLight(x, z, 0xbdd9ff, 1.25 + rand() * 0.55, 20);
  }
  // Hallway (flicker)
  const flickerLight = mkLight(0, (corridorZ0 + corridorZ1) / 2, 0xbdd9ff, 2.6, 22);
  flickerLight.userData.flicker = true;

  // Emergency red in server room
  const red = mkLight(server.minX + 10, server.minZ + 10, 0xff2233, 1.35, 16);
  red.position.y = wallH - 3.0;

  // Dog waypoints: couloir + zones clés
  const waypoints = [
    new THREE.Vector3(0, 0, openMaxZ - 2),
    new THREE.Vector3(0, 0, openCenter.z),
    new THREE.Vector3(openMinX + 8, 0, openCenter.z),
    new THREE.Vector3(openMaxX - 8, 0, openCenter.z),
    new THREE.Vector3(server.maxX + 4, 0, server.maxZ + 6),
    new THREE.Vector3(server.minX + 10, 0, server.minZ + 10),
    new THREE.Vector3(classroom.minX + 12, 0, classroom.maxZ + 6),
    new THREE.Vector3(classroom.maxX - 12, 0, classroom.minZ + 12),
    new THREE.Vector3(storage.maxX + 4, 0, storage.minZ + 10),
    new THREE.Vector3(storage.minX + 10, 0, storage.maxZ - 10),
  ];
  // Ajoute des points aléatoires dans l’open-space (pour qu’il tourne)
  for (let i = 0; i < 16; i++) {
    waypoints.push(
      new THREE.Vector3(
        openMinX + 8 + rand() * (openMaxX - openMinX - 16),
        0,
        openMinZ + 8 + rand() * (openMaxZ - openMinZ - 16)
      )
    );
  }

  // Player/dog spawns
  // Spawn directement dans le labo (pas dans une zone vide), proche des premières rangées.
  const playerStart = new THREE.Vector3(0, 1.7, openMaxZ - 6);
  const dogStart = new THREE.Vector3(server.minX + 10, 0.55, server.minZ + 10);

  // Ajoute tout au groupe
  group.add(desks, chairsSeat, chairsBack, pcs, screens, keyboards, racks, boxes, neons);
  desks.instanceMatrix.needsUpdate = true;
  chairsSeat.instanceMatrix.needsUpdate = true;
  chairsBack.instanceMatrix.needsUpdate = true;
  pcs.instanceMatrix.needsUpdate = true;
  screens.instanceMatrix.needsUpdate = true;
  keyboards.instanceMatrix.needsUpdate = true;
  racks.instanceMatrix.needsUpdate = true;
  boxes.instanceMatrix.needsUpdate = true;
  neons.instanceMatrix.needsUpdate = true;

  return { group, colliders, lights, waypoints, playerStart, dogStart, flickerLight, bounds };
}


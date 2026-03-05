import * as THREE from "three";

export function createLabWorld() {
  const group = new THREE.Group();
  group.name = "lab";

  const colliders = [];
  const lights = [];

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 0.95, metalness: 0.0 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x171b2a, roughness: 0.92, metalness: 0.0 });
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x1b1f2e, roughness: 0.8, metalness: 0.05 });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0a2a3f,
    emissive: 0x2ad6ff,
    emissiveIntensity: 0.85,
    roughness: 0.35,
    metalness: 0.15,
  });
  const stripMat = new THREE.MeshStandardMaterial({
    color: 0x071019,
    emissive: 0x6fe0ff,
    emissiveIntensity: 1.15,
    roughness: 0.25,
    metalness: 0.05,
  });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40), floorMat);
  floor.position.set(0, -0.5, 0);
  floor.receiveShadow = true;
  group.add(floor);
  colliders.push(floor);

  // Outer walls
  const wallT = 1;
  const wallH = 6;
  const wallLong = (len, x, z, rotY = 0) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, wallH, wallT), wallMat);
    wall.position.set(x, wallH / 2 - 0.5, z);
    wall.rotation.y = rotY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
    colliders.push(wall);
  };
  wallLong(40, 0, -20, 0);
  wallLong(40, 0, 20, 0);
  wallLong(40, -20, 0, Math.PI / 2);
  wallLong(40, 20, 0, Math.PI / 2);

  // --- Labyrinthe (intérieur) ---
  // Grille 10x10 cellules, couloirs ~2m, murs ~0.55m
  const cols = 10;
  const rows = 10;
  const cell = 3.2;
  const wallThickness = 0.55;
  const wallHeight = 4.4;
  const originX = -((cols * cell) / 2) + cell / 2;
  const originZ = -((rows * cell) / 2) + cell / 2;

  // RNG déterministe (pour que le labyrinthe soit stable)
  let seed = 4512;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const idx = (x, y) => y * cols + x;
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows;

  const cells = Array.from({ length: cols * rows }, () => ({
    v: false,
    wN: true,
    wE: true,
    wS: true,
    wW: true,
  }));

  // DFS carve
  const stack = [];
  const startX = Math.floor(rand() * cols);
  const startY = Math.floor(rand() * rows);
  cells[idx(startX, startY)].v = true;
  stack.push([startX, startY]);

  const dirs = [
    { dx: 0, dy: -1, a: "wN", b: "wS" },
    { dx: 1, dy: 0, a: "wE", b: "wW" },
    { dx: 0, dy: 1, a: "wS", b: "wN" },
    { dx: -1, dy: 0, a: "wW", b: "wE" },
  ];

  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const here = cells[idx(cx, cy)];
    const choices = [];
    for (const d of dirs) {
      const nx = cx + d.dx;
      const ny = cy + d.dy;
      if (!inBounds(nx, ny)) continue;
      const n = cells[idx(nx, ny)];
      if (!n.v) choices.push({ nx, ny, d });
    }
    if (!choices.length) {
      stack.pop();
      continue;
    }
    const pick = choices[Math.floor(rand() * choices.length)];
    here[pick.d.a] = false;
    const next = cells[idx(pick.nx, pick.ny)];
    next[pick.d.b] = false;
    next.v = true;
    stack.push([pick.nx, pick.ny]);
  }

  // Extra ouvertures (un peu moins “parfait”)
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(rand() * cols);
    const y = Math.floor(rand() * rows);
    const d = dirs[Math.floor(rand() * dirs.length)];
    const nx = x + d.dx;
    const ny = y + d.dy;
    if (!inBounds(nx, ny)) continue;
    cells[idx(x, y)][d.a] = false;
    cells[idx(nx, ny)][d.b] = false;
  }

  // Build walls
  const wallMat2 = wallMat;
  const wallLongGeo = new THREE.BoxGeometry(cell + wallThickness, wallHeight, wallThickness);
  const wallShortGeo = new THREE.BoxGeometry(wallThickness, wallHeight, cell + wallThickness);

  function cellCenter(x, y) {
    return new THREE.Vector3(originX + x * cell, 0, originZ + y * cell);
  }

  function addWall(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    colliders.push(mesh);
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = cells[idx(x, y)];
      const base = cellCenter(x, y);
      const yPos = wallHeight / 2 - 0.5;

      // North wall
      if (c.wN) {
        const w = new THREE.Mesh(wallLongGeo, wallMat2);
        w.position.set(base.x, yPos, base.z - cell / 2);
        addWall(w);
      }
      // South wall (only on last row to avoid duplicates)
      if (y === rows - 1 && c.wS) {
        const w = new THREE.Mesh(wallLongGeo, wallMat2);
        w.position.set(base.x, yPos, base.z + cell / 2);
        addWall(w);
      }
      // West wall
      if (c.wW) {
        const w = new THREE.Mesh(wallShortGeo, wallMat2);
        w.position.set(base.x - cell / 2, yPos, base.z);
        addWall(w);
      }
      // East wall (only on last col)
      if (x === cols - 1 && c.wE) {
        const w = new THREE.Mesh(wallShortGeo, wallMat2);
        w.position.set(base.x + cell / 2, yPos, base.z);
        addWall(w);
      }

      // Bande lumineuse murale (donne des repères visuels)
      if (rand() > 0.72) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 1.3), stripMat);
        const side = rand() > 0.5 ? 1 : -1;
        strip.position.set(base.x + side * (cell / 2 - 0.25), 1.7, base.z + (rand() - 0.5) * 0.9);
        group.add(strip);
      }
    }
  }

  // Desks + computers
  const deskGeo = new THREE.BoxGeometry(3.2, 1.0, 1.6);
  const pcBaseGeo = new THREE.BoxGeometry(0.8, 0.6, 0.9);
  const screenGeo = new THREE.BoxGeometry(0.9, 0.55, 0.08);
  const keyboardGeo = new THREE.BoxGeometry(0.9, 0.08, 0.28);

  function addDesk(x, z, rotY = 0, screenOn = true) {
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(x, 0.5, z);
    desk.rotation.y = rotY;
    desk.castShadow = true;
    desk.receiveShadow = true;
    group.add(desk);
    colliders.push(desk);

    const pc = new THREE.Mesh(pcBaseGeo, deskMat);
    pc.position.set(x + Math.sin(rotY) * 0.4, 1.0, z + Math.cos(rotY) * 0.4);
    pc.rotation.y = rotY;
    pc.castShadow = true;
    group.add(pc);
    colliders.push(pc);

    const screen = new THREE.Mesh(screenGeo, screenOn ? screenMat : deskMat);
    screen.position.set(x - Math.sin(rotY) * 0.1, 1.25, z - Math.cos(rotY) * 0.55);
    screen.rotation.y = rotY;
    screen.castShadow = false;
    group.add(screen);

    const keyboard = new THREE.Mesh(keyboardGeo, deskMat);
    keyboard.position.set(x - Math.sin(rotY) * 0.05, 1.05, z - Math.cos(rotY) * 0.25);
    keyboard.rotation.y = rotY;
    keyboard.castShadow = true;
    group.add(keyboard);
    colliders.push(keyboard);
  }

  // Quelques desks placés dans des cellules “larges” (sans bloquer totalement)
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(rand() * cols);
    const y = Math.floor(rand() * rows);
    const base = cellCenter(x, y);
    const rotY = rand() > 0.5 ? 0 : Math.PI / 2;
    const dx = (rand() - 0.5) * 0.6;
    const dz = (rand() - 0.5) * 0.6;
    addDesk(base.x + dx, base.z + dz, rotY, rand() > 0.22);
  }

  // Server racks
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x0c0f18, roughness: 0.8, metalness: 0.2 });
  const rackGeo = new THREE.BoxGeometry(1.2, 3.2, 1.2);
  for (let i = 0; i < 5; i++) {
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(-18 + i * 2.2, 1.6, 2.0);
    rack.castShadow = true;
    rack.receiveShadow = true;
    group.add(rack);
    colliders.push(rack);
  }

  // Ceiling lights
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(40, 0.8, 40), new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: 1.0 }));
  ceiling.position.set(0, wallH - 0.1, 0);
  ceiling.receiveShadow = true;
  group.add(ceiling);
  colliders.push(ceiling);

  const rectAreaLight = (x, z, intensity = 3.0) => {
    const light = new THREE.PointLight(0xbdd9ff, intensity, 18, 2.0);
    light.position.set(x, 4.6, z);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    group.add(light);
    lights.push(light);
    return light;
  };

  // Plafonniers plus forts + quelques lights du labyrinthe
  rectAreaLight(-10, -10, 3.6);
  rectAreaLight(10, -10, 3.1);
  rectAreaLight(-10, 10, 3.4);
  rectAreaLight(10, 10, 3.0);
  const flicker = rectAreaLight(0, 0, 3.2);
  flicker.userData.flicker = true;

  // Small red emergency light
  const red = new THREE.PointLight(0xff2233, 1.35, 14, 2.0);
  red.position.set(0, 3.2, -18);
  group.add(red);
  lights.push(red);

  for (let i = 0; i < 10; i++) {
    const x = Math.floor(rand() * cols);
    const y = Math.floor(rand() * rows);
    const p = cellCenter(x, y);
    const l = new THREE.PointLight(0x9fd2ff, 1.25 + rand() * 0.7, 10, 2.4);
    l.position.set(p.x, 3.6 + rand() * 0.3, p.z);
    l.castShadow = false;
    group.add(l);
    lights.push(l);
  }

  // Spawn points / waypoints for dog
  // Waypoints = centres de cellules (shuffle déterministe + échantillonnage)
  const allCenters = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) allCenters.push(cellCenter(x, y));
  for (let i = allCenters.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [allCenters[i], allCenters[j]] = [allCenters[j], allCenters[i]];
  }
  const waypoints = allCenters.slice(0, 18).map((v) => new THREE.Vector3(v.x, 0, v.z));

  // Spawn: deux coins opposés du labyrinthe (simple, mais efficace)
  const playerCell = { x: cols - 1, y: rows - 1 };
  const dogCell = { x: 0, y: 0 };
  const p0 = cellCenter(playerCell.x, playerCell.y);
  const p1 = cellCenter(dogCell.x, dogCell.y);
  const playerStart = new THREE.Vector3(p0.x, 1.7, p0.z);
  const dogStart = new THREE.Vector3(p1.x, 0.55, p1.z);

  return { group, colliders, lights, waypoints, playerStart, dogStart, flickerLight: flicker };
}


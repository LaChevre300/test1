import * as THREE from "three";

export function createLabWorld() {
  const group = new THREE.Group();
  group.name = "lab";

  const colliders = [];
  const lights = [];

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b0d14, roughness: 0.98, metalness: 0.0 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x141a26, roughness: 0.92, metalness: 0.02 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: 1.0, metalness: 0.0 });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40), floorMat);
  floor.position.set(0, -0.5, 0);
  floor.receiveShadow = true;
  group.add(floor);

  const wallH = 4.8;

  // Ceiling (keeps the space readable and catches light)
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(40, 0.9, 40), ceilMat);
  ceiling.position.set(0, wallH + 0.4, 0);
  ceiling.receiveShadow = true;
  group.add(ceiling);

  // Deterministic PRNG (so the maze stays the same for everyone)
  function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(4512);

  // Maze generation on a grid of blocks.
  // 1 = wall block, 0 = empty/passage
  const gw = 21;
  const gh = 21;
  const grid = Array.from({ length: gh }, () => Array(gw).fill(1));
  for (let y = 1; y < gh; y += 2) {
    for (let x = 1; x < gw; x += 2) {
      grid[y][x] = 0;
    }
  }

  const dirs = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];

  function shuffleInPlace(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const stack = [[1, 1]];
  const visited = new Set(["1,1"]);
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const options = [];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx <= 0 || ny <= 0 || nx >= gw - 1 || ny >= gh - 1) continue;
      if (grid[ny][nx] !== 0) continue;
      const key = `${nx},${ny}`;
      if (!visited.has(key)) options.push([nx, ny, dx, dy]);
    }

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    shuffleInPlace(options);
    const [nx, ny, dx, dy] = options[0];
    // Carve the wall between (cx,cy) and (nx,ny)
    grid[cy + dy / 2][cx + dx / 2] = 0;
    visited.add(`${nx},${ny}`);
    stack.push([nx, ny]);
  }

  // Entrance / exit openings
  grid[1][0] = 0;
  grid[gh - 2][gw - 1] = 0;

  // Convert grid to world meshes
  const cellSize = 1.75; // fits inside the 40x40 floor nicely
  const originX = -((gw - 1) * cellSize) / 2;
  const originZ = -((gh - 1) * cellSize) / 2;

  const wallGeo = new THREE.BoxGeometry(cellSize, wallH, cellSize);

  function cellToWorld(x, y) {
    return new THREE.Vector3(originX + x * cellSize, 0, originZ + y * cellSize);
  }

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      if (grid[y][x] !== 1) continue;
      const p = cellToWorld(x, y);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(p.x, wallH / 2 - 0.5, p.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      group.add(wall);
      colliders.push(wall);
    }
  }

  // Lights: spaced ceiling lights + one flicker + one red emergency near exit.
  const mazeLight = (x, z, intensity = 3.2) => {
    const light = new THREE.PointLight(0xcfe6ff, intensity, 14, 2.0);
    light.position.set(x, wallH + 0.05, z);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    lights.push(light);
    return light;
  };

  // Drop lights along corridors by sampling passage cells.
  const lightCells = [];
  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      if (grid[y][x] !== 0) continue;
      // keep some spacing
      if ((x + y) % 4 !== 0) continue;
      lightCells.push([x, y]);
    }
  }
  shuffleInPlace(lightCells);
  for (let i = 0; i < Math.min(28, lightCells.length); i++) {
    const [x, y] = lightCells[i];
    const p = cellToWorld(x, y);
    const l = mazeLight(p.x, p.z, 3.0);
    group.add(l);
  }

  const flickerCell = lightCells[Math.min(3, lightCells.length - 1)] || [Math.floor(gw / 2), Math.floor(gh / 2)];
  const flickerPos = cellToWorld(flickerCell[0], flickerCell[1]);
  const flicker = mazeLight(flickerPos.x, flickerPos.z, 3.1);
  flicker.userData.flicker = true;
  group.add(flicker);

  const exitPos = cellToWorld(gw - 1, gh - 2);
  const red = new THREE.PointLight(0xff2a3a, 1.8, 14, 2.2);
  red.position.set(exitPos.x, wallH - 0.4, exitPos.z);
  group.add(red);
  lights.push(red);

  // Spawn points / dog waypoints
  const playerStartCell = [1, 1];
  const dogStartCell = [gw - 2, gh - 2];
  const playerStart = cellToWorld(playerStartCell[0], playerStartCell[1]).setY(1.7);
  const dogStart = cellToWorld(dogStartCell[0], dogStartCell[1]).setY(0.55);

  const waypoints = [];
  const wpCells = [];
  for (let y = 1; y < gh - 1; y += 2) {
    for (let x = 1; x < gw - 1; x += 2) {
      if (grid[y][x] !== 0) continue;
      if ((x * 7 + y * 11) % 5 !== 0) continue;
      wpCells.push([x, y]);
    }
  }
  shuffleInPlace(wpCells);
  for (let i = 0; i < Math.min(10, wpCells.length); i++) {
    const p = cellToWorld(wpCells[i][0], wpCells[i][1]);
    waypoints.push(p.setY(0.55));
  }
  if (waypoints.length < 4) {
    waypoints.push(cellToWorld(1, 1).setY(0.55), cellToWorld(gw - 2, 1).setY(0.55), cellToWorld(gw - 2, gh - 2).setY(0.55), cellToWorld(1, gh - 2).setY(0.55));
  }

  return { group, colliders, lights, waypoints, playerStart, dogStart, flickerLight: flicker };
}


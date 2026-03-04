import * as THREE from "three";

export function createLabWorld() {
  const group = new THREE.Group();
  group.name = "lab";

  const colliders = [];
  const lights = [];

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 0.95, metalness: 0.0 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x141722, roughness: 0.9, metalness: 0.0 });
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x1b1f2e, roughness: 0.8, metalness: 0.05 });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0a2a3f,
    emissive: 0x2ad6ff,
    emissiveIntensity: 0.6,
    roughness: 0.35,
    metalness: 0.15,
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

  // Interior corridor walls
  wallLong(26, 0, -6, 0);
  wallLong(26, 0, 6, 0);
  wallLong(12, -7, 0, Math.PI / 2);
  wallLong(12, 7, 0, Math.PI / 2);

  // Door gaps: we just place short wall segments, leaving openings.
  wallLong(8, -12, -6, 0);
  wallLong(8, 12, 6, 0);
  wallLong(8, -12, 6, 0);
  wallLong(8, 12, -6, 0);

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

  const deskRows = [
    { x0: -16, z: -14, rotY: 0 },
    { x0: -16, z: -10, rotY: 0 },
    { x0: 16, z: 14, rotY: Math.PI },
    { x0: 16, z: 10, rotY: Math.PI },
  ];

  for (const r of deskRows) {
    for (let i = 0; i < 3; i++) {
      addDesk(r.x0 + i * 6.0 * (r.rotY === Math.PI ? -1 : 1), r.z, r.rotY, Math.random() > 0.25);
    }
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
    const light = new THREE.PointLight(0xbdd9ff, intensity, 16, 2.2);
    light.position.set(x, 4.6, z);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    group.add(light);
    lights.push(light);
    return light;
  };

  rectAreaLight(-10, -10, 2.4);
  rectAreaLight(10, -10, 2.0);
  rectAreaLight(-10, 10, 2.2);
  rectAreaLight(10, 10, 2.0);
  const flicker = rectAreaLight(0, 0, 2.3);
  flicker.userData.flicker = true;

  // Small red emergency light
  const red = new THREE.PointLight(0xff2233, 1.0, 12, 2.0);
  red.position.set(0, 3.2, -18);
  group.add(red);
  lights.push(red);

  // Spawn points / waypoints for dog
  const waypoints = [
    new THREE.Vector3(-14, 0, -2),
    new THREE.Vector3(-4, 0, -2),
    new THREE.Vector3(4, 0, -2),
    new THREE.Vector3(14, 0, -2),
    new THREE.Vector3(14, 0, 2),
    new THREE.Vector3(4, 0, 2),
    new THREE.Vector3(-4, 0, 2),
    new THREE.Vector3(-14, 0, 2),
  ];

  const playerStart = new THREE.Vector3(0, 1.7, 14);
  const dogStart = new THREE.Vector3(-16, 0.55, -14);

  return { group, colliders, lights, waypoints, playerStart, dogStart, flickerLight: flicker };
}


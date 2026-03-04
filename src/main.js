import "./style.css";
import * as THREE from "three";
import { createPointerLockControls } from "./controls.js";
import { createLabWorld } from "./world.biglab.js";
import { createDogMonster } from "./dog.js";
import { createUI } from "./ui.js";
import { createAudio } from "./audio.js";

const root = document.querySelector("#app");
const ui = createUI(root);
const audio = createAudio();

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070914);
// Le labo est beaucoup plus grand maintenant: on recule le fog pour ne pas “cacher” tout le décor.
scene.fog = new THREE.Fog(0x070914, 10, 160);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 220);
camera.position.set(0, 1.7, 14);

const controls = createPointerLockControls(camera, renderer.domElement);

// Lighting baseline
scene.add(new THREE.HemisphereLight(0x9fbfff, 0x06040a, 0.22));
scene.add(new THREE.AmbientLight(0x1f2b44, 0.22));

// World
const world = createLabWorld();
scene.add(world.group);

for (const l of world.lights) scene.add(l);

// Lampe torche (évite le “tout noir” et garde l’ambiance horreur)
const flashlight = new THREE.SpotLight(0xe8f4ff, 85, 22, Math.PI / 8, 0.45, 1.7);
flashlight.castShadow = true;
flashlight.shadow.mapSize.set(1024, 1024);
flashlight.shadow.bias = -0.0002;
scene.add(flashlight);
scene.add(flashlight.target);

// A simple bald head "mirror" prop: a shiny sphere on a stand near entrance
const mirrorStand = new THREE.Mesh(
  new THREE.CylinderGeometry(0.18, 0.22, 1.3, 16),
  new THREE.MeshStandardMaterial({ color: 0x10131c, roughness: 0.45, metalness: 0.35 })
);
mirrorStand.position.set(0.9, 0.65, 16.2);
mirrorStand.castShadow = true;
scene.add(mirrorStand);
world.colliders.push(mirrorStand);

const baldHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.28, 24, 18),
  new THREE.MeshStandardMaterial({ color: 0xf1d9c0, roughness: 0.18, metalness: 0.02 })
);
baldHead.position.set(0.9, 1.55, 16.2);
baldHead.castShadow = true;
scene.add(baldHead);

const baldLight = new THREE.PointLight(0xffffff, 0.55, 4.5, 2.0);
baldLight.position.set(0.9, 2.1, 16.2);
scene.add(baldLight);

// Dog monster
const dog = createDogMonster();
scene.add(dog.group);

// Player state
const player = {
  position: world.playerStart.clone(),
  radius: 0.35,
  height: 1.7,
  alive: true,
  timeSurvived: 0,
  goal: 60,
};

const tmpVec3 = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();

function resetGame() {
  player.position.copy(world.playerStart);
  player.alive = true;
  player.timeSurvived = 0;
  camera.position.copy(player.position);

  dog.setPosition(world.dogStart.clone());
  dog.state.velocity.set(0, 0, 0);
  dog.state.mode = "patrol";
  dog.state.currentWp = 0;
  dog.state.lastSeenT = -999;
  dog.setYaw(0);

  ui.setStatus("Laboratoire 4512 — Reste discret.");
  ui.setDanger(false);
  audio.setDangerLevel(0);
}

function aabbForMesh(mesh) {
  mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox.clone();
  bb.applyMatrix4(mesh.matrixWorld);
  return bb;
}

function resolveCollisions(pos, radius) {
  // Approximate player as a vertical capsule with radius; resolve against AABBs by pushing out in XZ.
  for (const m of world.colliders) {
    if (!m.geometry) continue;
    const bb = aabbForMesh(m);

    const minX = bb.min.x - radius;
    const maxX = bb.max.x + radius;
    const minZ = bb.min.z - radius;
    const maxZ = bb.max.z + radius;

    if (pos.x >= minX && pos.x <= maxX && pos.z >= minZ && pos.z <= maxZ) {
      // push out on the smallest penetration axis
      const dxMin = Math.abs(pos.x - minX);
      const dxMax = Math.abs(maxX - pos.x);
      const dzMin = Math.abs(pos.z - minZ);
      const dzMax = Math.abs(maxZ - pos.z);

      const minPen = Math.min(dxMin, dxMax, dzMin, dzMax);
      if (minPen === dxMin) pos.x = minX;
      else if (minPen === dxMax) pos.x = maxX;
      else if (minPen === dzMin) pos.z = minZ;
      else pos.z = maxZ;
    }
  }
}

function hasLineOfSight(from, to) {
  const dir = tmpVec3.copy(to).sub(from);
  const dist = dir.length();
  if (dist < 1e-3) return true;
  dir.normalize();
  raycaster.set(from, dir);
  raycaster.far = dist - 0.2;
  const hits = raycaster.intersectObjects(world.colliders, false);
  return hits.length === 0;
}

function updateDog(dt, tNow) {
  const dogPos = dog.state.position;
  const playerPos = player.position;

  // Awareness
  const toPlayer = tmpVec3.copy(playerPos).sub(dogPos);
  const dist = toPlayer.length();
  const los = dist < 13 && hasLineOfSight(dogPos.clone().add(new THREE.Vector3(0, 0.4, 0)), playerPos.clone().add(new THREE.Vector3(0, 1.0, 0)));

  if (los) {
    dog.state.mode = "chase";
    dog.state.lastSeenT = tNow;
  } else if (tNow - dog.state.lastSeenT > 3.0) {
    dog.state.mode = "patrol";
  }

  let target = null;
  let speed = 1.6;
  if (dog.state.mode === "chase") {
    target = playerPos;
    speed = 2.6;
  } else {
    target = world.waypoints[dog.state.currentWp];
    speed = 1.5;
  }

  const desired = tmpVec3.copy(target).sub(dogPos);
  desired.y = 0;
  const d = desired.length();
  if (d < 0.8 && dog.state.mode === "patrol") {
    dog.state.currentWp = (dog.state.currentWp + 1) % world.waypoints.length;
  }

  if (d > 1e-3) desired.normalize();
  const v = dog.state.velocity;
  v.lerp(desired.multiplyScalar(speed), 1 - Math.exp(-dt * 4.0));

  const next = dogPos.clone().addScaledVector(v, dt);
  // Constrain in bounds (simple)
  const b = world.bounds ?? { minX: -18.5, maxX: 18.5, minZ: -18.5, maxZ: 18.5 };
  next.x = THREE.MathUtils.clamp(next.x, b.minX, b.maxX);
  next.z = THREE.MathUtils.clamp(next.z, b.minZ, b.maxZ);
  dog.setPosition(next);

  if (v.lengthSq() > 1e-5) {
    const yaw = Math.atan2(v.x, v.z);
    dog.setYaw(yaw);
  }

  const speed01 = THREE.MathUtils.clamp(v.length() / 2.8, 0, 1);
  dog.updateAnim(dt, speed01);

  // Attack
  if (dist < (dog.boundingRadius + player.radius) * 1.25) {
    player.alive = false;
  }
}

function updateFlicker(tNow) {
  const l = world.flickerLight;
  if (!l?.userData?.flicker) return;
  const base = 2.3;
  const r = (Math.sin(tNow * 12.0) * 0.5 + Math.sin(tNow * 7.0) * 0.35 + Math.sin(tNow * 2.3) * 0.2);
  const dip = Math.max(0, r);
  l.intensity = base * (0.75 + 0.25 * Math.sin(tNow * 0.7)) - dip * 1.0;
}

function tick() {
  const dt = Math.min(0.033, clock.getDelta());
  const tNow = clock.elapsedTime;

  controls.updateCamera();
  updateFlicker(tNow);

  // Suivi lampe torche
  flashlight.position.copy(camera.position);
  flashlight.target.position.copy(camera.position).add(tmpVec3.set(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(2.0));

  if (controls.state.enabled && player.alive) {
    // Movement
    const move = controls.getMoveVector(tmpVec3);
    const speed = controls.state.running ? 4.0 : 2.6;
    const step = move.multiplyScalar(speed * dt);
    player.position.add(step);
    resolveCollisions(player.position, player.radius);
    const b = world.bounds ?? { minX: -18.5, maxX: 18.5, minZ: -18.5, maxZ: 18.5 };
    player.position.x = THREE.MathUtils.clamp(player.position.x, b.minX, b.maxX);
    player.position.z = THREE.MathUtils.clamp(player.position.z, b.minZ, b.maxZ);
    player.position.y = 1.7;
    camera.position.copy(player.position);

    // Time objective
    player.timeSurvived += dt;
    const remain = Math.max(0, player.goal - player.timeSurvived);
    ui.setStatus(`Survie: ${Math.ceil(remain)}s — ${controls.state.running ? "tu cours" : "tu marches"}`);
    if (remain <= 0) player.alive = false;
  }

  if (player.alive && controls.state.enabled) {
    updateDog(dt, tNow);
  }

  // UI / audio danger based on distance
  const dogDist = dog.state.position.distanceTo(player.position);
  const danger = THREE.MathUtils.clamp(1 - (dogDist - 1.2) / 10.0, 0, 1);
  ui.setDanger(danger > 0.55 && player.alive);
  audio.setDangerLevel(player.alive ? danger : 0);

  // End states
  if (!player.alive) {
    if (player.timeSurvived >= player.goal) {
      ui.setStatus("Tu as survécu… pour l’instant.");
    } else {
      ui.setStatus("Le chien t’a retrouvé.");
    }
    ui.showMenu();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

ui.els.start.addEventListener("click", async () => {
  await audio.start();
  audio.setMasterVolume(0.55);
  resetGame();
  ui.showInGame();
  controls.requestLock();
});

ui.els.reset.addEventListener("click", () => {
  resetGame();
  ui.showMenu();
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

resetGame();
ui.showMenu();
tick();


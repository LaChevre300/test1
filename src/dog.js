import * as THREE from "three";

export function createDogMonster() {
  const group = new THREE.Group();
  group.name = "dogMonster";

  const fur = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1.0, metalness: 0.0 });
  const flesh = new THREE.MeshStandardMaterial({ color: 0x2a0b0f, roughness: 0.75, metalness: 0.0 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x060000, emissive: 0xff2233, emissiveIntensity: 2.2 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.85, 6, 10), fur);
  body.castShadow = true;
  body.position.set(0, 0.55, 0);
  body.rotation.z = Math.PI / 2;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), fur);
  head.castShadow = true;
  head.position.set(0.75, 0.75, 0);
  group.add(head);

  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.26), flesh);
  jaw.position.set(0.92, 0.62, 0);
  jaw.castShadow = true;
  group.add(jaw);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(0.9, 0.80, 0.10);
  eyeR.position.set(0.9, 0.80, -0.10);
  group.add(eyeL, eyeR);

  // Legs (simple)
  const legGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.5, 10);
  const legOffsets = [
    [-0.2, 0.25, 0.18],
    [-0.2, 0.25, -0.18],
    [0.35, 0.25, 0.18],
    [0.35, 0.25, -0.18],
  ];
  const legs = [];
  for (const [x, y, z] of legOffsets) {
    const leg = new THREE.Mesh(legGeo, fur);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
    legs.push(leg);
  }

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.55, 10), fur);
  tail.position.set(-0.75, 0.78, 0);
  tail.rotation.z = Math.PI / 2.8;
  tail.castShadow = true;
  group.add(tail);

  // Physics-ish state
  const state = {
    position: new THREE.Vector3(0, 0.55, 0),
    velocity: new THREE.Vector3(),
    yaw: 0,
    animT: 0,
    mode: "patrol", // patrol | chase
    currentWp: 0,
    lastSeenT: -999,
  };

  function setPosition(v) {
    state.position.copy(v);
    group.position.copy(v);
  }
  function setYaw(yaw) {
    state.yaw = yaw;
    group.rotation.y = yaw;
  }

  function updateAnim(dt, speed01) {
    state.animT += dt * (2.0 + speed01 * 8.0);
    const s = Math.sin(state.animT);
    legs[0].rotation.x = s * 0.6;
    legs[1].rotation.x = -s * 0.6;
    legs[2].rotation.x = -s * 0.6;
    legs[3].rotation.x = s * 0.6;
    tail.rotation.y = Math.sin(state.animT * 0.6) * 0.4;
    jaw.rotation.x = 0.12 + Math.max(0, Math.sin(state.animT * 0.9)) * 0.25;
  }

  setPosition(state.position);
  setYaw(0);

  const boundingRadius = 0.65;

  return { group, state, setPosition, setYaw, updateAnim, boundingRadius };
}


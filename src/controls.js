import * as THREE from "three";

export function createPointerLockControls(camera, domElement) {
  const state = {
    enabled: false,
    yaw: 0,
    pitch: 0,
    moveF: 0,
    moveR: 0,
    running: false,
  };

  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  const vForward = new THREE.Vector3();
  const vRight = new THREE.Vector3();

  function clampPitch() {
    const limit = Math.PI / 2 - 0.02;
    state.pitch = Math.max(-limit, Math.min(limit, state.pitch));
  }

  function onMouseMove(e) {
    if (!state.enabled) return;
    const mx = e.movementX || 0;
    const my = e.movementY || 0;
    const sensitivity = 0.0022;
    state.yaw -= mx * sensitivity;
    state.pitch -= my * sensitivity;
    clampPitch();
  }

  function onKey(e, down) {
    if (!state.enabled) return;
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        state.moveF = down ? 1 : state.moveF === 1 ? 0 : state.moveF;
        break;
      case "KeyS":
      case "ArrowDown":
        state.moveF = down ? -1 : state.moveF === -1 ? 0 : state.moveF;
        break;
      case "KeyD":
      case "ArrowRight":
        state.moveR = down ? 1 : state.moveR === 1 ? 0 : state.moveR;
        break;
      case "KeyA":
      case "ArrowLeft":
        state.moveR = down ? -1 : state.moveR === -1 ? 0 : state.moveR;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        state.running = down;
        break;
      default:
        break;
    }
  }

  function connect() {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("keydown", (e) => onKey(e, true));
    document.addEventListener("keyup", (e) => onKey(e, false));

    document.addEventListener("pointerlockchange", () => {
      state.enabled = document.pointerLockElement === domElement;
      if (!state.enabled) {
        state.moveF = 0;
        state.moveR = 0;
        state.running = false;
      }
    });
  }

  function requestLock() {
    domElement.requestPointerLock();
  }

  function updateCamera() {
    euler.set(state.pitch, state.yaw, 0);
    camera.quaternion.setFromEuler(euler);
  }

  function getMoveVector(outVec) {
    vForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    vRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    vForward.y = 0;
    vRight.y = 0;
    vForward.normalize();
    vRight.normalize();

    outVec.copy(vForward).multiplyScalar(state.moveF).addScaledVector(vRight, state.moveR);
    if (outVec.lengthSq() > 1e-6) outVec.normalize();
    return outVec;
  }

  connect();

  return { state, requestLock, updateCamera, getMoveVector };
}


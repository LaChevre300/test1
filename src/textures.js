import * as THREE from "three";

function canvasTexture(w, h, drawFn) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { alpha: false });
  drawFn(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

function fract(x) {
  return x - Math.floor(x);
}

export function createProceduralTextures() {
  // Sol: “dalles” + joints
  const floorBase = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#10131a";
    ctx.fillRect(0, 0, w, h);

    const tile = 64;
    for (let y = 0; y < h; y += tile) {
      for (let x = 0; x < w; x += tile) {
        const v = 10 + Math.floor((Math.sin(x * 0.12) + Math.sin(y * 0.13)) * 3);
        ctx.fillStyle = `rgb(${16 + v},${18 + v},${22 + v})`;
        ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
      }
    }

    // Micro saletés / usure
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * 0.08;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(x, y, 1, 1);
    }
  });

  // Roughness map (en niveaux de gris) pour casser l’uniformité
  const floorRough = new THREE.CanvasTexture(document.createElement("canvas"));
  floorRough.image.width = 512;
  floorRough.image.height = 512;
  {
    const c = floorRough.image;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const x = (i / 4) % c.width;
      const y = Math.floor(i / 4 / c.width);
      const n = fract(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
      const v = Math.floor(140 + n * 90);
      img.data[i + 0] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  floorRough.colorSpace = THREE.NoColorSpace;
  floorRough.wrapS = THREE.RepeatWrapping;
  floorRough.wrapT = THREE.RepeatWrapping;
  floorRough.anisotropy = 4;
  floorRough.needsUpdate = true;

  // Mur: panneaux + légère variation
  const wallBase = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#1a2034";
    ctx.fillRect(0, 0, w, h);

    // Panneaux verticaux
    for (let x = 0; x < w; x += 64) {
      const shade = 22 + Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${shade},${shade + 8},${shade + 18})`;
      ctx.fillRect(x, 0, 62, h);
    }

    // “vis” / points
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let y = 20; y < h; y += 64) {
      for (let x = 20; x < w; x += 64) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  const wallRough = new THREE.CanvasTexture(document.createElement("canvas"));
  wallRough.image.width = 512;
  wallRough.image.height = 512;
  {
    const c = wallRough.image;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const x = (i / 4) % c.width;
      const y = Math.floor(i / 4 / c.width);
      const n = fract(Math.sin(x * 5.1 + y * 9.7) * 43758.5453);
      const v = Math.floor(170 + n * 60);
      img.data[i + 0] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  wallRough.colorSpace = THREE.NoColorSpace;
  wallRough.wrapS = THREE.RepeatWrapping;
  wallRough.wrapT = THREE.RepeatWrapping;
  wallRough.anisotropy = 4;
  wallRough.needsUpdate = true;

  return {
    floorBase,
    floorRough,
    wallBase,
    wallRough,
  };
}


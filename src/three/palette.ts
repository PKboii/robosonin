import * as THREE from "three";

/* ---------------- shared materials ---------------- */

export const MAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xf6f6f3, roughness: 0.5, metalness: 0.02 }),
  plastic: new THREE.MeshStandardMaterial({ color: 0xdadcd8, roughness: 0.42, metalness: 0.04 }),
  graphite: new THREE.MeshStandardMaterial({ color: 0x2c2f32, roughness: 0.38, metalness: 0.18 }),
  darkSoft: new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: 0.55, metalness: 0.08 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xc5c9cd, roughness: 0.3, metalness: 0.85 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x7c8187, roughness: 0.34, metalness: 0.8 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xe8490f, roughness: 0.4, metalness: 0.05 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xb3855c, roughness: 0.62, metalness: 0.0 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x8a6242, roughness: 0.66, metalness: 0.0 }),
  oakLight: new THREE.MeshStandardMaterial({ color: 0xc99f70, roughness: 0.58, metalness: 0.0 }),
  floor: new THREE.MeshStandardMaterial({ color: 0xe4e5e0, roughness: 0.85, metalness: 0.0 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xefefec, roughness: 0.92, metalness: 0.0 }),
  wallWarm: new THREE.MeshStandardMaterial({ color: 0xe8ddd0, roughness: 0.9, metalness: 0.0 }),
  fabric: new THREE.MeshStandardMaterial({
    color: 0xdfe2d8,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
  pad: new THREE.MeshStandardMaterial({ color: 0xded9ce, roughness: 0.96, metalness: 0 }),
  sponge: new THREE.MeshStandardMaterial({ color: 0xe3d5a4, roughness: 0.9, metalness: 0 }),
  bristle: new THREE.MeshStandardMaterial({ color: 0x4a4e52, roughness: 0.8, metalness: 0 }),
  silicone: new THREE.MeshStandardMaterial({
    color: 0xecdcd2,
    roughness: 0.55,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
  maroon: new THREE.MeshStandardMaterial({ color: 0x6e2432, roughness: 0.32, metalness: 0.08 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xe9f1f2,
    roughness: 0.14,
    metalness: 0,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  }),
  strip: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  cord: new THREE.MeshStandardMaterial({ color: 0x33363a, roughness: 0.6, metalness: 0.1 }),
};

export function disposeMaterials() {
  const seen = new Set<THREE.Material>();
  Object.values(MAT).forEach((m) => {
    if (!seen.has(m)) {
      seen.add(m);
      m.dispose();
    }
  });
}

/* ---------------- helpers ---------------- */

export function mesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  shadows = true
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (shadows) {
    m.castShadow = true;
    m.receiveShadow = false;
  }
  return m;
}

/** Matte plinth with a recessed dark shadow-gap base. */
export function makePedestal(w: number, h: number, d: number): THREE.Group {
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(w, h - 0.035, d), MAT.white, 0, (h - 0.035) / 2 + 0.035, 0);
  body.receiveShadow = true;
  const gap = mesh(new THREE.BoxGeometry(w * 0.94, 0.035, d * 0.94), MAT.darkSoft, 0, 0.0175, 0, false);
  const top = mesh(new THREE.BoxGeometry(w, 0.012, d), MAT.plastic, 0, h - 0.006, 0, false);
  g.add(body, gap, top);
  return g;
}

/** Canvas-texture signage plate (no external assets). */
export function makeSign(
  title: string,
  sub: string | null,
  worldW: number,
  opts: { bg?: string; fg?: string; align?: "left" | "center" } = {}
): THREE.Mesh {
  const ratio = sub ? 3.1 : 4.6;
  const cw = 1024;
  const ch = Math.round(cw / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const c = canvas.getContext("2d")!;
  c.fillStyle = opts.bg ?? "#24262a";
  c.fillRect(0, 0, cw, ch);
  // orange tick
  c.fillStyle = "#e8490f";
  const px = opts.align === "center" ? cw / 2 - 34 : 78;
  c.fillRect(px, ch * 0.24, 68, 10);
  c.fillStyle = opts.fg ?? "#f1f2ef";
  c.textBaseline = "top";
  c.textAlign = (opts.align ?? "left") as CanvasTextAlign;
  const tx = opts.align === "center" ? cw / 2 : 78;
  c.font = `700 ${Math.round(ch * (sub ? 0.3 : 0.4))}px "Space Grotesk", sans-serif`;
  c.fillText(title, tx, ch * (sub ? 0.34 : 0.3));
  if (sub) {
    c.fillStyle = "#ffb387";
    c.font = `600 ${Math.round(ch * 0.175)}px "Space Grotesk", sans-serif`;
    c.fillText(sub, tx, ch * 0.72);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldW / ratio), mat);
  plane.userData.disposeExtra = [tex, mat, plane.geometry];
  return plane;
}

/** Entrance brand board — real Roboson logo on a light plate, with typeset fallback. */
export function makeBrandBoard(worldW: number): THREE.Mesh {
  const cw = 1024;
  const ch = 400;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const c = canvas.getContext("2d")!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const spaced = (text: string, cx: number, cy: number, gap: number) => {
    let w = 0;
    const ws: number[] = [];
    for (const chh of text) {
      const m = c.measureText(chh).width;
      ws.push(m);
      w += m + gap;
    }
    let x = cx - (w - gap) / 2;
    for (let i = 0; i < text.length; i++) {
      c.fillText(text[i], x + ws[i] / 2, cy);
      x += ws[i] + gap;
    }
  };

  let logo: HTMLImageElement | null = null;
  const draw = () => {
    c.clearRect(0, 0, cw, ch);
    c.fillStyle = "#f7f6f2";
    c.fillRect(0, 0, cw, ch);
    c.fillStyle = "#e8490f";
    c.fillRect(0, 0, cw, 12);
    c.textAlign = "center";
    c.textBaseline = "middle";
    if (logo && logo.complete && logo.naturalWidth > 0) {
      const lw = 460;
      const lh = Math.min(150, lw * (logo.naturalHeight / logo.naturalWidth));
      c.drawImage(logo, cw / 2 - lw / 2, ch * 0.36 - lh / 2, lw, lh);
    } else {
      c.fillStyle = "#1b1d1f";
      c.font = '700 118px "Space Grotesk", sans-serif';
      c.fillText("ROBOSON", cw / 2, ch * 0.35);
    }
    c.fillStyle = "#2b2e31";
    c.font = '600 42px "Space Grotesk", sans-serif';
    spaced("THE DIGITAL SHOWROOM", cw / 2, ch * 0.76, 16);
    tex.needsUpdate = true;
  };
  draw();
  if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
    (document as Document & { fonts: FontFaceSet }).fonts.ready.then(draw).catch(() => {});
  }
  logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.onload = draw;
  logo.src =
    "https://roboson.in/cdn/shop/files/Roboson_logo_Website_7fed9a54-32c9-49e4-83f1-d5670c03b85f.png?v=1718196617";

  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(worldW, (worldW * ch) / cw), mat);
  plane.userData.disposeExtra = [tex, mat, plane.geometry];
  return plane;
}

/** Vertical wood slat feature panel (instanced). */
export function makeSlats(count: number, height: number, spacing: number): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry(0.055, height, 0.04);
  const inst = new THREE.InstancedMesh(geo, MAT.wood, count);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    m4.makeTranslation(i * spacing, height / 2 + 0.02, 0);
    inst.setMatrixAt(i, m4);
  }
  inst.instanceMatrix.needsUpdate = true;
  inst.castShadow = true;
  return inst;
}

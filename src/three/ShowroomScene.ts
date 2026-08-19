import * as THREE from "three";
import { MAT, disposeMaterials, makeBrandBoard, makePedestal, makeSign, makeSlats, mesh } from "./palette";
import {
  buildSpinMop,
  buildSpinScrubber,
  buildVacuum,
  buildCarVacuum,
  buildSteamer,
  buildHotAirBrush,
  buildEvoPump,
  buildBP222,
  buildShirtOnHanger,
  type Build,
} from "./builders";

export interface ScreenLabel {
  id: string;
  x: number;
  y: number;
  a: number;
}

export interface SceneOpts {
  mobile: boolean;
  reducedMotion: boolean;
  onZone: (id: string) => void;
  onFrame: (p: number, labels: ScreenLabel[]) => void;
  onReady: () => void;
}

interface CamKey {
  t: number;
  p: [number, number, number];
  l: [number, number, number];
}

const KEYS: CamKey[] = [
  { t: 0.0, p: [0, 1.75, 15.5], l: [0, 1.6, 4] },
  { t: 0.05, p: [0, 1.68, 8.9], l: [0, 1.4, 0] },
  { t: 0.125, p: [0, 1.5, 3.1], l: [0, 0.95, -2] },
  { t: 0.2, p: [1.8, 1.35, 0.4], l: [0, 1.0, -2] },
  { t: 0.275, p: [2.2, 1.2, -1.7], l: [0, 1.05, -2] },
  { t: 0.335, p: [-1.6, 1.5, -1.0], l: [0, 1.0, -2] },
  { t: 0.395, p: [-2.1, 1.35, -4.6], l: [-3.4, 1.12, -7] },
  { t: 0.465, p: [-1.5, 1.25, -6.3], l: [-3.4, 1.05, -7] },
  { t: 0.52, p: [0.9, 1.35, -9.6], l: [2.9, 1.2, -12] },
  { t: 0.585, p: [1.75, 1.18, -10.9], l: [2.9, 1.18, -12] },
  { t: 0.635, p: [-0.7, 1.25, -14.2], l: [-2.9, 0.4, -16.45] },
  { t: 0.7, p: [-1.65, 1.0, -15.6], l: [-2.85, 0.32, -16.4] },
  { t: 0.755, p: [0.85, 1.3, -19.0], l: [2.6, 1.05, -21.2] },
  { t: 0.815, p: [1.55, 1.15, -20.4], l: [2.55, 1.0, -21.3] },
  { t: 0.858, p: [-0.45, 1.55, -23.4], l: [-3.3, 1.08, -25.95] },
  { t: 0.915, p: [-1.4, 1.32, -24.4], l: [-3.3, 1.02, -25.98] },
  { t: 1.0, p: [0, 3.75, -32.6], l: [0, 0.9, -12] },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ease = (f: number) => f * f * (3 - 2 * f);

export class ShowroomScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;
  private readySent = false;
  private opts: SceneOpts;

  private p = 0;
  private targetP = 0;
  private zone = "";
  private time = 0;

  private parX = 0;
  private parY = 0;
  private parTX = 0;
  private parTY = 0;

  private dirLight!: THREE.DirectionalLight;
  private hemi!: THREE.HemisphereLight;
  private warmLight!: THREE.PointLight;
  private coolColor = new THREE.Color(0xfff7ec);
  private warmColor = new THREE.Color(0xffdfb4);

  private builds: Record<string, Build> = {};
  private baseY: Record<string, number> = {};

  private steamerHome = new THREE.Vector3(2.45, 0.752, -20.8);
  private steamerNear = new THREE.Vector3(2.62, 0.85, -21.4);

  private dust!: THREE.Points;
  private dustVel: Float32Array = new Float32Array(0);

  private carDust!: THREE.Points;
  private carDustMat!: THREE.PointsMaterial;

  // steam
  private steamN = 110;
  private steamGeo!: THREE.BufferGeometry;
  private steamPos!: Float32Array;
  private steamVel!: Float32Array;
  private steamLife!: Float32Array;
  private steamMax!: Float32Array;
  private steamSize!: Float32Array;
  private steamAlpha!: Float32Array;
  private steamAcc = 0;
  private steamMat!: THREE.ShaderMaterial;

  // shirt on hanger
  private shirt!: THREE.Mesh;
  private shirtBase!: Float32Array;
  private shirtH = 0.62;

  private labels: { id: string; obj: THREE.Object3D; zone: string }[] = [];
  private tmpV = new THREE.Vector3();
  private tmpV2 = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement, opts: SceneOpts) {
    this.opts = opts;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.mobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    this.camera.position.set(...KEYS[0].p);

    this.scene.background = new THREE.Color(0xeef0ec);
    this.scene.fog = new THREE.Fog(0xeef0ec, 16, 48);

    this.buildLights();
    this.buildEnvironment();
    this.buildVignettes();
    this.buildDust();
    this.buildSteam();

    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVis);
    this.clock.start();
    this.loop();
  }

  /* ---------------- lights ---------------- */

  private buildLights() {
    this.hemi = new THREE.HemisphereLight(0xffffff, 0xd8d4ca, 0.85);
    this.scene.add(this.hemi);

    this.dirLight = new THREE.DirectionalLight(0xfff7ec, 1.15);
    this.dirLight.position.set(7, 12, -6);
    this.dirLight.target.position.set(0, 0, -14);
    this.dirLight.castShadow = true;
    const s = this.opts.mobile ? 1024 : 2048;
    this.dirLight.shadow.mapSize.set(s, s);
    const cam = this.dirLight.shadow.camera;
    cam.left = -14;
    cam.right = 14;
    cam.top = 16;
    cam.bottom = -40;
    cam.near = 1;
    cam.far = 60;
    this.dirLight.shadow.bias = -0.0004;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight, this.dirLight.target);

    const fill = new THREE.DirectionalLight(0xe8f0ff, 0.35);
    fill.position.set(-6, 7, 6);
    this.scene.add(fill);

    this.warmLight = new THREE.PointLight(0xffd7ae, 0, 7, 1.8);
    this.warmLight.position.set(-3.2, 2.3, -25.3);
    this.scene.add(this.warmLight);
  }

  /* ---------------- environment ---------------- */

  private buildEnvironment() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 64), MAT.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -12);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // walls
    const wallGeo = new THREE.PlaneGeometry(52, 5);
    const left = new THREE.Mesh(wallGeo, MAT.wall);
    left.rotation.y = Math.PI / 2;
    left.position.set(-5.5, 2.5, -13);
    left.receiveShadow = true;
    const right = new THREE.Mesh(wallGeo, MAT.wall);
    right.rotation.y = -Math.PI / 2;
    right.position.set(5.5, 2.5, -13);
    right.receiveShadow = true;
    this.scene.add(left, right);

    // ceiling + light strips
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(11, 52), MAT.wall);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, 4.5, -13);
    this.scene.add(ceil);
    const stripGeo = new THREE.BoxGeometry(0.18, 0.035, 3.4);
    for (const z of [6, 1, -4, -9, -14, -19, -24, -29]) {
      for (const x of [-1.7, 1.7]) {
        const st = new THREE.Mesh(stripGeo, MAT.strip);
        st.position.set(x, 4.46, z);
        this.scene.add(st);
      }
    }

    // entrance portal — white frame with the Roboson brand board above the opening
    const jambGeo = new THREE.BoxGeometry(0.28, 3.5, 0.7);
    const jambL = mesh(jambGeo, MAT.white, -1.7, 1.75, 8);
    const jambR = mesh(jambGeo, MAT.white, 1.7, 1.75, 8);
    jambL.receiveShadow = jambR.receiveShadow = true;
    const header = mesh(new THREE.BoxGeometry(3.68, 0.32, 0.7), MAT.white, 0, 3.66, 8);
    header.receiveShadow = true;
    const threshold = mesh(new THREE.BoxGeometry(3.68, 0.03, 0.74), MAT.graphite, 0, 0.015, 8, false);
    this.scene.add(jambL, jambR, header, threshold);
    const brand = makeBrandBoard(2.9);
    brand.position.set(0, 3.66, 8.37);
    this.scene.add(brand);

    // floor guide spine + ticks
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.005, 41), MAT.accent);
    spine.position.set(0, 0.003, -11.5);
    this.scene.add(spine);
    const tickGeo = new THREE.BoxGeometry(0.6, 0.005, 0.035);
    for (const [x, z] of [
      [0, -2], [0, -7], [0, -12], [0, -16.5], [0, -20.8], [0, -25.6],
    ] as [number, number][]) {
      const t = new THREE.Mesh(tickGeo, MAT.accent);
      t.position.set(x * 0.5, 0.007, z);
      this.scene.add(t);
    }

    // wood slat features
    const slats1 = makeSlats(24, 3.8, 0.13);
    slats1.position.set(-5.28, 0, -5.5);
    slats1.rotation.y = Math.PI / 2;
    this.scene.add(slats1);
    const slats2 = makeSlats(24, 3.8, 0.13);
    slats2.position.set(5.28, 0, -10.4);
    slats2.rotation.y = -Math.PI / 2;
    this.scene.add(slats2);

    // wall zone signage
    const s1 = makeSign("CLEANING LABORATORY", "Spin Mop · Scrubber · VC201 · VC101", 2.5);
    s1.position.set(5.44, 2.1, -7);
    s1.rotation.y = -Math.PI / 2;
    const s2 = makeSign("FABRIC CARE STUDIO", "Garment Steamer · Hot Air Brush", 2.3);
    s2.position.set(-5.44, 2.1, -19.6);
    s2.rotation.y = Math.PI / 2;
    const s3 = makeSign("MOTHER & BABY STUDIO", "Evo · BP-222", 2.3);
    s3.position.set(-5.44, 2.1, -23.1);
    s3.rotation.y = Math.PI / 2;
    this.scene.add(s1, s2, s3);

    // evo alcove — open front, warm back panel, one long oak bench for all three pumps
    const nicheBack = mesh(new THREE.BoxGeometry(3.0, 3.1, 0.16), MAT.wallWarm, -3.3, 1.55, -26.6, false);
    nicheBack.receiveShadow = true;
    const bench = mesh(new THREE.BoxGeometry(2.3, 0.5, 0.8), MAT.oakLight, -3.3, 0.25, -26.05);
    bench.receiveShadow = true;
    const benchTop = mesh(new THREE.BoxGeometry(2.3, 0.014, 0.8), MAT.woodDark, -3.3, 0.507, -26.05, false);
    const riser = mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.06, 28), MAT.woodDark, -3.3, 0.545, -25.98);
    const evoSign = makeSign("EVO — 3RD GENERATION", "India's slimmest & most advanced", 1.7);
    evoSign.position.set(-3.3, 2.4, -26.5);
    this.scene.add(nicheBack, bench, benchTop, riser, evoSign);

    // garment rail + shirt on a wire hanger, against a charcoal fabric-care backdrop
    const fabricBack = mesh(new THREE.BoxGeometry(1.7, 2.4, 0.05), MAT.graphite, 2.7, 1.2, -22.32);
    fabricBack.receiveShadow = true;
    this.scene.add(fabricBack);
    const poleGeo = new THREE.CylinderGeometry(0.013, 0.013, 1.78, 10);
    const poleL = mesh(poleGeo, MAT.darkMetal, 2.26, 0.89, -21.78);
    const poleR = mesh(poleGeo, MAT.darkMetal, 3.14, 0.89, -21.78);
    const bar = mesh(new THREE.BoxGeometry(0.94, 0.022, 0.022), MAT.darkMetal, 2.7, 1.77, -21.78);
    this.scene.add(poleL, poleR, bar);

    const hang = buildShirtOnHanger();
    hang.group.position.set(2.7, 1.085, -21.78);
    this.scene.add(hang.group);
    this.shirt = hang.shirt;
    this.shirtBase = Float32Array.from(
      (this.shirt.geometry.attributes.position.array as Float32Array)
    );
  }

  /* ---------------- product vignettes ---------------- */

  private place(key: string, build: Build, x: number, y: number, z: number) {
    build.group.position.set(x, y, z);
    this.scene.add(build.group);
    this.builds[key] = build;
    this.baseY[key] = y;
  }

  private plinthSign(text: string, sub: string, w: number, x: number, y: number, z: number, rotY = 0) {
    const s = makeSign(text, sub, w);
    s.position.set(x, y, z);
    s.rotation.y = rotY;
    this.scene.add(s);
  }

  private buildVignettes() {
    // 1 — Spin mop (hero)
    const pedMop = makePedestal(1.15, 0.14, 1.15);
    pedMop.position.set(0, 0, -2);
    this.scene.add(pedMop);
    const mop = buildSpinMop();
    this.place("mop", mop, 0, 0.152, -2);
    this.plinthSign("ELECTRIC SPIN MOP", "₹3,999 · was ₹7,499", 0.72, 0, 0.09, -1.41);

    // 2 — Spin scrubber on cradle stand
    const pedScrub = makePedestal(0.85, 0.9, 0.85);
    pedScrub.position.set(-3.4, 0, -7);
    this.scene.add(pedScrub);
    const pole = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 12), MAT.darkMetal, -3.66, 1.26, -7.1);
    const arm = mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), MAT.darkMetal, -3.52, 1.52, -7.1);
    const arm2 = mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), MAT.darkMetal, -3.52, 1.1, -7.1);
    this.scene.add(pole, arm, arm2);
    const scrub = buildSpinScrubber();
    this.place("scrub", scrub, -3.4, 0.912, -7);
    this.plinthSign("SPIN SCRUBBER", "₹2,199 · 25W motor", 0.62, -3.4, 0.5, -6.56);

    // 3 — VC201 vacuum
    const pedVac = makePedestal(0.68, 0.95, 0.68);
    pedVac.position.set(2.9, 0, -12);
    this.scene.add(pedVac);
    const vac = buildVacuum();
    this.place("vac", vac, 2.9, 0.962, -12);
    vac.group.rotation.y = -0.5;
    this.plinthSign("VC201 VACUUM", "₹2,499 · 6,000 Pa", 0.56, 2.9, 0.52, -11.65);

    // 4 — Car vacuum vignette
    const platform = mesh(new THREE.BoxGeometry(2.35, 0.09, 1.75), MAT.graphite, -3.05, 0.045, -16.5);
    const deck = mesh(new THREE.BoxGeometry(2.25, 0.02, 1.65), MAT.oakLight, -3.05, 0.1, -16.5);
    deck.receiveShadow = true;
    const seatBase = mesh(new THREE.BoxGeometry(0.78, 0.34, 0.72), MAT.darkSoft, -3.82, 0.28, -16.5);
    const seatBack = mesh(new THREE.BoxGeometry(0.78, 0.62, 0.16), MAT.darkSoft, -3.82, 0.62, -16.88);
    seatBack.rotation.x = 0.14;
    for (let i = 0; i < 2; i++) {
      const rib = mesh(new THREE.BoxGeometry(0.7, 0.02, 0.05), MAT.graphite, -3.82, 0.46, -16.32 + i * 0.18, false);
      this.scene.add(rib);
    }
    const mat = mesh(new THREE.BoxGeometry(1.25, 0.025, 1.05), MAT.darkSoft, -2.72, 0.122, -16.42);
    mat.receiveShadow = true;
    for (let i = 0; i < 6; i++) {
      const mrib = mesh(new THREE.BoxGeometry(1.15, 0.008, 0.03), MAT.graphite, -2.72, 0.138, -16.78 + i * 0.14, false);
      this.scene.add(mrib);
    }
    this.scene.add(platform, deck, seatBase, seatBack, mat);
    const carVac = buildCarVacuum();
    this.place("carvac", carVac, -2.72, 0.258, -16.38);
    carVac.group.rotation.y = 0.45;
    this.plinthSign("VC101 CAR VACUUM", "₹1,499 · 4.5m cord", 0.62, -3.05, 0.075, -15.6);

    // car dust
    const dn = this.opts.mobile ? 30 : 60;
    const dpos = new Float32Array(dn * 3);
    for (let i = 0; i < dn; i++) {
      dpos[i * 3] = -2.72 + (Math.random() - 0.5) * 0.7;
      dpos[i * 3 + 1] = 0.16 + Math.random() * 0.12;
      dpos[i * 3 + 2] = -16.42 + (Math.random() - 0.5) * 0.6;
    }
    const dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    this.carDustMat = new THREE.PointsMaterial({
      color: 0x9a9da0,
      size: 0.014,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.carDust = new THREE.Points(dgeo, this.carDustMat);
    this.scene.add(this.carDust);

    // 5 — Garment steamer + table
    const table = makePedestal(0.62, 0.74, 0.52);
    table.position.set(2.45, 0, -20.8);
    this.scene.add(table);
    const steamer = buildSteamer();
    this.place("steamer", steamer, this.steamerHome.x, this.steamerHome.y, this.steamerHome.z);
    steamer.group.rotation.y = 0.55;
    this.plinthSign("GARMENT STEAMER", "₹2,499 · 1800W", 0.58, 2.45, 0.42, -20.53);

    // 6 — Mother & baby bench: Evo hero on the riser, BP-111 and BP-222 beside it
    const evo = buildEvoPump();
    evo.group.scale.setScalar(2.3);
    this.place("evo", evo, -3.3, 0.575, -25.98);
    evo.group.rotation.y = 1.05;
    evo.group.rotation.x = -0.18;

    const bp222Bench = buildBP222();
    bp222Bench.group.scale.setScalar(1.6);
    this.place("bp222", bp222Bench, -2.32, 0.515, -26.02);
    bp222Bench.group.rotation.y = -0.5;
    // BP-222 price card sits low on the bench, clear of Evo's forward explode corridor
    this.plinthSign("BP-222", "₹4,299 · hands-free", 0.5, -2.32, 0.63, -25.72);

    // 7 — Finale shelf pedestals
    const pedHab = makePedestal(0.56, 1.0, 0.56);
    pedHab.position.set(3.15, 0, -24.6);
    this.scene.add(pedHab);
    const hab = buildHotAirBrush();
    this.place("hab", hab, 3.15, 1.012, -24.6);
    this.plinthSign("HOT AIR BRUSH", "₹1,899 · 3-in-1", 0.5, 3.15, 0.55, -24.31);

    // label anchors
    const map: [string, string][] = [
      ["mop", "mop"], ["scrub", "scrubber"], ["vac", "vacuum"], ["evo", "evo"],
    ];
    for (const [key, zone] of map) {
      for (const a of this.builds[key].anchors) {
        this.labels.push({ id: a.id, obj: a.obj, zone });
      }
    }
  }

  /* ---------------- particles ---------------- */

  private buildDust() {
    const n = this.opts.mobile ? 160 : 340;
    const pos = new Float32Array(n * 3);
    this.dustVel = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = 0.2 + Math.random() * 4;
      pos[i * 3 + 2] = 8 - Math.random() * 42;
      this.dustVel[i] = 0.02 + Math.random() * 0.05;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    this.dust = new THREE.Points(geo, mat);
    this.scene.add(this.dust);
  }

  private buildSteam() {
    const n = this.steamN;
    this.steamPos = new Float32Array(n * 3);
    this.steamVel = new Float32Array(n * 3);
    this.steamLife = new Float32Array(n).fill(99);
    this.steamMax = new Float32Array(n).fill(1);
    this.steamSize = new Float32Array(n);
    this.steamAlpha = new Float32Array(n);
    for (let i = 0; i < n; i++) this.steamPos[i * 3 + 1] = -20;

    this.steamGeo = new THREE.BufferGeometry();
    this.steamGeo.setAttribute("position", new THREE.BufferAttribute(this.steamPos, 3));
    this.steamGeo.setAttribute("aSize", new THREE.BufferAttribute(this.steamSize, 1));
    this.steamGeo.setAttribute("aAlpha", new THREE.BufferAttribute(this.steamAlpha, 1));

    this.steamMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = min(70.0, aSize * (300.0 / max(0.1, -mv.z)));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float m = smoothstep(0.5, 0.1, length(c));
          gl_FragColor = vec4(1.0, 1.0, 1.0, m * vAlpha);
        }
      `,
    });
    const points = new THREE.Points(this.steamGeo, this.steamMat);
    points.frustumCulled = false;
    this.scene.add(points);
  }

  /* ---------------- public ---------------- */

  setTargetProgress(v: number) {
    this.targetP = clamp01(v);
  }

  setPointer(nx: number, ny: number) {
    this.parTX = nx;
    this.parTY = ny;
  }

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
    } else if (!this.disposed) {
      this.clock.getDelta();
      this.loop();
    }
  };

  private zoneU(id: string, t0: number, t1: number): number {
    if (this.p < t0 || this.p >= t1) return -1;
    return clamp01((this.p - t0) / (t1 - t0));
  }

  private applyExplode(key: string, f: number) {
    const b = this.builds[key];
    if (!b) return;
    const e = ease(clamp01(f));
    for (const p of b.parts) {
      p.obj.position.copy(p.home).addScaledVector(p.out, e);
    }
  }

  /* ---------------- per-frame zone choreography ---------------- */

  private updateZones(dt: number) {
    /* Spin mop — approach · spin · explode · reassemble */
    const uMop = this.zoneU("mop", 0.1, 0.36);
    if (uMop >= 0) {
      const f = smooth(0.3, 0.46, uMop) * (1 - smooth(0.74, 0.88, uMop));
      this.applyExplode("mop", f);
      const drive = smooth(0.03, 0.14, uMop) * (1 - 0.85 * smooth(0.28, 0.42, uMop));
      for (const s of this.builds.mop.spin) {
        s.obj.rotation.y += s.speed * drive * dt;
      }
      this.labelAlpha = { zone: "mop", a: smooth(0.55, 0.9, f) };
    }

    /* Scrubber — brushes swap & spin, then the handle explodes into stages */
    const uScrub = this.zoneU("scrub", 0.36, 0.5);
    if (uScrub >= 0) {
      const b = this.builds.scrub;
      for (let i = 0; i < 3; i++) {
        const brush = b.extras[`brush${i}`];
        const home = b.extras[`brush${i}Home`].position;
        const park = b.extras[`brush${i}Park`].position;
        const start = i * 0.15;
        const end = start + 0.15;
        const attach =
          smooth(start + 0.02, start + 0.1, uScrub) * (1 - smooth(end - 0.02, end + 0.06, uScrub));
        brush.position.lerpVectors(park, home, ease(attach));
        brush.rotation.y += 9 * Math.max(0, attach - 0.85) * dt * 6.6;
      }
      const f = smooth(0.5, 0.66, uScrub) * (1 - smooth(0.82, 0.94, uScrub));
      this.applyExplode("scrub", f);
      this.labelAlpha = { zone: "scrubber", a: smooth(0.5, 0.9, f) };
    } else {
      this.applyExplode("scrub", 0);
    }

    /* VC201 — engineering reveal */
    const uVac = this.zoneU("vacuum", 0.5, 0.62);
    if (uVac >= 0) {
      const f = smooth(0.22, 0.42, uVac) * (1 - smooth(0.68, 0.86, uVac));
      this.applyExplode("vac", f);
      this.builds.vac.group.position.y =
        this.baseY.vac + Math.sin(this.time * 42) * 0.0014 * f;
      if (this.labelAlpha.zone !== "mop")
        this.labelAlpha = { zone: "vacuum", a: smooth(0.55, 0.9, f) };
    } else {
      this.builds.vac.group.position.y = this.baseY.vac;
    }

    /* Car vacuum — sweep across the mat */
    const uCar = this.zoneU("carvac", 0.62, 0.73);
    if (uCar >= 0) {
      const g = this.builds.carvac.group;
      g.position.x = -2.72 + Math.sin(uCar * Math.PI * 2) * 0.16;
      g.rotation.z = Math.sin(uCar * Math.PI * 4) * 0.03;
      this.carDustMat.opacity = 0.6 * (1 - smooth(0.3, 0.75, uCar));
      const pos = this.carDust.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, 0.16 + ((Math.sin(this.time * 2 + i * 12.9) + 1) / 2) * 0.1);
      }
      pos.needsUpdate = true;
    } else {
      this.carDustMat.opacity = 0;
    }

    /* Steamer — glide to fabric, steam, wrinkles relax */
    const uSteam = this.zoneU("steamer", 0.73, 0.84);
    const emit = uSteam >= 0 ? smooth(0.16, 0.3, uSteam) * (1 - smooth(0.85, 0.95, uSteam)) : 0;
    if (uSteam >= 0) {
      const s = smooth(0.08, 0.32, uSteam) * (1 - smooth(0.86, 0.97, uSteam));
      const g = this.builds.steamer.group;
      g.position.lerpVectors(this.steamerHome, this.steamerNear, ease(s));
      g.rotation.y = 0.55 + (Math.PI - 0.55 + 0.3) * ease(s);
    } else {
      this.builds.steamer.group.position.copy(this.steamerHome);
      this.builds.steamer.group.rotation.y = 0.55;
    }
    this.updateSteam(dt, emit);

    // shirt wrinkles ripple gently, then relax under steam
    const relax = uSteam >= 0 ? 1 - 0.85 * smooth(0.25, 0.8, uSteam) : 1;
    const amp = (this.opts.reducedMotion ? 0.4 : 1) * relax;
    const attr = this.shirt.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < attr.count; i++) {
      const x = this.shirtBase[i * 3];
      const y = this.shirtBase[i * 3 + 1];
      const low = (this.shirtH - y) / this.shirtH + 0.12; // hem moves most
      const z =
        (Math.sin(x * 14 + this.time * 1.7 + y * 4) * 0.02 +
          Math.sin(y * 7 - this.time * 1.2 + x * 5) * 0.014) *
        low *
        amp;
      attr.setZ(i, z);
    }
    attr.needsUpdate = true;
    this.shirt.geometry.computeVertexNormals();

    /* Evo — gentle medical-grade reveal, held longer for the component study */
    const uEvo = this.zoneU("evo", 0.82, 0.965);
    if (uEvo >= 0) {
      const f = smooth(0.2, 0.34, uEvo) * (1 - smooth(0.78, 0.93, uEvo));
      this.applyExplode("evo", f);
      if (this.labelAlpha.zone !== "mop" && this.labelAlpha.zone !== "vacuum")
        this.labelAlpha = { zone: "evo", a: smooth(0.5, 0.85, f) };
      this.warmLight.intensity = 0.4 + 1.1 * smooth(0.0, 0.3, uEvo) + f * 0.5;
    } else {
      this.warmLight.intensity = Math.max(0, this.warmLight.intensity - dt * 2);
    }

    /* Finale — warmer light */
    const w = smooth(0.965, 0.998, this.p);
    this.dirLight.color.lerpColors(this.coolColor, this.warmColor, w);
    this.hemi.intensity = 0.85 + 0.22 * w;
    this.renderer.toneMappingExposure = 1.02 + 0.1 * w;
    this.warmLight.intensity += w * 1.4;
  }

  private labelAlpha: { zone: string; a: number } = { zone: "", a: 0 };

  private updateSteam(dt: number, emit: number) {
    const n = this.steamN;
    // spawn
    if (emit > 0) {
      this.steamAcc += dt * 42 * emit;
      const head = this.builds.steamer.extras.steamHead;
      head.getWorldPosition(this.tmpV2);
      let i = 0;
      while (this.steamAcc > 1 && i < n) {
        if (this.steamLife[i] >= this.steamMax[i]) {
          this.steamAcc -= 1;
          this.steamLife[i] = 0;
          this.steamMax[i] = 1.1 + Math.random() * 0.9;
          this.steamPos[i * 3] = this.tmpV2.x + (Math.random() - 0.5) * 0.05;
          this.steamPos[i * 3 + 1] = this.tmpV2.y + 0.02;
          this.steamPos[i * 3 + 2] = this.tmpV2.z + (Math.random() - 0.5) * 0.05;
          this.steamVel[i * 3] = (Math.random() - 0.5) * 0.06;
          this.steamVel[i * 3 + 1] = 0.22 + Math.random() * 0.16;
          this.steamVel[i * 3 + 2] = (Math.random() - 0.78) * 0.08;
          this.steamSize[i] = 0.05 + Math.random() * 0.06;
        }
        i++;
      }
    }
    let anyAlive = false;
    for (let i = 0; i < n; i++) {
      if (this.steamLife[i] < this.steamMax[i]) {
        anyAlive = true;
        this.steamLife[i] += dt;
        const t = this.steamLife[i] / this.steamMax[i];
        if (t >= 1) {
          this.steamAlpha[i] = 0;
          this.steamPos[i * 3 + 1] = -20;
          continue;
        }
        this.steamVel[i * 3 + 1] += 0.14 * dt;
        this.steamVel[i * 3] *= 1 - 0.6 * dt;
        this.steamVel[i * 3 + 2] *= 1 - 0.6 * dt;
        this.steamPos[i * 3] += this.steamVel[i * 3] * dt;
        this.steamPos[i * 3 + 1] += this.steamVel[i * 3 + 1] * dt;
        this.steamPos[i * 3 + 2] += this.steamVel[i * 3 + 2] * dt;
        this.steamAlpha[i] = Math.sin(Math.PI * t) * 0.24;
        this.steamSize[i] += 0.085 * dt;
      }
    }
    (this.steamGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.steamGeo.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
    (this.steamGeo.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
    this.steamGeo.attributes.position.needsUpdate = true;
  }

  /* ---------------- camera ---------------- */

  private updateCamera(dt: number) {
    const keys = KEYS;
    let i = 0;
    while (i < keys.length - 2 && this.p > keys[i + 1].t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const u = ease(clamp01((this.p - a.t) / (b.t - a.t)));
    this.tmpV.set(
      a.p[0] + (b.p[0] - a.p[0]) * u,
      a.p[1] + (b.p[1] - a.p[1]) * u,
      a.p[2] + (b.p[2] - a.p[2]) * u
    );
    const look = new THREE.Vector3(
      a.l[0] + (b.l[0] - a.l[0]) * u,
      a.l[1] + (b.l[1] - a.l[1]) * u,
      a.l[2] + (b.l[2] - a.l[2]) * u
    );

    const pk = this.opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 3);
    this.parX += (this.parTX - this.parX) * pk;
    this.parY += (this.parTY - this.parY) * pk;
    const fin = 1 - smooth(0.9, 1.0, this.p);
    this.camera.position.set(
      this.tmpV.x + this.parX * 0.14 * fin,
      this.tmpV.y + this.parY * 0.08 * fin,
      this.tmpV.z
    );
    this.camera.lookAt(look);
  }

  /* ---------------- labels ---------------- */

  private computeLabels(): ScreenLabel[] {
    const out: ScreenLabel[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (const l of this.labels) {
      const active = l.zone === this.labelAlpha.zone;
      l.obj.getWorldPosition(this.tmpV);
      this.tmpV.project(this.camera);
      const inFront = this.tmpV.z < 1;
      out.push({
        id: l.id,
        x: (this.tmpV.x * 0.5 + 0.5) * w,
        y: (-this.tmpV.y * 0.5 + 0.5) * h,
        a: active && inFront ? this.labelAlpha.a : 0,
      });
    }
    return out;
  }

  /* ---------------- main loop ---------------- */

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt;

    const k = this.opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 4.6);
    this.p += (this.targetP - this.p) * k;
    if (Math.abs(this.targetP - this.p) < 0.00004) this.p = this.targetP;

    // zone detection
    const zid =
      this.p < 0.1 ? "entry"
      : this.p < 0.36 ? "mop"
      : this.p < 0.5 ? "scrubber"
      : this.p < 0.62 ? "vacuum"
      : this.p < 0.73 ? "carvac"
      : this.p < 0.82 ? "steamer"
      : this.p < 0.965 ? "evo"
      : "finale";
    if (zid !== this.zone) {
      this.zone = zid;
      this.opts.onZone(zid);
    }

    this.labelAlpha = { zone: "", a: 0 };
    this.updateZones(dt);

    // dust drift
    const dpos = this.dust.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < dpos.count; i++) {
      let y = dpos.getY(i) + this.dustVel[i] * dt;
      if (y > 4.3) y = 0.15;
      dpos.setY(i, y);
    }
    dpos.needsUpdate = true;

    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);

    if (!this.readySent) {
      this.readySent = true;
      this.opts.onReady();
    }
    this.opts.onFrame(this.p, this.computeLabels());
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVis);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const ud = o.userData as { disposeExtra?: (THREE.Texture | THREE.Material | THREE.BufferGeometry)[] };
      if (ud.disposeExtra) ud.disposeExtra.forEach((d) => d.dispose());
    });
    this.steamMat.dispose();
    this.carDustMat.dispose();
    (this.dust.material as THREE.Material).dispose();
    disposeMaterials();
    this.renderer.dispose();
  }
}

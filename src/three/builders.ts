import * as THREE from "three";
import { MAT, mesh } from "./palette";

export interface ExplodePart {
  obj: THREE.Object3D;
  home: THREE.Vector3;
  out: THREE.Vector3;
}

export interface Build {
  group: THREE.Group;
  parts: ExplodePart[];
  spin: { obj: THREE.Object3D; speed: number }[];
  anchors: { id: string; obj: THREE.Object3D }[];
  extras: Record<string, THREE.Object3D>;
}

function newBuild(): Build {
  return { group: new THREE.Group(), parts: [], spin: [], anchors: [], extras: {} };
}

function part(b: Build, obj: THREE.Object3D, out: [number, number, number]) {
  b.parts.push({
    obj,
    home: obj.position.clone(),
    out: new THREE.Vector3(...out),
  });
}

function anchor(b: Build, id: string, obj: THREE.Object3D) {
  b.anchors.push({ id, obj });
}

/* ================= ELECTRIC SPIN MOP ================= */

export function buildSpinMop(): Build {
  const b = newBuild();
  const g = b.group;

  // base linkage
  const link = mesh(new THREE.BoxGeometry(0.24, 0.035, 0.1), MAT.darkSoft, 0, 0.125, 0);
  g.add(link);

  const headG = (sx: number) => {
    const holder = new THREE.Group();
    holder.position.set(sx * 0.105, 0, 0);
    const disc = mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 28), MAT.white, 0, 0.075, 0);
    const rim = mesh(new THREE.CylinderGeometry(0.087, 0.087, 0.014, 28), MAT.plastic, 0, 0.055, 0);
    holder.add(disc, rim);
    return { holder, disc };
  };
  const padG = (sx: number) => {
    const p = mesh(new THREE.CylinderGeometry(0.092, 0.097, 0.022, 28), MAT.pad, sx * 0.105, 0.035, 0);
    return p;
  };

  const L = headG(-1);
  const R = headG(1);
  const padL = padG(-1);
  const padR = padG(1);
  g.add(L.holder, R.holder, padL, padR);
  b.spin.push({ obj: L.disc, speed: -7 }, { obj: R.disc, speed: 7 });

  // main body: motor housing + tank window
  const bodyG = new THREE.Group();
  bodyG.position.set(0, 0, 0);
  const body = mesh(new THREE.CylinderGeometry(0.075, 0.082, 0.26, 32), MAT.white, 0, 0.275, 0);
  const band = mesh(new THREE.CylinderGeometry(0.077, 0.077, 0.05, 32), MAT.graphite, 0, 0.36, 0);
  const tank = mesh(new THREE.BoxGeometry(0.03, 0.15, 0.028), MAT.glass, 0, 0.27, 0.072);
  const collar = mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.05, 20), MAT.plastic, 0, 0.42, 0);
  bodyG.add(body, band, tank, collar);
  g.add(bodyG);

  // battery (rear)
  const battG = new THREE.Group();
  const batt = mesh(new THREE.BoxGeometry(0.052, 0.115, 0.048), MAT.graphite, 0, 0.26, -0.088);
  const battDot = mesh(new THREE.BoxGeometry(0.02, 0.02, 0.008), MAT.accent, 0, 0.29, -0.114);
  battG.add(batt, battDot);
  g.add(battG);

  // telescopic shafts
  const shaftLow = new THREE.Group();
  const sl = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.5, 16), MAT.metal, 0, 0.69, 0);
  const clamp = mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 16), MAT.accent, 0, 0.66, 0);
  shaftLow.add(sl, clamp);
  g.add(shaftLow);

  const shaftUp = new THREE.Group();
  const su = mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.34, 16), MAT.metal, 0, 1.11, 0);
  const grip = mesh(new THREE.CapsuleGeometry(0.021, 0.11, 6, 14), MAT.graphite, 0, 1.31, 0);
  shaftUp.add(su, grip);
  g.add(shaftUp);

  part(b, shaftUp, [0.08, 0.52, 0]);
  part(b, shaftLow, [0, 0.3, 0]);
  part(b, bodyG, [0, 0.12, 0]);
  part(b, battG, [0.44, 0.18, 0.12]);
  part(b, L.holder, [-0.36, -0.03, 0]);
  part(b, R.holder, [0.36, -0.03, 0]);
  part(b, padL, [-0.58, -0.09, 0]);
  part(b, padR, [0.58, -0.09, 0]);

  anchor(b, "mop-handle", grip);
  anchor(b, "mop-motor", body);
  anchor(b, "mop-battery", batt);
  anchor(b, "mop-heads", L.disc);
  anchor(b, "mop-pads", padR);

  return b;
}

/* ================= ELECTRIC SPIN SCRUBBER ================= */

export function buildSpinScrubber(): Build {
  const b = newBuild();
  const g = b.group;

  // head housing — brushes attach underneath at y ≈ 0
  const headG = new THREE.Group();
  const headHousing = mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.055, 24), MAT.graphite, 0, 0.075, 0);
  const headCap = mesh(new THREE.CylinderGeometry(0.03, 0.052, 0.02, 24), MAT.darkSoft, 0, 0.045, 0, false);
  headG.add(headHousing, headCap);
  g.add(headG);

  const neckG = new THREE.Group();
  const neck = mesh(new THREE.SphereGeometry(0.045, 20, 14), MAT.white, 0, 0.13, 0);
  neckG.add(neck);
  g.add(neckG);

  const shaftG = new THREE.Group();
  const shaft = mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.24, 16), MAT.white, 0, 0.27, 0);
  const midRing = mesh(new THREE.CylinderGeometry(0.023, 0.023, 0.035, 16), MAT.accent, 0, 0.2, 0);
  shaftG.add(shaft, midRing);
  g.add(shaftG);

  const gripG = new THREE.Group();
  const gripBody = mesh(new THREE.CapsuleGeometry(0.03, 0.12, 6, 14), MAT.graphite, 0, 0.44, 0);
  const btn = mesh(new THREE.BoxGeometry(0.02, 0.03, 0.012), MAT.accent, 0, 0.42, 0.03);
  const hang = mesh(new THREE.TorusGeometry(0.014, 0.004, 8, 14), MAT.darkMetal, 0, 0.525, 0, false);
  gripG.add(gripBody, btn, hang);
  g.add(gripG);

  // slim accessory dock — on the pedestal's back-left corner, clear of the camera path
  const rack = new THREE.Group();
  rack.position.set(-0.34, 0, -0.26);
  const rackPlate = mesh(new THREE.BoxGeometry(0.018, 0.3, 0.3), MAT.graphite, 0, 0.18, 0, false);
  const stem = mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.07, 10), MAT.darkMetal, 0, 0.005, 0, false);
  const foot = mesh(new THREE.CylinderGeometry(0.05, 0.056, 0.012, 16), MAT.darkMetal, 0, -0.02, 0, false);
  rack.add(rackPlate, stem, foot);
  const pegYs = [0.26, 0.17, 0.08];
  for (let i = 0; i < 3; i++) {
    const peg = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.09, 10), MAT.metal, 0.05, pegYs[i], (i - 1) * 0.09);
    peg.rotation.z = Math.PI / 2;
    rack.add(peg);
  }
  g.add(rack);
  b.extras.rack = rack;

  // three interchangeable brushes
  const makeBrush = (kind: "flat" | "dome" | "sponge") => {
    const grp = new THREE.Group();
    const mount = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 14), MAT.darkMetal, 0, 0.05, 0);
    grp.add(mount);
    if (kind === "flat") {
      const base = mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.022, 22), MAT.white, 0, 0.03, 0);
      const bristles = mesh(new THREE.CylinderGeometry(0.05, 0.053, 0.02, 22), MAT.bristle, 0, 0.012, 0);
      grp.add(base, bristles);
    } else if (kind === "dome") {
      const dome = mesh(new THREE.SphereGeometry(0.05, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2), MAT.bristle, 0, 0.012, 0);
      const base = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 22), MAT.white, 0, 0.028, 0);
      grp.add(dome, base);
    } else {
      const pad = mesh(new THREE.CylinderGeometry(0.05, 0.052, 0.026, 22), MAT.sponge, 0, 0.025, 0);
      grp.add(pad);
    }
    return grp;
  };

  const brushes = [makeBrush("flat"), makeBrush("dome"), makeBrush("sponge")];
  brushes.forEach((br, i) => {
    // home: attached under head housing; park: on the rack pegs
    br.position.set(0, 0, 0);
    g.add(br);
    b.extras[`brush${i}`] = br;
    b.extras[`brush${i}Home`] = new THREE.Object3D();
    b.extras[`brush${i}Park`] = new THREE.Object3D();
    b.extras[`brush${i}Home`].position.set(0, 0.0, 0);
    b.extras[`brush${i}Park`].position.set(-0.255, pegYs[i] - 0.05, -0.26 + (i - 1) * 0.09);
    part(b, br, [0, 0, 0]); // handled manually in scene
  });

  // full engineering explode: grip lifts, shaft telescopes, neck + head separate
  part(b, gripG, [0, 0.36, 0]);
  part(b, shaftG, [0, 0.18, 0]);
  part(b, neckG, [0, 0.05, 0]);
  part(b, headG, [0, -0.045, 0.06]);

  b.spin.push({ obj: headG, speed: 0 }); // speed driven per-frame via extras

  anchor(b, "scrub-head", headHousing);
  return b;
}

/* ================= VC201 HANDHELD VACUUM ================= */

export function buildVacuum(): Build {
  const b = newBuild();
  const g = b.group;

  const base = mesh(new THREE.CylinderGeometry(0.06, 0.068, 0.05, 28), MAT.graphite, 0, 0.025, 0);
  g.add(base);

  const battG = new THREE.Group();
  const batt = mesh(new THREE.BoxGeometry(0.055, 0.085, 0.05), MAT.darkSoft, 0, 0.075, -0.052);
  const battCap = mesh(new THREE.BoxGeometry(0.03, 0.012, 0.02), MAT.accent, 0, 0.12, -0.052);
  battG.add(batt, battCap);
  g.add(battG);

  const motorG = new THREE.Group();
  const motor = mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.1, 28), MAT.graphite, 0, 0.15, 0);
  const motorRing = mesh(new THREE.TorusGeometry(0.052, 0.007, 10, 28), MAT.accent, 0, 0.2, 0);
  motorRing.rotation.x = Math.PI / 2;
  const vent = mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.02, 28), MAT.darkMetal, 0, 0.115, 0);
  motorG.add(motor, motorRing, vent);
  g.add(motorG);

  const filterG = new THREE.Group();
  const filter = mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.035, 24), MAT.white, 0, 0.24, 0);
  const pleat = mesh(new THREE.TorusGeometry(0.048, 0.006, 8, 24), MAT.plastic, 0, 0.24, 0);
  pleat.rotation.x = Math.PI / 2;
  filterG.add(filter, pleat);
  g.add(filterG);

  const cupG = new THREE.Group();
  const cup = mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.15, 28), MAT.glass, 0, 0.35, 0, false);
  const cupTop = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 28), MAT.plastic, 0, 0.43, 0);
  const debris = mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 16), MAT.darkSoft, 0, 0.3, 0, false);
  cupG.add(cup, cupTop, debris);
  g.add(cupG);

  const handleG = new THREE.Group();
  const handle = mesh(new THREE.TorusGeometry(0.062, 0.013, 12, 24, Math.PI), MAT.graphite, -0.075, 0.36, 0);
  handle.rotation.z = Math.PI / 2;
  const trigger = mesh(new THREE.BoxGeometry(0.014, 0.04, 0.02), MAT.accent, -0.055, 0.33, 0);
  handleG.add(handle, trigger);
  g.add(handleG);

  const nozzleG = new THREE.Group();
  const nozzle = mesh(new THREE.CylinderGeometry(0.022, 0.042, 0.16, 20), MAT.white, 0, 0.52, 0);
  const tip = mesh(new THREE.BoxGeometry(0.05, 0.018, 0.09), MAT.graphite, 0, 0.6, 0);
  nozzleG.add(nozzle, tip);
  g.add(nozzleG);

  part(b, nozzleG, [0, 0.36, 0]);
  part(b, cupG, [0.27, 0.2, 0]);
  part(b, handleG, [-0.3, 0.16, 0]);
  part(b, filterG, [0.36, 0.06, 0.02]);
  part(b, motorG, [0.16, -0.05, 0]);
  part(b, battG, [-0.28, -0.02, 0.1]);

  anchor(b, "vac-nozzle", nozzle);
  anchor(b, "vac-cup", cup);
  anchor(b, "vac-filter", filter);
  anchor(b, "vac-motor", motor);
  anchor(b, "vac-battery", batt);

  return b;
}

/* ================= VC101 CAR VACUUM ================= */

export function buildCarVacuum(): Build {
  const b = newBuild();
  const g = b.group;

  // main barrel held horizontal, nose forward (+x)
  const bodyG = new THREE.Group();
  bodyG.position.set(0, 0.085, 0);
  const barrel = mesh(new THREE.CapsuleGeometry(0.048, 0.17, 8, 24), MAT.white, 0, 0, 0);
  barrel.rotation.z = Math.PI / 2;
  const rearCap = mesh(
    new THREE.SphereGeometry(0.048, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    MAT.graphite,
    -0.085,
    0,
    0
  );
  rearCap.rotation.z = Math.PI / 2;
  const exhaust = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.022, 24), MAT.darkSoft, -0.1, 0, 0);
  exhaust.rotation.z = Math.PI / 2;
  const band = mesh(new THREE.CylinderGeometry(0.0495, 0.0495, 0.024, 24), MAT.accent, -0.015, 0, 0);
  band.rotation.z = Math.PI / 2;
  const rocker = mesh(new THREE.BoxGeometry(0.034, 0.012, 0.02), MAT.graphite, -0.045, 0.047, 0);
  const handle = mesh(new THREE.TorusGeometry(0.052, 0.011, 10, 20, Math.PI), MAT.graphite, -0.02, 0.015, 0);
  const nose = mesh(new THREE.CylinderGeometry(0.036, 0.048, 0.06, 24), MAT.plastic, 0.115, -0.012, 0);
  nose.rotation.z = -Math.PI / 2;
  bodyG.add(barrel, rearCap, exhaust, band, rocker, handle, nose);
  g.add(bodyG);

  // clear dust cup under the nose, latch at front
  const cupG = new THREE.Group();
  const cup = mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.075, 22), MAT.glass, 0.115, -0.075, 0, false);
  const cupCap = mesh(new THREE.CylinderGeometry(0.046, 0.042, 0.012, 22), MAT.graphite, 0.115, -0.118, 0, false);
  const latch = mesh(new THREE.BoxGeometry(0.014, 0.022, 0.01), MAT.accent, 0.115, -0.052, 0.046, false);
  cupG.add(cup, cupCap, latch);
  g.add(cupG);

  // crevice nozzle angled forward-down
  const nozzleG = new THREE.Group();
  const nozzle = mesh(new THREE.CylinderGeometry(0.009, 0.033, 0.13, 18), MAT.graphite, 0, 0, 0);
  const nozzleTip = mesh(new THREE.BoxGeometry(0.012, 0.016, 0.03), MAT.darkSoft, 0, -0.068, 0, false);
  nozzleG.add(nozzle, nozzleTip);
  nozzleG.position.set(0.185, 0.062, 0);
  nozzleG.rotation.z = -Math.PI / 2 - 0.16;
  g.add(nozzleG);

  // long 4.5m cord trailing back to a 12V plug
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.125, 0.085, 0),
    new THREE.Vector3(-0.26, 0.1, 0.15),
    new THREE.Vector3(-0.42, 0.0, 0.3),
    new THREE.Vector3(-0.6, -0.1, 0.22),
    new THREE.Vector3(-0.68, -0.13, 0.0),
  ]);
  const cord = new THREE.Mesh(new THREE.TubeGeometry(curve, 44, 0.006, 8), MAT.cord);
  cord.castShadow = true;
  const plug = mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.05, 12), MAT.graphite, -0.68, -0.16, 0);
  const plugTip = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.022, 10), MAT.metal, -0.685, -0.192, 0, false);
  g.add(cord, plug, plugTip);

  b.extras.nozzleTip = nozzleG;
  return b;
}

/* ================= GARMENT STEAMER ================= */

export function buildSteamer(): Build {
  const b = newBuild();
  const g = b.group;

  const heel = mesh(new THREE.CylinderGeometry(0.062, 0.07, 0.025, 22), MAT.graphite, 0, 0.0125, 0);
  const body = mesh(new THREE.CapsuleGeometry(0.06, 0.13, 8, 20), MAT.white, 0, 0.15, 0);
  const back = mesh(new THREE.BoxGeometry(0.07, 0.16, 0.03), MAT.graphite, 0, 0.15, -0.055);
  const tankWin = mesh(new THREE.BoxGeometry(0.022, 0.1, 0.02), MAT.glass, 0, 0.14, 0.062);
  const btn = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 12), MAT.accent, 0, 0.1, 0.055);
  btn.rotation.x = Math.PI / 2;
  g.add(heel, body, back, tankWin, btn);

  const headG = new THREE.Group();
  headG.position.set(0, 0.27, 0.01);
  headG.rotation.x = -0.5;
  const headNeck = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 20), MAT.white, 0, 0, 0);
  const plate = mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 24), MAT.metal, 0, 0.032, 0);
  headG.add(headNeck, plate);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const vent = mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.016, 8), MAT.darkSoft, Math.cos(a) * 0.03, 0.036, Math.sin(a) * 0.03, false);
    headG.add(vent);
  }
  g.add(headG);

  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, -0.07),
    new THREE.Vector3(0.05, 0.06, -0.18),
    new THREE.Vector3(-0.05, 0.02, -0.3),
    new THREE.Vector3(-0.16, 0.015, -0.36),
  ]);
  const cord = new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 30, 0.006, 8), MAT.cord);
  cord.castShadow = true;
  g.add(cord);

  b.extras.steamHead = plate;
  anchor(b, "steam-head", plate);
  return b;
}

/* ================= HOT AIR BRUSH ================= */

export function buildHotAirBrush(): Build {
  const b = newBuild();
  const g = b.group;

  const handle = mesh(new THREE.CylinderGeometry(0.028, 0.033, 0.2, 20), MAT.graphite, 0, 0.1, 0);
  const sw = mesh(new THREE.BoxGeometry(0.016, 0.045, 0.012), MAT.accent, 0, 0.12, 0.03);
  const neck = mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.04, 16), MAT.white, 0, 0.22, 0);
  g.add(handle, sw, neck);

  const barrel = mesh(new THREE.CapsuleGeometry(0.046, 0.16, 8, 20), MAT.metal, 0, 0.36, 0);
  const cap = mesh(new THREE.CylinderGeometry(0.03, 0.046, 0.03, 20), MAT.accent, 0, 0.465, 0);
  g.add(barrel, cap);

  // bristle studs
  const bristleGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.034, 6);
  const inst = new THREE.InstancedMesh(bristleGeo, MAT.bristle, 42);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  let idx = 0;
  for (let row = 0; row < 7; row++) {
    const y = 0.285 + row * 0.026;
    for (let k = 0; k < 6; k++) {
      if (idx >= 42) break;
      const a = (k / 6) * Math.PI * 2 + (row % 2) * 0.5;
      const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      q.setFromUnitVectors(up, dir);
      m4.compose(
        new THREE.Vector3(dir.x * 0.058, y, dir.z * 0.058),
        q,
        new THREE.Vector3(1, 1, 1)
      );
      inst.setMatrixAt(idx++, m4);
    }
  }
  inst.instanceMatrix.needsUpdate = true;
  g.add(inst);

  for (let i = 0; i < 3; i++) {
    const vent = mesh(new THREE.BoxGeometry(0.03, 0.006, 0.01), MAT.darkSoft, 0, 0.05 + i * 0.02, 0.03, false);
    g.add(vent);
  }

  anchor(b, "hab-barrel", barrel);
  return b;
}

/* ================= WEARABLE BREAST PUMP (EVO) ================= */

export function buildEvoPump(): Build {
  const b = newBuild();
  const g = b.group;

  const shellG = new THREE.Group();
  const shell = mesh(new THREE.SphereGeometry(0.06, 36, 26), MAT.maroon, 0, 0.075, 0);
  shell.scale.set(1, 0.78, 0.62);
  const logoDot = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 12), MAT.white, 0, 0.075, -0.04, false);
  logoDot.rotation.x = Math.PI / 2;
  const strap = mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 18), MAT.maroon, 0, 0.128, 0);
  shellG.add(shell, logoDot, strap);
  g.add(shellG);

  const unitG = new THREE.Group();
  const unit = mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.032, 26), MAT.graphite, 0, 0.075, 0);
  unit.rotation.x = Math.PI / 2;
  const screen = mesh(new THREE.BoxGeometry(0.024, 0.012, 0.006), MAT.strip as unknown as THREE.Material, 0, 0.09, -0.02, false);
  unitG.add(unit, screen);
  g.add(unitG);

  const membraneG = new THREE.Group();
  const membrane = mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.007, 24), MAT.silicone, 0, 0.075, 0.028);
  membrane.rotation.x = Math.PI / 2;
  const mRing = mesh(new THREE.TorusGeometry(0.039, 0.005, 8, 24), MAT.silicone, 0, 0.075, 0.028);
  membraneG.add(membrane, mRing);
  g.add(membraneG);

  const flangeG = new THREE.Group();
  const flange = mesh(
    new THREE.CylinderGeometry(0.026, 0.048, 0.05, 24, 1, true),
    MAT.silicone,
    0,
    0.075,
    0.062
  );
  flange.rotation.x = Math.PI / 2;
  flangeG.add(flange);
  g.add(flangeG);

  const cupG = new THREE.Group();
  const cup = mesh(new THREE.CylinderGeometry(0.041, 0.046, 0.062, 24), MAT.glass, 0, 0.02, 0.04, false);
  cup.rotation.x = 0.32;
  const cupBase = mesh(new THREE.CylinderGeometry(0.043, 0.041, 0.008, 24), MAT.white, 0, -0.009, 0.03, false);
  cupBase.rotation.x = 0.32;
  cupG.add(cup, cupBase);
  g.add(cupG);

  part(b, shellG, [0, 0.19, -0.13]);
  part(b, flangeG, [0, 0.06, 0.2]);
  part(b, membraneG, [0, 0.12, 0.1]);
  part(b, cupG, [0, -0.02, 0.24]);
  part(b, unitG, [0, 0.02, -0.02]);

  anchor(b, "evo-shell", shell);
  anchor(b, "evo-flange", flange);
  anchor(b, "evo-membrane", membrane);
  anchor(b, "evo-cup", cup);
  anchor(b, "evo-unit", unit);

  return b;
}

/* ================= BP-111 WEARABLE PUMP ================= */

export function buildBP111(): Build {
  const b = newBuild();
  const g = b.group;

  const bodyG = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(0.088, 0.125, 0.05), MAT.white, 0, 0.0625, 0);
  const cap = mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.052, 20), MAT.white, 0, 0.125, 0);
  cap.rotation.x = Math.PI / 2;
  const screen = mesh(new THREE.BoxGeometry(0.044, 0.028, 0.004), MAT.graphite, 0, 0.095, 0.026, false);
  const screenGlow = mesh(new THREE.BoxGeometry(0.036, 0.02, 0.002), MAT.strip, 0, 0.095, 0.0285, false);
  const dot = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.005, 10), MAT.accent, 0, 0.052, 0.027, false);
  dot.rotation.x = Math.PI / 2;
  bodyG.add(body, cap, screen, screenGlow, dot);
  g.add(bodyG);

  const cupG = new THREE.Group();
  const cup = mesh(new THREE.CylinderGeometry(0.034, 0.039, 0.055, 22), MAT.glass, 0, 0.03, 0.048, false);
  cup.rotation.x = 0.5;
  const cupBase = mesh(new THREE.CylinderGeometry(0.036, 0.034, 0.008, 22), MAT.plastic, 0, 0.002, 0.034, false);
  cupBase.rotation.x = 0.5;
  cupG.add(cup, cupBase);
  g.add(cupG);

  const strap = mesh(new THREE.TorusGeometry(0.02, 0.004, 8, 16), MAT.plastic, 0, 0.152, 0, false);
  g.add(strap);

  return b;
}

/* ================= BP-222 WEARABLE PUMP ================= */

export function buildBP222(): Build {
  const b = newBuild();
  const g = b.group;

  const body = mesh(new THREE.SphereGeometry(0.055, 26, 18), MAT.white, 0, 0.05, 0);
  body.scale.set(1, 0.8, 0.62);
  const band = mesh(new THREE.TorusGeometry(0.046, 0.006, 8, 24), MAT.graphite, 0, 0.05, 0);
  band.rotation.x = Math.PI / 2;
  const cup = mesh(new THREE.CylinderGeometry(0.036, 0.041, 0.05, 22), MAT.glass, 0, 0.012, 0.04, false);
  cup.rotation.x = 0.4;
  const cupBase = mesh(new THREE.CylinderGeometry(0.038, 0.036, 0.007, 22), MAT.plastic, 0, -0.012, 0.03, false);
  cupBase.rotation.x = 0.4;
  const dot = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.005, 10), MAT.accent, 0, 0.078, -0.028, false);
  dot.rotation.x = Math.PI / 2;
  g.add(body, band, cup, cupBase, dot);

  return b;
}

/* ================= SHIRT ON HANGER (steamer zone) ================= */

export function buildShirtOnHanger(): { group: THREE.Group; shirt: THREE.Mesh } {
  const group = new THREE.Group();

  // T-shirt silhouette, origin at hem centre, height 0.62
  const s = new THREE.Shape();
  s.moveTo(-0.16, 0);
  s.lineTo(-0.16, 0.4);
  s.lineTo(-0.245, 0.355);
  s.lineTo(-0.27, 0.5);
  s.lineTo(-0.17, 0.575);
  s.lineTo(-0.075, 0.6);
  s.quadraticCurveTo(0, 0.54, 0.075, 0.6);
  s.lineTo(0.17, 0.575);
  s.lineTo(0.27, 0.5);
  s.lineTo(0.245, 0.355);
  s.lineTo(0.16, 0.4);
  s.lineTo(0.16, 0);
  const geo = new THREE.ShapeGeometry(s, 18);
  const shirt = new THREE.Mesh(geo, MAT.fabric);
  shirt.castShadow = true;
  group.add(shirt);

  // wire hanger: hook over the rail + shoulder triangle
  const hookPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.615, 0),
    new THREE.Vector3(0.014, 0.665, 0),
    new THREE.Vector3(-0.014, 0.7, 0),
  ]);
  const hook = new THREE.Mesh(new THREE.TubeGeometry(hookPath, 12, 0.0035, 8), MAT.darkMetal);
  const triPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.16, 0.56, 0),
    new THREE.Vector3(0, 0.645, 0),
    new THREE.Vector3(0.16, 0.56, 0),
  ]);
  const tri = new THREE.Mesh(new THREE.TubeGeometry(triPath, 16, 0.0035, 8), MAT.darkMetal);
  hook.castShadow = true;
  tri.castShadow = true;
  group.add(hook, tri);

  return { group, shirt };
}

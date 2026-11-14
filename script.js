/* =========================================================
   Matti Ur Rehman — 3D Portfolio
   Three.js world + procedural 3D character, GSAP scroll
   ========================================================= */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add("js");

const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => innerWidth <= 900;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const CONTACT_EMAIL = "mattirehman343@gmail.com";
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const FORMSPREE_URL = "https://formspree.io/f/xeewzybv"; // fallback

/* =========================================================
   1. Smooth scroll (Lenis) + ScrollTrigger
   ========================================================= */
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollTo = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
};
document.querySelectorAll("[data-scroll]").forEach((a) =>
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href?.startsWith("#")) return;
    e.preventDefault();
    nav.classList.remove("open");
    scrollTo(href);
  })
);

/* =========================================================
   2. 3D WORLD
   ========================================================= */
const canvas = document.getElementById("webgl");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (err) {
  document.documentElement.classList.add("no-webgl");
  document.body.classList.add("no-webgl");
}

const world = renderer ? createWorld(renderer) : null;

function createWorld(renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05050b);
  scene.fog = new THREE.Fog(0x05050b, 9, 30);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.15, 7.2);

  /* ---------- Lights ---------- */
  scene.add(new THREE.HemisphereLight(0xb9b5ff, 0x140a1a, 0.55));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
  key.position.set(2.5, 4, 5);
  scene.add(key);
  const rimV = new THREE.PointLight(0x8b5cf6, 26, 12, 1.6);
  rimV.position.set(-3, 2.2, -1.5);
  scene.add(rimV);
  const rimC = new THREE.PointLight(0x22d3ee, 22, 12, 1.6);
  rimC.position.set(3.2, 1, -1.8);
  scene.add(rimC);

  /* ---------- Starfield (moves with scroll) ---------- */
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const starCount = isMobile() ? 1100 : 2200;
  const starGeo = new THREE.BufferGeometry();
  const sp = new Float32Array(starCount * 3);
  const sc = new Float32Array(starCount * 3);
  const palette = [new THREE.Color(0x8b5cf6), new THREE.Color(0x22d3ee), new THREE.Color(0xf472b6), new THREE.Color(0xffffff)];
  for (let i = 0; i < starCount; i++) {
    sp[i * 3] = (Math.random() - 0.5) * 34;
    sp[i * 3 + 1] = 6 - Math.random() * 60;
    sp[i * 3 + 2] = -Math.random() * 22 + 2;
    const c = palette[Math.random() < 0.55 ? 3 : (Math.random() * 3) | 0];
    sc.set([c.r, c.g, c.b], i * 3);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(sc, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.85, map: dotTexture(), depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  worldGroup.add(stars);

  /* ---------- Floating sculptures down the scroll path ---------- */
  const floaters = [];
  const addFloater = (mesh, x, y, z, spin) => {
    mesh.position.set(x, y, z);
    mesh.userData = { baseY: y, spin, phase: Math.random() * 6 };
    worldGroup.add(mesh);
    floaters.push(mesh);
  };
  const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12 });
  const violetMetal = new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: 0.8, roughness: 0.22, emissive: 0x2a0f5c, emissiveIntensity: 0.6 });
  const cyanWire = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.35 });
  const pinkWire = new THREE.MeshBasicMaterial({ color: 0xf472b6, wireframe: true, transparent: true, opacity: 0.3 });

  addFloater(new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.15, 160, 24), violetMetal), -0.8, 2.6, -9, [0.3, 0.4]);
  addFloater(new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), cyanWire), 6.2, -3.4, -7, [0.15, 0.2]);
  addFloater(new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), chrome), -5.4, -7.5, -4, [0.5, 0.3]);
  addFloater(new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 16, 100), chrome), 5.8, -10.5, -5, [0.6, 0.2]);
  addFloater(new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), pinkWire), -6.6, -14, -7, [0.2, 0.25]);
  addFloater(new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 48), violetMetal), 5.4, -18, -4, [0.2, 0.2]);
  addFloater(new THREE.Mesh(new THREE.TorusKnotGeometry(0.45, 0.12, 128, 16, 3, 5), chrome), -5.6, -22.5, -5, [0.4, 0.3]);
  addFloater(new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), cyanWire), 6.6, -26, -7, [0.15, 0.3]);
  addFloater(new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), violetMetal), -6, -31, -6, [0.3, 0.5]);

  // planet with ring
  const planet = new THREE.Group();
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 48, 48), new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.3, roughness: 0.5, emissive: 0x3b0764, emissiveIntensity: 0.5 })));
  const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.35, 80), new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.35 }));
  ring.rotation.x = Math.PI / 2.4;
  planet.add(ring);
  addFloater(planet, -7.5, -4.2, -12, [0.05, 0.15]);

  /* ---------- Synthwave wave-grid at the bottom of the world ---------- */
  const gridW = isMobile() ? 60 : 90, gridH = 40;
  const waveGeo = new THREE.BufferGeometry();
  const wp = new Float32Array(gridW * gridH * 3);
  for (let i = 0; i < gridW; i++) for (let j = 0; j < gridH; j++) {
    const k = (i * gridH + j) * 3;
    wp[k] = (i / (gridW - 1) - 0.5) * 36;
    wp[k + 2] = -(j / (gridH - 1)) * 22 + 3;
  }
  waveGeo.setAttribute("position", new THREE.BufferAttribute(wp, 3));
  const waveGrid = new THREE.Points(waveGeo, new THREE.PointsMaterial({ size: 0.06, color: 0x8b5cf6, transparent: true, opacity: 0.8, map: dotTexture(), depthWrite: false, blending: THREE.AdditiveBlending }));
  waveGrid.position.y = -37.9;
  worldGroup.add(waveGrid);

  /* ---------- Character ---------- */
  const hero = buildCharacter();
  scene.add(hero.root);

  /* ---------- Scroll-driven character choreography ---------- */
  // Each section defines where Matti stands. Values lerp smoothly in the render loop.
  const poses = {
    desktop: {
      hero:     { x: 2.55, y: -0.42, rot: -0.35, s: 0.9 },
      about:    { x: -2.45, y: -0.35, rot: 0.5, s: 0.86 },
      skills:   { x: -2.6, y: 4.2, rot: 0.4, s: 0.7 },
      projects: { x: 2.4, y: 4.2, rot: -0.4, s: 0.7 },
      journey:  { x: 2.5, y: -0.35, rot: -0.5, s: 0.86 },
      contact:  { x: -2.5, y: -0.4, rot: 0.45, s: 0.86 },
    },
    mobile: {
      hero:     { x: 0, y: 1.3, rot: 0, s: 0.78 },
      about:    { x: 0, y: 4.2, rot: 0, s: 0.78 },
      skills:   { x: 0, y: 4.2, rot: 0, s: 0.78 },
      projects: { x: 0, y: 4.2, rot: 0, s: 0.78 },
      journey:  { x: 0, y: 4.2, rot: 0, s: 0.78 },
      contact:  { x: 0, y: 4.2, rot: 0, s: 0.78 },
    },
  };
  let scene_ = "hero";
  const target = { ...poses.desktop.hero, y: 6 };
  const current = { ...target };
  const pose = () => (isMobile() ? poses.mobile : poses.desktop)[scene_];

  function setScene(name) {
    if (scene_ === name) return;
    scene_ = name;
    Object.assign(target, pose());
    if (name === "contact" && !isMobile()) setTimeout(() => wave("Let's build something! 🚀", 2), 500);
    if (name === "about" && !isMobile()) setTimeout(() => say("That's me — in real life 😄", 2400), 600);
    if (name === "journey" && !isMobile()) setTimeout(() => say("Always learning 📚", 2200), 600);
    if (name === "skills" || name === "projects") hideBubble();
  }

  /* ---------- Speech bubble + wave ---------- */
  const bubble = document.getElementById("bubble");
  const bubbleText = document.getElementById("bubble-text");
  let bubbleTimer;
  function say(text, ms = 2600) {
    clearTimeout(bubbleTimer);
    bubbleText.textContent = text;
    bubble.classList.add("show");
    bubbleTimer = setTimeout(hideBubble, ms);
  }
  function hideBubble() { bubble.classList.remove("show"); }

  let waveUntil = 0, waveStart = 0;
  function wave(text = "Hello! 👋 I'm Matti", times = 2.5) {
    const now = performance.now() / 1000;
    waveStart = now;
    waveUntil = now + times * 1.05;
    hero.jump = 1;
    say(text, times * 1050 + 600);
  }

  /* ---------- Pointer ---------- */
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  }, { passive: true });

  // click the character to make him wave
  const ray = new THREE.Raycaster();
  canvas.style.pointerEvents = "none";
  addEventListener("click", (e) => {
    if (e.target.closest("a,button,input,textarea,form,.card,.project,.holo,.stat,.tl,.sphere")) return;
    const p = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(p, camera);
    if (ray.intersectObject(hero.root, true).length) wave(["Hey there! 👋", "Salam! 🤝", "Nice to meet you! ✨", "Hire me? 😄"][(Math.random() * 4) | 0], 1.6);
  });

  /* ---------- Resize ---------- */
  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = isMobile() ? 42 : 35;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    Object.assign(target, pose());
    // keep phones clean: only wireframes float behind the text
    floaters.forEach((f) => (f.visible = !isMobile() || !!f.material?.wireframe));
  }
  addEventListener("resize", onResize);
  onResize();

  /* ---------- Loop ---------- */
  const clock = new THREE.Clock();
  const headWorld = new THREE.Vector3();
  let scrollP = 0, scrollVel = 0, prevX = current.x, camTilt = 0;
  let visible = true;
  document.addEventListener("visibilitychange", () => (visible = !document.hidden));

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    mouse.sx = lerp(mouse.sx, mouse.x, 0.06);
    mouse.sy = lerp(mouse.sy, mouse.y, 0.06);

    // ---- world parallax with scroll
    const max = document.documentElement.scrollHeight - innerHeight || 1;
    const p = clamp(scrollY / max, 0, 1);
    scrollVel = lerp(scrollVel, (p - scrollP) * 60, 0.1);
    scrollP = p;
    worldGroup.position.y = lerp(worldGroup.position.y, p * 36, 0.08);
    stars.rotation.y = t * 0.012;
    camera.position.x = lerp(camera.position.x, mouse.sx * 0.35, 0.05);
    camera.position.y = lerp(camera.position.y, 0.15 + mouse.sy * 0.2, 0.05);
    camera.lookAt(0, 0, 0);
    camTilt = lerp(camTilt, clamp(scrollVel * 0.3, -0.04, 0.04), 0.1);
    camera.rotation.z += camTilt;

    floaters.forEach((f) => {
      f.rotation.x += f.userData.spin[0] * dt;
      f.rotation.y += f.userData.spin[1] * dt;
      f.position.y = f.userData.baseY + Math.sin(t * 0.6 + f.userData.phase) * 0.25;
    });

    // synth wave
    const pos = waveGeo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] = Math.sin(pos[i] * 0.35 + t * 1.2) * 0.35 + Math.cos(pos[i + 2] * 0.45 + t) * 0.35;
    }
    waveGeo.attributes.position.needsUpdate = true;

    // ---- character placement
    const k = 1 - Math.pow(0.0025, dt); // frame-rate independent smoothing
    current.x = lerp(current.x, target.x, k);
    current.y = lerp(current.y, target.y, k);
    current.s = lerp(current.s, target.s, k);
    const vx = (current.x - prevX) / Math.max(dt, 1e-3);
    prevX = current.x;
    const run = clamp(Math.abs(vx) * 0.35 + Math.abs(target.y - current.y) * 0.25, 0, 1);
    const faceRun = clamp(vx * 0.35, -1.1, 1.1);
    current.rot = lerp(current.rot, target.rot + faceRun, k);

    hero.root.position.set(current.x, current.y, 0);
    hero.root.scale.setScalar(current.s);
    hero.root.rotation.y = current.rot + mouse.sx * 0.25;
    hero.body.rotation.z = lerp(hero.body.rotation.z, clamp(-vx * 0.05, -0.2, 0.2), 0.1);

    hero.animate(t, dt, {
      run,
      waving: t < waveUntil,
      waveT: t - waveStart,
      lookX: mouse.sx, lookY: mouse.sy,
    });

    // ---- bubble follows head
    if (bubble.classList.contains("show")) {
      hero.head.getWorldPosition(headWorld);
      headWorld.y += 0.72 * current.s;
      headWorld.x += 0.2 * current.s;
      headWorld.project(camera);
      const bx = (headWorld.x * 0.5 + 0.5) * innerWidth;
      const by = (-headWorld.y * 0.5 + 0.5) * innerHeight;
      bubble.style.left = `${bx}px`;
      bubble.style.top = `${by}px`;
      if (headWorld.y > 1.1 || headWorld.y < -1.1) hideBubble();
    }

    renderer.render(scene, camera);
  }
  tick();

  return {
    setScene, wave, say, hideBubble,
    intro() {
      Object.assign(target, pose());
      current.y = target.y + 5; // drop in from the sky
      current.x = target.x;
      current.rot = target.rot;
      hero.landAt = performance.now() / 1000;
      setTimeout(() => wave("Hello! 👋 I'm Matti", 3), 900);
    },
  };
}

/* =========================================================
   3. PROCEDURAL 3D CHARACTER (stylised, modelled on Matti's photos:
      swept-back black hair, full beard, burgundy three-piece suit,
      white shirt, black tie, brown shoes, tan-strap watch)
   ========================================================= */
function buildCharacter() {
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const S = (color, roughness = 0.6, metalness = 0, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const fabric = (color, sheen) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.72, sheen: 1, sheenColor: new THREE.Color(sheen), sheenRoughness: 0.45 });
  const mat = {
    skin: S(0x8a5439, 0.55, 0, { envMapIntensity: 0.5 }),
    lip: S(0x6b2f2a, 0.45),
    suit: fabric(0x3a1222, 0x7a3352),
    lapel: fabric(0x2e0e1b, 0x8a3c5c),
    vest: fabric(0x2c0d19, 0x5e2440),
    shirt: S(0xf4f3f7, 0.42),
    tie: S(0x0d0d12, 0.28, 0.1),
    hair: S(0x0f0d12, 0.36, 0.05),
    beard: S(0x18131a, 0.88),
    shoe: S(0x5a2c16, 0.22, 0.12),
    sole: S(0x1a110c, 0.7),
    eyeW: S(0xffffff, 0.2),
    iris: S(0x3d2416, 0.25),
    pupil: S(0x050505, 0.1),
    shine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    strap: S(0xb98a5c, 0.5),
    steel: S(0xd5d8e0, 0.18, 1),
    button: S(0x1d1018, 0.3, 0.5),
    platform: S(0x0d0b18, 0.25, 0.9),
  };
  const mesh = (geo, m, parent, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const tube = (pts, r, seg = 24) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, 8, false);
  const flat = (pts, depth = 0.012, bevel = 0.004) => {
    const sh = new THREE.Shape();
    pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
    sh.closePath();
    return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6 });
  };
  // a sphere whose surface is sculpted by fn(unitDir) -> radius multiplier (+ optional offset)
  const sculpt = (R, fn, w = 72, h = 56) => {
    const g = new THREE.SphereGeometry(1, w, h);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize();
      const out = fn(v.clone());
      p.setXYZ(i, out.x * R, out.y * R, out.z * R);
    }
    g.computeVertexNormals();
    // smooth the UV seam normals
    const n = g.attributes.normal, key = new Map();
    for (let i = 0; i < p.count; i++) {
      const k = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
      if (!key.has(k)) key.set(k, []);
      key.get(k).push(i);
    }
    key.forEach((ids) => {
      if (ids.length < 2) return;
      const a = new THREE.Vector3();
      ids.forEach((i) => a.add(v.fromBufferAttribute(n, i)));
      a.normalize();
      ids.forEach((i) => n.setXYZ(i, a.x, a.y, a.z));
    });
    return g;
  };

  const root = new THREE.Group();     // positioned by scroll
  const rig = new THREE.Group();      // origin at the feet
  rig.position.y = -0.95;
  root.add(rig);

  /* ---- glowing platform ---- */
  const plat = new THREE.Group();
  rig.add(plat);
  mesh(new THREE.CylinderGeometry(0.52, 0.57, 0.06, 64), mat.platform, plat, 0, -0.03, 0);
  const ring1 = mesh(new THREE.TorusGeometry(0.55, 0.009, 8, 96), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9 }), plat);
  ring1.rotation.x = Math.PI / 2;
  const ring2 = mesh(new THREE.TorusGeometry(0.74, 0.005, 8, 120), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 }), plat, 0, -0.02, 0);
  ring2.rotation.x = Math.PI / 2;
  const glow = mesh(new THREE.PlaneGeometry(2.3, 2.3), new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), plat, 0, 0.005, 0);
  glow.rotation.x = -Math.PI / 2;
  const shadow = mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }), plat, 0, 0.01, 0);
  shadow.rotation.x = -Math.PI / 2;
  const beam = mesh(new THREE.CylinderGeometry(0.54, 0.54, 2.2, 48, 1, true),
    new THREE.MeshBasicMaterial({ map: beamTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, opacity: 0.3 }), plat, 0, 1.1, 0);

  /* ---- body (everything that hops) ---- */
  const body = new THREE.Group();
  rig.add(body);

  // legs: tapered trousers + polished brogues
  const legs = [];
  [-1, 1].forEach((side) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.1, 0.6, 0);
    body.add(hip);
    mesh(lathe([[0, 0.05], [0.07, 0.045], [0.092, 0.01], [0.088, -0.22], [0.076, -0.48], [0.08, -0.52], [0, -0.52]], 32), mat.suit, hip);
    const shoe = new THREE.Group();
    shoe.position.set(0, -0.53, 0.025);
    hip.add(shoe);
    mesh(new THREE.SphereGeometry(0.07, 24, 16), mat.shoe, shoe, 0, -0.012, 0.03).scale.set(1, 0.62, 1.65);
    mesh(new THREE.CylinderGeometry(0.068, 0.07, 0.018, 24), mat.sole, shoe, 0, -0.05, 0.03).scale.set(1, 1, 1.62);
    legs.push(hip);
  });

  // torso: tailored jacket (lathe) with the open front of a three-piece suit
  const torso = new THREE.Group();
  torso.position.y = 0.58;
  body.add(torso);
  const jacket = mesh(lathe([[0, -0.08], [0.2, -0.08], [0.226, -0.045], [0.214, 0.1], [0.218, 0.28], [0.248, 0.43], [0.256, 0.48], [0.225, 0.53], [0.13, 0.565], [0, 0.575]], 64), mat.suit, torso);
  jacket.scale.z = 0.72;

  const front = new THREE.Group();
  front.position.set(0, 0.545, 0.163);
  front.rotation.x = 0.07;
  torso.add(front);
  mesh(flat([[-0.12, 0.01], [0.12, 0.01], [0, -0.45]], 0.01, 0.003), mat.vest, front, 0, 0, 0);                    // waistcoat
  mesh(flat([[-0.075, 0.012], [0.075, 0.012], [0, -0.21]], 0.008, 0.002), mat.shirt, front, 0, 0, 0.008);          // shirt
  mesh(flat([[-0.018, 0], [0.018, 0], [0.03, -0.2], [0, -0.235], [-0.03, -0.2]], 0.008, 0.003), mat.tie, front, 0, -0.03, 0.014); // tie
  mesh(new THREE.SphereGeometry(0.024, 14, 12), mat.tie, front, 0, -0.022, 0.02).scale.set(1.25, 0.95, 0.7);      // knot
  [-1, 1].forEach((s) => {
    mesh(flat([[s * 0.012, 0.03], [s * 0.078, 0.022], [s * 0.04, -0.045]], 0.006, 0.002), mat.shirt, front, 0, 0, 0.02); // collar points
    mesh(flat([[s * 0.088, 0.012], [s * 0.16, 0.004], [s * 0.172, -0.06], [s * 0.128, -0.088], [s * 0.152, -0.12], [s * 0.036, -0.46], [0, -0.46]], 0.012, 0.004), mat.lapel, front, 0, 0, 0.012); // lapels
  });
  [-0.27, -0.33, -0.39].forEach((y) => mesh(new THREE.SphereGeometry(0.0095, 10, 8), mat.button, front, 0, y, 0.016));
  mesh(new THREE.SphereGeometry(0.014, 12, 10), mat.button, front, 0, -0.5, 0.004);                                // jacket button
  mesh(new THREE.BoxGeometry(0.085, 0.006, 0.01), mat.lapel, torso, 0.13, 0.33, 0.16).rotation.z = -0.08;           // breast pocket
  mesh(new THREE.CylinderGeometry(0.058, 0.066, 0.15, 24), mat.skin, torso, 0, 0.6, 0);                             // neck

  // arms: shoulder -> elbow -> hand, real fingers so the wave reads
  const makeArm = (side, withWatch) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.245, 0.475, 0);
    torso.add(shoulder);
    mesh(new THREE.SphereGeometry(0.07, 20, 16), mat.suit, shoulder);
    mesh(new THREE.CapsuleGeometry(0.068, 0.2, 8, 16), mat.suit, shoulder, 0, -0.13, 0);
    const elbow = new THREE.Group();
    elbow.position.y = -0.27;
    shoulder.add(elbow);
    mesh(new THREE.CapsuleGeometry(0.062, 0.17, 8, 16), mat.suit, elbow, 0, -0.11, 0);
    mesh(new THREE.CylinderGeometry(0.052, 0.054, 0.035, 18), mat.shirt, elbow, 0, -0.235, 0);                     // cuff
    const hand = new THREE.Group();
    hand.position.y = -0.255;
    elbow.add(hand);
    mesh(new THREE.SphereGeometry(0.05, 18, 14), mat.skin, hand, 0, -0.035, 0).scale.set(0.95, 1, 0.52);           // palm
    [-0.022, -0.007, 0.008, 0.023].forEach((x, i) => {
      const len = [0.03, 0.04, 0.038, 0.028][i];
      const f = mesh(new THREE.CapsuleGeometry(0.0115, len, 4, 8), mat.skin, hand, x * 1.05, -0.085 - len * 0.35, 0);
      f.rotation.z = (i - 1.5) * 0.09;
    });
    const thumb = mesh(new THREE.CapsuleGeometry(0.012, 0.03, 4, 8), mat.skin, hand, -side * 0.045, -0.045, 0.012);
    thumb.rotation.z = -side * 0.75;
    if (withWatch) {
      const strap = mesh(new THREE.TorusGeometry(0.054, 0.011, 8, 28), mat.strap, elbow, 0, -0.205, 0);
      strap.rotation.x = Math.PI / 2;
      const face = mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 24), mat.steel, elbow, 0, -0.205, 0.058);
      face.rotation.x = Math.PI / 2;
    }
    return { shoulder, elbow, hand, side };
  };
  const armR = makeArm(-1, false); // character's right (viewer's left) — the waving arm
  const armL = makeArm(1, true);   // character's left wears the watch

  /* ---- head ---- */
  const R = 0.27;
  const head = new THREE.Group();
  head.position.set(0, 0.625, 0);
  torso.add(head);
  const skull = new THREE.Group();
  skull.position.y = 0.27;
  skull.scale.set(0.94, 1.04, 0.98);
  head.add(skull);
  mesh(new THREE.SphereGeometry(R, 56, 44), mat.skin, skull);
  // point on the face: x,y in skull units, pushed out by `out`
  const onFace = (x, y, out = 0) => new THREE.Vector3(x, y, Math.sqrt(Math.max(R * R - x * x - y * y, 0)) + out);

  // ears
  [-1, 1].forEach((s) => {
    mesh(new THREE.SphereGeometry(0.05, 16, 12), mat.skin, skull, s * 0.272, -0.01, -0.02).scale.set(0.5, 1, 0.7);
  });

  // hair: one sculpted shell — high swept-back quiff, short tidy sides
  const hairFn = (n) => {
    const fr = Math.max(n.z, 0), bk = Math.max(-n.z, 0);
    const thr = 0.56 * fr - 0.55 * bk - 0.02 - 0.06 * (1 - Math.abs(n.x)) * fr;
    const m = ss(thr - 0.025, thr + 0.06, n.y);
    const quiff = Math.exp(-((n.y - 0.7) ** 2 + (n.z - 0.62) ** 2) / 0.16) * (1 - 0.55 * n.x * n.x);
    const crown = ss(0.1, 0.9, n.y);
    const thick = 0.035 + 0.05 * crown * (0.5 + 0.5 * fr) + 0.34 * quiff;
    const o = n.multiplyScalar(0.965 + m * thick);
    o.y += m * quiff * 0.09;
    return o;
  };
  mesh(sculpt(R, hairFn, 128, 96), mat.hair, skull);

  // beard: sculpted shell over jaw + sideburns, opening for the mouth
  const beardFn = (n) => {
    const bthr = -0.34 + 0.48 * Math.abs(n.x);
    let m = (1 - ss(bthr - 0.05, bthr + 0.05, n.y)) * ss(-0.12, 0.12, n.z);
    if (n.z > 0.4) m *= ss(0.72, 1.05, Math.hypot(n.x / 0.3, (n.y + 0.39) / 0.11));
    const chin = ss(-0.45, -0.95, n.y) * ss(-0.1, 0.6, n.z);
    const r = 0.965 + m * (0.055 + 0.03 * ss(-0.3, -0.85, n.y));
    const o = n.multiplyScalar(r);
    o.y -= m * chin * 0.06;
    o.z += m * chin * 0.035;
    return o;
  };
  mesh(sculpt(R, beardFn, 128, 96), mat.beard, skull);
  // moustache
  const stache = [];
  for (let u = -1; u <= 1.001; u += 0.25) {
    const x = u * 0.072, y = -0.074 - 0.014 * u * u;
    const p = onFace(x, y, 0.014);
    stache.push([p.x, p.y, p.z]);
  }
  mesh(tube(stache, 0.017, 24), mat.beard, skull);
  // friendly smile
  const smile = [];
  for (let u = -1; u <= 1.001; u += 0.25) {
    const x = u * 0.052, y = -0.106 + 0.017 * u * u;
    const p = onFace(x, y, 0.002);
    smile.push([p.x, p.y, p.z]);
  }
  const mouth = mesh(tube(smile, 0.0075, 20), mat.lip, skull);

  // nose
  mesh(new THREE.SphereGeometry(0.036, 18, 14), mat.skin, skull, 0, -0.03, 0.262).scale.set(0.85, 0.9, 1);
  mesh(new THREE.CapsuleGeometry(0.017, 0.06, 4, 10), mat.skin, skull, 0, 0.015, 0.258).rotation.x = -0.22;

  // eyes: white + iris + pupil + catch-light, plus arched brows
  const eyes = [];
  [-1, 1].forEach((s) => {
    const eye = new THREE.Group();
    const c = onFace(s * 0.09, 0.03, -0.02);
    eye.position.copy(c);
    eye.rotation.y = s * 0.3;
    skull.add(eye);
    mesh(new THREE.SphereGeometry(0.046, 20, 16), mat.eyeW, eye).scale.set(1, 1.05, 0.55);
    const look = new THREE.Group();
    look.position.z = 0.022;
    eye.add(look);
    mesh(new THREE.SphereGeometry(0.027, 18, 14), mat.iris, look).scale.set(1, 1, 0.35);
    mesh(new THREE.SphereGeometry(0.015, 14, 10), mat.pupil, look, 0, 0, 0.004).scale.set(1, 1, 0.35);
    mesh(new THREE.SphereGeometry(0.0065, 8, 6), mat.shine, look, 0.009, 0.011, 0.01);
    eyes.push({ eye, look });
    const brow = [];
    for (let u = 0; u <= 1.001; u += 0.2) {
      const x = s * (0.045 + u * 0.09), y = 0.092 + 0.014 * Math.sin(u * Math.PI) - u * 0.004;
      const p = onFace(x, y, 0.006);
      brow.push([p.x, p.y, p.z]);
    }
    mesh(tube(brow, 0.0115, 16), mat.hair, skull);
  });

  /* ---- animation ---- */
  let blinkAt = -1, nextBlink = 2.5;
  const restArm = (arm, t, run, stride, dir) => {
    arm.shoulder.rotation.z = lerp(arm.shoulder.rotation.z, arm.side * (0.12 + Math.sin(t * 2) * 0.02), 0.1);
    arm.shoulder.rotation.x = lerp(arm.shoulder.rotation.x, dir * stride * 0.7 * run, 0.25);
    arm.elbow.rotation.z = lerp(arm.elbow.rotation.z, arm.side * -0.05, 0.1);
    arm.elbow.rotation.x = lerp(arm.elbow.rotation.x, -0.35 * run - 0.12, 0.1);
    arm.hand.rotation.y = lerp(arm.hand.rotation.y, arm.side * 1.25, 0.1);
    arm.hand.rotation.z = lerp(arm.hand.rotation.z, 0, 0.1);
  };
  const api = {
    root, body, head, jump: 0, landAt: -10,
    animate(t, dt, { run, waving, waveT, lookX, lookY }) {
      // breathing + idle sway
      const breathe = Math.sin(t * 2) * 0.012;
      jacket.scale.set(1 + breathe, 1, 0.72 * (1 + breathe));
      torso.rotation.z = Math.sin(t * 0.9) * 0.012;

      // running between sections
      const stride = Math.sin(t * 11);
      legs[0].rotation.x = stride * 0.6 * run;
      legs[1].rotation.x = -stride * 0.6 * run;
      body.position.y = Math.abs(stride) * 0.05 * run + Math.sin(t * 2) * 0.005;

      // little hop when waving starts
      if (api.jump > 0) {
        api.jump = Math.max(0, api.jump - dt * 2.2);
        body.position.y += Math.sin((1 - api.jump) * Math.PI) * 0.1;
      }

      // right arm: wave (palm to camera) or idle/run swing
      if (waving) {
        const up = clamp(waveT * 4, 0, 1);
        const sw = Math.sin(waveT * 11);
        armR.shoulder.rotation.z = lerp(armR.shoulder.rotation.z, -2.5, 0.25 * up + 0.05);
        armR.shoulder.rotation.x = lerp(armR.shoulder.rotation.x, -0.2, 0.2);
        armR.elbow.rotation.z = lerp(armR.elbow.rotation.z, -0.3 + sw * 0.42, 0.35);
        armR.elbow.rotation.x = lerp(armR.elbow.rotation.x, 0, 0.2);
        armR.hand.rotation.y = lerp(armR.hand.rotation.y, 0, 0.25);
        armR.hand.rotation.z = sw * 0.22;
        head.rotation.z = lerp(head.rotation.z, 0.1 + sw * 0.03, 0.1);
        mouth.scale.x = lerp(mouth.scale.x, 1.18, 0.15);
      } else {
        restArm(armR, t, run, stride, -1);
        head.rotation.z = lerp(head.rotation.z, 0, 0.08);
        mouth.scale.x = lerp(mouth.scale.x, 1, 0.1);
      }
      restArm(armL, t, run, stride, 1);

      // head + eyes follow the cursor
      head.rotation.y = lerp(head.rotation.y, lookX * 0.5, 0.08);
      head.rotation.x = lerp(head.rotation.x, -lookY * 0.22, 0.08);
      eyes.forEach(({ look }) => {
        look.position.x = lerp(look.position.x, lookX * 0.011, 0.1);
        look.position.y = lerp(look.position.y, lookY * 0.008, 0.1);
      });

      // blink
      if (t > nextBlink) { blinkAt = t; nextBlink = t + 2 + Math.random() * 3; }
      const b = t - blinkAt < 0.13 ? 0.08 : 1;
      eyes.forEach(({ eye }) => (eye.scale.y = lerp(eye.scale.y, b, 0.6)));

      // platform pulse
      ring1.material.opacity = 0.6 + Math.sin(t * 3) * 0.3;
      ring2.rotation.z = t * 0.4;
      ring2.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
      beam.material.opacity = 0.2 + Math.sin(t * 2.2) * 0.07;
    },
  };
  return api;
}

/* ---------- procedural textures ---------- */
function canvasTex(size, draw) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function dotTexture() {
  return canvasTex(64, (g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.3, "rgba(255,255,255,.6)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  });
}
function glowTexture() {
  return canvasTex(256, (g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(139,92,246,.55)"); r.addColorStop(0.35, "rgba(34,211,238,.18)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  });
}
function shadowTexture() {
  return canvasTex(128, (g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, "rgba(0,0,0,.75)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  });
}
function beamTexture() {
  return canvasTex(128, (g, s) => {
    const l = g.createLinearGradient(0, 0, 0, s);
    l.addColorStop(0, "rgba(34,211,238,0)"); l.addColorStop(0.75, "rgba(34,211,238,.25)"); l.addColorStop(1, "rgba(139,92,246,.7)");
    g.fillStyle = l; g.fillRect(0, 0, s, s);
  });
}

/* =========================================================
   4. UI: loader, text splitting, reveals
   ========================================================= */
const nav = document.getElementById("nav");

function splitChars(el) {
  const text = el.textContent;
  el.textContent = "";
  text.split(" ").forEach((word, wi, arr) => {
    const w = document.createElement("span");
    w.className = "word";
    [...word].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch;
      w.appendChild(s);
    });
    el.appendChild(w);
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(" "));
  });
}
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
          const outer = document.createElement("span"); outer.className = "w";
          const inner = document.createElement("span"); inner.textContent = w;
          outer.appendChild(inner); frag.appendChild(outer);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        // keep gradient spans intact: wrap each word inside them too
        walk(n);
      }
    });
  };
  walk(el);
}
document.querySelectorAll(".hero__title .split").forEach(splitChars);
document.querySelectorAll(".split-words").forEach(splitWords);
// words inside .grad need their own gradient since background-clip breaks across inline-blocks
document.querySelectorAll(".split-words .grad .w > span").forEach((s) => s.classList.add("grad"));
document.querySelectorAll(".split-words .grad").forEach((g) => { if (!g.classList.contains("w")) g.classList.remove("grad"); });

// Loader
(function runLoader() {
  const bar = document.getElementById("loader-bar");
  const count = document.getElementById("loader-count");
  const state = { v: 0 };
  let loaded = document.readyState === "complete";
  addEventListener("load", () => (loaded = true));
  const tween = gsap.to(state, {
    v: 90, duration: 1.6, ease: "power2.out",
    onUpdate: () => { bar.style.width = state.v + "%"; count.textContent = Math.round(state.v) + "%"; },
  });
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    tween.kill();
    bar.style.width = "100%";
    count.textContent = "100%";
    setTimeout(() => {
      document.getElementById("loader").classList.add("done");
      document.body.classList.remove("is-loading");
      lenis?.start();
      playIntro();
    }, 350);
  };
  const t0 = performance.now();
  const wait = () => (loaded && performance.now() - t0 > 1500 ? finish() : setTimeout(wait, 120));
  setTimeout(wait, 400);
  setTimeout(finish, 6000);
})();

function playIntro() {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.fromTo(".nav", { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
    .fromTo(".hero__title .char", { y: 160, rotateX: -80, opacity: 0 }, { y: 0, rotateX: 0, opacity: 1, duration: 1.3, stagger: 0.035 }, 0.1)
    .to(".hero .reveal-up", { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.5)
    .fromTo(".scroll-cue", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 1);
  world?.intro();
  setTimeout(() => document.getElementById("wave-hint")?.classList.add("show"), 4200);
}
document.getElementById("wave-hint")?.addEventListener("click", () => world?.wave("Assalam o Alaikum! 👋", 2.5));

// Role rotator (typewriter)
(function rotator() {
  const el = document.getElementById("rotator");
  const roles = ["IT & AI Assistant", "Full-Stack Developer", "MERN Builder", "AI-Powered Problem Solver", "Bug Hunter & Tester"];
  let i = 0, j = roles[0].length, deleting = true;
  const step = () => {
    const word = roles[i];
    if (deleting) {
      j--;
      if (j <= 0) { deleting = false; i = (i + 1) % roles.length; }
    } else {
      j++;
      if (j >= roles[i].length) { deleting = true; el.textContent = roles[i]; return setTimeout(step, 2200); }
    }
    el.textContent = (deleting ? word : roles[i]).slice(0, Math.max(j, 0)) || "​";
    setTimeout(step, deleting ? 35 : 70);
  };
  setTimeout(step, 3800);
})();

/* reveal helper: explicit from → neutral end state (robust against re-recorded from-tweens) */
const ANIM_KEYS = ["x", "y", "z", "yPercent", "xPercent", "rotate", "rotateX", "rotateY", "opacity", "scale"];
function rise(targets, vars) {
  const from = {}, to = {};
  Object.entries(vars).forEach(([k, v]) => {
    if (ANIM_KEYS.includes(k)) { from[k] = v; to[k] = k === "opacity" || k === "scale" ? 1 : 0; }
    else to[k] = v;
  });
  return gsap.fromTo(targets, from, to);
}

/* ---------- Horizontal pinned projects (desktop) ---------- */
const mm = gsap.matchMedia();
mm.add("(min-width: 901px)", () => {
    const track = document.getElementById("projects-track");
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".projects", pin: ".projects__pin", refreshPriority: 1, start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    gsap.utils.toArray(".project").forEach((card) => {
      rise(card, {
        rotateY: -30, z: -160, opacity: 0.35, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 70%", scrub: true },
      });
    });
  });
mm.add("(max-width: 900px)", () => {
    gsap.utils.toArray(".project").forEach((card) => {
      rise(card, { y: 80, opacity: 0, rotateX: -20, transformPerspective: 900, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 90%" } });
    });
});

/* ---------- Scroll reveals ---------- */
gsap.utils.toArray(".split-words").forEach((h) => {
  rise(h.querySelectorAll(".w > span"), {
    y: "1.2em", rotate: 6, duration: 1.1, ease: "expo.out", stagger: 0.04,
    scrollTrigger: { trigger: h, start: "top 85%" },
  });
});
gsap.utils.toArray("section:not(.hero) .reveal-up").forEach((el) => {
  gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
});
rise(".holo", { rotateY: -70, rotateX: 15, opacity: 0, scale: 0.7, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".holo", start: "top 85%" } });
rise(".stat", { y: 60, opacity: 0, rotateX: -40, duration: 1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".stats", start: "top 88%" } });
rise(".bento .card", { y: 80, opacity: 0, rotateX: -25, transformPerspective: 900, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".bento", start: "top 85%" } });
rise(".tl", { x: -60, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.15, scrollTrigger: { trigger: ".timeline", start: "top 80%" } });
gsap.to("#timeline-fill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true } });
rise(".form", { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".form", start: "top 88%" } });
rise(".ccard", { y: 30, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: ".contact__cards", start: "top 92%" } });
rise(".footer__big", { yPercent: 60, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".footer", start: "top 95%" } });
gsap.to(".marquee__track", { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true } });

// count-up stats
document.querySelectorAll("[data-count]").forEach((el) => {
  const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || "";
  const o = { v: 0 };
  gsap.to(o, {
    v: end, duration: 2, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 90%" },
    onUpdate: () => (el.textContent = o.v.toFixed(dec) + suf),
  });
});

/* ---------- Live section detection (drives the 3D character + nav) ----------
   Uses real layout each frame, so it's always correct even with the pinned section. */
const sceneSections = [...document.querySelectorAll("[data-scene]")];
const navLinks = [...document.querySelectorAll(".nav__links a")];
let activeScene = "";
function detectScene() {
  const mid = innerHeight * 0.5;
  const sec = sceneSections.find((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
  const name = sec ? sec.dataset.scene : scrollY < 200 ? "hero" : activeScene;
  if (name && name !== activeScene) {
    activeScene = name;
    world?.setScene(name);
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + name));
  }
}
addEventListener("scroll", detectScene, { passive: true });
gsap.ticker.add(detectScene);
setInterval(detectScene, 400);

/* ---------- Nav: hide on scroll down, active link, progress ---------- */
const progress = document.getElementById("progress");
let lastY = 0;
const onScroll = () => {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight || 1;
  progress.style.transform = `scaleX(${y / max})`;
  if (!nav.classList.contains("open")) nav.classList.toggle("hide", y > lastY && y > 300);
  lastY = y;
};
addEventListener("scroll", onScroll, { passive: true });
document.getElementById("burger").addEventListener("click", () => nav.classList.toggle("open"));

/* =========================================================
   5. Interactions: 3D tilt, magnetic buttons, cursor, tag sphere
   ========================================================= */
if (!isTouch) {
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = el.classList.contains("project") ? 8 : el.classList.contains("holo") ? 18 : 10;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      gsap.to(el, { rotateY: (px - 0.5) * max * 2, rotateX: -(py - 0.5) * max * 2, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
      el.style.setProperty("--gx", px * 100 + "%");
      el.style.setProperty("--gy", py * 100 + "%");
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, .5)" }));
  });

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, .4)" }));
  });

  const cursor = document.getElementById("cursor");
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
  addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); });
  document.addEventListener("pointerover", (e) => cursor.classList.toggle("hover", !!e.target.closest("a,button,[data-magnetic],.chips li")));
}

// 3D skill tag sphere
(function tagSphere() {
  const el = document.getElementById("tag-sphere");
  const tags = ["React", "Node.js", "Express", "MongoDB", "MySQL", "PHP", "Python", "JavaScript", "Java", "C/C++", "Dart", "Flutter", "Tailwind", "Bootstrap",
    "Git", "GitHub", "Vercel", "Railway", "XAMPP", "SQL Server", "REST APIs", "JWT", "ChatGPT", "Claude", "Gemini", "OpenRouter", "OpenAI API", "Recharts",
    "Firebase", "NLP", "Pygame", "NumPy", "Pandas", "OOP", "DSA", "Agile", "HTML", "CSS", "VS Code"];
  const colors = ["#c4b5fd", "#67e8f9", "#f9a8d4", "#ffffff"];
  const n = tags.length;
  const pts = tags.map((t, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / n);
    const theta = Math.sqrt(n * Math.PI) * phi;
    const s = document.createElement("span");
    s.textContent = t;
    s.style.color = colors[i % colors.length];
    el.appendChild(s);
    return { s, x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi) };
  });
  let ax = 0.0035, ay = 0.005, drag = null, inView = false;
  ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (inView = s.isActive) });
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    if (drag) { ay = (e.clientX - drag.x) * 0.0006; ax = -(e.clientY - drag.y) * 0.0006; drag = { x: e.clientX, y: e.clientY }; return; }
    ay = ((e.clientX - r.left) / r.width - 0.5) * 0.02;
    ax = -((e.clientY - r.top) / r.height - 0.5) * 0.02;
  });
  el.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointerup", () => (drag = null));
  const loop = () => {
    requestAnimationFrame(loop);
    if (!inView) return;
    const R = el.clientWidth * 0.4;
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
    pts.forEach((p) => {
      const y1 = p.y * cx - p.z * sx, z1 = p.y * sx + p.z * cx;
      const x2 = p.x * cy + z1 * sy, z2 = -p.x * sy + z1 * cy;
      p.x = x2; p.y = y1; p.z = z2;
      const scale = (p.z + 2) / 3;
      p.s.style.transform = `translate(-50%,-50%) translate3d(${p.x * R}px, ${p.y * R}px, 0) scale(${scale})`;
      p.s.style.opacity = 0.25 + ((p.z + 1) / 2) * 0.75;
      p.s.style.zIndex = Math.round(p.z * 100) + 100;
    });
  };
  loop();
})();

/* =========================================================
   6. Contact form → emails mattirehman343@gmail.com
   ========================================================= */
(function contactForm() {
  const form = document.getElementById("contact-form");
  const btn = document.getElementById("submit-btn");
  const label = btn.querySelector(".btn__label");
  const status = document.getElementById("form-status");
  const toast = document.getElementById("toast");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const showToast = (msg, err = false) => {
    toast.textContent = msg;
    toast.classList.toggle("err", err);
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4200);
  };

  form.querySelectorAll("input, textarea").forEach((f) => f.addEventListener("input", () => f.closest(".field")?.classList.remove("invalid")));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) return; // bot

    let ok = true;
    const mark = (name, bad) => { form.elements[name].closest(".field").classList.toggle("invalid", bad); if (bad) ok = false; };
    mark("name", !data.name.trim());
    mark("email", !emailRe.test(data.email.trim()));
    mark("message", data.message.trim().length < 2);
    if (!ok) { status.className = "form__status err"; status.textContent = "Please fill in your name, a valid email and a message."; return; }

    btn.disabled = true;
    btn.classList.add("sending");
    label.textContent = "Sending…";
    status.className = "form__status";
    status.textContent = "";

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject.trim() || "(no subject)",
      message: data.message.trim(),
      _subject: `📬 Portfolio message from ${data.name.trim()}${data.subject.trim() ? " — " + data.subject.trim() : ""}`,
      _replyto: data.email.trim(),
      _template: "table",
      _captcha: "false",
    };

    const send = async () => {
      // primary: FormSubmit → delivers straight to the inbox
      try {
        const r = await fetch(FORMSUBMIT_URL, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && (j.success === true || j.success === "true")) return true;
      } catch (_) { /* fall through */ }
      // fallback: Formspree
      try {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
        const r = await fetch(FORMSPREE_URL, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        return r.ok;
      } catch (_) { return false; }
    };

    const sent = await send();
    btn.disabled = false;
    btn.classList.remove("sending");
    label.textContent = "Send message";

    if (sent) {
      form.reset();
      status.className = "form__status ok";
      status.textContent = "Message sent! I'll get back to you soon.";
      showToast("✅ Thanks! Your message is on its way to Matti.");
      world?.wave("Got your message! 🙌", 2);
    } else {
      status.className = "form__status err";
      status.innerHTML = `Couldn't send right now. Please email me directly at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`;
      showToast("Something went wrong — please try again.", true);
    }
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();
ScrollTrigger.sort();
addEventListener("load", () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
document.fonts?.ready.then(() => ScrollTrigger.refresh());

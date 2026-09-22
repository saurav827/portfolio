/**
 * hero3d.js — Vanilla Three.js Neural Network Hero
 * Loaded as ES module via CDN. No bundler required.
 * Fallback: static CSS gradient hero when WebGL unavailable or reduced-motion preferred.
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_COUNT      = 42;
const CONNECTION_DIST = 180;  // max edge length in 3-D units
const SPREAD          = 320;  // half-extent of node field
const AUTO_ROT_SPEED  = 0.0004; // radians/frame
const PARALLAX_FACTOR = 0.06;   // how much mouse moves the camera offset
const PULSE_SPEED     = 0.015;  // node size oscillation speed

// ─── Capability Detection ─────────────────────────────────────────────────────
function canRunWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

function isLowEndDevice() {
  // Heuristic: 4 or fewer logical cores or memory ≤ 2 GB
  const cores = navigator.hardwareConcurrency || 4;
  const mem   = navigator.deviceMemory     || 4;
  return cores <= 2 || mem <= 2;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobile() {
  return window.innerWidth < 768;
}

// ─── Static Fallback ──────────────────────────────────────────────────────────
function activateStaticFallback() {
  const canvas = document.getElementById('hero-canvas');
  if (canvas) canvas.style.display = 'none';
  // The CSS .hero::before gradient already provides the static backdrop
  document.documentElement.classList.add('no-webgl');
}

// ─── Main Initialiser (called from DOMContentLoaded) ─────────────────────────
async function initHero3D() {
  // Bail out early for reduced-motion or low-end/mobile
  if (prefersReducedMotion() || isMobile() || isLowEndDevice()) {
    activateStaticFallback();
    return;
  }
  if (!canRunWebGL()) {
    activateStaticFallback();
    return;
  }

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Dynamically import Three.js from CDN
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.min.js');
  } catch (err) {
    console.warn('[hero3d] Three.js CDN failed:', err);
    activateStaticFallback();
    return;
  }

  // ─── Scene Setup ───────────────────────────────────────────────────────────
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 1, 2000);
  camera.position.set(0, 0, 680);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // ─── Node Positions ────────────────────────────────────────────────────────
  const positions = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    positions.push(new THREE.Vector3(
      (Math.random() - 0.5) * SPREAD * 2,
      (Math.random() - 0.5) * SPREAD * 2,
      (Math.random() - 0.5) * SPREAD
    ));
  }

  // ─── Edge Geometry ─────────────────────────────────────────────────────────
  const edgeVerts = [];
  const edgePairs = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (positions[i].distanceTo(positions[j]) < CONNECTION_DIST) {
        edgeVerts.push(positions[i].x, positions[i].y, positions[i].z);
        edgeVerts.push(positions[j].x, positions[j].y, positions[j].z);
        edgePairs.push(i, j);
      }
    }
  }

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgeVerts, 3));
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.18,
  });
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  scene.add(edges);

  // ─── Node Sprites ──────────────────────────────────────────────────────────
  // Use a circle texture drawn on an offscreen canvas (no file dependency)
  function makeCircleTexture(size, color) {
    const c = document.createElement('canvas');
    c.width  = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const half = size / 2;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, color);
    grad.addColorStop(0.4, color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(half, half, half, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  const texCyan   = makeCircleTexture(64, 'rgba(6,214,160,0.9)');
  const texViolet = makeCircleTexture(64, 'rgba(124,58,237,0.9)');

  const nodeGroup = new THREE.Group();
  const nodeSprites = [];
  positions.forEach((pos, idx) => {
    const isBig     = idx < 6;
    const isViolet  = idx % 5 === 0;
    const baseScale = isBig ? 10 : (4 + Math.random() * 4);
    const mat       = new THREE.SpriteMaterial({
      map: isViolet ? texViolet : texCyan,
      transparent: true,
      opacity: isBig ? 0.9 : 0.65,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(pos);
    sprite.scale.setScalar(baseScale);
    sprite.userData = {
      baseScale,
      phaseOffset: Math.random() * Math.PI * 2,
      pulseAmp: isBig ? 0.3 : 0.15,
    };
    nodeGroup.add(sprite);
    nodeSprites.push(sprite);
  });
  scene.add(nodeGroup);
  scene.add(edges);

  // ─── Ambient Fog-like radial gradient light (just through opacity) ─────────
  // No real lights needed since sprites are self-lit

  // ─── Mouse Parallax ────────────────────────────────────────────────────────
  let targetOffsetX = 0;
  let targetOffsetY = 0;
  let currentOffsetX = 0;
  let currentOffsetY = 0;

  const onMouseMove = (e) => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetOffsetX =  nx * PARALLAX_FACTOR * 80;
    targetOffsetY = -ny * PARALLAX_FACTOR * 50;
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // ─── Resize Handler ────────────────────────────────────────────────────────
  const onResize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // ─── Animation Loop ────────────────────────────────────────────────────────
  let frame = 0;
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    frame++;

    // Auto-rotate the entire node group
    nodeGroup.rotation.y += AUTO_ROT_SPEED;
    nodeGroup.rotation.x += AUTO_ROT_SPEED * 0.4;
    edges.rotation.y     = nodeGroup.rotation.y;
    edges.rotation.x     = nodeGroup.rotation.x;

    // Smooth parallax
    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.05;
    currentOffsetY += (targetOffsetY - currentOffsetY) * 0.05;
    camera.position.x = currentOffsetX;
    camera.position.y = currentOffsetY;

    // Pulse nodes
    const t = frame * PULSE_SPEED;
    nodeSprites.forEach((sprite) => {
      const { baseScale, phaseOffset, pulseAmp } = sprite.userData;
      const s = baseScale * (1 + Math.sin(t + phaseOffset) * pulseAmp);
      sprite.scale.setScalar(s);
    });

    renderer.render(scene, camera);
  }

  animate();

  // ─── Cleanup on page unload ────────────────────────────────────────────────
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  });
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
// Use IntersectionObserver to only spin up 3D when hero is visible
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  // Always fall back to static on mobile without even trying WebGL
  if (isMobile()) {
    activateStaticFallback();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        initHero3D();
      }
    });
  }, { threshold: 0.01 });

  observer.observe(heroSection);
});

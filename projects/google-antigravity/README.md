# Google Anti Gravity Physics Sandbox

An industry-level, highly interactive, and visually stunning reimagining of the classic Google Gravity experiment. Built as a premium feature for **Saurav Kumar's** developer portfolio.

## 🚀 Experience Live Demo
To launch the experiment, open the `google-antigravity/index.html` file in any modern web browser.

---

## 🎨 Creative & Technical Highlights

### 1. Modern Google Layout (2026 Design Language)
- Sleek dark theme default utilizing premium typography (`Outfit`) and dynamic background glow blobs.
- Completely responsive components that adjust smoothly to layout grids.
- Hover-enhanced search components matching Google search guidelines.

### 2. High-Fidelity Physics Engine (Matter.js)
- Normal HTML DOM layout elements (Google logo letters, search box, footer, quick panel controls) are mapped dynamically into physical rigid bodies on the Matter.js canvas overlay.
- Drag-and-toss mouse constraint bindings that allow you to grab any element, swing it around, and throw it with realistic inertia.
- Float and drift calculations (buoyancy) applied when gravity is off to simulate outer space.

### 3. Procedural Audio Synthesizer (Web Audio API)
- Purely synthetic, zero-asset sound engine that runs directly in code.
- Generates dynamic high-quality synth sweeps for shifts in gravity, spawn triggers, and button clicks.
- Synthesizes realistic bounce feedback frequencies proportional to collision velocities and element masses.

### 4. Advanced Simulation Panel
- Glassmorphism control panel featuring real-time adjustment variables:
  - **Horizontal/Vertical Gravity** (range from -1.5G to +1.5G).
  - **Friction / Air Resistance** (re-scales dampening factors).
  - **Bounciness / Restitution** (adjusts body elasticity).
- Quick toggles for Sound FX, Fullscreen Mode, Dark Mode, and Simulation Pauses.
- Dynamic **FPS Counter** badge indicating real-time rendering statistics.

---

## 🛠️ Tech Stack
- **HTML5 & Semantic Structure**
- **CSS3 / Vanilla Variables & Modern Transitions**
- **GSAP Animations** (Entrance sequences and loader transitions)
- **Matter.js Engine** (Rigid body physics, collision logic, constraints)
- **Web Audio API** (Procedural sound synthesis)

---

## 🎹 Keyboard Shortcuts

- `Space` : Pause / Resume physics simulation.
- `G` : Enable / Disable Gravity.
- `R` : Reset simulation to the pristine Google landing state.
- `S` : Spawn random objects into the physics engine.
- `F` : Toggle Fullscreen mode.

---

## 💻 Structure
```
google-antigravity/
├── index.html
├── README.md
├── css/
│   ├── style.css
│   └── animations.css
└── js/
    ├── main.js
    ├── physics.js
    └── ui.js
```

---

## 👤 Developer
**Saurav Kumar**
*B.Tech CSE Student | AI & Full Stack Developer*
- GitHub: [@saurav827](https://github.com/saurav827)
- LinkedIn: [sauravkrumar9](https://www.linkedin.com/in/sauravkrumar9/)

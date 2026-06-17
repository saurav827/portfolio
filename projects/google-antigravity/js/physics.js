/**
 * Google Anti Gravity - Matter.js Physics Engine Coordinator
 * Designed by a Senior Google Frontend Engineer
 * Handles DOM element mapping, mouse dragging, collision sound triggers, and custom spawns
 */

class AntiGravityPhysics {
  constructor(uiController) {
    this.ui = uiController;
    
    // Matter.js modules
    this.Engine = Matter.Engine;
    this.Render = Matter.Render;
    this.Runner = Matter.Runner;
    this.Bodies = Matter.Bodies;
    this.Composite = Matter.Composite;
    this.Mouse = Matter.Mouse;
    this.MouseConstraint = Matter.MouseConstraint;
    this.Events = Matter.Events;
    this.Vector = Matter.Vector;
    this.Body = Matter.Body;
    this.Query = Matter.Query;

    this.engine = null;
    this.runner = null;
    this.render = null;
    
    this.physicsActive = false;
    this.elementsMap = []; // Maps DOM elements to Matter.js bodies
    this.canvasBodies = []; // Bodies rendered directly on canvas (e.g. balls, stars)
    this.boundaries = [];
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.settings = {
      gravityY: 0, // Starts as 0 (Anti gravity floats)
      gravityX: 0,
      restitution: 0.75,
      frictionAir: 0.02,
      dragForce: 0.1
    };

    // Track click vs drag coords
    this.mouseDownPos = { x: 0, y: 0 };
    this.mouseUpPos = { x: 0, y: 0 };

    this.initEngine();
    this.initCanvasRenderer();
    this.createBoundaries();
    this.setupMouseConstraint();
    this.setupCollisionSounds();
    this.startLoop();
    
    // Listen for resize
    window.addEventListener('resize', () => this.handleResize());
  }

  initEngine() {
    this.engine = this.Engine.create({
      gravity: { x: 0, y: 0, scale: 0.001 } // Scale set to standard
    });
  }

  initCanvasRenderer() {
    // Custom renderer that only draws canvas-specific bodies (glow balls, stars)
    // while HTML DOM handles drawing transformed Google components.
    this.canvas = document.getElementById('physics-canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
  }

  createBoundaries() {
    const thickness = 100;
    
    // Clear existing
    if (this.boundaries.length > 0) {
      this.boundaries.forEach(b => this.Composite.remove(this.engine.world, b));
      this.boundaries = [];
    }

    // Floor, ceiling, left wall, right wall
    const floor = this.Bodies.rectangle(this.width / 2, this.height + thickness / 2, this.width + 200, thickness, { isStatic: true, label: 'boundary' });
    const ceiling = this.Bodies.rectangle(this.width / 2, -thickness / 2, this.width + 200, thickness, { isStatic: true, label: 'boundary' });
    const leftWall = this.Bodies.rectangle(-thickness / 2, this.height / 2, thickness, this.height + 200, { isStatic: true, label: 'boundary' });
    const rightWall = this.Bodies.rectangle(this.width + thickness / 2, this.height / 2, thickness, this.height + 200, { isStatic: true, label: 'boundary' });

    this.boundaries = [floor, ceiling, leftWall, rightWall];
    this.Composite.add(this.engine.world, this.boundaries);
  }

  activatePhysics() {
    if (this.physicsActive) return;
    this.physicsActive = true;
    
    // Play sound FX
    this.ui.playSynthSound('gravityOff');

    // 1. Scan and parse DOM elements to turn into physics bodies
    const targetSelector = '.physics-el';
    const elements = document.querySelectorAll(targetSelector);
    
    elements.forEach(el => {
      // If logo container, split letters instead
      if (el.id === 'logo-container') {
        const letters = el.querySelectorAll('.logo-letter');
        letters.forEach(letter => this.convertElementToPhysicsBody(letter, 'letter'));
        // Hide container container itself (letters float separately)
        el.style.opacity = '1';
        el.style.border = 'none';
        el.style.pointerEvents = 'none';
      } else if (el.id === 'buttons-container') {
        // Convert buttons separately
        const btns = el.querySelectorAll('.sandbox-btn');
        btns.forEach(btn => this.convertElementToPhysicsBody(btn, 'button'));
      } else {
        this.convertElementToPhysicsBody(el, 'standard');
      }
    });

    // 2. Hide standard footer location border / cleanup styling
    document.querySelector('.sandbox-footer').style.border = 'none';
    
    // 3. Remove inline logo float animations
    document.querySelectorAll('.logo-letter').forEach(l => {
      l.classList.remove('idle-float');
    });

    // 4. Trigger runner
    this.runner = this.Runner.create();
    this.Runner.run(this.runner, this.engine);
  }

  convertElementToPhysicsBody(el, type) {
    const rect = el.getBoundingClientRect();
    
    // Skip if element has no dimensions
    if (rect.width === 0 || rect.height === 0) return;

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Create Matter rectangle
    const body = this.Bodies.rectangle(x, y, rect.width, rect.height, {
      restitution: this.settings.restitution,
      frictionAir: this.settings.frictionAir,
      friction: 0.1,
      plugin: { element: el, type: type }
    });

    // Save initial offsets and states
    this.elementsMap.push({
      element: el,
      body: body,
      width: rect.width,
      height: rect.height,
      initialX: x,
      initialY: y
    });

    // Position DOM absolute/fixed so it transforms cleanly relative to screen bounds
    el.style.position = 'fixed';
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.left = '0';
    el.style.top = '0';
    el.style.margin = '0';
    el.classList.add('physics-body');

    // Add to engine world
    this.Composite.add(this.engine.world, body);
    
    // Give it a tiny starting impulse for anti-gravity magic float drift
    const forceMagnitude = 0.002 * body.mass;
    this.Body.applyForce(body, body.position, {
      x: (Math.random() - 0.5) * forceMagnitude,
      y: (Math.random() - 0.5) * forceMagnitude
    });
  }

  setupMouseConstraint() {
    // Canvas dimensions mouse listener binding
    const mouse = this.Mouse.create(this.canvas);
    this.mouseConstraint = this.MouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        render: { visible: false }
      }
    });

    this.Composite.add(this.engine.world, this.mouseConstraint);
    
    // Intercept clicks vs drag movements
    this.Events.on(this.mouseConstraint, 'mousedown', (e) => {
      this.mouseDownPos = { x: e.mouse.position.x, y: e.mouse.position.y };
      
      // Auto unlock audio context if not unlocked
      this.ui.initAudio();
      
      if (!this.physicsActive) {
        // Activate sandbox on first interaction!
        this.activatePhysics();
      }
    });

    this.Events.on(this.mouseConstraint, 'mouseup', (e) => {
      this.mouseUpPos = { x: e.mouse.position.x, y: e.mouse.position.y };
      
      const dx = this.mouseUpPos.x - this.mouseDownPos.x;
      const dy = this.mouseUpPos.y - this.mouseDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If they clicked (distance moved is tiny), evaluate element action
      if (dist < 6) {
        this.handleElementClick(e.mouse.position);
      }
    });
  }

  handleElementClick(position) {
    // Query bodies under click coordinates
    const allBodies = this.Composite.allBodies(this.engine.world);
    const clickedBodies = this.Query.point(allBodies, position);
    
    // Find first clicked body that is mapped to a DOM element
    const hit = clickedBodies.find(b => b.plugin && b.plugin.element);
    
    if (hit) {
      const el = hit.plugin.element;
      
      // Trigger click event or input focus
      if (el.id === 'search-input') {
        el.focus();
      } else if (el.classList.contains('sandbox-btn') || el.tagName === 'BUTTON') {
        // Visual click effect
        el.classList.add('animate-click');
        setTimeout(() => el.classList.remove('animate-click'), 150);
        this.ui.playSynthSound('click');
        el.click();
      } else if (el.tagName === 'A' || el.closest('a')) {
        const link = el.tagName === 'A' ? el : el.closest('a');
        this.ui.playSynthSound('click');
        if (link.target === '_blank') {
          window.open(link.href, '_blank');
        } else {
          window.location.href = link.href;
        }
      } else {
        // General body click, play tiny sound feedback
        this.ui.playSynthSound('click');
      }
    }
  }

  setupCollisionSounds() {
    this.Events.on(this.engine, 'collisionStart', (event) => {
      if (!this.ui.soundEnabled) return;
      
      event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        // Skip boundary-to-boundary
        if (bodyA.label === 'boundary' && bodyB.label === 'boundary') return;
        
        // Calculate relative velocity
        const velA = bodyA.velocity;
        const velB = bodyB.velocity;
        const relVel = {
          x: velA.x - velB.x,
          y: velA.y - velB.y
        };
        const speed = Math.sqrt(relVel.x * relVel.x + relVel.y * relVel.y);
        
        // Trigger impact sound based on speed and mass
        const mass = Math.min(bodyA.mass, bodyB.mass);
        this.ui.playSynthSound('impact', { intensity: speed, mass: mass });
      });
    });
  }

  setGravity(y, x) {
    this.settings.gravityY = y;
    this.settings.gravityX = x;
    
    if (this.engine) {
      this.engine.gravity.y = y;
      this.engine.gravity.x = x;
    }
  }

  setBounciness(value) {
    this.settings.restitution = value;
    const allBodies = this.Composite.allBodies(this.engine.world);
    allBodies.forEach(b => {
      if (b.label !== 'boundary') {
        b.restitution = value;
      }
    });
  }

  setFrictionAir(value) {
    this.settings.frictionAir = value;
    const allBodies = this.Composite.allBodies(this.engine.world);
    allBodies.forEach(b => {
      if (b.label !== 'boundary') {
        b.frictionAir = value;
      }
    });
  }

  spawnObject(type, customText = '') {
    if (!this.physicsActive) {
      this.activatePhysics();
    }

    const rx = Math.random() * (this.width - 200) + 100;
    const ry = 60; // Spawns near top
    const now = performance.now();
    this.ui.playSynthSound('spawn');

    if (type === 'letter') {
      const chars = ['S', 'A', 'U', 'R', 'A', 'V', 'K', 'U', 'M', 'A', 'R', 'A', 'I', 'M', 'L'];
      const colors = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#34d399', '#fb7185'];
      const char = chars[Math.floor(Math.random() * chars.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const el = document.createElement('div');
      el.className = 'spawned-letter-obj';
      el.textContent = char;
      el.style.color = color;
      document.body.appendChild(el);
      
      // Let it layout first to grab bounding box dimensions
      const rect = el.getBoundingClientRect();
      const w = rect.width || 40;
      const h = rect.height || 60;
      
      const body = this.Bodies.rectangle(rx, ry, w, h, {
        restitution: this.settings.restitution,
        frictionAir: this.settings.frictionAir,
        plugin: { element: el, type: 'spawned-letter' }
      });
      
      this.elementsMap.push({
        element: el,
        body: body,
        width: w,
        height: h
      });
      
      el.style.position = 'fixed';
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.left = '0';
      el.style.top = '0';
      el.classList.add('physics-body');
      
      this.Composite.add(this.engine.world, body);
      
    } else if (type === 'card') {
      const titles = [
        "Saurav Kumar - AI Engineer",
        "Fake News Detection System",
        "Matter.js Physics Sandbox",
        "Loan Approval Prediction",
        "AI Chatbot Assistant",
        "FastAPI & Python Backend",
        "B.Tech CSE Student"
      ];
      
      const tags = ["PROJECT", "PORTFOLIO", "SKILLS", "AI/ML", "GITHUB"];
      const descList = [
        "Specializing in Machine Learning models, NLP, and full-stack web applications.",
        "Multilingual AI-powered Fake News Detection System built with FastAPI and Scikit-Learn.",
        "Interactive physics engine simulation using Matter.js and GSAP animation sequences.",
        "Machine Learning based Loan Approval system showcasing predictive data analysis.",
        "Conversational AI assistant designed for intelligent user dialogue interactions.",
        "B.Tech student passionate about building real-world AI applications and clean code."
      ];
      
      const titleText = customText ? `Search: "${customText}"` : titles[Math.floor(Math.random() * titles.length)];
      const tagText = tags[Math.floor(Math.random() * tags.length)];
      const descText = customText ? `Found matching result for "${customText}" in Saurav's portfolio! Drag me or click for more.` : descList[Math.floor(Math.random() * descList.length)];
      
      const el = document.createElement('div');
      el.className = 'spawned-card';
      el.innerHTML = `
        <span class="card-tag">${tagText}</span>
        <h4 class="card-title">${titleText}</h4>
        <p class="card-desc">${descText}</p>
      `;
      document.body.appendChild(el);
      
      const w = 280;
      const h = el.offsetHeight || 120;
      
      const body = this.Bodies.rectangle(rx, ry, w, h, {
        restitution: this.settings.restitution,
        frictionAir: this.settings.frictionAir,
        plugin: { element: el, type: 'spawned-card' }
      });
      
      this.elementsMap.push({
        element: el,
        body: body,
        width: w,
        height: h
      });
      
      el.style.position = 'fixed';
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.left = '0';
      el.style.top = '0';
      el.classList.add('physics-body');
      
      this.Composite.add(this.engine.world, body);
      
    } else if (type === 'ball') {
      const radius = Math.random() * 20 + 15;
      const colorIndex = Math.floor(Math.random() * 4);
      const colors = ['#38bdf8', '#818cf8', '#a78bfa', '#34d399'];
      
      const body = this.Bodies.circle(rx, ry, radius, {
        restitution: this.settings.restitution,
        frictionAir: this.settings.frictionAir,
        label: 'canvas-ball',
        plugin: {
          radius: radius,
          color: colors[colorIndex],
          type: 'ball'
        }
      });
      
      this.canvasBodies.push(body);
      this.Composite.add(this.engine.world, body);
      
    } else if (type === 'star') {
      const radius = Math.random() * 15 + 10;
      
      // Star created via polygon (5 vertices)
      const body = this.Bodies.polygon(rx, ry, 5, radius, {
        restitution: this.settings.restitution,
        frictionAir: this.settings.frictionAir,
        label: 'canvas-star',
        plugin: {
          radius: radius,
          color: 'gold',
          type: 'star'
        }
      });
      
      this.canvasBodies.push(body);
      this.Composite.add(this.engine.world, body);
    }
  }

  reset() {
    this.ui.playSynthSound('reset');
    
    if (!this.physicsActive) return;
    
    // Stop simulation runner
    if (this.runner) {
      this.Runner.stop(this.runner);
    }
    
    // Remove all spawned objects (both HTML and canvas)
    this.elementsMap.forEach(item => {
      const el = item.element;
      if (el.classList.contains('spawned-card') || el.classList.contains('spawned-letter-obj')) {
        el.remove();
      } else {
        // Return original element to standard styling
        el.style.position = '';
        el.style.width = '';
        el.style.height = '';
        el.style.left = '';
        el.style.top = '';
        el.style.transform = '';
        el.classList.remove('physics-body');
      }
    });

    // Clean logo container styling
    const logoContainer = document.getElementById('logo-container');
    logoContainer.style.opacity = '';
    logoContainer.style.border = '';
    logoContainer.style.pointerEvents = '';
    
    // Re-add bounce idle to logo letters
    document.querySelectorAll('.logo-letter').forEach(l => {
      l.classList.add('idle-float');
    });

    // Re-add standard border to footer
    document.querySelector('.sandbox-footer').style.borderTop = '';

    // Clear background canvas bodies
    this.canvasBodies = [];
    
    // Reset engine world elements maps
    this.Engine.clear(this.engine);
    this.elementsMap = [];
    this.physicsActive = false;
    
    // Re-create engine world standard conditions
    this.initEngine();
    this.createBoundaries();
    this.setupMouseConstraint();
    this.setupCollisionSounds();
    
    // Sync UI Panel state
    this.ui.setPauseState(false);
  }

  togglePause() {
    if (!this.physicsActive) {
      this.activatePhysics();
      return;
    }
    
    if (this.ui.isPaused) {
      // Resume
      this.ui.setPauseState(false);
      this.runner = this.Runner.create();
      this.Runner.run(this.runner, this.engine);
    } else {
      // Pause
      this.ui.setPauseState(true);
      if (this.runner) {
        this.Runner.stop(this.runner);
      }
    }
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Re-position ceiling/floor boundaries
    this.createBoundaries();
  }

  startLoop() {
    const loop = () => {
      // Clear canvas drawing
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      if (this.physicsActive && !this.ui.isPaused) {
        // 1. Sync HTML positions to Matter body transforms
        this.elementsMap.forEach(item => {
          const body = item.body;
          const el = item.element;
          const w = item.width;
          const h = item.height;
          
          const tx = body.position.x - w / 2;
          const ty = body.position.y - h / 2;
          
          el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0px) rotate(${body.angle.toFixed(4)}rad)`;
        });

        // 2. Float effect (Brownian/gravity-less micro float drift)
        // If gravity scales are 0, apply tiny random forces so they float elegantly
        if (this.settings.gravityY === 0 && this.settings.gravityX === 0) {
          const allBodies = this.Composite.allBodies(this.engine.world);
          allBodies.forEach(b => {
            if (b.label !== 'boundary' && !b.isStatic && b !== this.mouseConstraint.body) {
              // Micro float force
              const forceScale = 0.00008 * b.mass;
              this.Body.applyForce(b, b.position, {
                x: (Math.random() - 0.5) * forceScale,
                y: (Math.random() - 0.52) * forceScale // Tiny bias upwards to simulate buoyancy
              });
            }
          });
        }
      }

      // 3. Draw canvas specific elements (balls, stars)
      this.canvasBodies.forEach(body => {
        const pos = body.position;
        const radius = body.plugin.radius;
        const color = body.plugin.color;
        const type = body.plugin.type;
        
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        this.ctx.rotate(body.angle);
        
        if (type === 'ball') {
          // Glow ball rendering
          const gradient = this.ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.3, color);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          this.ctx.beginPath();
          this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
          this.ctx.fillStyle = gradient;
          this.ctx.fill();
        } else if (type === 'star') {
          // Render a simple glowing polygon star
          this.ctx.beginPath();
          this.ctx.fillStyle = color;
          this.ctx.shadowColor = color;
          this.ctx.shadowBlur = 10;
          
          // Draw standard 5-point star path
          const spikes = 5;
          const outerRadius = radius;
          const innerRadius = radius / 2;
          let rot = Math.PI / 2 * 3;
          let cx = 0, cy = 0;
          const step = Math.PI / spikes;

          this.ctx.moveTo(0, -outerRadius);
          for (let i = 0; i < spikes; i++) {
            cx = Math.cos(rot) * outerRadius;
            cy = Math.sin(rot) * outerRadius;
            this.ctx.lineTo(cx, cy);
            rot += step;

            cx = Math.cos(rot) * innerRadius;
            cy = Math.sin(rot) * innerRadius;
            this.ctx.lineTo(cx, cy);
            rot += step;
          }
          this.ctx.lineTo(0, -outerRadius);
          this.ctx.closePath();
          this.ctx.fill();
        }
        
        this.ctx.restore();
      });

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Export initialization safety
window.AntiGravityPhysics = AntiGravityPhysics;

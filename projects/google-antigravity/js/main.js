/**
 * Google Anti Gravity - Main Coordinator
 * Designed by a Senior Google Frontend Engineer
 * Orchestrates entry animations (GSAP), control loops, and events
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize UI Controls and Web Audio synth
  const ui = new window.AntiGravityUI();

  // 2. Initialize Physics sandbox with UI hook
  const physics = new window.AntiGravityPhysics(ui);

  // 3. Connect GSAP Intro Entrance animations
  runEntranceAnimations();

  // 4. Bind settings sliders to physics parameter updates
  setupControlsMapping(ui, physics);

  // 5. Connect keyboard shortcuts
  setupKeyboardShortcuts(ui, physics);

  // 6. Connect search interactions
  setupSearchInteractions(ui, physics);
});

/**
 * GSAP Powered Entrance animations for pristine Google layout
 */
function runEntranceAnimations() {
  // Set initial hidden state
  gsap.set(['#nav-header', '#logo-container', '#search-box-container', '#buttons-container', '#instructions-hint', '#footer-container', '.quick-controls'], {
    opacity: 0
  });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('#nav-header', { opacity: 1, y: 0, duration: 0.8 })
    .fromTo('.logo-letter', 
      { opacity: 0, scale: 0.5, y: -40 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.08 },
      '-=0.4'
    )
    .fromTo('#search-box-container',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      '-=0.5'
    )
    .fromTo('#buttons-container',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .to(['#instructions-hint', '#footer-container', '.quick-controls'], {
      opacity: 1,
      duration: 0.8,
      stagger: 0.1
    }, '-=0.2')
    .add(() => {
      // Add idle float class after intro finishes to let letters float gently
      document.querySelectorAll('.logo-letter').forEach((letter, i) => {
        // Stagger the idle floats
        setTimeout(() => {
          letter.classList.add('idle-float');
        }, i * 200);
      });
    });
}

/**
 * Maps dashboard inputs to the physics simulation engine
 */
function setupControlsMapping(ui, physics) {
  const gravityYSlider = document.getElementById('gravity-y-slider');
  const gravityXSlider = document.getElementById('gravity-x-slider');
  const bounceSlider = document.getElementById('bounce-slider');
  const frictionSlider = document.getElementById('friction-slider');
  const resetBtn = document.getElementById('reset-btn');
  const pauseBtn = document.getElementById('pause-btn');

  // Gravity sliders
  const updateGravity = () => {
    const gy = parseFloat(gravityYSlider.value);
    const gx = parseFloat(gravityXSlider.value);
    physics.setGravity(gy, gx);
  };

  gravityYSlider.addEventListener('input', updateGravity);
  gravityXSlider.addEventListener('input', updateGravity);

  // Restitution & Friction sliders
  bounceSlider.addEventListener('input', (e) => {
    physics.setBounciness(parseFloat(e.target.value));
  });

  frictionSlider.addEventListener('input', (e) => {
    physics.setFrictionAir(parseFloat(e.target.value));
  });

  // Action triggers
  resetBtn.addEventListener('click', () => {
    physics.reset();
    gravityYSlider.value = 0;
    gravityXSlider.value = 0;
    bounceSlider.value = 0.75;
    frictionSlider.value = 0.02;
    document.getElementById('val-gravity-y').textContent = "0.00";
    document.getElementById('val-gravity-x').textContent = "0.00";
    document.getElementById('val-bounce').textContent = "0.75";
    document.getElementById('val-friction').textContent = "0.02";
  });

  pauseBtn.addEventListener('click', () => {
    physics.togglePause();
  });

  // Spawner buttons in side panel
  const spawnBtns = document.querySelectorAll('.spawn-btn');
  spawnBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      physics.spawnObject(type);
      ui.playSynthSound('click');
    });
  });
}

/**
 * Dynamic keyboard events (hotkeys)
 */
function setupKeyboardShortcuts(ui, physics) {
  window.addEventListener('keydown', (e) => {
    // Skip if user is actively typing in search bar
    if (document.activeElement && document.activeElement.id === 'search-input') {
      return;
    }

    const key = e.key.toLowerCase();

    if (e.code === 'Space' || key === ' ') {
      e.preventDefault();
      physics.togglePause();
    } else if (key === 'r') {
      document.getElementById('reset-btn').click();
    } else if (key === 'g') {
      const sliderY = document.getElementById('gravity-y-slider');
      const valY = document.getElementById('val-gravity-y');
      
      if (physics.settings.gravityY === 0) {
        // Turn gravity on
        sliderY.value = 1.0;
        valY.textContent = "1.00";
        physics.setGravity(1.0, 0);
        ui.playSynthSound('gravityOn');
      } else {
        // Disable gravity
        sliderY.value = 0;
        valY.textContent = "0.00";
        physics.setGravity(0, 0);
        ui.playSynthSound('gravityOff');
      }
    } else if (key === 's') {
      const types = ['letter', 'card', 'ball', 'star'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      physics.spawnObject(randomType);
    } else if (key === 'f') {
      ui.toggleFullscreen();
    }
  });
}

/**
 * Setup interactions for search input and search/lucky buttons
 */
function setupSearchInteractions(ui, physics) {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const luckyBtn = document.getElementById('lucky-btn');

  const executeSearch = () => {
    const query = searchInput.value.trim();
    if (query !== '') {
      physics.spawnObject('card', query);
      searchInput.value = '';
    } else {
      // Spawn random card if empty
      physics.spawnObject('card');
    }
    
    if (!physics.physicsActive) {
      physics.activatePhysics();
    }
  };

  // Trigger search on Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  });

  // Search button
  searchBtn.addEventListener('click', () => {
    executeSearch();
  });

  // I'm Feeling Lucky button - triggers physics & chaotic spawner event!
  luckyBtn.addEventListener('click', () => {
    if (!physics.physicsActive) {
      physics.activatePhysics();
    }
    
    // Easter Egg: Spawn multiple items in cascade
    let delay = 0;
    const types = ['ball', 'letter', 'star', 'card', 'ball', 'star'];
    
    types.forEach((type, idx) => {
      setTimeout(() => {
        physics.spawnObject(type);
      }, delay);
      delay += 120; // Staggered spawn delay
    });
  });
}

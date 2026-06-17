/**
 * Google Anti Gravity - UI & Sound Controller
 * Designed by a Senior Frontend Engineer & UI/UX Expert
 * Features procedurally synthesized sound effects (Web Audio API)
 */

class AntiGravityUI {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'dark';
    this.soundEnabled = true;
    this.audioCtx = null;
    this.isPaused = false;
    this.isFullscreen = false;
    this.fps = 60;
    this.lastFrameTime = performance.now();
    this.frameTicks = 0;
    
    this.initElements();
    this.initThemes();
    this.initSidebar();
    this.initEventListeners();
    this.startFPSCounter();
  }

  initElements() {
    this.themeBtn = document.getElementById('theme-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.panelToggleBtn = document.getElementById('panel-toggle-btn');
    this.closePanelBtn = document.getElementById('close-panel-btn');
    this.settingsSidebar = document.getElementById('settings-sidebar');
    this.settingsTrigger = document.getElementById('settings-trigger');
    this.panelSoundToggle = document.getElementById('panel-sound-toggle');
    this.fpsDisplay = document.getElementById('fps-display');
    this.simulationStateText = document.getElementById('simulation-state-text');
    this.stateDot = document.querySelector('.state-dot');
  }

  initThemes() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeButton();
  }

  updateThemeButton() {
    if (this.theme === 'dark') {
      this.themeBtn.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
      this.themeBtn.title = 'Switch to Light Mode';
    } else {
      this.themeBtn.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
      this.themeBtn.title = 'Switch to Dark Mode';
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    this.updateThemeButton();
    this.playSynthSound('click');
  }

  initSidebar() {
    // Set initial slider label values
    const sliders = [
      { id: 'gravity-y-slider', displayId: 'val-gravity-y', factor: 1 },
      { id: 'gravity-x-slider', displayId: 'val-gravity-x', factor: 1 },
      { id: 'bounce-slider', displayId: 'val-bounce', factor: 1 },
      { id: 'friction-slider', displayId: 'val-friction', factor: 1 }
    ];

    sliders.forEach(slider => {
      const el = document.getElementById(slider.id);
      const valEl = document.getElementById(slider.displayId);
      if (el && valEl) {
        valEl.textContent = parseFloat(el.value).toFixed(2);
        el.addEventListener('input', (e) => {
          valEl.textContent = parseFloat(e.target.value).toFixed(2);
          this.playSynthSound('sliderTick');
        });
      }
    });
  }

  toggleSidebar() {
    this.settingsSidebar.classList.toggle('open');
    this.playSynthSound('click');
  }

  closeSidebar() {
    this.settingsSidebar.classList.remove('open');
    this.playSynthSound('click');
  }

  initAudio() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  playSynthSound(type, params = {}) {
    if (!this.soundEnabled) return;
    
    // Lazy load audio context on first interaction
    this.initAudio();
    if (!this.audioCtx) return;
    
    // Resume context if suspended
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    
    switch (type) {
      case 'click':
        this.synthClick(now);
        break;
      case 'sliderTick':
        this.synthSliderTick(now);
        break;
      case 'gravityOff':
        this.synthGravitySweep(now, 100, 600, 0.4);
        break;
      case 'gravityOn':
        this.synthGravitySweep(now, 600, 100, 0.4);
        break;
      case 'spawn':
        this.synthSpawn(now);
        break;
      case 'impact':
        this.synthImpact(now, params.intensity || 0.5, params.mass || 1);
        break;
      case 'reset':
        this.synthReset(now);
        break;
    }
  }

  synthClick(now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.09);
  }

  synthSliderTick(now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(800, now + 0.01);
    
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.setValueAtTime(0.001, now + 0.02);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }

  synthGravitySweep(now, startFreq, endFreq, duration) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(startFreq * 1.5, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq * 1.5, now + duration);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  synthSpawn(now) {
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.linearRampToValueAtTime(440, now + 0.12);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(330, now);
    osc2.frequency.linearRampToValueAtTime(660, now + 0.12);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.16);
    osc2.stop(now + 0.16);
  }

  synthImpact(now, intensity, mass) {
    // Avoid noise overhead on minor collisions
    if (intensity < 0.08) return;
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    // Heavy mass = low frequency pitch, Light mass = high frequency pitch
    const baseFreq = Math.max(80, Math.min(600, 300 / Math.sqrt(mass)));
    const targetFreq = baseFreq * 0.6;
    const duration = Math.min(0.25, 0.05 + intensity * 0.15);
    const volume = Math.min(0.22, intensity * 0.12);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + duration);
    
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  synthReset(now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.panelSoundToggle.checked = this.soundEnabled;
    
    if (this.soundEnabled) {
      this.soundBtn.innerHTML = '<span class="material-symbols-outlined">volume_up</span>';
      this.soundBtn.title = 'Mute Sound FX';
      this.playSynthSound('click');
    } else {
      this.soundBtn.innerHTML = '<span class="material-symbols-outlined">volume_off</span>';
      this.soundBtn.title = 'Unmute Sound FX';
    }
  }

  setPauseState(paused) {
    this.isPaused = paused;
    if (this.isPaused) {
      this.pauseBtn.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
      this.pauseBtn.title = 'Resume Simulation';
      this.simulationStateText.textContent = 'Paused';
      this.stateDot.className = 'state-dot paused';
    } else {
      this.pauseBtn.innerHTML = '<span class="material-symbols-outlined">pause</span>';
      this.pauseBtn.title = 'Pause Simulation';
      this.simulationStateText.textContent = 'Active (Anti-Gravity)';
      this.stateDot.className = 'state-dot running';
    }
    this.playSynthSound('click');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.isFullscreen = true;
        this.fullscreenBtn.innerHTML = '<span class="material-symbols-outlined">fullscreen_exit</span>';
        this.fullscreenBtn.title = 'Exit Fullscreen';
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
        this.fullscreenBtn.innerHTML = '<span class="material-symbols-outlined">fullscreen</span>';
        this.fullscreenBtn.title = 'Toggle Fullscreen';
      });
    }
    this.playSynthSound('click');
  }

  startFPSCounter() {
    const countFrames = (now) => {
      this.frameTicks++;
      const elapsed = now - this.lastFrameTime;
      
      if (elapsed >= 1000) {
        this.fps = Math.round((this.frameTicks * 1000) / elapsed);
        this.fpsDisplay.textContent = `FPS: ${this.fps}`;
        
        // Dynamic coloring of FPS
        if (this.fps < 30) {
          this.fpsDisplay.style.color = 'var(--accent-red)';
        } else if (this.fps < 50) {
          this.fpsDisplay.style.color = 'var(--accent-yellow)';
        } else {
          this.fpsDisplay.style.color = 'var(--accent-green)';
        }
        
        this.frameTicks = 0;
        this.lastFrameTime = now;
      }
      requestAnimationFrame(countFrames);
    };
    requestAnimationFrame(countFrames);
  }

  initEventListeners() {
    // Quick Controls click triggers
    this.themeBtn.addEventListener('click', () => this.toggleTheme());
    this.soundBtn.addEventListener('click', () => this.toggleSound());
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.panelToggleBtn.addEventListener('click', () => this.toggleSidebar());
    this.closePanelBtn.addEventListener('click', () => this.closeSidebar());
    if (this.settingsTrigger) {
      this.settingsTrigger.addEventListener('click', () => this.toggleSidebar());
    }
    
    // Panel configurations
    this.panelSoundToggle.addEventListener('change', (e) => {
      this.soundEnabled = e.target.checked;
      this.updateSoundButtonState();
    });
  }

  updateSoundButtonState() {
    if (this.soundEnabled) {
      this.soundBtn.innerHTML = '<span class="material-symbols-outlined">volume_up</span>';
      this.soundBtn.title = 'Mute Sound FX';
      this.playSynthSound('click');
    } else {
      this.soundBtn.innerHTML = '<span class="material-symbols-outlined">volume_off</span>';
      this.soundBtn.title = 'Unmute Sound FX';
    }
  }
}

// Export initialization safety
window.AntiGravityUI = AntiGravityUI;

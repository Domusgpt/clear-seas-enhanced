/*
 * MASTER CONDUCTOR SYSTEM
 * Orchestrates all scroll, animation, and interaction systems into unified harmony
 * Single RAF loop, unified timing, coordinated effects - the conductor's baton
 */

class MasterConductor {
  constructor() {
    // Core conductor state
    this.isActive = false;
    this.masterRAF = null;
    this.frameCount = 0;
    this.startTime = performance.now();
    
    // Unified timing system
    this.timing = {
      delta: 0,
      elapsed: 0,
      fps: 60,
      frameTime: 16.67,
      adaptiveQuality: 'high' // high, medium, low
    };
    
    // Global state store (single source of truth)
    this.state = {
      scroll: {
        y: 0,
        velocity: 0,
        direction: 'none',
        isScrolling: false,
        currentZone: null,
        targetZone: null,
        zoneProgress: 0,
        subZone: null
      },
      mouse: {
        x: 0,
        y: 0,
        normalized: { x: 0, y: 0 },
        isMoving: false
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: false,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      user: {
        energy: 0,
        focused: false,
        inputType: 'unknown', // mouse, touch, keyboard
        mood: 'exploration'
      },
      performance: {
        fps: 60,
        frameTime: 16,
        memoryUsage: 0,
        gpuTier: 'medium'
      }
    };
    
    // Orchestrated subsystems (keep all brilliant architecture!)
    this.subsystems = {
      scroll: null,        // IntelligentScrollMaster (converted)
      animations: null,    // ChoreographedVisualizerSystem (converted) 
      pacing: null,        // ZonePacingController (converted)
      mobile: null,        // MobileTouchOptimizer (converted)
      snap: null          // SmoothSnapController (converted)
    };
    
    // Coordination queues
    this.queues = {
      animations: [],      // Queued animations
      transitions: [],     // Queued transitions  
      effects: [],         // Queued effects
      cleanup: []          // Queued cleanup tasks
    };
    
    // Performance monitoring
    this.performance = {
      lastFrameTime: performance.now(),
      frameTimeHistory: [],
      adaptiveThreshold: 16.67, // 60fps target
      qualityReduction: false
    };
    
    console.log('🎼 Master Conductor - Initializing orchestration system');
    this.init();
  }
  
  init() {
    this.detectCapabilities();
    this.setupEventListeners();
    this.initializeSubsystems();
    this.startConducting();
    
    console.log('🎼 Master Conductor - All systems orchestrated and ready');
  }
  
  detectCapabilities() {
    // Detect device capabilities for adaptive quality
    const gpu = this.detectGPUTier();
    const memory = navigator.deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Set initial performance profile
    if (gpu === 'high' && memory >= 8 && !isMobile) {
      this.timing.adaptiveQuality = 'high';
      this.performance.adaptiveThreshold = 16.67; // 60fps
    } else if (gpu === 'medium' || memory >= 4) {
      this.timing.adaptiveQuality = 'medium';  
      this.performance.adaptiveThreshold = 20; // 50fps
    } else {
      this.timing.adaptiveQuality = 'low';
      this.performance.adaptiveThreshold = 33.33; // 30fps
    }
    
    this.state.viewport.isMobile = isMobile;
    this.state.performance.gpuTier = gpu;
    
    console.log(`🎼 Conductor - Performance profile: ${this.timing.adaptiveQuality} (GPU: ${gpu}, Memory: ${memory}GB)`);
  }
  
  detectGPUTier() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'low';
    
    const renderer = gl.getParameter(gl.RENDERER);
    if (renderer.includes('NVIDIA') || renderer.includes('AMD Radeon')) return 'high';
    if (renderer.includes('Intel') && !renderer.includes('Intel HD')) return 'medium';
    return 'low';
  }
  
  setupEventListeners() {
    // MASTER scroll listener (replaces all others)
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // MASTER mouse listener  
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
    
    // MASTER resize listener
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    
    // User interaction tracking
    ['click', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, this.handleUserInteraction.bind(this), { passive: true });
    });
    
    // Visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    console.log('🎼 Conductor - Master event listeners established');
  }
  
  handleScroll(event) {
    // Update scroll state (single source of truth)
    const newY = window.scrollY;
    const delta = newY - this.state.scroll.y;
    
    this.state.scroll.y = newY;
    this.state.scroll.velocity = delta;
    this.state.scroll.direction = delta > 0 ? 'down' : delta < 0 ? 'up' : 'none';
    this.state.scroll.isScrolling = true;
    
    // Queue scroll effects (don't execute immediately)
    this.queueTransition({
      type: 'scroll',
      data: { scrollY: newY, delta, velocity: delta }
    });
  }
  
  handleMouseMove(event) {
    this.state.mouse.x = event.clientX;
    this.state.mouse.y = event.clientY;
    this.state.mouse.normalized.x = (event.clientX / this.state.viewport.width) * 2 - 1;
    this.state.mouse.normalized.y = (event.clientY / this.state.viewport.height) * 2 - 1;
    this.state.mouse.isMoving = true;
    
    // Auto-clear moving state
    clearTimeout(this.mouseTimeout);
    this.mouseTimeout = setTimeout(() => {
      this.state.mouse.isMoving = false;
    }, 100);
  }
  
  handleResize() {
    this.state.viewport.width = window.innerWidth;
    this.state.viewport.height = window.innerHeight;
    
    // Queue resize effects
    this.queueEffect({
      type: 'resize',
      data: { width: this.state.viewport.width, height: this.state.viewport.height }
    });
  }
  
  handleUserInteraction(event) {
    this.state.user.energy = Math.min(this.state.user.energy + 5, 100);
    this.state.user.inputType = event.type === 'touchstart' ? 'touch' : 
                                event.type === 'keydown' ? 'keyboard' : 'mouse';
    
    // Decay energy over time
    clearTimeout(this.energyTimeout);
    this.energyTimeout = setTimeout(() => {
      this.state.user.energy = Math.max(this.state.user.energy - 2, 0);
    }, 1000);
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseConducting();
    } else {
      this.resumeConducting();
    }
  }
  
  initializeSubsystems() {
    // Convert existing systems to coordinated mode
    this.convertScrollSystems();
    this.convertAnimationSystems();
    this.convertEffectSystems();
    
    console.log('🎼 Conductor - All subsystems converted to coordinated mode');
  }
  
  convertScrollSystems() {
    // Disable old scroll listeners and convert systems
    this.disableOldScrollListeners();
    
    // Initialize coordinated scroll subsystems
    if (window.IntelligentScrollMaster) {
      this.subsystems.scroll = new CoordinatedScrollMaster(this);
    }
    
    if (window.ZonePacingController) {
      this.subsystems.pacing = new CoordinatedPacingController(this);
    }
    
    if (window.MobileTouchOptimizer) {
      this.subsystems.mobile = new CoordinatedMobileOptimizer(this);
    }
    
    if (window.SmoothSnapController) {
      this.subsystems.snap = new CoordinatedSnapController(this);
    }
  }
  
  convertAnimationSystems() {
    // Convert animation systems to coordinated mode
    if (window.ChoreographedVisualizerSystem) {
      this.subsystems.animations = new CoordinatedAnimationSystem(this);
    }
  }
  
  convertEffectSystems() {
    // Convert effect systems to coordinated mode
    // Cards, transitions, etc. will be coordinated through the conductor
  }
  
  disableOldScrollListeners() {
    // Override addEventListener to prevent new scroll listeners
    const originalAddEventListener = window.addEventListener;
    let scrollListenerCount = 0;
    
    window.addEventListener = function(type, listener, options) {
      if (type === 'scroll' && scrollListenerCount > 0) {
        console.log('🎼 Conductor - Blocked redundant scroll listener');
        return;
      }
      
      if (type === 'scroll') scrollListenerCount++;
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Disable existing systems
    ['intelligentScrollMaster', 'smoothSnapController', 'choreographedSystem'].forEach(system => {
      if (window[system] && typeof window[system].destroy === 'function') {
        window[system].destroy();
      }
      window[system] = null;
    });
    
    console.log('🎼 Conductor - Old scroll listeners disabled');
  }
  
  // MASTER RAF LOOP - Single coordinated animation frame
  startConducting() {
    if (this.isActive) return;
    
    this.isActive = true;
    const conduct = (currentTime) => {
      if (!this.isActive) return;
      
      // Calculate timing
      this.timing.delta = currentTime - this.performance.lastFrameTime;
      this.timing.elapsed = currentTime - this.startTime;
      this.timing.fps = 1000 / this.timing.delta;
      this.timing.frameTime = this.timing.delta;
      
      // Performance monitoring
      this.monitorPerformance(currentTime);
      
      // COORDINATED EXECUTION (single RAF, proper sequencing)
      this.conductScrollEffects();
      this.conductAnimations();
      this.conductTransitions();
      this.conductEffects();
      this.conductCleanup();
      
      // Update state
      this.updateGlobalState();
      
      // Continue conducting
      this.performance.lastFrameTime = currentTime;
      this.frameCount++;
      this.masterRAF = requestAnimationFrame(conduct);
    };
    
    this.masterRAF = requestAnimationFrame(conduct);
    console.log('🎼 Conductor - Master conducting loop started');
  }
  
  conductScrollEffects() {
    // Process queued scroll transitions
    const scrollTransitions = this.queues.transitions.filter(t => t.type === 'scroll');
    
    scrollTransitions.forEach(transition => {
      // Coordinate with all scroll subsystems
      if (this.subsystems.scroll) {
        this.subsystems.scroll.handleCoordinatedScroll(transition.data, this.state);
      }
      
      if (this.subsystems.pacing) {
        this.subsystems.pacing.handleCoordinatedScroll(transition.data, this.state);
      }
      
      if (this.subsystems.mobile && this.state.viewport.isMobile) {
        this.subsystems.mobile.handleCoordinatedScroll(transition.data, this.state);
      }
      
      if (this.subsystems.snap) {
        this.subsystems.snap.handleCoordinatedScroll(transition.data, this.state);
      }
    });
    
    // Clear processed scroll transitions
    this.queues.transitions = this.queues.transitions.filter(t => t.type !== 'scroll');
    
    // Auto-clear scrolling state
    if (this.state.scroll.isScrolling) {
      clearTimeout(this.scrollingTimeout);
      this.scrollingTimeout = setTimeout(() => {
        this.state.scroll.isScrolling = false;
        this.state.scroll.velocity = 0;
      }, 150);
    }
  }
  
  conductAnimations() {
    // Process queued animations with proper sequencing
    const animations = this.queues.animations.splice(0); // Take all animations
    
    animations.forEach(animation => {
      if (this.subsystems.animations) {
        this.subsystems.animations.handleCoordinatedAnimation(animation, this.state);
      }
    });
  }
  
  conductTransitions() {
    // Process non-scroll transitions
    const transitions = this.queues.transitions.filter(t => t.type !== 'scroll');
    
    transitions.forEach(transition => {
      // Coordinate transition execution based on type
      this.executeCoordinatedTransition(transition);
    });
    
    // Clear processed transitions
    this.queues.transitions = this.queues.transitions.filter(t => t.type === 'scroll');
  }
  
  conductEffects() {
    // Process queued effects
    const effects = this.queues.effects.splice(0);
    
    effects.forEach(effect => {
      this.executeCoordinatedEffect(effect);
    });
  }
  
  conductCleanup() {
    // Process cleanup tasks
    const cleanups = this.queues.cleanup.splice(0);
    
    cleanups.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
  }
  
  updateGlobalState() {
    // Update global state variables for CSS
    document.documentElement.style.setProperty('--scroll-progress', this.state.scroll.y / (document.body.scrollHeight - window.innerHeight));
    document.documentElement.style.setProperty('--mouse-x', this.state.mouse.normalized.x);
    document.documentElement.style.setProperty('--mouse-y', this.state.mouse.normalized.y);
    document.documentElement.style.setProperty('--user-energy', this.state.user.energy);
    document.documentElement.style.setProperty('--fps', this.state.performance.fps);
  }
  
  monitorPerformance(currentTime) {
    // Track frame time history
    this.performance.frameTimeHistory.push(this.timing.delta);
    if (this.performance.frameTimeHistory.length > 60) {
      this.performance.frameTimeHistory.shift();
    }
    
    // Calculate average frame time
    const avgFrameTime = this.performance.frameTimeHistory.reduce((a, b) => a + b, 0) / this.performance.frameTimeHistory.length;
    this.state.performance.fps = 1000 / avgFrameTime;
    this.state.performance.frameTime = avgFrameTime;
    
    // Adaptive quality adjustment
    if (avgFrameTime > this.performance.adaptiveThreshold && !this.performance.qualityReduction) {
      this.reduceQuality();
    } else if (avgFrameTime < this.performance.adaptiveThreshold * 0.8 && this.performance.qualityReduction) {
      this.restoreQuality();
    }
  }
  
  reduceQuality() {
    this.performance.qualityReduction = true;
    
    switch (this.timing.adaptiveQuality) {
      case 'high':
        this.timing.adaptiveQuality = 'medium';
        break;
      case 'medium':
        this.timing.adaptiveQuality = 'low';
        break;
    }
    
    // Notify subsystems of quality change
    this.broadcastQualityChange();
    console.log(`🎼 Conductor - Quality reduced to ${this.timing.adaptiveQuality} (FPS: ${this.state.performance.fps.toFixed(1)})`);
  }
  
  restoreQuality() {
    this.performance.qualityReduction = false;
    
    // Gradually restore quality
    setTimeout(() => {
      switch (this.timing.adaptiveQuality) {
        case 'low':
          this.timing.adaptiveQuality = 'medium';
          break;
        case 'medium':
          this.timing.adaptiveQuality = 'high';
          break;
      }
      
      this.broadcastQualityChange();
      console.log(`🎼 Conductor - Quality restored to ${this.timing.adaptiveQuality}`);
    }, 2000);
  }
  
  broadcastQualityChange() {
    // Notify all subsystems of quality change
    Object.values(this.subsystems).forEach(subsystem => {
      if (subsystem && typeof subsystem.updateQuality === 'function') {
        subsystem.updateQuality(this.timing.adaptiveQuality);
      }
    });
  }
  
  // Public API for subsystems
  queueAnimation(animation) {
    this.queues.animations.push(animation);
  }
  
  queueTransition(transition) {
    this.queues.transitions.push(transition);
  }
  
  queueEffect(effect) {
    this.queues.effects.push(effect);
  }
  
  queueCleanup(cleanup) {
    this.queues.cleanup.push(cleanup);
  }
  
  executeCoordinatedTransition(transition) {
    // Execute transitions with proper timing and coordination
    switch (transition.type) {
      case 'zone':
        this.executeZoneTransition(transition.data);
        break;
      case 'card':
        this.executeCardTransition(transition.data);
        break;
      case 'resize':
        this.executeResizeTransition(transition.data);
        break;
    }
  }
  
  executeCoordinatedEffect(effect) {
    // Execute effects with proper coordination
    switch (effect.type) {
      case 'hover':
        this.executeHoverEffect(effect.data);
        break;
      case 'click':
        this.executeClickEffect(effect.data);
        break;
      case 'focus':
        this.executeFocusEffect(effect.data);
        break;
    }
  }
  
  executeZoneTransition(data) {
    // Coordinated zone transition
    const { oldZone, newZone } = data;
    
    // Sequential effects (no chaos!)
    if (oldZone) {
      this.fadeOutZone(oldZone, () => {
        if (newZone) {
          this.fadeInZone(newZone);
        }
      });
    } else if (newZone) {
      this.fadeInZone(newZone);
    }
  }
  
  fadeOutZone(zone, callback) {
    // Smooth zone fade out
    if (zone.element) {
      zone.element.style.transition = 'opacity 0.6s ease-out';
      zone.element.style.opacity = '0.8';
      
      setTimeout(callback, 600);
    } else {
      callback();
    }
  }
  
  fadeInZone(zone) {
    // Smooth zone fade in
    if (zone.element) {
      zone.element.style.transition = 'opacity 0.8s ease-in';
      zone.element.style.opacity = '1';
    }
  }
  
  pauseConducting() {
    this.isActive = false;
    if (this.masterRAF) {
      cancelAnimationFrame(this.masterRAF);
      this.masterRAF = null;
    }
    console.log('🎼 Conductor - Conducting paused');
  }
  
  resumeConducting() {
    if (!this.isActive) {
      this.startConducting();
      console.log('🎼 Conductor - Conducting resumed');
    }
  }
  
  destroy() {
    this.pauseConducting();
    
    // Cleanup all subsystems
    Object.values(this.subsystems).forEach(subsystem => {
      if (subsystem && typeof subsystem.destroy === 'function') {
        subsystem.destroy();
      }
    });
    
    console.log('🎼 Conductor - Orchestra dismissed');
  }
}

// Export for global access
window.MasterConductor = MasterConductor;
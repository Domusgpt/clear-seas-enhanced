/*
 * INTELLIGENT SCROLL MASTER CONTROLLER
 * Smart zone-based scroll management with reactive visualizer lifecycle
 * Replaces all individual scroll listeners with unified intelligence
 */

class IntelligentScrollMaster {
  constructor() {
    this.zones = new Map();
    this.activeVisualizers = new Map();
    this.scrollHistory = [];
    this.currentZone = null;
    this.transitionZone = null;
    
    // Performance tracking
    this.frameTime = 0;
    this.lastFrameTime = performance.now();
    this.performanceLevel = 'high'; // high, medium, low
    
    // Gesture detection
    this.gestureState = {
      isScrolling: false,
      velocity: 0,
      direction: 'none',
      inputType: 'unknown', // mouse, touch, trackpad, keyboard
      intensity: 0
    };
    
    // Master scroll listener state
    this.masterListenerActive = false;
    this.scrollRAF = null;
    
    this.init();
  }
  
  init() {
    this.defineScrollZones();
    this.setupMasterScrollListener();
    this.setupPerformanceMonitoring();
    this.setupGestureDetection();
    this.createScrollIndicator();
    
    console.log('🧠 Intelligent Scroll Master - Initialized with zone-based control');
  }
  
  defineScrollZones() {
    // Each zone is 300vh with specific sub-zones
    const sectionOrder = ['hero', 'technology', 'portfolio', 'research', 'about', 'contact'];
    const zoneHeight = window.innerHeight * 3; // 300vh per section
    
    sectionOrder.forEach((sectionId, index) => {
      const startY = index * zoneHeight;
      
      this.zones.set(sectionId, {
        id: sectionId,
        element: document.getElementById(sectionId),
        startY: startY,
        endY: startY + zoneHeight,
        
        // Sub-zones within each section
        subZones: {
          entry: { start: startY, end: startY + (zoneHeight * 0.2) }, // 0-20% - Load and present
          development: { start: startY + (zoneHeight * 0.2), end: startY + (zoneHeight * 0.7) }, // 20-70% - Morph and develop
          flourish: { start: startY + (zoneHeight * 0.7), end: startY + (zoneHeight * 0.9) }, // 70-90% - Dramatic effects
          transition: { start: startY + (zoneHeight * 0.9), end: startY + zoneHeight } // 90-100% - Prepare next
        },
        
        // Visualizer configuration
        visualizerConfig: this.getVisualizerConfig(sectionId),
        
        // State
        isActive: false,
        isLoaded: false,
        visualizerInstance: null,
        canvasElements: [],
        
        // Performance settings
        maxCanvases: this.getMaxCanvasesForSection(sectionId),
        qualityLevel: 'auto'
      });
    });
    
    // Set document height to accommodate all zones
    document.body.style.height = `${sectionOrder.length * zoneHeight}px`;
  }
  
  getVisualizerConfig(sectionId) {
    const configs = {
      hero: {
        type: 'polychora',
        canvasLayers: ['background', 'primary', 'effects', 'particles'],
        reactivity: { scrollSensitivity: 0.8, morphSpeed: 1.2, intensityRange: [0.3, 1.0] },
        effects: ['holographic', 'glitch', 'moire'],
        transitionStyle: 'dramatic'
      },
      technology: {
        type: 'quantum',
        canvasLayers: ['background', 'lattice', 'interference'],
        reactivity: { scrollSensitivity: 1.0, morphSpeed: 0.8, intensityRange: [0.2, 0.9] },
        effects: ['quantum-foam', 'lattice-distort'],
        transitionStyle: 'fluid'
      },
      portfolio: {
        type: 'faceted',
        canvasLayers: ['background', 'geometry'],
        reactivity: { scrollSensitivity: 0.6, morphSpeed: 1.5, intensityRange: [0.1, 0.8] },
        effects: ['geometric-morph'],
        transitionStyle: 'clean'
      },
      research: {
        type: 'holographic',
        canvasLayers: ['background', 'holo-primary', 'shimmer', 'depth'],
        reactivity: { scrollSensitivity: 1.2, morphSpeed: 0.9, intensityRange: [0.4, 1.0] },
        effects: ['holographic', 'depth-parallax', 'shimmer'],
        transitionStyle: 'immersive'
      },
      about: {
        type: 'minimal',
        canvasLayers: ['background'],
        reactivity: { scrollSensitivity: 0.3, morphSpeed: 2.0, intensityRange: [0.0, 0.5] },
        effects: ['subtle-glow'],
        transitionStyle: 'gentle'
      },
      contact: {
        type: 'interactive',
        canvasLayers: ['background', 'interactive'],
        reactivity: { scrollSensitivity: 0.9, morphSpeed: 1.1, intensityRange: [0.2, 1.0] },
        effects: ['interactive-response'],
        transitionStyle: 'responsive'
      }
    };
    
    return configs[sectionId] || configs.minimal;
  }
  
  getMaxCanvasesForSection(sectionId) {
    // Limit canvases based on performance and section needs
    const limits = {
      hero: 4,
      technology: 3,
      portfolio: 2,
      research: 4,
      about: 1,
      contact: 2
    };
    
    return limits[sectionId] * this.getPerformanceMultiplier();
  }
  
  getPerformanceMultiplier() {
    // Adjust canvas limits based on device performance
    const gpu = this.detectGPUTier();
    const ram = navigator.deviceMemory || 4;
    
    if (gpu === 'high' && ram >= 8) return 1.0;
    if (gpu === 'medium' || ram >= 4) return 0.7;
    return 0.5;
  }
  
  detectGPUTier() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'low';
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    // Simple GPU tier detection
    if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Intel Iris')) {
      return 'high';
    }
    
    return 'medium';
  }
  
  setupMasterScrollListener() {
    // Kill all existing scroll listeners first
    this.killExistingScrollListeners();
    
    // Single master scroll listener with intelligent throttling
    window.addEventListener('scroll', this.handleMasterScroll.bind(this), { passive: true });
    window.addEventListener('wheel', this.handleWheelInput.bind(this), { passive: false });
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    this.masterListenerActive = true;
    console.log('🎯 Master scroll listener activated - All individual listeners disabled');
  }
  
  killExistingScrollListeners() {
    // Remove existing problematic scroll listeners by overriding their functions
    const problematicGlobals = [
      'tactileSnapScroll',
      'woahCardSystem',
      'hypercubeMoireEngine',
      'smartVisualizer',
      'choreographedVisualizer',
      'ultimateScrollOrchestrator'
    ];
    
    problematicGlobals.forEach(globalName => {
      if (window[globalName]) {
        console.log(`🔇 Disabling scroll listener from ${globalName}`);
        if (window[globalName].destroy) window[globalName].destroy();
        if (window[globalName].disable) window[globalName].disable();
        window[globalName] = null;
      }
    });
  }
  
  handleMasterScroll(event) {
    if (this.scrollRAF) return;
    
    this.scrollRAF = requestAnimationFrame(() => {
      const startTime = performance.now();
      
      // Update gesture state
      this.updateScrollGesture();
      
      // Determine current zone and sub-zone
      const currentScroll = window.scrollY;
      const newZone = this.determineCurrentZone(currentScroll);
      const subZone = this.determineSubZone(newZone, currentScroll);
      
      // Handle zone transitions
      if (newZone !== this.currentZone) {
        this.handleZoneTransition(this.currentZone, newZone);
        this.currentZone = newZone;
      }
      
      // Update visualizers based on sub-zone
      if (newZone) {
        this.updateVisualizersForSubZone(newZone, subZone, currentScroll);
      }
      
      // Update zone CSS classes
      this.updateZoneClasses(newZone, subZone);
      
      // Update scroll indicator
      this.updateScrollIndicator(currentScroll);
      
      // Performance monitoring
      this.frameTime = performance.now() - startTime;
      this.adjustPerformanceLevel();
      
      this.scrollRAF = null;
    });
  }
  
  updateScrollGesture() {
    const now = performance.now();
    const currentScroll = window.scrollY;
    
    // Add to scroll history
    this.scrollHistory.push({ y: currentScroll, time: now });
    
    // Keep only last 10 scroll events for velocity calculation
    if (this.scrollHistory.length > 10) {
      this.scrollHistory.shift();
    }
    
    // Calculate velocity and direction
    if (this.scrollHistory.length >= 2) {
      const latest = this.scrollHistory[this.scrollHistory.length - 1];
      const previous = this.scrollHistory[this.scrollHistory.length - 2];
      
      const deltaY = latest.y - previous.y;
      const deltaTime = Math.max(latest.time - previous.time, 1);
      
      this.gestureState.velocity = Math.abs(deltaY / deltaTime);
      this.gestureState.direction = deltaY > 0 ? 'down' : 'up';
      this.gestureState.intensity = Math.min(this.gestureState.velocity / 2, 1.0);
    }
  }
  
  determineCurrentZone(scrollY) {
    for (const [zoneId, zone] of this.zones) {
      if (scrollY >= zone.startY && scrollY < zone.endY) {
        return zone;
      }
    }
    return null;
  }
  
  determineSubZone(zone, scrollY) {
    if (!zone) return null;
    
    const relativeY = scrollY - zone.startY;
    const zoneProgress = relativeY / (zone.endY - zone.startY);
    
    for (const [subZoneName, subZone] of Object.entries(zone.subZones)) {
      const subZoneStart = (subZone.start - zone.startY) / (zone.endY - zone.startY);
      const subZoneEnd = (subZone.end - zone.startY) / (zone.endY - zone.startY);
      
      if (zoneProgress >= subZoneStart && zoneProgress < subZoneEnd) {
        return {
          name: subZoneName,
          progress: (zoneProgress - subZoneStart) / (subZoneEnd - subZoneStart),
          globalProgress: zoneProgress
        };
      }
    }
    
    return null;
  }
  
  handleZoneTransition(oldZone, newZone) {
    console.log(`🌊 Zone transition: ${oldZone?.id || 'none'} → ${newZone?.id || 'none'}`);
    
    // Gracefully shut down old zone
    if (oldZone) {
      this.shutdownZoneVisualizers(oldZone);
    }
    
    // Initialize new zone
    if (newZone) {
      this.initializeZoneVisualizers(newZone);
    }
  }
  
  shutdownZoneVisualizers(zone) {
    if (zone.visualizerInstance) {
      console.log(`🔄 Shutting down visualizers for ${zone.id}`);
      
      // Graceful shutdown with fade-out
      this.fadeOutZoneEffects(zone, () => {
        // Destroy canvases and free memory
        zone.canvasElements.forEach(canvas => {
          if (canvas.getContext) {
            const ctx = canvas.getContext('webgl') || canvas.getContext('2d');
            if (ctx && ctx.clear) ctx.clear(ctx.COLOR_BUFFER_BIT);
          }
          canvas.remove();
        });
        
        zone.canvasElements = [];
        zone.visualizerInstance = null;
        zone.isActive = false;
        
        // Force garbage collection hint
        if (window.gc) window.gc();
      });
    }
  }
  
  initializeZoneVisualizers(zone) {
    if (zone.isActive) return;
    
    console.log(`✨ Initializing visualizers for ${zone.id}`);
    
    // Create visualizer based on zone config
    const config = zone.visualizerConfig;
    zone.visualizerInstance = this.createZoneVisualizer(zone, config);
    
    // Create required canvases
    this.createZoneCanvases(zone, config);
    
    zone.isActive = true;
    zone.isLoaded = true;
    
    // Fade in effect
    this.fadeInZoneEffects(zone);
  }
  
  createZoneVisualizer(zone, config) {
    // Factory pattern for different visualizer types
    const visualizerFactories = {
      polychora: () => new PolychoraZoneVisualizer(zone, config),
      quantum: () => new QuantumZoneVisualizer(zone, config),
      faceted: () => new FacetedZoneVisualizer(zone, config),
      holographic: () => new HolographicZoneVisualizer(zone, config),
      minimal: () => new MinimalZoneVisualizer(zone, config),
      interactive: () => new InteractiveZoneVisualizer(zone, config)
    };
    
    const factory = visualizerFactories[config.type] || visualizerFactories.minimal;
    return factory();
  }
  
  createZoneCanvases(zone, config) {
    const container = zone.element;
    if (!container) return;
    
    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'zone-canvas-container';
    canvasContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    `;
    
    // Create canvases for each layer
    config.canvasLayers.forEach((layerName, index) => {
      const canvas = document.createElement('canvas');
      canvas.id = `${zone.id}-${layerName}-canvas`;
      canvas.className = `zone-canvas zone-canvas-${layerName}`;
      
      canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: ${index + 1};
        mix-blend-mode: ${this.getBlendModeForLayer(layerName)};
      `;
      
      // Set canvas resolution
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      
      canvasContainer.appendChild(canvas);
      zone.canvasElements.push(canvas);
    });
    
    container.appendChild(canvasContainer);
  }
  
  getBlendModeForLayer(layerName) {
    const blendModes = {
      background: 'normal',
      primary: 'multiply',
      effects: 'screen',
      particles: 'lighter',
      lattice: 'overlay',
      interference: 'difference',
      shimmer: 'soft-light',
      depth: 'multiply'
    };
    
    return blendModes[layerName] || 'normal';
  }
  
  updateVisualizersForSubZone(zone, subZone, scrollY) {
    if (!zone.visualizerInstance || !subZone) return;
    
    // Calculate dynamic parameters based on sub-zone and gesture
    const params = this.calculateVisualizerParameters(zone, subZone);
    
    // Update visualizer with new parameters
    zone.visualizerInstance.updateParameters(params);
    zone.visualizerInstance.render();
  }
  
  calculateVisualizerParameters(zone, subZone) {
    const config = zone.visualizerConfig;
    const reactivity = config.reactivity;
    
    // Base parameters from sub-zone progress
    const baseIntensity = this.interpolate(
      reactivity.intensityRange[0],
      reactivity.intensityRange[1],
      subZone.progress
    );
    
    // Modify based on gesture
    const gestureMultiplier = 1 + (this.gestureState.intensity * 0.3);
    const velocityInfluence = Math.min(this.gestureState.velocity * 0.1, 0.5);
    
    // Sub-zone specific modifications
    const subZoneMultipliers = {
      entry: { intensity: 0.7, morph: 0.3, chaos: 0.1 },
      development: { intensity: 1.0, morph: 1.0, chaos: 0.5 },
      flourish: { intensity: 1.3, morph: 1.5, chaos: 0.8 },
      transition: { intensity: 0.8, morph: 0.6, chaos: 0.3 }
    };
    
    const multiplier = subZoneMultipliers[subZone.name] || subZoneMultipliers.development;
    
    return {
      intensity: baseIntensity * multiplier.intensity * gestureMultiplier,
      morphFactor: subZone.progress * multiplier.morph + velocityInfluence,
      chaos: subZone.progress * multiplier.chaos,
      hue: (subZone.globalProgress * 360) % 360,
      saturation: 0.7 + (this.gestureState.intensity * 0.3),
      speed: reactivity.morphSpeed * (1 + velocityInfluence),
      
      // Gesture-specific parameters
      glitchIntensity: this.gestureState.intensity * 0.5,
      chromaticShift: this.gestureState.velocity * 0.02,
      
      // Performance-adjusted parameters
      qualityLevel: this.performanceLevel,
      maxParticles: this.getMaxParticlesForPerformance()
    };
  }
  
  interpolate(start, end, progress) {
    return start + (end - start) * Math.max(0, Math.min(1, progress));
  }
  
  fadeOutZoneEffects(zone, callback) {
    if (!zone.element) {
      callback();
      return;
    }
    
    const container = zone.element.querySelector('.zone-canvas-container');
    if (container) {
      container.style.transition = 'opacity 0.8s ease-out';
      container.style.opacity = '0';
      
      setTimeout(callback, 800);
    } else {
      callback();
    }
  }
  
  fadeInZoneEffects(zone) {
    if (!zone.element) return;
    
    const container = zone.element.querySelector('.zone-canvas-container');
    if (container) {
      container.style.transition = 'opacity 1.2s ease-in';
      container.style.opacity = '1';
    }
  }
  
  setupGestureDetection() {
    // Wheel input detection
    this.handleWheelInput = (e) => {
      const delta = Math.abs(e.deltaY);
      
      // Detect input type based on delta patterns
      if (delta < 10) {
        this.gestureState.inputType = 'trackpad';
      } else if (delta > 100) {
        this.gestureState.inputType = 'mouse';
      } else {
        this.gestureState.inputType = 'wheel';
      }
      
      // Adjust scroll sensitivity based on input type
      const sensitivity = {
        trackpad: 0.6,
        mouse: 1.0,
        wheel: 0.8
      }[this.gestureState.inputType] || 1.0;
      
      this.gestureState.intensity = Math.min(delta * 0.01 * sensitivity, 1.0);
    };
    
    // Touch gesture detection
    this.touchStartY = 0;
    this.touchStartTime = 0;
    
    this.handleTouchStart = (e) => {
      this.gestureState.inputType = 'touch';
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
    };
    
    this.handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        this.gestureState.inputType = 'multitouch';
        return;
      }
      
      const currentY = e.touches[0].clientY;
      const deltaY = this.touchStartY - currentY;
      const deltaTime = performance.now() - this.touchStartTime;
      
      this.gestureState.velocity = Math.abs(deltaY / Math.max(deltaTime, 1));
      this.gestureState.direction = deltaY > 0 ? 'up' : 'down';
      this.gestureState.intensity = Math.min(this.gestureState.velocity * 0.1, 1.0);
    };
    
    this.handleTouchEnd = () => {
      // Apply momentum based on gesture
      const momentum = this.gestureState.velocity * 0.5;
      this.applyScrollMomentum(momentum);
    };
  }
  
  applyScrollMomentum(momentum) {
    // Apply physics-based momentum scrolling
    const direction = this.gestureState.direction === 'down' ? 1 : -1;
    const scrollDistance = momentum * direction * 100;
    
    window.scrollBy({
      top: scrollDistance,
      behavior: 'smooth'
    });
  }
  
  setupPerformanceMonitoring() {
    // Monitor frame time and adjust performance
    setInterval(() => {
      if (this.frameTime > 16) { // > 60fps
        if (this.performanceLevel !== 'low') {
          this.performanceLevel = 'medium';
          console.log('📉 Performance adjusted to medium');
        }
      } else if (this.frameTime > 33) { // > 30fps
        this.performanceLevel = 'low';
        console.log('📉 Performance adjusted to low');
      } else if (this.frameTime < 10 && this.performanceLevel !== 'high') {
        this.performanceLevel = 'high';
        console.log('📈 Performance adjusted to high');
      }
      
      this.lastFrameTime = performance.now();
    }, 1000);
  }
  
  adjustPerformanceLevel() {
    // Adjust all active visualizers based on performance level
    this.zones.forEach(zone => {
      if (zone.visualizerInstance) {
        zone.visualizerInstance.updateParameters({
          qualityLevel: this.performanceLevel,
          maxParticles: this.getMaxParticlesForPerformance()
        });
      }
    });
  }
  
  getMaxParticlesForPerformance() {
    const baseCounts = {
      high: 2000,
      medium: 1000,
      low: 500
    };
    
    return baseCounts[this.performanceLevel] || 500;
  }
  
  createScrollIndicator() {
    // Initialize the intelligent scroll indicator
    this.scrollIndicator = new IntelligentScrollIndicator(this);
  }
  
  updateScrollIndicator(scrollY) {
    if (this.scrollIndicator) {
      this.scrollIndicator.updateIndicator(scrollY);
    }
  }
  
  // Add static background
  addStaticBackground() {
    const staticBg = document.createElement('div');
    staticBg.className = 'parallax-bg-static';
    document.body.insertBefore(staticBg, document.body.firstChild);
  }
  
  // Zone class manipulation for CSS
  updateZoneClasses(zone, subZone) {
    if (!zone || !zone.element) return;
    
    // Remove old classes
    zone.element.classList.remove('zone-active', 'subzone-entry', 'subzone-development', 'subzone-flourish', 'subzone-transition');
    
    // Add current zone class
    zone.element.classList.add('zone-active');
    
    // Add sub-zone class
    if (subZone) {
      zone.element.classList.add(`subzone-${subZone.name}`);
      
      // Add gesture feedback
      if (this.gestureState.intensity > 0.5) {
        zone.element.classList.add('gesture-active');
        setTimeout(() => {
          zone.element.classList.remove('gesture-active');
        }, 200);
      }
      
      if (this.gestureState.intensity > 0.8) {
        zone.element.classList.add('gesture-intense');
        setTimeout(() => {
          zone.element.classList.remove('gesture-intense');
        }, 300);
      }
    }
  }
  
  // Override old scroll listeners
  disableLegacyScrollSystems() {
    // Disable problematic scroll systems
    const legacySystems = [
      'ultimateScrollOrchestrator',
      'cinematicScrollDirector',
      'advancedScrollMorphSystem',
      'unifiedScrollMaster'
    ];
    
    legacySystems.forEach(systemName => {
      if (window[systemName]) {
        console.log(`🔇 Disabling legacy system: ${systemName}`);
        
        // Try different methods to disable
        if (window[systemName].disable) window[systemName].disable();
        if (window[systemName].destroy) window[systemName].destroy();
        if (window[systemName].stop) window[systemName].stop();
        
        // Nullify the system
        window[systemName] = null;
      }
    });
    
    // Override addEventListener for scroll events temporarily
    const originalAddEventListener = window.addEventListener;
    let scrollListenerCount = 0;
    
    window.addEventListener = function(type, listener, options) {
      if (type === 'scroll' && scrollListenerCount > 0) {
        console.log('🚫 Blocked redundant scroll listener');
        return;
      }
      
      if (type === 'scroll') {
        scrollListenerCount++;
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Restore original after a delay
    setTimeout(() => {
      window.addEventListener = originalAddEventListener;
    }, 2000);
  }
}

// Initialize the intelligent scroll master
window.addEventListener('DOMContentLoaded', () => {
  // Wait for all other scripts to load, then take control
  setTimeout(() => {
    window.intelligentScrollMaster = new IntelligentScrollMaster();
    
    // Add static background
    window.intelligentScrollMaster.addStaticBackground();
    
    console.log('🎯 Intelligent Scroll Master - Complete system initialized');
  }, 100);
});
/*
 * Choreographed Reactive Visualizer System
 * A totalistic reactive system where visualizers morph, transform, and dance
 * in harmony with scroll position, user interactions, and UI state
 * 
 * Philosophy: Everything is connected - each interaction affects the whole system
 */

class ChoreographedVisualizerSystem {
  constructor() {
    this.visualizers = new Map();
    this.activeScenes = new Map();
    this.globalState = {
      scrollProgress: 0,
      mousePosition: { x: 0, y: 0 },
      focusedElement: null,
      userEnergy: 0, // How active the user is
      timeOfDay: this.getTimeOfDay(),
      currentMood: 'exploration' // exploration, focus, creation, reflection
    };

    this.scenes = {
      'hero': {
        geometry: 'polychora',
        parameters: { 
          morphFactor: 1.0, 
          intensity: 0.8, 
          rotationSpeed: 0.002,
          particleDensity: 0.7 
        },
        reactivity: 'cosmic'
      },
      'technology': {
        geometry: 'faceted',
        parameters: { 
          morphFactor: 0.5, 
          intensity: 0.9, 
          rotationSpeed: 0.001,
          particleDensity: 0.5 
        },
        reactivity: 'precision'
      },
      'portfolio': {
        geometry: 'quantum',
        parameters: { 
          morphFactor: 1.5, 
          intensity: 0.6, 
          rotationSpeed: 0.003,
          particleDensity: 0.8 
        },
        reactivity: 'creative'
      },
      'research': {
        geometry: 'holographic',
        parameters: { 
          morphFactor: 2.0, 
          intensity: 1.0, 
          rotationSpeed: 0.001,
          particleDensity: 0.9 
        },
        reactivity: 'analytical'
      }
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupVisualizerObservers();
    this.setupReactivitySystem();
    this.startChoreography();
    
    console.log('🎭 Choreographed Visualizer System initialized - Let the dance begin!');
  }

  setupEventListeners() {
    // Scroll choreography
    let scrollRAF = null;
    window.addEventListener('scroll', () => {
      if (scrollRAF) return;
      
      scrollRAF = requestAnimationFrame(() => {
        this.updateScrollChoreography();
        scrollRAF = null;
      });
    });

    // Mouse choreography
    let mouseRAF = null;
    document.addEventListener('mousemove', (e) => {
      if (mouseRAF) return;
      
      mouseRAF = requestAnimationFrame(() => {
        this.updateMouseChoreography(e);
        mouseRAF = null;
      });
    });

    // Focus choreography
    document.addEventListener('focusin', (e) => {
      this.updateFocusChoreography(e.target, 'focus');
    });

    document.addEventListener('focusout', (e) => {
      this.updateFocusChoreography(null, 'unfocus');
    });

    // Interaction energy tracking
    ['click', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.incrementUserEnergy();
      });
    });

    // Window visibility changes
    document.addEventListener('visibilitychange', () => {
      this.updateMoodBasedOnVisibility();
    });
  }

  setupVisualizerObservers() {
    // Enhanced intersection observer for scene transitions
    this.sceneObserver = new IntersectionObserver(
      (entries) => this.handleSceneTransitions(entries),
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px', // Only trigger when well into view
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      }
    );

    // Observe all sections
    document.querySelectorAll('section[data-scene]').forEach(section => {
      this.sceneObserver.observe(section);
    });

    // Find and register all visualizer iframes
    this.registerVisualizers();
  }

  registerVisualizers() {
    document.querySelectorAll('iframe[src*="vib34d-ultimate-viewer"]').forEach((iframe, index) => {
      const container = iframe.closest('[data-scene]') || iframe.closest('section');
      const sceneId = container?.dataset.scene || container?.id || `scene-${index}`;
      
      const visualizer = {
        iframe,
        container,
        sceneId,
        baseUrl: iframe.src.split('?')[0],
        currentParams: this.extractParamsFromUrl(iframe.src),
        targetParams: { ...this.scenes[sceneId]?.parameters || {} },
        isActive: false,
        animationFrame: null
      };

      this.visualizers.set(`${sceneId}-${index}`, visualizer);
      console.log(`🎨 Registered visualizer: ${sceneId}-${index}`);
    });
  }

  extractParamsFromUrl(url) {
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    return {
      system: urlParams.get('system') || 'polychora',
      geometry: parseInt(urlParams.get('geometry')) || 0,
      morphFactor: parseFloat(urlParams.get('morphFactor')) || 1.0,
      intensity: parseFloat(urlParams.get('intensity')) || 0.8,
      rotationSpeed: parseFloat(urlParams.get('rotationSpeed')) || 0.002,
      particleDensity: parseFloat(urlParams.get('particleDensity')) || 0.7
    };
  }

  setupReactivitySystem() {
    // Create reactive parameter mappings
    this.reactiveParams = {
      'cosmic': {
        // Hero section - responds to cosmic/universal interactions
        scrollInfluence: 0.8,
        mouseInfluence: 0.6,
        energyInfluence: 0.9,
        morphRange: [0.5, 2.0],
        intensityRange: [0.6, 1.0],
        speedRange: [0.001, 0.005]
      },
      'precision': {
        // Technology section - precise, controlled responses
        scrollInfluence: 0.4,
        mouseInfluence: 0.8,
        energyInfluence: 0.3,
        morphRange: [0.2, 0.8],
        intensityRange: [0.7, 1.0],
        speedRange: [0.0005, 0.002]
      },
      'creative': {
        // Portfolio section - creative, flowing responses
        scrollInfluence: 0.6,
        mouseInfluence: 0.9,
        energyInfluence: 0.7,
        morphRange: [1.0, 3.0],
        intensityRange: [0.5, 1.2],
        speedRange: [0.002, 0.008]
      },
      'analytical': {
        // Research section - deep, thoughtful responses
        scrollInfluence: 0.5,
        mouseInfluence: 0.4,
        energyInfluence: 0.5,
        morphRange: [1.5, 2.5],
        intensityRange: [0.8, 1.0],
        speedRange: [0.0008, 0.003]
      }
    };
  }

  startChoreography() {
    // Main choreography loop
    const choreographyLoop = () => {
      this.updateGlobalState();
      this.updateVisualizerParameters();
      this.updateComplementaryElements();
      
      requestAnimationFrame(choreographyLoop);
    };

    requestAnimationFrame(choreographyLoop);
  }

  updateScrollChoreography() {
    // Calculate scroll progress (0-1)
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.globalState.scrollProgress = Math.min(window.scrollY / scrollHeight, 1);

    // Update mood based on scroll behavior
    this.updateScrollMood();

    // Trigger section-specific scroll reactions
    this.triggerScrollReactions();
  }

  updateMouseChoreography(event) {
    // Normalize mouse position (-1 to 1)
    this.globalState.mousePosition = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: (event.clientY / window.innerHeight) * 2 - 1
    };

    // Create ripple effects
    this.createMouseRipples(event.clientX, event.clientY);
  }

  updateFocusChoreography(element, action) {
    this.globalState.focusedElement = element;
    
    if (action === 'focus' && element) {
      // Intensify visualizers related to focused element
      this.intensifyRelatedVisualizers(element);
      
      // Create focus aura effect
      this.createFocusAura(element);
    } else {
      // Return to base state
      this.normalizeAllVisualizers();
    }
  }

  handleSceneTransitions(entries) {
    entries.forEach(entry => {
      const sceneId = entry.target.dataset.scene || entry.target.id;
      const isEntering = entry.isIntersecting;
      const visibility = entry.intersectionRatio;

      if (isEntering && visibility > 0.5) {
        this.activateScene(sceneId, visibility);
      } else if (!isEntering || visibility < 0.1) {
        this.deactivateScene(sceneId);
      }

      // Smooth transition effects based on intersection ratio
      this.updateSceneTransition(sceneId, visibility);
    });
  }

  activateScene(sceneId, intensity = 1.0) {
    console.log(`🎬 Activating scene: ${sceneId} (intensity: ${intensity})`);
    
    this.activeScenes.set(sceneId, {
      intensity,
      activatedAt: Date.now(),
      dominance: intensity
    });

    // Update visualizers for this scene
    this.visualizers.forEach((visualizer, id) => {
      if (visualizer.sceneId === sceneId) {
        this.activateVisualizer(visualizer, intensity);
      }
    });

    // Trigger scene-specific effects
    this.triggerSceneEffects(sceneId, 'enter');
  }

  deactivateScene(sceneId) {
    if (this.activeScenes.has(sceneId)) {
      console.log(`🎭 Deactivating scene: ${sceneId}`);
      this.activeScenes.delete(sceneId);
      
      // Deactivate related visualizers
      this.visualizers.forEach((visualizer, id) => {
        if (visualizer.sceneId === sceneId) {
          this.deactivateVisualizer(visualizer);
        }
      });

      this.triggerSceneEffects(sceneId, 'exit');
    }
  }

  updateSceneTransition(sceneId, visibility) {
    // Smooth transition effects based on intersection ratio
    const scene = this.scenes[sceneId];
    if (!scene) return;

    // Update scene intensity based on visibility
    if (this.activeScenes.has(sceneId)) {
      const sceneData = this.activeScenes.get(sceneId);
      sceneData.intensity = visibility;
      this.activeScenes.set(sceneId, sceneData);
    }

    // Update related visualizers with transition intensity
    this.visualizers.forEach((visualizer, id) => {
      if (visualizer.sceneId === sceneId && visualizer.isActive) {
        const transitionParams = this.calculateReactiveParams(scene, visibility);
        
        // Smooth interpolation for transition parameters
        Object.entries(transitionParams).forEach(([key, targetValue]) => {
          if (visualizer.currentParams[key] !== undefined) {
            const currentValue = visualizer.currentParams[key];
            const lerpFactor = 0.1; // Smooth interpolation
            visualizer.currentParams[key] = currentValue + (targetValue - currentValue) * lerpFactor;
          }
        });
      }
    });
  }

  activateVisualizer(visualizer, intensity = 1.0) {
    visualizer.isActive = true;
    
    // Set target parameters based on scene and current state
    const scene = this.scenes[visualizer.sceneId];
    if (scene) {
      visualizer.targetParams = this.calculateReactiveParams(scene, intensity);
    }

    // Start parameter animation
    this.animateVisualizerParameters(visualizer);
  }

  deactivateVisualizer(visualizer) {
    visualizer.isActive = false;
    
    if (visualizer.animationFrame) {
      cancelAnimationFrame(visualizer.animationFrame);
      visualizer.animationFrame = null;
    }
  }

  calculateReactiveParams(scene, intensity = 1.0) {
    const reactivity = this.reactiveParams[scene.reactivity] || this.reactiveParams.cosmic;
    const base = scene.parameters;
    
    // Calculate influences
    const scrollInfluence = this.globalState.scrollProgress * reactivity.scrollInfluence;
    const mouseInfluence = Math.abs(this.globalState.mousePosition.x) * reactivity.mouseInfluence;
    const energyInfluence = Math.min(this.globalState.userEnergy / 100, 1) * reactivity.energyInfluence;
    
    // Combine influences
    const totalInfluence = (scrollInfluence + mouseInfluence + energyInfluence) * intensity;
    
    return {
      morphFactor: this.lerp(
        reactivity.morphRange[0], 
        reactivity.morphRange[1], 
        totalInfluence
      ),
      intensity: this.lerp(
        reactivity.intensityRange[0], 
        reactivity.intensityRange[1], 
        totalInfluence
      ),
      rotationSpeed: this.lerp(
        reactivity.speedRange[0], 
        reactivity.speedRange[1], 
        totalInfluence
      ),
      particleDensity: base.particleDensity * (0.5 + totalInfluence * 0.5)
    };
  }

  animateVisualizerParameters(visualizer) {
    if (!visualizer.isActive) return;

    const animateFrame = () => {
      // Smoothly interpolate current params toward target params
      const lerpSpeed = 0.05;
      let hasChanges = false;

      Object.keys(visualizer.targetParams).forEach(key => {
        if (key in visualizer.currentParams) {
          const current = visualizer.currentParams[key];
          const target = visualizer.targetParams[key];
          const newValue = this.lerp(current, target, lerpSpeed);
          
          if (Math.abs(newValue - current) > 0.001) {
            visualizer.currentParams[key] = newValue;
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        this.updateVisualizerUrl(visualizer);
      }

      if (visualizer.isActive) {
        visualizer.animationFrame = requestAnimationFrame(animateFrame);
      }
    };

    visualizer.animationFrame = requestAnimationFrame(animateFrame);
  }

  updateVisualizerUrl(visualizer) {
    const params = new URLSearchParams();
    
    // Add current parameters
    Object.entries(visualizer.currentParams).forEach(([key, value]) => {
      if (typeof value === 'number') {
        params.append(key, value.toFixed(3));
      } else {
        params.append(key, value);
      }
    });

    // Add mood-based parameters
    params.append('mood', this.globalState.currentMood);
    params.append('timeOfDay', this.globalState.timeOfDay);
    
    const newUrl = `${visualizer.baseUrl}?${params.toString()}`;
    
    // Only update if URL actually changed (prevents unnecessary reloads)
    if (visualizer.iframe.src !== newUrl) {
      visualizer.iframe.src = newUrl;
    }
  }

  // Complementary UI reactions
  updateComplementaryElements() {
    // Update background elements based on global state
    this.updateBackgroundElements();
    
    // Update navigation indicators
    this.updateNavigationIndicators();
    
    // Update ambient effects
    this.updateAmbientEffects();
  }

  updateBackgroundElements() {
    const body = document.body;
    const scrollProgress = this.globalState.scrollProgress;
    const mouseX = this.globalState.mousePosition.x;
    const mouseY = this.globalState.mousePosition.y;

    // Dynamic background gradient based on scroll and mouse
    const hue = (scrollProgress * 60 + (mouseX * 20) + 200) % 360;
    const saturation = 20 + (this.globalState.userEnergy / 100) * 30;
    const lightness = 8 + Math.abs(mouseY) * 3;

    body.style.setProperty(
      '--dynamic-bg', 
      `hsl(${hue}, ${saturation}%, ${lightness}%)`
    );
  }

  updateNavigationIndicators() {
    // Update nav dots or progress indicators
    const indicators = document.querySelectorAll('.scene-indicator');
    indicators.forEach((indicator, index) => {
      const sceneId = indicator.dataset.scene;
      const scene = this.activeScenes.get(sceneId);
      
      if (scene) {
        indicator.style.opacity = scene.intensity;
        indicator.style.transform = `scale(${1 + scene.intensity * 0.5})`;
      } else {
        indicator.style.opacity = 0.3;
        indicator.style.transform = 'scale(1)';
      }
    });
  }

  updateAmbientEffects() {
    // Create floating particles or ambient elements that react to the global state
    this.createAmbientParticles();
    
    // Update cursor trail effects
    this.updateCursorTrail();
    
    // Update ambient audio cues (if implemented)
    this.updateAmbientAudio();
  }

  // Utility functions
  lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'day';
    return 'evening';
  }

  incrementUserEnergy() {
    this.globalState.userEnergy = Math.min(this.globalState.userEnergy + 1, 100);
    
    // Decay energy over time
    setTimeout(() => {
      this.globalState.userEnergy = Math.max(this.globalState.userEnergy - 0.5, 0);
    }, 1000);
  }

  updateScrollMood() {
    const scrollSpeed = Math.abs(this.globalState.scrollProgress - this.lastScrollProgress || 0);
    this.lastScrollProgress = this.globalState.scrollProgress;

    if (scrollSpeed > 0.01) {
      this.globalState.currentMood = 'exploration';
    } else if (this.globalState.focusedElement) {
      this.globalState.currentMood = 'focus';
    } else if (this.globalState.userEnergy > 50) {
      this.globalState.currentMood = 'creation';
    } else {
      this.globalState.currentMood = 'reflection';
    }
  }

  // Placeholder functions for advanced effects
  createMouseRipples(x, y) {
    // Create ripple effect at mouse position
  }

  createFocusAura(element) {
    // Create aura effect around focused element
  }

  intensifyRelatedVisualizers(element) {
    // Find and intensify visualizers related to the focused element
  }

  normalizeAllVisualizers() {
    // Return all visualizers to their base state
  }

  triggerSceneEffects(sceneId, action) {
    // Trigger entrance/exit effects for scene transitions
  }

  triggerScrollReactions() {
    // Trigger reactions based on scroll position
  }

  updateMoodBasedOnVisibility() {
    // Update mood when window becomes visible/hidden
  }

  updateGlobalState() {
    // Update any time-based global state changes
  }

  updateVisualizerParameters() {
    // Update parameters for all active visualizers
  }

  createAmbientParticles() {
    // Create ambient particle effects
  }

  updateCursorTrail() {
    // Update cursor trail effects
  }

  updateAmbientAudio() {
    // Update ambient audio (if implemented)
  }

  // Public API
  setMood(mood) {
    this.globalState.currentMood = mood;
  }

  getMood() {
    return this.globalState.currentMood;
  }

  getGlobalState() {
    return { ...this.globalState };
  }

  destroy() {
    // Cleanup all observers and animations
    if (this.sceneObserver) {
      this.sceneObserver.disconnect();
    }

    this.visualizers.forEach(visualizer => {
      if (visualizer.animationFrame) {
        cancelAnimationFrame(visualizer.animationFrame);
      }
    });

    console.log('🎭 Choreographed Visualizer System destroyed');
  }
}

// Initialize choreographed system
let choreographedSystem = null;

document.addEventListener('DOMContentLoaded', () => {
  choreographedSystem = new ChoreographedVisualizerSystem();
  
  // Global access for debugging
  window.choreographedSystem = choreographedSystem;
  window.ChoreographedVisualizerSystem = ChoreographedVisualizerSystem;
});

// Export for other modules
window.ChoreographedVisualizerSystem = ChoreographedVisualizerSystem;
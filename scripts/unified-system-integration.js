/**
 * UNIFIED SYSTEM INTEGRATION
 * Connects the Unified Scroll Master Controller with existing card and visualizer systems
 * Creates seamless integration for fluid dynamic scroll-driven visuals
 */

class UnifiedSystemIntegration {
  constructor() {
    this.scrollController = null;
    this.cardSystems = new Map();
    this.visualizers = new Map();
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    await this.waitForDOMReady();
    await this.waitForSystems();
    
    this.setupScrollController();
    this.connectCardSystems();
    this.setupEventListeners();
    this.startIntegration();
    
    this.isInitialized = true;
    console.log('🌊 Unified System Integration: ACTIVE');
  }

  waitForDOMReady() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  waitForSystems() {
    return new Promise(resolve => {
      const checkSystems = () => {
        if (window.UnifiedScrollMasterController && 
            window.CardSpecificVib34dVisualizer && 
            window.AdvancedScrollMorphSystem) {
          resolve();
        } else {
          setTimeout(checkSystems, 100);
        }
      };
      checkSystems();
    });
  }

  setupScrollController() {
    // Initialize the Unified Scroll Master Controller
    this.scrollController = new window.UnifiedScrollMasterController();
    
    // Connect to existing systems
    this.connectScrollEvents();
  }

  connectScrollEvents() {
    // Listen for scroll controller updates
    document.addEventListener('unifiedScrollUpdate', (event) => {
      const { scrollState, fluidDynamics, sceneData } = event.detail;
      
      this.updateCardTransformations(scrollState);
      this.updateVisualizerGeometries(scrollState);
      this.updateFluidBackground(fluidDynamics);
      this.handleSceneTransitions(sceneData);
    });
  }

  updateCardTransformations(scrollState) {
    const cards = document.querySelectorAll('.morph-card, .tech-card');
    
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate card's position relative to viewport
      const cardCenter = cardRect.top + cardRect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
      const maxDistance = viewportHeight;
      
      // Normalize distance (0 = center, 1 = edge)
      const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
      const focusIntensity = 1 - normalizedDistance;
      
      // Apply massive scale transformations based on scroll
      const baseScale = 0.6 + (focusIntensity * 0.8);
      const scrollScale = 1 + (Math.abs(scrollState.velocity) * 0.001);
      const finalScale = baseScale * scrollScale;
      
      // Cinematic rotation based on scroll velocity and position
      const rotationX = (scrollState.velocity * 0.02) + (normalizedDistance * 15);
      const rotationY = (scrollState.direction * 10) + (index * 3);
      const rotationZ = scrollState.acceleration * 0.1;
      
      // Depth transformation for 3D layering
      const zTranslation = (focusIntensity * 200) - 100;
      
      // Apply transformations
      card.style.transform = `
        perspective(1200px)
        translateZ(${zTranslation}px)
        translateY(${(1 - focusIntensity) * 50}px)
        rotateX(${rotationX}deg)
        rotateY(${rotationY}deg)
        rotateZ(${rotationZ}deg)
        scale(${finalScale})
      `;
      
      // Opacity and filter effects
      card.style.opacity = 0.3 + (focusIntensity * 0.7);
      card.style.filter = `
        blur(${(1 - focusIntensity) * 3}px)
        brightness(${0.7 + (focusIntensity * 0.5)})
        saturate(${0.5 + (focusIntensity * 1)})
      `;
      
      // Update CSS custom properties for visualizers
      card.style.setProperty('--scroll-progress', scrollState.normalized);
      card.style.setProperty('--focus-intensity', focusIntensity);
      card.style.setProperty('--scroll-velocity', scrollState.velocity);
    });
  }

  updateVisualizerGeometries(scrollState) {
    // Find active visualizer canvases
    const canvases = document.querySelectorAll('canvas[data-system], .hero-visualizer, .portfolio-canvas');
    
    canvases.forEach((canvas, index) => {
      if (canvas.visualizer && typeof canvas.visualizer.updateFromScroll === 'function') {
        // Continuous geometry morphing based on scroll
        const geometryProgress = (scrollState.normalized * 8 + index * 0.5) % 8;
        const targetGeometry = Math.floor(geometryProgress);
        const morphFactor = geometryProgress - targetGeometry;
        
        canvas.visualizer.updateFromScroll({
          geometry: targetGeometry,
          morphFactor: morphFactor,
          intensity: Math.abs(scrollState.velocity) * 0.01,
          chaos: scrollState.acceleration * 0.001,
          speed: 1 + (Math.abs(scrollState.velocity) * 0.002),
          hue: (scrollState.normalized * 360) % 360
        });
      }
    });
  }

  updateFluidBackground(fluidDynamics) {
    const fluidBg = document.getElementById('fluid-background');
    if (fluidBg) {
      fluidBg.style.setProperty('--fluid-wave-amplitude', fluidDynamics.waveAmplitude);
      fluidBg.style.setProperty('--fluid-turbulence', fluidDynamics.turbulence);
      
      // Dynamic background color shifts
      const hue = (fluidDynamics.waveAmplitude * 180) % 360;
      const saturation = 50 + (fluidDynamics.turbulence * 30);
      const lightness = 20 + (fluidDynamics.waveAmplitude * 15);
      
      document.documentElement.style.setProperty('--dynamic-bg-color', 
        `hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
  }

  handleSceneTransitions(sceneData) {
    const { activeScene, transitionProgress, direction } = sceneData;
    
    // Update section-specific themes and visualizers
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section, index) => {
      const isActive = section.dataset.scene === activeScene;
      
      if (isActive) {
        section.classList.add('scene-active');
        section.style.setProperty('--scene-progress', transitionProgress);
        
        // Trigger section-specific visual effects
        this.activateSectionVisuals(section, transitionProgress);
      } else {
        section.classList.remove('scene-active');
      }
    });
  }

  activateSectionVisuals(section, progress) {
    const theme = section.dataset.theme;
    const visualizerSystem = section.dataset.visualizerSystem;
    
    // Theme-specific color and effect updates
    switch (theme) {
      case 'polychora':
        document.documentElement.style.setProperty('--primary-hue', '200');
        break;
      case 'quantum':
        document.documentElement.style.setProperty('--primary-hue', '280');
        break;
      case 'holographic':
        document.documentElement.style.setProperty('--primary-hue', '320');
        break;
      case 'faceted':
        document.documentElement.style.setProperty('--primary-hue', '160');
        break;
    }
  }

  connectCardSystems() {
    // Connect with existing card-specific visualizer system
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
      const system = card.dataset.system;
      if (system && window.CardSpecificVib34dVisualizer) {
        // Initialize card-specific visualizer if not already done
        if (!card.visualizerInitialized) {
          const visualizer = new window.CardSpecificVib34dVisualizer(card, {
            system: system,
            scrollDriven: true,
            fluidDynamics: true
          });
          
          this.visualizers.set(card.id, visualizer);
          card.visualizerInitialized = true;
        }
      }
    });
  }

  setupEventListeners() {
    // Performance monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updatePerformance = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        document.getElementById('fps-counter')?.textContent = `${fps}`;
        document.getElementById('monitor-fps')?.textContent = `${fps}`;
        
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updatePerformance);
    };
    
    updatePerformance();
  }

  startIntegration() {
    // Begin the unified scroll system
    document.body.classList.add('unified-scroll-active');
    
    // Trigger initial state
    window.dispatchEvent(new Event('scroll'));
    
    console.log('🚀 Unified System Integration: All systems connected and operational');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.unifiedIntegration = new UnifiedSystemIntegration();
  });
} else {
  window.unifiedIntegration = new UnifiedSystemIntegration();
}

// Export for global access
window.UnifiedSystemIntegration = UnifiedSystemIntegration;
/**
 * ULTIMATE SCROLL ORCHESTRATOR
 * The BOOM BOBASTIC system that makes everything work smoothly
 * No more half-assed implementations - this coordinates ALL effects properly
 */

class UltimateScrollOrchestrator {
  constructor() {
    this.isActive = false;
    this.isInitialized = false;
    
    // Smooth state management with proper easing
    this.scrollState = {
      raw: 0,
      smooth: 0,
      velocity: 0,
      acceleration: 0,
      direction: 0,
      progress: 0, // 0-1 for entire page
      sectionProgress: new Map() // per-section progress
    };
    
    // Performance management - NO MORE LAG
    this.performance = {
      lastUpdate: 0,
      frameCount: 0,
      targetFPS: 60,
      updateInterval: 1000 / 60, // 60fps max
      rafId: null
    };
    
    // Smooth animation values with proper bounds
    this.animatedValues = {
      sectionEnergy: new Map(),
      scrollProgress: 0,
      navEnergy: 0,
      userEnergy: 0
    };
    
    // Element registry for organized management
    this.elements = {
      sections: new Map(),
      cards: new Map(),
      nav: null,
      body: null
    };
    
    // Smoothing configuration - PREVENTS JITTER
    this.smoothing = {
      scrollSmooth: 0.08,    // Smooth scroll following
      energySmooth: 0.12,    // Section energy smoothing  
      transformSmooth: 0.15,  // Transform smoothing
      navSmooth: 0.1         // Navigation smoothing
    };
    
    this.init();
  }
  
  init() {
    this.discoverElements();
    this.setupMasterScrollListener();
    this.setupIntersectionObservers();
    this.setupPerformanceOptimization();
    this.startAnimationLoop();
    
    this.isInitialized = true;
    console.log('🚀 ULTIMATE SCROLL ORCHESTRATOR - BOOM BOBASTIC MODE ACTIVE');
  }
  
  discoverElements() {
    // Register all major elements for coordinated control
    this.elements.body = document.body;
    this.elements.nav = document.querySelector('.nav-container');
    
    // Register all sections with their specific roles
    document.querySelectorAll('section').forEach((section, index) => {
      const sectionData = {
        element: section,
        index: index,
        id: section.id || `section-${index}`,
        theme: section.dataset.theme || 'default',
        role: this.getSectionRole(section),
        energy: 0,
        targetEnergy: 0,
        isVisible: false,
        visibilityRatio: 0
      };
      
      this.elements.sections.set(sectionData.id, sectionData);
      this.animatedValues.sectionEnergy.set(sectionData.id, 0);
    });
    
    // Register morphing cards
    document.querySelectorAll('.tech-card, .portfolio-item, .morph-card').forEach((card, index) => {
      const cardData = {
        element: card,
        index: index,
        id: card.id || `card-${index}`,
        system: card.dataset.system || 'default',
        energy: 0,
        targetEnergy: 0,
        scale: 1,
        targetScale: 1,
        rotation: { x: 0, y: 0, z: 0 },
        targetRotation: { x: 0, y: 0, z: 0 }
      };
      
      this.elements.cards.set(cardData.id, cardData);
    });
    
    console.log(`🎯 Discovered ${this.elements.sections.size} sections and ${this.elements.cards.size} cards`);
  }
  
  getSectionRole(section) {
    if (section.id === 'hero') return 'hero';
    if (section.id === 'technology') return 'showcase'; 
    if (section.id === 'portfolio') return 'gallery';
    if (section.id === 'research') return 'content';
    return 'standard';
  }
  
  setupMasterScrollListener() {
    let lastScrollTime = 0;
    let scrollHistory = [];
    const maxHistory = 10;
    
    // MASTER SCROLL EVENT - Coordinates everything
    const handleScroll = () => {
      const now = performance.now();
      const currentScroll = window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Update raw values
      this.scrollState.raw = currentScroll;
      this.scrollState.progress = Math.max(0, Math.min(1, currentScroll / maxScroll));
      
      // Calculate velocity with proper smoothing
      const timeDelta = now - lastScrollTime;
      if (timeDelta > 0) {
        const rawVelocity = (currentScroll - (scrollHistory[scrollHistory.length - 1] || currentScroll)) / timeDelta;
        
        // Smooth velocity to prevent jitter
        this.scrollState.velocity = this.lerp(this.scrollState.velocity, rawVelocity, 0.3);
        this.scrollState.acceleration = this.lerp(this.scrollState.acceleration, Math.abs(rawVelocity), 0.2);
        this.scrollState.direction = Math.sign(this.scrollState.velocity);
      }
      
      // Maintain scroll history for smooth calculations
      scrollHistory.push(currentScroll);
      if (scrollHistory.length > maxHistory) {
        scrollHistory.shift();
      }
      
      lastScrollTime = now;
      
      // Update global animated values with proper bounds and smoothing
      this.updateAnimatedValues();
    };
    
    // Throttled scroll listener - PREVENTS PERFORMANCE ISSUES
    let scrollRAF = null;
    window.addEventListener('scroll', () => {
      if (scrollRAF) return;
      
      scrollRAF = requestAnimationFrame(() => {
        handleScroll();
        scrollRAF = null;
      });
    }, { passive: true });
  }
  
  updateAnimatedValues() {
    // Smooth scroll progress for CSS
    this.animatedValues.scrollProgress = this.lerp(
      this.animatedValues.scrollProgress,
      this.scrollState.progress,
      this.smoothing.scrollSmooth
    );
    
    // Smooth navigation energy based on scroll and velocity
    const targetNavEnergy = Math.min(1, this.scrollState.progress * 0.8 + Math.abs(this.scrollState.velocity) * 0.002);
    this.animatedValues.navEnergy = this.lerp(
      this.animatedValues.navEnergy,
      targetNavEnergy,
      this.smoothing.navSmooth
    );
    
    // Update user energy based on scroll activity
    const scrollActivity = Math.min(1, Math.abs(this.scrollState.velocity) * 0.01);
    this.animatedValues.userEnergy = this.lerp(
      this.animatedValues.userEnergy,
      scrollActivity,
      0.05
    );
  }
  
  setupIntersectionObservers() {
    // Section visibility observer - DRIVES SECTION ENERGY
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id;
        const sectionData = this.elements.sections.get(sectionId);
        
        if (sectionData) {
          sectionData.isVisible = entry.isIntersecting;
          sectionData.visibilityRatio = entry.intersectionRatio;
          
          // Calculate target energy based on visibility and role
          let targetEnergy = entry.intersectionRatio;
          
          // Role-specific energy modifiers
          switch (sectionData.role) {
            case 'hero':
              targetEnergy *= 1.2; // Hero gets more energy
              break;
            case 'showcase':
              targetEnergy *= 1.5; // Technology showcase is most energetic
              break;
            case 'gallery':
              targetEnergy *= 1.1; // Portfolio gets slight boost
              break;
          }
          
          sectionData.targetEnergy = Math.min(1, targetEnergy);
        }
      });
    }, {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20), // 0 to 1 in 0.05 steps
      rootMargin: '-10% 0px -10% 0px'
    });
    
    // Card visibility observer - DRIVES CARD TRANSFORMS
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const cardId = entry.target.id;
        const cardData = this.elements.cards.get(cardId);
        
        if (cardData) {
          const ratio = entry.intersectionRatio;
          const bounds = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          
          // Calculate card position relative to viewport center
          const cardCenter = bounds.top + bounds.height / 2;
          const viewportCenter = viewportHeight / 2;
          const distanceFromCenter = Math.abs(cardCenter - viewportCenter);
          const maxDistance = viewportHeight;
          const centerProximity = 1 - Math.min(1, distanceFromCenter / maxDistance);
          
          // Target energy combines visibility and center proximity
          cardData.targetEnergy = ratio * centerProximity;
          
          // Target scale based on energy and scroll velocity
          const velocityFactor = 1 + Math.min(0.1, Math.abs(this.scrollState.velocity) * 0.0001);
          cardData.targetScale = 0.95 + (cardData.targetEnergy * 0.15 * velocityFactor);
          
          // Subtle rotation based on position and velocity - CONTROLLED AMOUNTS
          const scrollInfluence = Math.max(-5, Math.min(5, this.scrollState.velocity * 0.01));
          cardData.targetRotation.x = scrollInfluence * 0.5;
          cardData.targetRotation.y = (cardCenter - viewportCenter) * 0.002;
          cardData.targetRotation.z = scrollInfluence * 0.1;
        }
      });
    }, {
      threshold: Array.from({ length: 11 }, (_, i) => i / 10),
      rootMargin: '20% 0px 20% 0px'
    });
    
    // Register observers
    this.elements.sections.forEach(data => sectionObserver.observe(data.element));
    this.elements.cards.forEach(data => cardObserver.observe(data.element));
  }
  
  setupPerformanceOptimization() {
    // Monitor performance and adjust quality automatically
    let frameTimeHistory = [];
    const maxFrameHistory = 30;
    
    const checkPerformance = () => {
      const now = performance.now();
      const frameTime = now - this.performance.lastUpdate;
      
      frameTimeHistory.push(frameTime);
      if (frameTimeHistory.length > maxFrameHistory) {
        frameTimeHistory.shift();
      }
      
      // Calculate average frame time
      const avgFrameTime = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length;
      const fps = 1000 / avgFrameTime;
      
      // Auto-adjust smoothing based on performance
      if (fps < 45) {
        // Reduce smoothing precision for better performance
        this.smoothing.scrollSmooth = Math.min(0.2, this.smoothing.scrollSmooth * 1.1);
        this.smoothing.energySmooth = Math.min(0.25, this.smoothing.energySmooth * 1.1);
      } else if (fps > 55) {
        // Increase smoothing precision for better quality
        this.smoothing.scrollSmooth = Math.max(0.05, this.smoothing.scrollSmooth * 0.95);
        this.smoothing.energySmooth = Math.max(0.08, this.smoothing.energySmooth * 0.95);
      }
      
      this.performance.lastUpdate = now;
    };
    
    // Check performance every 2 seconds
    setInterval(checkPerformance, 2000);
  }
  
  startAnimationLoop() {
    const animate = () => {
      if (!this.isActive) {
        this.performance.rafId = requestAnimationFrame(animate);
        return;
      }
      
      const now = performance.now();
      const deltaTime = now - this.performance.lastUpdate;
      
      // Only update if enough time has passed (60fps max)
      if (deltaTime >= this.performance.updateInterval) {
        this.updateSectionEnergies();
        this.updateCardTransforms(); 
        this.updateNavigationEffects();
        this.applyCSSProperties();
        
        this.performance.frameCount++;
        this.performance.lastUpdate = now;
      }
      
      this.performance.rafId = requestAnimationFrame(animate);
    };
    
    this.isActive = true;
    animate();
  }
  
  updateSectionEnergies() {
    // Smooth all section energies to their targets
    this.elements.sections.forEach((sectionData, sectionId) => {
      sectionData.energy = this.lerp(
        sectionData.energy,
        sectionData.targetEnergy,
        this.smoothing.energySmooth
      );
      
      // Update animated values map
      this.animatedValues.sectionEnergy.set(sectionId, sectionData.energy);
    });
  }
  
  updateCardTransforms() {
    // Smooth all card transforms
    this.elements.cards.forEach(cardData => {
      // Smooth energy
      cardData.energy = this.lerp(cardData.energy, cardData.targetEnergy, this.smoothing.transformSmooth);
      
      // Smooth scale
      cardData.scale = this.lerp(cardData.scale, cardData.targetScale, this.smoothing.transformSmooth);
      
      // Smooth rotations
      cardData.rotation.x = this.lerp(cardData.rotation.x, cardData.targetRotation.x, this.smoothing.transformSmooth);
      cardData.rotation.y = this.lerp(cardData.rotation.y, cardData.targetRotation.y, this.smoothing.transformSmooth);
      cardData.rotation.z = this.lerp(cardData.rotation.z, cardData.targetRotation.z, this.smoothing.transformSmooth);
      
      // Apply transforms - CONTROLLED AND SMOOTH
      cardData.element.style.transform = `
        perspective(1200px)
        scale(${cardData.scale})
        rotateX(${cardData.rotation.x}deg)
        rotateY(${cardData.rotation.y}deg)
        rotateZ(${cardData.rotation.z}deg)
      `;
      
      // Apply opacity and filters
      cardData.element.style.opacity = 0.7 + (cardData.energy * 0.3);
      cardData.element.style.filter = `brightness(${0.8 + cardData.energy * 0.4})`;
    });
  }
  
  updateNavigationEffects() {
    if (!this.elements.nav) return;
    
    // Subtle navigation movement - MUCH MORE CONTROLLED
    const navMovement = Math.max(-2, Math.min(2, this.animatedValues.scrollProgress * -2));
    
    this.elements.nav.style.transform = `translateY(${navMovement}px)`;
  }
  
  applyCSSProperties() {
    // Apply global CSS custom properties - BOUNDED VALUES
    const root = document.documentElement;
    
    // Bounded scroll progress
    root.style.setProperty('--scroll-progress', this.animatedValues.scrollProgress.toFixed(3));
    
    // Bounded navigation energy
    root.style.setProperty('--nav-energy', this.animatedValues.navEnergy.toFixed(3));
    
    // Bounded user energy
    root.style.setProperty('--user-energy', this.animatedValues.userEnergy.toFixed(3));
    
    // Section energies - individual and bounded
    this.animatedValues.sectionEnergy.forEach((energy, sectionId) => {
      const section = this.elements.sections.get(sectionId);
      if (section) {
        // Apply section-specific energy with CONTROLLED movement
        const sectionMovement = Math.max(-3, Math.min(3, energy * -3));
        section.element.style.setProperty('--section-energy', energy.toFixed(3));
        
        // Apply SUBTLE transform directly - NO MORE JITTER
        section.element.style.transform = `translateY(${sectionMovement}px)`;
      }
    });
  }
  
  // Utility function for smooth interpolation
  lerp(current, target, factor) {
    return current + (target - current) * factor;
  }
  
  // Control methods
  activate() {
    this.isActive = true;
    console.log('🔥 Ultimate Scroll Orchestrator ACTIVATED');
  }
  
  deactivate() {
    this.isActive = false;
    console.log('⏸️ Ultimate Scroll Orchestrator DEACTIVATED');
  }
  
  destroy() {
    this.isActive = false;
    if (this.performance.rafId) {
      cancelAnimationFrame(this.performance.rafId);
    }
    console.log('💥 Ultimate Scroll Orchestrator DESTROYED');
  }
}

// Initialize the BOOM BOBASTIC system
window.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure all other systems are loaded
  setTimeout(() => {
    window.ultimateScrollOrchestrator = new UltimateScrollOrchestrator();
  }, 1000);
});

console.log('🚀 ULTIMATE SCROLL ORCHESTRATOR - Loading BOOM BOBASTIC System...');
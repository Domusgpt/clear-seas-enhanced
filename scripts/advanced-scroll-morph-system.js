/*
 * Advanced Scroll Morph System - 2025 Parallax Design
 * Ultra-sophisticated scroll-driven geometry morphing with viewport lifecycle
 * Implements inverse complementary visual effects and depth-based card movement
 */

class AdvancedScrollMorphSystem {
  constructor() {
    this.cards = new Map();
    this.scrollData = {
      position: 0,
      velocity: 0,
      direction: 0,
      lastPosition: 0,
      smoothPosition: 0,
      normalizedPosition: 0
    };
    
    this.viewportData = {
      height: window.innerHeight,
      width: window.innerWidth,
      center: window.innerHeight / 2,
      activationZone: 0.2, // 20% from edges
      destructionZone: 0.1 // 10% from edges
    };
    
    this.geometrySequence = [
      0, // Hypercube
      1, // Tetrahedron  
      2, // Sphere
      3, // Torus
      4, // Wave
      5, // Crystal
      6, // Spiral
      7  // Fractal
    ];
    
    this.inverseEffects = {
      focusedCard: null,
      backgroundIntensity: 1.0,
      inverseStrength: 0
    };
    
    this.parallaxLayers = [];
    this.activeVisualizers = new Map();
    this.canvasPool = [];
    this.maxActiveCanvases = 6;
    
    this.init();
  }
  
  init() {
    console.log('🚀 Advanced Scroll Morph System initializing...');
    
    // Setup smooth scroll with momentum
    this.setupSmoothScroll();
    
    // Initialize intersection observers
    this.setupIntersectionObservers();
    
    // Setup scroll listeners
    this.setupScrollListeners();
    
    // Setup touch interactions
    this.setupTouchInteractions();
    
    // Initialize all cards
    this.initializeCards();
    
    // Start animation loop
    this.startAnimationLoop();
    
    console.log('✨ Advanced Scroll Morph System ready');
  }
  
  setupSmoothScroll() {
    // Implement smooth scroll with inertia
    let scrollTimeout;
    let lastScrollTime = Date.now();
    
    const smoothScroll = () => {
      const now = Date.now();
      const timeDelta = now - lastScrollTime;
      lastScrollTime = now;
      
      // Calculate velocity
      const currentPosition = window.pageYOffset;
      this.scrollData.velocity = (currentPosition - this.scrollData.lastPosition) / timeDelta * 100;
      this.scrollData.direction = Math.sign(this.scrollData.velocity);
      this.scrollData.lastPosition = currentPosition;
      
      // Smooth position with easing
      const targetPosition = currentPosition;
      this.scrollData.smoothPosition += (targetPosition - this.scrollData.smoothPosition) * 0.1;
      
      // Normalize scroll position (0-1)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollData.normalizedPosition = this.scrollData.smoothPosition / maxScroll;
      
      this.scrollData.position = currentPosition;
      
      // Update all card morphing based on scroll
      this.updateCardMorphing();
      
      // Clear and reset timeout
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.scrollData.velocity = 0;
      }, 150);
    };
    
    window.addEventListener('scroll', smoothScroll, { passive: true });
    window.addEventListener('resize', () => {
      this.viewportData.height = window.innerHeight;
      this.viewportData.width = window.innerWidth;
      this.viewportData.center = window.innerHeight / 2;
    });
  }
  
  setupIntersectionObservers() {
    // Observer for canvas creation (bottom of viewport)
    this.creationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          this.createCardVisualizer(entry.target);
        }
      });
    }, {
      rootMargin: '20% 0px 20% 0px',
      threshold: [0.1, 0.25, 0.5, 0.75, 1.0]
    });
    
    // Observer for canvas destruction (top of viewport)
    this.destructionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          this.destroyCardVisualizer(entry.target);
        }
      });
    }, {
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0
    });
    
    // Observer for parallax depth effects
    this.parallaxObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const card = entry.target;
        const cardData = this.cards.get(card.id);
        if (cardData) {
          cardData.intersectionRatio = entry.intersectionRatio;
          cardData.isVisible = entry.isIntersecting;
          this.updateCardParallax(card, entry);
        }
      });
    }, {
      threshold: Array.from({ length: 101 }, (_, i) => i / 100)
    });
  }
  
  setupScrollListeners() {
    // Master scroll listener for coordinated morphing
    let scrollRAF = null;
    
    window.addEventListener('scroll', () => {
      if (scrollRAF) return;
      
      scrollRAF = requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const normalizedScroll = Math.max(0, Math.min(1, scrollTop / scrollHeight));
        
        // Update all visible cards
        this.cards.forEach((cardData, cardId) => {
          if (cardData.isVisible) {
            this.updateCardMorphing(cardData, normalizedScroll);
          }
        });
        
        scrollRAF = null;
      });
    });
    
    console.log('📜 Scroll listeners established');
  }
  
  initializeCards() {
    // Find all cards
    const techCards = document.querySelectorAll('.tech-card');
    const portfolioCards = document.querySelectorAll('.portfolio-item');
    const paperCards = document.querySelectorAll('.paper-card');
    
    const allCards = [...techCards, ...portfolioCards, ...paperCards];
    
    allCards.forEach((card, index) => {
      // Generate unique ID if needed
      if (!card.id) {
        card.id = `card-${card.className.split(' ')[0]}-${index}`;
      }
      
      const cardData = {
        element: card,
        index: index,
        visualizers: new Map(),
        geometryIndex: index % this.geometrySequence.length,
        scrollProgress: 0,
        depthOffset: (index % 3) * 0.3, // Stagger depth
        parallaxSpeed: 0.5 + (index % 5) * 0.1, // Vary parallax speed
        isVisible: false,
        intersectionRatio: 0,
        morphState: {
          currentGeometry: 0,
          targetGeometry: 0,
          transition: 0
        },
        inverseState: {
          isFocused: false,
          focusIntensity: 0,
          inverseColor: { r: 0, g: 1, b: 1 }
        }
      };
      
      this.cards.set(card.id, cardData);
      
      // Observe card for all effects
      this.creationObserver.observe(card);
      this.destructionObserver.observe(card);
      this.parallaxObserver.observe(card);
      
      // Setup card-specific interactions
      this.setupCardInteractions(card, cardData);
    });
    
    console.log(`📊 Initialized ${this.cards.size} cards for morphing`);
  }
  
  updateCardMorphing() {
    const scrollProgress = this.scrollData.normalizedPosition;
    const scrollVelocity = Math.abs(this.scrollData.velocity);
    
    this.cards.forEach((cardData, cardId) => {
      const card = cardData.element;
      const rect = card.getBoundingClientRect();
      
      // Calculate card's position relative to viewport center
      const cardCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(cardCenter - this.viewportData.center);
      const normalizedDistance = distanceFromCenter / this.viewportData.center;
      
      // Update card scroll progress
      cardData.scrollProgress = 1 - normalizedDistance;
      
      // Morph geometry based on scroll position
      const geometryProgress = (scrollProgress * 8 + cardData.index * 0.5) % 8;
      const targetGeometry = Math.floor(geometryProgress);
      const morphTransition = geometryProgress - targetGeometry;
      
      cardData.morphState.targetGeometry = targetGeometry;
      cardData.morphState.transition = morphTransition;
      
      // Update visualizers if they exist
      if (cardData.visualizers.size > 0) {
        this.updateVisualizerMorphing(cardData, scrollVelocity);
      }
      
      // Apply parallax depth movement
      this.applyParallaxDepth(card, cardData, normalizedDistance);
      
      // Apply inverse effects if focused
      if (cardData.inverseState.isFocused) {
        this.applyInverseEffects(cardData);
      }
    });
  }
  
  updateVisualizerMorphing(cardData, scrollVelocity) {
    cardData.visualizers.forEach((visualizer, role) => {
      if (visualizer && visualizer.gl) {
        // Smooth geometry morphing
        const currentGeometry = cardData.morphState.targetGeometry;
        const nextGeometry = (currentGeometry + 1) % 8;
        const transition = cardData.morphState.transition;
        
        // Interpolate between geometries
        visualizer.currentGeometry = currentGeometry + transition;
        
        // Adjust density based on scroll velocity
        const densityMultiplier = 1 + scrollVelocity * 0.01;
        visualizer.instanceParams.densityMult = densityMultiplier;
        
        // Color shift based on scroll progress
        const hueShift = cardData.scrollProgress * 360;
        visualizer.instanceParams.colorShift = hueShift;
        
        // Intensity based on visibility
        visualizer.roleParams.intensity = cardData.scrollProgress * cardData.intersectionRatio;
      }
    });
  }
  
  applyParallaxDepth(card, cardData, normalizedDistance) {
    // Calculate Z-axis movement based on scroll
    const depthZ = (1 - normalizedDistance) * 100 * cardData.depthOffset;
    const scaleEffect = 1 + (1 - normalizedDistance) * 0.1;
    
    // Apply velocity-based rotation
    const rotationY = this.scrollData.velocity * 0.1 * cardData.parallaxSpeed;
    const rotationX = normalizedDistance * 5 * this.scrollData.direction;
    
    // Transform card with parallax depth
    card.style.transform = `
      perspective(1200px)
      translateZ(${depthZ}px)
      translateY(${normalizedDistance * 20 * cardData.parallaxSpeed}px)
      rotateY(${rotationY}deg)
      rotateX(${rotationX}deg)
      scale(${scaleEffect})
    `;
    
    // Adjust opacity based on distance
    const opacity = 0.6 + cardData.scrollProgress * 0.4;
    card.style.opacity = opacity;
    
    // Add motion blur for fast scrolling
    if (Math.abs(this.scrollData.velocity) > 50) {
      card.style.filter = `blur(${Math.abs(this.scrollData.velocity) * 0.01}px)`;
    } else {
      card.style.filter = 'none';
    }
  }
  
  createCardVisualizer(cardElement) {
    const cardData = this.cards.get(cardElement.id);
    if (!cardData || cardData.visualizers.size > 0) return;
    
    // Check canvas limit
    if (this.activeVisualizers.size >= this.maxActiveCanvases) {
      console.log('🔥 Canvas limit reached, recycling oldest');
      this.recycleOldestVisualizer();
    }
    
    // Create multi-layer visualizers
    const roles = ['content', 'highlight'];
    roles.forEach(role => {
      const canvas = this.getOrCreateCanvas(`${cardElement.id}-canvas-${role}`);
      cardElement.appendChild(canvas);
      
      // Create visualizer with current morph state
      if (window.CardSpecificVIB34DVisualizer) {
        const visualizer = new window.CardSpecificVIB34DVisualizer(
          canvas.id, 
          role, 
          cardElement
        );
        
        if (visualizer.gl) {
          cardData.visualizers.set(role, visualizer);
          this.activeVisualizers.set(canvas.id, visualizer);
          
          // Set initial geometry based on scroll position
          visualizer.currentGeometry = cardData.morphState.targetGeometry;
          
          console.log(`✨ Created visualizer for ${cardElement.id}-${role}`);
        }
      }
    });
  }
  
  destroyCardVisualizer(cardElement) {
    const cardData = this.cards.get(cardElement.id);
    if (!cardData || cardData.visualizers.size === 0) return;
    
    cardData.visualizers.forEach((visualizer, role) => {
      const canvasId = `${cardElement.id}-canvas-${role}`;
      
      // Destroy visualizer
      if (visualizer.destroy) {
        visualizer.destroy();
      }
      
      // Remove from active map
      this.activeVisualizers.delete(canvasId);
      
      // Return canvas to pool
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        canvas.remove();
        this.canvasPool.push(canvas);
      }
    });
    
    cardData.visualizers.clear();
    console.log(`🗑️ Destroyed visualizers for ${cardElement.id}`);
  }
  
  getOrCreateCanvas(canvasId) {
    let canvas = this.canvasPool.pop();
    
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    
    canvas.id = canvasId;
    canvas.className = 'card-visualizer morph-canvas';
    canvas.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 5;
    `;
    
    return canvas;
  }
  
  recycleOldestVisualizer() {
    // Find card furthest from viewport center
    let furthestCard = null;
    let maxDistance = 0;
    
    this.cards.forEach(cardData => {
      if (cardData.visualizers.size > 0) {
        const rect = cardData.element.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - this.viewportData.center);
        if (distance > maxDistance) {
          maxDistance = distance;
          furthestCard = cardData.element;
        }
      }
    });
    
    if (furthestCard) {
      this.destroyCardVisualizer(furthestCard);
    }
  }
  
  setupCardInteractions(card, cardData) {
    // Mouse/Touch interactions for inverse effects
    card.addEventListener('mouseenter', () => {
      cardData.inverseState.isFocused = true;
      this.inverseEffects.focusedCard = cardData;
      this.startInverseEffects(cardData);
    });
    
    card.addEventListener('mouseleave', () => {
      cardData.inverseState.isFocused = false;
      if (this.inverseEffects.focusedCard === cardData) {
        this.inverseEffects.focusedCard = null;
        this.stopInverseEffects();
      }
    });
    
    card.addEventListener('click', () => {
      this.triggerCardExplosion(cardData);
    });
  }
  
  startInverseEffects(focusedCard) {
    // Apply inverse effects to all other cards
    this.cards.forEach((cardData, cardId) => {
      if (cardData !== focusedCard) {
        // Inverse color
        cardData.inverseState.inverseColor = {
          r: 1 - focusedCard.inverseState.inverseColor.r,
          g: 1 - focusedCard.inverseState.inverseColor.g,
          b: 1 - focusedCard.inverseState.inverseColor.b
        };
        
        // Reduce density on other cards
        cardData.visualizers.forEach(visualizer => {
          if (visualizer) {
            visualizer.instanceParams.densityMult *= 0.5;
            visualizer.roleParams.intensity *= 0.7;
          }
        });
      }
    });
    
    // Boost focused card
    focusedCard.visualizers.forEach(visualizer => {
      if (visualizer) {
        visualizer.instanceParams.densityMult *= 1.5;
        visualizer.roleParams.intensity *= 1.3;
      }
    });
    
    // Apply background inverse effect
    document.body.style.filter = 'invert(0.1) hue-rotate(180deg)';
  }
  
  stopInverseEffects() {
    // Reset all cards
    this.cards.forEach(cardData => {
      cardData.visualizers.forEach(visualizer => {
        if (visualizer) {
          visualizer.instanceParams.densityMult = 1.0;
          visualizer.roleParams.intensity = 1.0;
        }
      });
    });
    
    // Reset background
    document.body.style.filter = 'none';
  }
  
  applyInverseEffects(cardData) {
    const focusIntensity = cardData.inverseState.focusIntensity;
    
    // Animate focus intensity
    const targetIntensity = cardData.inverseState.isFocused ? 1 : 0;
    cardData.inverseState.focusIntensity += (targetIntensity - focusIntensity) * 0.1;
    
    // Apply to visualizers
    cardData.visualizers.forEach(visualizer => {
      if (visualizer) {
        const inverseMultiplier = 1 + focusIntensity * 0.5;
        visualizer.instanceParams.densityMult = inverseMultiplier;
      }
    });
  }
  
  triggerCardExplosion(cardData) {
    // Explosive effect on all visualizers
    cardData.visualizers.forEach(visualizer => {
      if (visualizer) {
        visualizer.clickIntensity = 1.0;
        
        // Random geometry jump
        visualizer.currentGeometry = Math.floor(Math.random() * 8);
      }
    });
    
    // Ripple effect to nearby cards
    const rect = cardData.element.getBoundingClientRect();
    const epicenterY = rect.top + rect.height / 2;
    
    this.cards.forEach((otherCard, cardId) => {
      if (otherCard !== cardData) {
        const otherRect = otherCard.element.getBoundingClientRect();
        const distance = Math.abs(otherRect.top + otherRect.height / 2 - epicenterY);
        
        if (distance < 300) {
          const intensity = 1 - distance / 300;
          otherCard.visualizers.forEach(visualizer => {
            if (visualizer) {
              visualizer.clickIntensity = intensity * 0.5;
            }
          });
        }
      }
    });
  }
  
  setupTouchInteractions() {
    let touchStartY = 0;
    let touchVelocity = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      touchVelocity = touchY - touchStartY;
      
      // Apply touch-based color shifts
      this.cards.forEach(cardData => {
        cardData.visualizers.forEach(visualizer => {
          if (visualizer) {
            visualizer.instanceParams.colorShift += touchVelocity * 0.1;
          }
        });
      });
      
      touchStartY = touchY;
    }, { passive: true });
  }
  
  startAnimationLoop() {
    const animate = () => {
      // Update smooth scroll interpolation
      this.scrollData.smoothPosition += (this.scrollData.position - this.scrollData.smoothPosition) * 0.1;
      
      // Update all active visualizers
      this.activeVisualizers.forEach(visualizer => {
        if (visualizer && visualizer.active) {
          // Visualizer will handle its own render loop
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateCardParallax(card, entry) {
    // Additional parallax calculations based on intersection
    const ratio = entry.intersectionRatio;
    const bounds = entry.boundingClientRect;
    
    // Calculate position relative to viewport
    const relativeY = bounds.top / this.viewportData.height;
    
    // Apply easing to parallax movement
    const easedRatio = this.easeInOutCubic(ratio);
    
    // Update card visual properties
    card.style.setProperty('--parallax-y', relativeY);
    card.style.setProperty('--visibility-ratio', easedRatio);
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// DISABLED: Contributing to page instability and transforms
// Initialize when ready
// document.addEventListener('DOMContentLoaded', () => {
//   // Wait for visualizer system to load
//   setTimeout(() => {
//     window.advancedScrollMorph = new AdvancedScrollMorphSystem();
//   }, 1000);
// });

console.log('🚫 Advanced Scroll Morph System DISABLED to prevent page movement');
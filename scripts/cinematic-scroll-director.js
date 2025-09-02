/*
 * CINEMATIC SCROLL DIRECTOR
 * The Movie Director for Your Website
 * 
 * This system treats scrolling like directing a film where:
 * - Each scroll position is a camera movement
 * - Each section is a dramatic scene with its own visual language
 * - Cards and visualizers are actors that perform choreographed movements
 * - Geometry morphing tells the story of technological evolution
 * - Colors and densities create emotional atmosphere
 */

class CinematicScrollDirector {
  constructor() {
    this.currentScene = 0;
    this.scrollProgress = 0;
    this.isTransitioning = false;
    this.snapThreshold = 0.15; // 15% scroll to trigger snap
    this.lastSnapTime = 0;
    
    // MOVIE SCENES - Each tells part of your story
    this.scenes = [
      {
        name: 'ORIGIN_STORY',
        narrative: 'The birth of clear seas - simple geometric origins',
        scrollRange: [0, 0.2],
        geometry: {primary: 0, secondary: 1}, // Tetrahedron -> Hypercube
        colorPalette: {
          primary: { h: 200, s: 80, l: 60 },   // Deep ocean blue
          secondary: { h: 180, s: 70, l: 50 }, // Teal emergence
          accent: { h: 220, s: 90, l: 70 }     // Bright clarity
        },
        visualizerDensity: 0.3,
        spatialMovement: 'gentle_emergence',
        cardBehavior: 'fade_in_from_depth'
      },
      
      {
        name: 'TECHNOLOGICAL_AWAKENING', 
        narrative: 'Innovation emerges - complex patterns form',
        scrollRange: [0.2, 0.4],
        geometry: {primary: 2, secondary: 3}, // Hypersphere -> Torus
        colorPalette: {
          primary: { h: 280, s: 85, l: 65 },   // Tech purple
          secondary: { h: 300, s: 75, l: 55 }, // Innovation magenta  
          accent: { h: 320, s: 95, l: 75 }     // Electric pink
        },
        visualizerDensity: 0.6,
        spatialMovement: 'spiral_expansion',
        cardBehavior: 'tech_stack_formation'
      },
      
      {
        name: 'CAPABILITY_DEMONSTRATION',
        narrative: 'Power revealed - geometric complexity peaks',
        scrollRange: [0.4, 0.6],
        geometry: {primary: 4, secondary: 5}, // Wave -> Crystal
        colorPalette: {
          primary: { h: 45, s: 90, l: 60 },    // Energetic orange
          secondary: { h: 60, s: 80, l: 65 },  // Golden power
          accent: { h: 30, s: 100, l: 70 }     // Blazing amber
        },
        visualizerDensity: 0.9,
        spatialMovement: 'power_surge_expansion',
        cardBehavior: 'portfolio_showcase_dance'
      },
      
      {
        name: 'KNOWLEDGE_SYNTHESIS',
        narrative: 'Research and wisdom - patterns crystalize',
        scrollRange: [0.6, 0.8],
        geometry: {primary: 6, secondary: 7}, // Klein Bottle -> Fractal
        colorPalette: {
          primary: { h: 120, s: 75, l: 55 },   // Sage green
          secondary: { h: 140, s: 65, l: 60 }, // Wisdom emerald
          accent: { h: 100, s: 85, l: 70 }     // Bright insight
        },
        visualizerDensity: 0.7,
        spatialMovement: 'crystalline_formation',
        cardBehavior: 'research_paper_constellation'
      },
      
      {
        name: 'INFINITE_POTENTIAL',
        narrative: 'The future unfolds - unlimited possibilities',
        scrollRange: [0.8, 1.0],
        geometry: {primary: 7, secondary: 0}, // Fractal -> back to Tetrahedron (cycle)
        colorPalette: {
          primary: { h: 240, s: 100, l: 80 },  // Infinite blue
          secondary: { h: 260, s: 90, l: 75 }, // Cosmic purple
          accent: { h: 280, s: 95, l: 85 }     // Transcendent violet
        },
        visualizerDensity: 1.0,
        spatialMovement: 'infinite_spiral_ascension',
        cardBehavior: 'contact_portal_opening'
      }
    ];
    
    // PERFORMANCE TRACKING
    this.performanceMetrics = {
      frameRate: 60,
      lastFrameTime: 0,
      smoothFactor: 0.1
    };
    
    // SPATIAL CHOREOGRAPHY SYSTEM
    this.choreography = {
      cameraPosition: { x: 0, y: 0, z: 1000 },
      targetCameraPosition: { x: 0, y: 0, z: 1000 },
      worldRotation: { x: 0, y: 0, z: 0 },
      targetWorldRotation: { x: 0, y: 0, z: 0 }
    };
    
    console.log('🎬 CINEMATIC SCROLL DIRECTOR - Ready to create visual stories');
    this.init();
  }
  
  init() {
    this.setupSnapScrollSystem();
    this.discoverAllActors(); // Find cards, visualizers, etc.
    this.startCinematicRenderLoop();
    this.setupTactileScrollThresholds();
    
    console.log('🎭 CINEMATIC SYSTEM ACTIVE - Your website is now a movie');
  }
  
  setupSnapScrollSystem() {
    let isSnapping = false;
    let snapStartTime = 0;
    let targetScrollPosition = 0;
    
    // SMOOTH SNAP SCROLL - Like camera movements in films
    const smoothScroll = (targetY, duration = 800) => {
      if (isSnapping) return;
      
      isSnapping = true;
      const startY = window.pageYOffset;
      const distance = targetY - startY;
      snapStartTime = performance.now();
      
      const animateSnap = (currentTime) => {
        const elapsed = currentTime - snapStartTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cinematic easing - like a movie camera movement
        const easeProgress = this.cinematicEasing(progress);
        const currentY = startY + (distance * easeProgress);
        
        window.scrollTo(0, currentY);
        
        if (progress < 1) {
          requestAnimationFrame(animateSnap);
        } else {
          isSnapping = false;
          this.onSceneTransitionComplete();
        }
      };
      
      requestAnimationFrame(animateSnap);
    };
    
    // TACTILE THRESHOLD DETECTION
    let lastScrollTime = 0;
    let scrollVelocity = 0;
    let accumulatedScrollDelta = 0;
    
    window.addEventListener('wheel', (e) => {
      if (isSnapping) {
        e.preventDefault();
        return;
      }
      
      const currentTime = performance.now();
      const deltaTime = currentTime - lastScrollTime;
      lastScrollTime = currentTime;
      
      // Calculate scroll velocity and accumulation
      scrollVelocity = Math.abs(e.deltaY) / deltaTime;
      accumulatedScrollDelta += Math.abs(e.deltaY);
      
      // SNAP THRESHOLD DETECTION
      const currentProgress = this.getScrollProgress();
      const currentSceneIndex = this.getCurrentSceneIndex(currentProgress);
      
      // Check if we've accumulated enough scroll to trigger a snap
      if (accumulatedScrollDelta > 100 || scrollVelocity > 2) {
        const direction = e.deltaY > 0 ? 1 : -1;
        const targetScene = Math.max(0, Math.min(this.scenes.length - 1, currentSceneIndex + direction));
        
        if (targetScene !== currentSceneIndex) {
          e.preventDefault();
          
          // Calculate target scroll position for this scene
          const targetProgress = (this.scenes[targetScene].scrollRange[0] + this.scenes[targetScene].scrollRange[1]) / 2;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          targetScrollPosition = targetProgress * maxScroll;
          
          smoothScroll(targetScrollPosition, 1200); // Cinematic 1.2s transition
          
          // Reset accumulation
          accumulatedScrollDelta = 0;
        }
      }
      
      // Decay accumulated scroll over time
      setTimeout(() => {
        accumulatedScrollDelta = Math.max(0, accumulatedScrollDelta - 20);
      }, 100);
      
    }, { passive: false });
    
    // MOBILE TOUCH SUPPORT
    let touchStartY = 0;
    let touchDelta = 0;
    
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].pageY;
    });
    
    window.addEventListener('touchmove', (e) => {
      if (isSnapping) {
        e.preventDefault();
        return;
      }
      touchDelta = e.touches[0].pageY - touchStartY;
    });
    
    window.addEventListener('touchend', (e) => {
      if (Math.abs(touchDelta) > 50 && !isSnapping) {
        const direction = touchDelta > 0 ? -1 : 1;
        const currentProgress = this.getScrollProgress();
        const currentSceneIndex = this.getCurrentSceneIndex(currentProgress);
        const targetScene = Math.max(0, Math.min(this.scenes.length - 1, currentSceneIndex + direction));
        
        if (targetScene !== currentSceneIndex) {
          const targetProgress = (this.scenes[targetScene].scrollRange[0] + this.scenes[targetScene].scrollRange[1]) / 2;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          smoothScroll(targetProgress * maxScroll, 1000);
        }
      }
      touchDelta = 0;
    });
  }
  
  cinematicEasing(t) {
    // Smooth cinematic easing - like camera movements in films
    return t < 0.5 
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  discoverAllActors() {
    // Find all the "actors" in our movie
    this.actors = {
      cards: Array.from(document.querySelectorAll('.tech-card, .portfolio-item, .paper-card')),
      visualizers: Array.from(document.querySelectorAll('[class*="visualizer"]')),
      buttons: Array.from(document.querySelectorAll('.btn')),
      sections: Array.from(document.querySelectorAll('section')),
      backgrounds: Array.from(document.querySelectorAll('.hero-background, .section-background'))
    };
    
    // Assign each actor a role and initialize their stage properties
    this.actors.cards.forEach((card, index) => {
      card.cinematicData = {
        originalPosition: card.getBoundingClientRect(),
        role: this.determineCardRole(card, index),
        stagePosition: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        opacity: 1,
        currentScene: -1
      };
    });
    
    console.log(`🎭 Discovered ${this.actors.cards.length} card actors for the performance`);
  }
  
  determineCardRole(card, index) {
    // Assign narrative roles to cards based on their content and position
    if (card.classList.contains('tech-card')) return 'technology_showcase';
    if (card.classList.contains('portfolio-item')) return 'capability_demonstration';  
    if (card.classList.contains('paper-card')) return 'knowledge_artifact';
    return 'supporting_element';
  }
  
  startCinematicRenderLoop() {
    const renderCinematicFrame = (timestamp) => {
      // Calculate frame timing for smooth 60fps
      const deltaTime = timestamp - this.performanceMetrics.lastFrameTime;
      this.performanceMetrics.lastFrameTime = timestamp;
      
      // Update scroll progress
      const newScrollProgress = this.getScrollProgress();
      const newSceneIndex = this.getCurrentSceneIndex(newScrollProgress);
      
      // Check for scene transitions
      if (newSceneIndex !== this.currentScene) {
        this.transitionToScene(newSceneIndex, newScrollProgress);
      }
      
      // Update all visual elements based on current scene
      this.updateSceneVisuals(newScrollProgress, deltaTime);
      
      // Continue the render loop
      requestAnimationFrame(renderCinematicFrame);
    };
    
    requestAnimationFrame(renderCinematicFrame);
  }
  
  getScrollProgress() {
    const scrolled = window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(1, Math.max(0, scrolled / maxScroll));
  }
  
  getCurrentSceneIndex(progress) {
    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i];
      if (progress >= scene.scrollRange[0] && progress <= scene.scrollRange[1]) {
        return i;
      }
    }
    return this.scenes.length - 1;
  }
  
  transitionToScene(newSceneIndex, scrollProgress) {
    const oldScene = this.scenes[this.currentScene];
    const newScene = this.scenes[newSceneIndex];
    
    console.log(`🎬 SCENE TRANSITION: "${oldScene?.name || 'NONE'}" → "${newScene.name}"`);
    console.log(`📖 NARRATIVE: ${newScene.narrative}`);
    
    this.currentScene = newSceneIndex;
    this.isTransitioning = true;
    
    // Trigger dramatic scene transition effects
    this.orchestrateSceneTransition(newScene, scrollProgress);
    
    // Update CSS custom properties for the new scene
    this.updateSceneCSS(newScene);
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 1000);
  }
  
  orchestrateSceneTransition(scene, progress) {
    // GEOMETRY MORPHING - Change visualizer types dramatically
    this.morphAllGeometries(scene.geometry);
    
    // COLOR PALETTE TRANSITION - Shift entire visual atmosphere  
    this.transitionColorPalette(scene.colorPalette);
    
    // SPATIAL CHOREOGRAPHY - Move cards in 3D space
    this.choreographCardMovements(scene.cardBehavior, progress);
    
    // VISUALIZER DENSITY - Change complexity of patterns
    this.adjustVisualizerDensity(scene.visualizerDensity);
    
    // SPATIAL MOVEMENT - Transform the world around visualizers
    this.initiateSpatialMovement(scene.spatialMovement);
  }
  
  morphAllGeometries(geometryConfig) {
    // Find all VIB34D visualizers and morph their geometry
    const visualizers = window.cardSystemController?.cards || new Map();
    
    visualizers.forEach((cardData, cardId) => {
      cardData.visualizers.forEach((visualizer, role) => {
        if (visualizer && visualizer.setConfiguration) {
          // Primary or secondary geometry based on role
          const targetGeometry = (role === 'content' || role === 'highlight') 
            ? geometryConfig.primary 
            : geometryConfig.secondary;
            
          // Smooth transition to new geometry
          this.smoothGeometryTransition(visualizer, targetGeometry);
        }
      });
    });
  }
  
  smoothGeometryTransition(visualizer, targetGeometry) {
    if (!visualizer.geometryTransition) {
      visualizer.geometryTransition = {
        from: visualizer.currentGeometry || 0,
        to: targetGeometry,
        progress: 0,
        duration: 2000 // 2 second morph
      };
    } else {
      visualizer.geometryTransition.to = targetGeometry;
      visualizer.geometryTransition.progress = 0;
    }
    
    // Start the morphing animation
    const startTime = performance.now();
    const animateGeometryMorph = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / visualizer.geometryTransition.duration, 1);
      
      // Smooth easing
      const easedProgress = this.cinematicEasing(progress);
      
      // Interpolate between geometries (if possible) or snap at midpoint
      if (easedProgress > 0.5 && visualizer.currentGeometry !== visualizer.geometryTransition.to) {
        visualizer.currentGeometry = visualizer.geometryTransition.to;
        visualizer.targetGeometry = visualizer.geometryTransition.to;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateGeometryMorph);
      }
    };
    
    requestAnimationFrame(animateGeometryMorph);
  }
  
  transitionColorPalette(colorPalette) {
    // Update CSS custom properties for global color transition
    const root = document.documentElement;
    
    // Convert HSL to CSS values and animate
    Object.keys(colorPalette).forEach(colorRole => {
      const color = colorPalette[colorRole];
      const hslValue = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
      
      // Set CSS custom property
      root.style.setProperty(`--scene-${colorRole}`, hslValue);
      root.style.setProperty(`--scene-${colorRole}-h`, color.h);
      root.style.setProperty(`--scene-${colorRole}-s`, `${color.s}%`);
      root.style.setProperty(`--scene-${colorRole}-l`, `${color.l}%`);
    });
    
    // Trigger color transition on all visualizers
    const visualizers = window.cardSystemController?.cards || new Map();
    visualizers.forEach((cardData) => {
      cardData.visualizers.forEach((visualizer) => {
        if (visualizer && visualizer.roleParams) {
          visualizer.roleParams.colorShift = colorPalette.primary.h;
        }
      });
    });
  }
  
  choreographCardMovements(cardBehavior, progress) {
    this.actors.cards.forEach((card, index) => {
      const cardData = card.cinematicData;
      
      switch(cardBehavior) {
        case 'fade_in_from_depth':
          this.animateCardFadeFromDepth(card, index, progress);
          break;
        case 'tech_stack_formation':
          this.animateTechStackFormation(card, index, progress);
          break;
        case 'portfolio_showcase_dance':
          this.animatePortfolioShowcase(card, index, progress);
          break;
        case 'research_paper_constellation':
          this.animateResearchConstellation(card, index, progress);
          break;
        case 'contact_portal_opening':
          this.animateContactPortal(card, index, progress);
          break;
      }
    });
  }
  
  animateCardFadeFromDepth(card, index, progress) {
    const delay = index * 100; // Stagger animation
    const localProgress = Math.max(0, (progress - delay / 1000));
    
    if (localProgress > 0) {
      card.style.transform = `
        translateZ(${(1 - localProgress) * -200}px)
        rotateX(${(1 - localProgress) * -15}deg)
        scale(${0.8 + localProgress * 0.2})
      `;
      card.style.opacity = localProgress;
    }
  }
  
  animateTechStackFormation(card, index, progress) {
    const angle = (index / this.actors.cards.length) * Math.PI * 2;
    const radius = 50 + progress * 100;
    
    card.style.transform = `
      translateX(${Math.cos(angle) * radius}px)
      translateY(${Math.sin(angle) * radius * 0.5}px)
      rotateY(${angle * 180 / Math.PI}deg)
      scale(${1 + progress * 0.3})
    `;
  }
  
  animatePortfolioShowcase(card, index, progress) {
    const wave = Math.sin(progress * Math.PI * 2 + index * 0.5);
    
    card.style.transform = `
      translateY(${wave * 30}px)
      rotateZ(${wave * 5}deg)
      scale(${1 + Math.abs(wave) * 0.1})
    `;
    
    // Enhanced glow effect during showcase
    card.style.boxShadow = `
      0 ${Math.abs(wave) * 20}px ${Math.abs(wave) * 40}px rgba(255, 100, 0, ${Math.abs(wave) * 0.5}),
      inset 0 0 ${Math.abs(wave) * 20}px rgba(255, 150, 0, ${Math.abs(wave) * 0.3})
    `;
  }
  
  animateResearchConstellation(card, index, progress) {
    // Form constellation pattern
    const positions = this.calculateConstellationPositions(this.actors.cards.length);
    const targetPos = positions[index];
    
    card.style.transform = `
      translateX(${targetPos.x * progress}px)
      translateY(${targetPos.y * progress}px)
      rotateZ(${progress * 360}deg)
      scale(${1 - progress * 0.3})
    `;
  }
  
  animateContactPortal(card, index, progress) {
    const spiralRadius = progress * 200;
    const spiralAngle = progress * Math.PI * 4 + index * 0.5;
    
    card.style.transform = `
      translateX(${Math.cos(spiralAngle) * spiralRadius}px)
      translateY(${Math.sin(spiralAngle) * spiralRadius * 0.3}px)
      translateZ(${progress * 300}px)
      rotateY(${spiralAngle * 180 / Math.PI}deg)
      scale(${1 + progress * 2})
    `;
    
    card.style.opacity = 1 - progress * 0.7; // Fade as they spiral away
  }
  
  calculateConstellationPositions(count) {
    // Generate constellation-like positions
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 100 + (i % 3) * 50; // Varying distances
      positions.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    }
    return positions;
  }
  
  adjustVisualizerDensity(density) {
    const visualizers = window.cardSystemController?.cards || new Map();
    
    visualizers.forEach((cardData) => {
      cardData.visualizers.forEach((visualizer) => {
        if (visualizer && visualizer.roleParams) {
          visualizer.roleParams.gridDensity = 20 + density * 60; // 20-80 range
          visualizer.roleParams.intensity = density;
        }
      });
    });
  }
  
  initiateSpatialMovement(movementType) {
    // Transform the world space around visualizers
    const root = document.documentElement;
    
    switch(movementType) {
      case 'gentle_emergence':
        root.style.setProperty('--world-transform', 'perspective(1000px) rotateX(5deg)');
        break;
      case 'spiral_expansion':
        root.style.setProperty('--world-transform', 'perspective(1200px) rotateY(15deg) rotateX(-5deg)');
        break;
      case 'power_surge_expansion':
        root.style.setProperty('--world-transform', 'perspective(800px) rotateX(-10deg) scale(1.1)');
        break;
      case 'crystalline_formation':
        root.style.setProperty('--world-transform', 'perspective(1500px) rotateX(10deg) rotateZ(2deg)');
        break;
      case 'infinite_spiral_ascension':
        root.style.setProperty('--world-transform', 'perspective(2000px) rotateY(30deg) rotateX(15deg) scale(1.2)');
        break;
    }
  }
  
  updateSceneCSS(scene) {
    const root = document.documentElement;
    
    // Set scene-based CSS variables
    root.style.setProperty('--current-scene', this.currentScene);
    root.style.setProperty('--scene-density', scene.visualizerDensity);
    root.style.setProperty('--scene-primary-hue', scene.colorPalette.primary.h);
    root.style.setProperty('--scene-transition', 'all 2s cubic-bezier(0.23, 1, 0.32, 1)');
    
    // Apply scene-specific body class
    document.body.className = document.body.className.replace(/scene-\w+/g, '');
    document.body.classList.add(`scene-${scene.name.toLowerCase()}`);
  }
  
  updateSceneVisuals(progress, deltaTime) {
    // Continuous visual updates during scroll
    const currentScene = this.scenes[this.currentScene];
    if (!currentScene) return;
    
    // Calculate progress within current scene
    const sceneProgress = (progress - currentScene.scrollRange[0]) / 
                         (currentScene.scrollRange[1] - currentScene.scrollRange[0]);
    const clampedProgress = Math.max(0, Math.min(1, sceneProgress));
    
    // Update CSS variables for smooth transitions
    const root = document.documentElement;
    root.style.setProperty('--scene-progress', clampedProgress);
    root.style.setProperty('--scroll-progress', progress);
    
    // Smooth camera movement
    this.updateCinematicCamera(clampedProgress);
    
    // Update visualizer parameters based on scene progress
    this.updateVisualizerParameters(clampedProgress, currentScene);
  }
  
  updateCinematicCamera(sceneProgress) {
    // Smooth camera movements like in films
    this.choreography.targetCameraPosition.z = 1000 - sceneProgress * 200;
    this.choreography.targetWorldRotation.y = sceneProgress * 5;
    
    // Smooth interpolation
    this.choreography.cameraPosition.z += 
      (this.choreography.targetCameraPosition.z - this.choreography.cameraPosition.z) * 0.05;
    this.choreography.worldRotation.y += 
      (this.choreography.targetWorldRotation.y - this.choreography.worldRotation.y) * 0.05;
    
    // Apply to CSS
    const root = document.documentElement;
    root.style.setProperty('--camera-z', `${this.choreography.cameraPosition.z}px`);
    root.style.setProperty('--world-rotation-y', `${this.choreography.worldRotation.y}deg`);
  }
  
  updateVisualizerParameters(sceneProgress, scene) {
    const visualizers = window.cardSystemController?.cards || new Map();
    
    visualizers.forEach((cardData, cardId) => {
      cardData.visualizers.forEach((visualizer, role) => {
        if (visualizer && visualizer.roleParams) {
          // Dynamic parameter updates based on scene progress
          visualizer.roleParams.morphFactor = sceneProgress;
          visualizer.roleParams.chaos = scene.visualizerDensity * sceneProgress;
          visualizer.roleParams.speed = 0.5 + sceneProgress * 1.5;
          
          // Role-specific behaviors
          if (role === 'content') {
            visualizer.roleParams.intensity = 0.8 + sceneProgress * 0.2;
          } else if (role === 'highlight') {
            visualizer.roleParams.intensity = 0.6 + Math.sin(sceneProgress * Math.PI) * 0.4;
          } else {
            visualizer.roleParams.intensity = 0.4 + sceneProgress * 0.3;
          }
        }
      });
    });
  }
  
  setupTactileScrollThresholds() {
    // Visual feedback for scroll thresholds
    this.createScrollProgressIndicator();
    this.createSceneTransitionEffects();
  }
  
  createScrollProgressIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'cinematic-progress-indicator';
    indicator.innerHTML = `
      <div class="scene-dots">
        ${this.scenes.map((scene, i) => `
          <div class="scene-dot" data-scene="${i}">
            <span class="scene-name">${scene.name.replace(/_/g, ' ')}</span>
          </div>
        `).join('')}
      </div>
      <div class="progress-line"></div>
    `;
    
    document.body.appendChild(indicator);
    
    // Style the progress indicator
    const style = document.createElement('style');
    style.textContent = `
      .cinematic-progress-indicator {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      
      .scene-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .scene-dot.active {
        background: var(--scene-primary, #00ffff);
        transform: scale(1.5);
        box-shadow: 0 0 20px var(--scene-primary, #00ffff);
      }
      
      .scene-name {
        position: absolute;
        right: 25px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        color: white;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      
      .scene-dot:hover .scene-name,
      .scene-dot.active .scene-name {
        opacity: 1;
      }
      
      .progress-line {
        position: absolute;
        width: 2px;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        left: 50%;
        transform: translateX(-50%);
        z-index: -1;
      }
      
      .progress-line::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: var(--scroll-progress, 0%);
        background: var(--scene-primary, #00ffff);
        transition: height 0.1s ease;
        box-shadow: 0 0 10px var(--scene-primary, #00ffff);
      }
    `;
    document.head.appendChild(style);
    
    // Make dots clickable
    indicator.querySelectorAll('.scene-dot').forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const targetProgress = (this.scenes[index].scrollRange[0] + this.scenes[index].scrollRange[1]) / 2;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({
          top: targetProgress * maxScroll,
          behavior: 'smooth'
        });
      });
    });
  }
  
  createSceneTransitionEffects() {
    // Add transition effects to CSS
    const style = document.createElement('style');
    style.textContent = `
      body {
        transform-style: preserve-3d;
        perspective: var(--camera-z, 1000px);
        transition: var(--scene-transition, all 2s ease);
      }
      
      .scene-origin_story {
        --theme-primary: hsl(200, 80%, 60%);
        --theme-secondary: hsl(180, 70%, 50%);
      }
      
      .scene-technological_awakening {
        --theme-primary: hsl(280, 85%, 65%);
        --theme-secondary: hsl(300, 75%, 55%);
      }
      
      .scene-capability_demonstration {
        --theme-primary: hsl(45, 90%, 60%);
        --theme-secondary: hsl(60, 80%, 65%);
      }
      
      .scene-knowledge_synthesis {
        --theme-primary: hsl(120, 75%, 55%);
        --theme-secondary: hsl(140, 65%, 60%);
      }
      
      .scene-infinite_potential {
        --theme-primary: hsl(240, 100%, 80%);
        --theme-secondary: hsl(260, 90%, 75%);
      }
      
      .tech-card, .portfolio-item, .paper-card {
        transform-style: preserve-3d;
        transition: var(--scene-transition, all 2s ease);
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }
  
  onSceneTransitionComplete() {
    console.log(`🎭 Scene transition to "${this.scenes[this.currentScene].name}" complete`);
    
    // Update progress indicator
    document.querySelectorAll('.scene-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentScene);
    });
    
    // Trigger any scene-specific completion effects
    this.triggerSceneCompletionEffects();
  }
  
  triggerSceneCompletionEffects() {
    const currentScene = this.scenes[this.currentScene];
    
    // Add scene-specific completion effects
    switch(currentScene.name) {
      case 'TECHNOLOGICAL_AWAKENING':
        this.showTechStackButtons();
        break;
      case 'CAPABILITY_DEMONSTRATION':
        this.revealPortfolioNavigation();
        break;
      case 'KNOWLEDGE_SYNTHESIS':
        this.displayResearchPapers();
        break;
      case 'INFINITE_POTENTIAL':
        this.openContactPortal();
        break;
    }
  }
  
  showTechStackButtons() {
    // Reveal technology buttons with dramatic entrance
    const techButtons = document.querySelectorAll('.tech-card .btn');
    techButtons.forEach((btn, index) => {
      setTimeout(() => {
        btn.style.transform = 'scale(1) translateY(0)';
        btn.style.opacity = '1';
      }, index * 200);
    });
  }
  
  revealPortfolioNavigation() {
    // Show portfolio navigation with cinematic reveal
    const portfolioNavs = document.querySelectorAll('.portfolio-item .nav-buttons');
    portfolioNavs.forEach((nav, index) => {
      setTimeout(() => {
        nav.style.transform = 'translateY(0) rotateX(0)';
        nav.style.opacity = '1';
      }, index * 150);
    });
  }
  
  displayResearchPapers() {
    // Animate research papers into view
    const papers = document.querySelectorAll('.paper-card');
    papers.forEach((paper, index) => {
      setTimeout(() => {
        paper.style.transform = 'rotateY(0) translateZ(0)';
        paper.style.opacity = '1';
      }, index * 250);
    });
  }
  
  openContactPortal() {
    // Create dramatic contact portal opening effect
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.style.transform = 'perspective(1000px) rotateX(0) scale(1)';
      contactSection.style.opacity = '1';
      
      // Add portal opening effect
      const portalEffect = document.createElement('div');
      portalEffect.className = 'contact-portal-effect';
      portalEffect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
        animation: portal-open 3s ease-out forwards;
        pointer-events: none;
        z-index: 999;
      `;
      
      document.body.appendChild(portalEffect);
      
      // Add portal animation
      const portalStyle = document.createElement('style');
      portalStyle.textContent = `
        @keyframes portal-open {
          to {
            width: 100vmax;
            height: 100vmax;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(portalStyle);
      
      setTimeout(() => {
        portalEffect.remove();
        portalStyle.remove();
      }, 3000);
    }
  }
}

// Initialize the cinematic scroll system
window.addEventListener('DOMContentLoaded', () => {
  window.cinematicScrollDirector = new CinematicScrollDirector();
  
  console.log('🎬 CINEMATIC SCROLL SYSTEM READY');
  console.log('🎭 Your website is now an interactive movie experience');
});
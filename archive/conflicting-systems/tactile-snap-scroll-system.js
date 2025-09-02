/*
 * TACTILE SNAP SCROLL SYSTEM
 * Faux infinite scroll with tactile thresholds that snap to sections
 * Integrates with card metamorphosis, hypercube effects, and tetrahedron lattice
 */

class TactileSnapScrollSystem {
  constructor() {
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.currentSection = 0;
    this.sections = [];
    this.snapThreshold = 50; // pixels needed to trigger snap
    this.snapDuration = 800; // ms for smooth snap animation
    this.tactileFeedbackIntensity = 0.8;
    
    this.scrollVelocity = 0;
    this.lastScrollTime = 0;
    this.momentumDecay = 0.95;
    this.snapMagnetism = 0.3;
    
    this.visualEffectsActive = false;
    this.snapInProgress = false;
    this.userHasInteracted = false;
    
    this.init();
  }
  
  init() {
    this.setupScrollContainer();
    this.detectSections();
    this.setupSnapBehavior();
    this.setupTactileFeedback();
    this.setupVisualIntegration();
    this.setupUserInteractionTracking();
    
    console.log('🎯 Tactile Snap Scroll System - Activated with precision control');
  }
  
  setupScrollContainer() {
    // Override default scroll behavior
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    // Create scroll physics container
    this.scrollContainer = document.querySelector('.scroll-container') || document.body;
    
    // Add scroll physics styles
    const style = document.createElement('style');
    style.textContent = `
      .snap-section {
        min-height: 100vh;
        position: relative;
        scroll-snap-align: start;
        transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .snap-section.active {
        transform: translateZ(0);
      }
      
      .snap-section.approaching {
        transform: scale(1.02) translateZ(20px);
        filter: brightness(1.1);
      }
      
      .snap-section.receding {
        transform: scale(0.98) translateZ(-20px);
        filter: brightness(0.9);
      }
      
      .scroll-container {
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
        overscroll-behavior: none;
      }
      
      .snap-indicator {
        position: fixed;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .snap-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      .snap-dot.active {
        background: rgba(0, 255, 255, 0.8);
        transform: scale(1.5);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      }
      
      .snap-dot.approaching {
        background: rgba(255, 255, 0, 0.6);
        transform: scale(1.2);
      }
    `;
    document.head.appendChild(style);
  }
  
  detectSections() {
    // Auto-detect sections or create them from existing content
    let detectedSections = document.querySelectorAll('.section, .tech-card, .portfolio-item, .research-section');
    
    if (detectedSections.length === 0) {
      // Create sections from major content blocks
      detectedSections = this.createSectionsFromContent();
    }
    
    this.sections = Array.from(detectedSections).map((element, index) => {
      element.classList.add('snap-section');
      element.setAttribute('data-section-index', index);
      
      return {
        element: element,
        index: index,
        offsetTop: element.offsetTop,
        height: element.offsetHeight,
        threshold: element.offsetTop + (element.offsetHeight * 0.3),
        id: element.id || `section-${index}`,
        isActive: false
      };
    });
    
    this.createSnapIndicators();
    
    console.log(`🎯 Detected ${this.sections.length} snap sections`);
  }
  
  createSectionsFromContent() {
    // Create sections from major content areas
    const contentAreas = document.querySelectorAll('main > *, article > *, section > *');
    const sections = [];
    
    let currentSection = null;
    let sectionHeight = 0;
    
    contentAreas.forEach(element => {
      if (element.tagName.match(/H[123]/)) {
        // Start new section on headings
        if (currentSection) {
          currentSection.style.minHeight = Math.max(sectionHeight, window.innerHeight) + 'px';
          sections.push(currentSection);
        }
        
        currentSection = document.createElement('div');
        currentSection.className = 'snap-section auto-created';
        currentSection.style.minHeight = '100vh';
        
        element.parentNode.insertBefore(currentSection, element);
        currentSection.appendChild(element);
        sectionHeight = 0;
      } else if (currentSection) {
        currentSection.appendChild(element);
      }
      
      sectionHeight += element.offsetHeight;
    });
    
    if (currentSection) {
      currentSection.style.minHeight = Math.max(sectionHeight, window.innerHeight) + 'px';
      sections.push(currentSection);
    }
    
    return sections;
  }
  
  createSnapIndicators() {
    this.indicatorContainer = document.createElement('div');
    this.indicatorContainer.className = 'snap-indicator';
    
    this.sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'snap-dot';
      dot.setAttribute('data-section-index', index);
      dot.title = section.id;
      
      dot.addEventListener('click', () => this.snapToSection(index));
      
      this.indicatorContainer.appendChild(dot);
    });
    
    document.body.appendChild(this.indicatorContainer);
  }
  
  setupSnapBehavior() {
    let scrollTimeout;
    let isSnapping = false;
    
    window.addEventListener('scroll', (e) => {
      if (isSnapping) return;
      
      const currentTime = performance.now();
      const timeDelta = currentTime - this.lastScrollTime;
      const scrollDelta = window.scrollY - (this.lastScrollY || 0);
      
      // Calculate scroll velocity
      this.scrollVelocity = scrollDelta / (timeDelta + 1);
      this.lastScrollTime = currentTime;
      this.lastScrollY = window.scrollY;
      
      this.updateSectionStates();
      this.triggerVisualEffects();
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Set new timeout for snap behavior
      scrollTimeout = setTimeout(() => {
        if (!isSnapping) {
          this.evaluateSnap();
        }
      }, 150);
    }, { passive: true });
    
    // Handle wheel events for more precise control
    window.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > this.snapThreshold && !isSnapping) {
        e.preventDefault();
        
        const direction = e.deltaY > 0 ? 1 : -1;
        const targetSection = this.currentSection + direction;
        
        if (targetSection >= 0 && targetSection < this.sections.length) {
          this.snapToSection(targetSection);
        }
      }
    }, { passive: false });
    
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        this.snapToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.snapToPrevious();
      }
    });
  }
  
  updateSectionStates() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const viewportCenter = scrollY + windowHeight / 2;
    
    this.sections.forEach((section, index) => {
      const rect = section.element.getBoundingClientRect();
      const sectionCenter = scrollY + rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(viewportCenter - sectionCenter);
      
      // Update section visual states
      if (distanceFromCenter < windowHeight * 0.3) {
        section.element.classList.add('active');
        section.element.classList.remove('approaching', 'receding');
        this.currentSection = index;
      } else if (distanceFromCenter < windowHeight * 0.6) {
        section.element.classList.add('approaching');
        section.element.classList.remove('active', 'receding');
      } else {
        section.element.classList.add('receding');
        section.element.classList.remove('active', 'approaching');
      }
      
      // Update indicators
      const indicator = this.indicatorContainer.children[index];
      if (indicator) {
        indicator.classList.toggle('active', section.element.classList.contains('active'));
        indicator.classList.toggle('approaching', section.element.classList.contains('approaching'));
      }
    });
  }
  
  evaluateSnap() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Find the section that should be active
    let targetSection = this.findClosestSection();
    
    // Check if we need to snap
    const targetElement = this.sections[targetSection].element;
    const targetTop = targetElement.offsetTop;
    const distanceToTarget = Math.abs(scrollY - targetTop);
    
    // Apply snap magnetism based on velocity and distance
    const velocityFactor = Math.abs(this.scrollVelocity) / 50;
    const snapStrength = this.snapMagnetism * (1 + velocityFactor);
    const shouldSnap = distanceToTarget > this.snapThreshold || 
                      Math.abs(this.scrollVelocity) > 2;
    
    if (shouldSnap && !this.snapInProgress) {
      this.snapToSection(targetSection);
    }
  }
  
  findClosestSection() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const viewportCenter = scrollY + windowHeight / 2;
    
    let closestSection = 0;
    let minDistance = Infinity;
    
    this.sections.forEach((section, index) => {
      const sectionCenter = section.element.offsetTop + section.element.offsetHeight / 2;
      const distance = Math.abs(viewportCenter - sectionCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = index;
      }
    });
    
    return closestSection;
  }
  
  snapToSection(index, smooth = true) {
    if (index < 0 || index >= this.sections.length || this.snapInProgress) return;
    
    this.snapInProgress = true;
    const targetSection = this.sections[index];
    const targetTop = targetSection.element.offsetTop;
    
    console.log(`🎯 Snapping to section ${index}: ${targetSection.id}`);
    
    // Trigger visual effects for this section
    this.activateVisualEffectsForSection(targetSection);
    
    // Perform smooth scroll
    if (smooth) {
      this.smoothScrollTo(targetTop, this.snapDuration).then(() => {
        this.snapInProgress = false;
        this.currentSection = index;
        this.triggerSnapComplete(targetSection);
      });
    } else {
      window.scrollTo(0, targetTop);
      this.snapInProgress = false;
      this.currentSection = index;
      this.triggerSnapComplete(targetSection);
    }
    
    // Update visual states immediately
    this.updateSectionStates();
  }
  
  smoothScrollTo(targetY, duration) {
    return new Promise(resolve => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      let startTime = null;
      
      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Smooth easing function
        const ease = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startY + (distance * ease));
        
        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animation);
    });
  }
  
  activateVisualEffectsForSection(section) {
    const rect = section.element.getBoundingClientRect();
    
    // Activate tetrahedron lattice
    if (window.tetrahedronLattice) {
      window.tetrahedronLattice.setMorphFactor(1.2);
      window.tetrahedronLattice.setConnectionStrength(1.5);
    }
    
    // Trigger hypercube moire effects
    if (window.hypercubeMoireEngine) {
      const intensity = (section.index + 1) / this.sections.length;
      window.hypercubeMoireEngine.updateScrollIntensity(intensity);
    }
    
    // Activate glitch effects
    if (window.glitchChromatic) {
      window.glitchChromatic.setGlitchIntensity(0.3);
      window.glitchChromatic.pulseGlitchEffect(1500);
    }
    
    // Trigger card metamorphosis for cards in this section
    const cards = section.element.querySelectorAll('.tech-card, .portfolio-item, .paper-card');
    cards.forEach(card => {
      if (window.woahCardMetamorphosisEngine) {
        setTimeout(() => {
          window.woahCardMetamorphosisEngine.triggerCardMetamorphosis(card, 'snap_focus');
        }, Math.random() * 500);
      }
    });
  }
  
  triggerSnapComplete(section) {
    // Haptic feedback (if supported and user has interacted)
    this.tryHapticFeedback([50, 30, 50]);
    
    // Visual confirmation
    this.showSnapFeedback(section);
    
    // Custom event for other systems
    window.dispatchEvent(new CustomEvent('snapComplete', {
      detail: {
        section: section,
        index: section.index,
        element: section.element
      }
    }));
  }
  
  showSnapFeedback(section) {
    const feedback = document.createElement('div');
    feedback.className = 'snap-feedback';
    feedback.textContent = section.id || `Section ${section.index + 1}`;
    
    feedback.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 255, 255, 0.9);
      color: #000;
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: 600;
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(feedback);
    
    requestAnimationFrame(() => {
      feedback.style.opacity = '1';
    });
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }
  
  snapToNext() {
    const nextIndex = Math.min(this.currentSection + 1, this.sections.length - 1);
    this.snapToSection(nextIndex);
  }
  
  snapToPrevious() {
    const prevIndex = Math.max(this.currentSection - 1, 0);
    this.snapToSection(prevIndex);
  }
  
  setupTactileFeedback() {
    // Setup touch/swipe support for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
      touchEndY = e.changedTouches[0].screenY;
      const deltaY = touchStartY - touchEndY;
      
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          this.snapToNext();
        } else {
          this.snapToPrevious();
        }
      }
    }, { passive: true });
  }
  
  setupVisualIntegration() {
    // Integrate with existing scroll systems
    window.addEventListener('snapComplete', (e) => {
      // Update other visual systems when snap completes
      if (window.cinematicScrollDirector) {
        window.cinematicScrollDirector.processScrollEvent();
      }
      
      if (window.advancedScrollMorph) {
        window.advancedScrollMorph.updateMorphTarget(e.detail.section.element);
      }
    });
  }
  
  updateSnapThreshold(threshold) {
    this.snapThreshold = Math.max(10, Math.min(200, threshold));
  }
  
  updateSnapDuration(duration) {
    this.snapDuration = Math.max(200, Math.min(2000, duration));
  }
  
  setTactileFeedbackIntensity(intensity) {
    this.tactileFeedbackIntensity = Math.max(0, Math.min(1, intensity));
  }
  
  getCurrentSection() {
    return this.sections[this.currentSection];
  }
  
  getTotalSections() {
    return this.sections.length;
  }
  
  setupUserInteractionTracking() {
    // Track user interactions to enable haptic feedback
    const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
    
    const trackInteraction = () => {
      if (!this.userHasInteracted) {
        this.userHasInteracted = true;
        console.log('🎯 User interaction detected - haptic feedback enabled');
        
        // Remove listeners after first interaction
        interactionEvents.forEach(event => {
          document.removeEventListener(event, trackInteraction);
        });
      }
    };
    
    // Add listeners for first interaction
    interactionEvents.forEach(event => {
      document.addEventListener(event, trackInteraction, { once: true });
    });
  }
  
  tryHapticFeedback(pattern) {
    // Only try haptic feedback if user has interacted and it's supported
    if (!this.userHasInteracted) {
      return; // User hasn't interacted yet, vibrate API will be blocked
    }
    
    if (!navigator.vibrate) {
      return; // Not supported
    }
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('⚠️ Haptic feedback failed:', error);
    }
  }

  triggerVisualEffects() {
    try {
      // Get current scroll progress
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const currentSection = this.getCurrentSection();
      
      // Trigger visual effects on different systems
      if (window.woahCardSystem) {
        window.woahCardSystem.updateVisualEffects({
          scrollProgress,
          currentSection,
          timestamp: Date.now()
        });
      }
      
      if (window.cinematicScrollDirector) {
        window.cinematicScrollDirector.updateVisualState({
          progress: scrollProgress,
          section: currentSection,
          velocity: this.scrollVelocity
        });
      }
      
      // Trigger holographic effects if available
      if (window.holographicSystem) {
        window.holographicSystem.updateEffects({
          intensity: Math.min(Math.abs(this.scrollVelocity) * 0.1, 1.0),
          progress: scrollProgress,
          section: currentSection
        });
      }
      
    } catch (error) {
      console.warn('⚠️ Visual effects trigger failed:', error);
    }
  }
  
  getCurrentSection() {
    const sections = document.querySelectorAll('section, .section, [data-section]');
    const currentY = window.scrollY + (window.innerHeight / 2);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;
      
      if (currentY >= sectionTop && currentY <= sectionBottom) {
        return {
          index: i,
          element: section,
          progress: (currentY - sectionTop) / rect.height,
          id: section.id || `section-${i}`
        };
      }
    }
    
    return { index: 0, element: sections[0], progress: 0, id: 'default' };
  }
  
  destroy() {
    // Clean up event listeners and elements
    this.indicatorContainer?.remove();
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('keydown', this.handleKeydown);
  }
}

// Initialize tactile snap scroll system
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.tactileSnapScroll = new TactileSnapScrollSystem();
    
    console.log('🎯 Tactile Snap Scroll System - Ready for precision navigation');
    
    // Connect to other systems
    window.addEventListener('load', () => {
      // Auto-snap to first section after everything loads
      setTimeout(() => {
        if (window.tactileSnapScroll) {
          window.tactileSnapScroll.snapToSection(0, false);
        }
      }, 1000);
    });
    
  }, 600);
});
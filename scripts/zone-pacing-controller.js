/*
 * ZONE PACING CONTROLLER
 * Controls scroll timing, momentum, and zone presentation pacing
 * Prevents users from racing through zones without proper loading/presentation
 */

class ZonePacingController {
  constructor(scrollMaster) {
    this.scrollMaster = scrollMaster;
    this.currentZone = null;
    this.zoneState = {
      isTransitioning: false,
      transitionStartTime: 0,
      currentSubZone: null,
      zoneEnterTime: 0,
      minimumZoneTime: 3000, // 3 seconds minimum in each zone
      transitionCooldown: 1500, // 1.5 seconds between zone transitions
      lastTransitionTime: 0
    };
    
    this.scrollState = {
      velocity: 0,
      damping: 1.0,
      isDamped: false,
      pendingScroll: 0,
      smoothScrollRAF: null
    };
    
    // Zone-specific presentation timings
    this.zonePresentationTimes = {
      hero: { entry: 2000, development: 4000, flourish: 3000, transition: 1500 },
      technology: { entry: 1500, development: 5000, flourish: 2500, transition: 1000 },
      portfolio: { entry: 1200, development: 4500, flourish: 3000, transition: 1200 },
      research: { entry: 1800, development: 6000, flourish: 4000, transition: 1500 },
      about: { entry: 1000, development: 3000, flourish: 2000, transition: 800 },
      contact: { entry: 1200, development: 3500, flourish: 2500, transition: 1000 }
    };
    
    this.init();
  }
  
  init() {
    this.setupScrollInterception();
    this.setupZoneProgressTracking();
    this.createZoneProgressIndicators();
    console.log('⏱️ Zone Pacing Controller - Initialized with presentation timing');
  }
  
  setupScrollInterception() {
    // Intercept all scroll events and apply pacing logic
    let originalScrollTo = window.scrollTo;
    let originalScrollBy = window.scrollBy;
    
    // Override scrollTo with pacing control
    window.scrollTo = (options) => {
      if (typeof options === 'object') {
        this.controlledScrollTo(options.top || 0, options.behavior || 'auto');
      } else {
        this.controlledScrollTo(options || 0, 'auto');
      }
    };
    
    // Override scrollBy with pacing control
    window.scrollBy = (options) => {
      if (typeof options === 'object') {
        const targetY = window.scrollY + (options.top || 0);
        this.controlledScrollTo(targetY, options.behavior || 'auto');
      } else {
        const targetY = window.scrollY + (options || 0);
        this.controlledScrollTo(targetY, 'auto');
      }
    };
    
    // Store original functions for internal use
    this.originalScrollTo = originalScrollTo;
    this.originalScrollBy = originalScrollBy;
  }
  
  controlledScrollTo(targetY, behavior = 'smooth') {
    const currentTime = performance.now();
    const currentY = window.scrollY;
    const deltaY = targetY - currentY;
    
    // Check if we're trying to transition zones too quickly
    if (this.shouldDampScroll(targetY, deltaY)) {
      this.applyScrollDamping(targetY, deltaY);
      return;
    }
    
    // Check if we need to enforce zone presentation timing
    if (this.shouldEnforceZoneTiming(targetY)) {
      this.enforceZonePresentationTime(targetY);
      return;
    }
    
    // Allow normal scroll
    this.executeControlledScroll(targetY, behavior);
  }
  
  shouldDampScroll(targetY, deltaY) {
    const currentZone = this.getCurrentZoneFromY(window.scrollY);
    const targetZone = this.getCurrentZoneFromY(targetY);
    
    // Damp if trying to skip zones or scroll too fast through zones
    if (currentZone !== targetZone) {
      const timeSinceLastTransition = performance.now() - this.zoneState.lastTransitionTime;
      
      // Enforce cooldown between zone transitions
      if (timeSinceLastTransition < this.zoneState.transitionCooldown) {
        return true;
      }
      
      // Check if current zone has had minimum presentation time
      const timeInCurrentZone = performance.now() - this.zoneState.zoneEnterTime;
      if (timeInCurrentZone < this.zoneState.minimumZoneTime) {
        return true;
      }
    }
    
    // Damp very fast scrolling
    const scrollSpeed = Math.abs(deltaY);
    if (scrollSpeed > window.innerHeight * 2) {
      return true;
    }
    
    return false;
  }
  
  shouldEnforceZoneTiming(targetY) {
    const currentZone = this.getCurrentZoneFromY(window.scrollY);
    const targetZone = this.getCurrentZoneFromY(targetY);
    
    if (currentZone && currentZone !== targetZone) {
      const currentSubZone = this.getCurrentSubZone(currentZone, window.scrollY);
      
      // Check if current sub-zone has had enough presentation time
      if (currentSubZone && this.zoneState.currentSubZone === currentSubZone.name) {
        const timeInSubZone = performance.now() - this.zoneState.subZoneEnterTime;
        const requiredTime = this.zonePresentationTimes[currentZone.id]?.[currentSubZone.name] || 2000;
        
        return timeInSubZone < requiredTime;
      }
    }
    
    return false;
  }
  
  applyScrollDamping(targetY, deltaY) {
    console.log('🛑 Scroll damping applied - Slowing down zone transition');
    
    // Create visual feedback for damped scroll
    this.showScrollDampingFeedback();
    
    // Apply heavy damping to scroll velocity
    const dampingFactor = 0.2;
    const dampedDelta = deltaY * dampingFactor;
    const intermediateTarget = window.scrollY + dampedDelta;
    
    // Animate to intermediate position with easing
    this.animateScrollTo(intermediateTarget, 800, 'ease-out');
    
    // Queue the full scroll for later
    setTimeout(() => {
      if (!this.shouldDampScroll(targetY, targetY - window.scrollY)) {
        this.animateScrollTo(targetY, 1200, 'ease-in-out');
      }
    }, 1000);
  }
  
  enforceZonePresentationTime(targetY) {
    console.log('⏳ Enforcing zone presentation timing');
    
    const currentZone = this.getCurrentZoneFromY(window.scrollY);
    const currentSubZone = this.getCurrentSubZone(currentZone, window.scrollY);
    
    if (currentSubZone) {
      const timeInSubZone = performance.now() - (this.zoneState.subZoneEnterTime || 0);
      const requiredTime = this.zonePresentationTimes[currentZone.id]?.[currentSubZone.name] || 2000;
      const remainingTime = Math.max(0, requiredTime - timeInSubZone);
      
      // Show presentation timing feedback
      this.showPresentationTimingFeedback(currentZone, currentSubZone, remainingTime);
      
      // Allow slow, controlled movement toward target
      const allowedMovement = Math.min(Math.abs(targetY - window.scrollY), window.innerHeight * 0.1);
      const direction = targetY > window.scrollY ? 1 : -1;
      const controlledTarget = window.scrollY + (allowedMovement * direction);
      
      this.animateScrollTo(controlledTarget, remainingTime / 2, 'ease-out');
      
      // Queue full movement after timing requirement is met
      setTimeout(() => {
        this.animateScrollTo(targetY, 1000, 'ease-in-out');
      }, remainingTime);
    }
  }
  
  executeControlledScroll(targetY, behavior) {
    // Update zone state
    this.updateZoneState(targetY);
    
    // Use original scroll function with controlled parameters
    this.animateScrollTo(targetY, behavior === 'smooth' ? 800 : 0, 'ease-in-out');
  }
  
  animateScrollTo(targetY, duration, easing = 'ease-in-out') {
    if (this.scrollState.smoothScrollRAF) {
      cancelAnimationFrame(this.scrollState.smoothScrollRAF);
    }
    
    const startY = window.scrollY;
    const deltaY = targetY - startY;
    const startTime = performance.now();
    
    const easingFunctions = {
      'ease-in-out': t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      'ease-out': t => t * (2 - t),
      'ease-in': t => t * t,
      'linear': t => t
    };
    
    const easingFunc = easingFunctions[easing] || easingFunctions['ease-in-out'];
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunc(progress);
      
      const currentY = startY + (deltaY * easedProgress);
      this.originalScrollTo.call(window, 0, currentY);
      
      if (progress < 1) {
        this.scrollState.smoothScrollRAF = requestAnimationFrame(animate);
      } else {
        this.scrollState.smoothScrollRAF = null;
      }
    };
    
    if (duration > 0) {
      this.scrollState.smoothScrollRAF = requestAnimationFrame(animate);
    } else {
      this.originalScrollTo.call(window, 0, targetY);
    }
  }
  
  updateZoneState(targetY) {
    const newZone = this.getCurrentZoneFromY(targetY);
    
    if (newZone !== this.currentZone) {
      // Zone transition
      this.zoneState.lastTransitionTime = performance.now();
      this.zoneState.zoneEnterTime = performance.now();
      this.zoneState.isTransitioning = true;
      
      console.log(`🌊 Zone transition to ${newZone?.id || 'none'} with pacing control`);
      
      setTimeout(() => {
        this.zoneState.isTransitioning = false;
      }, this.zoneState.transitionCooldown);
      
      this.currentZone = newZone;
    }
    
    // Update sub-zone state
    const newSubZone = this.getCurrentSubZone(newZone, targetY);
    if (newSubZone && newSubZone.name !== this.zoneState.currentSubZone) {
      this.zoneState.currentSubZone = newSubZone.name;
      this.zoneState.subZoneEnterTime = performance.now();
      
      // Trigger sub-zone presentation
      this.triggerSubZonePresentation(newZone, newSubZone);
    }
  }
  
  getCurrentZoneFromY(scrollY) {
    // Use scroll master's zone detection
    return this.scrollMaster.determineCurrentZone(scrollY);
  }
  
  getCurrentSubZone(zone, scrollY) {
    if (!zone) return null;
    return this.scrollMaster.determineSubZone(zone, scrollY);
  }
  
  triggerSubZonePresentation(zone, subZone) {
    console.log(`🎭 Starting ${subZone.name} presentation for ${zone.id}`);
    
    // Add presentation timing classes
    if (zone.element) {
      zone.element.classList.add(`presenting-${subZone.name}`);
      zone.element.classList.add('zone-presenting');
      
      // Get presentation time for this sub-zone
      const presentationTime = this.zonePresentationTimes[zone.id]?.[subZone.name] || 2000;
      
      // Remove presentation classes after timing
      setTimeout(() => {
        zone.element.classList.remove(`presenting-${subZone.name}`);
        
        // Check if this was the last sub-zone presentation
        const presentingClasses = Array.from(zone.element.classList).filter(c => c.startsWith('presenting-'));
        if (presentingClasses.length === 0) {
          zone.element.classList.remove('zone-presenting');
        }
      }, presentationTime);
    }
    
    // Update visualizer with presentation timing
    if (zone.visualizerInstance) {
      zone.visualizerInstance.updateParameters({
        presentationMode: subZone.name,
        presentationProgress: 0,
        presentationDuration: this.zonePresentationTimes[zone.id]?.[subZone.name] || 2000
      });
      
      // Animate presentation progress
      this.animatePresentationProgress(zone, subZone);
    }
  }
  
  animatePresentationProgress(zone, subZone) {
    const startTime = performance.now();
    const duration = this.zonePresentationTimes[zone.id]?.[subZone.name] || 2000;
    
    const updateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (zone.visualizerInstance) {
        zone.visualizerInstance.updateParameters({
          presentationProgress: progress
        });
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }
  
  showScrollDampingFeedback() {
    // Create visual feedback for scroll damping
    const feedback = document.createElement('div');
    feedback.className = 'scroll-damping-feedback';
    feedback.innerHTML = '⏳ Loading zone experience...';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translateZ(100px);
      background: rgba(0, 40, 80, 0.9);
      color: rgba(0, 255, 255, 1);
      padding: 15px 25px;
      border-radius: 25px;
      font-size: 0.9rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.3);
      z-index: 10002;
      animation: dampingFeedbackPulse 2s ease-in-out;
      pointer-events: none;
    `;
    
    // Add feedback animation
    if (!document.head.querySelector('#damping-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'damping-feedback-styles';
      style.textContent = `
        @keyframes dampingFeedbackPulse {
          0% { opacity: 0; transform: translate(-50%, -50%) translateZ(100px) scale(0.8); }
          50% { opacity: 1; transform: translate(-50%, -50%) translateZ(100px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translateZ(100px) scale(0.9); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }
  
  showPresentationTimingFeedback(zone, subZone, remainingTime) {
    const feedback = document.createElement('div');
    feedback.className = 'presentation-timing-feedback';
    feedback.innerHTML = `
      <div class="timing-title">${zone.id.toUpperCase()} - ${subZone.name}</div>
      <div class="timing-progress">
        <div class="timing-bar" style="animation: timingProgress ${remainingTime}ms linear"></div>
      </div>
      <div class="timing-text">Experience in progress...</div>
    `;
    
    feedback.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateZ(50px);
      background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95));
      color: white;
      padding: 20px;
      border-radius: 15px;
      min-width: 280px;
      text-align: center;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      z-index: 10002;
      animation: presentationFeedbackSlide 0.5s ease-out;
    `;
    
    // Add presentation feedback styles
    if (!document.head.querySelector('#presentation-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'presentation-feedback-styles';
      style.textContent = `
        @keyframes presentationFeedbackSlide {
          0% { opacity: 0; transform: translateX(-50%) translateZ(50px) translateY(50px); }
          100% { opacity: 1; transform: translateX(-50%) translateZ(50px) translateY(0); }
        }
        
        @keyframes timingProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .timing-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(0, 255, 255, 1);
          margin-bottom: 10px;
          letter-spacing: 1px;
        }
        
        .timing-progress {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .timing-bar {
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(0, 255, 255, 0.8), 
            rgba(255, 255, 255, 1), 
            rgba(0, 255, 255, 0.8));
          width: 0%;
        }
        
        .timing-text {
          font-size: 0.7rem;
          opacity: 0.8;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.animation = 'presentationFeedbackSlide 0.5s ease-in reverse';
      setTimeout(() => feedback.remove(), 500);
    }, remainingTime + 500);
  }
  
  setupZoneProgressTracking() {
    // Enhanced scroll listener for zone progress
    let progressRAF = null;
    
    const trackProgress = () => {
      const currentY = window.scrollY;
      const currentZone = this.getCurrentZoneFromY(currentY);
      
      if (currentZone) {
        const subZone = this.getCurrentSubZone(currentZone, currentY);
        
        // Update zone progress indicators
        this.updateZoneProgressIndicators(currentZone, subZone);
        
        // Check for extended presentation requirements
        this.checkExtendedPresentationRequirements(currentZone, subZone);
      }
    };
    
    window.addEventListener('scroll', () => {
      if (progressRAF) return;
      
      progressRAF = requestAnimationFrame(() => {
        trackProgress();
        progressRAF = null;
      });
    });
  }
  
  createZoneProgressIndicators() {
    // Enhanced zone indicators showing presentation progress
    const progressContainer = document.createElement('div');
    progressContainer.className = 'zone-progress-indicators';
    progressContainer.style.cssText = `
      position: fixed;
      left: 20px;
      top: 50%;
      transform: translateY(-50%) translateZ(50px);
      z-index: 10001;
      pointer-events: none;
    `;
    
    // Create indicators for each zone
    const zones = ['hero', 'technology', 'portfolio', 'research', 'about', 'contact'];
    zones.forEach((zoneId, index) => {
      const indicator = document.createElement('div');
      indicator.className = `zone-progress-indicator zone-indicator-${zoneId}`;
      indicator.style.cssText = `
        width: 6px;
        height: 40px;
        background: linear-gradient(180deg, 
          rgba(255, 255, 255, 0.1) 0%,
          rgba(0, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.1) 100%);
        margin-bottom: 10px;
        border-radius: 3px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      `;
      
      // Add progress bar inside indicator
      const progressBar = document.createElement('div');
      progressBar.className = 'zone-progress-bar';
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background: linear-gradient(180deg,
          rgba(0, 255, 255, 1) 0%,
          rgba(255, 255, 255, 0.9) 100%);
        transition: height 0.5s ease-out;
      `;
      
      indicator.appendChild(progressBar);
      progressContainer.appendChild(indicator);
    });
    
    document.body.appendChild(progressContainer);
    this.progressContainer = progressContainer;
  }
  
  updateZoneProgressIndicators(currentZone, subZone) {
    if (!this.progressContainer) return;
    
    const indicators = this.progressContainer.querySelectorAll('.zone-progress-indicator');
    indicators.forEach((indicator, index) => {
      const progressBar = indicator.querySelector('.zone-progress-bar');
      
      if (indicator.classList.contains(`zone-indicator-${currentZone.id}`)) {
        // Current zone - show sub-zone progress
        const progress = subZone ? subZone.progress * 100 : 0;
        progressBar.style.height = `${progress}%`;
        
        indicator.style.background = `linear-gradient(180deg, 
          rgba(0, 255, 255, 0.6) 0%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(0, 255, 255, 0.6) 100%)`;
        indicator.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
        indicator.style.width = '8px';
      } else {
        // Other zones
        progressBar.style.height = '0%';
        indicator.style.background = `linear-gradient(180deg, 
          rgba(255, 255, 255, 0.1) 0%,
          rgba(0, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.1) 100%)`;
        indicator.style.boxShadow = 'none';
        indicator.style.width = '6px';
      }
    });
  }
  
  checkExtendedPresentationRequirements(zone, subZone) {
    // Check if zone needs extended presentation time
    if (!subZone) return;
    
    const timeInSubZone = performance.now() - (this.zoneState.subZoneEnterTime || 0);
    const requiredTime = this.zonePresentationTimes[zone.id]?.[subZone.name] || 2000;
    
    // If we're in flourish sub-zone, ensure dramatic presentation
    if (subZone.name === 'flourish' && timeInSubZone < requiredTime * 0.8) {
      // Apply flourish effects
      this.triggerFlourishEffects(zone, subZone);
    }
  }
  
  triggerFlourishEffects(zone, subZone) {
    if (!zone.element) return;
    
    // Enhanced flourish effects
    zone.element.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    zone.element.style.transform = 'translateZ(60px) scale(1.03)';
    zone.element.style.filter = 'brightness(1.2) saturate(1.3) contrast(1.1)';
    zone.element.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.4), 0 0 60px rgba(0, 255, 255, 0.4)';
    
    // Reset after flourish
    setTimeout(() => {
      zone.element.style.transform = 'translateZ(20px) scale(1.0)';
      zone.element.style.filter = '';
      zone.element.style.boxShadow = '';
    }, 2000);
  }
}

// Export for use by scroll master
window.ZonePacingController = ZonePacingController;
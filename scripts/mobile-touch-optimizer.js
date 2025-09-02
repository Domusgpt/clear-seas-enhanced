/*
 * MOBILE TOUCH OPTIMIZER
 * Advanced mobile touch handling with proper physics and reactivity
 */

class MobileTouchOptimizer {
  constructor(scrollMaster) {
    this.scrollMaster = scrollMaster;
    this.isMobile = this.detectMobile();
    this.touchState = {
      isActive: false,
      startY: 0,
      currentY: 0,
      startTime: 0,
      velocity: 0,
      direction: 'none',
      momentum: 0,
      inertiaRAF: null
    };
    
    this.mobileSettings = {
      scrollMultiplier: this.isMobile ? 0.4 : 1.0, // Much slower on mobile
      minSwipeDistance: 30,
      maxSwipeTime: 300,
      momentumDecay: 0.92,
      bounceThreshold: 100,
      zAxisSensitivity: 0.3
    };
    
    this.init();
  }
  
  init() {
    if (this.isMobile) {
      this.setupMobileTouchHandlers();
      this.optimizeMobileLayout();
      this.setupTouchVisualFeedback();
      console.log('📱 Mobile Touch Optimizer - Activated for mobile device');
    }
  }
  
  detectMobile() {
    // Comprehensive mobile detection
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const isUserAgentMobile = mobileRegex.test(navigator.userAgent);
    
    return isTouchDevice && (isSmallScreen || isUserAgentMobile);
  }
  
  setupMobileTouchHandlers() {
    // Override default scroll behavior with custom touch physics
    let touchStartData = null;
    
    // Passive touch start - just record data
    document.addEventListener('touchstart', (e) => {
      touchStartData = {
        y: e.touches[0].clientY,
        time: performance.now(),
        scrollY: window.scrollY
      };
      
      this.touchState.isActive = true;
      this.touchState.startY = e.touches[0].clientY;
      this.touchState.startTime = performance.now();
      
      // Add touch feedback class
      document.body.classList.add('touch-active');
      
      // Stop any ongoing inertia
      if (this.touchState.inertiaRAF) {
        cancelAnimationFrame(this.touchState.inertiaRAF);
        this.touchState.inertiaRAF = null;
      }
      
    }, { passive: true });
    
    // Active touch move - control scroll
    document.addEventListener('touchmove', (e) => {
      if (!touchStartData || !this.touchState.isActive) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartData.y - currentY;
      const currentTime = performance.now();
      const deltaTime = currentTime - touchStartData.time;
      
      // Calculate velocity
      this.touchState.velocity = deltaY / Math.max(deltaTime, 1);
      this.touchState.direction = deltaY > 0 ? 'up' : 'down';
      this.touchState.currentY = currentY;
      
      // Apply mobile scroll multiplier
      const adjustedDelta = deltaY * this.mobileSettings.scrollMultiplier;
      const newScrollY = Math.max(0, touchStartData.scrollY + adjustedDelta);
      
      // Smooth scroll update
      window.scrollTo(0, newScrollY);
      
      // Update touch data for next calculation
      touchStartData.y = currentY;
      touchStartData.time = currentTime;
      touchStartData.scrollY = newScrollY;
      
      // Trigger visual effects based on touch intensity
      this.updateTouchVisualEffects();
      
    }, { passive: false });
    
    // Touch end - apply momentum
    document.addEventListener('touchend', (e) => {
      if (!this.touchState.isActive) return;
      
      const endTime = performance.now();
      const touchDuration = endTime - this.touchState.startTime;
      const touchDistance = Math.abs(this.touchState.startY - this.touchState.currentY);
      
      this.touchState.isActive = false;
      document.body.classList.remove('touch-active');
      
      // Apply momentum if it was a swipe gesture
      if (touchDistance > this.mobileSettings.minSwipeDistance && 
          touchDuration < this.mobileSettings.maxSwipeTime) {
        this.applyMobileMomentum();
      }
      
      // Fade out touch effects
      this.fadeOutTouchEffects();
      
    }, { passive: true });
    
    // Prevent default scroll behavior on iOS
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }
  
  applyMobileMomentum() {
    const baseVelocity = Math.abs(this.touchState.velocity);
    let momentum = baseVelocity * 50 * this.mobileSettings.scrollMultiplier;
    const direction = this.touchState.direction === 'up' ? 1 : -1;
    
    const startScrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    
    // Momentum animation with physics
    const animateMomentum = () => {
      if (Math.abs(momentum) < 1) {
        this.touchState.inertiaRAF = null;
        return;
      }
      
      const newScrollY = Math.max(0, Math.min(maxScroll, window.scrollY + (momentum * direction)));
      window.scrollTo(0, newScrollY);
      
      // Apply decay
      momentum *= this.mobileSettings.momentumDecay;
      
      // Bounce at edges
      if (newScrollY <= 0 || newScrollY >= maxScroll) {
        momentum *= -0.3; // Reverse with damping
      }
      
      this.touchState.inertiaRAF = requestAnimationFrame(animateMomentum);
    };
    
    animateMomentum();
  }
  
  optimizeMobileLayout() {
    // Adjust section heights for mobile
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section, index) => {
      if (this.isMobile) {
        // Special mobile heights
        const mobileHeights = {
          0: '100vh',  // Hero - full screen
          1: '120vh',  // Technology
          2: '120vh',  // Portfolio
          3: '120vh',  // Research
          4: '100vh',  // About
          5: '100vh'   // Contact
        };
        
        section.style.minHeight = mobileHeights[index] || '120vh';
        
        // Add mobile-specific classes
        section.classList.add('mobile-optimized');
        
        // Apply Z-axis transforms for depth
        const zOffset = index * -30;
        const rotateX = Math.min(index * 0.5, 2);
        section.style.transform = `translateZ(${zOffset}px) rotateX(${rotateX}deg)`;
      }
    });
    
    // Enable 3D perspective on body
    if (this.isMobile) {
      document.body.style.perspective = '1000px';
      document.body.style.perspectiveOrigin = '50% 50%';
    }
  }
  
  setupTouchVisualFeedback() {
    // Create touch feedback overlay
    const touchOverlay = document.createElement('div');
    touchOverlay.className = 'mobile-touch-overlay';
    touchOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(touchOverlay);
    this.touchOverlay = touchOverlay;
    
    // Create touch particles system
    this.touchParticles = [];
  }
  
  updateTouchVisualEffects() {
    if (!this.isMobile || !this.touchState.isActive) return;
    
    const intensity = Math.min(Math.abs(this.touchState.velocity) * 0.01, 1.0);
    
    // Update current zone visual intensity
    if (this.scrollMaster.currentZone) {
      const currentSection = this.scrollMaster.currentZone.element;
      if (currentSection) {
        // Apply touch intensity to section
        const scale = 1 + (intensity * 0.02);
        const brightness = 1 + (intensity * 0.1);
        const blur = intensity * 2;
        
        currentSection.style.transform += ` scale(${scale})`;
        currentSection.style.filter = `brightness(${brightness}) blur(${blur}px)`;
        
        // Add glow effect
        currentSection.style.boxShadow = `0 0 ${intensity * 50}px rgba(0, 255, 255, ${intensity * 0.5})`;
      }
    }
    
    // Show touch overlay
    if (this.touchOverlay && intensity > 0.3) {
      this.touchOverlay.style.opacity = intensity * 0.3;
      this.touchOverlay.style.background = `
        radial-gradient(circle at 50% 50%, 
          rgba(0, 255, 255, ${intensity * 0.1}) 0%,
          transparent 70%)
      `;
    }
    
    // Create touch particles
    if (intensity > 0.5 && Math.random() > 0.7) {
      this.createTouchParticle();
    }
  }
  
  createTouchParticle() {
    const particle = document.createElement('div');
    particle.className = 'touch-particle';
    particle.style.cssText = `
      position: fixed;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      background: rgba(0, 255, 255, 0.8);
      border-radius: 50%;
      left: ${Math.random() * window.innerWidth}px;
      top: ${Math.random() * window.innerHeight}px;
      pointer-events: none;
      z-index: 9998;
      transform: translateZ(10px);
      animation: touchParticleFade 1.5s ease-out forwards;
    `;
    
    // Add particle animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes touchParticleFade {
        0% {
          opacity: 1;
          transform: translateZ(10px) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateZ(30px) scale(0.5) translateY(-50px);
        }
      }
    `;
    
    if (!document.head.querySelector('#touch-particle-style')) {
      style.id = 'touch-particle-style';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
      particle.remove();
    }, 1500);
  }
  
  fadeOutTouchEffects() {
    // Fade out touch overlay
    if (this.touchOverlay) {
      this.touchOverlay.style.opacity = '0';
    }
    
    // Reset section styles
    if (this.scrollMaster.currentZone) {
      const currentSection = this.scrollMaster.currentZone.element;
      if (currentSection) {
        setTimeout(() => {
          currentSection.style.filter = '';
          currentSection.style.boxShadow = '';
        }, 300);
      }
    }
  }
  
  // Enhanced zone transitions for mobile
  enhanceZoneTransition(oldZone, newZone) {
    if (!this.isMobile) return;
    
    // Mobile-specific zone transition effects
    if (oldZone && oldZone.element) {
      oldZone.element.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      oldZone.element.style.transform += ' translateZ(-100px) scale(0.95)';
      oldZone.element.style.opacity = '0.7';
    }
    
    if (newZone && newZone.element) {
      newZone.element.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      newZone.element.style.transform = newZone.element.style.transform.replace('translateZ(-100px) scale(0.95)', '');
      newZone.element.style.opacity = '1';
      
      // Add mobile entrance effect
      newZone.element.style.animation = 'mobileZoneEnter 0.8s ease-out';
    }
    
    // Add mobile zone transition styles
    this.addMobileTransitionStyles();
  }
  
  addMobileTransitionStyles() {
    if (document.head.querySelector('#mobile-transition-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mobile-transition-styles';
    style.textContent = `
      @keyframes mobileZoneEnter {
        0% {
          transform: translateZ(-50px) translateY(30px) scale(0.98);
          opacity: 0.6;
        }
        100% {
          transform: translateZ(0) translateY(0) scale(1);
          opacity: 1;
        }
      }
      
      .mobile-optimized {
        transform-style: preserve-3d;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      
      .mobile-optimized.zone-active {
        transform: translateZ(20px) !important;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Export for use by scroll master
window.MobileTouchOptimizer = MobileTouchOptimizer;
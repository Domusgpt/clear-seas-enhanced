/*
 * POLYTOPAL REACTIVITY JSON MANAGER v1.0
 * 
 * Advanced JSON-driven reactivity system for Clear Seas polytopal visualizers.
 * Handles sophisticated parameter operations like toComplementOf, pingPong, swapWith
 * with support for target/frame/siblings reaction patterns.
 */

class PolytopalReactivityManager {
  constructor() {
    this.systems = new Map();
    this.routes = [];
    this.activeElements = new Map();
    this.parameterHistory = new Map();
    this.isInitialized = false;
    
    this.loadConfiguration();
  }

  async loadConfiguration() {
    try {
      const response = await fetch('/assets/reactivity/faceted.json');
      const config = await response.json();
      
      // Store systems and routes
      Object.entries(config.systems).forEach(([name, system]) => {
        this.systems.set(name, system);
      });
      
      this.routes = config.routes || [];
      
      // Initialize DOM elements based on routes
      this.initializeRoutes();
      
      this.isInitialized = true;
      console.log('🎯 Polytopal Reactivity JSON Manager - Loaded', this.systems.size, 'systems');
      
    } catch (error) {
      console.error('Failed to load reactivity configuration:', error);
    }
  }

  initializeRoutes() {
    this.routes.forEach(route => {
      const elements = document.querySelectorAll(route.selector);
      
      elements.forEach(element => {
        const elementData = {
          element,
          route,
          system: this.systems.get(route.system),
          originalParams: this.captureOriginalParams(route.system),
          activeReactions: new Set()
        };
        
        this.setupElementListeners(elementData);
        this.activeElements.set(element, elementData);
      });
    });
  }

  setupElementListeners(elementData) {
    const { element, system } = elementData;
    
    if (!system?.reactivity?.events) return;
    
    Object.entries(system.reactivity.events).forEach(([eventType, reactions]) => {
      const [eventName] = eventType.split(':');
      
      if (eventName === 'card' || eventName === 'button') {
        this.setupCardOrButtonEvents(element, eventType, reactions, elementData);
      }
    });
  }

  setupCardOrButtonEvents(element, eventType, reactions, elementData) {
    const [, action] = eventType.split(':');
    
    switch (action) {
      case 'hover':
        element.addEventListener('mouseenter', () => {
          this.executeReactions(reactions, elementData, eventType);
        });
        break;
        
      case 'leave':
        element.addEventListener('mouseleave', () => {
          this.executeReactions(reactions, elementData, eventType);
        });
        break;
        
      case 'click':
        element.addEventListener('click', () => {
          this.executeReactions(reactions, elementData, eventType);
        });
        break;
    }
  }

  executeReactions(reactions, elementData, eventType) {
    const { element, system, route } = elementData;
    
    // Process target reactions (the element itself)
    if (reactions.target) {
      this.applyTargetReactions(element, reactions.target, system, eventType);
    }
    
    // Process frame reactions (background visualizer)
    if (reactions.frame) {
      this.applyFrameReactions(reactions.frame, system, route, eventType);
    }
    
    // Process sibling reactions (other elements in same scene)
    if (reactions.siblings) {
      this.applySiblingReactions(element, reactions.siblings, route, eventType);
    }
  }

  applyTargetReactions(element, targetReactions, system, eventType) {
    // Handle visual parameter changes
    if (targetReactions.visual) {
      Object.entries(targetReactions.visual).forEach(([param, operation]) => {
        this.applyParameterOperation(element, 'visual', param, operation, system);
      });
    }
    
    // Handle color parameter changes
    if (targetReactions.color) {
      Object.entries(targetReactions.color).forEach(([param, operation]) => {
        this.applyParameterOperation(element, 'color', param, operation, system);
      });
    }
    
    // Handle rot4d parameter changes
    if (targetReactions.rot4d) {
      Object.entries(targetReactions.rot4d).forEach(([param, operation]) => {
        this.applyParameterOperation(element, 'rot4d', param, operation, system);
      });
    }
    
    // Handle reset operations
    if (targetReactions.reset) {
      this.resetElementToDefaults(element, system, targetReactions);
    }
  }

  applyParameterOperation(element, namespace, param, operation, system) {
    const currentValue = this.getCurrentParameterValue(element, namespace, param, system);
    const newValue = this.calculateParameterValue(currentValue, operation, system, namespace, param);
    
    // Apply to visualizer if element has one
    const visualizer = this.findElementVisualizer(element);
    if (visualizer) {
      this.updateVisualizerParameter(visualizer, namespace, param, newValue, operation);
    }
    
    // Store parameter change for reference
    this.recordParameterChange(element, namespace, param, currentValue, newValue);
  }

  calculateParameterValue(currentValue, operation, system, namespace, param) {
    if (typeof operation === 'object') {
      // Complex operation object
      if (operation.to !== undefined) {
        return operation.to;
      }
      
      if (operation.mul !== undefined) {
        return currentValue * operation.mul;
      }
      
      if (operation.toComplementOf) {
        const targetValue = this.resolveParameterReference(operation.toComplementOf, system);
        if (param === 'hue') {
          return (targetValue + 180) % 360;
        }
        return Math.abs(1 - targetValue); // For normalized values
      }
      
      if (operation.toInverseOf) {
        const targetValue = this.resolveParameterReference(operation.toInverseOf, system);
        return 1 / Math.max(targetValue, 0.001); // Prevent division by zero
      }
      
      if (operation.pingPong) {
        const [high, low] = operation.pingPong;
        const duration = operation.ms || 300;
        this.createPingPongAnimation(currentValue, high, low, duration);
        return high; // Start with high value
      }
      
      if (operation.swapWith) {
        const targetValue = this.resolveParameterReference(operation.swapWith, system);
        return targetValue;
      }
      
      if (operation.pingPongInverseOf) {
        const targetValue = this.resolveParameterReference(operation.pingPongInverseOf, system);
        const inverse = 1 / Math.max(targetValue, 0.001);
        const multiplier = operation.mul || 1;
        return inverse * multiplier;
      }
      
    } else {
      // Simple value
      return operation;
    }
    
    return currentValue;
  }

  resolveParameterReference(reference, system) {
    const parts = reference.split('.');
    let current = system.base;
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        console.warn('Could not resolve parameter reference:', reference);
        return 0;
      }
    }
    
    return current;
  }

  createPingPongAnimation(startValue, high, low, duration) {
    const steps = 60; // 60fps assumption
    const stepDuration = duration / steps;
    let currentStep = 0;
    let goingUp = true;
    
    const animate = () => {
      const progress = currentStep / (steps / 2);
      const easeProgress = this.easeInOutCubic(progress);
      
      const value = goingUp 
        ? startValue + (high - startValue) * easeProgress
        : high - (high - low) * easeProgress;
      
      // Apply value to visualizer
      // (This would connect to your VIB34D system)
      
      currentStep++;
      
      if (currentStep >= steps / 2) {
        if (goingUp) {
          goingUp = false;
          currentStep = 0;
        } else {
          return; // Animation complete
        }
      }
      
      setTimeout(animate, stepDuration);
    };
    
    animate();
  }

  applyFrameReactions(frameReactions, system, route, eventType) {
    // Find the hero/background visualizer for this scene
    const frameVisualizer = this.findFrameVisualizer(route.scene);
    
    if (frameVisualizer) {
      // Apply visual changes to frame
      if (frameReactions.visual) {
        Object.entries(frameReactions.visual).forEach(([param, operation]) => {
          const currentValue = this.getCurrentFrameParameter(frameVisualizer, param);
          const newValue = this.calculateParameterValue(currentValue, operation, system, 'visual', param);
          this.updateVisualizerParameter(frameVisualizer, 'visual', param, newValue, operation);
        });
      }
      
      // Apply color changes to frame
      if (frameReactions.color) {
        Object.entries(frameReactions.color).forEach(([param, operation]) => {
          const currentValue = this.getCurrentFrameParameter(frameVisualizer, param);
          const newValue = this.calculateParameterValue(currentValue, operation, system, 'color', param);
          this.updateVisualizerParameter(frameVisualizer, 'color', param, newValue, operation);
        });
      }
    }
  }

  applySiblingReactions(triggerElement, siblingReactions, route, eventType) {
    // Find sibling elements in same scene
    const siblings = this.findSiblingElements(triggerElement, route.scene);
    
    siblings.forEach(sibling => {
      if (siblingReactions.visual) {
        Object.entries(siblingReactions.visual).forEach(([param, operation]) => {
          if (param === 'intensity') {
            // Apply opacity/intensity changes to sibling elements
            const currentOpacity = parseFloat(getComputedStyle(sibling).opacity) || 1;
            const newOpacity = this.calculateParameterValue(currentOpacity, operation, null, 'visual', param);
            sibling.style.opacity = newOpacity;
          }
        });
      }
      
      // Handle reset for siblings
      if (siblingReactions.reset) {
        this.resetSiblingElement(sibling, siblingReactions);
      }
    });
  }

  findElementVisualizer(element) {
    // Look for iframe with VIB34D visualizer inside element
    const iframe = element.querySelector('iframe[src*="vib34d"]');
    if (iframe) {
      return {
        type: 'iframe',
        element: iframe,
        id: element.id || 'unnamed'
      };
    }
    
    // Look for canvas element for other visualizer types
    const canvas = element.querySelector('canvas');
    if (canvas) {
      return {
        type: 'canvas',
        element: canvas,
        id: element.id || 'unnamed'
      };
    }
    
    return null;
  }

  findFrameVisualizer(scene) {
    // Find the main hero/background visualizer for the scene
    const heroSection = document.querySelector('.hero-section, .hero-visualizer, [data-scene="' + scene + '"]');
    if (heroSection) {
      const iframe = heroSection.querySelector('iframe[src*="vib34d"]');
      if (iframe) {
        return {
          type: 'iframe',
          element: iframe,
          id: 'hero-' + scene
        };
      }
    }
    
    return null;
  }

  findSiblingElements(triggerElement, scene) {
    // Find other reactive elements in the same scene
    const sceneContainer = triggerElement.closest('[data-scene="' + scene + '"], section');
    if (!sceneContainer) return [];
    
    const siblings = [];
    this.activeElements.forEach((elementData, element) => {
      if (element !== triggerElement && 
          sceneContainer.contains(element) &&
          elementData.route.scene === scene) {
        siblings.push(element);
      }
    });
    
    return siblings;
  }

  updateVisualizerParameter(visualizer, namespace, param, value, operation) {
    if (visualizer.type === 'iframe') {
      // Update VIB34D iframe parameters
      this.updateVIB34DParameter(visualizer.element, namespace, param, value, operation);
    } else if (visualizer.type === 'canvas') {
      // Update canvas-based visualizer
      this.updateCanvasParameter(visualizer.element, namespace, param, value, operation);
    }
  }

  updateVIB34DParameter(iframe, namespace, param, value, operation) {
    try {
      const url = new URL(iframe.src);
      const paramName = namespace === 'visual' ? param : `${namespace}_${param}`;
      
      // Handle smooth transitions for parameters with timing
      if (typeof operation === 'object' && operation.ms) {
        const currentValue = parseFloat(url.searchParams.get(paramName)) || 0;
        this.createSmoothTransition(iframe, paramName, currentValue, value, operation.ms, operation.ease);
      } else {
        url.searchParams.set(paramName, value);
        iframe.src = url.toString();
      }
    } catch (error) {
      console.warn('Error updating VIB34D parameter:', error);
    }
  }

  createSmoothTransition(iframe, paramName, startValue, endValue, duration, easing = 'linear') {
    const steps = Math.max(duration / 16, 10); // ~60fps, minimum 10 steps
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const animate = () => {
      const progress = currentStep / steps;
      const easedProgress = this.applyEasing(progress, easing);
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      try {
        const url = new URL(iframe.src);
        url.searchParams.set(paramName, currentValue.toFixed(3));
        iframe.src = url.toString();
      } catch (error) {
        return; // Stop animation on error
      }
      
      currentStep++;
      if (currentStep <= steps) {
        setTimeout(animate, stepDuration);
      }
    };
    
    animate();
  }

  applyEasing(t, easing) {
    switch (easing) {
      case 'expoOut':
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      case 'backOut':
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      case 'expoIn':
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
      default:
        return t; // linear
    }
  }

  getCurrentParameterValue(element, namespace, param, system) {
    // Try to get current value from visualizer
    const visualizer = this.findElementVisualizer(element);
    if (visualizer && visualizer.type === 'iframe') {
      try {
        const url = new URL(visualizer.element.src);
        const paramName = namespace === 'visual' ? param : `${namespace}_${param}`;
        const value = url.searchParams.get(paramName);
        if (value !== null) {
          return parseFloat(value);
        }
      } catch (error) {
        // Fall through to default value
      }
    }
    
    // Fall back to system base values
    const basePath = system.base[namespace];
    return basePath ? basePath[param] || 0 : 0;
  }

  getCurrentFrameParameter(visualizer, param) {
    if (visualizer && visualizer.type === 'iframe') {
      try {
        const url = new URL(visualizer.element.src);
        const value = url.searchParams.get(param);
        if (value !== null) {
          return parseFloat(value);
        }
      } catch (error) {
        // Fall through to default
      }
    }
    return 0;
  }

  resetElementToDefaults(element, system, resetConfig) {
    const visualizer = this.findElementVisualizer(element);
    if (!visualizer) return;
    
    const duration = resetConfig.ms || 500;
    const easing = resetConfig.ease || 'expoOut';
    
    // Reset visual parameters
    if (system.base.visual) {
      Object.entries(system.base.visual).forEach(([param, defaultValue]) => {
        const currentValue = this.getCurrentParameterValue(element, 'visual', param, system);
        this.createSmoothTransition(visualizer.element, param, currentValue, defaultValue, duration, easing);
      });
    }
    
    // Reset color parameters
    if (system.base.color) {
      Object.entries(system.base.color).forEach(([param, defaultValue]) => {
        const currentValue = this.getCurrentParameterValue(element, 'color', param, system);
        this.createSmoothTransition(visualizer.element, `color_${param}`, currentValue, defaultValue, duration, easing);
      });
    }
    
    // Reset rot4d parameters
    if (system.base.rot4d) {
      Object.entries(system.base.rot4d).forEach(([param, defaultValue]) => {
        const currentValue = this.getCurrentParameterValue(element, 'rot4d', param, system);
        this.createSmoothTransition(visualizer.element, `rot4d_${param}`, currentValue, defaultValue, duration, easing);
      });
    }
  }

  resetSiblingElement(sibling, resetConfig) {
    const duration = resetConfig.ms || 300;
    
    // Reset opacity
    if (sibling.style.opacity !== '') {
      const startOpacity = parseFloat(sibling.style.opacity);
      this.animateProperty(sibling, 'opacity', startOpacity, 1, duration);
    }
    
    // Reset transform
    if (sibling.style.transform !== '') {
      this.animateProperty(sibling, 'transform', sibling.style.transform, '', duration);
    }
  }

  animateProperty(element, property, startValue, endValue, duration) {
    const steps = duration / 16; // ~60fps
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const animate = () => {
      const progress = currentStep / steps;
      const easedProgress = this.easeInOutCubic(progress);
      
      if (property === 'opacity') {
        const value = startValue + (endValue - startValue) * easedProgress;
        element.style.opacity = value;
      } else if (property === 'transform') {
        if (endValue === '') {
          const scale = 1 - (1 - 1) * easedProgress; // Always animate to scale(1)
          element.style.transform = startValue; // Keep transform until end
          if (currentStep >= steps) {
            element.style.transform = '';
          }
        }
      }
      
      currentStep++;
      if (currentStep <= steps) {
        setTimeout(animate, stepDuration);
      }
    };
    
    animate();
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  captureOriginalParams(systemName) {
    const system = this.systems.get(systemName);
    return system ? JSON.parse(JSON.stringify(system.base)) : {};
  }

  recordParameterChange(element, namespace, param, oldValue, newValue) {
    const key = `${element.id || 'unnamed'}_${namespace}_${param}`;
    this.parameterHistory.set(key, { oldValue, newValue, timestamp: Date.now() });
  }

  // Public API for debugging and external control
  triggerElementReaction(elementId, eventType) {
    const elements = Array.from(this.activeElements.keys());
    const element = elements.find(el => el.id === elementId);
    
    if (element) {
      const elementData = this.activeElements.get(element);
      const reactions = elementData.system?.reactivity?.events?.[eventType];
      
      if (reactions) {
        this.executeReactions(reactions, elementData, eventType);
      }
    }
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      systemCount: this.systems.size,
      routeCount: this.routes.length,
      activeElementCount: this.activeElements.size
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.polytopalReactivity = new PolytopalReactivityManager();
  
  // Global debugging interface
  window.triggerReaction = (elementId, eventType) => {
    window.polytopalReactivity.triggerElementReaction(elementId, eventType);
  };
  
  window.getReactivityStatus = () => {
    return window.polytopalReactivity.getSystemStatus();
  };
  
  console.log('🔮 Polytopal Reactivity JSON Manager - System initialized');
});
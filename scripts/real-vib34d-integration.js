/**
 * REAL VIB34D INTEGRATION
 * Embeds the actual VIB34D Ultimate Viewer system
 * Uses the real 4-system architecture with proper shaders and geometries
 */

class RealVIB34DIntegration {
    constructor() {
        this.visualizers = new Map();
        this.isInitialized = false;
        this.baseURL = 'https://domusgpt.github.io/vib34d-ultimate-viewer';
        this.systemConfigs = {
            'FACETED': { geometry: 0, gridDensity: 15, morphFactor: 1.0, chaos: 0.2, speed: 1.0, hue: 280, intensity: 0.8, saturation: 0.6 },
            'QUANTUM': { geometry: 3, gridDensity: 25, morphFactor: 2.0, chaos: 0.4, speed: 1.2, hue: 60, intensity: 1.1, saturation: 0.9 },
            'HOLOGRAPHIC': { geometry: 2, gridDensity: 18, morphFactor: 1.6, chaos: 0.35, speed: 0.8, hue: 150, intensity: 0.9, saturation: 0.7 },
            'POLYCHORA': { geometry: 7, gridDensity: 30, morphFactor: 1.8, chaos: 0.5, speed: 1.5, hue: 200, intensity: 1.2, saturation: 1.0 }
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Real VIB34D Integration...');
        
        // Replace all existing iframes and canvases with proper VIB34D embeds
        await this.replaceVisualizerElements();
        
        this.isInitialized = true;
        console.log('✅ Real VIB34D Integration Complete!');
    }

    async replaceVisualizerElements() {
        // Find all canvas elements that were created by the previous system
        const canvases = document.querySelectorAll('canvas[id*="vib34d"], canvas[id*="hero"]');
        
        canvases.forEach((canvas, index) => {
            this.replaceWithRealVIB34D(canvas, index);
        });

        // Also find remaining iframes that might not have been processed
        const iframes = document.querySelectorAll('iframe[src*="vib34d"]');
        iframes.forEach((iframe, index) => {
            this.updateIframeWithRealVIB34D(iframe, index);
        });
    }

    replaceWithRealVIB34D(element, index) {
        const systemType = this.determineSystemType(element.id, index);
        const params = this.getSystemParameters(systemType);
        
        // Create proper iframe element with real VIB34D
        const iframe = document.createElement('iframe');
        iframe.id = element.id;
        iframe.className = element.className || 'vib34d-visualizer';
        iframe.style.cssText = element.style.cssText || 'width: 100%; height: 100%; border: none; border-radius: 8px;';
        
        // Build URL with proper parameters and system specification
        const url = this.buildVIB34DURL(params, systemType);
        iframe.src = url;
        
        // Set proper iframe attributes
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; fullscreen";
        iframe.loading = "lazy";
        
        // Replace the element
        element.parentNode.replaceChild(iframe, element);
        
        // Store reference
        this.visualizers.set(iframe.id, {
            element: iframe,
            system: systemType,
            params: params
        });
        
        console.log(`✨ Replaced ${element.id} with real VIB34D system: ${systemType}`, params);
    }

    updateIframeWithRealVIB34D(iframe, index) {
        const systemType = this.determineSystemType(iframe.id, index);
        const params = this.getSystemParameters(systemType);
        
        // Update existing iframe with proper system and parameters
        const url = this.buildVIB34DURL(params, systemType);
        iframe.src = url;
        
        // Ensure proper attributes
        if (!iframe.frameBorder) iframe.frameBorder = "0";
        if (!iframe.allow) iframe.allow = "autoplay; fullscreen";
        
        // Store reference
        this.visualizers.set(iframe.id, {
            element: iframe,
            system: systemType,
            params: params
        });
        
        console.log(`🔄 Updated ${iframe.id} with real VIB34D system: ${systemType}`, params);
    }

    determineSystemType(elementId, index) {
        // Determine which VIB34D system to use based on element ID and position
        if (elementId.includes('hero-primary') || index === 0) {
            return 'FACETED';
        } else if (elementId.includes('hero-secondary') || index === 1) {
            return 'POLYCHORA';
        } else if (elementId.includes('canvas-0') || index === 2) {
            return 'FACETED';
        } else if (elementId.includes('canvas-1') || index === 3) {
            return 'QUANTUM';
        } else if (elementId.includes('canvas-2') || index === 4) {
            return 'HOLOGRAPHIC';
        } else if (elementId.includes('canvas-3') || index === 5) {
            return 'POLYCHORA';
        } else if (elementId.includes('canvas-4') || index === 6) {
            return 'QUANTUM';
        } else if (elementId.includes('canvas-5') || index === 7) {
            return 'HOLOGRAPHIC';
        } else if (elementId.includes('canvas-6') || index === 8) {
            return 'POLYCHORA';
        }
        
        // Default fallback with variety
        const systems = ['FACETED', 'QUANTUM', 'HOLOGRAPHIC', 'POLYCHORA'];
        return systems[index % systems.length];
    }

    getSystemParameters(systemType) {
        const baseConfig = this.systemConfigs[systemType] || this.systemConfigs['FACETED'];
        
        // Add some variation to avoid identical visualizers
        const variation = Math.random() * 0.3 - 0.15; // ±15% variation
        
        return {
            ...baseConfig,
            gridDensity: Math.max(5, baseConfig.gridDensity + Math.floor(variation * 20)),
            morphFactor: Math.max(0.1, baseConfig.morphFactor + variation),
            speed: Math.max(0.1, baseConfig.speed + variation * 0.5),
            hue: (baseConfig.hue + Math.floor(variation * 60) + 360) % 360
        };
    }

    buildVIB34DURL(params, systemType) {
        const url = new URL(this.baseURL);
        
        // Add all parameters
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value.toString());
        });
        
        // Add system-specific parameters
        url.searchParams.set('system', systemType.toLowerCase());
        url.searchParams.set('embed', 'true');
        url.searchParams.set('controls', 'hidden');
        url.searchParams.set('ui', 'minimal');
        
        return url.toString();
    }

    // Methods for totalistic reactivity integration
    updateVisualizer(visualizerId, newParams, systemType = null) {
        const visualizer = this.visualizers.get(visualizerId);
        if (!visualizer) {
            console.warn(`Visualizer not found: ${visualizerId}`);
            return;
        }

        // Update parameters
        const updatedParams = { ...visualizer.params, ...newParams };
        const targetSystem = systemType || visualizer.system;
        
        // Rebuild URL with new parameters
        const newURL = this.buildVIB34DURL(updatedParams, targetSystem);
        
        // Update iframe source
        visualizer.element.src = newURL;
        visualizer.params = updatedParams;
        visualizer.system = targetSystem;
        
        console.log(`🎛️ Updated visualizer ${visualizerId}:`, updatedParams);
    }

    switchSystem(visualizerId, newSystemType) {
        const systemParams = this.getSystemParameters(newSystemType);
        this.updateVisualizer(visualizerId, systemParams, newSystemType);
    }

    getAllVisualizers() {
        return Array.from(this.visualizers.values());
    }

    getVisualizerBySystem(systemType) {
        return Array.from(this.visualizers.values()).filter(v => v.system === systemType);
    }

    // Enhanced reactivity for totalistic system
    triggerSystemwideReaction(focusedSystem, intensity = 1.0) {
        this.visualizers.forEach((visualizer, id) => {
            if (visualizer.system === focusedSystem) {
                // Enhance the focused system
                this.updateVisualizer(id, {
                    intensity: Math.min(2.0, visualizer.params.intensity * (1.0 + intensity * 0.5)),
                    speed: Math.min(3.0, visualizer.params.speed * (1.0 + intensity * 0.3)),
                    morphFactor: Math.min(3.0, visualizer.params.morphFactor * (1.0 + intensity * 0.4))
                });
            } else {
                // Dim other systems
                this.updateVisualizer(id, {
                    intensity: Math.max(0.3, visualizer.params.intensity * (1.0 - intensity * 0.3)),
                    speed: Math.max(0.2, visualizer.params.speed * (1.0 - intensity * 0.2))
                });
            }
        });
    }

    resetAllVisualizers() {
        this.visualizers.forEach((visualizer, id) => {
            const originalParams = this.getSystemParameters(visualizer.system);
            this.updateVisualizer(id, originalParams);
        });
    }
}

// Global instance
window.realVIB34D = new RealVIB34DIntegration();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.realVIB34D.initialize();
    });
} else {
    window.realVIB34D.initialize();
}

export { RealVIB34DIntegration };
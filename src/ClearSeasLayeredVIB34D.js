/**
 * CLEAR SEAS LAYERED VIB34D SYSTEM
 * Real 5-layer architecture with morphing, blending, and unique effects
 * Built like your actual VIB34D system - no more single canvas bullshit
 */

class ClearSeasLayeredVIB34D {
    constructor() {
        this.visualizers = new Map();
        this.isInitialized = false;
        this.layerNames = ['background', 'shadow', 'content', 'highlight', 'accent'];
        
        // System configurations with unique morphing patterns
        this.systemConfigs = {
            FACETED: {
                baseGeometry: 0,
                morphingPattern: 'crystalline',
                colorScheme: {
                    background: [0.15, 0.05, 0.25, 0.3], // Deep purple
                    shadow: [0.3, 0.1, 0.5, 0.6],
                    content: [0.8, 0.3, 0.9, 0.9], // Bright purple
                    highlight: [0.95, 0.7, 1.0, 0.8],
                    accent: [1.0, 0.9, 1.0, 0.5]
                },
                animations: {
                    morphSpeed: 1.2,
                    rotationSpeed: 0.8,
                    pulseFreq: 0.5
                }
            },
            QUANTUM: {
                baseGeometry: 3,
                morphingPattern: 'lattice_wave',
                colorScheme: {
                    background: [0.1, 0.15, 0.05, 0.3], // Dark green
                    shadow: [0.2, 0.4, 0.1, 0.6],
                    content: [0.4, 0.9, 0.2, 0.9], // Bright green
                    highlight: [0.7, 1.0, 0.5, 0.8],
                    accent: [0.9, 1.0, 0.8, 0.5]
                },
                animations: {
                    morphSpeed: 2.0,
                    rotationSpeed: 1.5,
                    pulseFreq: 1.2
                }
            },
            HOLOGRAPHIC: {
                baseGeometry: 2,
                morphingPattern: 'holographic_shimmer',
                colorScheme: {
                    background: [0.05, 0.2, 0.25, 0.3], // Deep cyan
                    shadow: [0.1, 0.4, 0.5, 0.6],
                    content: [0.2, 0.8, 0.9, 0.9], // Bright cyan
                    highlight: [0.5, 0.95, 1.0, 0.8],
                    accent: [0.8, 1.0, 1.0, 0.5]
                },
                animations: {
                    morphSpeed: 1.8,
                    rotationSpeed: 1.2,
                    pulseFreq: 0.8
                }
            },
            POLYCHORA: {
                baseGeometry: 7,
                morphingPattern: 'hyperdimensional',
                colorScheme: {
                    background: [0.25, 0.15, 0.05, 0.3], // Deep orange
                    shadow: [0.5, 0.3, 0.1, 0.6],
                    content: [0.9, 0.6, 0.2, 0.9], // Bright orange
                    highlight: [1.0, 0.8, 0.5, 0.8],
                    accent: [1.0, 0.95, 0.8, 0.5]
                },
                animations: {
                    morphSpeed: 2.5,
                    rotationSpeed: 2.0,
                    pulseFreq: 1.5
                }
            }
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Clear Seas Layered VIB34D System...');
        
        // Find all visualization containers
        await this.createLayeredVisualizerSystem();
        
        this.isInitialized = true;
        console.log('✅ Layered VIB34D System Ready with Morphing Effects!');
    }

    async createLayeredVisualizerSystem() {
        // Find ALL containers that need VIB34D - including any existing canvases or iframes
        const containers = [
            ...document.querySelectorAll('.card-visualizer'),
            ...document.querySelectorAll('.hero-visualizer'),
            ...document.querySelectorAll('iframe[src*="vib34d"]'),
            ...document.querySelectorAll('canvas[id*="vib34d"], canvas[id*="hero"]')
        ];
        
        // Remove duplicates and ensure we get all visualizer locations
        const uniqueContainers = Array.from(new Set(containers));
        
        console.log(`🎯 Found ${uniqueContainers.length} visualizer locations to process`);
        
        uniqueContainers.forEach((container, index) => {
            // Replace iframe/canvas with proper container if needed
            const actualContainer = this.ensureProperContainer(container);
            const systemType = this.determineSystemType(actualContainer, index);
            this.createLayeredVisualizer(actualContainer, systemType, index);
        });
    }

    ensureProperContainer(element) {
        // If it's an iframe or canvas, we need to replace it or wrap it
        if (element.tagName === 'IFRAME' || element.tagName === 'CANVAS') {
            // Create a proper container div
            const container = document.createElement('div');
            container.className = 'card-visualizer layered-vib34d-container';
            container.style.cssText = element.style.cssText || 'width: 100%; height: 100%;';
            
            // Preserve the ID if it exists
            if (element.id) {
                container.id = element.id + '-container';
            }
            
            // Replace the element with our container
            element.parentNode.replaceChild(container, element);
            return container;
        }
        
        return element;
    }

    determineSystemType(container, index) {
        const id = container.id || container.parentElement?.id || '';
        
        if (id.includes('hero-primary') || id.includes('faceted')) return 'FACETED';
        if (id.includes('hero-secondary') || id.includes('quantum')) return 'QUANTUM';  
        if (id.includes('holographic')) return 'HOLOGRAPHIC';
        if (id.includes('polychora')) return 'POLYCHORA';
        
        // Distribute systems with variety
        const systems = ['FACETED', 'QUANTUM', 'HOLOGRAPHIC', 'POLYCHORA'];
        return systems[index % systems.length];
    }

    createLayeredVisualizer(container, systemType, index) {
        // Clear existing content
        container.innerHTML = '';
        
        // Create 5-layer canvas stack
        const layerStack = document.createElement('div');
        layerStack.className = 'vib34d-layer-stack';
        layerStack.style.cssText = 'position: relative; width: 100%; height: 100%; overflow: hidden;';
        
        const layers = {};
        const visualizerId = `vib34d-${systemType.toLowerCase()}-${index}`;
        
        this.layerNames.forEach((layerName, layerIndex) => {
            const canvas = document.createElement('canvas');
            canvas.id = `${visualizerId}-${layerName}`;
            canvas.className = `vib34d-layer vib34d-${layerName}-layer`;
            canvas.style.cssText = `
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                z-index: ${layerIndex + 1};
                mix-blend-mode: ${this.getBlendMode(layerName)};
                pointer-events: none;
            `;
            
            layerStack.appendChild(canvas);
            layers[layerName] = canvas;
        });
        
        container.appendChild(layerStack);
        
        // Create layered visualizer instance
        const layeredViz = new LayeredVIB34DVisualizer(layers, systemType, this.systemConfigs[systemType]);
        
        this.visualizers.set(visualizerId, {
            visualizer: layeredViz,
            container: container,
            layers: layers,
            systemType: systemType
        });
        
        console.log(`✨ Created layered ${systemType} visualizer: ${visualizerId}`);
    }

    getBlendMode(layerName) {
        const blendModes = {
            background: 'normal',
            shadow: 'multiply',
            content: 'screen',
            highlight: 'overlay',
            accent: 'soft-light'
        };
        return blendModes[layerName] || 'normal';
    }

    // Totalistic system reactions
    triggerSystemMorphing(focusedSystem, intensity = 1.0) {
        this.visualizers.forEach((viz, id) => {
            if (viz.systemType === focusedSystem) {
                viz.visualizer.enhanceSystem(intensity);
            } else {
                viz.visualizer.dimSystem(intensity * 0.6);
            }
        });
    }

    switchHeroSystem(systemType) {
        this.visualizers.forEach((viz, id) => {
            if (id.includes('hero') || id.includes('0')) {
                viz.visualizer.morphToSystem(systemType);
            }
        });
    }

    resetAllSystems() {
        this.visualizers.forEach((viz, id) => {
            viz.visualizer.resetToDefaults();
        });
    }
}

class LayeredVIB34DVisualizer {
    constructor(layers, systemType, config) {
        this.layers = layers;
        this.systemType = systemType;
        this.config = config;
        this.contexts = {};
        this.programs = {};
        this.startTime = Date.now();
        this.animationId = null;
        this.morphState = {
            intensity: 1.0,
            morphProgress: 0.0,
            targetSystem: systemType
        };
        
        this.initializeLayers();
        this.startMorphingAnimation();
    }

    initializeLayers() {
        this.layerNames = ['background', 'shadow', 'content', 'highlight', 'accent'];
        
        this.layerNames.forEach(layerName => {
            const canvas = this.layers[layerName];
            this.setupLayerWebGL(canvas, layerName);
        });
    }

    setupLayerWebGL(canvas, layerName) {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
            console.warn(`WebGL not available for ${layerName} layer`);
            return;
        }
        
        this.contexts[layerName] = gl;
        this.resizeCanvas(canvas, gl);
        
        // Layer-specific WebGL setup
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        const layerColor = this.config.colorScheme[layerName];
        gl.clearColor(layerColor[0], layerColor[1], layerColor[2], layerColor[3]);
        
        // Create layer-specific shader program
        this.programs[layerName] = this.createLayerShaderProgram(gl, layerName);
        
        window.addEventListener('resize', () => this.resizeCanvas(canvas, gl));
    }

    resizeCanvas(canvas, gl) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    createLayerShaderProgram(gl, layerName) {
        const vertexShader = `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;

        const fragmentShader = this.generateLayerFragmentShader(layerName);
        
        const vs = this.compileShader(gl, gl.VERTEX_SHADER, vertexShader);
        const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
        
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader program failed to link:', gl.getProgramInfoLog(program));
        }
        
        return program;
    }

    generateLayerFragmentShader(layerName) {
        return `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_layer;
            uniform float u_morphProgress;
            uniform float u_intensity;
            uniform vec4 u_layerColor;
            uniform float u_geometryType;

            // Advanced 4D rotation matrices
            mat3 rotateX(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
            }

            mat3 rotateY(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
            }

            mat3 rotateZ(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
            }

            // Layer-specific distance functions
            float ${layerName}Distance(vec3 p) {
                p *= rotateX(u_time * 0.001) * rotateY(u_time * 0.0007) * rotateZ(u_time * 0.0013);
                
                ${this.getLayerSpecificMath(layerName)}
                
                return d;
            }

            // Advanced morphing between systems
            float morphingDistance(vec3 p) {
                float d1 = ${layerName}Distance(p);
                float d2 = ${layerName}Distance(p * 1.3 + vec3(0.5));
                
                return mix(d1, d2, sin(u_morphProgress * 3.14159) * 0.5 + 0.5);
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                
                vec3 rayDir = normalize(vec3(uv, 1.0));
                vec3 rayPos = vec3(0.0, 0.0, -3.0);
                
                float totalDistance = 0.0;
                float minDistance = 1000.0;
                
                // Ray marching with morphing
                for(int i = 0; i < 80; i++) {
                    vec3 pos = rayPos + rayDir * totalDistance;
                    float d = morphingDistance(pos);
                    
                    minDistance = min(minDistance, d);
                    
                    if(d < 0.01 || totalDistance > 15.0) break;
                    totalDistance += d * 0.8;
                }
                
                // Layer-specific rendering
                float intensity = 1.0 / (1.0 + minDistance * ${this.getLayerIntensityMultiplier(layerName)});
                intensity = pow(intensity, ${this.getLayerPower(layerName)}) * u_intensity;
                
                // Morphing color effects
                vec4 baseColor = u_layerColor;
                vec4 morphColor = vec4(baseColor.rgb * 1.5, baseColor.a);
                vec4 finalColor = mix(baseColor, morphColor, u_morphProgress);
                
                finalColor.rgb *= intensity;
                finalColor.rgb += ${this.getLayerGlowEffect(layerName)};
                
                gl_FragColor = finalColor;
            }
        `;
    }

    getLayerSpecificMath(layerName) {
        const mathFunctions = {
            background: `
                vec3 q = fract(p * 0.1) - 0.5;
                float d = length(q) - 0.4;
                d += sin(p.x * 5.0 + u_time * 0.001) * sin(p.y * 5.0) * 0.1;
            `,
            shadow: `
                vec3 q = abs(fract(p * 0.08) - 0.5);
                float d = max(max(q.x, q.y), q.z) - 0.3;
                d += cos(p.z * 8.0 + u_time * 0.0015) * 0.08;
            `,
            content: `
                vec3 q = p * 0.06;
                float d = 1000.0;
                for(int i = 0; i < 4; i++) {
                    q = abs(q) - 1.0;
                    q *= 0.9;
                    d = min(d, length(q) - 0.5);
                }
                d += sin(u_time * 0.002) * 0.1;
            `,
            highlight: `
                vec2 h = vec2(sin(p.x * 3.0 + u_time * 0.003), cos(p.y * 3.0));
                vec3 q = vec3(h, p.z) * 0.12;
                float d = length(q) - 0.6;
                d += sin(length(p) * 10.0 + u_time * 0.002) * 0.05;
            `,
            accent: `
                float spiral = atan(p.y, p.x) + length(p.xy) * 5.0 + u_time * 0.005;
                vec3 q = vec3(p.xy, p.z + sin(spiral) * 0.2) * 0.15;
                float d = abs(length(q.xy) - 0.5) - 0.1;
            `
        };
        return mathFunctions[layerName] || mathFunctions.content;
    }

    getLayerIntensityMultiplier(layerName) {
        const multipliers = {
            background: '5.0',
            shadow: '8.0',
            content: '12.0',
            highlight: '15.0',
            accent: '20.0'
        };
        return multipliers[layerName] || '10.0';
    }

    getLayerPower(layerName) {
        const powers = {
            background: '1.2',
            shadow: '1.5',
            content: '2.0',
            highlight: '2.5',
            accent: '3.0'
        };
        return powers[layerName] || '2.0';
    }

    getLayerGlowEffect(layerName) {
        const glows = {
            background: 'vec3(exp(-minDistance * 3.0)) * u_layerColor.rgb * 0.1',
            shadow: 'vec3(exp(-minDistance * 5.0)) * u_layerColor.rgb * 0.2',
            content: 'vec3(exp(-minDistance * 8.0)) * u_layerColor.rgb * 0.4',
            highlight: 'vec3(exp(-minDistance * 12.0)) * u_layerColor.rgb * 0.6',
            accent: 'vec3(exp(-minDistance * 20.0)) * u_layerColor.rgb * 0.8'
        };
        return glows[layerName] || 'vec3(0.0)';
    }

    compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }

    startMorphingAnimation() {
        const vertices = new Float32Array([
            -1, -1,  1, -1,  -1, 1,
            -1,  1,  1, -1,   1, 1
        ]);

        // Setup geometry for all layers
        Object.keys(this.contexts).forEach(layerName => {
            const gl = this.contexts[layerName];
            const program = this.programs[layerName];
            
            if (!gl || !program) return;
            
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        });

        // Start animation loop
        const animate = () => {
            this.renderAllLayers();
            this.updateMorphState();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    renderAllLayers() {
        const time = Date.now() - this.startTime;
        
        Object.keys(this.contexts).forEach(layerName => {
            const gl = this.contexts[layerName];
            const program = this.programs[layerName];
            
            if (!gl || !program) return;
            
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            
            // Set uniforms
            gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
            gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), 
                        this.layers[layerName].width, this.layers[layerName].height);
            gl.uniform1f(gl.getUniformLocation(program, 'u_morphProgress'), this.morphState.morphProgress);
            gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), this.morphState.intensity);
            gl.uniform4fv(gl.getUniformLocation(program, 'u_layerColor'), 
                         this.config.colorScheme[layerName]);
            gl.uniform1f(gl.getUniformLocation(program, 'u_geometryType'), this.config.baseGeometry);
            
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
    }

    updateMorphState() {
        // Continuous morphing animation
        this.morphState.morphProgress = (Math.sin(Date.now() * 0.001 * this.config.animations.morphSpeed) + 1.0) * 0.5;
    }

    enhanceSystem(intensity) {
        this.morphState.intensity = Math.min(2.0, intensity);
    }

    dimSystem(intensity) {
        this.morphState.intensity = Math.max(0.3, intensity);
    }

    morphToSystem(newSystemType) {
        this.morphState.targetSystem = newSystemType;
        // Trigger morphing animation
    }

    resetToDefaults() {
        this.morphState.intensity = 1.0;
        this.morphState.morphProgress = 0.0;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        Object.keys(this.contexts).forEach(layerName => {
            const gl = this.contexts[layerName];
            const program = this.programs[layerName];
            if (gl && program) {
                gl.deleteProgram(program);
            }
        });
    }
}

// Global instance
window.clearSeasLayeredVIB34D = new ClearSeasLayeredVIB34D();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.clearSeasLayeredVIB34D.initialize();
    });
} else {
    window.clearSeasLayeredVIB34D.initialize();
}

export { ClearSeasLayeredVIB34D, LayeredVIB34DVisualizer };
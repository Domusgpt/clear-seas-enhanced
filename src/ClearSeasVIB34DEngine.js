/**
 * CLEAR SEAS VIB34D ENGINE - CUSTOM BUILT SYSTEM
 * Built specifically for Clear Seas Enhanced with proper VIB34D integration
 * No lazy iframe bullshit - actual WebGL implementation
 */

class ClearSeasVIB34DEngine {
    constructor() {
        this.visualizers = new Map();
        this.isInitialized = false;
        this.audioContext = null;
        this.audioAnalyzer = null;
        
        // System configurations for different sections
        this.systemConfigs = {
            FACETED: {
                geometryType: 0, // Tetrahedron base
                primaryColor: [0.8, 0.3, 0.9], // Purple
                secondaryColor: [0.5, 0.2, 0.8],
                gridDensity: 15,
                morphSpeed: 1.0,
                rotationSpeed: 0.5
            },
            QUANTUM: {
                geometryType: 3, // Hypercube lattice
                primaryColor: [0.9, 0.8, 0.2], // Gold
                secondaryColor: [0.8, 0.6, 0.1],
                gridDensity: 25,
                morphSpeed: 1.5,
                rotationSpeed: 0.8
            },
            HOLOGRAPHIC: {
                geometryType: 2, // Torus
                primaryColor: [0.2, 0.9, 0.5], // Green
                secondaryColor: [0.1, 0.7, 0.4],
                gridDensity: 18,
                morphSpeed: 0.8,
                rotationSpeed: 0.6
            },
            POLYCHORA: {
                geometryType: 7, // Complex polytope
                primaryColor: [0.3, 0.7, 0.9], // Cyan
                secondaryColor: [0.2, 0.5, 0.8],
                gridDensity: 30,
                morphSpeed: 2.0,
                rotationSpeed: 1.2
            }
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Clear Seas VIB34D Engine...');
        
        // Find all visualization containers and build proper visualizers
        await this.buildVisualizerSystem();
        
        // Initialize audio reactivity
        await this.initializeAudioReactivity();
        
        this.isInitialized = true;
        console.log('✅ Clear Seas VIB34D Engine Ready!');
    }

    async buildVisualizerSystem() {
        // Find all canvas elements that need VIB34D
        const canvasElements = document.querySelectorAll('canvas, iframe[src*="vib34d"]');
        
        canvasElements.forEach((element, index) => {
            // Replace iframes with proper canvas elements
            let canvas = element;
            if (element.tagName === 'IFRAME') {
                canvas = document.createElement('canvas');
                canvas.id = element.id;
                canvas.className = 'vib34d-visualizer';
                canvas.style.cssText = element.style.cssText || 'width: 100%; height: 100%;';
                element.parentNode.replaceChild(canvas, element);
            }
            
            // Determine system type and build visualizer
            const systemType = this.determineSystemType(canvas.id, index);
            this.createVIB34DVisualizer(canvas, systemType);
        });
    }

    determineSystemType(canvasId, index) {
        if (canvasId.includes('hero-primary') || canvasId.includes('vib34d-2') || canvasId.includes('vib34d-6')) {
            return 'FACETED';
        } else if (canvasId.includes('vib34d-3') || canvasId.includes('vib34d-7')) {
            return 'QUANTUM';
        } else if (canvasId.includes('hero-secondary') || canvasId.includes('vib34d-4') || canvasId.includes('vib34d-8')) {
            return 'HOLOGRAPHIC';
        } else if (canvasId.includes('vib34d-5')) {
            return 'POLYCHORA';
        }
        
        // Distribute systems evenly
        const systems = ['FACETED', 'QUANTUM', 'HOLOGRAPHIC', 'POLYCHORA'];
        return systems[index % systems.length];
    }

    createVIB34DVisualizer(canvas, systemType) {
        const config = this.systemConfigs[systemType];
        const visualizer = new VIB34DVisualizer(canvas, config, systemType);
        
        this.visualizers.set(canvas.id, {
            visualizer: visualizer,
            canvas: canvas,
            systemType: systemType,
            config: config
        });
        
        console.log(`✨ Created ${systemType} visualizer for ${canvas.id}`);
        return visualizer;
    }

    async initializeAudioReactivity() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(stream);
            
            this.audioAnalyzer = this.audioContext.createAnalyser();
            this.audioAnalyzer.fftSize = 256;
            source.connect(this.audioAnalyzer);
            
            console.log('🎵 Audio reactivity initialized');
        } catch (error) {
            console.log('⚠️ Audio reactivity not available:', error.message);
        }
    }

    // Totalistic system methods
    triggerSystemFocus(focusedSystem, intensity = 1.0) {
        this.visualizers.forEach((viz, id) => {
            if (viz.systemType === focusedSystem) {
                // Enhance focused system
                viz.visualizer.updateParameters({
                    intensity: intensity * 1.5,
                    speed: intensity * 1.3,
                    morphing: intensity * 1.4
                });
            } else {
                // Dim other systems
                viz.visualizer.updateParameters({
                    intensity: 0.6,
                    speed: 0.8,
                    morphing: 0.7
                });
            }
        });
    }

    resetAllSystems() {
        this.visualizers.forEach((viz, id) => {
            viz.visualizer.resetToDefaults();
        });
    }

    switchHeroSystem(systemType) {
        const heroVisualizers = ['hero-primary', 'hero-secondary'];
        heroVisualizers.forEach(heroId => {
            const viz = this.visualizers.get(heroId);
            if (viz) {
                viz.visualizer.switchToSystem(systemType);
            }
        });
    }
}

class VIB34DVisualizer {
    constructor(canvas, config, systemType) {
        this.canvas = canvas;
        this.config = config;
        this.systemType = systemType;
        this.gl = null;
        this.program = null;
        this.startTime = Date.now();
        this.animationId = null;
        this.parameters = { ...config };
        
        this.initWebGL();
        this.createShaderProgram();
        this.setupGeometry();
        this.startRenderLoop();
    }

    initWebGL() {
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            this.createFallbackVisualization();
            return;
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.clearColor(0.05, 0.05, 0.1, 1.0);
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    createShaderProgram() {
        const vertexShaderSource = `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;

        const fragmentShaderSource = this.generateFragmentShader();
        
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Shader program failed to link:', this.gl.getProgramInfoLog(this.program));
        }
        
        this.uniforms = this.getUniformLocations();
    }

    generateFragmentShader() {
        return `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_geometryType;
            uniform float u_gridDensity;
            uniform float u_morphSpeed;
            uniform float u_rotationSpeed;
            uniform vec3 u_primaryColor;
            uniform vec3 u_secondaryColor;
            uniform float u_intensity;

            // VIB34D Core Mathematical Functions
            mat2 rotate2D(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat2(c, -s, s, c);
            }

            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            // 4D Polytopal Distance Functions - THE REAL DEAL
            float tetrahedralLattice(vec3 p) {
                p = fract(p * u_gridDensity) - 0.5;
                float d = length(p) - 0.3;
                
                // 4D rotation simulation
                vec2 rot = rotate2D(u_time * u_rotationSpeed * 0.001) * p.xy;
                d += sin(rot.x * 10.0) * sin(rot.y * 10.0) * 0.1;
                
                return d;
            }

            float hypercubeLattice(vec3 p) {
                vec3 q = fract(p * u_gridDensity * 0.1) - 0.5;
                
                // 4D hypercube projection
                float d = max(max(abs(q.x), abs(q.y)), abs(q.z)) - 0.25;
                
                // Add 4D rotation effects
                vec2 rot4d = rotate2D(u_time * u_rotationSpeed * 0.0008) * q.xz;
                d += sin(rot4d.x * 15.0) * cos(rot4d.y * 15.0) * 0.05;
                
                return d;
            }

            float torusLattice(vec3 p) {
                vec3 q = fract(p * u_gridDensity * 0.08) - 0.5;
                
                // Torus distance function
                vec2 t = vec2(0.4, 0.15);
                vec2 r = vec2(length(q.xz) - t.x, q.y);
                float d = length(r) - t.y;
                
                // 4D torus effects
                float phase = u_time * u_morphSpeed * 0.001;
                d += sin(q.x * 12.0 + phase) * cos(q.z * 12.0 + phase) * 0.08;
                
                return d;
            }

            float complexPolytope(vec3 p) {
                vec3 q = fract(p * u_gridDensity * 0.06) - 0.5;
                
                // Complex polytope approximation
                float d = length(q) - 0.35;
                
                // Multiple rotation planes (4D simulation)
                vec2 rotXY = rotate2D(u_time * u_rotationSpeed * 0.0012) * q.xy;
                vec2 rotXZ = rotate2D(u_time * u_rotationSpeed * 0.0009) * q.xz;
                vec2 rotYZ = rotate2D(u_time * u_rotationSpeed * 0.0015) * q.yz;
                
                d += (sin(rotXY.x * 8.0) * cos(rotXY.y * 8.0) +
                      sin(rotXZ.x * 6.0) * cos(rotXZ.y * 6.0) +
                      sin(rotYZ.x * 7.0) * cos(rotYZ.y * 7.0)) * 0.06;
                
                return d;
            }

            float kleinBottleLattice(vec3 p) {
                vec3 q = fract(p * u_gridDensity * 0.07) - 0.5;
                
                // Klein bottle approximation
                float u = atan(q.y, q.x);
                float v = length(q.xz) - 0.3;
                float d = abs(q.z - sin(u * 2.0) * cos(v * 3.0) * 0.2) - 0.1;
                
                // 4D Klein bottle effects
                float twist = u_time * u_morphSpeed * 0.001;
                d += sin(u * 4.0 + twist) * cos(v * 5.0 + twist) * 0.05;
                
                return d;
            }

            float fractalLattice(vec3 p) {
                vec3 q = p * u_gridDensity * 0.05;
                
                // Fractal iteration
                for(int i = 0; i < 4; i++) {
                    q = abs(q) - 1.0;
                    q.xy *= rotate2D(u_time * u_rotationSpeed * 0.0005);
                    q.xz *= rotate2D(u_time * u_rotationSpeed * 0.0007);
                }
                
                return length(q) - 0.5;
            }

            float waveLattice(vec3 p) {
                vec3 q = p * u_gridDensity * 0.09;
                
                // Wave interference patterns
                float wave1 = sin(q.x * 3.14159 + u_time * u_morphSpeed * 0.002);
                float wave2 = cos(q.y * 3.14159 + u_time * u_morphSpeed * 0.0015);
                float wave3 = sin(q.z * 3.14159 + u_time * u_morphSpeed * 0.0025);
                
                float d = abs(wave1 * wave2 * wave3) - 0.3;
                
                return d;
            }

            float crystalLattice(vec3 p) {
                vec3 q = fract(p * u_gridDensity * 0.12) - 0.5;
                
                // Crystal structure
                float d1 = max(max(abs(q.x), abs(q.y)), abs(q.z)) - 0.2;
                float d2 = length(q) - 0.25;
                float d = min(d1, d2);
                
                // Crystal faceting
                float facet = sin(q.x * 20.0) * sin(q.y * 20.0) * sin(q.z * 20.0) * 0.03;
                d += facet;
                
                return d;
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                
                // 3D ray marching setup
                vec3 rayDir = normalize(vec3(uv, 1.0));
                vec3 rayPos = vec3(0.0, 0.0, -2.0);
                
                // Ray marching
                float totalDistance = 0.0;
                float minDistance = 1000.0;
                
                for(int i = 0; i < 64; i++) {
                    vec3 pos = rayPos + rayDir * totalDistance;
                    
                    float d = 1000.0;
                    
                    // Select geometry based on system type
                    if(u_geometryType < 0.5) {
                        d = tetrahedralLattice(pos);
                    } else if(u_geometryType < 1.5) {
                        d = hypercubeLattice(pos);
                    } else if(u_geometryType < 2.5) {
                        d = torusLattice(pos);
                    } else if(u_geometryType < 3.5) {
                        d = complexPolytope(pos);
                    } else if(u_geometryType < 4.5) {
                        d = kleinBottleLattice(pos);
                    } else if(u_geometryType < 5.5) {
                        d = fractalLattice(pos);
                    } else if(u_geometryType < 6.5) {
                        d = waveLattice(pos);
                    } else {
                        d = crystalLattice(pos);
                    }
                    
                    minDistance = min(minDistance, d);
                    
                    if(d < 0.01) break;
                    if(totalDistance > 10.0) break;
                    
                    totalDistance += d * 0.9;
                }
                
                // Color calculation
                float intensity = 1.0 / (1.0 + minDistance * 10.0);
                intensity = pow(intensity, 1.5) * u_intensity;
                
                // Color mixing based on distance and time
                float colorMix = sin(minDistance * 20.0 + u_time * 0.001) * 0.5 + 0.5;
                vec3 color = mix(u_primaryColor, u_secondaryColor, colorMix) * intensity;
                
                // Add glow effects
                float glow = exp(-minDistance * 8.0) * 0.5;
                color += vec3(glow) * u_primaryColor;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }

    getUniformLocations() {
        return {
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            geometryType: this.gl.getUniformLocation(this.program, 'u_geometryType'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            morphSpeed: this.gl.getUniformLocation(this.program, 'u_morphSpeed'),
            rotationSpeed: this.gl.getUniformLocation(this.program, 'u_rotationSpeed'),
            primaryColor: this.gl.getUniformLocation(this.program, 'u_primaryColor'),
            secondaryColor: this.gl.getUniformLocation(this.program, 'u_secondaryColor'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity')
        };
    }

    setupGeometry() {
        const vertices = new Float32Array([
            -1, -1,  1, -1,  -1, 1,
            -1,  1,  1, -1,   1, 1
        ]);
        
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    startRenderLoop() {
        const render = () => {
            this.render();
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }

    render() {
        if (!this.gl || !this.program) return;
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.program);
        
        // Update uniforms
        const time = Date.now() - this.startTime;
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.geometryType, this.config.geometryType);
        this.gl.uniform1f(this.uniforms.gridDensity, this.config.gridDensity);
        this.gl.uniform1f(this.uniforms.morphSpeed, this.config.morphSpeed);
        this.gl.uniform1f(this.uniforms.rotationSpeed, this.config.rotationSpeed);
        this.gl.uniform3fv(this.uniforms.primaryColor, this.config.primaryColor);
        this.gl.uniform3fv(this.uniforms.secondaryColor, this.config.secondaryColor);
        this.gl.uniform1f(this.uniforms.intensity, this.parameters.intensity || 1.0);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    updateParameters(newParams) {
        Object.assign(this.parameters, newParams);
        if (newParams.intensity) this.config.intensity = newParams.intensity;
        if (newParams.speed) this.config.morphSpeed = newParams.speed;
        if (newParams.morphing) this.config.rotationSpeed = newParams.morphing;
    }

    switchToSystem(systemType) {
        const newConfig = window.clearSeasVIB34D.systemConfigs[systemType];
        if (newConfig) {
            Object.assign(this.config, newConfig);
            this.systemType = systemType;
        }
    }

    resetToDefaults() {
        const defaultConfig = window.clearSeasVIB34D.systemConfigs[this.systemType];
        Object.assign(this.config, defaultConfig);
        this.parameters = { ...defaultConfig };
    }

    createFallbackVisualization() {
        // 2D Canvas fallback for devices without WebGL
        const ctx = this.canvas.getContext('2d');
        const animate = () => {
            const time = Date.now() * 0.001;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw animated patterns
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            ctx.strokeStyle = `hsl(${(this.config.primaryColor[0] * 360 + time * 10) % 360}, 80%, 60%)`;
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 20; i++) {
                const radius = (Math.sin(time + i * 0.1) * 50) + 100;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            requestAnimationFrame(animate);
        };
        animate();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
    }
}

// Global instance
window.clearSeasVIB34D = new ClearSeasVIB34DEngine();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.clearSeasVIB34D.initialize();
    });
} else {
    window.clearSeasVIB34D.initialize();
}

export { ClearSeasVIB34DEngine, VIB34DVisualizer };
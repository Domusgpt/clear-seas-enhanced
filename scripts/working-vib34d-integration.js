/**
 * WORKING VIB34D INTEGRATION - Direct Canvas Implementation
 * Replaces broken iframe embedding with functional WebGL visualizers
 */

class WorkingVIB34DEngine {
    constructor() {
        this.visualizers = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Working VIB34D Engine...');
        this.isInitialized = true;
        
        // Replace all iframe visualizers with working canvas versions
        this.replaceIframeVisualizers();
    }

    replaceIframeVisualizers() {
        // Find all existing canvases with data attributes (hero visualizers)
        const heroCanvases = document.querySelectorAll('canvas[data-geometry]');
        heroCanvases.forEach(canvas => {
            const params = this.parseDataAttributes(canvas);
            this.createVisualizer(canvas.id, params);
        });
        
        // Find all VIB34D iframes and replace them
        const iframes = document.querySelectorAll('iframe[src*="vib34d"]');
        
        iframes.forEach((iframe, index) => {
            const params = this.parseURLParams(iframe.src);
            const canvasId = `vib34d-canvas-${index}`;
            
            // Create replacement canvas
            const canvas = document.createElement('canvas');
            canvas.id = canvasId;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.borderRadius = '12px';
            
            // Replace iframe with canvas
            iframe.parentNode.replaceChild(canvas, iframe);
            
            // Create visualizer
            this.createVisualizer(canvasId, params);
        });
    }

    replaceHeroVisualizers() {
        // Handle hero-primary and hero-secondary
        const heroContainers = document.querySelectorAll('#hero-primary, #hero-secondary');
        
        heroContainers.forEach((container, index) => {
            if (container.tagName === 'IFRAME') {
                const params = this.parseURLParams(container.src);
                const canvasId = `hero-canvas-${index}`;
                
                const canvas = document.createElement('canvas');
                canvas.id = canvasId;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                
                container.parentNode.replaceChild(canvas, container);
                this.createVisualizer(canvasId, params);
            }
        });
    }

    parseDataAttributes(canvas) {
        const defaults = {
            geometry: 0,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 200,
            intensity: 0.8,
            saturation: 0.6
        };
        
        const params = {};
        Object.keys(defaults).forEach(key => {
            const dataValue = canvas.dataset[key];
            params[key] = dataValue ? parseFloat(dataValue) : defaults[key];
        });
        
        return params;
    }

    parseURLParams(url) {
        const urlObj = new URL(url);
        const params = {};
        
        // Default parameters
        const defaults = {
            geometry: 0,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 200,
            intensity: 0.8,
            saturation: 0.6
        };
        
        // Parse URL parameters
        urlObj.searchParams.forEach((value, key) => {
            if (key in defaults) {
                params[key] = parseFloat(value) || defaults[key];
            }
        });
        
        // Fill in defaults
        Object.keys(defaults).forEach(key => {
            if (!(key in params)) {
                params[key] = defaults[key];
            }
        });
        
        return params;
    }

    createVisualizer(canvasId, params) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas not found: ${canvasId}`);
            return;
        }

        const visualizer = new VIB34DVisualizer(canvas, params);
        this.visualizers.set(canvasId, visualizer);
        
        console.log(`✅ Created VIB34D visualizer: ${canvasId}`, params);
        return visualizer;
    }

    updateVisualizer(canvasId, newParams) {
        const visualizer = this.visualizers.get(canvasId);
        if (visualizer) {
            visualizer.updateParameters(newParams);
        }
    }

    getAllVisualizers() {
        return Array.from(this.visualizers.values());
    }
}

class VIB34DVisualizer {
    constructor(canvas, params = {}) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.params = params;
        this.startTime = Date.now();
        this.animationId = null;
        
        this.initWebGL();
        this.createShaders();
        this.setupGeometry();
        this.startAnimation();
    }

    initWebGL() {
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported, falling back to 2D');
            this.createFallback2D();
            return;
        }

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Set clear color to dark blue/purple
        this.gl.clearColor(0.05, 0.1, 0.2, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    createShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_geometry;
            uniform float u_gridDensity;
            uniform float u_morphFactor;
            uniform float u_chaos;
            uniform float u_speed;
            uniform float u_hue;
            uniform float u_intensity;
            uniform float u_saturation;

            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            float tetrahedronLattice(vec3 p) {
                p = fract(p) - 0.5;
                return length(p) - 0.3;
            }

            float hypercubeLattice(vec3 p) {
                vec3 q = abs(fract(p) - 0.5);
                return max(q.x, max(q.y, q.z)) - 0.3;
            }

            float torusLattice(vec3 p) {
                vec2 t = vec2(0.8, 0.2);
                p = fract(p) - 0.5;
                vec2 q = vec2(length(p.xz) - t.x, p.y);
                return length(q) - t.y;
            }

            float waveLattice(vec3 p) {
                float wave = sin(p.x * 3.14159) * cos(p.y * 3.14159) * 0.2;
                return abs(p.z - wave) - 0.1;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec2 p = (uv - 0.5) * 2.0;
                p.x *= u_resolution.x / u_resolution.y;

                float time = u_time * u_speed * 0.001;
                
                // 3D position calculation
                vec3 pos = vec3(p, time * 0.5) * u_gridDensity * 0.1;
                
                // Rotation matrices for 4D-style effects
                float a = time * 0.3;
                mat2 rot = mat2(cos(a), sin(a), -sin(a), cos(a));
                pos.xy *= rot;
                pos.xz *= mat2(cos(a * 0.7), sin(a * 0.7), -sin(a * 0.7), cos(a * 0.7));
                
                float dist = 1.0;
                
                // Geometry selection based on parameter
                if (u_geometry < 0.5) {
                    dist = tetrahedronLattice(pos);
                } else if (u_geometry < 1.5) {
                    dist = hypercubeLattice(pos);
                } else if (u_geometry < 2.5) {
                    dist = torusLattice(pos);
                } else if (u_geometry < 3.5) {
                    dist = waveLattice(pos);
                } else if (u_geometry < 4.5) {
                    // Crystal lattice
                    dist = min(tetrahedronLattice(pos), hypercubeLattice(pos * 0.7));
                } else if (u_geometry < 5.5) {
                    // Klein bottle approximation
                    vec3 q = fract(pos) - 0.5;
                    dist = length(vec2(length(q.xy) - 0.3, q.z)) - 0.1;
                } else if (u_geometry < 6.5) {
                    // Fractal
                    vec3 q = pos;
                    for(int i = 0; i < 3; i++) {
                        q = abs(q) - 1.0;
                        q.xy *= rot;
                    }
                    dist = length(q) - 0.5;
                } else {
                    // Complex hypersphere
                    dist = length(fract(pos) - 0.5) - 0.2 + sin(length(pos) * 5.0) * 0.1;
                }
                
                // Apply morphing and chaos
                dist += sin(pos.x * 10.0 + time) * u_morphFactor * 0.1;
                dist += (fract(sin(dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * u_chaos * 0.2;
                
                // Distance field visualization
                float intensity = 1.0 / (1.0 + abs(dist) * 20.0);
                intensity = pow(intensity, 2.0) * u_intensity;
                
                // Color calculation
                float hueShift = u_hue / 360.0 + time * 0.1;
                vec3 color = hsv2rgb(vec3(hueShift, u_saturation, intensity));
                
                // Add some glow effects
                float glow = exp(-abs(dist) * 10.0) * 0.3;
                color += vec3(glow * u_intensity);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        // Create and compile shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Shader program failed to link:', this.gl.getProgramInfoLog(this.program));
        }
        
        // Get uniform locations
        this.uniforms = {
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
            chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
            speed: this.gl.getUniformLocation(this.program, 'u_speed'),
            hue: this.gl.getUniformLocation(this.program, 'u_hue'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
            saturation: this.gl.getUniformLocation(this.program, 'u_saturation')
        };
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }

    setupGeometry() {
        // Create a full-screen quad
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

    startAnimation() {
        const animate = () => {
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    render() {
        if (!this.gl || !this.program) return;
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        
        // Update uniforms
        const time = Date.now() - this.startTime;
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.geometry, this.params.geometry || 0);
        this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity || 15);
        this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor || 1.0);
        this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.2);
        this.gl.uniform1f(this.uniforms.speed, this.params.speed || 1.0);
        this.gl.uniform1f(this.uniforms.hue, this.params.hue || 200);
        this.gl.uniform1f(this.uniforms.intensity, this.params.intensity || 0.8);
        this.gl.uniform1f(this.uniforms.saturation, this.params.saturation || 0.6);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    updateParameters(newParams) {
        this.params = { ...this.params, ...newParams };
    }

    createFallback2D() {
        const ctx = this.canvas.getContext('2d');
        console.log('Using 2D canvas fallback');
        
        const animate = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const time = Date.now() * 0.001;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            // Simple 2D fallback pattern
            ctx.strokeStyle = `hsl(${this.params.hue}, ${this.params.saturation * 100}%, ${this.params.intensity * 50}%)`;
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 20; i++) {
                const radius = (i + time) * 10;
                const alpha = (i / 20) * this.params.intensity;
                ctx.globalAlpha = alpha;
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
window.workingVIB34D = new WorkingVIB34DEngine();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.workingVIB34D.initialize();
    });
} else {
    window.workingVIB34D.initialize();
}

export { WorkingVIB34DEngine, VIB34DVisualizer };
/**
 * CLEAR SEAS MULTI-LAYERED CONTEXT POOL
 * Manages 5-layer visualizers with intelligent context allocation and priority-based eviction
 * Based on VIB34D architecture but optimized for multiple simultaneous visualizers
 */

class ClearSeasContextPool {
    constructor() {
        this.maxContexts = this.detectContextLimit();
        this.activeContexts = new Map(); // contextId -> ContextInfo
        this.waitQueue = [];
        this.visualizers = new Map(); // visualizerId -> VisualizerManager
        this.layerPriorities = {
            'accent': 5,      // Highest priority - most visible effects
            'highlight': 4,   // High priority - important visual elements  
            'content': 3,     // Medium priority - main content
            'shadow': 2,      // Lower priority - depth effects
            'background': 1   // Lowest priority - base layer
        };
        
        this.isInitialized = false;
        this.frameId = null;
        
        console.log(`🎯 ClearSeas Context Pool initialized with ${this.maxContexts} max contexts`);
    }

    detectContextLimit() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isIOS) return 4;        // Conservative for iOS
        if (isMobile) return 6;     // Mobile devices
        return 8;                   // Desktop
    }

    async initialize() {
        if (this.isInitialized) return;
        
        // Pre-warm pool with some contexts
        const preWarmCount = Math.floor(this.maxContexts * 0.5);
        for (let i = 0; i < preWarmCount; i++) {
            await this.createPrewarmContext(`prewarm-${i}`);
        }
        
        this.startRenderLoop();
        this.isInitialized = true;
        
        console.log(`✅ Context Pool ready: ${preWarmCount} pre-warmed contexts`);
    }

    createMultiLayerVisualizer(visualizerId, systemType, container) {
        if (this.visualizers.has(visualizerId)) {
            console.warn(`Visualizer ${visualizerId} already exists`);
            return this.visualizers.get(visualizerId);
        }

        const visualizerManager = new MultiLayerVisualizerManager(
            visualizerId, 
            systemType, 
            container, 
            this
        );

        this.visualizers.set(visualizerId, visualizerManager);
        
        console.log(`🎨 Created multi-layer visualizer: ${visualizerId} (${systemType})`);
        return visualizerManager;
    }

    async allocateContextForLayer(visualizerId, layerType) {
        const contextId = `${visualizerId}-${layerType}`;
        const priority = this.layerPriorities[layerType];
        
        // Check if we already have this context
        if (this.activeContexts.has(contextId)) {
            const contextInfo = this.activeContexts.get(contextId);
            contextInfo.lastUsed = Date.now();
            contextInfo.accessCount++;
            return contextInfo;
        }
        
        // Try to allocate new context
        if (this.activeContexts.size < this.maxContexts) {
            return await this.createNewContext(contextId, priority, visualizerId, layerType);
        }
        
        // Pool is full - try to evict lower priority context
        const victimContext = this.findEvictionCandidate(priority);
        if (victimContext) {
            await this.evictContext(victimContext.id);
            return await this.createNewContext(contextId, priority, visualizerId, layerType);
        }
        
        // Can't evict anything - add to wait queue
        return this.addToWaitQueue(contextId, priority, visualizerId, layerType);
    }

    async createNewContext(contextId, priority, visualizerId, layerType) {
        const canvas = document.createElement('canvas');
        canvas.id = contextId;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = priority.toString();
        
        // Set blend mode based on layer type
        canvas.style.mixBlendMode = this.getBlendModeForLayer(layerType);
        
        const gl = canvas.getContext('webgl2', {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
        }) || canvas.getContext('webgl', {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
        });

        if (!gl) {
            console.error(`Failed to create WebGL context for ${contextId}`);
            return null;
        }

        // Configure context for transparent layering
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0); // Transparent clear

        const contextInfo = {
            id: contextId,
            canvas: canvas,
            gl: gl,
            priority: priority,
            visualizerId: visualizerId,
            layerType: layerType,
            created: Date.now(),
            lastUsed: Date.now(),
            accessCount: 1,
            shaderProgram: null,
            uniforms: {},
            isActive: true
        };

        // Initialize shaders for this layer type and system
        await this.initializeLayerShaders(contextInfo);

        this.activeContexts.set(contextId, contextInfo);
        
        console.log(`🔥 Created context: ${contextId} (priority: ${priority})`);
        return contextInfo;
    }

    getBlendModeForLayer(layerType) {
        const blendModes = {
            'background': 'normal',
            'shadow': 'multiply', 
            'content': 'screen',
            'highlight': 'overlay',
            'accent': 'soft-light'
        };
        return blendModes[layerType] || 'normal';
    }

    async initializeLayerShaders(contextInfo) {
        const { gl, layerType, visualizerId } = contextInfo;
        const visualizer = this.visualizers.get(visualizerId);
        
        if (!visualizer) return;

        // Create layer-specific shader program
        const vertexShaderSource = this.getVertexShader();
        const fragmentShaderSource = this.getFragmentShaderForLayer(layerType, visualizer.systemType);
        
        const program = await this.createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        if (!program) return;
        
        contextInfo.shaderProgram = program;
        contextInfo.uniforms = this.getUniformLocations(gl, program);
        
        // Setup geometry (full-screen quad)
        this.setupLayerGeometry(contextInfo);
        
        console.log(`🎨 Initialized shaders for ${contextInfo.id}`);
    }

    getVertexShader() {
        return `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;
    }

    getFragmentShaderForLayer(layerType, systemType) {
        const commonUniforms = `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_intensity;
            uniform float u_layerMix;
            uniform vec3 u_primaryColor;
            uniform vec3 u_secondaryColor;
            uniform float u_morphProgress;
        `;

        const mathFunctions = `
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
        `;

        const layerSpecificCode = this.getLayerSpecificShaderCode(layerType, systemType);
        
        return `
            ${commonUniforms}
            ${mathFunctions}
            ${layerSpecificCode}
            
            void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                
                vec4 layerColor = calculateLayerColor(uv);
                
                // Apply layer mixing and intensity
                layerColor.a *= u_intensity * u_layerMix;
                
                gl_FragColor = layerColor;
            }
        `;
    }

    getLayerSpecificShaderCode(layerType, systemType) {
        const systemMath = {
            'FACETED': 'length(abs(fract(p * 0.1) - 0.5))',
            'QUANTUM': 'max(max(abs(p.x), abs(p.y)), abs(p.z)) - 0.3', 
            'HOLOGRAPHIC': 'length(fract(p * 0.08) - 0.5) - 0.25',
            'POLYCHORA': 'length(p) - 0.4'
        };

        const layerEffects = {
            'background': `
                vec4 calculateLayerColor(vec2 uv) {
                    vec3 p = vec3(uv, u_time * 0.0001);
                    float d = ${systemMath[systemType] || systemMath['FACETED']};
                    
                    float intensity = 1.0 / (1.0 + abs(d) * 8.0);
                    
                    vec3 color = mix(u_primaryColor, u_secondaryColor, sin(u_time * 0.001) * 0.5 + 0.5);
                    return vec4(color * intensity, intensity * 0.3);
                }
            `,
            'shadow': `
                vec4 calculateLayerColor(vec2 uv) {
                    vec3 p = vec3(uv + vec2(0.02), u_time * 0.0005);
                    float d = ${systemMath[systemType] || systemMath['FACETED']};
                    
                    float intensity = 1.0 / (1.0 + abs(d) * 12.0);
                    
                    return vec4(vec3(0.0), intensity * 0.6);
                }
            `,
            'content': `
                vec4 calculateLayerColor(vec2 uv) {
                    vec3 p = vec3(uv, u_time * 0.002);
                    p.xy = rotate2D(u_time * 0.0008) * uv;
                    
                    float d = ${systemMath[systemType] || systemMath['FACETED']};
                    
                    float intensity = 1.0 / (1.0 + abs(d) * 15.0);
                    intensity = pow(intensity, 1.8);
                    
                    vec3 color = mix(u_primaryColor, u_secondaryColor, u_morphProgress);
                    color += vec3(exp(-abs(d) * 10.0)) * 0.4;
                    
                    return vec4(color * intensity, intensity);
                }
            `,
            'highlight': `
                vec4 calculateLayerColor(vec2 uv) {
                    vec3 p = vec3(uv, u_time * 0.003);
                    vec2 rotated = rotate2D(u_time * 0.001) * uv;
                    p.xy = rotated;
                    
                    float d = ${systemMath[systemType] || systemMath['FACETED']};
                    
                    float intensity = 1.0 / (1.0 + abs(d) * 20.0);
                    intensity = pow(intensity, 2.5);
                    
                    vec3 brightColor = u_primaryColor * 1.5;
                    float sparkle = sin(length(uv) * 50.0 + u_time * 0.01) * 0.5 + 0.5;
                    
                    return vec4(brightColor * intensity * sparkle, intensity * 0.8);
                }
            `,
            'accent': `
                vec4 calculateLayerColor(vec2 uv) {
                    vec3 p = vec3(uv, u_time * 0.005);
                    float spiral = atan(uv.y, uv.x) + length(uv) * 8.0 + u_time * 0.01;
                    p.xy *= rotate2D(spiral * 0.1);
                    
                    float d = ${systemMath[systemType] || systemMath['FACETED']} - 0.2;
                    
                    float intensity = 1.0 / (1.0 + abs(d) * 25.0);
                    intensity = pow(intensity, 3.0);
                    
                    vec3 accentColor = hsv2rgb(vec3(
                        fract(u_time * 0.0003 + length(uv) * 0.5),
                        0.8,
                        1.0
                    ));
                    
                    return vec4(accentColor * intensity, intensity * 0.6);
                }
            `
        };

        return layerEffects[layerType] || layerEffects['content'];
    }

    async createShaderProgram(gl, vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) return null;
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }

    getUniformLocations(gl, program) {
        return {
            time: gl.getUniformLocation(program, 'u_time'),
            resolution: gl.getUniformLocation(program, 'u_resolution'),
            intensity: gl.getUniformLocation(program, 'u_intensity'),
            layerMix: gl.getUniformLocation(program, 'u_layerMix'),
            primaryColor: gl.getUniformLocation(program, 'u_primaryColor'),
            secondaryColor: gl.getUniformLocation(program, 'u_secondaryColor'),
            morphProgress: gl.getUniformLocation(program, 'u_morphProgress')
        };
    }

    setupLayerGeometry(contextInfo) {
        const { gl } = contextInfo;
        
        const vertices = new Float32Array([
            -1, -1,  1, -1,  -1, 1,
            -1,  1,  1, -1,   1, 1
        ]);
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        const positionLocation = gl.getAttribLocation(contextInfo.shaderProgram, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        contextInfo.geometryBuffer = buffer;
    }

    findEvictionCandidate(requiredPriority) {
        let candidate = null;
        let oldestTime = Infinity;
        
        for (const contextInfo of this.activeContexts.values()) {
            if (contextInfo.priority < requiredPriority && contextInfo.lastUsed < oldestTime) {
                candidate = contextInfo;
                oldestTime = contextInfo.lastUsed;
            }
        }
        
        return candidate;
    }

    async evictContext(contextId) {
        const contextInfo = this.activeContexts.get(contextId);
        if (!contextInfo) return;
        
        // Clean up WebGL resources
        const { gl } = contextInfo;
        if (contextInfo.shaderProgram) {
            gl.deleteProgram(contextInfo.shaderProgram);
        }
        if (contextInfo.geometryBuffer) {
            gl.deleteBuffer(contextInfo.geometryBuffer);
        }
        
        // Remove canvas from DOM
        if (contextInfo.canvas.parentNode) {
            contextInfo.canvas.parentNode.removeChild(contextInfo.canvas);
        }
        
        this.activeContexts.delete(contextId);
        
        console.log(`🗑️ Evicted context: ${contextId}`);
        
        // Process wait queue
        this.processWaitQueue();
    }

    addToWaitQueue(contextId, priority, visualizerId, layerType) {
        this.waitQueue.push({ contextId, priority, visualizerId, layerType });
        console.log(`⏳ Added to wait queue: ${contextId} (queue length: ${this.waitQueue.length})`);
        return null;
    }

    async processWaitQueue() {
        if (this.waitQueue.length === 0 || this.activeContexts.size >= this.maxContexts) return;
        
        // Sort by priority (highest first)
        this.waitQueue.sort((a, b) => b.priority - a.priority);
        
        const request = this.waitQueue.shift();
        const contextInfo = await this.createNewContext(
            request.contextId, 
            request.priority, 
            request.visualizerId, 
            request.layerType
        );
        
        if (contextInfo) {
            // Notify visualizer that context is ready
            const visualizer = this.visualizers.get(request.visualizerId);
            if (visualizer) {
                visualizer.onLayerContextReady(request.layerType, contextInfo);
            }
        }
    }

    startRenderLoop() {
        const render = (timestamp) => {
            this.renderAllActiveLayers(timestamp);
            this.frameId = requestAnimationFrame(render);
        };
        
        this.frameId = requestAnimationFrame(render);
        console.log('🎬 Render loop started');
    }

    renderAllActiveLayers(timestamp) {
        for (const contextInfo of this.activeContexts.values()) {
            if (contextInfo.isActive && contextInfo.shaderProgram) {
                this.renderLayer(contextInfo, timestamp);
            }
        }
    }

    renderLayer(contextInfo, timestamp) {
        const { gl, shaderProgram, uniforms, canvas } = contextInfo;
        
        // Update canvas size if needed
        this.updateCanvasSize(contextInfo);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(shaderProgram);
        
        // Update uniforms
        gl.uniform1f(uniforms.time, timestamp);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        
        // Get visualizer-specific parameters
        const visualizer = this.visualizers.get(contextInfo.visualizerId);
        if (visualizer) {
            const layerParams = visualizer.getLayerParameters(contextInfo.layerType);
            
            gl.uniform1f(uniforms.intensity, layerParams.intensity);
            gl.uniform1f(uniforms.layerMix, layerParams.layerMix);
            gl.uniform3fv(uniforms.primaryColor, layerParams.primaryColor);
            gl.uniform3fv(uniforms.secondaryColor, layerParams.secondaryColor);
            gl.uniform1f(uniforms.morphProgress, layerParams.morphProgress);
        }
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Update usage stats
        contextInfo.lastUsed = Date.now();
    }

    updateCanvasSize(contextInfo) {
        const { canvas, gl } = contextInfo;
        const visualizer = this.visualizers.get(contextInfo.visualizerId);
        
        if (visualizer && visualizer.container) {
            const rect = visualizer.container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            
            const newWidth = rect.width * dpr;
            const newHeight = rect.height * dpr;
            
            if (canvas.width !== newWidth || canvas.height !== newHeight) {
                canvas.width = newWidth;
                canvas.height = newHeight;
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
                
                gl.viewport(0, 0, newWidth, newHeight);
            }
        }
    }

    async createPrewarmContext(contextId) {
        // Create a basic context for later reuse
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (gl) {
            const contextInfo = {
                id: contextId,
                canvas: canvas,
                gl: gl,
                priority: 0,
                created: Date.now(),
                lastUsed: Date.now(),
                isActive: false,
                isPrewarm: true
            };
            
            this.activeContexts.set(contextId, contextInfo);
        }
    }

    getPoolStats() {
        return {
            maxContexts: this.maxContexts,
            activeContexts: this.activeContexts.size,
            waitQueueLength: this.waitQueue.length,
            visualizers: this.visualizers.size
        };
    }

    destroy() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
        
        // Clean up all contexts
        for (const contextInfo of this.activeContexts.values()) {
            this.evictContext(contextInfo.id);
        }
        
        this.activeContexts.clear();
        this.visualizers.clear();
        this.waitQueue.length = 0;
    }
}

class MultiLayerVisualizerManager {
    constructor(visualizerId, systemType, container, contextPool) {
        this.visualizerId = visualizerId;
        this.systemType = systemType;
        this.container = container;
        this.contextPool = contextPool;
        
        this.layers = new Map(); // layerType -> contextInfo
        this.layerParameters = this.getDefaultLayerParameters();
        this.isVisible = true;
        this.priority = 1.0;
        
        this.initializeLayers();
    }

    async initializeLayers() {
        const layerTypes = ['background', 'shadow', 'content', 'highlight', 'accent'];
        
        // Clear container and setup layer structure
        this.container.innerHTML = '';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        
        // Request contexts for each layer
        for (const layerType of layerTypes) {
            const contextInfo = await this.contextPool.allocateContextForLayer(
                this.visualizerId, 
                layerType
            );
            
            if (contextInfo) {
                this.layers.set(layerType, contextInfo);
                this.container.appendChild(contextInfo.canvas);
                console.log(`🎨 Layer ready: ${this.visualizerId}-${layerType}`);
            }
        }
        
        console.log(`✅ Multi-layer visualizer initialized: ${this.visualizerId}`);
    }

    onLayerContextReady(layerType, contextInfo) {
        this.layers.set(layerType, contextInfo);
        if (this.container && contextInfo.canvas) {
            this.container.appendChild(contextInfo.canvas);
        }
        console.log(`🎨 Late layer ready: ${this.visualizerId}-${layerType}`);
    }

    getDefaultLayerParameters() {
        const systemColors = {
            'FACETED': { 
                primary: [0.8, 0.3, 0.9], 
                secondary: [0.5, 0.2, 0.8] 
            },
            'QUANTUM': { 
                primary: [0.2, 0.9, 0.5], 
                secondary: [0.1, 0.7, 0.4] 
            },
            'HOLOGRAPHIC': { 
                primary: [0.3, 0.7, 0.9], 
                secondary: [0.2, 0.5, 0.8] 
            },
            'POLYCHORA': { 
                primary: [0.9, 0.6, 0.2], 
                secondary: [0.8, 0.4, 0.1] 
            }
        };

        const colors = systemColors[this.systemType] || systemColors['FACETED'];
        
        return {
            background: { intensity: 0.5, layerMix: 1.0, ...colors, morphProgress: 0.0 },
            shadow: { intensity: 0.7, layerMix: 0.8, ...colors, morphProgress: 0.2 },
            content: { intensity: 0.9, layerMix: 1.0, ...colors, morphProgress: 0.5 },
            highlight: { intensity: 1.1, layerMix: 0.9, ...colors, morphProgress: 0.7 },
            accent: { intensity: 1.5, layerMix: 0.6, ...colors, morphProgress: 1.0 }
        };
    }

    getLayerParameters(layerType) {
        return this.layerParameters[layerType] || this.layerParameters.content;
    }

    updateParameters(newParams) {
        Object.assign(this.layerParameters, newParams);
    }

    enhanceVisualizer(intensity = 1.5) {
        Object.keys(this.layerParameters).forEach(layerType => {
            this.layerParameters[layerType].intensity *= intensity;
            this.layerParameters[layerType].morphProgress = Math.min(1.0, 
                this.layerParameters[layerType].morphProgress + 0.3);
        });
    }

    resetVisualizer() {
        this.layerParameters = this.getDefaultLayerParameters();
    }

    setVisibility(visible) {
        this.isVisible = visible;
        this.layers.forEach(contextInfo => {
            contextInfo.isActive = visible;
            if (contextInfo.canvas) {
                contextInfo.canvas.style.display = visible ? 'block' : 'none';
            }
        });
    }

    destroy() {
        // Context pool will handle context cleanup
        this.layers.forEach(contextInfo => {
            if (contextInfo.canvas && contextInfo.canvas.parentNode) {
                contextInfo.canvas.parentNode.removeChild(contextInfo.canvas);
            }
        });
        
        this.layers.clear();
    }
}

// Make classes available globally for direct instantiation
window.ClearSeasContextPool = ClearSeasContextPool;
window.MultiLayerVisualizerManager = MultiLayerVisualizerManager;

// Export for ES6 modules
export { ClearSeasContextPool, MultiLayerVisualizerManager };
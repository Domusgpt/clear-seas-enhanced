/*
 * WOAH CARD METAMORPHOSIS ENGINE
 * Beyond anything ever done - cards transform, split, merge, bleed, reflect
 * 
 * Inspired by visual codex demos: hypercube lattice, moire effects, glassmorphism
 * This creates the "WOAH" effect where cards become living, breathing entities
 */

class WOAHCardMetamorphosisEngine {
  constructor() {
    this.activeCard = null;
    this.metamorphosisStage = 'dormant'; // dormant -> awakening -> expansion -> split -> merge -> transcend
    this.cardTransformations = new Map();
    this.holographicBackground = null;
    this.mirrorReflections = [];
    this.chromaticLayers = [];
    
    this.metamorphosisSequence = [
      {
        name: 'DORMANT',
        duration: 0,
        trigger: 'scroll_proximity',
        effects: ['normal_card_state']
      },
      {
        name: 'AWAKENING',
        duration: 800,
        trigger: 'card_focus',
        effects: ['glow_emergence', 'subtle_scale', 'depth_lift']
      },
      {
        name: 'EXPANSION', 
        duration: 1200,
        trigger: 'continued_scroll',
        effects: ['dramatic_scale', 'content_morph', 'shape_shift']
      },
      {
        name: 'METAMORPHOSIS',
        duration: 1500,
        trigger: 'scroll_threshold',
        effects: ['card_split', 'mirror_generation', 'background_bleed']
      },
      {
        name: 'TRANSCENDENCE',
        duration: 2000,
        trigger: 'full_transformation',
        effects: ['holographic_merge', 'chromatic_occlusion', 'new_card_birth']
      }
    ];
    
    this.init();
  }
  
  init() {
    this.createMetamorphosisStage();
    this.setupCardInterceptors();
    this.initializeHolographicBackground();
    this.setupScrollTriggers();
    this.createChromaticOcclusionSystem();
    
    console.log('🌟 WOAH Card Metamorphosis Engine - Reality bending ready');
  }
  
  createMetamorphosisStage() {
    // Create the stage where card transformations happen
    this.stage = document.createElement('div');
    this.stage.className = 'metamorphosis-stage';
    this.stage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
      perspective: 2000px;
      transform-style: preserve-3d;
    `;
    document.body.appendChild(this.stage);
    
    // Create holographic background container
    this.holographicContainer = document.createElement('div');
    this.holographicContainer.className = 'holographic-container';
    this.holographicContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, transparent, rgba(0,255,255,0.1), transparent);
      opacity: 0;
      transition: opacity 2s ease;
      transform-style: preserve-3d;
    `;
    this.stage.appendChild(this.holographicContainer);
  }
  
  setupCardInterceptors() {
    // Intercept all card interactions and transform them into metamorphosis events
    const cards = document.querySelectorAll('.tech-card, .portfolio-item, .paper-card');
    
    cards.forEach((card, index) => {
      const cardData = {
        originalElement: card,
        holographicClone: null,
        mirrorHalf1: null,
        mirrorHalf2: null,
        metamorphosisStage: 'dormant',
        transformMatrix: this.createTransformMatrix(),
        chromaticLayers: [],
        isActive: false
      };
      
      this.cardTransformations.set(card.id, cardData);
      
      // Setup intersection observer for metamorphosis triggering
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            this.triggerCardMetamorphosis(card, 'scroll_proximity');
          } else if (!entry.isIntersecting) {
            this.triggerCardReversion(card);
          }
        });
      }, {
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
        rootMargin: '20% 0px 20% 0px'
      });
      
      observer.observe(card);
    });
  }
  
  initializeHolographicBackground() {
    // Create holographic background canvas
    this.holographicCanvas = document.createElement('canvas');
    this.holographicCanvas.id = 'holographic-background-canvas';
    this.holographicCanvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: -1;
      opacity: 0.3;
    `;
    
    document.body.appendChild(this.holographicCanvas);
    
    // Setup WebGL context with error handling
    try {
      this.holographicGL = this.holographicCanvas.getContext('webgl') || 
                          this.holographicCanvas.getContext('experimental-webgl');
                          
      if (!this.holographicGL) {
        console.warn('⚠️ WebGL not supported, holographic background disabled');
        return;
      }
      
      // Resize canvas
      this.resizeHolographicCanvas();
      window.addEventListener('resize', () => this.resizeHolographicCanvas());
      
      // Initialize simple holographic shader
      this.initializeHolographicShaders();
      
      console.log('✨ Holographic background initialized');
      
    } catch (error) {
      console.warn('⚠️ Failed to initialize holographic background:', error);
    }
  }
  
  resizeHolographicCanvas() {
    if (!this.holographicCanvas || !this.holographicGL) return;
    
    const dpr = window.devicePixelRatio || 1;
    const canvas = this.holographicCanvas;
    const gl = this.holographicGL;
    
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  
  initializeHolographicShaders() {
    if (!this.holographicGL) return;
    
    const gl = this.holographicGL;
    
    // Simple vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = (a_position + 1.0) * 0.5;
      }
    `;
    
    // Simple holographic fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_uv;
      
      void main() {
        vec2 uv = v_uv;
        float time = u_time * 0.001;
        
        // Simple holographic pattern
        float pattern = sin(uv.x * 20.0 + time) * sin(uv.y * 20.0 + time * 1.3);
        float shimmer = sin(time * 2.0 + uv.x * 50.0) * 0.1;
        
        vec3 color = vec3(0.0, 0.8 + shimmer, 1.0) * (pattern * 0.3 + 0.1);
        gl_FragColor = vec4(color, 0.2);
      }
    `;
    
    try {
      // Create and compile shaders
      const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      
      if (!vertexShader || !fragmentShader) {
        console.warn('⚠️ Failed to compile holographic shaders');
        return;
      }
      
      // Create program
      this.holographicProgram = gl.createProgram();
      gl.attachShader(this.holographicProgram, vertexShader);
      gl.attachShader(this.holographicProgram, fragmentShader);
      gl.linkProgram(this.holographicProgram);
      
      if (!gl.getProgramParameter(this.holographicProgram, gl.LINK_STATUS)) {
        console.warn('⚠️ Failed to link holographic program:', gl.getProgramInfoLog(this.holographicProgram));
        return;
      }
      
      // Get attribute and uniform locations
      this.holographicAttributes = {
        position: gl.getAttribLocation(this.holographicProgram, 'a_position')
      };
      
      this.holographicUniforms = {
        time: gl.getUniformLocation(this.holographicProgram, 'u_time'),
        resolution: gl.getUniformLocation(this.holographicProgram, 'u_resolution')
      };
      
      // Create vertex buffer for fullscreen quad
      this.holographicBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.holographicBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  1, -1,  -1, 1,
        -1, 1,   1, -1,   1, 1
      ]), gl.STATIC_DRAW);
      
      // Start render loop
      this.renderHolographicBackground();
      
    } catch (error) {
      console.warn('⚠️ Error setting up holographic shaders:', error);
    }
  }
  
  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('⚠️ Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  renderHolographicBackground() {
    if (!this.holographicGL || !this.holographicProgram) return;
    
    const gl = this.holographicGL;
    
    // Clear and setup
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.holographicProgram);
    
    // Set uniforms
    gl.uniform1f(this.holographicUniforms.time, performance.now());
    gl.uniform2f(this.holographicUniforms.resolution, gl.canvas.width, gl.canvas.height);
    
    // Bind vertex buffer and draw
    gl.bindBuffer(gl.ARRAY_BUFFER, this.holographicBuffer);
    gl.enableVertexAttribArray(this.holographicAttributes.position);
    gl.vertexAttribPointer(this.holographicAttributes.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    // Continue animation
    requestAnimationFrame(() => this.renderHolographicBackground());
  }
  
  createTransformMatrix() {
    return {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      skew: { x: 0, y: 0 },
      perspective: 1000,
      filters: {
        blur: 0,
        brightness: 1,
        contrast: 1,
        hueRotate: 0,
        saturate: 1,
        opacity: 1
      }
    };
  }
  
  triggerCardMetamorphosis(card, trigger) {
    const cardData = this.cardTransformations.get(card.id);
    if (!cardData || cardData.isActive) return;
    
    console.log(`🌟 METAMORPHOSIS TRIGGERED: ${card.id} - ${trigger}`);
    cardData.isActive = true;
    this.activeCard = card;
    
    // Activate related visual systems
    if (window.tetrahedronLattice) {
      const rect = card.getBoundingClientRect();
      window.tetrahedronLattice.activateCardInfluence(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        1.0
      );
      window.tetrahedronLattice.setMorphFactor(1.5);
    }
    
    if (window.glitchChromatic) {
      window.glitchChromatic.activateGlitchForCard(card, 0.8);
    }
    
    if (window.hypercubeMoireEngine) {
      const scrollProgress = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
      window.hypercubeMoireEngine.updateScrollIntensity(scrollProgress * 2);
    }
    
    // Start the metamorphosis sequence
    this.executeMetamorphosisSequence(cardData, 0);
  }
  
  async executeMetamorphosisSequence(cardData, stageIndex) {
    if (stageIndex >= this.metamorphosisSequence.length) {
      this.completeMetamorphosis(cardData);
      return;
    }
    
    const stage = this.metamorphosisSequence[stageIndex];
    console.log(`🎭 METAMORPHOSIS STAGE: ${stage.name}`);
    
    cardData.metamorphosisStage = stage.name.toLowerCase();
    
    // Execute stage effects in parallel
    const effectPromises = stage.effects.map(effect => this.executeEffect(cardData, effect));
    
    // Wait for stage completion
    await Promise.all(effectPromises);
    await this.waitForDuration(stage.duration);
    
    // Continue to next stage
    this.executeMetamorphosisSequence(cardData, stageIndex + 1);
  }
  
  async executeEffect(cardData, effectName) {
    const card = cardData.originalElement;
    const rect = card.getBoundingClientRect();
    
    switch(effectName) {
      case 'glow_emergence':
        return this.createGlowEmergence(cardData, rect);
      
      case 'dramatic_scale':
        return this.createDramaticScale(cardData, rect);
        
      case 'card_split':
        return this.createCardSplit(cardData, rect);
        
      case 'mirror_generation':
        return this.createMirrorReflection(cardData, rect);
        
      case 'background_bleed':
        return this.createBackgroundBleed(cardData, rect);
        
      case 'holographic_merge':
        return this.createHolographicMerge(cardData, rect);
        
      case 'chromatic_occlusion':
        return this.createChromaticOcclusion(cardData, rect);
        
      case 'new_card_birth':
        return this.createNewCardBirth(cardData, rect);
    }
  }
  
  async createGlowEmergence(cardData, rect) {
    const card = cardData.originalElement;
    
    // Create holographic glow effect
    const glowLayer = document.createElement('div');
    glowLayer.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background: radial-gradient(ellipse at center, 
        rgba(0, 255, 255, 0.3) 0%, 
        rgba(255, 0, 255, 0.2) 50%, 
        transparent 70%);
      border-radius: 15px;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      z-index: 999;
      filter: blur(20px);
    `;
    
    this.stage.appendChild(glowLayer);
    
    // Animate glow emergence
    requestAnimationFrame(() => {
      glowLayer.style.opacity = '1';
      glowLayer.style.transform = 'scale(1.2)';
      glowLayer.style.filter = 'blur(10px)';
    });
    
    cardData.chromaticLayers.push(glowLayer);
    
    return new Promise(resolve => setTimeout(resolve, 800));
  }
  
  async createDramaticScale(cardData, rect) {
    const card = cardData.originalElement;
    
    // Transform original card dramatically
    card.style.transition = 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
    card.style.transform = `
      scale(1.5) 
      translateZ(100px) 
      rotateY(15deg) 
      rotateX(5deg)
    `;
    card.style.filter = 'brightness(1.3) contrast(1.2) saturate(1.4)';
    card.style.boxShadow = `
      0 50px 100px rgba(0, 0, 0, 0.4),
      0 0 80px rgba(0, 255, 255, 0.4),
      inset 0 0 60px rgba(255, 255, 255, 0.1)
    `;
    
    return new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  async createCardSplit(cardData, rect) {
    const card = cardData.originalElement;
    
    // Create two mirror halves
    const leftHalf = this.createCardHalf(cardData, rect, 'left');
    const rightHalf = this.createCardHalf(cardData, rect, 'right');
    
    cardData.mirrorHalf1 = leftHalf;
    cardData.mirrorHalf2 = rightHalf;
    
    this.stage.appendChild(leftHalf);
    this.stage.appendChild(rightHalf);
    
    // Animate the split
    requestAnimationFrame(() => {
      leftHalf.style.transform = `
        translateX(-50%) 
        rotateY(-45deg) 
        translateZ(50px)
        scale(1.1)
      `;
      
      rightHalf.style.transform = `
        translateX(50%) 
        rotateY(45deg) 
        translateZ(50px)
        scale(1.1)
      `;
      
      // Hide original card during split
      card.style.opacity = '0';
    });
    
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  createCardHalf(cardData, rect, side) {
    const card = cardData.originalElement;
    const half = card.cloneNode(true);
    
    half.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      transform-origin: center center;
      transition: all 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      pointer-events: none;
      z-index: 998;
      overflow: hidden;
      
      background: linear-gradient(
        ${side === 'left' ? '90deg' : '270deg'}, 
        rgba(0, 255, 255, 0.2) 0%, 
        rgba(255, 0, 255, 0.1) 50%, 
        transparent 100%
      );
      
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      
      clip-path: polygon(
        ${side === 'left' ? '0% 0%, 50% 0%, 45% 100%, 0% 100%' : '50% 0%, 100% 0%, 100% 100%, 55% 100%'}
      );
    `;
    
    return half;
  }
  
  async createMirrorReflection(cardData, rect) {
    // Create mirror reflection that bleeds into background
    const mirror = document.createElement('div');
    mirror.style.cssText = `
      position: fixed;
      top: ${rect.top + rect.height}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      transform: scaleY(-1);
      opacity: 0;
      transition: all 2s ease;
      pointer-events: none;
      z-index: 997;
      
      background: linear-gradient(
        180deg,
        rgba(0, 255, 255, 0.1) 0%,
        rgba(255, 0, 255, 0.05) 50%,
        transparent 100%
      );
      
      filter: blur(5px) brightness(0.5);
    `;
    
    this.stage.appendChild(mirror);
    
    // Animate mirror emergence
    requestAnimationFrame(() => {
      mirror.style.opacity = '0.6';
      mirror.style.transform = 'scaleY(-0.8) translateY(-20px)';
    });
    
    this.mirrorReflections.push(mirror);
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  async createBackgroundBleed(cardData, rect) {
    // Make the card halves bleed into holographic background
    this.holographicContainer.style.opacity = '1';
    this.holographicContainer.style.background = `
      radial-gradient(
        ellipse at ${rect.left + rect.width/2}px ${rect.top + rect.height/2}px,
        rgba(0, 255, 255, 0.3) 0%,
        rgba(255, 0, 255, 0.2) 30%,
        rgba(0, 255, 255, 0.1) 60%,
        transparent 100%
      )
    `;
    
    // Create bleeding effect
    const bleedLayers = [];
    for (let i = 0; i < 5; i++) {
      const bleedLayer = document.createElement('div');
      bleedLayer.style.cssText = `
        position: absolute;
        top: ${rect.top - i * 10}px;
        left: ${rect.left - i * 10}px;
        width: ${rect.width + i * 20}px;
        height: ${rect.height + i * 20}px;
        border: 2px solid rgba(0, 255, 255, ${0.3 - i * 0.05});
        border-radius: 15px;
        opacity: 0;
        transition: opacity 0.5s ease ${i * 0.1}s;
        pointer-events: none;
      `;
      
      this.holographicContainer.appendChild(bleedLayer);
      bleedLayers.push(bleedLayer);
      
      setTimeout(() => {
        bleedLayer.style.opacity = '1';
      }, i * 100);
    }
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  async createChromaticOcclusion(cardData, rect) {
    // Create chromatic aberration and occlusion effects
    const chromaticLayers = ['red', 'green', 'blue'];
    const offsetMultiplier = [2, -1, 1.5];
    
    // Use advanced glitch chromatic processor if available
    if (window.glitchChromatic) {
      window.glitchChromatic.createChromaticOcclusion(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        Math.max(rect.width, rect.height) / 2,
        1.0
      );
      window.glitchChromatic.setChromaticShift(0.8);
    }
    
    chromaticLayers.forEach((color, index) => {
      const chromaticLayer = document.createElement('div');
      const offset = offsetMultiplier[index];
      
      chromaticLayer.style.cssText = `
        position: fixed;
        top: ${rect.top + offset}px;
        left: ${rect.left + offset}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border-radius: 15px;
        opacity: 0.3;
        mix-blend-mode: screen;
        transition: all 1s ease ${index * 0.2}s;
        pointer-events: none;
        z-index: ${996 - index};
        
        background: ${color === 'red' ? 'rgba(255, 0, 0, 0.4)' : 
                    color === 'green' ? 'rgba(0, 255, 0, 0.4)' : 
                    'rgba(0, 0, 255, 0.4)'};
        
        filter: blur(2px);
      `;
      
      this.stage.appendChild(chromaticLayer);
      cardData.chromaticLayers.push(chromaticLayer);
      
      // Animate chromatic separation
      setTimeout(() => {
        chromaticLayer.style.transform = `
          translate(${offset * 3}px, ${offset * 2}px)
          scale(${1 + index * 0.1})
        `;
      }, index * 200);
    });
    
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  async createNewCardBirth(cardData, rect) {
    // Birth new holographic card from the metamorphosis
    const newCard = document.createElement('div');
    const nextContent = this.generateNextContent();
    
    newCard.innerHTML = nextContent;
    newCard.className = 'holographic-transcended-card';
    newCard.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      transform: scale(0) rotateY(180deg);
      opacity: 0;
      transition: all 2s cubic-bezier(0.2, 0.8, 0.2, 1);
      pointer-events: none;
      z-index: 1001;
      
      background: linear-gradient(
        135deg,
        rgba(0, 255, 255, 0.1) 0%,
        rgba(255, 0, 255, 0.1) 50%,
        rgba(0, 255, 255, 0.1) 100%
      );
      
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      padding: 20px;
      
      box-shadow: 
        0 50px 100px rgba(0, 0, 0, 0.5),
        0 0 100px rgba(0, 255, 255, 0.3),
        inset 0 0 80px rgba(255, 255, 255, 0.1);
    `;
    
    this.stage.appendChild(newCard);
    
    // Animate new card birth
    requestAnimationFrame(() => {
      newCard.style.transform = 'scale(1) rotateY(0deg)';
      newCard.style.opacity = '1';
    });
    
    // Make it interactive after birth
    setTimeout(() => {
      newCard.style.pointerEvents = 'auto';
    }, 2000);
    
    return new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  generateNextContent() {
    const contents = [
      `<h3>Transcended Reality</h3><p>Where technology meets consciousness in infinite dimensions.</p>`,
      `<h3>Holographic Futures</h3><p>Beyond the boundaries of conventional user experience.</p>`,
      `<h3>Metamorphic Interfaces</h3><p>Interfaces that evolve, adapt, and transform with intention.</p>`,
      `<h3>Quantum Aesthetics</h3><p>Visual experiences that exist in superposition until observed.</p>`
    ];
    
    return contents[Math.floor(Math.random() * contents.length)];
  }
  
  async waitForDuration(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  triggerCardReversion(card) {
    const cardData = this.cardTransformations.get(card.id);
    if (!cardData || !cardData.isActive) return;
    
    console.log(`🔄 REVERTING METAMORPHOSIS: ${card.id}`);
    
    // Revert original card
    card.style.transition = 'all 1s ease';
    card.style.transform = 'scale(1) translateZ(0) rotateY(0) rotateX(0)';
    card.style.filter = 'brightness(1) contrast(1) saturate(1)';
    card.style.boxShadow = 'none';
    card.style.opacity = '1';
    
    // Clean up metamorphosis artifacts
    cardData.chromaticLayers.forEach(layer => {
      layer.style.opacity = '0';
      setTimeout(() => layer.remove(), 1000);
    });
    
    if (cardData.mirrorHalf1) {
      cardData.mirrorHalf1.style.opacity = '0';
      setTimeout(() => cardData.mirrorHalf1.remove(), 1000);
    }
    
    if (cardData.mirrorHalf2) {
      cardData.mirrorHalf2.style.opacity = '0';
      setTimeout(() => cardData.mirrorHalf2.remove(), 1000);
    }
    
    // Fade holographic background
    this.holographicContainer.style.opacity = '0';
    
    // Reset card data
    cardData.isActive = false;
    cardData.metamorphosisStage = 'dormant';
    cardData.chromaticLayers = [];
    cardData.mirrorHalf1 = null;
    cardData.mirrorHalf2 = null;
  }
  
  completeMetamorphosis(cardData) {
    console.log(`✨ METAMORPHOSIS COMPLETE: ${cardData.originalElement.id}`);
    
    // Keep some elements persistent for a while
    setTimeout(() => {
      this.triggerCardReversion(cardData.originalElement);
    }, 5000);
  }
  
  setupScrollTriggers() {
    let lastScrollY = 0;
    let scrollDirection = 'down';
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.pageYOffset;
      scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      lastScrollY = currentScrollY;
      
      // Trigger metamorphosis based on scroll behavior
      if (Math.abs(currentScrollY - lastScrollY) > 50) {
        this.evaluateMetamorphosisTriggers();
      }
    }, { passive: true });
  }
  
  evaluateMetamorphosisTriggers() {
    // Evaluate which cards should undergo metamorphosis
    this.cardTransformations.forEach((cardData, cardId) => {
      const card = cardData.originalElement;
      const rect = card.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      
      // Trigger if card is near viewport center
      if (Math.abs(rect.top + rect.height / 2 - viewportCenter) < 100) {
        if (!cardData.isActive) {
          this.triggerCardMetamorphosis(card, 'scroll_focus');
        }
      }
    });
  }
  
  createChromaticOcclusionSystem() {
    // Add global chromatic occlusion effects
    const style = document.createElement('style');
    style.textContent = `
      .holographic-transcended-card {
        animation: holographic-float 6s ease-in-out infinite;
      }
      
      @keyframes holographic-float {
        0%, 100% { 
          transform: translateY(0) rotateX(0) rotateY(0);
          filter: hue-rotate(0deg);
        }
        25% { 
          transform: translateY(-10px) rotateX(2deg) rotateY(-1deg);
          filter: hue-rotate(90deg);
        }
        50% { 
          transform: translateY(-5px) rotateX(-1deg) rotateY(1deg);
          filter: hue-rotate(180deg);
        }
        75% { 
          transform: translateY(-8px) rotateX(1deg) rotateY(-2deg);
          filter: hue-rotate(270deg);
        }
      }
      
      .metamorphosis-stage {
        animation: ambient-energy 20s ease-in-out infinite;
      }
      
      @keyframes ambient-energy {
        0%, 100% { 
          filter: hue-rotate(0deg) brightness(1);
        }
        33% { 
          filter: hue-rotate(120deg) brightness(1.1);
        }
        66% { 
          filter: hue-rotate(240deg) brightness(1.05);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  // Wait for other systems to load
  setTimeout(() => {
    window.woahCardMetamorphosisEngine = new WOAHCardMetamorphosisEngine();
    console.log('🌟 WOAH Card Metamorphosis Engine - Reality bending activated');
  }, 1000);
});
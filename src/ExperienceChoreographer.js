/**
 * CLEAR SEAS EXPERIENCE CHOREOGRAPHER
 * Orchestrates the entire user experience with scroll-based choreography,
 * card transformations, visualizer flows, and dynamic presentations
 */

class ExperienceChoreographer {
    constructor() {
        this.currentSection = null;
        this.scrollPosition = 0;
        this.windowHeight = window.innerHeight;
        this.isInitialized = false;
        
        // Experience sections with choreography rules
        this.sections = new Map();
        this.visualizerFlow = new Map();
        this.transformationStates = new Map();
        
        // Performance tracking
        this.lastScrollTime = 0;
        this.scrollVelocity = 0;
        this.experienceState = {
            intensity: 1.0,
            focusedElement: null,
            activeSystem: 'FACETED',
            flowDirection: 'forward',
            transformationProgress: 0.0
        };
        
        this.boundEvents = {};
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🎭 Initializing Experience Choreographer...');
        
        // Map all experience sections
        this.mapExperienceSections();
        
        // Initialize visualizer flow system
        this.initializeVisualizerFlow();
        
        // Setup event orchestration
        this.setupEventOrchestration();
        
        // Start the choreography loop
        this.startChoreographyLoop();
        
        this.isInitialized = true;
        console.log('✅ Experience Choreographer Ready!');
    }

    mapExperienceSections() {
        const sectionConfigs = [
            {
                id: 'hero',
                element: document.querySelector('.hero-section'),
                visualizerSystem: 'FACETED',
                choreography: {
                    entry: 'dramatic_reveal',
                    active: 'flowing_morph',
                    exit: 'elegant_fade',
                    cardSize: 'hero',
                    visualizerIntensity: 1.5
                },
                scrollTriggers: { start: 0, peak: 0.3, end: 0.6 }
            },
            {
                id: 'technology',
                element: document.querySelector('.technology-section'),
                visualizerSystem: 'QUANTUM',
                choreography: {
                    entry: 'cascade_in',
                    active: 'lattice_dance',
                    exit: 'quantum_dissolve',
                    cardSize: 'large',
                    visualizerIntensity: 1.3
                },
                scrollTriggers: { start: 0.15, peak: 0.5, end: 0.8 }
            },
            {
                id: 'work',
                element: document.querySelector('.work-section'),
                visualizerSystem: 'HOLOGRAPHIC',
                choreography: {
                    entry: 'holographic_materialize',
                    active: 'prismatic_flow',
                    exit: 'shimmer_out',
                    cardSize: 'medium',
                    visualizerIntensity: 1.6
                },
                scrollTriggers: { start: 0.4, peak: 0.7, end: 0.95 }
            },
            {
                id: 'publications',
                element: document.querySelector('.publications-section'),
                visualizerSystem: 'POLYCHORA',
                choreography: {
                    entry: '4d_unfold',
                    active: 'polytope_rotation',
                    exit: 'dimensional_collapse',
                    cardSize: 'compact',
                    visualizerIntensity: 2.0
                },
                scrollTriggers: { start: 0.6, peak: 0.85, end: 1.0 }
            }
        ];

        sectionConfigs.forEach(config => {
            if (config.element) {
                this.sections.set(config.id, config);
                console.log(`📍 Mapped section: ${config.id} (${config.visualizerSystem})`);
            }
        });
    }

    initializeVisualizerFlow() {
        // Create visualizer flow connections between elements
        const flowConnections = [
            { from: 'hero', to: 'technology', transition: 'morph_faceted_to_quantum' },
            { from: 'technology', to: 'work', transition: 'quantum_to_holographic_shift' },
            { from: 'work', to: 'publications', transition: 'holographic_to_4d_transform' }
        ];

        flowConnections.forEach(connection => {
            this.visualizerFlow.set(connection.from, connection);
        });

        // Initialize cards within sections
        this.initializeCardChoreography();
    }

    initializeCardChoreography() {
        const cards = document.querySelectorAll('.unified-card');
        
        cards.forEach((card, index) => {
            const section = this.findCardSection(card);
            const cardId = `card-${section}-${index}`;
            
            // Setup card transformation states
            this.transformationStates.set(cardId, {
                element: card,
                section: section,
                baseSize: this.getCardBaseSize(card),
                currentTransform: {
                    scale: 1.0,
                    translateY: 0,
                    rotationX: 0,
                    rotationY: 0,
                    morphProgress: 0.0
                },
                visualizer: this.findCardVisualizer(card),
                choreographyRules: this.getCardChoreographyRules(section, index)
            });
            
            console.log(`🎯 Initialized card choreography: ${cardId}`);
        });
    }

    setupEventOrchestration() {
        // Scroll choreography
        this.boundEvents.scroll = this.onScroll.bind(this);
        window.addEventListener('scroll', this.boundEvents.scroll, { passive: true });
        
        // Resize orchestration
        this.boundEvents.resize = this.onResize.bind(this);
        window.addEventListener('resize', this.boundEvents.resize, { passive: true });
        
        // Mouse choreography
        this.boundEvents.mousemove = this.onMouseMove.bind(this);
        document.addEventListener('mousemove', this.boundEvents.mousemove, { passive: true });
        
        // Card interaction choreography
        document.querySelectorAll('.unified-card').forEach(card => {
            const cardEnter = this.onCardEnter.bind(this);
            const cardLeave = this.onCardLeave.bind(this);
            const cardMove = this.onCardMouseMove.bind(this);
            
            card.addEventListener('mouseenter', cardEnter);
            card.addEventListener('mouseleave', cardLeave);
            card.addEventListener('mousemove', cardMove);
        });
    }

    startChoreographyLoop() {
        const choreographyFrame = () => {
            this.updateExperienceState();
            this.orchestrateVisualizers();
            this.choreographTransformations();
            this.updateVisualizerFlow();
            
            requestAnimationFrame(choreographyFrame);
        };
        
        choreographyFrame();
    }

    onScroll(event) {
        const now = Date.now();
        const deltaTime = now - this.lastScrollTime;
        const lastScrollPosition = this.scrollPosition;
        
        this.scrollPosition = window.scrollY;
        this.scrollVelocity = (this.scrollPosition - lastScrollPosition) / Math.max(deltaTime, 1);
        this.lastScrollTime = now;
        
        // Determine current section and experience phase
        this.updateCurrentSection();
        this.orchestrateScrollChoreography();
    }

    updateCurrentSection() {
        const scrollProgress = this.scrollPosition / (document.documentElement.scrollHeight - this.windowHeight);
        
        let newSection = null;
        let maxRelevance = 0;
        
        this.sections.forEach((section, id) => {
            const relevance = this.calculateSectionRelevance(section, scrollProgress);
            if (relevance > maxRelevance) {
                maxRelevance = relevance;
                newSection = section;
            }
        });
        
        if (newSection && newSection.id !== this.currentSection?.id) {
            this.transitionToSection(newSection);
        }
        
        this.currentSection = newSection;
        this.experienceState.activeSystem = newSection?.visualizerSystem || 'FACETED';
    }

    calculateSectionRelevance(section, scrollProgress) {
        const { start, peak, end } = section.scrollTriggers;
        
        if (scrollProgress < start || scrollProgress > end) return 0;
        
        if (scrollProgress <= peak) {
            // Rising relevance
            return (scrollProgress - start) / (peak - start);
        } else {
            // Falling relevance
            return 1.0 - ((scrollProgress - peak) / (end - peak));
        }
    }

    transitionToSection(newSection) {
        console.log(`🎬 Transitioning to section: ${newSection.id} (${newSection.visualizerSystem})`);
        
        // Trigger section entry choreography
        this.executeChoreography(newSection.choreography.entry, newSection);
        
        // Update visualizer system focus
        if (window.clearSeasLayeredVIB34D) {
            window.clearSeasLayeredVIB34D.triggerSystemMorphing(newSection.visualizerSystem, newSection.choreography.visualizerIntensity);
        }
        
        // Choreograph card transformations for this section
        this.choreographSectionCards(newSection);
    }

    orchestrateScrollChoreography() {
        const scrollProgress = this.scrollPosition / (document.documentElement.scrollHeight - this.windowHeight);
        
        // Update experience intensity based on scroll velocity and position
        this.experienceState.intensity = Math.min(2.0, 1.0 + Math.abs(this.scrollVelocity) * 0.01);
        this.experienceState.transformationProgress = scrollProgress;
        this.experienceState.flowDirection = this.scrollVelocity > 0 ? 'forward' : 'backward';
        
        // Apply scroll-based transformations
        this.applyScrollTransformations(scrollProgress);
    }

    applyScrollTransformations(scrollProgress) {
        this.transformationStates.forEach((state, cardId) => {
            const section = this.sections.get(state.section);
            if (!section) return;
            
            const sectionRelevance = this.calculateSectionRelevance(section, scrollProgress);
            const choreography = state.choreographyRules;
            
            // Calculate card transformation based on scroll position and section relevance
            const transform = this.calculateCardTransform(state, sectionRelevance, scrollProgress);
            this.applyCardTransform(state.element, transform);
            
            // Update visualizer flow
            if (state.visualizer) {
                this.updateVisualizerForCard(state.visualizer, transform, section.visualizerSystem);
            }
        });
    }

    calculateCardTransform(cardState, sectionRelevance, scrollProgress) {
        const rules = cardState.choreographyRules;
        const baseTransform = cardState.currentTransform;
        
        return {
            scale: this.interpolate(baseTransform.scale, rules.targetScale, sectionRelevance),
            translateY: this.interpolate(0, rules.floatHeight, Math.sin(Date.now() * 0.001 + scrollProgress * 10) * sectionRelevance),
            rotationX: this.interpolate(0, rules.maxRotationX, (scrollProgress - 0.5) * 2 * sectionRelevance),
            rotationY: this.interpolate(0, rules.maxRotationY, Math.sin(scrollProgress * 6) * sectionRelevance),
            morphProgress: sectionRelevance,
            intensity: Math.max(0.3, sectionRelevance * this.experienceState.intensity)
        };
    }

    applyCardTransform(element, transform) {
        const transformString = `
            translateY(${transform.translateY}px)
            scale(${transform.scale})
            rotateX(${transform.rotationX}deg)
            rotateY(${transform.rotationY}deg)
        `;
        
        element.style.transform = transformString;
        element.style.setProperty('--morph-progress', transform.morphProgress);
        element.style.setProperty('--intensity', transform.intensity);
        
        // Update z-index based on transformation
        const zIndex = Math.floor(transform.scale * 100);
        element.style.zIndex = zIndex;
    }

    onCardEnter(event) {
        const card = event.currentTarget;
        const cardId = this.getCardId(card);
        const cardState = this.transformationStates.get(cardId);
        
        if (!cardState) return;
        
        // Trigger card focus choreography
        this.experienceState.focusedElement = card;
        
        // Enhanced card transformation
        const enhancedTransform = {
            scale: 1.15,
            translateY: -20,
            rotationX: 5,
            rotationY: 0,
            morphProgress: 1.0,
            intensity: 2.0
        };
        
        this.animateCardTransform(card, enhancedTransform, 300);
        
        // Trigger visualizer enhancement
        if (cardState.visualizer && window.clearSeasLayeredVIB34D) {
            const section = this.sections.get(cardState.section);
            window.clearSeasLayeredVIB34D.triggerSystemMorphing(section.visualizerSystem, 1.8);
        }
        
        console.log(`🎯 Card focused: ${cardId}`);
    }

    onCardLeave(event) {
        const card = event.currentTarget;
        const cardId = this.getCardId(card);
        
        this.experienceState.focusedElement = null;
        
        // Return to base transformation
        const baseTransform = {
            scale: 1.0,
            translateY: 0,
            rotationX: 0,
            rotationY: 0,
            morphProgress: 0.3,
            intensity: 1.0
        };
        
        this.animateCardTransform(card, baseTransform, 200);
        
        // Reset visualizer intensity
        if (window.clearSeasLayeredVIB34D) {
            window.clearSeasLayeredVIB34D.resetAllSystems();
        }
    }

    onCardMouseMove(event) {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (event.clientX - centerX) / rect.width;
        const deltaY = (event.clientY - centerY) / rect.height;
        
        // Dynamic tilt based on mouse position
        const tiltX = -deltaY * 15; // Invert for natural feel
        const tiltY = deltaX * 15;
        
        card.style.setProperty('--tilt-x', `${tiltX}deg`);
        card.style.setProperty('--tilt-y', `${tiltY}deg`);
    }

    animateCardTransform(element, targetTransform, duration) {
        const startTransform = this.getCurrentTransform(element);
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            const eased = this.easeOutCubic(progress);
            
            const currentTransform = this.interpolateTransform(startTransform, targetTransform, eased);
            this.applyCardTransform(element, currentTransform);
            
            if (progress < 1.0) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Utility methods
    findCardSection(card) {
        let section = 'unknown';
        this.sections.forEach((sectionConfig, id) => {
            if (sectionConfig.element && sectionConfig.element.contains(card)) {
                section = id;
            }
        });
        return section;
    }

    findCardVisualizer(card) {
        return card.querySelector('.vib34d-layer-stack') || card.querySelector('canvas');
    }

    getCardId(card) {
        return card.id || `card-${Array.from(document.querySelectorAll('.unified-card')).indexOf(card)}`;
    }

    getCardChoreographyRules(section, index) {
        const rulesets = {
            hero: { targetScale: 1.2, floatHeight: 30, maxRotationX: 10, maxRotationY: 5 },
            technology: { targetScale: 1.15, floatHeight: 25, maxRotationX: 8, maxRotationY: 8 },
            work: { targetScale: 1.1, floatHeight: 20, maxRotationX: 6, maxRotationY: 10 },
            publications: { targetScale: 1.05, floatHeight: 15, maxRotationX: 5, maxRotationY: 12 }
        };
        return rulesets[section] || rulesets.technology;
    }

    interpolate(start, end, progress) {
        return start + (end - start) * progress;
    }

    interpolateTransform(start, end, progress) {
        return {
            scale: this.interpolate(start.scale, end.scale, progress),
            translateY: this.interpolate(start.translateY, end.translateY, progress),
            rotationX: this.interpolate(start.rotationX, end.rotationX, progress),
            rotationY: this.interpolate(start.rotationY, end.rotationY, progress),
            morphProgress: this.interpolate(start.morphProgress, end.morphProgress, progress),
            intensity: this.interpolate(start.intensity, end.intensity, progress)
        };
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    getCurrentTransform(element) {
        const computedStyle = getComputedStyle(element);
        const matrix = computedStyle.transform;
        
        // Parse transform matrix or return defaults
        return {
            scale: 1.0,
            translateY: 0,
            rotationX: 0,
            rotationY: 0,
            morphProgress: 0.0,
            intensity: 1.0
        };
    }

    updateExperienceState() {
        // Update global experience state for other systems to use
        window.experienceState = this.experienceState;
    }

    orchestrateVisualizers() {
        // This method is called every frame to orchestrate visualizer changes
        if (!window.clearSeasLayeredVIB34D || !this.currentSection) return;
        
        // Dynamic visualizer orchestration based on current section and scroll state
        // Implementation depends on the layered VIB34D system
    }

    choreographTransformations() {
        // Apply continuous transformations based on experience state
        document.documentElement.style.setProperty('--experience-intensity', this.experienceState.intensity);
        document.documentElement.style.setProperty('--transformation-progress', this.experienceState.transformationProgress);
    }

    updateVisualizerFlow() {
        // Update visualizer flow between sections
        // Implementation for flowing visualizers between elements
    }

    executeChoreography(choreographyType, section) {
        // Execute specific choreography animations
        console.log(`🎭 Executing ${choreographyType} choreography for ${section.id}`);
    }

    choreographSectionCards(section) {
        // Apply section-specific card choreography
        this.transformationStates.forEach((state, cardId) => {
            if (state.section === section.id) {
                // Apply section-specific transformations
            }
        });
    }

    getCardBaseSize(card) {
        // Get the base size of a card for transformation calculations
        const rect = card.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(card);
        
        return {
            width: rect.width,
            height: rect.height,
            padding: {
                top: parseFloat(computedStyle.paddingTop) || 0,
                right: parseFloat(computedStyle.paddingRight) || 0, 
                bottom: parseFloat(computedStyle.paddingBottom) || 0,
                left: parseFloat(computedStyle.paddingLeft) || 0
            },
            margin: {
                top: parseFloat(computedStyle.marginTop) || 0,
                right: parseFloat(computedStyle.marginRight) || 0,
                bottom: parseFloat(computedStyle.marginBottom) || 0, 
                left: parseFloat(computedStyle.marginLeft) || 0
            }
        };
    }

    updateVisualizerForCard(cardId, transformState) {
        // Update visualizer parameters based on card transformation state
        const card = transformState.element;
        if (!card) return;
        
        // Find visualizer container within the card
        const visualizerContainer = card.querySelector('.layered-vib34d-container');
        if (!visualizerContainer || !window.contextPool) return;
        
        // Get the visualizer ID from the container's associated visualizer
        const visualizerId = visualizerContainer.dataset.visualizerId;
        if (!visualizerId) return;
        
        // Update visualizer parameters based on transformation state
        const visualizer = window.contextPool.visualizers.get(visualizerId);
        if (visualizer) {
            const intensity = 1.0 + (transformState.currentTransform.scale - 1.0) * 0.5;
            const morphProgress = Math.abs(transformState.currentTransform.rotationX) / 30.0;
            
            visualizer.updateParameters({
                background: { intensity: intensity * 0.8, morphProgress: morphProgress },
                content: { intensity: intensity, morphProgress: morphProgress },
                highlight: { intensity: intensity * 1.2, morphProgress: morphProgress }
            });
        }
    }

    destroy() {
        // Clean up all event listeners
        Object.entries(this.boundEvents).forEach(([event, handler]) => {
            if (event === 'scroll' || event === 'resize') {
                window.removeEventListener(event, handler);
            } else {
                document.removeEventListener(event, handler);
            }
        });
        
        console.log('🎭 Experience Choreographer destroyed');
    }
}

// Global instance
window.experienceChoreographer = new ExperienceChoreographer();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.experienceChoreographer.initialize();
    });
} else {
    window.experienceChoreographer.initialize();
}

export { ExperienceChoreographer };
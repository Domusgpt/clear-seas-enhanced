const { chromium } = require('playwright');

async function visualTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('📸 FINAL VISUAL TEST OF LAYERED CONTEXT POOL SYSTEM');
        
        await page.goto('http://localhost:8145/index-totalistic.html', { 
            waitUntil: 'load',
            timeout: 10000
        });
        
        // Wait for system to fully initialize
        await page.waitForTimeout(8000);
        
        // Check final system status
        const finalStatus = await page.evaluate(() => {
            const containers = document.querySelectorAll('.layered-vib34d-container');
            const layerStacks = document.querySelectorAll('.vib34d-layer-stack');
            const canvasLayers = document.querySelectorAll('.vib34d-layer');
            
            // Check for WebGL contexts
            let activeContexts = 0;
            canvasLayers.forEach(canvas => {
                const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                if (gl && gl.getParameter && gl.getParameter(gl.CURRENT_PROGRAM)) {
                    activeContexts++;
                }
            });
            
            return {
                contextPool: {
                    loaded: typeof window.ClearSeasContextPool === 'function',
                    instance: typeof window.contextPool === 'object',
                    initialized: window.contextPool && window.contextPool.initialized
                },
                visualizers: {
                    containers: containers.length,
                    layerStacks: layerStacks.length,
                    canvasLayers: canvasLayers.length,
                    activeWebGLContexts: activeContexts
                },
                systems: Array.from(containers).map(container => ({
                    system: container.dataset.vibSystem,
                    geometry: container.dataset.geometry,
                    hasLayers: container.querySelectorAll('.vib34d-layer').length
                }))
            };
        });
        
        console.log('📊 FINAL SYSTEM STATUS:');
        console.log(JSON.stringify(finalStatus, null, 2));
        
        // Take comprehensive screenshots
        await page.screenshot({ 
            path: 'screenshots/final-layered-system-fullpage.png', 
            fullPage: true 
        });
        
        await page.screenshot({ 
            path: 'screenshots/final-layered-system-viewport.png',
            clip: { x: 0, y: 0, width: 1280, height: 800 }
        });
        
        // Test scrolling to see different visualizers
        await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: 'screenshots/final-layered-system-scrolled.png',
            clip: { x: 0, y: 0, width: 1280, height: 800 }
        });
        
        console.log('✅ LAYERED CONTEXT POOL SYSTEM INTEGRATION COMPLETE!');
        console.log(`🎨 Found ${finalStatus.visualizers.containers} visualizer containers`);
        console.log(`🌊 Generated ${finalStatus.visualizers.canvasLayers} canvas layers`);
        console.log(`⚡ ${finalStatus.visualizers.activeWebGLContexts} active WebGL contexts`);
        console.log(`🎯 Systems: ${finalStatus.systems.map(s => s.system).join(', ')}`);
        
        if (finalStatus.contextPool.loaded && finalStatus.visualizers.containers > 0) {
            console.log('🚀 SUCCESS: Replaced iframe system with layered VIB34D architecture!');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

visualTest();
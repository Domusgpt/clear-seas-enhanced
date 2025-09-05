const { chromium } = require('playwright');

async function testVIB34DIntegration() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌊 Testing Complete VIB34D Integration...');
        
        // Collect console logs
        page.on('console', msg => {
            console.log(`Browser ${msg.type()}: ${msg.text()}`);
        });
        
        // Navigate to the new VIB34D integrated page
        await page.goto('https://domusgpt.github.io/clear-seas-enhanced/index-vib34d-integrated.html', { 
            waitUntil: 'load',
            timeout: 15000
        });
        
        // Wait for VIB34D system to initialize
        await page.waitForTimeout(10000);
        
        // Check VIB34D integration status
        const vib34dStatus = await page.evaluate(() => {
            return {
                vib34dApp: typeof window.vib34dApp !== 'undefined',
                canvasManager: typeof window.canvasManager !== 'undefined',
                engineClasses: window.engineClasses ? Object.keys(window.engineClasses).filter(k => window.engineClasses[k]).length : 0,
                switchSystem: typeof window.switchSystem === 'function',
                currentSystem: window.currentSystem || 'unknown',
                containers: {
                    vib34dLayers: !!document.getElementById('vib34dLayers'),
                    quantumLayers: !!document.getElementById('quantumLayers'),
                    holographicLayers: !!document.getElementById('holographicLayers'),
                    polychoraLayers: !!document.getElementById('polychoraLayers'),
                    facetedTechDemo: !!document.getElementById('facetedTechDemo'),
                    quantumTechDemo: !!document.getElementById('quantumTechDemo'),
                    holographicTechDemo: !!document.getElementById('holographicTechDemo'),
                    polychoraTechDemo: !!document.getElementById('polychoraTechDemo')
                },
                canvases: document.querySelectorAll('canvas').length,
                engineInstances: {
                    faceted: typeof window.engine !== 'undefined',
                    quantum: typeof window.quantumEngine !== 'undefined',
                    holographic: typeof window.holographicSystem !== 'undefined',
                    polychora: typeof window.newPolychoraEngine !== 'undefined'
                }
            };
        });
        
        console.log('🎯 VIB34D INTEGRATION STATUS:');
        console.log(JSON.stringify(vib34dStatus, null, 2));
        
        // Test system switching
        console.log('\n🔄 Testing system switching...');
        
        // Test switching to quantum
        await page.click('[data-system="quantum"]');
        await page.waitForTimeout(3000);
        const quantumStatus = await page.evaluate(() => window.currentSystem);
        console.log(`✅ Switched to quantum system: ${quantumStatus}`);
        
        // Test switching to holographic  
        await page.click('[data-system="holographic"]');
        await page.waitForTimeout(3000);
        const holoStatus = await page.evaluate(() => window.currentSystem);
        console.log(`✅ Switched to holographic system: ${holoStatus}`);
        
        // Test switching to polychora
        await page.click('[data-system="polychora"]');
        await page.waitForTimeout(3000);
        const polychoraStatus = await page.evaluate(() => window.currentSystem);
        console.log(`✅ Switched to polychora system: ${polychoraStatus}`);
        
        // Back to faceted
        await page.click('[data-system="faceted"]');
        await page.waitForTimeout(3000);
        const facetedStatus = await page.evaluate(() => window.currentSystem);
        console.log(`✅ Switched back to faceted system: ${facetedStatus}`);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'vib34d-integration-test.png',
            fullPage: true 
        });
        
        // Final status check
        const finalStatus = await page.evaluate(() => {
            const allCanvases = document.querySelectorAll('canvas');
            const activeCanvases = Array.from(allCanvases).filter(c => 
                c.style.display !== 'none' && 
                c.offsetParent !== null
            );
            
            return {
                totalCanvases: allCanvases.length,
                activeCanvases: activeCanvases.length,
                systemWorking: typeof window.switchSystem === 'function',
                vib34dFullyIntegrated: !!(
                    window.vib34dApp && 
                    window.canvasManager && 
                    window.engineClasses && 
                    Object.keys(window.engineClasses).length > 0
                )
            };
        });
        
        console.log('\n📊 FINAL INTEGRATION STATUS:');
        console.log(JSON.stringify(finalStatus, null, 2));
        
        const success = finalStatus.vib34dFullyIntegrated && finalStatus.systemWorking;
        console.log(`\n🚀 VIB34D INTEGRATION ${success ? 'SUCCESS' : 'NEEDS WORK'}`);
        
        return success;
        
    } catch (error) {
        console.error('❌ VIB34D Integration Test Failed:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

testVIB34DIntegration();
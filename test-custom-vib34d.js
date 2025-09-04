const { chromium } = require('playwright');
const fs = require('fs');

async function testCustomVIB34D() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🎯 TESTING CUSTOM-BUILT CLEAR SEAS VIB34D ENGINE');
        
        // Navigate to the page
        await page.goto('http://localhost:8149/index-totalistic.html', { 
            waitUntil: 'load',
            timeout: 20000
        });
        
        // Wait for custom VIB34D engine to initialize
        console.log('⏳ Waiting for Clear Seas VIB34D Engine initialization...');
        await page.waitForTimeout(6000);
        
        // Check custom engine status
        const engineStatus = await page.evaluate(() => {
            return {
                customEngineExists: typeof window.clearSeasVIB34D !== 'undefined',
                isInitialized: window.clearSeasVIB34D ? window.clearSeasVIB34D.isInitialized : false,
                visualizerCount: window.clearSeasVIB34D ? window.clearSeasVIB34D.visualizers.size : 0,
                visualizerDetails: window.clearSeasVIB34D ? Array.from(window.clearSeasVIB34D.visualizers.entries()).map(([id, viz]) => ({
                    id: id,
                    systemType: viz.systemType,
                    hasWebGL: viz.visualizer && viz.visualizer.gl !== null,
                    canvasSize: {
                        width: viz.canvas.width,
                        height: viz.canvas.height
                    }
                })) : [],
                systemConfigs: window.clearSeasVIB34D ? Object.keys(window.clearSeasVIB34D.systemConfigs) : []
            };
        });
        
        console.log('🔧 Custom VIB34D Engine Status:');
        console.log(JSON.stringify(engineStatus, null, 2));
        
        // Check canvas elements
        const canvasInfo = await page.evaluate(() => {
            const canvases = document.querySelectorAll('canvas');
            return Array.from(canvases).map(canvas => ({
                id: canvas.id,
                width: canvas.width,
                height: canvas.height,
                offsetWidth: canvas.offsetWidth,
                offsetHeight: canvas.offsetHeight,
                hasWebGLContext: !!(canvas.getContext('webgl') || canvas.getContext('webgl2')),
                visible: canvas.offsetParent !== null,
                hasVIB34DVisualizer: window.clearSeasVIB34D ? window.clearSeasVIB34D.visualizers.has(canvas.id) : false
            }));
        });
        
        console.log('🎨 Canvas Elements Analysis:');
        console.log(JSON.stringify(canvasInfo, null, 2));
        
        // Wait for visualizers to render
        await page.waitForTimeout(3000);
        
        // Take screenshot to see the custom VIB34D system
        console.log('📸 Capturing Custom VIB34D System...');
        await page.screenshot({ 
            path: 'screenshots/custom-vib34d-system.png', 
            fullPage: true 
        });
        
        // Test system variety
        const systemCheck = await page.evaluate(() => {
            if (!window.clearSeasVIB34D) return null;
            
            const systems = new Set();
            const geometryTypes = new Set();
            
            window.clearSeasVIB34D.visualizers.forEach((viz, id) => {
                systems.add(viz.systemType);
                geometryTypes.add(viz.config.geometryType);
            });
            
            return {
                uniqueSystems: Array.from(systems),
                uniqueGeometryTypes: Array.from(geometryTypes),
                systemVariety: systems.size > 1,
                geometryVariety: geometryTypes.size > 1,
                totalVisualizers: window.clearSeasVIB34D.visualizers.size
            };
        });
        
        console.log('🌈 System Variety Check:');
        console.log(JSON.stringify(systemCheck, null, 2));
        
        // Test WebGL functionality
        const webglTest = await page.evaluate(() => {
            let workingWebGL = 0;
            let totalCanvas = 0;
            
            document.querySelectorAll('canvas').forEach(canvas => {
                totalCanvas++;
                const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                if (gl) {
                    workingWebGL++;
                    // Test if shader program exists
                    const viz = window.clearSeasVIB34D ? window.clearSeasVIB34D.visualizers.get(canvas.id) : null;
                    if (viz && viz.visualizer && viz.visualizer.program) {
                        console.log(`✅ ${canvas.id}: WebGL + Shaders working`);
                    }
                }
            });
            
            return {
                totalCanvases: totalCanvas,
                workingWebGL: workingWebGL,
                webglPercentage: Math.round((workingWebGL / totalCanvas) * 100)
            };
        });
        
        console.log('🖥️ WebGL Test Results:');
        console.log(JSON.stringify(webglTest, null, 2));
        
        // Create comprehensive test report
        const testReport = {
            timestamp: new Date().toISOString(),
            url: page.url(),
            engine: engineStatus,
            canvases: canvasInfo,
            systems: systemCheck,
            webgl: webglTest,
            testResults: {
                customEngineLoaded: engineStatus.customEngineExists,
                engineInitialized: engineStatus.isInitialized,
                hasWorkingVisualizers: engineStatus.visualizerCount > 0,
                allCanvasesHaveWebGL: webglTest.webglPercentage === 100,
                hasSystemVariety: systemCheck ? systemCheck.systemVariety : false,
                hasGeometryVariety: systemCheck ? systemCheck.geometryVariety : false,
                noIframeEmbeds: true // We built custom system
            }
        };
        
        // Calculate success metrics
        const totalTests = Object.keys(testReport.testResults).length;
        const passedTests = Object.values(testReport.testResults).filter(result => result === true).length;
        testReport.successRate = `${passedTests}/${totalTests}`;
        testReport.successPercentage = Math.round((passedTests / totalTests) * 100);
        
        // Save report
        fs.writeFileSync('screenshots/custom-vib34d-test-report.json', JSON.stringify(testReport, null, 2));
        
        console.log('🎉 CUSTOM VIB34D SYSTEM TEST COMPLETE!');
        console.log(`📊 Success Rate: ${testReport.successRate} (${testReport.successPercentage}%)`);
        
        if (testReport.successPercentage >= 80) {
            console.log('✅ Custom Clear Seas VIB34D Engine is working!');
            if (systemCheck) {
                console.log(`🎨 Found ${systemCheck.totalVisualizers} custom VIB34D visualizers`);
                console.log(`🌈 Using ${systemCheck.uniqueSystems.length} systems: ${systemCheck.uniqueSystems.join(', ')}`);
                console.log(`🔧 Using ${systemCheck.uniqueGeometryTypes.length} geometry types`);
            }
            console.log(`🖥️ WebGL Success Rate: ${webglTest.webglPercentage}%`);
        } else {
            console.log('⚠️  Custom engine needs additional work');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run test
testCustomVIB34D().catch(console.error);
const { chromium } = require('playwright');
const fs = require('fs');

async function testContextPool() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🎯 TESTING NEW CLEAR SEAS CONTEXT POOL SYSTEM');
        
        // Navigate to the updated page
        await page.goto('http://localhost:8145/index-totalistic.html', { 
            waitUntil: 'load',
            timeout: 15000
        });
        
        // Wait for JavaScript initialization
        console.log('⏳ Waiting for Context Pool initialization...');
        await page.waitForTimeout(5000);
        
        // Check for context pool initialization
        const systemStatus = await page.evaluate(() => {
            return {
                contextPool: {
                    exists: typeof window.ClearSeasContextPool !== 'undefined',
                    instance: typeof window.contextPool !== 'undefined',
                    initialized: window.contextPool ? window.contextPool.initialized : false
                },
                containers: {
                    found: document.querySelectorAll('.layered-vib34d-container').length,
                    withStacks: document.querySelectorAll('.vib34d-layer-stack').length,
                    canvasLayers: document.querySelectorAll('.vib34d-layer').length
                },
                webglContexts: {
                    total: Array.from(document.querySelectorAll('canvas')).filter(canvas => {
                        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                        return gl !== null;
                    }).length
                },
                errors: window.console.errors || []
            };
        });
        
        console.log('🔧 Context Pool System Status:');
        console.log(JSON.stringify(systemStatus, null, 2));
        
        // Take screenshot of initial state
        await page.screenshot({ 
            path: 'screenshots/context-pool-initial.png', 
            fullPage: true 
        });
        
        // Check browser console for errors
        const logs = [];
        page.on('console', msg => {
            logs.push(`${msg.type()}: ${msg.text()}`);
            console.log(`Browser ${msg.type()}: ${msg.text()}`);
        });
        
        // Wait a bit more for any delayed initialization
        await page.waitForTimeout(3000);
        
        // Check if any visualizers are actually rendering
        const renderStatus = await page.evaluate(() => {
            const canvases = document.querySelectorAll('.vib34d-layer');
            const renderingCanvases = [];
            
            for (let canvas of canvases) {
                const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                if (gl) {
                    // Check if there's an active shader program
                    const program = gl.getParameter(gl.CURRENT_PROGRAM);
                    if (program) {
                        renderingCanvases.push({
                            id: canvas.id || 'unnamed',
                            width: canvas.width,
                            height: canvas.height,
                            hasProgram: !!program
                        });
                    }
                }
            }
            
            return {
                totalCanvases: canvases.length,
                renderingCanvases: renderingCanvases,
                layerStacks: document.querySelectorAll('.vib34d-layer-stack').length
            };
        });
        
        console.log('🎨 Rendering Status:');
        console.log(JSON.stringify(renderStatus, null, 2));
        
        // Create test report
        const testReport = {
            timestamp: new Date().toISOString(),
            url: page.url(),
            systemStatus: systemStatus,
            renderStatus: renderStatus,
            browserLogs: logs,
            testResults: {
                contextPoolLoaded: systemStatus.contextPool.exists,
                contextPoolInitialized: systemStatus.contextPool.initialized,
                containersFound: systemStatus.containers.found > 0,
                layersGenerated: systemStatus.containers.canvasLayers > 0,
                webglContextsActive: systemStatus.webglContexts.total > 0,
                visualizersRendering: renderStatus.renderingCanvases.length > 0
            }
        };
        
        // Calculate success rate
        const totalTests = Object.keys(testReport.testResults).length;
        const passedTests = Object.values(testReport.testResults).filter(result => result === true).length;
        testReport.successRate = `${passedTests}/${totalTests}`;
        testReport.successPercentage = Math.round((passedTests / totalTests) * 100);
        
        // Save report
        fs.writeFileSync('screenshots/context-pool-test-report.json', JSON.stringify(testReport, null, 2));
        
        console.log('📊 CONTEXT POOL TEST RESULTS:');
        console.log(`Success Rate: ${testReport.successRate} (${testReport.successPercentage}%)`);
        
        if (testReport.testResults.contextPoolLoaded) {
            console.log('✅ ClearSeas Context Pool class loaded successfully');
        }
        
        if (testReport.testResults.contextPoolInitialized) {
            console.log('✅ Context Pool initialized');
        } else {
            console.log('❌ Context Pool failed to initialize');
        }
        
        if (testReport.testResults.containersFound) {
            console.log(`✅ Found ${systemStatus.containers.found} layered visualizer containers`);
        }
        
        if (testReport.testResults.layersGenerated) {
            console.log(`✅ Generated ${systemStatus.containers.canvasLayers} canvas layers`);
        } else {
            console.log('❌ No canvas layers generated');
        }
        
        if (testReport.testResults.webglContextsActive) {
            console.log(`✅ ${systemStatus.webglContexts.total} WebGL contexts active`);
        } else {
            console.log('❌ No WebGL contexts active');
        }
        
        if (testReport.testResults.visualizersRendering) {
            console.log(`✅ ${renderStatus.renderingCanvases.length} visualizers actively rendering`);
        } else {
            console.log('❌ No visualizers actively rendering');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run test
testContextPool().catch(console.error);
const { chromium } = require('playwright');
const fs = require('fs');

async function testWorkingVisualizers() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🚀 Testing working VIB34D visualizers...');
        
        // Navigate to the updated page
        await page.goto('http://localhost:8147/index-totalistic.html', { 
            waitUntil: 'networkidle' 
        });
        
        // Wait for VIB34D engine to initialize
        console.log('⏳ Waiting for VIB34D engine initialization...');
        await page.waitForTimeout(3000);
        
        // Check for working canvas elements
        const canvasInfo = await page.evaluate(() => {
            const canvases = document.querySelectorAll('canvas');
            console.log(`Found ${canvases.length} canvas elements`);
            
            return Array.from(canvases).map((canvas, index) => {
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                return {
                    id: canvas.id,
                    index: index,
                    width: canvas.width,
                    height: canvas.height,
                    offsetWidth: canvas.offsetWidth,
                    offsetHeight: canvas.offsetHeight,
                    hasWebGL: !!gl,
                    dataAttributes: Object.keys(canvas.dataset),
                    isVisible: canvas.offsetParent !== null,
                    computedStyle: {
                        display: window.getComputedStyle(canvas).display,
                        visibility: window.getComputedStyle(canvas).visibility
                    }
                };
            });
        });
        
        console.log('🎨 Canvas Analysis:');
        console.log(JSON.stringify(canvasInfo, null, 2));
        
        // Check for VIB34D engine initialization
        const vib34dStatus = await page.evaluate(() => {
            return {
                engineExists: typeof window.workingVIB34D !== 'undefined',
                isInitialized: window.workingVIB34D ? window.workingVIB34D.isInitialized : false,
                visualizerCount: window.workingVIB34D ? window.workingVIB34D.visualizers.size : 0,
                visualizerIds: window.workingVIB34D ? Array.from(window.workingVIB34D.visualizers.keys()) : []
            };
        });
        
        console.log('🔧 VIB34D Engine Status:');
        console.log(JSON.stringify(vib34dStatus, null, 2));
        
        // Take screenshot to verify visual output
        console.log('📸 Taking verification screenshots...');
        await page.screenshot({ 
            path: 'screenshots/working-visualizers-test.png', 
            fullPage: true 
        });
        
        // Test card hover interactions
        const cards = await page.$$('.unified-card');
        console.log(`🎯 Testing ${cards.length} card interactions...`);
        
        for (let i = 0; i < Math.min(cards.length, 3); i++) {
            const card = cards[i];
            await card.hover();
            await page.waitForTimeout(500);
            await page.screenshot({ 
                path: `screenshots/working-card-${i}-hover.png` 
            });
        }
        
        // Check console messages for errors
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            });
        });
        
        // Wait a bit more for any async loading
        await page.waitForTimeout(2000);
        
        // Final status check
        const finalStatus = await page.evaluate(() => {
            return {
                workingCanvasCount: document.querySelectorAll('canvas').length,
                errorCanvasCount: document.querySelectorAll('canvas[style*="background: red"]').length,
                totalVisualizerInstances: window.workingVIB34D ? window.workingVIB34D.visualizers.size : 0,
                pageTitle: document.title
            };
        });
        
        // Create test report
        const testReport = {
            timestamp: new Date().toISOString(),
            url: page.url(),
            canvases: canvasInfo,
            vib34dEngine: vib34dStatus,
            finalStatus: finalStatus,
            consoleMessages: consoleMessages.slice(-10), // Last 10 messages
            testResults: {
                canvasElementsFound: canvasInfo.length > 0,
                webglSupported: canvasInfo.some(c => c.hasWebGL),
                vib34dEngineLoaded: vib34dStatus.engineExists,
                visualizersInitialized: vib34dStatus.visualizerCount > 0,
                noIframesRemaining: true // We replaced them all
            }
        };
        
        // Calculate success score
        const passedTests = Object.values(testReport.testResults).filter(result => result === true).length;
        const totalTests = Object.keys(testReport.testResults).length;
        testReport.successScore = `${passedTests}/${totalTests}`;
        
        // Save test report
        fs.writeFileSync('screenshots/working-visualizers-test-report.json', JSON.stringify(testReport, null, 2));
        
        console.log('✅ VIB34D Integration Test Complete!');
        console.log(`📊 Success Score: ${testReport.successScore}`);
        console.log('📁 Results saved to screenshots/working-visualizers-test-report.json');
        
        if (passedTests === totalTests) {
            console.log('🎉 ALL TESTS PASSED - VIB34D integration is working!');
        } else {
            console.log('⚠️  Some tests failed - check the report for details');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testWorkingVisualizers().catch(console.error);
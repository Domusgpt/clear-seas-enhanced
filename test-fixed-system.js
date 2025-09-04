const { chromium } = require('playwright');

async function testFixedSystem() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🔧 TESTING FIXED LAYERED CONTEXT POOL SYSTEM');
        
        // Collect console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
            console.log(`Browser ${msg.type()}: ${msg.text()}`);
        });
        
        await page.goto('https://domusgpt.github.io/clear-seas-enhanced/index-totalistic.html', { 
            waitUntil: 'load',
            timeout: 15000
        });
        
        // Wait for system initialization
        await page.waitForTimeout(8000);
        
        // Check system status after fixes
        const systemStatus = await page.evaluate(() => {
            return {
                experienceChoreographer: {
                    exists: typeof window.experienceChoreographer !== 'undefined',
                    initialized: window.experienceChoreographer ? window.experienceChoreographer.isInitialized : false,
                    hasGetCardBaseSize: window.experienceChoreographer && typeof window.experienceChoreographer.getCardBaseSize === 'function'
                },
                contextPool: {
                    exists: typeof window.ClearSeasContextPool === 'function',
                    instance: typeof window.contextPool !== 'undefined',
                    initialized: window.contextPool ? window.contextPool.isInitialized : false,
                    hasCorrectMethod: window.contextPool && typeof window.contextPool.createMultiLayerVisualizer === 'function'
                },
                visualizers: {
                    containers: document.querySelectorAll('.layered-vib34d-container').length,
                    layerStacks: document.querySelectorAll('.vib34d-layer-stack').length,
                    canvasLayers: document.querySelectorAll('.vib34d-layer').length
                },
                polytopalReactivity: {
                    unified: typeof window.unifiedPolytopalSystem !== 'undefined',
                    initialized: window.unifiedPolytopalSystem ? window.unifiedPolytopalSystem.isInitialized : false
                }
            };
        });
        
        // Take screenshot of fixed system
        await page.screenshot({ 
            path: 'screenshots/fixed-system-test.png',
            fullPage: true 
        });
        
        console.log('📊 FIXED SYSTEM STATUS:');
        console.log(JSON.stringify(systemStatus, null, 2));
        
        console.log('\n🐛 CONSOLE ERRORS DETECTED:');
        consoleErrors.forEach((error, i) => {
            console.log(`${i + 1}. ${error}`);
        });
        
        // Create comprehensive test report
        const testReport = {
            timestamp: new Date().toISOString(),
            url: page.url(),
            systemStatus: systemStatus,
            consoleErrors: consoleErrors,
            fixes: {
                experienceChoreographerFixed: systemStatus.experienceChoreographer.hasGetCardBaseSize,
                contextPoolMethodFixed: systemStatus.contextPool.hasCorrectMethod,
                noJavaScriptErrors: consoleErrors.filter(e => e.includes('TypeError')).length === 0,
                systemsInitialized: systemStatus.experienceChoreographer.initialized && systemStatus.contextPool.initialized
            }
        };
        
        const totalFixes = Object.keys(testReport.fixes).length;
        const workingFixes = Object.values(testReport.fixes).filter(f => f === true).length;
        testReport.successRate = `${workingFixes}/${totalFixes}`;
        testReport.successPercentage = Math.round((workingFixes / totalFixes) * 100);
        
        console.log('\n✅ FIX STATUS:');
        console.log(`Success Rate: ${testReport.successRate} (${testReport.successPercentage}%)`);
        
        if (testReport.fixes.experienceChoreographerFixed) {
            console.log('✅ ExperienceChoreographer.getCardBaseSize() method added');
        } else {
            console.log('❌ ExperienceChoreographer.getCardBaseSize() still missing');
        }
        
        if (testReport.fixes.contextPoolMethodFixed) {
            console.log('✅ ClearSeasContextPool.createMultiLayerVisualizer() method available');
        } else {
            console.log('❌ ClearSeasContextPool.createMultiLayerVisualizer() still missing');
        }
        
        if (testReport.fixes.noJavaScriptErrors) {
            console.log('✅ No TypeError JavaScript errors detected');
        } else {
            console.log('❌ JavaScript TypeError errors still present');
        }
        
        if (testReport.fixes.systemsInitialized) {
            console.log('✅ Both systems initialized successfully');
        } else {
            console.log('❌ System initialization issues remain');
        }
        
        // Save detailed report
        require('fs').writeFileSync('screenshots/fixed-system-test-report.json', JSON.stringify(testReport, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testFixedSystem();
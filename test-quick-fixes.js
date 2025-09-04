const { chromium } = require('playwright');

async function quickFixTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('⚡ QUICK FIX VERIFICATION TEST');
        
        await page.goto('https://domusgpt.github.io/clear-seas-enhanced/index-totalistic.html', { 
            waitUntil: 'load',
            timeout: 10000
        });
        
        await page.waitForTimeout(5000);
        
        const fixStatus = await page.evaluate(() => {
            return {
                experienceChoreographer: typeof window.experienceChoreographer?.getCardBaseSize === 'function',
                contextPoolMethod: typeof window.contextPool?.createMultiLayerVisualizer === 'function',
                contextPoolClass: typeof window.ClearSeasContextPool === 'function',
                containers: document.querySelectorAll('.layered-vib34d-container').length
            };
        });
        
        console.log('🎯 FIX VERIFICATION:');
        console.log(`✅ ExperienceChoreographer.getCardBaseSize(): ${fixStatus.experienceChoreographer}`);
        console.log(`✅ ContextPool.createMultiLayerVisualizer(): ${fixStatus.contextPoolMethod}`); 
        console.log(`✅ ClearSeasContextPool class: ${fixStatus.contextPoolClass}`);
        console.log(`✅ Layered containers found: ${fixStatus.containers}`);
        
        const allFixed = Object.values(fixStatus).every(status => status === true || (typeof status === 'number' && status > 0));
        console.log(`\n🚀 ALL FIXES WORKING: ${allFixed}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

quickFixTest();
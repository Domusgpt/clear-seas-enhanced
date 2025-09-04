const { chromium } = require('playwright');

async function quickTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🎯 QUICK CONTEXT POOL STATUS CHECK');
        
        await page.goto('http://localhost:8145/index-totalistic.html', { 
            waitUntil: 'load',
            timeout: 10000
        });
        
        await page.waitForTimeout(3000);
        
        const status = await page.evaluate(() => {
            return {
                contextPoolClass: typeof window.ClearSeasContextPool,
                contextPoolInstance: typeof window.contextPool,
                containers: document.querySelectorAll('.layered-vib34d-container').length,
                console_logs: []
            };
        });
        
        console.log('Status:', JSON.stringify(status, null, 2));
        
        // Take a quick screenshot
        await page.screenshot({ path: 'screenshots/quick-status.png' });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

quickTest();
const { chromium } = require('playwright');
const fs = require('fs');

async function analyzeVisualsWithScreenshots() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🔍 Loading totalistic page for visual analysis...');
        
        // Navigate to the page
        await page.goto('http://localhost:8147/index-totalistic.html', { 
            waitUntil: 'networkidle' 
        });
        
        // Wait for page to settle
        await page.waitForTimeout(3000);
        
        console.log('📸 Taking full page screenshot...');
        await page.screenshot({ 
            path: 'screenshots/full-page.png', 
            fullPage: true 
        });
        
        console.log('📸 Taking viewport screenshot...');
        await page.screenshot({ 
            path: 'screenshots/viewport.png'
        });
        
        // Check for any JavaScript errors
        const errors = [];
        page.on('pageerror', error => {
            errors.push(error.message);
        });
        
        // Check console messages
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });
        
        // Wait a bit more for any async loading
        await page.waitForTimeout(2000);
        
        // Check iframe loading states
        const iframeInfo = await page.evaluate(() => {
            const iframes = document.querySelectorAll('iframe');
            return Array.from(iframes).map(iframe => ({
                id: iframe.id,
                src: iframe.src,
                width: iframe.offsetWidth,
                height: iframe.offsetHeight,
                loaded: iframe.contentDocument !== null,
                visible: iframe.offsetParent !== null
            }));
        });
        
        console.log('🎭 Iframe Analysis:');
        console.log(JSON.stringify(iframeInfo, null, 2));
        
        // Check for canvas elements
        const canvasInfo = await page.evaluate(() => {
            const canvases = document.querySelectorAll('canvas');
            return Array.from(canvases).map(canvas => ({
                id: canvas.id,
                width: canvas.width,
                height: canvas.height,
                offsetWidth: canvas.offsetWidth,
                offsetHeight: canvas.offsetHeight,
                context: canvas.getContext ? 'available' : 'unavailable'
            }));
        });
        
        console.log('🎨 Canvas Analysis:');
        console.log(JSON.stringify(canvasInfo, null, 2));
        
        // Take screenshots of individual cards
        const cards = await page.$$('.unified-card');
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            await card.screenshot({ path: `screenshots/card-${i}.png` });
            
            // Hover over card and take another screenshot
            await card.hover();
            await page.waitForTimeout(500);
            await page.screenshot({ path: `screenshots/card-${i}-hover.png` });
        }
        
        // Check CSS loading
        const stylesheetInfo = await page.evaluate(() => {
            return Array.from(document.styleSheets).map(sheet => ({
                href: sheet.href,
                rules: sheet.cssRules ? sheet.cssRules.length : 'blocked',
                disabled: sheet.disabled
            }));
        });
        
        console.log('🎨 Stylesheet Analysis:');
        console.log(JSON.stringify(stylesheetInfo, null, 2));
        
        // Create diagnostic report
        const diagnosticReport = {
            timestamp: new Date().toISOString(),
            url: page.url(),
            viewport: await page.viewportSize(),
            errors: errors,
            consoleMessages: consoleMessages,
            iframes: iframeInfo,
            canvases: canvasInfo,
            stylesheets: stylesheetInfo,
            recommendations: []
        };
        
        // Analyze issues and add recommendations
        if (iframeInfo.some(iframe => !iframe.loaded)) {
            diagnosticReport.recommendations.push('Some iframes failed to load - check CORS/network issues');
        }
        
        if (iframeInfo.some(iframe => iframe.width === 0 || iframe.height === 0)) {
            diagnosticReport.recommendations.push('Some iframes have zero dimensions - check CSS sizing');
        }
        
        if (canvasInfo.length === 0) {
            diagnosticReport.recommendations.push('No canvas elements found - check if VIB34D is loading properly');
        }
        
        if (errors.length > 0) {
            diagnosticReport.recommendations.push(`${errors.length} JavaScript errors detected - check console`);
        }
        
        // Save diagnostic report
        fs.writeFileSync('screenshots/diagnostic-report.json', JSON.stringify(diagnosticReport, null, 2));
        
        console.log('✅ Analysis complete! Check screenshots/ folder for visual analysis');
        console.log('📊 Diagnostic report saved to screenshots/diagnostic-report.json');
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    } finally {
        await browser.close();
    }
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

// Run analysis
analyzeVisualsWithScreenshots().catch(console.error);
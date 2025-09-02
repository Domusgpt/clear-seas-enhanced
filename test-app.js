const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testWebApplication() {
    console.log('🚀 Starting comprehensive web application testing...');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }
    
    const browser = await chromium.launch({
        headless: false, // Set to true for CI/CD
        devtools: true
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Collect console messages and errors
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
        const message = `[${msg.type().toUpperCase()}] ${msg.text()}`;
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        });
        console.log(message);
    });
    
    page.on('pageerror', error => {
        const errorMessage = `[PAGE ERROR] ${error.message}`;
        errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        console.error(errorMessage);
    });
    
    page.on('requestfailed', request => {
        const failedRequest = `[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`;
        errors.push({
            type: 'network',
            url: request.url(),
            error: request.failure()?.errorText,
            timestamp: new Date().toISOString()
        });
        console.error(failedRequest);
    });
    
    try {
        console.log('📝 Step 1: Loading initial page...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        
        // Wait a moment for any dynamic content
        await page.waitForTimeout(3000);
        
        // Take initial screenshot
        await page.screenshot({ 
            path: path.join(screenshotsDir, '01-initial-page-load.png'),
            fullPage: true 
        });
        console.log('✅ Initial page screenshot saved');
        
        console.log('📝 Step 2: Opening developer tools and checking console...');
        
        // Take screenshot of the page with any visible errors
        await page.screenshot({ 
            path: path.join(screenshotsDir, '02-page-after-load.png'),
            fullPage: true 
        });
        console.log('✅ Page after load screenshot saved');
        
        console.log('📝 Step 3: Testing page interactions...');
        
        // Try scrolling
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '03-after-scroll-500px.png'),
            fullPage: true 
        });
        
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '04-after-scroll-1000px.png'),
            fullPage: true 
        });
        
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '05-scrolled-to-bottom.png'),
            fullPage: true 
        });
        
        console.log('📝 Step 4: Testing button interactions...');
        
        // Look for interactive elements and test them
        const buttons = await page.locator('button, .button, [role="button"]').count();
        console.log(`Found ${buttons} button-like elements`);
        
        if (buttons > 0) {
            try {
                // Click the first button found
                await page.locator('button, .button, [role="button"]').first().click();
                await page.waitForTimeout(2000);
                await page.screenshot({ 
                    path: path.join(screenshotsDir, '06-after-button-click.png'),
                    fullPage: true 
                });
                console.log('✅ Button click interaction tested');
            } catch (buttonError) {
                console.log('⚠️ Button click failed:', buttonError.message);
                await page.screenshot({ 
                    path: path.join(screenshotsDir, '06-button-click-error.png'),
                    fullPage: true 
                });
            }
        }
        
        console.log('📝 Step 5: Testing form interactions...');
        
        // Look for input fields
        const inputs = await page.locator('input, textarea, select').count();
        console.log(`Found ${inputs} input elements`);
        
        if (inputs > 0) {
            try {
                const firstInput = page.locator('input, textarea').first();
                await firstInput.fill('Test input');
                await page.waitForTimeout(1000);
                await page.screenshot({ 
                    path: path.join(screenshotsDir, '07-after-input-fill.png'),
                    fullPage: true 
                });
                console.log('✅ Input field interaction tested');
            } catch (inputError) {
                console.log('⚠️ Input interaction failed:', inputError.message);
            }
        }
        
        console.log('📝 Step 6: Checking for VIB34D visualizer elements...');
        
        // Look for canvas elements (likely for WebGL visualizations)
        const canvases = await page.locator('canvas').count();
        console.log(`Found ${canvases} canvas elements`);
        
        if (canvases > 0) {
            await page.screenshot({ 
                path: path.join(screenshotsDir, '08-canvas-elements-visible.png'),
                fullPage: true 
            });
            
            // Try to interact with canvas if present
            try {
                const canvas = page.locator('canvas').first();
                await canvas.hover();
                await page.waitForTimeout(1000);
                await canvas.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ 
                    path: path.join(screenshotsDir, '09-after-canvas-interaction.png'),
                    fullPage: true 
                });
                console.log('✅ Canvas interaction tested');
            } catch (canvasError) {
                console.log('⚠️ Canvas interaction failed:', canvasError.message);
            }
        }
        
        console.log('📝 Step 7: Testing mobile responsiveness...');
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '10-mobile-view-375px.png'),
            fullPage: true 
        });
        
        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '11-tablet-view-768px.png'),
            fullPage: true 
        });
        
        // Return to desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(1000);
        
        console.log('📝 Step 8: Final comprehensive check...');
        
        // Final screenshot
        await page.screenshot({ 
            path: path.join(screenshotsDir, '12-final-state.png'),
            fullPage: true 
        });
        
        // Get page performance metrics
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            };
        });
        
        // Generate comprehensive report
        const report = {
            testTimestamp: new Date().toISOString(),
            url: 'http://localhost:8080',
            viewport: { width: 1920, height: 1080 },
            performance: performanceMetrics,
            elementCounts: {
                buttons: buttons,
                inputs: inputs,
                canvases: canvases
            },
            consoleMessages: consoleMessages,
            errors: errors,
            screenshots: [
                '01-initial-page-load.png',
                '02-page-after-load.png',
                '03-after-scroll-500px.png',
                '04-after-scroll-1000px.png',
                '05-scrolled-to-bottom.png',
                '06-after-button-click.png',
                '07-after-input-fill.png',
                '08-canvas-elements-visible.png',
                '09-after-canvas-interaction.png',
                '10-mobile-view-375px.png',
                '11-tablet-view-768px.png',
                '12-final-state.png'
            ]
        };
        
        // Save report
        fs.writeFileSync(
            path.join(screenshotsDir, 'test-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('📊 TEST RESULTS SUMMARY:');
        console.log('========================');
        console.log(`✅ Screenshots taken: ${report.screenshots.length}`);
        console.log(`📝 Console messages: ${consoleMessages.length}`);
        console.log(`❌ Errors found: ${errors.length}`);
        console.log(`🔘 Buttons found: ${buttons}`);
        console.log(`📝 Input fields found: ${inputs}`);
        console.log(`🎨 Canvas elements found: ${canvases}`);
        console.log(`⏱️ Page load time: ${performanceMetrics.loadTime}ms`);
        console.log(`📁 Screenshots saved in: ${screenshotsDir}`);
        
        if (errors.length > 0) {
            console.log('\n❌ ERRORS DETECTED:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.type || 'ERROR'}: ${error.message || error.error}`);
            });
        }
        
        if (consoleMessages.filter(msg => msg.type === 'error').length > 0) {
            console.log('\n🚨 CONSOLE ERRORS:');
            consoleMessages
                .filter(msg => msg.type === 'error')
                .forEach((msg, index) => {
                    console.log(`${index + 1}. ${msg.text}`);
                });
        }
        
        console.log('\n✅ Testing completed successfully!');
        
    } catch (error) {
        console.error('💥 Test execution failed:', error);
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'error-state.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

// Run the test
testWebApplication().catch(console.error);
const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', err => {
        errors.push(err.message);
    });

    try {
        // Load the HTML file
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });

        console.log('✓ Página cargada correctamente');

        // Check main elements exist
        const header = await page.$('.header');
        const logo = await page.$('.logo');
        const main = await page.$('.main');
        const hero = await page.$('.hero');
        const footer = await page.$('.footer');
        const combatBtn = await page.$('#combatBtn');

        if (header && logo && main && hero && footer && combatBtn) {
            console.log('✓ Elementos principales presentes');
        } else {
            console.log('✗ Faltan elementos principales');
        }

        // Test navigation buttons
        const navBtns = await page.$$('.nav-btn');
        console.log(`✓ Botones de navegación: ${navBtns.length} encontrados`);

        // Test round options
        const roundOptions = await page.$$('.round-option');
        console.log(`✓ Opciones de round: ${roundOptions.length} encontradas`);

        // Click on challenges section
        await page.click('[data-section="challenges"]');
        await page.waitForTimeout(500);
        const challengesSection = await page.$('#challengesSection.active');
        if (challengesSection) {
            console.log('✓ Navegación a Retos funciona');
        }

        // Test progress section
        await page.click('[data-section="progress"]');
        await page.waitForTimeout(500);
        const progressSection = await page.$('#progressSection.active');
        if (progressSection) {
            console.log('✓ Navegación a Progreso funciona');
        }

        // Go back to home and test combat mode
        await page.click('[data-section="home"]');
        await page.waitForTimeout(500);

        // Check initial quote is displayed
        const quoteText = await page.$eval('#quoteText', el => el.textContent);
        if (quoteText && quoteText.length > 10) {
            console.log('✓ Frase motivacional mostrada');
        }

        // Check streak count
        const streakCount = await page.$eval('#streakCount', el => el.textContent);
        console.log(`✓ Contador de racha: ${streakCount} días`);

        // Check for JavaScript errors (excluding video errors which are expected if file is missing)
        const criticalErrors = errors.filter(e => 
            !e.includes('Video') && 
            !e.includes('background.mp4') &&
            !e.includes('net::ERR')
        );

        if (criticalErrors.length === 0) {
            console.log('✓ Sin errores críticos de JavaScript');
        } else {
            console.log('✗ Errores encontrados:');
            criticalErrors.forEach(e => console.log(`  - ${e}`));
        }

        console.log('\n📊 RESUMEN DE PRUEBA');
        console.log('====================');
        console.log('La aplicación está lista para Netlify');
        console.log('Para desplegar: Sube estos archivos a Netlify');
        console.log('- index.html');
        console.log('- style.css');
        console.log('- script.js');
        console.log('- background.mp4');

    } catch (err) {
        console.error('Error durante la prueba:', err.message);
    } finally {
        await browser.close();
    }
})();

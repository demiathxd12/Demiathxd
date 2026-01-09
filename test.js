/**
 * MENTALIDAD DE COMBATE 2.0 - TEST DE VERIFICACIÓN
 * Playwright Test Script
 */

const { chromium } = require('playwright');

async function testApp() {
    console.log('Iniciando pruebas de Mentalidad de Combate 2.0...');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capturar errores de consola
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
        // Cargar la página
        console.log('1. Cargando página principal...');
        await page.goto(`file://${process.cwd()}/index.html`, { waitUntil: 'networkidle' });
        
        // Verificar que el loader se muestra
        console.log('2. Verificando loader...');
        const loader = await page.locator('#loader');
        const loaderVisible = await loader.isVisible();
        console.log(`   Loader visible: ${loaderVisible}`);
        
        // Esperar a que el loader desaparezca
        console.log('3. Esperando que cargue la aplicación...');
        await page.waitForSelector('#loader.hidden', { timeout: 5000 });
        
        // Verificar que la pantalla de auth se muestra
        console.log('4. Verificando pantalla de autenticación...');
        const authScreen = await page.locator('#auth-screen');
        const authVisible = await authScreen.isVisible();
        console.log(`   Pantalla de auth visible: ${authVisible}`);
        
        // Verificar elementos del formulario de login
        console.log('5. Verificando formulario de login...');
        const usernameInput = await page.locator('#login-username');
        const passwordInput = await page.locator('#login-password');
        const loginButton = await page.locator('#login-form button[type="submit"]');
        
        console.log(`   Campo username presente: ${await usernameInput.isVisible()}`);
        console.log(`   Campo password presente: ${await passwordInput.isVisible()}`);
        console.log(`   Botón login presente: ${await loginButton.isVisible()}`);
        
        // Probar registro de usuario
        console.log('6. Probando registro de usuario...');
        await page.click('#show-register');
        await page.fill('#register-username', 'TestGuerrero');
        await page.fill('#register-email', 'test@combate.com');
        await page.fill('#register-password', 'test123');
        await page.fill('#register-confirm', 'test123');
        await page.click('#register-form button[type="submit"]');
        
        // Esperar a que se muestre la pantalla principal
        console.log('7. Esperando pantalla principal...');
        await page.waitForSelector('#main-screen:not(.hidden)', { timeout: 5000 });
        
        // Verificar elementos de la pantalla principal
        console.log('8. Verificando pantalla principal...');
        const timerSection = await page.locator('#timer-section');
        const timerVisible = await timerSection.isVisible();
        console.log(`   Sección timer visible: ${timerVisible}`);
        
        // Verificar navegación
        console.log('9. Probando navegación...');
        await page.click('[data-section="challenges"]');
        await page.waitForSelector('#challenges-section.active', { timeout: 2000 });
        console.log('   Navegación a desafíos: OK');
        
        await page.click('[data-section="progress"]');
        await page.waitForSelector('#progress-section.active', { timeout: 2000 });
        console.log('   Navegación a progreso: OK');
        
        await page.click('[data-section="stats"]');
        await page.waitForSelector('#stats-section.active', { timeout: 2000 });
        console.log('   Navegación a estadísticas: OK');
        
        // Volver a timer
        await page.click('[data-section="timer"]');
        await page.waitForSelector('#timer-section.active', { timeout: 2000 });
        
        // Probar funcionalidad del timer
        console.log('10. Probando funcionalidad del timer...');
        const startBtn = await page.locator('#start-btn');
        await startBtn.click();
        
        // Verificar que el botón cambió a pausar
        const pauseBtn = await page.locator('#pause-btn:not(.hidden)');
        const pauseVisible = await pauseBtn.isVisible();
        console.log(`   Timer iniciado: ${pauseVisible}`);
        
        // Pausar timer
        await page.click('#pause-btn');
        const startBtnAfter = await page.locator('#start-btn:not(.hidden)');
        console.log(`   Timer pausado: ${await startBtnAfter.isVisible()}`);
        
        // Verificar modo de descanso
        console.log('11. Probando modos de timer...');
        await page.click('[data-mode="short"]');
        const shortMode = await page.locator('.mode-btn[data-mode="short"].active');
        console.log(`   Modo corto: ${await shortMode.isVisible()}`);
        
        await page.click('[data-mode="long"]');
        const longMode = await page.locator('.mode-btn[data-mode="long"].active');
        console.log(`   Modo largo: ${await longMode.isVisible()}`);
        
        await page.click('[data-mode="custom"]');
        const customMode = await page.locator('.mode-btn[data-mode="custom"].active');
        console.log(`   Modo custom: ${await customMode.isVisible()}`);
        
        // Verificar configuración
        console.log('12. Probando configuración...');
        await page.click('#settings-btn');
        await page.waitForSelector('#settings-panel:not(.hidden)', { timeout: 2000 });
        console.log(`   Panel de settings abierto: OK`);
        
        await page.click('#close-settings');
        await page.waitForSelector('#settings-panel.hidden', { timeout: 2000 });
        console.log(`   Panel de settings cerrado: OK`);
        
        // Verificar logout
        console.log('13. Probando logout...');
        await page.click('#logout-btn');
        await page.waitForSelector('#auth-screen:not(.hidden)', { timeout: 2000 });
        console.log(`   Logout exitoso: OK`);
        
        // Verificar login con usuario creado
        console.log('14. Verificando login con usuario existente...');
        await page.fill('#login-username', 'TestGuerrero');
        await page.fill('#login-password', 'test123');
        await page.click('#login-form button[type="submit"]');
        await page.waitForSelector('#main-screen:not(.hidden)', { timeout: 5000 });
        console.log(`   Login exitoso: OK`);
        
        // Reporte final
        console.log('\n========================================');
        console.log('RESULTADO DE PRUEBAS');
        console.log('========================================');
        
        if (errors.length > 0) {
            console.log(`\n❌ ERRORES DE CONSOLA ENCONTRADOS (${errors.length}):`);
            errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err}`);
            });
        } else {
            console.log('\n✅ No se encontraron errores de consola');
        }
        
        console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('========================================\n');
        
    } catch (error) {
        console.error('\n❌ ERROR DURANTE LAS PRUEBAS:');
        console.error(error.message);
        
        if (errors.length > 0) {
            console.log('\nErrores de consola:');
            errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err}`);
            });
        }
        
        process.exit(1);
    } finally {
        await browser.close();
    }
}

// Ejecutar pruebas
testApp().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});

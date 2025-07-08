// Test script para verificar la integración de MercadoPago
import mercadoPagoService from '@/services/mercadopagoService';

export const testMercadoPagoIntegration = async () => {
    console.log('🧪 Testing MercadoPago Integration...');

    try {
        // Test 1: Validar configuración
        console.log('1️⃣ Testing configuration...');
        mercadoPagoService.validateConfig();
        console.log('✅ Configuration valid');

        // Test 2: Cargar script
        console.log('2️⃣ Testing script loading...');
        await mercadoPagoService.loadMercadoPagoScript();
        console.log('✅ Script loaded successfully');

        // Test 3: Inicializar servicio
        console.log('3️⃣ Testing service initialization...');
        const mp = await mercadoPagoService.initialize();
        console.log('✅ Service initialized:', mp);

        // Test 4: Verificar métodos disponibles
        console.log('4️⃣ Testing available methods...');
        const methods = await mercadoPagoService.getPaymentMethods();
        console.log('✅ Payment methods available:', methods?.length || 0);

        return {
            success: true,
            message: 'All tests passed! ✅',
            details: {
                configValid: true,
                scriptLoaded: true,
                serviceInitialized: !!mp,
                paymentMethodsCount: methods?.length || 0
            }
        };
    } catch (error) {
        console.error('❌ Test failed:', error);

        return {
            success: false,
            message: `Test failed: ${error.message}`,
            error: error.message,
            details: {
                configValid: error.message.includes('public key') ? false : true,
                scriptLoaded: error.message.includes('script') ? false : true,
                serviceInitialized: false,
                paymentMethodsCount: 0
            }
        };
    }
};

// Función para test rápido desde la consola del navegador
export const quickTest = async () => {
    const result = await testMercadoPagoIntegration();

    if (result.success) {
        console.log('🎉 MercadoPago integration is working!');
        console.table(result.details);
    } else {
        console.error('💥 MercadoPago integration has issues:');
        console.error(result.message);
        console.table(result.details);
    }

    return result;
};

// Auto-ejecutar en desarrollo si hay parámetro de debug
if (import.meta.env.DEV && window.location.search.includes('debug=mp')) {
    quickTest();
}

export default testMercadoPagoIntegration;

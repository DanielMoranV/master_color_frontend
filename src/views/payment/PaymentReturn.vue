<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const status = ref('processing'); // processing, success, error, pending
const message = ref('Procesando la información de tu pago. Por favor, espera...');
const icon = ref('pi pi-spin pi-spinner');

onMounted(() => {
    // Get status from URL path parameter
    const { status: routeStatus } = route.params;

    // Get other data from query parameters
    const {
        payment_id,
        external_reference: orderId,
        collection_status,
        status: queryStatus // MercadoPago still sends a 'status' query param
    } = route.query;

    console.log('Payment return params:', route.params);
    console.log('Payment return query:', route.query);

    let redirectPath = '/';
    let toastSeverity = 'info';
    let toastSummary = 'Estado del Pago';
    let toastDetail = '';

    // Determine the final status, preferring the URL path status
    const finalStatus = routeStatus || collection_status || queryStatus;

    switch (finalStatus) {
        case 'success': // For /payment-return/success
        case 'approved': // For /payment-return/approved
            status.value = 'success';
            icon.value = 'pi pi-check-circle';
            message.value = '¡Tu pago ha sido aprobado!';
            toastSeverity = 'success';
            toastSummary = 'Pago Exitoso';
            toastDetail = `El pago con ID ${payment_id} fue procesado correctamente.`;
            redirectPath = orderId ? `/orders?highlight=${orderId}` : '/orders';
            break;

        case 'pending': // For /payment-return/pending
        case 'in_process': // For /payment-return/in_process
            status.value = 'pending';
            icon.value = 'pi pi-clock';
            message.value = 'Tu pago está pendiente de aprobación.';
            toastSeverity = 'warn';
            toastSummary = 'Pago Pendiente';
            toastDetail = 'Te notificaremos cuando el pago sea aprobado.';
            redirectPath = orderId ? `/orders?highlight=${orderId}` : '/orders';
            break;

        case 'failure': // For /payment-return/failure
        case 'rejected': // For /payment-return/rejected
            status.value = 'error';
            icon.value = 'pi pi-times-circle';
            message.value = 'Tu pago ha sido rechazado.';
            toastSeverity = 'error';
            toastSummary = 'Pago Rechazado';
            toastDetail = 'El pago fue rechazado. Por favor, intenta nuevamente.';
            redirectPath = '/cart'; // Or back to the payment selection
            break;

        default:
            status.value = 'error';
            icon.value = 'pi pi-exclamation-triangle';
            message.value = 'No se pudo determinar el estado del pago.';
            toastSeverity = 'error';
            toastSummary = 'Error Desconocido';
            toastDetail = 'Hubo un problema al procesar la respuesta del pago.';
            redirectPath = '/';
            break;
    }

    toast.add({
        severity: toastSeverity,
        summary: toastSummary,
        detail: toastDetail,
        life: 8000
    });

    // Redirect after a short delay to allow the user to see the message
    setTimeout(() => {
        router.push(redirectPath);
    }, 4000);
});
</script>

<template>
    <div class="payment-return-container">
        <div class="card">
            <div class="status-icon" :class="`status-${status}`">
                <i :class="icon"></i>
            </div>
            <h2 class="status-title">{{ message }}</h2>
            <p class="status-description">
                Serás redirigido en unos segundos. Si no eres redirigido, haz clic
                <router-link to="/" class="text-blue-500 hover:underline">aquí</router-link>.
            </p>
        </div>
    </div>
</template>

<style scoped>
.payment-return-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    background-color: #f8fafc;
}

.card {
    background: white;
    padding: 3rem 4rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 600px;
}

.status-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
}

.status-icon .pi-spin {
    animation: pi-spin 1.5s infinite linear;
}

.status-success { color: #10b981; }
.status-error { color: #ef4444; }
.status-pending { color: #f59e0b; }
.status-processing { color: #3b82f6; }

.status-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
}

.status-description {
    font-size: 1rem;
    color: #6b7280;
}
</style>
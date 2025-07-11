<script setup>
import api from '@/api/axios';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// State
const purchases = ref([]);
const loading = ref(false);
const toast = useToast();

// Map status values to labels and severities
function getStatusLabel(status) {
    const map = { pendiente_pago: 'Pendiente de pago', pendiente: 'Pendiente', pendiente_envio: 'Pendiente de envío', entregado: 'Entregado', cancelado: 'Cancelado' };
    return map[status] || status;
}

function getStatusSeverity(status) {
    const map = { pendiente_pago: 'warning', pendiente: 'info', pendiente_envio: 'info', entregado: 'success', cancelado: 'danger' };
    return map[status] || 'secondary';
}

async function loadPurchases() {
    loading.value = true;
    try {
        const response = await api.get('/client/purchases');
        if (response?.success) {
            purchases.value = response.data || [];
        } else {
            toast.add({ severity: 'warn', summary: 'Aviso', detail: response.message || 'No se pudieron obtener las compras', life: 4000 });
        }
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'Error al cargar compras', life: 5000 });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadPurchases();
});
</script>

<template>
    <div class="my-products-container">
        <h2 class="page-title">Historial de Compras</h2>

        <DataTable
            :value="purchases"
            :loading="loading"
            data-key="order_id"
            :paginator="true"
            :rows="10"
            :rows-per-page-options="[5, 10, 20]"
            paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            current-page-report-template="{first} al {last} de {totalRecords} productos"
            responsive-layout="scroll"
            striped-rows
        >
            <template #empty>
                <div class="empty-state">
                    <i class="pi pi-shopping-bag" style="font-size: 3rem; color: var(--text-color-secondary)" />
                    <h3>No has comprado productos todavía</h3>
                    <p>¡Explora la tienda y realiza tu primera compra!</p>
                </div>
            </template>
            <template #loading>
                <div class="loading-state">
                    <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
                    <p>Cargando historial...</p>
                </div>
            </template>

            <!-- Imagen -->
            <Column header="Imagen" style="width: 80px">
                <template #body="{ data }">
                    <div class="product-image-container">
                        <img v-if="data.product?.image_url" :src="data.product.image_url" :alt="data.product?.name" class="product-image" @error="$event.target.style.display = 'none'" />
                        <div v-else class="no-image">
                            <i class="pi pi-image" />
                        </div>
                    </div>
                </template>
            </Column>

            <!-- Nombre del producto -->
            <Column field="product.name" header="Producto" sortable style="min-width: 200px">
                <template #body="{ data }">
                    <span class="product-name">{{ data.product?.name }}</span>
                </template>
            </Column>

            <!-- Cantidad -->
            <Column field="quantity" header="Cantidad" sortable style="width: 100px; text-align: center">
                <template #body="{ data }">
                    <Tag :value="data.quantity" severity="info" />
                </template>
            </Column>

            <!-- Precio unitario -->
            <Column field="unit_price" header="Precio (S/)" sortable style="width: 120px; text-align: right">
                <template #body="{ data }">
                    {{ parseFloat(data.unit_price).toFixed(2) }}
                </template>
            </Column>

            <!-- Estado de la orden -->
            <Column field="order_status" header="Estado de Orden" sortable style="width: 160px; text-align: center">
                <template #body="{ data }">
                    <Tag :value="getStatusLabel(data.order_status)" :severity="getStatusSeverity(data.order_status)" class="status-tag" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.my-products-container {
    padding: 1rem;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.product-image-container {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--surface-100);
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-secondary);
    font-size: 1.5rem;
}

.product-name {
    font-weight: 500;
    color: var(--text-color);
}

.status-tag {
    font-size: 0.8rem;
    padding: 0.35rem 0.6rem;
}

.empty-state,
.loading-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-color-secondary);
}

.empty-state h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--text-color);
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
</style>

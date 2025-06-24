<template>
    <div>
        <!-- Header Section with Gradient Background -->
        <div class="header-section">
            <div class="header-content">
                <div class="title-section">
                    <div class="icon-wrapper">
                        <i class="pi pi-arrows-v"></i>
                    </div>
                    <div>
                        <h1 class="main-title">Gestión de Movimientos de Stock</h1>
                        <p class="subtitle">Administra y controla los movimientos de inventario</p>
                    </div>
                </div>
                <Button label="Nuevo Movimiento" icon="pi pi-plus" @click="openNew" class="create-button" raised />
            </div>
        </div>

        <!-- Main Content Card -->
        <div class="content-card">
            <div class="table-header">
                <h2 class="table-title">Lista de Movimientos</h2>
                <div class="table-actions">
                    <div class="search-box">
                        <i class="pi pi-search"></i>
                        <input type="text" placeholder="Buscar movimientos..." v-model="searchQuery" class="search-input" />
                    </div>
                    <div class="filter-section">
                        <Select v-model="selectedType" :options="movementTypes" optionLabel="label" optionValue="value" placeholder="Tipo de movimiento" showClear class="type-filter" />
                        <DatePicker v-model="dateRange" selectionMode="range" placeholder="Rango de fechas" dateFormat="dd/mm/yy" showClear class="date-filter" />
                    </div>
                </div>
            </div>

            <StockMovementsTable :movements="filteredMovements" :loading="stockMovementsStore.loading" @view="viewMovement" @edit="editMovement" @delete="confirmDeleteMovement" />
        </div>

        <!-- Enhanced Movement Dialog -->
        <Dialog v-model:visible="movementDialog" :style="{ width: '900px' }" :header="selectedMovement?.id ? 'Editar Movimiento' : 'Nuevo Movimiento'" :modal="true" class="movement-dialog">
            <template #header>
                <div class="dialog-header">
                    <div class="dialog-icon">
                        <i :class="selectedMovement?.id ? 'pi pi-arrows-v' : 'pi pi-plus'"></i>
                    </div>
                    <div>
                        <h3>{{ selectedMovement?.id ? 'Editar Movimiento' : 'Nuevo Movimiento' }}</h3>
                        <p>{{ selectedMovement?.id ? 'Modifica la información del movimiento' : 'Completa los datos del nuevo movimiento' }}</p>
                    </div>
                </div>
            </template>

            <StockMovementForm :movement="selectedMovement" :loading="stockMovementsStore.loading" :apiErrors="stockMovementsStore.validationErrors" @submit="handleSaveMovement" @cancel="hideDialog" />
        </Dialog>

        <!-- Movement Detail Dialog -->
        <Dialog v-model:visible="detailDialog" :style="{ width: '800px' }" header="Detalle del Movimiento" :modal="true" class="detail-dialog">
            <StockMovementDetail :movement="selectedMovement" />

            <template #footer>
                <div class="dialog-actions">
                    <Button label="Cerrar" icon="pi pi-times" @click="detailDialog = false" outlined />
                    <Button label="Editar" icon="pi pi-pencil" @click="editFromDetail" />
                </div>
            </template>
        </Dialog>

        <!-- Enhanced Delete Dialog -->
        <Dialog v-model:visible="deleteMovementDialog" :style="{ width: '480px' }" header="Confirmar Eliminación" :modal="true" class="delete-dialog">
            <template #header>
                <div class="dialog-header danger">
                    <div class="dialog-icon danger">
                        <i class="pi pi-exclamation-triangle"></i>
                    </div>
                    <div>
                        <h3>Confirmar Eliminación</h3>
                        <p>Esta acción no se puede deshacer</p>
                    </div>
                </div>
            </template>

            <div class="delete-content">
                <div class="warning-box">
                    <i class="pi pi-info-circle"></i>
                    <div>
                        <p class="warning-text">
                            ¿Estás seguro de que quieres eliminar el movimiento
                            <strong>#{{ selectedMovement?.id }}</strong
                            >?
                        </p>
                        <p class="warning-subtext">Se perderán todos los datos asociados al movimiento.</p>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="dialog-actions">
                    <Button label="Cancelar" icon="pi pi-times" class="cancel-button" @click="deleteMovementDialog = false" outlined />
                    <Button label="Eliminar" icon="pi pi-trash" class="delete-button" @click="deleteMovement" :loading="stockMovementsStore.loading" />
                </div>
            </template>
        </Dialog>

        <Toast position="top-right" />
    </div>
</template>

<script setup>
import { useStockMovementsStore } from '@/stores/stockMovements';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import StockMovementDetail from './StockMovementDetail.vue';
import StockMovementForm from './StockMovementForm.vue';
import StockMovementsTable from './StockMovementsTable.vue';

const stockMovementsStore = useStockMovementsStore();
const toast = useToast();

// Reactive variables
const movementDialog = ref(false);
const detailDialog = ref(false);
const deleteMovementDialog = ref(false);
const selectedMovement = ref({});
const searchQuery = ref('');
const selectedType = ref(null);
const dateRange = ref(null);

// Movement types for filter
const movementTypes = ref([
    { label: 'Entrada', value: 'entrada' },
    { label: 'Salida', value: 'salida' },
    { label: 'Ajuste', value: 'ajuste' },
    { label: 'Devolución', value: 'devolucion' }
]);

// Computed properties
const filteredMovements = computed(() => {
    let filtered = stockMovementsStore.stockMovementsList;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
            (movement) => movement.reason?.toLowerCase().includes(query) || movement.voucher_number?.toLowerCase().includes(query) || movement.user?.name?.toLowerCase().includes(query) || movement.id?.toString().includes(query)
        );
    }

    // Filter by movement type
    if (selectedType.value) {
        filtered = filtered.filter((movement) => movement.movement_type === selectedType.value);
    }

    // Filter by date range
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
        const startDate = new Date(dateRange.value[0]);
        const endDate = new Date(dateRange.value[1]);
        filtered = filtered.filter((movement) => {
            const movementDate = new Date(movement.created_at);
            return movementDate >= startDate && movementDate <= endDate;
        });
    }

    return filtered;
});

// Methods
const fetchMovements = async () => {
    try {
        await stockMovementsStore.fetchStockMovements();
        if (stockMovementsStore.stockMovementsList.length === 0) {
            toast.add({
                severity: 'info',
                summary: 'Información',
                detail: 'No hay movimientos de stock registrados',
                life: 3000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los movimientos de stock',
            life: 5000
        });
    }
};

const openNew = () => {
    selectedMovement.value = {};
    stockMovementsStore.resetState();
    movementDialog.value = true;
};

const viewMovement = (movement) => {
    selectedMovement.value = { ...movement };
    detailDialog.value = true;
};

const editMovement = (movement) => {
    selectedMovement.value = { ...movement };
    stockMovementsStore.resetState();
    movementDialog.value = true;
};

const editFromDetail = () => {
    detailDialog.value = false;
    stockMovementsStore.resetState();
    movementDialog.value = true;
};

const confirmDeleteMovement = (movement) => {
    selectedMovement.value = { ...movement };
    deleteMovementDialog.value = true;
};

const hideDialog = () => {
    movementDialog.value = false;
    selectedMovement.value = {};
    stockMovementsStore.resetState(); // Clear any validation errors when closing dialog
};

const handleSaveMovement = async (movementData) => {
    try {
        // Reset validation errors before attempting save
        stockMovementsStore.resetState();

        if (selectedMovement.value.id) {
            await stockMovementsStore.updateStockMovement(selectedMovement.value.id, movementData);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: stockMovementsStore.message,
                life: 3000
            });
        } else {
            await stockMovementsStore.createStockMovement(movementData);
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: stockMovementsStore.message,
                life: 3000
            });
        }
        hideDialog();
    } catch (error) {
        // Validation errors are already handled by the store and displayed in the form
        if (stockMovementsStore.validationErrors && stockMovementsStore.validationErrors.length > 0) {
            toast.add({
                severity: 'warn',
                summary: 'Errores de Validación',
                detail: 'Por favor, corrige los errores en el formulario',
                life: 4000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: stockMovementsStore.error?.message || 'Error al guardar el movimiento',
                life: 5000
            });
        }
    }
};

const deleteMovement = async () => {
    try {
        await stockMovementsStore.deleteStockMovement(selectedMovement.value.id);
        deleteMovementDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: stockMovementsStore.message,
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: stockMovementsStore.error?.message || 'Error al eliminar el movimiento',
            life: 5000
        });
    }
};

// Lifecycle
onMounted(() => {
    fetchMovements();
});
</script>

<style scoped>
.header-section {
    margin-bottom: 2rem;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.title-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.icon-wrapper {
    width: 70px;
    height: 70px;
    border-radius: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.main-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0.5rem 0 0 0;
}

.create-button {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 12px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
    transition: all 0.3s ease;
}

.create-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.4);
}

.content-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.table-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.table-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 1rem;
    color: #64748b;
    z-index: 1;
}

.search-input {
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9rem;
    width: 300px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-section {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.type-filter,
.date-filter {
    min-width: 200px;
}

.dialog-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0;
}

.dialog-header.danger {
    color: #dc2626;
}

.dialog-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.dialog-icon.danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.dialog-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
}

.dialog-header p {
    margin: 0.25rem 0 0 0;
    color: #64748b;
    font-size: 0.9rem;
}

.delete-content {
    padding: 1rem 0;
}

.warning-box {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 12px;
    align-items: flex-start;
}

.warning-box i {
    color: #f59e0b;
    font-size: 1.5rem;
    margin-top: 0.25rem;
}

.warning-text {
    font-weight: 500;
    color: #92400e;
    margin: 0 0 0.5rem 0;
}

.warning-subtext {
    color: #b45309;
    font-size: 0.9rem;
    margin: 0;
}

.dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.cancel-button {
    background: transparent;
    color: #64748b;
    border: 2px solid #e2e8f0;
}

.delete-button {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    color: white;
}

@media (max-width: 768px) {
    .stock-movements-management {
        padding: 1rem;
    }

    .header-content {
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
    }

    .main-title {
        font-size: 2rem;
    }

    .table-header {
        flex-direction: column;
        align-items: stretch;
    }

    .table-actions {
        justify-content: stretch;
        flex-direction: column;
    }

    .search-input {
        width: 100%;
    }

    .filter-section {
        flex-direction: column;
    }

    .type-filter,
    .date-filter {
        width: 100%;
        min-width: auto;
    }
}
</style>

<template>
    <div class="orders-management">
        <!-- Header Section -->
        <div class="header-section">
            <div class="header-content">
                <div class="title-section">
                    <div class="icon-wrapper">
                        <i class="pi pi-shopping-cart"></i>
                    </div>
                    <div>
                        <h1 class="main-title">�rdenes de Compra</h1>
                        <p class="subtitle">Gestiona tus pedidos y completa tu compra</p>
                    </div>
                </div>
                <Button 
                    v-if="!showOrderForm" 
                    label="Volver a la Tienda" 
                    icon="pi pi-arrow-left" 
                    @click="goBackToStore" 
                    class="back-button" 
                    outlined 
                />
            </div>
        </div>

        <!-- Order Creation Form -->
        <div v-if="showOrderForm" class="content-card">
            <div class="order-form-header">
                <h2 class="form-title">
                    <i class="pi pi-plus-circle"></i>
                    Nueva Orden de Compra
                </h2>
                <p class="form-subtitle">Revisa tu pedido y completa la informaci�n de entrega</p>
            </div>

            <!-- Cart Summary -->
            <div class="cart-summary-section">
                <h3 class="section-title">
                    <i class="pi pi-shopping-bag"></i>
                    Resumen del Pedido
                </h3>
                
                <div class="cart-items">
                    <div v-for="(item, index) in orderItems" :key="index" class="cart-item">
                        <img :src="item.image" :alt="item.name" class="item-image" />
                        <div class="item-details">
                            <h4 class="item-name">{{ item.name }}</h4>
                            <p class="item-category">{{ item.category }}</p>
                            <div class="item-meta">
                                <span class="item-sku">SKU: {{ item.sku }}</span>
                                <span v-if="item.brand" class="item-brand">{{ item.brand }}</span>
                            </div>
                        </div>
                        <div class="item-quantity">
                            <span class="quantity-label">Cantidad:</span>
                            <span class="quantity-value">{{ item.quantity }}</span>
                        </div>
                        <div class="item-pricing">
                            <div class="unit-price">
                                <span class="price-label">Precio unitario:</span>
                                <span class="price-value">S/ {{ (item.price || 0).toFixed(2) }}</span>
                            </div>
                            <div class="total-price">
                                <span class="total-label">Subtotal:</span>
                                <span class="total-value">S/ {{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Totals -->
                <div class="order-totals">
                    <div class="totals-row">
                        <span class="totals-label">Subtotal ({{ totalQuantity }} productos):</span>
                        <span class="totals-value">S/ {{ (orderTotal || 0).toFixed(2) }}</span>
                    </div>
                    <div v-if="totalSavings > 0" class="totals-row savings">
                        <span class="totals-label">Descuentos:</span>
                        <span class="totals-value">-S/ {{ (totalSavings || 0).toFixed(2) }}</span>
                    </div>
                    <div class="totals-row shipping">
                        <span class="totals-label">Env�o:</span>
                        <span class="totals-value">{{ shippingCost > 0 ? `S/ ${shippingCost.toFixed(2)}` : 'Gratis' }}</span>
                    </div>
                    <div class="totals-row final">
                        <span class="totals-label">Total a pagar:</span>
                        <span class="totals-value">S/ {{ (finalTotal || 0).toFixed(2) }}</span>
                    </div>
                </div>
            </div>

            <!-- Order Form -->
            <form @submit.prevent="submitOrder" class="order-form">
                <div class="form-sections">
                    <!-- Customer Information -->
                    <div class="form-section">
                        <h3 class="section-title">
                            <i class="pi pi-user"></i>
                            Informaci�n del Cliente
                        </h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Nombre completo</label>
                                <InputText 
                                    v-model="orderForm.customerName" 
                                    :value="currentUser?.name"
                                    readonly 
                                    class="readonly-input"
                                />
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <InputText 
                                    v-model="orderForm.customerEmail" 
                                    :value="currentUser?.email"
                                    readonly 
                                    class="readonly-input"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Delivery Information -->
                    <div class="form-section">
                        <h3 class="section-title">
                            <i class="pi pi-map-marker"></i>
                            Informaci�n de Entrega
                        </h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label required">Direcci�n de entrega</label>
                                <Textarea 
                                    v-model="orderForm.deliveryAddress" 
                                    placeholder="Ingresa la direcci�n completa de entrega..."
                                    rows="3"
                                    :class="{ 'p-invalid': errors.deliveryAddress }"
                                />
                                <small v-if="errors.deliveryAddress" class="p-error">{{ errors.deliveryAddress }}</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Tel�fono de contacto</label>
                                <InputText 
                                    v-model="orderForm.phone" 
                                    placeholder="Ej: +51 999 888 777"
                                    :class="{ 'p-invalid': errors.phone }"
                                />
                                <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Information -->
                    <div class="form-section">
                        <h3 class="section-title">
                            <i class="pi pi-comment"></i>
                            Informaci�n Adicional
                        </h3>
                        <div class="form-group">
                            <label class="form-label">Notas del pedido (opcional)</label>
                            <Textarea 
                                v-model="orderForm.notes" 
                                placeholder="Instrucciones especiales, preferencias de entrega, etc."
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                    <Button 
                        type="button"
                        label="Cancelar" 
                        icon="pi pi-times" 
                        @click="cancelOrder" 
                        class="cancel-button" 
                        outlined 
                    />
                    <Button 
                        type="submit"
                        label="Confirmar Pedido" 
                        icon="pi pi-check" 
                        class="submit-button" 
                        :loading="loading"
                    />
                </div>
            </form>
        </div>

        <!-- Orders List (when no order form is shown) -->
        <div v-else class="content-card">
            <div class="orders-header">
                <h2 class="table-title">Mis �rdenes de Compra</h2>
                <div class="header-actions">
                    <Button 
                        label="Nueva Orden" 
                        icon="pi pi-plus" 
                        @click="startNewOrder" 
                        class="new-order-button"
                    />
                </div>
            </div>

            <!-- Orders table or empty state -->
            <div v-if="orders.length === 0" class="empty-orders">
                <i class="pi pi-shopping-cart empty-icon"></i>
                <h3>No tienes �rdenes de compra</h3>
                <p>Cuando realices tu primera compra, aparecer� aqu�</p>
                <Button 
                    label="Ir a la Tienda" 
                    icon="pi pi-shopping-bag" 
                    @click="goBackToStore" 
                    class="shop-button"
                />
            </div>

            <!-- Future: Orders table would go here -->
        </div>

        <Toast position="top-right" />
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

// State
const loading = ref(false);
const showOrderForm = ref(false);
const orderItems = ref([]);
const orders = ref([]); // Future: load from API
const errors = reactive({});

// Order form data
const orderForm = reactive({
    customerName: '',
    customerEmail: '',
    deliveryAddress: '',
    phone: '',
    notes: ''
});

// Computed properties
const currentUser = computed(() => authStore.currentUser);

const totalQuantity = computed(() => {
    return orderItems.value.reduce((total, item) => total + (item.quantity || 0), 0);
});

const orderTotal = computed(() => {
    return orderItems.value.reduce((total, item) => {
        return total + ((item.price || 0) * (item.quantity || 0));
    }, 0);
});

const totalSavings = computed(() => {
    return orderItems.value.reduce((total, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
            return total + ((item.originalPrice - item.price) * item.quantity);
        }
        return total;
    }, 0);
});

const shippingCost = computed(() => {
    // Free shipping for orders over S/ 100
    return orderTotal.value >= 100 ? 0 : 15;
});

const finalTotal = computed(() => {
    return orderTotal.value + shippingCost.value;
});

// Methods
const loadCheckoutCart = () => {
    try {
        const checkoutCart = localStorage.getItem('checkoutCart');
        if (checkoutCart) {
            orderItems.value = JSON.parse(checkoutCart);
            localStorage.removeItem('checkoutCart');
            
            if (orderItems.value.length > 0) {
                showOrderForm.value = true;
                
                // Initialize form with user data
                orderForm.customerName = currentUser.value?.name || '';
                orderForm.customerEmail = currentUser.value?.email || '';
                
                // Initialize with main address if available
                if (currentUser.value?.main_address) {
                    const mainAddress = currentUser.value.main_address;
                    orderForm.deliveryAddress = [
                        mainAddress.address_full,
                        mainAddress.district,
                        mainAddress.province,
                        mainAddress.department,
                        mainAddress.reference ? `Ref: ${mainAddress.reference}` : ''
                    ].filter(Boolean).join(', ');
                    
                    // You could also pre-fill phone if it's available in user profile
                    orderForm.phone = currentUser.value?.phone || '';
                }
                
                toast.add({
                    severity: 'success',
                    summary: 'Carrito Cargado',
                    detail: `Se cargaron ${orderItems.value.length} productos para tu orden`,
                    life: 4000
                });
            }
        }
    } catch (error) {
        console.error('Error loading checkout cart:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el carrito de compras',
            life: 5000
        });
    }
};

const validateForm = () => {
    // Clear previous errors
    Object.keys(errors).forEach(key => delete errors[key]);
    
    let isValid = true;
    
    if (!orderForm.deliveryAddress?.trim()) {
        errors.deliveryAddress = 'La direcci�n de entrega es requerida';
        isValid = false;
    }
    
    if (!orderForm.phone?.trim()) {
        errors.phone = 'El tel�fono de contacto es requerido';
        isValid = false;
    } else if (!/^[+]?[\d\s\-()]{9,}$/.test(orderForm.phone.trim())) {
        errors.phone = 'Ingresa un n�mero de tel�fono v�lido';
        isValid = false;
    }
    
    return isValid;
};

const submitOrder = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Formulario Incompleto',
            detail: 'Por favor completa todos los campos requeridos',
            life: 4000
        });
        return;
    }
    
    loading.value = true;
    
    try {
        // Simulate API call to create order
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create order object
        const order = {
            id: Date.now(), // Temporary ID
            items: [...orderItems.value],
            customer: {
                name: orderForm.customerName,
                email: orderForm.customerEmail
            },
            delivery: {
                address: orderForm.deliveryAddress,
                phone: orderForm.phone
            },
            notes: orderForm.notes,
            totals: {
                subtotal: orderTotal.value,
                shipping: shippingCost.value,
                savings: totalSavings.value,
                total: finalTotal.value
            },
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Future: Send to API
        console.log('Order created:', order);
        
        toast.add({
            severity: 'success',
            summary: 'Orden Creada',
            detail: `Tu orden ha sido creada exitosamente. Total: S/ ${finalTotal.value.toFixed(2)}`,
            life: 6000
        });
        
        // Reset form
        resetForm();
        
    } catch (error) {
        console.error('Error creating order:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la orden. Int�ntalo nuevamente.',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    showOrderForm.value = false;
    orderItems.value = [];
    Object.keys(orderForm).forEach(key => {
        if (key !== 'customerName' && key !== 'customerEmail') {
            orderForm[key] = '';
        }
    });
    Object.keys(errors).forEach(key => delete errors[key]);
};

const cancelOrder = () => {
    // Save items back to localStorage as pending cart
    if (orderItems.value.length > 0) {
        localStorage.setItem('pendingCart', JSON.stringify(orderItems.value));
        
        toast.add({
            severity: 'info',
            summary: 'Orden Cancelada',
            detail: 'Los productos se guardaron en tu carrito',
            life: 4000
        });
    }
    
    resetForm();
    router.push('/');
};

const startNewOrder = () => {
    // Check if there's a cart to process
    loadCheckoutCart();
    
    if (orderItems.value.length === 0) {
        toast.add({
            severity: 'info',
            summary: 'Carrito Vac�o',
            detail: 'A�ade productos a tu carrito desde la tienda',
            life: 4000
        });
        router.push('/');
    }
};

const goBackToStore = () => {
    router.push('/');
};

// Lifecycle
onMounted(() => {
    // Check if coming from checkout
    loadCheckoutCart();
});
</script>

<style scoped>
.orders-management {
    min-height: 100vh;
    background: #f8fafc;
}

/* Header Section */
.header-section {
    margin-bottom: 2rem;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
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
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.main-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
    background: linear-gradient(135deg, #10b981, #059669);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0.5rem 0 0 0;
}

.back-button {
    background: transparent;
    color: #64748b;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.back-button:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
}

/* Content Card */
.content-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

/* Order Form Header */
.order-form-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
}

.form-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.form-title i {
    color: #10b981;
}

.form-subtitle {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
}

/* Cart Summary */
.cart-summary-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
}

.section-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-title i {
    color: #10b981;
}

.cart-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.cart-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.item-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
    background: #f8fafc;
    border-radius: 8px;
    flex-shrink: 0;
}

.item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.item-name {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
}

.item-category {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

.item-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
}

.item-sku, .item-brand {
    font-size: 0.75rem;
    color: #9ca3af;
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
}

.item-quantity {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    min-width: 80px;
}

.quantity-label {
    font-size: 0.75rem;
    color: #6b7280;
}

.quantity-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: #10b981;
    background: #ecfdf5;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
}

.item-pricing {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    min-width: 120px;
}

.unit-price, .total-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
}

.price-label, .total-label {
    font-size: 0.75rem;
    color: #6b7280;
}

.price-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.total-value {
    font-size: 1rem;
    font-weight: 600;
    color: #10b981;
}

/* Order Totals */
.order-totals {
    padding: 1rem;
    background: white;
    border-radius: 12px;
    border: 2px solid #10b981;
}

.totals-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.totals-row:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
}

.totals-row.savings {
    color: #059669;
}

.totals-row.shipping {
    color: #6b7280;
}

.totals-row.final {
    font-size: 1.125rem;
    font-weight: 700;
    color: #10b981;
    border-top: 2px solid #e5e7eb;
    margin-top: 0.5rem;
    padding-top: 1rem;
}

.totals-label {
    font-weight: 500;
}

.totals-value {
    font-weight: 600;
}

/* Form Sections */
.form-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
}

.form-section {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-weight: 500;
    color: #374151;
    font-size: 0.9rem;
}

.form-label.required::after {
    content: ' *';
    color: #ef4444;
}

.readonly-input {
    background: #f9fafb !important;
    color: #6b7280 !important;
    cursor: not-allowed;
}

/* Form Actions */
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.cancel-button {
    background: transparent;
    color: #64748b;
    border: 2px solid #e2e8f0;
    padding: 0.75rem 2rem;
    font-weight: 600;
    border-radius: 12px;
}

.cancel-button:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
}

.submit-button {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    color: white;
    padding: 0.75rem 2rem;
    font-weight: 600;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.submit-button:hover {
    background: linear-gradient(135deg, #059669, #047857);
    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.4);
}

/* Orders List */
.orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.table-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.new-order-button {
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.new-order-button:hover {
    background: linear-gradient(135deg, #059669, #047857);
}

/* Empty State */
.empty-orders {
    text-align: center;
    padding: 4rem 2rem;
    color: #64748b;
}

.empty-icon {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 1rem;
}

.empty-orders h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #374151;
}

.empty-orders p {
    margin: 0 0 2rem 0;
    font-size: 1rem;
}

.shop-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    color: white;
    padding: 0.75rem 2rem;
    font-weight: 600;
    border-radius: 12px;
}

.shop-button:hover {
    background: linear-gradient(135deg, #5a67d8, #667eea);
}

/* Responsive Design */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }

    .main-title {
        font-size: 2rem;
    }

    .content-card {
        padding: 1rem;
    }

    .cart-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .item-details, .item-quantity, .item-pricing {
        text-align: center;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .orders-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
}
</style>
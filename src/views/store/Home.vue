<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// Router setup
const router = useRouter();

// Toast setup
const toast = useToast();

// State
const searchQuery = ref('');
const selectedCategory = ref(null);
const cartVisible = ref(false);
const cartItems = ref([]);
const loading = ref(false);
const isSmallScreen = ref(false);

// Responsive detection
const checkScreenSize = () => {
    isSmallScreen.value = window.innerWidth < 640;
};

// Sample categories
const categories = ref([
    { id: 1, name: 'Impresoras', icon: 'pi-print' },
    { id: 2, name: 'Tintas', icon: 'pi-palette' },
    { id: 3, name: 'Tóners', icon: 'pi-inbox' },
    { id: 4, name: 'Papel', icon: 'pi-file' },
    { id: 5, name: 'Repuestos', icon: 'pi-cog' },
    { id: 6, name: 'Accesorios', icon: 'pi-star' }
]);

// Sample products (in a real app, this would come from an API)
const products = ref([
    {
        id: 1,
        name: 'Impresora HP LaserJet Pro M404dn',
        category: 'Impresoras',
        price: 1299.9,
        originalPrice: 1499.9,
        image: 'https://placehold.co/300x200/4F46E5/FFFFFF?text=HP+LaserJet',
        rating: 4.5,
        inStock: true,
        description: 'Impresora láser monocromática de alta velocidad para oficina'
    },
    {
        id: 2,
        name: 'Impresora Multifuncional Epson EcoTank L3250',
        category: 'Impresoras',
        price: 899.9,
        originalPrice: 999.9,
        image: 'https://placehold.co/300x200/059669/FFFFFF?text=Epson+EcoTank',
        rating: 4.8,
        inStock: true,
        description: 'Impresora multifuncional con sistema de tanque de tinta de alta capacidad'
    },
    {
        id: 3,
        name: 'Kit de Tintas Epson 664 (4 colores)',
        category: 'Tintas',
        price: 159.9,
        originalPrice: 189.9,
        image: 'https://placehold.co/300x200/DC2626/FFFFFF?text=Tintas+Epson',
        rating: 4.3,
        inStock: true,
        description: 'Tintas originales Epson para impresoras EcoTank'
    },
    {
        id: 4,
        name: 'Tóner HP 26A Negro Original',
        category: 'Tóners',
        price: 299.9,
        originalPrice: 349.9,
        image: 'https://placehold.co/300x200/7C3AED/FFFFFF?text=Toner+HP',
        rating: 4.6,
        inStock: true,
        description: 'Tóner original HP para impresoras LaserJet Pro'
    },
    {
        id: 5,
        name: 'Papel Bond A4 75g (Paquete 500 hojas)',
        category: 'Papel',
        price: 24.9,
        originalPrice: 29.9,
        image: 'https://placehold.co/300x200/F59E0B/FFFFFF?text=Papel+Bond',
        rating: 4.2,
        inStock: true,
        description: 'Papel multipropósito ideal para impresiones diarias'
    },
    {
        id: 6,
        name: 'Kit de Mantenimiento HP LaserJet',
        category: 'Repuestos',
        price: 249.9,
        originalPrice: 299.9,
        image: 'https://placehold.co/300x200/10B981/FFFFFF?text=Kit+Mantenimiento',
        rating: 4.4,
        inStock: false,
        description: 'Kit completo para mantenimiento de impresoras HP LaserJet'
    },
    {
        id: 7,
        name: 'Escáner Portátil Epson WorkForce ES-200',
        category: 'Accesorios',
        price: 599.9,
        originalPrice: 699.9,
        image: 'https://placehold.co/300x200/EC4899/FFFFFF?text=Scanner+Epson',
        rating: 4.7,
        inStock: true,
        description: 'Escáner portátil de alta velocidad con alimentador automático'
    },
    {
        id: 8,
        name: 'Papel Fotográfico Brillante A4 (20 hojas)',
        category: 'Papel',
        price: 34.9,
        originalPrice: 39.9,
        image: 'https://placehold.co/300x200/6366F1/FFFFFF?text=Papel+Foto',
        rating: 4.1,
        inStock: true,
        description: 'Papel fotográfico de alta calidad para impresiones profesionales'
    }
]);

// Computed properties
const filteredProducts = computed(() => {
    let result = products.value;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter((product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query) || product.description.toLowerCase().includes(query));
    }

    // Filter by category
    if (selectedCategory.value) {
        result = result.filter((product) => product.category === selectedCategory.value.name);
    }

    return result;
});

const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
});

const cartItemsCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

const totalSavings = computed(() => {
    return cartItems.value.reduce((total, item) => {
        const savings = (item.originalPrice - item.price) * item.quantity;
        return total + savings;
    }, 0);
});

// Methods
const selectCategory = (category) => {
    if (selectedCategory.value === category) {
        selectedCategory.value = null;
    } else {
        selectedCategory.value = category;
    }
};

const clearFilters = () => {
    selectedCategory.value = null;
    searchQuery.value = '';
};

const toggleCart = () => {
    cartVisible.value = !cartVisible.value;
};

const addToCart = (product) => {
    if (!product.inStock) {
        toast.add({
            severity: 'warn',
            summary: 'Product Unavailable',
            detail: `${product.name} is currently out of stock`,
            life: 3000
        });
        return;
    }

    loading.value = true;

    // Simulate API call delay
    setTimeout(() => {
        const existingItem = cartItems.value.find((item) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.value.push({
                ...product,
                quantity: 1
            });
        }

        toast.add({
            severity: 'success',
            summary: 'Added to Cart',
            detail: `${product.name} added to your cart`,
            life: 3000
        });

        loading.value = false;
    }, 300);
};

const removeFromCart = (index) => {
    const removedItem = cartItems.value[index];
    cartItems.value.splice(index, 1);

    toast.add({
        severity: 'info',
        summary: 'Removed from Cart',
        detail: `${removedItem.name} removed from your cart`,
        life: 3000
    });
};

const increaseQuantity = (index) => {
    cartItems.value[index].quantity += 1;
};

const decreaseQuantity = (index) => {
    if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity -= 1;
    } else {
        removeFromCart(index);
    }
};

const clearCart = () => {
    cartItems.value = [];
    toast.add({
        severity: 'info',
        summary: 'Cart Cleared',
        detail: 'All items have been removed from your cart',
        life: 3000
    });
};

const checkout = () => {
    loading.value = true;

    toast.add({
        severity: 'success',
        summary: 'Processing Order',
        detail: `Processing ${cartItemsCount.value} items worth $${cartTotal.value.toFixed(2)}`,
        life: 3000
    });

    // Simulate checkout process
    setTimeout(() => {
        cartItems.value = [];
        cartVisible.value = false;
        loading.value = false;

        toast.add({
            severity: 'success',
            summary: 'Order Confirmed',
            detail: 'Your order has been placed successfully!',
            life: 5000
        });
    }, 2000);
};

const navigateToLogin = () => {
    router.push('/auth/login');
};

const navigateToRegister = () => {
    router.push('/auth/register');
};

const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return {
        full: fullStars,
        half: hasHalfStar,
        empty: emptyStars
    };
};

// Lifecycle hooks
onMounted(() => {
    console.log('Master Color Store initialized');
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkScreenSize);
});
</script>

<template>
    <div class="store-container min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b sticky top-0 z-40">
            <div class="max-w-7xl mx-auto p-2 sm:p-3 md:p-4">
                <div class="flex flex-wrap justify-between items-center gap-2">
                    <!-- Logo -->
                    <div class="flex items-center space-x-2">
                        <img src="/mc.png" alt="Master Color Logo" class="h-8 sm:h-10" />
                        <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Master Color Store</h1>
                    </div>

                    <!-- Search bar -->
                    <div class="flex-1 max-w-md mx-0 sm:mx-2 md:mx-4 lg:mx-8 order-3 sm:order-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <IconField>
                            <InputIcon class="pi pi-search" />
                            <InputText v-model="searchQuery" placeholder="Buscar productos, categorías..." class="w-full" />
                        </IconField>
                    </div>

                    <!-- Auth buttons and cart -->
                    <div class="flex items-center space-x-2 sm:space-x-4 order-2 sm:order-3">
                        <Button icon="pi pi-sign-in" :label="isSmallScreen ? undefined : 'Iniciar sesión'" class="p-button-outlined p-button-sm font-medium" :class="{ 'p-button-icon-only': isSmallScreen }" @click="navigateToLogin" />
                        <Button
                            icon="pi pi-user-plus"
                            :label="isSmallScreen ? undefined : 'Registrarse'"
                            class="p-button-sm bg-blue-600 border-blue-600 hover:bg-blue-700 font-medium shadow-md"
                            :class="{ 'p-button-icon-only': isSmallScreen }"
                            @click="navigateToRegister"
                        />

                        <!-- Cart button -->
                        <div class="relative">
                            <OverlayBadge :value="cartItemsCount" severity="danger" class="inline-flex">
                                <Button icon="pi pi-shopping-cart" class="p-button-rounded p-button-lg shadow-md" :class="cartItems.length > 0 ? 'bg-green-600 border-green-600 hover:bg-green-700' : ''" @click="toggleCart" />
                            </OverlayBadge>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <div class="max-w-7xl mx-auto p-2 sm:p-3 md:p-4">
            <div class="flex flex-col md:flex-row gap-3 md:gap-6">
                <!-- Category sidebar -->
                <div class="w-full md:w-64 md:flex-shrink-0">
                    <div class="bg-white rounded-lg shadow-sm p-3 sm:p-4 sticky top-[4.5rem] md:top-24">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-semibold text-gray-800">Categorías</h2>
                            <Button v-if="selectedCategory || searchQuery" v-tooltip="'Limpiar filtros'" icon="pi pi-filter-slash" class="p-button-rounded p-button-outlined p-button-sm p-button-danger" @click="clearFilters" />
                        </div>

                        <div class="flex flex-wrap md:flex-col md:space-y-2 gap-2 md:gap-0">
                            <div
                                v-for="category in categories"
                                :key="category.id"
                                @click="selectCategory(category)"
                                class="flex items-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base"
                                :class="selectedCategory === category ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600'"
                            >
                                <i :class="['pi', category.icon, 'mr-3']"></i>
                                <span class="font-medium">{{ category.name }}</span>
                            </div>
                        </div>

                        <!-- Filter summary -->
                        <div v-if="selectedCategory || searchQuery" class="mt-4 pt-4 border-t border-gray-200">
                            <p class="text-sm text-gray-600">Mostrando {{ filteredProducts.length }} de {{ products.length }} productos</p>
                        </div>
                    </div>
                </div>

                <!-- Products grid -->
                <div class="flex-1">
                    <!-- No results -->
                    <div v-if="filteredProducts.length === 0" class="text-center py-16 bg-white rounded-lg shadow-sm">
                        <i class="pi pi-search text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl text-gray-500 mb-2">No se encontraron productos</h3>
                        <p class="text-gray-400 mb-4">Intenta ajustar tu búsqueda o filtros</p>
                        <Button v-tooltip="'Limpiar todos los filtros'" icon="pi pi-broom" class="p-button-rounded p-button-outlined p-button-danger" @click="clearFilters" />
                    </div>

                    <!-- Products grid -->
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        <div v-for="product in filteredProducts" :key="product.id" class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                            <!-- Product image -->
                            <div class="relative overflow-hidden">
                                <img :src="product.image" :alt="product.name" class="w-full h-36 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />

                                <!-- Discount badge -->
                                <div v-if="product.originalPrice > product.price" class="absolute top-2 left-2">
                                    <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"> -{{ Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) }}% </span>
                                </div>

                                <!-- Stock status -->
                                <div v-if="!product.inStock" class="absolute top-2 right-2">
                                    <span class="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded"> Agotado </span>
                                </div>
                            </div>

                            <!-- Product info -->
                            <div class="p-3 sm:p-4">
                                <div class="mb-2">
                                    <span class="text-xs text-gray-500 uppercase tracking-wide">{{ product.category }}</span>
                                </div>

                                <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {{ product.name }}
                                </h3>

                                <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {{ product.description }}
                                </p>

                                <!-- Rating -->
                                <div class="flex items-center mb-3">
                                    <div class="flex items-center">
                                        <i v-for="n in generateStars(product.rating).full" :key="'full-' + n" class="pi pi-star-fill text-yellow-400 text-sm"></i>
                                        <i v-if="generateStars(product.rating).half" class="pi pi-star-half-fill text-yellow-400 text-sm"></i>
                                        <i v-for="n in generateStars(product.rating).empty" :key="'empty-' + n" class="pi pi-star text-gray-300 text-sm"></i>
                                    </div>
                                    <span class="text-sm text-gray-500 ml-2">({{ product.rating }})</span>
                                </div>

                                <!-- Price -->
                                <div class="flex items-center justify-between mb-3 sm:mb-4">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xl font-bold text-blue-600"> S/ {{ product.price.toFixed(2) }} </span>
                                        <span v-if="product.originalPrice > product.price" class="text-sm text-gray-400 line-through"> S/ {{ product.originalPrice.toFixed(2) }} </span>
                                    </div>
                                </div>

                                <!-- Add to cart button -->
                                <Button
                                    :icon="product.inStock ? 'pi pi-shopping-cart' : 'pi pi-times'"
                                    :label="product.inStock ? 'Añadir al carrito' : 'Agotado'"
                                    :class="product.inStock ? 'w-full' : 'w-full p-button-secondary'"
                                    :disabled="!product.inStock || loading"
                                    @click="addToCart(product)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Shopping Cart Modal -->
        <Dialog v-model:visible="cartVisible" modal header="Carrito de compras" :style="{ width: '95vw', maxWidth: '600px' }" class="cart-dialog">
            <!-- Empty cart -->
            <div v-if="cartItems.length === 0" class="text-center py-12">
                <i class="pi pi-shopping-cart text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl text-gray-500 mb-2">Tu carrito está vacío</h3>
                <p class="text-gray-400">¡Añade algunos productos de impresión para comenzar!</p>
            </div>

            <!-- Cart items -->
            <div v-else>
                <div class="max-h-[60vh] sm:max-h-96 overflow-y-auto mb-4">
                    <div v-for="(item, index) in cartItems" :key="index" class="flex flex-wrap sm:flex-nowrap items-center p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors gap-2">
                        <!-- Product image -->
                        <img :src="item.image" :alt="item.name" class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0" />

                        <!-- Product info -->
                        <div class="flex-1 ml-0 sm:ml-4 w-[calc(100%-3.5rem)] sm:w-auto">
                            <h4 class="font-semibold text-gray-800 text-sm sm:text-base line-clamp-1 sm:line-clamp-none">{{ item.name }}</h4>
                            <p class="text-sm text-gray-500">{{ item.category }}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="text-sm font-medium text-blue-600">S/ {{ item.price.toFixed(2) }}</span>
                                <span v-if="item.originalPrice > item.price" class="text-xs text-gray-400 line-through"> S/ {{ item.originalPrice.toFixed(2) }} </span>
                            </div>
                        </div>

                        <!-- Quantity controls -->
                        <div class="flex items-center space-x-1 sm:space-x-2 order-3 sm:order-none w-auto">
                            <Button icon="pi pi-minus" class="p-button-rounded p-button-text p-button-sm" @click="decreaseQuantity(index)" />
                            <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                            <Button icon="pi pi-plus" class="p-button-rounded p-button-text p-button-sm" @click="increaseQuantity(index)" />
                        </div>

                        <!-- Item total and remove -->
                        <div class="flex flex-col items-end ml-auto sm:ml-4 order-2 sm:order-none">
                            <span class="font-bold text-gray-800">S/ {{ (item.price * item.quantity).toFixed(2) }}</span>
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text p-button-sm mt-1" @click="removeFromCart(index)" />
                        </div>
                    </div>
                </div>

                <!-- Cart summary -->
                <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">Artículos ({{ cartItemsCount }}):</span>
                        <span class="font-medium">S/ {{ cartTotal.toFixed(2) }}</span>
                    </div>

                    <div v-if="totalSavings > 0" class="flex justify-between items-center text-green-600">
                        <span>Ahorras:</span>
                        <span class="font-medium">-S/ {{ totalSavings.toFixed(2) }}</span>
                    </div>

                    <div class="border-t border-gray-200 pt-3">
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-semibold text-gray-800">Total:</span>
                            <span class="text-xl font-bold text-blue-600">S/ {{ cartTotal.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <Button label="Vaciar carrito" icon="pi pi-trash" class="p-button-outlined p-button-danger flex-1" @click="clearCart" />
                    <Button label="Finalizar compra" icon="pi pi-credit-card" class="flex-1 bg-blue-600 border-blue-600 hover:bg-blue-700" :loading="loading" @click="checkout" />
                </div>
            </div>
        </Dialog>

        <!-- Toast notifications -->
        <Toast position="top-right" />
    </div>
</template>

<style scoped>
@media (max-width: 640px) {
    :deep(.p-dialog-header) {
        padding: 1rem;
    }

    :deep(.p-dialog-content) {
        padding: 1rem;
    }

    :deep(.p-button) {
        padding: 0.5rem 0.75rem;
    }

    :deep(.p-button .p-button-icon) {
        font-size: 0.875rem;
    }

    :deep(.p-button .p-button-label) {
        font-size: 0.875rem;
    }

    :deep(.p-toast .p-toast-message) {
        margin: 0.25rem;
        padding: 0.5rem;
    }

    :deep(.p-toast .p-toast-message-content) {
        padding: 0.5rem;
    }
}

.store-container {
    min-height: 100vh;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Custom PrimeVue overrides */
:deep(.p-button) {
    border-radius: 0.5rem;
    font-weight: 500;
}

:deep(.p-dialog-header) {
    border-bottom: 1px solid #e5e7eb;
    padding: 1.5rem;
}

:deep(.p-dialog-content) {
    padding: 1.5rem;
}

:deep(.p-toast .p-toast-message) {
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

:deep(.p-badge) {
    border-radius: 50%;
    min-width: 1.25rem;
    height: 1.25rem;
    font-size: 0.75rem;
    font-weight: 600;
}

/* Smooth transitions */
.group:hover .group-hover\:scale-105 {
    transform: scale(1.05);
}
</style>

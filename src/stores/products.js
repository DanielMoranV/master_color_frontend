import cache from '@/utils/cache'; // Reverted
import { defineStore } from 'pinia';
import { productsApi } from '@/api/index'; // Reverted
import { handleProcessSuccess, handleProcessError } from '@/utils/apiHelpers'; // Reverted

export const useProductsStore = defineStore('productsStore', {
    state: () => ({
        productsList: cache.getItem('productsList') || [], // Reverted
        product: cache.getItem('product') || null, // Reverted
        loading: false,
        error: null,
        success: false,
        message: '',
        validationErrors: []
    }),

    getters: {
        getProductsCount: (state) => state.productsList.length,
        getActiveProducts: (state) => state.productsList.filter((product) => product.status === 'active' || product.status === 1),
        findProductById: (state) => (id) => state.productsList.find((product) => product.id === id)
    },

    actions: {
        async fetchProducts() {
            this.loading = true;
            this.error = null;
            try {
                const response = await productsApi.getProducts();
                const processed = handleProcessSuccess(response, this);
                this.productsList = processed.data.products || processed.data || [];
                console.log('Updated productsList in store:', JSON.stringify(this.productsList, null, 2));
                cache.setItem('productsList', this.productsList);
            } catch (error) {
                this.error = error;
                this.validationErrors = error.response?.data?.errors || [];
            } finally {
                this.loading = false;
            }
        },

        async getProductById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await productsApi.getProductById(id);
                const processed = handleProcessSuccess(response, this);
                this.product = processed.data.product || processed.data;
                console.log('Updated product in store:', JSON.stringify(this.product, null, 2));
                cache.setItem('product', this.product);
            } catch (error) {
                this.error = error;
                this.validationErrors = error.response?.data?.errors || [];
            } finally {
                this.loading = false;
            }
        },

        async createProduct(payload) {
            // This log was added in a previous subtask, ensure it's kept.
            console.log('Data received in store createProduct:', JSON.stringify(payload, null, 2));
            this.loading = true;
            this.error = null;
            try {
                const response = await productsApi.createProduct(payload);
                const processed = handleProcessSuccess(response, this);
                this.product = processed.data.product || processed.data;
                cache.setItem('product', this.product);
            } catch (error) {
                this.error = error;
                this.validationErrors = error.response?.data?.errors || [];
            } finally {
                this.loading = false;
            }
        },

        async updateProduct(id, payload) {
            console.log('Store updateProduct action called with ID:', id, 'and Payload:', JSON.stringify(payload, null, 2));
            this.loading = true;
            this.error = null;
            try {
                const response = await productsApi.updateProduct(id, payload);
                const processed = handleProcessSuccess(response, this);
                this.product = processed.data.product || processed.data;
                console.log('Updated product in store after updateProduct:', JSON.stringify(this.product, null, 2));
                cache.setItem('product', this.product);
            } catch (error) {
                this.error = error;
                this.validationErrors = error.response?.data?.errors || [];
            } finally {
                this.loading = false;
            }
        },

        async deleteProduct(id) {
            console.log('Store deleteProduct action called with ID:', id);
            this.loading = true;
            this.error = null;
            try {
                const response = await productsApi.deleteProduct(id);
                const processed = handleProcessSuccess(response, this);
                this.product = processed.data.product || processed.data; // Or handle list update
                console.log('Product store updated after deleteProduct (product may be null or list updated):', JSON.stringify(this.product, null, 2));
                cache.setItem('product', this.product); // This might be irrelevant if product is deleted/nulled
            } catch (error) {
                this.error = error;
                this.validationErrors = error.response?.data?.errors || [];
            } finally {
                this.loading = false;
            }
        }
    }
});

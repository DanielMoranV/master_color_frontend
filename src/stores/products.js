import cache from '@/utils/cache';
import { defineStore } from 'pinia';
import { productsApi } from '@/api/index';
import { handleProcessSuccess, handleProcessError } from '@/utils/apiHelpers';

export const useProductsStore = defineStore('productsStore', {
    state: () => ({
        productsList: cache.getItem('productsList') || [],
        product: cache.getItem('product') || null,
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
                cache.setItem('product', this.product);
            } catch (error) {
                this.error = error;
                this.validationErrors = error.response?.data?.errors || [];
            } finally {
                this.loading = false;
            }
        },

        async createProduct(payload) {
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
            this.loading = true;
            this.error = null;
            try {
                const response = await productsApi.updateProduct(id, payload);
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

        async deleteProduct(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await productsApi.deleteProduct(id);
                const processed = handleProcessSuccess(response, this);
                this.product = processed.data.product || processed.data;
                cache.setItem('product', this.product);
            } catch (error) {
                this.error = error;
                this.validationErrors = error.response?.data?.errors || [];
            } finally {
                this.loading = false;
            }
        }
    }
});

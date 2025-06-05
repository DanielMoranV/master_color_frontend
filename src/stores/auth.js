import cache from '@/utils/cache';
import { defineStore } from 'pinia';
import { authApi } from '@/api/index';
import { handleProcessSuccess, handleProcessError } from '@/utils/apiHelpers';

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        userType: cache.getItem('userType') || 'user', // 'user' o 'client'
        token: cache.getItem('token') || null,
        user: cache.getItem('currentUser') || null,
        expiresAt: cache.getItem('expiresAt') || null,
        loading: false,
        error: null,
        success: false,
        message: '',
        validationErrors: []
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        currentUser: (state) => state.user,
        isLoading: (state) => state.loading,
        getToken: (state) => state.token,
        getUserType: (state) => state.userType
    },
    actions: {
        async login(payload, type = 'user') {
            this.resetState();
            this.setUserType(type);
            try {
                // Usar la interfaz unificada authApi
                const response = await authApi.login(payload, type);

                const processed = handleProcessSuccess(response, this);
                if (processed.success) {
                    this.setToken(processed.data.token);
                    this.setExpiration(processed.data.expiresIn);
                    this.setUser(processed.data.user);
                    this.startRefreshInterval();
                }
            } catch (error) {
                this.error = error;
                handleProcessError(error, this);
            } finally {
                this.loading = false;
            }
        },
        async register(payload, type = 'user') {
            this.loading = true;
            this.setUserType(type);
            try {
                // Usar la interfaz unificada authApi
                const response = await authApi.register(payload, type);

                const processed = handleProcessSuccess(response, this);
                this.token = processed.data.token;
                this.user = processed.data.user;
                cache.setItem('token', this.token);
                cache.setItem('currentUser', this.user);
            } catch (error) {
                console.log(error);
                this.error = error;
                handleProcessError(error, this);
            } finally {
                this.loading = false;
            }
        },
        async logout() {
            this.loading = true;
            try {
                // Usar la interfaz unificada authApi con el tipo de usuario almacenado
                await authApi.logout(this.userType);

                this.token = null;
                this.user = null;
                cache.removeItem('token');
                cache.removeItem('currentUser');
                cache.removeItem('userType');
            } catch (error) {
                this.error = error;
                handleProcessError(error, this);
            } finally {
                this.loading = false;
            }
        },
        async refresh() {
            this.loading = true;
            try {
                // Usar la interfaz unificada authApi con el tipo de usuario almacenado
                const response = await authApi.refresh(this.userType);

                const processed = handleProcessSuccess(response, this);
                this.token = processed.data.token;
                this.user = processed.data.user;
                cache.setItem('token', this.token);
                cache.setItem('currentUser', this.user);
            } catch (error) {
                this.error = error;
                handleProcessError(error, this);
            } finally {
                this.loading = false;
            }
        },
        async me() {
            this.loading = true;
            try {
                // Usar la interfaz unificada authApi con el tipo de usuario almacenado
                const response = await authApi.me(this.userType);

                const processed = handleProcessSuccess(response, this);
                this.user = processed.data;
                cache.setItem('currentUser', this.user);
            } catch (error) {
                this.error = error;
                handleProcessError(error, this);
            } finally {
                this.loading = false;
            }
        },
        startRefreshInterval() {
            if (this.refreshTimer) clearInterval(this.refreshTimer);

            this.refreshTimer = setInterval(async () => {
                if (!this.token || !this.expiresAt) return;

                const now = Date.now();
                const timeLeft = this.expiresAt - now;

                console.log('Token refresh check. Time left: ', timeLeft);

                if (timeLeft < 90_000) {
                    console.log('Intentando refrescar token como el tiempo restante es menor a 90 segundos.');
                    await this.refresh();
                }
            }, 60_000); // Verifica cada 60s
        },

        setUser(user) {
            if (this.user !== user) {
                this.user = user;
                cache.setItem('currentUser', user);
            }
        },

        setUserType(type) {
            if (this.userType !== type && (type === 'user' || type === 'client')) {
                this.userType = type;
                cache.setItem('userType', type);
            }
        },

        getUserTypeFromCache() {
            const cachedType = cache.getItem('userType');
            if (cachedType && (cachedType === 'user' || cachedType === 'client')) {
                this.userType = cachedType;
            }
            return this.userType;
        },

        setToken(token) {
            if (this.token !== token) {
                this.token = token;
                cache.setItem('token', token);
            }
        },

        setExpiration(expiresInSeconds) {
            const expirationTime = Date.now() + expiresInSeconds * 1000;
            if (this.expiresAt !== expirationTime) {
                this.expiresAt = expirationTime;
                cache.setItem('expiresAt', expirationTime);
            }
        },

        clearAuthData() {
            this.user = null;
            this.token = null;
            this.expiresAt = null;
            this.success = false;
            this.message = '';
            this.validationErrors = [];
            // No limpiamos userType para mantener la preferencia del usuario

            cache.removeItem('currentUser');
            cache.removeItem('token');
            cache.removeItem('expiresAt');

            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
        },
        resetState() {
            this.loading = true;
            this.message = '';
            this.success = false;
            this.validationErrors = [];
        }
    }
});

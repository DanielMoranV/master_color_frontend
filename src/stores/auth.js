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
        isAuthenticated: (state) => !!state.user && !!state.success,
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

                console.log(processed);
                if (processed.success) {
                    this.setToken(processed.data.access_token);
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
                this.token = processed.data.access_token;
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
                this.token = processed.data.access_token;
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
                console.log(this.userType);
                // Usar la interfaz unificada authApi con el tipo de usuario almacenado
                const response = await authApi.me(this.userType);

                const processed = handleProcessSuccess(response, this);
                console.log(processed);
                this.user = processed.data.user;
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
        },

        /**
         * Verifica el email del usuario utilizando el token enviado por correo
         * @param {Object} payload - Contiene el token de verificación
         * @returns {Promise<void>}
         */
        async verifyEmail(payload) {
            this.resetState();
            try {
                // Solo disponible para clientes
                const response = await authApi.verifyEmail(payload);
                
                const processed = handleProcessSuccess(response, this);
                
                if (processed.success && this.user) {
                    // Actualizar el estado del usuario si está autenticado
                    this.user = {
                        ...this.user,
                        email_verified_at: new Date().toISOString()
                    };
                    cache.setItem('currentUser', this.user);
                }
                
                return processed;
            } catch (error) {
                handleProcessError(error, this);
                return { success: false, message: error.message || 'Error al verificar el email' };
            } finally {
                this.loading = false;
            }
        },

        /**
         * Reenvía el correo de verificación al usuario actual
         * @param {Object} payload - Puede contener el email si es necesario
         * @returns {Promise<void>}
         */
        async resendVerificationEmail(payload = {}) {
            this.resetState();
            try {
                // Si no se proporciona un email y el usuario está autenticado, usar su email
                if (!payload.email && this.user && this.user.email) {
                    payload = { email: this.user.email };
                }
                
                // Solo disponible para clientes
                const response = await authApi.resendVerificationEmail(payload);
                
                return handleProcessSuccess(response, this);
            } catch (error) {
                handleProcessError(error, this);
                return { success: false, message: error.message || 'Error al reenviar el correo de verificación' };
            } finally {
                this.loading = false;
            }
        },

        /**
         * Solicita un enlace para restablecer la contraseña
         * @param {Object} payload - Contiene el email del usuario
         * @returns {Promise<Object>} - Resultado de la operación
         */
        async forgotPassword(payload) {
            this.resetState();
            try {
                const response = await authApi.forgotPassword(payload);
                return handleProcessSuccess(response, this);
            } catch (error) {
                handleProcessError(error, this);
                return { success: false, message: error.message || 'Error al solicitar el restablecimiento de contraseña' };
            } finally {
                this.loading = false;
            }
        },

        /**
         * Restablece la contraseña del usuario utilizando el token
         * @param {Object} payload - Contiene email, token, password y password_confirmation
         * @returns {Promise<Object>} - Resultado de la operación
         */
        async resetPassword(payload) {
            this.resetState();
            try {
                const response = await authApi.resetPassword(payload);
                return handleProcessSuccess(response, this);
            } catch (error) {
                handleProcessError(error, this);
                return { success: false, message: error.message || 'Error al restablecer la contraseña' };
            } finally {
                this.loading = false;
            }
        }
    }
});

import axios from './axios';

// Auth para usuarios (administradores, empleados, etc.)
export const login = (payload) => axios.post('/auth/login', payload);
export const register = (payload) => axios.post('/auth/register', payload);
export const logout = () => axios.post('/auth/logout');
export const refresh = () => axios.post('/auth/refresh');
export const me = () => axios.post('/auth/me');

// Auth para clientes (compradores)
export const loginClient = (payload) => axios.post('/client/auth/login', payload);
export const registerClient = (payload) => axios.post('/client/auth/register', payload);
export const logoutClient = () => axios.post('/client/auth/logout');
export const refreshClient = () => axios.post('/client/auth/refresh');
export const meClient = () => axios.post('/client/auth/me');
export const verifyEmail = (payload) => axios.post('/client/auth/verify-email', payload);
export const resendVerificationEmail = (payload) => axios.post('/client/auth/resend-verification', payload);
export const forgotPassword = (payload) => axios.post('/client/auth/forgot-password', payload);
export const resetPassword = (payload) => axios.post('/client/auth/reset-password', payload);

// Función genérica para seleccionar el endpoint correcto según el tipo de usuario
export const authApi = {
    login: (payload, type = 'user') => (type === 'client' ? loginClient(payload) : login(payload)),
    register: (payload, type = 'user') => (type === 'client' ? registerClient(payload) : register(payload)),
    logout: (type = 'user') => (type === 'client' ? logoutClient() : logout()),
    refresh: (type = 'user') => (type === 'client' ? refreshClient() : refresh()),
    me: (type = 'user') => (type === 'client' ? meClient() : me()),
    verifyEmail: (payload) => verifyEmail(payload), // Solo disponible para clientes
    resendVerificationEmail: (payload) => resendVerificationEmail(payload), // Solo disponible para clientes
    forgotPassword: (payload) => forgotPassword(payload), // Solo disponible para clientes
    resetPassword: (payload) => resetPassword(payload) // Solo disponible para clientes
};

// Funciones para usuarios
export const usersApi = {
    getUsers: () => axios.get('/users'),
    getUserById: (id) => axios.get(`/users/${id}`),
    createUser: (payload) => axios.post('/users', payload),
    updateUser: (id, payload) => axios.put(`/users/${id}`, payload),
    deleteUser: (id) => axios.delete(`/users/${id}`)
};

// Funciones para roles
export const rolesApi = {
    getRoles: () => axios.get('/roles'),
    getRoleById: (id) => axios.get(`/roles/${id}`),
    createRole: (payload) => axios.post('/roles', payload),
    updateRole: (id, payload) => axios.put(`/roles/${id}`, payload),
    deleteRole: (id) => axios.delete(`/roles/${id}`)
};

// Funciones para productos
export const productsApi = {
    getProducts: () => axios.get('/products'),
    getProductById: (id) => axios.get(`/products/${id}`),
    createProduct: (formData) =>
        axios.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
    updateProduct: (id, formData) =>
        axios.put(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
    deleteProduct: (id) => axios.delete(`/products/${id}`)
};

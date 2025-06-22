import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/dashboard',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { roles: ['admin'] }
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: () => import('@/views/auth/Profile.vue'),
                    meta: { public: true }
                },
                {
                    path: '/products',
                    name: 'products',
                    component: () => import('@/views/products/Products.vue'),
                    meta: { roles: ['admin', 'almacen'] }
                },
                {
                    path: '/users',
                    name: 'users',
                    component: () => import('@/views/users/Users.vue'),
                    meta: { roles: ['admin'] }
                }
            ]
        },
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/store/Home.vue'),
            meta: { public: true } // Ruta pública
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/auth/Login.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/auth/employee-login',
            name: 'loginEmployee',
            component: () => import('@/views/auth/EmployeeLogin.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/auth/Register.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/verify-email',
            name: 'verifyEmail',
            component: () => import('@/views/auth/VerifyEmail.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/forgot-password',
            name: 'forgotPassword',
            component: () => import('@/views/auth/ForgotPassword.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/reset-password',
            name: 'resetPassword',
            component: () => import('@/views/auth/ResetPassword.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/accessdenied',
            name: 'accessDenied',
            component: () => import('@/views/auth/Access.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/error',
            name: 'error',
            component: () => import('@/views/auth/Error.vue'),
            meta: { public: true } // Ruta pública
        },
        {
            path: '/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: { public: true } // Ruta públicaW
        },
        {
            path: '/:catchAll(.*)',
            redirect: '/notfound',
            meta: { public: true } // Ruta pública
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Si la ruta es pública, permite acceso
    if (to.meta.public) {
        return next();
    }

    // Verificar autenticación
    if (!authStore.currentUser) {
        console.log(authStore.currentUser);
        return next({ name: 'login' });
    }

    // Verificar usuario activo
    if (!authStore.currentUser?.is_active) {
        console.log(authStore.currentUser?.is_active);
        return next({ name: 'login' });
    }

    // Verificar permisos por rol
    const userRole = authStore.userRole?.toLowerCase();
    const allowedRoles = to.meta.roles || [];

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        console.log(userRole);
        console.log(allowedRoles);
        return next({ name: 'accessDenied' });
    }

    next();
});

export default router;

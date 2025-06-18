import AppLayout from '@/layout/AppLayout.vue';
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
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: () => import('@/views/auth/Profile.vue')
                },
                {
                    path: '/users',
                    name: 'users',
                    component: () => import('@/views/users/Users.vue')
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

export default router;

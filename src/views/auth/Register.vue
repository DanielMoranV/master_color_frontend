<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

// Estado
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const clientType = ref('persona'); // persona o empresa
const identityDocument = ref('');
const documentType = ref('dni'); // dni, ce, pasaporte, ruc
const phone = ref('');
const acceptTerms = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Errores
const nameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const identityDocumentError = ref('');
const phoneError = ref('');
const termsError = ref('');

// Opciones de tipo de cliente
const clientTypeOptions = [
    { label: 'Persona Natural', value: 'persona' },
    { label: 'Empresa', value: 'empresa' }
];

// Opciones de tipo de documento según el tipo de cliente
const documentTypeOptions = computed(() => {
    if (clientType.value === 'persona') {
        return [
            { label: 'DNI', value: 'dni' },
            { label: 'Carnet de Extranjería', value: 'ce' },
            { label: 'Pasaporte', value: 'pasaporte' }
        ];
    } else {
        return [{ label: 'RUC', value: 'ruc' }];
    }
});

// Actualizar tipo de documento cuando cambia el tipo de cliente
const onClientTypeChange = () => {
    if (clientType.value === 'persona') {
        documentType.value = 'dni';
    } else {
        documentType.value = 'ruc';
    }
    identityDocument.value = '';
    identityDocumentError.value = '';
};

// Validaciones
const validateForm = () => {
    let isValid = true;

    // Limpiar errores
    nameError.value = '';
    emailError.value = '';
    passwordError.value = '';
    confirmPasswordError.value = '';
    identityDocumentError.value = '';
    phoneError.value = '';
    termsError.value = '';

    // Validar nombre
    if (!name.value.trim()) {
        nameError.value = 'El nombre es requerido';
        isValid = false;
    } else if (name.value.trim().length < 2) {
        nameError.value = 'El nombre debe tener al menos 2 caracteres';
        isValid = false;
    }

    // Validar email
    if (!email.value) {
        emailError.value = 'El correo electrónico es requerido';
        isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
        emailError.value = 'Ingrese un correo electrónico válido';
        isValid = false;
    }

    // Validar contraseña
    if (!password.value) {
        passwordError.value = 'La contraseña es requerida';
        isValid = false;
    } else if (password.value.length < 6) {
        passwordError.value = 'La contraseña debe tener al menos 6 caracteres';
        isValid = false;
    }

    // Validar confirmación de contraseña
    if (!confirmPassword.value) {
        confirmPasswordError.value = 'Confirme su contraseña';
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        confirmPasswordError.value = 'Las contraseñas no coinciden';
        isValid = false;
    }

    // Validar documento de identidad
    if (!identityDocument.value) {
        identityDocumentError.value = 'El documento de identidad es requerido';
        isValid = false;
    } else {
        const doc = identityDocument.value.trim();
        if (documentType.value === 'dni' && (doc.length !== 8 || !/^\d+$/.test(doc))) {
            identityDocumentError.value = 'El DNI debe tener 8 dígitos';
            isValid = false;
        } else if (documentType.value === 'ruc' && (doc.length !== 11 || !/^\d+$/.test(doc))) {
            identityDocumentError.value = 'El RUC debe tener 11 dígitos';
            isValid = false;
        } else if (documentType.value === 'ce' && doc.length < 7) {
            identityDocumentError.value = 'Ingrese un carnet de extranjería válido';
            isValid = false;
        } else if (documentType.value === 'pasaporte' && doc.length < 6) {
            identityDocumentError.value = 'Ingrese un número de pasaporte válido';
            isValid = false;
        }
    }

    // Validar teléfono
    if (!phone.value) {
        phoneError.value = 'El teléfono es requerido';
        isValid = false;
    } else if (!/^\d{9}$/.test(phone.value.trim())) {
        phoneError.value = 'El teléfono debe tener 9 dígitos';
        isValid = false;
    }

    // Validar términos y condiciones
    if (!acceptTerms.value) {
        termsError.value = 'Debe aceptar los términos y condiciones';
        isValid = false;
    }

    return isValid;
};

const register = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'error',
            summary: 'Error de validación',
            detail: 'Por favor corrige los errores en el formulario',
            life: 4000
        });
        return;
    }

    loading.value = true;

    // Simulación de registro
    setTimeout(() => {
        loading.value = false;

        toast.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'Tu cuenta ha sido creada correctamente',
            life: 4000
        });

        // Redirigir al login
        setTimeout(() => {
            router.push('/login');
        }, 1500);
    }, 2000);
};

const goToLogin = () => {
    router.push('/login');
};

const goToStore = () => {
    router.push('/');
};

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
};
</script>

<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div class="w-full max-w-6xl">
            <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <div class="flex flex-col lg:flex-row">
                    <!-- Panel lateral izquierdo -->
                    <div class="lg:w-1/2 bg-blue-700 p-8 lg:p-12 text-white relative overflow-hidden">
                        <!-- Elementos decorativos de fondo -->
                        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 rounded-full -translate-y-32 translate-x-32"></div>
                        <div class="absolute bottom-0 left-0 w-48 h-48 bg-blue-900 opacity-20 rounded-full translate-y-24 -translate-x-24"></div>

                        <div class="relative z-10 h-full flex flex-col justify-center">
                            <!-- Logo y título -->
                            <div class="text-center lg:text-left mb-8">
                                <div class="flex items-center justify-center lg:justify-start mb-6">
                                    <div class="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                                        <img src="/mc.png" alt="Master Color Logo" class="w-16 h-16 object-contain" />
                                    </div>
                                </div>
                                <h1 class="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-sm">Master Color</h1>
                                <p class="text-xl lg:text-2xl text-blue-50 font-light leading-relaxed">Únete a nuestra comunidad</p>
                            </div>

                            <!-- Beneficios de registrarse -->
                            <div class="space-y-6 mt-6">
                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                        <i class="pi pi-shopping-cart text-blue-700 text-lg font-bold"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-lg text-white">Compras Rápidas</h3>
                                        <p class="text-blue-100 text-sm font-medium">Acceso exclusivo a nuestro catálogo</p>
                                    </div>
                                </div>

                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                        <i class="pi pi-tags text-blue-700 text-lg font-bold"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-lg text-white">Ofertas Especiales</h3>
                                        <p class="text-blue-100 text-sm font-medium">Descuentos exclusivos para clientes</p>
                                    </div>
                                </div>

                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                        <i class="pi pi-truck text-blue-700 text-lg font-bold"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-lg text-white">Seguimiento de Pedidos</h3>
                                        <p class="text-blue-100 text-sm font-medium">Rastrea tus compras en tiempo real</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Call to action -->
                            <div class="mt-4 p-4">
                                <Button
                                    label="Explorar Tienda"
                                    icon="pi pi-shopping-cart"
                                    class="w-full p-button-filled bg-yellow-500 border-yellow-500 text-blue-900 font-bold text-lg hover:bg-yellow-400 hover:border-yellow-400 hover:text-blue-800 transition-all duration-300 shadow-lg"
                                    @click="goToStore"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Panel de registro -->
                    <div class="lg:w-1/2 p-8 lg:p-12 bg-white">
                        <div class="max-w-md mx-auto">
                            <!-- Header del formulario -->
                            <div class="text-center mb-8">
                                <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
                                <p class="text-gray-700 text-lg font-medium">Regístrate y únete a nosotros</p>
                            </div>

                            <form @submit.prevent="register" class="space-y-6">
                                <!-- Campo de nombre -->
                                <div>
                                    <label for="name" class="block text-sm font-bold text-gray-800 mb-3">Nombre Completo</label>
                                    <div class="relative">
                                        <IconField>
                                            <InputIcon class="pi pi-user" />
                                            <InputText id="name" v-model="name" type="text" placeholder="Tu nombre completo" class="w-full text-gray-900 font-medium" :class="nameError ? 'p-invalid' : ''" @input="nameError = ''" />
                                        </IconField>
                                    </div>
                                    <small v-if="nameError" class="p-error text-red-700 text-sm mt-2 block font-semibold">
                                        {{ nameError }}
                                    </small>
                                </div>

                                <!-- Campo de email -->
                                <div>
                                    <label for="email" class="block text-sm font-bold text-gray-800 mb-3">Correo Electrónico</label>
                                    <div class="relative">
                                        <IconField>
                                            <InputIcon class="pi pi-envelope" />
                                            <InputText id="email" v-model="email" type="email" placeholder="tu@email.com" class="w-full text-gray-900 font-medium" :class="emailError ? 'p-invalid' : ''" @input="emailError = ''" />
                                        </IconField>
                                    </div>
                                    <small v-if="emailError" class="p-error text-red-700 text-sm mt-2 block font-semibold">
                                        {{ emailError }}
                                    </small>
                                </div>

                                <!-- Tipo de cliente -->
                                <div>
                                    <label for="clientType" class="block text-sm font-bold text-gray-800 mb-3">Tipo de Cliente</label>
                                    <Dropdown v-model="clientType" :options="clientTypeOptions" optionLabel="label" optionValue="value" placeholder="Selecciona el tipo de cliente" class="w-full" @change="onClientTypeChange" />
                                </div>

                                <!-- Tipo de documento y número -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label for="documentType" class="block text-sm font-bold text-gray-800 mb-3">Tipo de Documento</label>
                                        <Dropdown v-model="documentType" :options="documentTypeOptions" optionLabel="label" optionValue="value" placeholder="Tipo de documento" class="w-full" />
                                    </div>
                                    <div>
                                        <label for="identityDocument" class="block text-sm font-bold text-gray-800 mb-3">Número de Documento</label>
                                        <InputText
                                            id="identityDocument"
                                            v-model="identityDocument"
                                            type="text"
                                            :placeholder="documentType === 'dni' ? '12345678' : documentType === 'ruc' ? '12345678901' : 'Número de documento'"
                                            class="w-full text-gray-900 font-medium"
                                            :class="identityDocumentError ? 'p-invalid' : ''"
                                            @input="identityDocumentError = ''"
                                        />
                                        <small v-if="identityDocumentError" class="p-error text-red-700 text-sm mt-2 block font-semibold">
                                            {{ identityDocumentError }}
                                        </small>
                                    </div>
                                </div>

                                <!-- Campo de teléfono -->
                                <div>
                                    <label for="phone" class="block text-sm font-bold text-gray-800 mb-3">Teléfono</label>
                                    <div class="relative">
                                        <IconField>
                                            <InputIcon class="pi pi-phone" />
                                            <InputText id="phone" v-model="phone" type="tel" placeholder="987654321" class="w-full text-gray-900 font-medium" :class="phoneError ? 'p-invalid' : ''" @input="phoneError = ''" />
                                        </IconField>
                                    </div>
                                    <small v-if="phoneError" class="p-error text-red-700 text-sm mt-2 block font-semibold">
                                        {{ phoneError }}
                                    </small>
                                </div>

                                <!-- Campos de contraseña -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label for="password" class="block text-sm font-bold text-gray-800 mb-3">Contraseña</label>
                                        <div class="relative">
                                            <IconField>
                                                <InputIcon class="pi pi-lock" />
                                                <InputText
                                                    id="password"
                                                    v-model="password"
                                                    :type="showPassword ? 'text' : 'password'"
                                                    placeholder="Tu contraseña"
                                                    class="w-full text-gray-900 font-medium"
                                                    :class="passwordError ? 'p-invalid' : ''"
                                                    @input="passwordError = ''"
                                                />
                                                <i
                                                    :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                                                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors text-lg"
                                                    @click="togglePasswordVisibility"
                                                ></i>
                                            </IconField>
                                        </div>
                                        <small v-if="passwordError" class="p-error text-red-700 text-sm mt-2 block font-semibold">
                                            {{ passwordError }}
                                        </small>
                                    </div>
                                    <div>
                                        <label for="confirmPassword" class="block text-sm font-bold text-gray-800 mb-3">Confirmar Contraseña</label>
                                        <div class="relative">
                                            <IconField>
                                                <InputIcon class="pi pi-lock" />
                                                <InputText
                                                    id="confirmPassword"
                                                    v-model="confirmPassword"
                                                    :type="showConfirmPassword ? 'text' : 'password'"
                                                    placeholder="Confirma tu contraseña"
                                                    class="w-full text-gray-900 font-medium"
                                                    :class="confirmPasswordError ? 'p-invalid' : ''"
                                                    @input="confirmPasswordError = ''"
                                                />
                                                <i
                                                    :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                                                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors text-lg"
                                                    @click="toggleConfirmPasswordVisibility"
                                                ></i>
                                            </IconField>
                                        </div>
                                        <small v-if="confirmPasswordError" class="p-error text-red-700 text-sm mt-2 block font-semibold">
                                            {{ confirmPasswordError }}
                                        </small>
                                    </div>
                                </div>

                                <!-- Términos y condiciones -->
                                <div>
                                    <div class="flex items-start">
                                        <Checkbox v-model="acceptTerms" :binary="true" id="acceptTerms" class="mr-3 mt-1" />
                                        <label for="acceptTerms" class="text-sm text-gray-800 cursor-pointer font-semibold leading-relaxed">
                                            Acepto los
                                            <a href="#" class="text-blue-700 hover:text-blue-800 underline">términos y condiciones</a>
                                            y la
                                            <a href="#" class="text-blue-700 hover:text-blue-800 underline">política de privacidad</a>
                                        </label>
                                    </div>
                                    <small v-if="termsError" class="p-error text-red-700 text-sm mt-2 block font-semibold">
                                        {{ termsError }}
                                    </small>
                                </div>

                                <!-- Botón de registro -->
                                <Button
                                    type="submit"
                                    label="Crear Cuenta"
                                    icon="pi pi-user-plus"
                                    class="w-full p-3 text-lg font-bold bg-blue-700 border-blue-700 hover:bg-blue-800 hover:border-blue-800 transition-all duration-300 shadow-lg"
                                    :loading="loading"
                                />

                                <!-- Enlace de login -->
                                <div class="text-center pt-6 border-t-2 border-gray-300">
                                    <p class="text-gray-800 mb-4 font-semibold">¿Ya tienes una cuenta?</p>
                                    <Button
                                        label="Iniciar Sesión"
                                        icon="pi pi-sign-in"
                                        class="p-button-outlined p-button-secondary w-full border-2 border-gray-600 text-gray-800 font-bold hover:bg-gray-100 hover:border-gray-700 transition-all duration-300 shadow-md"
                                        @click="goToLogin"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast para notificaciones -->
        <Toast position="top-right" />
    </div>
</template>

<style scoped>
/* Estilos personalizados para PrimeVue mejorados */
:deep(.p-inputtext) {
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    border: 2px solid #d1d5db;
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    background-color: #ffffff;
    transition: all 0.3s ease;
}

:deep(.p-inputtext:focus) {
    border-color: #1d4ed8;
    box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.15);
    background-color: #ffffff;
}

:deep(.p-inputtext.p-invalid) {
    border-color: #dc2626;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15);
    background-color: #fef2f2;
}

:deep(.p-dropdown) {
    border-radius: 0.75rem;
    border: 2px solid #d1d5db;
    font-weight: 500;
    transition: all 0.3s ease;
}

:deep(.p-dropdown:not(.p-disabled):hover) {
    border-color: #9ca3af;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
    border-color: #1d4ed8;
    box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.15);
}

:deep(.p-dropdown .p-dropdown-label) {
    padding: 1rem 1.25rem;
    font-weight: 500;
    color: #111827;
}

:deep(.p-input-icon-left > i:first-of-type) {
    left: 1.25rem;
    color: #6b7280;
    font-weight: bold;
}

:deep(.p-input-icon-left > .p-inputtext) {
    padding-left: 3.5rem;
}

:deep(.p-input-icon-right > .p-inputtext) {
    padding-right: 3.5rem;
}

:deep(.p-button) {
    border-radius: 0.75rem;
    font-weight: 700;
    padding: 1rem 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border-width: 2px;
}

:deep(.p-button:not(.p-button-outlined):not(.p-button-text)) {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: #ffffff;
}

:deep(.p-button:not(.p-button-outlined):not(.p-button-text):hover) {
    background: #1e40af;
    border-color: #1e40af;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(29, 78, 216, 0.4);
}

:deep(.p-button-outlined) {
    background: transparent;
    border-width: 2px;
}

:deep(.p-checkbox) {
    width: 1.25rem;
    height: 1.25rem;
}

:deep(.p-checkbox .p-checkbox-box) {
    border-width: 2px;
    border-color: #6b7280;
    border-radius: 0.375rem;
}

:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box) {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
}

:deep(.p-toast .p-toast-message) {
    border-radius: 0.75rem;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.15),
        0 10px 10px -5px rgba(0, 0, 0, 0.08);
    border-width: 1px;
}

:deep(.p-toast .p-toast-message-success) {
    background-color: #dcfce7;
    border-color: #16a34a;
}

:deep(.p-toast .p-toast-message-error) {
    background-color: #fef2f2;
    border-color: #dc2626;
}

/* Animaciones y efectos mejorados */
.p-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.p-inputtext {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.p-button-outlined:hover) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Mejoras adicionales de contraste */
:deep(.p-inputtext::placeholder) {
    color: #9ca3af;
    font-weight: 500;
}

/* Hover states mejorados */
:deep(.p-button:hover) {
    font-weight: 700;
}

/* Estados de focus mejorados */
:deep(.p-button:focus) {
    box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.2);
}

:deep(.p-checkbox:focus .p-checkbox-box) {
    box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.2);
}
</style>

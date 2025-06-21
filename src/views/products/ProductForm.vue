<template>
    <div class="compact-form">
        <form @submit.prevent="handleSubmit">
            <div class="form-grid">
                <!-- Fila 1: Nombre y SKU -->
                <div class="form-row">
                    <div class="form-field">
                        <label for="name" class="field-label">Nombre *</label>
                        <InputText id="name" v-model="formData.name" :class="{ 'p-invalid': errors.name }" placeholder="Nombre del producto" class="compact-input" />
                        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                    </div>
                    <div class="form-field">
                        <label for="sku" class="field-label">SKU *</label>
                        <InputText id="sku" v-model="formData.sku" :class="{ 'p-invalid': errors.sku }" placeholder="SKU único" class="compact-input" />
                        <small v-if="errors.sku" class="p-error">{{ errors.sku }}</small>
                    </div>
                </div>

                <!-- Fila 2: Código de barras y Marca -->
                <div class="form-row">
                    <div class="form-field">
                        <label for="barcode" class="field-label">Código de barras *</label>
                        <InputText id="barcode" v-model="formData.barcode" :class="{ 'p-invalid': errors.barcode }" placeholder="Código de barras" class="compact-input" />
                        <small v-if="errors.barcode" class="p-error">{{ errors.barcode }}</small>
                    </div>
                    <div class="form-field">
                        <label for="brand" class="field-label">Marca</label>
                        <InputText id="brand" v-model="formData.brand" placeholder="Marca del producto" class="compact-input" />
                    </div>
                </div>

                <!-- Fila 3: Categoría y Presentación -->
                <div class="form-row">
                    <div class="form-field">
                        <label for="category" class="field-label">Categoría</label>
                        <Select id="category" v-model="formData.category" :options="categoriesOptions" optionLabel="label" optionValue="value" placeholder="Categoría del producto" class="compact-input" />
                    </div>
                    <div class="form-field">
                        <label for="presentation" class="field-label">Presentación</label>
                        <InputText id="presentation" v-model="formData.presentation" placeholder="Presentación del producto" class="compact-input" />
                    </div>
                </div>

                <!-- Fila 4: Unidad y Descripción -->
                <div class="form-row">
                    <div class="form-field">
                        <label for="unidad" class="field-label">Unidad *</label>
                        <Select id="unidad" v-model="formData.unidad" :options="unidadOptions" optionLabel="label" optionValue="value" :class="{ 'p-invalid': errors.unidad }" placeholder="Selecciona unidad" class="compact-input" />
                        <small v-if="errors.unidad" class="p-error">{{ errors.unidad }}</small>
                    </div>
                    <div class="form-field">
                        <label for="description" class="field-label">Descripción</label>
                        <InputText id="description" v-model="formData.description" placeholder="Descripción del producto" class="compact-input" />
                    </div>
                </div>

                <!-- Fila 5: Upload de imagen -->
                <div class="form-row image-upload-row">
                    <div class="form-field image-field">
                        <label class="field-label">Imagen del Producto</label>
                        <FileUpload mode="basic" :choose-label="selectedImage ? 'Cambiar imagen' : 'Seleccionar imagen'" accept="image/*" :max-file-size="5000000" @select="onImageSelect" @clear="onImageClear" class="compact-upload" />
                        <small class="upload-hint">Formatos: JPG, PNG, GIF. Máximo 5MB</small>
                    </div>
                    <div class="form-field image-preview-field" v-if="imagePreview">
                        <label class="field-label">Vista previa</label>
                        <div class="image-preview">
                            <img :src="imagePreview" alt="Vista previa" class="preview-image" />
                            <Button icon="pi pi-times" class="p-button-rounded p-button-danger p-button-sm remove-image-btn" @click="removeImage" type="button" v-tooltip="'Eliminar imagen'" />
                        </div>
                    </div>
                </div>

                <!-- Fila 6: Estado activo -->
                <div class="form-row">
                    <div class="form-field status-field">
                        <label class="field-label">Estado</label>
                        <div class="status-toggle">
                            <Checkbox id="is_active" v-model="formData.is_active" :binary="true" class="mr-2" />
                            <label for="is_active" class="status-label">
                                {{ formData.is_active ? 'Producto activo' : 'Producto inactivo' }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="$emit('cancel')" type="button" />
                <Button :label="isEdit ? 'Actualizar' : 'Crear'" :icon="isEdit ? 'pi pi-check' : 'pi pi-plus'" type="submit" :loading="loading" />
            </div>
        </form>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

const props = defineProps({
    product: {
        type: Object,
        default: () => ({})
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['submit', 'cancel']);

const isEdit = computed(() => props.product && props.product.id);

const unidadOptions = [
    { label: 'Unidad', value: 'unidad' },
    { label: 'Kilogramo (kg)', value: 'kg' },
    { label: 'Gramo (g)', value: 'g' },
    { label: 'Libra (lb)', value: 'lb' },
    { label: 'Onza (oz)', value: 'oz' },
    { label: 'Litro (l)', value: 'l' },
    { label: 'Mililitro (ml)', value: 'ml' },
    { label: 'Metro (m)', value: 'm' },
    { label: 'Centímetro (cm)', value: 'cm' },
    { label: 'Milímetro (mm)', value: 'mm' },
    { label: 'Pieza (pza)', value: 'pza' },
    { label: 'Caja', value: 'caja' },
    { label: 'Paquete', value: 'paquete' },
    { label: 'Docena', value: 'docena' },
    { label: 'Otro', value: 'otro' }
];

const categoriesOptions = [
    { label: 'Impresoras', value: 'impresoras' },
    { label: 'Tintas', value: 'tintas' },
    { label: 'Tóners', value: 'toners' },
    { label: 'Papel', value: 'papel' },
    { label: 'Repuestos', value: 'repuestos' },
    { label: 'Accesorios', value: 'accesorios' }
];

const formData = reactive({
    name: '',
    sku: '',
    barcode: '',
    brand: '',
    category: '',
    presentation: '',
    unidad: '',
    description: '',
    image: null,
    is_active: true
});

const errors = reactive({
    name: '',
    sku: '',
    barcode: '',
    unidad: ''
});

const selectedImage = ref(null);
const imagePreview = ref(null);

const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
        errors[key] = '';
    });
};

const onImageSelect = (event) => {
    const file = event.files[0];
    if (file) {
        selectedImage.value = file;
        formData.image = file;

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const onImageClear = () => {
    selectedImage.value = null;
    formData.image = null;
    imagePreview.value = null;
};

const removeImage = () => {
    onImageClear();
};

// Watch for product prop changes
watch(
    () => props.product,
    (newProduct) => {
        if (newProduct && newProduct.id) {
            // Editando producto existente
            formData.name = newProduct.name || '';
            formData.sku = newProduct.sku || '';
            formData.barcode = newProduct.barcode || '';
            formData.brand = newProduct.brand || '';
            formData.category = newProduct.category || '';
            formData.presentation = newProduct.presentation || '';
            formData.unidad = newProduct.unidad || '';
            formData.description = newProduct.description || '';
            formData.is_active = newProduct.is_active !== undefined ? newProduct.is_active : true;

            // Limpiar imagen para edición
            selectedImage.value = null;
            formData.image = null;
            imagePreview.value = null;

            // Si el producto tiene una imagen URL, mostrarla como preview
            if (newProduct.image_url) {
                imagePreview.value = newProduct.image_url;
            }
        } else {
            // Creando nuevo producto
            formData.name = '';
            formData.sku = '';
            formData.barcode = '';
            formData.brand = '';
            formData.category = '';
            formData.presentation = '';
            formData.unidad = '';
            formData.description = '';
            formData.image = null;
            formData.is_active = true;

            selectedImage.value = null;
            imagePreview.value = null;
        }
        clearErrors();
    },
    { immediate: true }
);

const validateForm = () => {
    clearErrors();
    let isValid = true;

    if (!formData.name.trim()) {
        errors.name = 'El nombre es requerido';
        isValid = false;
    }

    if (!formData.sku.trim()) {
        errors.sku = 'El SKU es requerido';
        isValid = false;
    }

    if (!formData.barcode.trim()) {
        errors.barcode = 'El código de barras es requerido';
        isValid = false;
    }

    if (!formData.unidad) {
        errors.unidad = 'La unidad es requerida';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = () => {
    if (validateForm()) {
        const submitData = { ...formData };

        emit('submit', submitData);
    }
};
</script>

<style scoped>
.compact-form {
    padding: 1rem;
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.image-upload-row {
    grid-template-columns: 1fr;
    gap: 1rem;
}

.image-upload-row .image-field {
    grid-column: 1;
}

.image-upload-row .image-preview-field {
    grid-column: 1;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.status-field {
    grid-column: 1 / -1;
}

.field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 0.25rem;
}

.compact-input {
    height: 2.5rem;
}

.compact-input :deep(.p-inputtext) {
    height: 2.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
}

.compact-input :deep(.p-dropdown) {
    height: 2.5rem;
}

.compact-input :deep(.p-dropdown-label) {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
}

.compact-upload {
    width: 100%;
}

.compact-upload :deep(.p-fileupload-choose) {
    height: 2.5rem;
    font-size: 0.875rem;
}

.upload-hint {
    color: var(--text-color-secondary);
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.image-preview {
    position: relative;
    display: inline-block;
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    overflow: hidden;
    background: var(--surface-ground);
}

.preview-image {
    max-width: 200px;
    max-height: 200px;
    width: auto;
    height: auto;
    display: block;
}

.remove-image-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 2rem;
    height: 2rem;
}

.status-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
}

.status-label {
    font-size: 0.875rem;
    color: var(--text-color);
    cursor: pointer;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
}

.p-error {
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .compact-form {
        padding: 0.75rem;
    }

    .preview-image {
        max-width: 150px;
        max-height: 150px;
    }
}
</style>

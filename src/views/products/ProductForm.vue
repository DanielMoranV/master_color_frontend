<template>
    <div class="compact-form">
        <form @submit.prevent="handleSubmit">
            <div class="form-grid">
                <div class="form-row">
                    <div class="form-field">
                        <label for="name" class="field-label">Nombre *</label>
                        <InputText id="name" v-model="formData.name" :class="{ 'p-invalid': errors.name }" placeholder="Nombre del producto" class="compact-input" />
                        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                    </div>
                    <div class="form-field">
                        <label for="sku" class="field-label">SKU *</label>
                        <InputText id="sku" v-model="formData.sku" :class="{ 'p-invalid': errors.sku }" placeholder="SKU" class="compact-input" />
                        <small v-if="errors.sku" class="p-error">{{ errors.sku }}</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="barcode" class="field-label">Código de barras *</label>
                        <InputText id="barcode" v-model="formData.barcode" :class="{ 'p-invalid': errors.barcode }" placeholder="Código de barras" class="compact-input" />
                        <small v-if="errors.barcode" class="p-error">{{ errors.barcode }}</small>
                    </div>
                    <div class="form-field">
                        <label for="brand" class="field-label">Marca</label>
                        <InputText id="brand" v-model="formData.brand" placeholder="Marca" class="compact-input" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="category" class="field-label">Categoría</label>
                        <InputText id="category" v-model="formData.category" placeholder="Categoría" class="compact-input" />
                    </div>
                    <div class="form-field">
                        <label for="presentation" class="field-label">Presentación</label>
                        <InputText id="presentation" v-model="formData.presentation" placeholder="Presentación" class="compact-input" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="unidad" class="field-label">Unidad</label>
                        <Select id="unidad" v-model="formData.unidad" :options="unidadOptions" optionLabel="label" optionValue="value" placeholder="Selecciona unidad" class="compact-input" :class="{ 'p-invalid': errors.unidad }" />
                        <small v-if="errors.unidad" class="p-error">{{ errors.unidad }}</small>
                    </div>
                    <div class="form-field">
                        <label for="description" class="field-label">Descripción</label>
                        <InputText id="description" v-model="formData.description" placeholder="Descripción" class="compact-input" />
                    </div>
                </div>
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
            </div>
            <div class="form-actions">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="$emit('cancel')" type="button" />
                <Button :label="isEdit ? 'Actualizar' : 'Crear'" :icon="isEdit ? 'pi pi-check' : 'pi pi-plus'" type="submit" :loading="loading" />
            </div>
        </form>
    </div>
</template>

<script setup>
defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    product: {
        type: Object,
        default: () => ({})
    }
});

defineEmits(['cancel', 'submit']);

import { ref } from 'vue';

const unidadOptions = [
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

const formData = ref({
    name: '',
    sku: '',
    barcode: '',
    brand: '',
    category: '',
    presentation: '',
    unidad: '',
    description: '',
    image: null
});

const errors = ref({
    name: '',
    sku: '',
    barcode: '',
    brand: '',
    category: '',
    presentation: '',
    unidad: '',
    description: ''
});

const isEdit = ref(false);
const selectedImage = ref(null);
const imagePreview = ref(null);

const onImageSelect = (event) => {
    const file = event.files[0];
    if (file) {
        selectedImage.value = file;
        formData.value.image = file;

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
    formData.value.image = null;
    imagePreview.value = null;
};

const removeImage = () => {
    onImageClear();
};

const handleSubmit = () => {
    // Aquí puedes agregar validación antes de emitir
    $emit('submit', formData.value);
};
</script>

<style scoped>
.compact-form {
    padding: 0.1rem;
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

.field-label {
    font-weight: bold;
}

.compact-input {
    width: 100%;
}

.compact-upload {
    width: 100%;
}

.upload-hint {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
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

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--surface-border);
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .preview-image {
        max-width: 150px;
        max-height: 150px;
    }
}
</style>

<template>
    <div class="compact-form">
        <form @submit.prevent="handleSubmit">
            <div class="form-grid">
                <div class="form-row">
                    <div class="form-field">
                        <label for="name" class="field-label">Nombre *</label>
                        <InputText id="name" v-model="formData.name" :class="{ 'p-invalid': errors.name }" placeholder="Nombre completo" class="compact-input" />
                        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
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
import { ref } from 'vue';
import { InputText } from 'primevue/inputtext';
import { Button } from 'primevue/button';

const formData = ref({
    name: '',
    price: '',
    stock: ''
});

const errors = ref({
    name: '',
    price: '',
    stock: ''
});

const isEdit = ref(false);
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

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
</style>

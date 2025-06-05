import axios from 'axios';

// Crear instancia de Axios con configuración base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
});

// Interceptor para solicitudes
api.interceptors.request.use(
    (config) => {
        // Obtener token del localStorage si existe
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para respuestas
api.interceptors.response.use(
    function (response) {
        if (response.config.responseType === 'blob') {
            return response; // Devolver la respuesta completa para blobs
        }
        // Si el backend ya responde con la estructura estándar, solo retorna response.data
        // Si algún endpoint no cumple, aquí puedes adaptarlo
        return response.data;
    },
    function (error) {
        // Si el backend responde, intenta adaptar la estructura al estándar
        let backendData = error.response && error.response.data;
        let errResponse = {
            success: false,
            message: backendData?.message || error.message || 'Error de red',
            data: null,
            status: error.response ? error.response.status : 0,
            details: backendData?.details || {
                exception: error.name,
                error_message: error.message,
                trace: backendData?.trace || []
            },
            validationErrors: backendData?.errors || []
        };

        // Mensajes amigables según código de estado
        if (error.response) {
            console.log(error.response);
            switch (error.response.status) {
                case 401:
                    errResponse.message = 'Credenciales incorrectas. Por favor, inténtelo nuevamente.';
                    break;
                case 403:
                    errResponse.message = 'Usuario deshabilitado o no registrado.';
                    break;
                case 404:
                    errResponse.message = 'Recurso no encontrado.';
                    break;
                case 422:
                    // Si errors es un objeto tipo { campo: [mensajes] }
                    let validationMsgs = [];
                    if (backendData?.errors && typeof backendData.errors === 'object' && !Array.isArray(backendData.errors)) {
                        validationMsgs = Object.entries(backendData.errors).flatMap(([field, messages]) => messages.map((msg) => `${field}: ${msg}`));
                        errResponse.validationErrors = validationMsgs;
                    } else if (Array.isArray(backendData?.errors)) {
                        validationMsgs = backendData.errors;
                        errResponse.validationErrors = validationMsgs;
                    } else if (Array.isArray(backendData?.details)) {
                        validationMsgs = backendData.details;
                        errResponse.validationErrors = validationMsgs;
                    }

                    console.log('errResponse', errResponse);
                    errResponse.message = 'Error de validación. Por favor, revise los campos.';
                    break;
                case 500:
                    errResponse.message = 'Error interno del servidor. Intente más tarde.';
                    break;
                default:
                    errResponse.message = `Error ${error.response.status}: ${error.response.statusText}`;
                    break;
            }
        } else if (error.code === 'ECONNABORTED') {
            // eslint-disable-next-line no-console
            console.error('error', error);
            errResponse.message = 'La solicitud ha tardado demasiado tiempo. Intente nuevamente.';
        } else {
            // eslint-disable-next-line no-console
            console.error('error', error);
            errResponse.message = 'Error de conexión. Verifique su red.';
        }

        return Promise.reject(errResponse);
    }
);

export default api;

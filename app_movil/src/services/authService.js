/**
 * Centraliza todas las operaciones relacionadas con la autenticacion
 * inicia sesion guarda token/usuario en almacenamiento local
 * cierra sesion elimina datos
 * restaura la sesion guardada
 * actualiza el perfil del usuario autenticado
*/

import apiClient from '../api/apiClient';
import { STORAGE_KEY } from '../utils/constants';
import { storageGetItem, storageMultiRemove, storageSetItem } from '../utils/storage';

const authService = {
    //envia credenciales al backend y persiste token + usuario si son validos
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password});
        const payload = response.data?.data || response.data;

        if (payload?.token){
            await storageSetItem(STORAGE_KEY.token, payload.token);
        }

        if (payload?.usuario){
            await storageSetItem(STORAGE_KEY.usuario, payload.usuario);
        }

        return response.data;

    },

    //Registra un nuevo usuario en el sistema
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    //cierra sesion eliminando del storage las claves persistidas
    logout: async () => {
        await storageMultiRemove([STORAGE_KEY.token, STORAGE_KEY.user]);
    },

    //lee el almacenamiento local la sesion previamente guardada
    getSession: async () => {
        const token = await storageGetItem(STORAGE_KEY.token);
        const userRaw = await storageGetItem(STORAGE_KEY.user);
        const user = userRaw ? JSON.parse(userRaw) : null;
        return { token, user };
    },

    //Actualiza el perfil del usuario autenticado
    updateProfile: async (data) => {
        const response = await apiClient.put('/auth/profile', data);
        const usuario = response.data?.data || response.data.usuario || null;
        if (usuario) {
            await storageSetItem(STORAGE_KEY.usuario, JSON.stringify(usuario));
        }
        return response.data;
    },

};

export default authService;


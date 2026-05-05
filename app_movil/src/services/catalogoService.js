/**
 * gestona las consultas publicas del catalogo
 * obtener categorias, subcategorias, productos con filtros
 * construir la url validas para imagenes del backend
 */

import apiClient from '../api/apiClient';

const catalogoService = {
    //consulta la lista de categorias disponibles para filtros de navegacion
    getCategorias: async () => {
        const response = await apiClient.get('/cataogo/categorias');
        const payload = response.data?.data || response.data || {};
        return payload.categorias || [];
    },

    //consulta productos del catalogo y acepta filtros de busqueda
    getProductos: async (params = {}) => {
        const response = await apiClient.get('/cataogo/productos', { params });
        const payload = response.data?.data || response.data || {};
        const productos = payload.productos || [];
        return productos; 
    },

    //Convierte una ruta relativa del backend en url completa usable para imagenes

    buildImageUrl: (path) => {
        if (!path) {
            return 'https://via.placeholder.com/300/200.png?text=Producto';
        }

        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        const origin = 'https://10.0.2.2:5000';
        return `${origin}/${path.replace(/^\//, '')}`;
    },
};

export default catalogoService;
/**
 * Este archivo gestion de produtos panel de administacion
 * lista de todos los productos del sistema con iamgen descripcion y stado
 * permite buscar en tiemp resl y nsvegs entre psginsd 10 por pagina
 * product-form con los datos de editar
 * al precionar el producto navega a sus caracteristicas y edicion
 * solo administradores isAdmin pueden actiivar desactivar y eliminar productos
 * el auxiliar solo puede ver y navegar
 */

// manejo de variables de estado local
import { useEffect, useState } from "react";
//Importar componentes 
//Dimensions optiene al ancho y alto de la pantalla para hacer diseos responsivos
//flatlist lista optimizada con virtualizacion para mostrar grandes cantidades de datos
//modal mostrar detalles de contenido en ventanas emergentes

import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, TextInput, View} from "react-native";

//Lee los parametros de la url para obtener el id del pedido
import { router } from "expo-router";//navegacion y parametros de ruta
import { ThemedText } from '@/components/themed-text';

import  apiClient  from '../../src/api/apiClient';
import { activarProducto, desactivarProducto, deleteProduct } from '../../src/services/adminService';
import { useAuth } from "../../src/context/AuthContext";
/**
 * tipo de producto
 * estrucura del producto recibido tal como viene del backend
 */

type Producto = {
    id?: string;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    stock?: number;
    imagen?: string;
    activo?: boolean;
};

type AuthUser = { rol?: string };

/**
 * helpers de navegacion
 * cats de router para navegar con strings simple sin parametros 
 */
const push = (path: string) => 
(router as unknown as { push: (p: string) => void }).push(path);

//cast de router para navegar con pathname + parms (para pasar el objeto a producto)
const pushParams = (pathname: string, params: Record<string, string>) => 
(router as unknown as { push : (p: {pathname: string; params: Record<string, string> }) => void }).push({ pathname, params });

export default function AdminProductosScreen() {
    /**
     * contexto de autennticacionn
     */
    const { user } = useAuth() as { user: AuthUser | null };
    /**
     * Estado local
     */
    const [productos, setProductos] = useState<Producto[]>([]);// prodtctos en la pagina actual
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [ busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    /**
     * Funcion fetchProductos
     * consulta get / admin/productos con filtro de busqueda y paginacion
     */

    const fetchProductos = async (page = 1, search = '') => {
        setLoading(true);
        setErrorMessage('');
        try {
            const params: string[] = [];
            if (search.trim()) params.push(`buscar=${encodeURIComponent(search.trim())}`);
            params.push(`pagina=${page}`);
            params.push(`limite=10`);
            const url = `/admin/productos?${params.join('&')}`;
            const res = await apiClient.get(url);
            const productosData: Producto[] = res.data?.data?.productos || [];
            setProductos(productosData);
            setPagina(page);
            setTotalPaginas(res.data?.data.pagiacion?.totalPaginas || 1);
        } catch (error: unknown) {
            setErrorMessage((error as { message?: string })?.message || 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos(1, '');
    }, []);

    // avanza y retrocede paginas
    const handlePagina = (next: number) => {
        const nuevaPagina = Math.max(1, Math.min(totalPaginas, pagina + next));
        fetchProductos(nuevaPagina, busqueda);
    };

    const isAdmin = user?.rol === 'administrador';
}
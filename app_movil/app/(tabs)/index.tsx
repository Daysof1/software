/**
 * Pantalla de cuenta pestaña 1
 * Pantalla pincipal Tienda muestra catalogo de productos
 * con un banner hero tarjetas de caracteristicas buscador de texto
 * chips de categrias lista de productos a dos columnas paginacion y un modal de detalle de producto
 */

/** importar componentes de React native para construir la pantalla
 * hooks de react:
 * useEffect ejecuta el codigo al montar el componente o cuando cambia las dependencias
 * useMemo: memoriza valores calclados para evitar recalculos innecesarios
 * useState maneja variables de estado local
 */


// manejo de variables de estado local
import { useState, useEffect, useMemo } from "react";
//Importar componentes 
//Dimensions optiene al ancho y alto de la pantalla para hacer diseos responsivos
//flatlist lista optimizada con virtualizacion para mostrar grandes cantidades de datos
//modal mostrar detalles de contenido en ventanas emergentes

import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, Image, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";

//Ionicons liberia de iconos cevtoriales para react native 
import { Ionicons } from "@expo/vector-icons";
//catalogoService servicio que hace las llamadas a http (API) del backend para productos y categorias
import catalogoService  from "../../src/services/catalogoService"
//themedText : texto que aplica colores del tema del dispositivo de manera automatica claro u oscuro
import { ThemedText } from '@/components/themed-text';
//themedView : color de fondo automatico segun el tema del dispositivo
import { ThemedView } from '@/components/themed-View';
//useCarrito hook del contexto del carrito para agregar productos
import { useCarrito } from '../../src/context/CarritoContext';

/**
 * Tipos de Carriro CTX
 * describe los campos que se usan de useCarrito cen pantallla
 */

type CarritoCtx = {
    //agregarProducto: agrega producto al carrito con la cantidad indicada
    agregarProducto: (producto: unknown, cantidad: number) => Promise<void>; 
    //totalItems numero total de items en el carrito
    totalItems: number;
};

/**
 * Constantes globales
 * se calculan una sola vez al cargar el modulo
 */

// SREEN_WIDTH ancho de dispositico en dp (density indpendent pixeles) para diseños responsivos
const { width: SCREEN_WIDTH } = Dimensions.get('window');
//Card_gap espaci horizontal entre las dos columnas de la tarjeta de producto
const CARD_GAP = 10;
//CARD_WIDTH ancho de cada tarjeta calculando para que quepan exactamente 2 por fila en dos columnas
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) /2;
//ITEMS_POR_PAGINA numro de productos por agin a usando paginacion 
const ITEMS_POR_PAGINA = 15;

const FEATURES = [
  { icon: 'cube-outline', title: 'Envío Rápido', desc: 'Recibe en tu hogar', color: '#6366f1', bg: '#eef2ff' },
  { icon: 'shield-checkmark', title: 'Compra Segura', desc: 'Datos protegidos', color: '#10b981', bg: '#d1fae5' },
  { icon: 'headset', title: 'Atención 24/7', desc: 'Siempre disponibles', color: '#06b6d4', bg: '#cffafe' },
] as const;

/**
 * Componente principal HOME SCREEN 
 */

export default function HomeScreen() {
    //Extrae las funciones del carrito necesarias para la pantalla
    const { agregarProducto, totalItems, } = useCarrito() as CarritoCtx;

    /**
     * Estado de datos
     * productos lista completa de productos traida de backend
     */
    const [productos, SetProductos] = useState<any[]>([]);
    //categorias lista de categorias raidas del backend
    const [categorias, SetCategorias] = useState<any[]>([]);

    //Esatdo de IU
    //loading true mientras cargan los datos por primera vez .
    const [loading, SetLoading] = useState(true);
    //refreshing true mientras el usuario hace pull to efresh
    const [refreshing, SetRefreshing] = useState(false);
    //Error mensahe mensaje de errir si falla la carga 
    const [errorMessage, SetErrorMessage] = useState('');
    //busqyeda texto de campos de busqueda filtra poductos en tiempo real
    const [busqueda, SetBusqueda] = useState('');
    //categoriasActiva id de la categoria seleccionada o all para ver todas
    const [categoriasActivas, SetCategoriasActivas] = useState<any>('all');
    //productoDetalle product seleccionado para ver el modal 
    const [productoDetalle, SetProductoDetalle] = useState<any>(null);
    //paginaActal numero de la pagina activa para paginacion
    const [paginaActual, SetPaginaActual] = useState(1);
    //ITEMS_POR_PAGINA numero de productos por pagina
    const ITEMS_POR_PAGINA = 15;
}
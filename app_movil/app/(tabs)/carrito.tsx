/**
 * Pantalla del carrio de compras y sus respectivas gestiones no requiere que este autenticado solo para hacer compras
 */

/** importar componentes de React native para construir la pantalla
 * ActivityIndicator, spiner de carga circular
 * Alert, dialogos emergentes nativos del sistema
 * Image, muestra las imagenes
 * Pressable, area tactil
 * ScrollView, contenedor com scroll vertical
 * StyleSheet, crea los estilos de forma optimizada
 * Text, muestra texto plano en pantalla
 * View, Contenedor generico equivale a un div en html y css
 * 
 */

import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
//Ionicons liberia de iconos cevtoriales para react native 
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useCarrito } from "../../src/context/CarritoContext"

//carritoctx define la forma de los datos que devuelve useCarrito
//TypeScript necesita esto porque CarritoContext.js esta en javaScript 
type carritoCtx = {
    //items lista de productos en el carrito
    items: { id: string, nombre?: string, precio?: number, cantidad: number, imagen?: string }[];
    // total suma total en pesos colombianos de todos los items 
    total: number;
    //Total items numero total de items del carrito
    totalItems: number;
    //loading true mientras el contexto carga los datos iniciales
    loading: boolean;
    //cambiar cantidad actualiza la cantidad de un producto 
    cambiarCantidad: (id: string, cantidad: number) => Promise<void>;
    //eliminar item elimina un producto del carrito
    eliminarItem: (id: string) => Promise<void>;
    //vaciar carrito elimina todos los productos del carrito
    vaciarCarrito: () => Promise<void>;
};

// HELPERS de navegacion 
//expo router tipifica router de forma extricta y expone .push/replace 
//Directamente en typescript, se usa as unknown as .... para fprzar el tipo
//y poder llmar a las funciones de navegacion sin  errores de compilacion 

//routerPush navega a una nueva pantalla apilandola es decir se puede volver atras
const routerPush = (path: string) => (router as unknown as { push: (p: string) => void }).push(path);
//routerReplace navega a una pantallla remplazando la actual recuerda que se puede volver atras
const routerReplace = (path: string) => (router as unknown as { replace: (p: string) => void }).replace(path);

//fmt: formatea un numero como pecio en pesos colombianos ejemplo fmt (15000) -> $15.000
const fmt = (n: number) => `$${Number(n).toLocaleString('es-CO')}`;

// componente principal carito Screen 
export default function CarritoScreen() {
    //Obtiene el contexto de auth solo si el usuario esa autenticado
    const { isAuthenticated } = useAuth() as { isAuthenticated: boolean };

    //Ontiene del contexto del carrito los datos y funciones necesarias 
    //se usa aas CarritoCtx porque el cotexto de js y typescript no infiere en tipos
    const { items, total, loading, cambiarCantidad, eliminarItem, vaciarCarrito } = useCarrito() as carritoCtx;

    // Pantalla de carga 
    // si el carrito aun esta cargando por ejemplo reupera los datos guardados 
    //se muestra un spiner centardo en lugar del conntenido normal

    if (loading) {
        return (
            <view style={styles.centered}>
                {/* spiner circilar de color indigo*/}
                <ActivityIndicator size="large" color="#6366f1"/>
                <text style={styles.loadingText}>Cargando carrito...</text>
            </view>
        );
    }

    //Funcion handleIrACheckout o sea pagar
    // si el usuario no esta autenticado muestra el dialogo de inicio de sesion
    // si esta autenticado navega directamente a la pantalla de pagos 
    const hadleIrACheckout = () => {
        if (!isAuthenticated) {
            Alert.alert(
                'Inicia sesion',
                'Debest iniciar sesion para proceder al pago',
                [
                    //boto n cancelar cierra dalogo sin hacer nada
                    { text: 'Cancelar', style:'cancel' },
                    //boton iniciar sesion lleva a pestaña cuenta explore.tsx
                    { text: 'Iniciar Sesion', onPress: () => routerReplace('/tabs/explore') },
                ]
            );
            return; //sale de la funcion 
        }
        // usuario autenticado navega a la pantalla de pagos
        routerPush('/checkout');
    };
}
/**
 * Este archivo y pantalla de detalle de un pedido especifico para el administrador 
 * recibe el parametro dinamico id desde la url 
 * consulta el backend ara traer los datos del pedido
 * muestra los datos de cliente estado actual total fecha y lista productos
 * permite cambiar el estado del pedido pensiente - enciado -> entregado -> cancelado si esta en pendiente
 */

// manejo de variables de estado local
import { useState, useEffect } from "react";
//Importar componentes 
//Dimensions optiene al ancho y alto de la pantalla para hacer diseos responsivos
//flatlist lista optimizada con virtualizacion para mostrar grandes cantidades de datos
//modal mostrar detalles de contenido en ventanas emergentes

import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

//Lee los parametros de la url para obtener el id del pedido
import { useLocalSearchParams } from "expo-router";
//themedText : texto que aplica colores del tema del dispositivo de manera automatica claro u oscuro
import { ThemedText } from '@/components/themed-text';
//ciente http axios con JWT
import apiClient from '../../../src/api/apiClient';

/**
 * TIPOS
 * representa un item de la lista de productos del pedido
 * todos los campos son opcionales ? porque el backend puede evitarlos todos 
 */
type Detalle = {
    producto?: { nombre?: string };//solo del los productos comprados
    cantidad?: number;
    precio?: number;//precio unitario del producto
};

// representa el pedido completo tal como lo devuelve el backend
type Pedido = {
    id: string;
    estado?: string;
    total?: number;
    createdAt?: string;
    usuario?: {
        nombre?: string;
        apellido?: string;
        email?: string;
    };
    detalles?: Detalle[];//arreglo de productos incluidos en el pedido
};

/**
 * Componnete principal
 * 
 */
export default function AdminPedidoDetalleScreen() {
    /**
     * parametro de ruta
     * useLocalSearchParams lee los segmentos dinamicos de la url
     * como el archivo se llama [id].tsx el parametro se llama id es decir si un pedido se llama 38 el id e 38
     */

    const { id } =  useLocalSearchParams<{ id: string }>();

    //estado local 
    const [pedido, setPedido] = useState<Pedido | null>(null);// Datos del pedido. null = aun no cargados
    const [loading, setLoading] = useState(true);//activo mientras se hace la peticion api
    const [errorMessage, setErrorMessage] = useState(''); //Mensaje de error si falla la carga
    const [cambiando, setCambiando] = useState(false); //true miestra se esta cambiando el estado evita doble click

    /**
     * funcion fetchPedido
     * llama el endpoint get/admin/pedidos/:id y guarda el resultado en estado
     * se usa tanto en el montaje inicial useEffect como despues de cambiar estado
     */

    const fetchPedido = async () => {
        setLoading(true); //muestra el spinner 
        setErrorMessage('');
        try {
            //peticion get autenticada el token JWT lo agrega el apiClient automaticamente
            const res = await apiClient.get(`/admin/pedidos/${id}`);
            // la respuesta tiene estructura { data : data: { pedido...}}
            //el operador ? evita errores si algun nivel es undefined 
            setPedido(res.data?.data?.pedido || null);
        }   catch (error: unknown) {
            //si la peticion falla guarda el mensaje de error para mostrarlo en pantalla
            setErrorMessage((error as { message?: string })?.message || 'no se pudo cargar el pedido');
        } finally {
            setLoading(false);//oculta el spinner siempre que haya un error o no
        }
    };

    /**
     * efecto de carga inicial
     * se ejecuta cad vez que cambie el parametro id de la url 
     * en la practica solo se ejecuta el montar porque no se navega entre id diferentes 
     */

    useEffect(() => {
        fetchPedido();
        /**
         * eslint-disable-next-line react-hooks/exhaustive-deps
         * fetchPedido no se incluye en el array de dependencias para evitar bucles infinitos
         * el lint warning se suprime con el comentario de arribe 
         */
    }, [id]);

    /**
     * funcion cambiar estado
     * envia un PATCH al backend para actualizar el estado del pedido
     * parametro: nuevoEstado el estado alq ue se requiere transicionar
     * enviado, enregado o cancelado
     */
    const cambiarEstaado = async (nuevoEstado: string) => {
        setCambiando(true); //bloquea los botones para evitar cicks multiples
        try {
            //PATCH /admin/pedidos/:id/estado con el nuevo estado en el body
            await apiClient.patch(`/admin/pedidos/${id}/estado`, { estado: nuevoEstado});
        } catch {
            //si falla muestra un alert nativo con el mensaje de error 
            Alert.alert('Error', 'No se pudo cambiar el estado');
        } finally {
            setCambiando(false); //desbloquea los botones
        }
    };
}
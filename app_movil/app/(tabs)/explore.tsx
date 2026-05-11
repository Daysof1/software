/**
 * Pantalla de cuenta pestaña 3 tiene 2 metodos
 * no autenticados muestra formulario logi y registro
 * autenticados muestra perfil de usuario con opciones de editar datos 
 * accede al panel admin/aux ver pedidos 
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
// manejo de variables de estado local
import { useState } from "react";
//Importar componentes 
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { router } from "expo-router";
//Ionicons liberia de iconos cevtoriales para react native 
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
//themedText : texto que aplica colores del tema del dispositivo de manera automatica claro u oscuro
import { ThemedText } from '@/components/themed-text';
//themedView : color de fondo automatico segun el tema del dispositivo
import { ThemedView } from '@/components/themed-View';

/**
 * AuthCtx define la forma del objeto devuelto pot useAuth es necesario
 * porque AuthContext.js esta en javaScript no typescript y el compilador no ls reconoce
 */
type AuthCtx = {
    //Usser datos el usuario autenticado, null si no inicio ssin
    user: { nombre?: string, email?: string, rol?: string  } | null;
    //isAuthenticated: true si hay sesion activa
    isAuthenticated: boolean;
    // isLoading: true iesra se verifica si hay sesion guardada al abrir la app
    isLoading: boolean;
    //Login: funcion qe recibe el email y contraseña lanza error si falla
    login: (email: string, pssword: string) => Promise<unknown>;
    //register funcion que registra un nuvo usuario lanza error si falla 
    register: (data: {nombre: string, apellido: string, email: string, password: string, telefono?: string, direccion?: string }) => Promise<unknown>; 
    //logout: funcion de cerrar la sesion del usuario 
    logout: () => Promise<void>;
    //updatePerfil: funcion que actualiza os datos del usuario 
    updatePerfil: (data: { nombre?: string, email?: string, password?: string }) => Promise<unknown>;
};

//routerPush navega apilando la nueva pantalla permite volver atras con la opcion de atras 
//se usa as unknown as para evitar errores de typescript con contextos router

const rouerPush = (path: string) => (router as unknown as { push: (p: string) => void }).push(path);

// componente principal del tab de cuenta 

export default function TabTwoScreen() {
    const { user, isAuthenticated, logout, login, register, isLoading, updatePerfil } = useAuth() as AuthCtx;
    // estado del formulario login y registro 
    //isRegisterMode true muestra formulario de registro false muestra login
    const [isRegisterMode, setIsRegisterMode ] = useState(false);
    //Campos del formulario de registro y login
    const [ nombre, setNombre ] = useState('');
    const [ apellido, setApellido ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ telefono, setTelefono ] = useState('');
    const [ direccion, setDireccion ] = useState('');
    // loadingSubmit true mientras se procesa el login o register evita el doble envio
    const [ loadingSubmit, setLoadingSubmit ] = useState(false);
    //mensajes de retroalimentacion al usuario ( error o exito )
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    //Estado de edicion de perfil
    //editeMode true muestra campos editables false modo lectura

    const [editeMode, setEditMode] = useState(false);
    //campos editables del perfil
    const [editNombre, setEditNombre] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    //savingPerfil true mientras se guarda el perfil en backend
    const [savingPerfil, setSavingPerfil] = useState(false);
    //Mensaje de error o exito
    const [perfilError, setPerfilError] = useState('');
    const [perfilSuccess, setPerfilSuccess] = useState('');

    //Funcion resetFeedBack
    //Limpia los mensajes de error y exito del formulario login y registro
    const resetFeedBack = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    //Funcion: handleLogout
    //cierra la sesion y resetea todos los campos del formulario para que
    //la pantalla quede limpia cuando el usuario vuelva a ver formulario
    const handleLogout = async () => {
        await logout(); //llama el contexto de cerrar sesion 
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNombre('');
        setApellido('');
        setTelefono('');
        setDireccion('');
        setIsRegisterMode(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    //Funcion handleSubmit
    //valida y envia el formulario de login o registro segun el modo actvo
    const handleSubmit = async () => {
        resetFeedBack(); //limpia mensajes anterores de valida

        if(isRegisterMode) {
            //Validaciones de registro 
            //todos los campos marcados con * son obligatorias
            if (!nombre || !apellido || !email || !password || !confirmPassword) {
                setErrorMessage('Completa todos los campos obigatorios *. ');
                return;
            }

            //las contraseñas deben coincidir
            if (password !== confirmPassword){
                setErrorMessage('Las contraseñas no coinciden');
                return;
            }

            //las contraseñas deben tener minio 6 caracteres
            if (password.length < 6){
                setErrorMessage('La contraseña deben tener al menos 6 caracteres');
                return;
            }

            //Telefono si se propirciona debe ser colombiano (10 digitos y debe empezar por 3)
            if (telefono && !/^3\d{9}$/.test(telefono)) {
                setErrorMessage('El teléfono debe ser un número colombiano válido (10 dígitos que empiezan por 3)');
                return;
            }
        } else {
            //validacion de login
            if (!email || !password) {
                setErrorMessage('Ingresa tu correo y contraseña');
                return;
            }
        }

        //activa el spiner  bloquea el boton para evitar multiples envios
        setLoadingSubmit(true);
        try {
            if (isRegisterMode) {
                //llama a resgister() del contexto con os datos del formulario 
                //el operador spread condicional ... solo incluye telefono/direcion si no estan vacios
                await register({ nombre, apellido, email, password,
                    ...(telefono ? { telefono } : {}),
                    ...(direccion ? { direccion } : {}),
                });
                setSuccessMessage('Registro exitoso! Ahora inicia sesion');
                setIsRegisterMode(false); //Vuelve al logi tras el regisstro exitoso
                // limpia los campos que no se comparten en el formulario login 
                setPassword('');
                setConfirmPassword('');
                setEditNombre('');
                setApellido('');
                setTelefono('');
                setDireccion('');
            } else {
                //llama al login del contexto con el email y contraseña
                await login (email, password);
                setSuccessMessage('sesion iniciada crrectamente');
            }
        } catch (error: unknown) {
            //si el backend devuelve error muestra su mensaje. sino muestra uno generico
            setErrorMessage((error as { message?: string })?. message || 'No fue posibe completar la accion'); 
        } finally {
            //siempre desactiva el spiner al terminar exito y error
            setLoadingSubmit(false);
        }
    };

    /**
     * Funciom handleGuardarPerfil
     * valida y envia ls cambios al perfi del usuario autenticado
     */

    const handleGuardarPerfil = async () => {
        setPerfilError('');
        setPerfilSuccess('');
        //al menos no de los tres campos debe estar modificado
        if (!editNombre.trim() && !editEmail.trim() && !editPassword.trim()) {
            setPerfilError('Modifica al menos un campo');
            return;
        }
        
    }
}
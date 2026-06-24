
import { useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

import { useAuthStore } from '../store/useAuthStore';
import { useApiKeyStore } from '../store/useApiKeyStore';

// Opciones opcionales para el hook
interface UseApiKeyOptions {
    autoFetch?: boolean; 
    autoCreateMissing?: boolean;
}

export const useApiKeyActions = ({ 
    autoFetch = false, 
    autoCreateMissing = false 
}: UseApiKeyOptions = {}) => {
    // 1. ACCESO A LOS STORES
    const { 
        apiKeys, 
        isLoading, 
        error, 
        getApiKeysByUser, 
        createApiKey, 
        renewApiKey 
    } = useApiKeyStore();
    
    const user = useAuthStore((state) => state.user);

    const devApiKey = useMemo(() => 
        apiKeys.find(k => k.type === 'development'), 
    [apiKeys]);

    const prodApiKey = useMemo(() => 
        apiKeys.find(k => k.type === 'production'), 
    [apiKeys]);

    useEffect(() => {
        if (autoFetch && user?.id) {
            getApiKeysByUser(user.id);
        }
    }, [user?.id, autoFetch]); // Solo depende del ID del usuario

    // A) Refrescar datos manualmente
    const refreshKeys = async () => {
        if (user?.id) await getApiKeysByUser(user.id);
    };

    // B) Crear Key (con Feedback)
    const handleCreateKey = async (type: 'development' | 'production') => {
        if (!user) return;

        // Feedback de carga
        Swal.fire({
            title: `Creando llave ${type}...`,
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false
        });

        const result = await createApiKey(user.id, type);

        if (result) {
            Swal.fire({
                icon: 'success',
                title: '¡Creada!',
                text: `Tu llave de ${type} está lista.`,
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire('Error', 'No se pudo crear la llave.', 'error');
        }
    };

    // EFECTO PARA CREAR KEYS FALTANTES
    useEffect(() => {
        const createMissingKeys = async () => {
            // Solo crear si:
            // 1. No está cargando
            // 2. No hay error
            // 3. El autoCreateMissing está activado
            // 4. Tenemos un usuario
            if (!autoCreateMissing || isLoading || error || !user?.id) return;
            
            // Verificar si ya terminamos de cargar las keys
            // (isLoading es false pero aún no tenemos datos procesados)
            if (apiKeys.length === 0) {
                // Podría significar que aún no se han cargado o que realmente no hay keys
                return;
            }
            
            // Crear dev key si falta
            if (!devApiKey) {
                await handleCreateKey('development');
            }
            
            // Crear prod key si falta
            if (!prodApiKey) {
                await handleCreateKey('production');
            }
        };
        
        createMissingKeys();
    }, [isLoading, devApiKey, prodApiKey, error, user?.id, autoCreateMissing, apiKeys]);

    // C) Renovar Key 
    // const handleRenewKey = async (currentKey: string) => {
    //     if (!user) return;

    //     // Confirmación de seguridad
    //     const confirm = await Swal.fire({
    //         title: '¿Regenerar llave?',
    //         text: "La llave actual dejará de funcionar inmediatamente. ¿Estás seguro?",
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#d33',
    //         cancelButtonColor: '#3085d6',
    //         confirmButtonText: 'Sí, regenerar',
    //         cancelButtonText: 'Cancelar'
    //     });

    //     if (!confirm.isConfirmed) return;

    //     Swal.fire({
    //         title: 'Regenerando...',
    //         didOpen: () => Swal.showLoading(),
    //         allowOutsideClick: false
    //     });

    //     const result = await renewApiKey(currentKey, user.id);

    //     if (result) {
    //         Swal.fire('¡Renovada!', 'La API Key ha sido actualizada.', 'success');
    //     } else {
    //         Swal.fire('Error', 'Hubo un problema técnico al renovar.', 'error');
    //     }
    // };
    const handleRenewKey = async (currentKey: string) => {
        if (!user) return;

        // Si no hay key válida, crear una nueva en lugar de regenerar
        if (!currentKey || currentKey.trim() === '') {
            // Determinar el tipo basado en qué key falta
            const typeToCreate = !devApiKey ? 'development' : 'production';
            
            const confirm = await Swal.fire({
                title: '¿Crear llave?',
                text: `No se encontró una llave de ${typeToCreate} válida. ¿Quieres crear una nueva?`,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Sí, crear',
                cancelButtonText: 'Cancelar'
            });

            if (confirm.isConfirmed) {
                await handleCreateKey(typeToCreate);
            }
            return;
        }

        // Confirmación de seguridad para regenerar
        const confirm = await Swal.fire({
            title: '¿Regenerar llave?',
            text: "La llave actual dejará de funcionar inmediatamente. ¿Estás seguro?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, regenerar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: 'Regenerando...',
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false
        });

        const result = await renewApiKey(currentKey, user.id);

        if (result) {
            Swal.fire('¡Renovada!', 'La API Key ha sido actualizada.', 'success');
        } else {
            Swal.fire('Error', 'Hubo un problema técnico al renovar.', 'error');
        }
    };

    // D) Copiar al portapapeles (Utilidad)
    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        
        // Toast pequeño estilo notificación
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: 'Copiado al portapapeles'
        });
    };

    // 5. RETORNO DE LA FACHADA
    return {
        // Estado
        apiKeys,         // Array crudo (por si acaso)
        devApiKey,       // Objeto específico Dev (o undefined)
        prodApiKey,      // Objeto específico Prod (o undefined)
        isLoading,
        error,
        
        // Acciones
        refreshKeys,
        createKey: handleCreateKey,
        renewKey: handleRenewKey,
        copyKey: handleCopy
    };
};
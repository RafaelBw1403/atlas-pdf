// src/hooks/useAuthActions.ts
import Swal from 'sweetalert2';
import { useAuthStore } from '../store/useAuthStore';
import { GraphQLService } from '../graphql/graphql.service';
// import { RESEND_VERIFICATION_EMAIL } from '../graphql/operations/graphql.auth.operations';


export const useAuthActions = () => {
    const store = useAuthStore();

    const handleLogin = async (credentials: { email: string; password: string }, altchaPayload: string) => {
        const result = await store.login(credentials, altchaPayload);

        if (result.success) {
            await Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: `Hola, ${result.message}`,
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            const errorMessages: Record<string, string> = {
                'INVALID_CREDENTIALS': 'Email o contraseña incorrectos.',
                // 'ACCOUNT_EXPIRED': 'Tu cuenta ha expirado.',
            };
            Swal.fire('Error', errorMessages[result.code!] || result.message, 'error');
        }
        return result.success;
    };

    // const handleUnverifiedUser = async (email?: string) => {
    //     const result = await Swal.fire({
    //         title: 'Usuario no verificado',
    //         text: 'Tu cuenta aún no ha sido activada. Revisa tu bandeja de entrada o solicita un nuevo enlace.',
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonText: 'Reenviar correo',
    //         cancelButtonText: 'Ok',
    //         showLoaderOnConfirm: true,
    //         preConfirm: async () => {
    //             try {
    //                 if (!email) throw new Error("No se encontró el correo del usuario");
                    
    //                 await GraphQLService.mutate(RESEND_VERIFICATION_EMAIL, { email });
    //                 return true;
    //             } catch (error: any) {
    //                 Swal.showValidationMessage(`Error: ${error.message}`);
    //             }
    //         },
    //         allowOutsideClick: () => !Swal.isLoading()
    //     });

    //     if (result.isConfirmed) {
    //         Swal.fire({
    //             title: '¡Enviado!',
    //             text: 'Se envió un correo electrónico de verificación; si no lo encuentra en la bandeja de entrada, por favor búsquelo en la carpeta de spam.',
    //             icon: 'success',
    //             confirmButtonText: 'Entendido'
    //         });
    //     }
    // };

    const handleRegister = async (data: any, altchaPayload: string) => {
        const result = await store.register(data, altchaPayload);
        if (result.success) {
            Swal.fire({
                title: '¡Éxito!',
                text: 'Usuario registrado correctamente.',
                icon: 'success',
                confirmButtonText: 'Entendido'
            });
        } else {
            const title = result.code === 'USER_EXISTS' ? '¡Ya estás registrado!' : 'Error';
            Swal.fire(title, result.message, result.code === 'USER_EXISTS' ? 'warning' : 'error');
        }
        return result.success;
    };

    const handleToggleStatus = async (id: string, currentActive: boolean) => {
        const actionText = currentActive ? 'desactivar' : 'activar';
        
        const confirm = await Swal.fire({
            title: `¿Estás seguro de ${actionText} al usuario?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            const result = await store.toggleStatus(id, currentActive);
            
            if (result.success) {
                Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
            }
        }
    };

    const handleToggleAdmin = async (id: string, currentIsAdmin: boolean) => {
        const actionText = currentIsAdmin ? 'quitar permisos de administrador' : 'hacer administrador';

        const confirm = await Swal.fire({
            title: `¿Estás seguro de ${actionText}?`,
            text: currentIsAdmin
                ? 'El usuario perderá acceso a la administración.'
                : 'El usuario obtendrá acceso completo a la administración.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            const result = await store.toggleAdmin(id, !currentIsAdmin);

            if (result.success) {
                Swal.fire({ icon: 'success', title: 'Rol actualizado', timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire('Error', result.message || 'No se pudo actualizar el rol de administrador', 'error');
            }
        }
    };

    const handleResetPassword = async (id: string) => {
        const confirm = await Swal.fire({
            title: '¿Estás seguro de resetear la contraseña?',
            text: "Se restablecerá a la configuración por defecto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, resetear'
        });

        if (confirm.isConfirmed) {
            Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            const result = await store.resetPassword(id);
            
            if (result.success) {
                Swal.fire('¡Éxito!', 'Contraseña restablecida correctamente', 'success');
            } else {
                Swal.fire('Error', 'No se pudo realizar el reset', 'error');
            }
        }
    };

    return {
        handleLogin,
        // handleUnverifiedUser,
        handleRegister,
        handleToggleStatus,
        handleToggleAdmin,
        handleResetPassword,
        logout: store.logout,
        toggleStatus: store.toggleStatus
    };
};
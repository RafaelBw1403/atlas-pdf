// src/auth/useAuthStore.ts
import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DELETE_USER, GET_ALL_USERS, LOGIN_USER, REFRESH_TOKEN, REGISTER_USER, RESET_USER_PASSWORD, TOGGLE_USER_ADMIN, TOGGLE_USER_STATUS } from '../graphql/operations/graphql.auth.operations';
import { GraphQLService } from '../graphql/graphql.service';
import { useReportStore } from './useReportStore';
import { useApiKeyStore } from './useApiKeyStore';


interface IUser {
    id: string;
    name: string;
    email: string;
    active?: boolean;
    // is_verified?: boolean;
    isAdmin?: boolean;
}

interface IUserAdmin extends IUser {
    active: boolean;
    isAdmin: boolean;
    created_at: string;
}

// Standardized response for components
export type AuthResult = {
    success: boolean;
    message?: string | undefined;
    code?: string | undefined;
};

interface AuthState {
    token: string | null;
    isAuth: boolean;
    user: IUser | null;
    users: IUserAdmin[];
    loading: boolean;

    canAdminister: () => boolean;
    
    register: (user: { name: string; email: string; password: string }, altchaPayload: string) => Promise<AuthResult>;
    login: (user: { email: string; password: string }, altchaPayload: string) => Promise<AuthResult>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    getAllUsers: () => Promise<void>;
    toggleStatus: (id: string, active: boolean) => Promise<AuthResult>;
    toggleAdmin: (id: string, isAdmin: boolean) => Promise<AuthResult>;
    resetPassword: (id: string) => Promise<AuthResult>;
    deleteAccount: () => Promise<AuthResult>;
}

const authStore: StateCreator<AuthState, [["zustand/immer", never]]> = (set, get) => ({
    token: localStorage.getItem('token'),
    isAuth: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    users: [],
    loading: false,

    canAdminister: () => {
        const { user } = get();
        return !!user?.isAdmin;
    },

    register: async (user, altchaPayload) => {
        try {
            const result = await GraphQLService.mutate(REGISTER_USER, 
                { input: user },
                { headers: { 'x-altcha-payload': altchaPayload || '' } } 
            );
            if (result?.error || !result.data?.register) {
                const error = result.error?.errors?.[0];
                return { 
                    success: false, 
                    message: error?.message || 'Error en el registro',
                    code: error?.message === 'User already exists' ? 'USER_EXISTS' : 'UNKNOWN'
                };
            }
            return { success: true, message: user.name };
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    },

    login: async (userVar, altchaPayload) => {
        try {
            const response = await GraphQLService.mutate(LOGIN_USER, 
                { input: userVar },
                { headers: { 'x-altcha-payload': altchaPayload || '' } } 
            );
            const error = response.error?.errors?.[0];

            if (response?.errors || !response.data?.login) {
                return { 
                    success: false, 
                    code: error?.code || 'AUTH_ERROR', 
                    message: error?.message || 'Error al iniciar sesión' 
                };
            }

            const { token, refreshToken, user } = response.data.login;
            
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAuth', 'true');
            
            set({ token, isAuth: true, user });
            
            return { 
                success: true, 
                message: user.name, 
                // code: !user.is_verified ? 'NOT_VERIFIED' : undefined 
            };
        } catch (error) {
            return { success: false, message: 'Error inesperado' };
        }
    },

    logout: async () => {
        localStorage.clear();
        set({ token: null, isAuth: false, user: null, users: [] });

        useReportStore.setState({
            document: { id: '', documentGroupId: '', stage: 'draft', name: 'Nuevo Documento', html: '<h1>Nuevo Reporte</h1>', css: '', sampleData: {}, htmlHeader: '', cssHeader: '', htmlFooter: '', cssFooter: '', printConfig: { layout: { orientation: false, format: 'A4', width: 210, height: 297, unit: 'mm' }, margin: { top: 10, right: 10, bottom: 10, left: 10 }, options: { scale: 1, printBackground: true, pageNumbers: true }, headerHeight: 0, footerHeight: 0 }, createdAt: new Date(), updatedAt: new Date() },
            documents: [],
            folders: [],
            currentFolderId: null,
            viewMode: 'grid',
            searchQuery: '',
            sortBy: 'date',
            selectedDocuments: [],
            isOpenMoveModal: false,
            selectedMoveDocuments: [],
            isOpenCreateFolderModal: false,
        });

        useApiKeyStore.setState({ apiKeys: [], isLoading: false, error: null });

        const { apolloClient } = await import('../graphql/apollo-client');
        await apolloClient.resetStore();
    },

    refreshToken: async () => {
        try {
            const rt = localStorage.getItem('refreshToken');
            if (!rt) return false;

            const response = await GraphQLService.mutate(REFRESH_TOKEN, { input: { refreshToken: rt } });
            if (response?.error || !response.data?.refreshToken) return false;
            
            const { token, refreshToken } = response.data.refreshToken;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            set({ token, isAuth: true });
            return true;
        } catch {
            return false;
        }
    },

    getAllUsers: async () => {
        set({ loading: true });
        try {
            const result = await GraphQLService.query(GET_ALL_USERS);
            if (result.data?.users) set({ users: result.data.users });
        } finally {
            set({ loading: false });
        }
    },

    toggleStatus: async (id, active) => {
        try {
            const result = await GraphQLService.mutate(TOGGLE_USER_STATUS, { id, active: !active });
            if (result.data?.toggleUserStatus) {
                set((state) => {
                    const user = state.users.find(u => u.id === id);
                    if (user) user.active = result.data.toggleUserStatus.active;
                });
                return { success: true };
            }
            return { success: false };
        } catch {
            return { success: false };
        }
    },

    resetPassword: async (id) => {
        try {
            const result = await GraphQLService.mutate(RESET_USER_PASSWORD, { id });
            return { success: !!result.data?.resetUserPassword };
        } catch {
            return { success: false };
        }
    },

    toggleAdmin: async (id, isAdmin) => {
        try {
            const result = await GraphQLService.mutate(TOGGLE_USER_ADMIN, { id, isAdmin });
            if (result.data?.toggleUserAdmin) {
                set((state) => {
                    const user = state.users.find(u => u.id === id);
                    if (user) user.isAdmin = result.data.toggleUserAdmin.isAdmin;
                });
                return { success: true };
            }
            return { success: false };
        } catch (error: any) {
            const message = error?.graphQLErrors?.[0]?.message || 'Error al actualizar el rol de administrador';
            return { success: false, message };
        }
    },

    deleteAccount: async () => {
        try {
            const response = await GraphQLService.mutate(DELETE_USER);
            if (response?.errors || !response.data?.deleteUser) {
                const error = response?.errors?.[0];
                return {
                    success: false,
                    message: error?.message || 'Error al eliminar la cuenta'
                };
            }
            return { success: true, message: 'Cuenta eliminada permanentemente' };
        } catch {
            return { success: false, message: 'Error de conexión al eliminar la cuenta' };
        }
    }
});

export const useAuthStore = create<AuthState>()(
    devtools(immer(authStore), { name: 'Auth Store' })
);
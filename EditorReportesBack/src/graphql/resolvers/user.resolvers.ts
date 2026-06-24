import { requireAltcha } from "../../guards/altcha.guard";
import { requireAuth } from "../../guards/auth.guard";
import { requireAdmin } from "../../guards/admin.guard";
import { UserService } from "../../services/use.service";


export const userResolvers = {
    User: {
        createdAt: (parent: any) => parent.created_at,
        updatedAt: (parent: any) => parent.updated_at,
        // daysUntilDeletion: (parent: any) => {
        //     if (parent.is_verified) return null; // Si ya está verificado, no hay cuenta regresiva

        //     const DAYS_TO_DELETE = 7; // Mismo valor que usaremos en el Cron Job
        //     const creationDate = new Date(parent.created_at);
        //     const expirationDate = new Date(creationDate);
        //     expirationDate.setDate(creationDate.getDate() + DAYS_TO_DELETE);
            
        //     const now = new Date();
        //     const diffTime = expirationDate.getTime() - now.getTime();
        //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        //     return diffDays > 0 ? diffDays : 0; // Si ya expiró, regresamos 0
        // },
    },

    Query: {
        me: requireAuth(async (_: any, __: any, context: any) => {
            return context.user;
        }),

        users: requireAuth(async (_: any, __: any, context: any) => {
            return await UserService.getAllUsers();
        }),

        user: requireAuth(async (_: any, { id }: { id: string }, context: any) => {
            return await UserService.getUserById(id);
        }),
    },

    Mutation: {
        register: requireAltcha(async (_: any, { input }: { input: any }) => {
            return await UserService.createUser(input);
        }),

        login: requireAltcha(async (_: any, { input }: { input: any }) => {
            const { email, password } = input;
            return await UserService.authenticateUser(email, password);
        }),

        refreshToken: async (_: any, { input }: { input: any }) => {
            const refreshToken = input.refreshToken;
            return await UserService.refreshUserToken(refreshToken);
        },

        updateUser: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            return await UserService.updateUser(context.user.id, input);
        }),

        deleteUser: requireAuth(async (_: any, __: any, context: any) => {
            return await UserService.deleteUser(context.user.id);
        }),

        changePassword: requireAltcha(requireAuth(async (_: any, { oldPassword, newPassword }: { 
            oldPassword: string; 
            newPassword: string 
        }, context: any) => {
            return await UserService.changePassword(context.user.id, oldPassword, newPassword);
        })),

        toggleUserStatus: requireAdmin(async (_: any, { id, active }: { id: string, active: boolean }) => {
            return await UserService.toggleUserStatus(id, active);
        }),

        resetUserPassword: requireAdmin(async (_: any, { id }: { id: string }) => {
            return await UserService.resetUserPassword(id);
        }),

        toggleUserAdmin: requireAdmin(async (_: any, { id, isAdmin }: { id: string, isAdmin: boolean }, context: any) => {
            return await UserService.toggleUserAdmin(id, isAdmin, context.user.id);
        }),

        requestPasswordRecovery: requireAltcha(async (_: any, { email }: { email: string }) => {
            return await UserService.requestPasswordRecovery(email);
        }),

        resetPasswordWithToken: async (_: any, { token, newPassword }: { token: string, newPassword: string }) => {
            return await UserService.resetPasswordWithToken(token, newPassword);
        },

        // verifyEmail: async (_: any, { token }: { token: string }) => {
        //     return await UserService.verifyEmail(token);
        // },

        // resendVerificationEmail: async (_: any, { email }: { email: string }) => {
        //     return await UserService.resendVerificationEmail(email);
        // },
    }
};
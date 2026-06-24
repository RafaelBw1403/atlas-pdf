import { requireAuth } from "./auth.guard";

export const requireAdmin = (resolverFunction: Function) => {
    return requireAuth(async (parent: any, args: any, context: any, info: any) => {
        if (!context.user?.isAdmin) {
            const error = new Error('Admin access required');
            (error as any).extensions = { code: 'FORBIDDEN' };
            throw error;
        }
        return resolverFunction(parent, args, context, info);
    });
};

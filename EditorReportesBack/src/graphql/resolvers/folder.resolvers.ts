import { requireAuth } from "../../guards/auth.guard";
import { FolderService } from "../../services/folder.service";

export const folderResolvers = {
    Folder: {
        parent: async (parent: any) => {
            if (!parent.parentId) return null;
            // TODO: Implementar populate cuando tengamos auth real
            return null;
        }
    },

    Query: {
        folders: requireAuth(async (_: any, __: any, context: any) => {
            const userId = context.user.id;
            return await FolderService.getFoldersByUser(userId);
        }),

        folder: requireAuth(async (_: any, { id }: { id: string }, __: any, context: any) => {
            const userId = context.user.id;
            return await FolderService.getFolderById(id, userId);
        }),

        folderTree: requireAuth(async (_: any, __: any, context: any) => {
            const userId = context.user.id;
            return await FolderService.getFolderTree(userId);
        }),

        foldersByUser: requireAuth(async (_:any, __: any, context: any) => {
            const userId = context.user.id;
            return await FolderService.getFoldersByUser(userId);
        }),
    },

    Mutation: {
        createFolder: requireAuth(async (_: any, { input }: { input: any }, context: any) => {
            const userId = context.user.id;
            return await FolderService.createFolder({
                ...input,
                owner: userId,
            });
        }),

        updateFolder: requireAuth(async (_: any, { id, input }: { id: string; input: any }, context: any) => {
            const userId = context.user.id;
            return await FolderService.updateFolder(id, userId, input);
        }),

        deleteFolder:   requireAuth(async (_: any, { id, moveTemplatesToRoot }: { id: string; moveTemplatesToRoot?: boolean }, context: any) => {
            const userId = context.user.id; 
            return await FolderService.deleteFolder(id, userId, moveTemplatesToRoot ?? true);
        }),

        createSubfolder: requireAuth(async (_: any, { parentFolderId, input }: { parentFolderId: string; input: any }, context: any) => {
            const userId = context.user.id;
            return await FolderService.createSubfolder(parentFolderId, input, userId);
        }),

        shareFolder: requireAuth(async (_: any, { id, input }: { id: string; input: any }, context: any) => {
            const userId = context.user.id;
            return await FolderService.shareFolder(id, userId, input.targetUserIds, input.isPublic);
        }),
    }
};
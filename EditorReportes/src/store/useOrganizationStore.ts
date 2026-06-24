import { create, type StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { initDocument } from "./initOrganization";
import type { IDocument, IFolder } from "../interfaces/IGeneric";


interface OrgState {

    document: IDocument;
    addDocument: ( document: IDocument ) => void;

    documents: IDocument[];
    addDocuments: ( document: IDocument ) => void;
    delDocuments: ( idDocument: string ) => void;
    

    folders: IFolder[];
    addFolder: ( folder: IFolder ) => void;

    

}

const orgStore: StateCreator<OrgState, [["zustand/immer", never]]> = (set, get) => ({

    document: initDocument,
    documents: [],
    folders: [],

    

    // Set the current document (and also make sure it exists in the list)
    addDocument: (document: IDocument) =>
        set((state) => {
        state.document = document;
        const exists = state.documents.some((d: IDocument) => d.id === document.id);
        if (!exists) state.documents.unshift(document);
    }),

    // Add a document to the collection (no change to current)
    addDocuments: (document: IDocument) =>
        set((state) => {
            const exists = state.documents.some((d: IDocument) => d.id === document.id);
            if (!exists) state.documents.unshift(document);
        }),

    // Delete by id
    delDocuments: (idDocument: string) =>
        set((state) => {
            state.documents = state.documents.filter((d: IDocument) => d.id !== idDocument);
        }),

    // Add a folder (dedupe by id if you want)
    addFolder: (folder: IFolder) =>
        set((state) => {
            const exists = state.folders.some((f: IFolder) => f.id === folder.id);
            if (!exists) state.folders.push(folder);
        }),
})


export const useOrgStore = create<OrgState>()(
    devtools(
            immer(orgStore),
            { name: 'org-store'}
    )
)
// export const useOrgStore = create<OrgState>()(
//     devtools(
//         persist(
//             immer(orgStore),
//             { name: 'org-store'}
//         )
//     )
// )
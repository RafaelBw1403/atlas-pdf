// useReportStore.ts - Versión completa
import { create, type StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { pick } from 'lodash';
import type { IDocument, IFolder, ViewMode, SortOption } from "../interfaces/IGeneric";
import { CREATE_DOCUMENT, CREATE_FOLDER, DELETE_DOCUMENT, DELETE_FOLDER, documentFieldsInput, folderFieldsInput, GET_ALLDOCUMENTS, GET_DOCUMENT_BY_USER, GET_FOLDERS, GET_FOLDERS_BY_USER, MOVE_DOCUMENT_TO_FOLDER, UPDATE_DOCUMENT, UPDATE_FOLDER } from "../graphql/operations/graphql.operations";
import { GraphQLService } from "../graphql/graphql.service";
import { pickFields } from "../utils/pickFields";
import { DocumentDTO, DocumentUpdateDTO } from "../dto/Document.schema";
import z from "zod";
import { adaptApiToDocument } from "../utils/documentAdapter";

interface ReportState {
  document: IDocument;
  documents: IDocument[];
  folders: IFolder[];
  currentFolderId: string | null;
  viewMode: ViewMode;
  searchQuery: string;
  sortBy: SortOption;
  selectedDocuments: string[];

  // Document Actions
  getDocumentsByOwner: () => Promise<IDocument[]>;
  addDocument: (document: IDocument) => Promise<IDocument>;
  updateDocument: (updates: Partial<IDocument>) => Promise<void>;
  delDocument: (idDocument: string) => Promise<void>;
  addDocuments: (document: IDocument) => void;
  getDocumentById: (id: string) => IDocument | null;
  setCurrentFolder: (folderId: string | null) => void;
  getDocumentsByFolder: (folderId?: string) => IDocument[];
  searchDocuments: (query: string) => IDocument[];

  // Folder Actions
  getFoldersByOwner: () => Promise<IFolder[]>;
  getFolders: () => Promise<IFolder[]>;
  addFolder: (folder: Omit<IFolder, 'id'>) => Promise<void>;
  updateFolder: (folderId: string, updates: Partial<IFolder>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  moveDocumentToFolder: (documentId: string, folderId: string | null) => Promise<void>;

  // UI Actions
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  toggleDocumentSelection: (documentId: string) => void;
  clearSelection: () => void;
  moveSelectedDocuments: (folderId: string | null) => Promise<void>;
  moveSingleDocument: (documentId: string, folderId: string | null) => Promise<void>;

  // Share Actions
  shareFolder: (folderId: string, users: string[]) => Promise<void>;
  unshareFolder: (folderId: string, userId: string) => Promise<void>;

  isOpenMoveModal: boolean;
  setIsOpenMoveModal: (isOpen: boolean) => void;

  selectedMoveDocuments: string[];
  setSelectedMoveDocuments: (selectedDocuments: string[]) => void;

  isOpenCreateFolderModal: boolean;
  setIsOpenCreateFolderModal: (isOpen: boolean) => void;
}

const initDocument: IDocument = {
  id: '',
  documentGroupId: '',
  stage: 'draft',
  name: 'Nuevo Documento',
  html: '',
  css: '',
  sampleData: {},
  htmlHeader: '',
  cssHeader: '',
  htmlFooter: '',
  cssFooter: '',
    printConfig: {
      layout: {
        orientation: false,
        format: 'A4',
        width: 210,
        height: 297,
        unit: 'mm'
      },
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      },
      options: {
        scale: 1,
        printBackground: true,
        pageNumbers: true
      },
      headerHeight: 0,
      footerHeight: 0
    },
  createdAt: new Date(),
  updatedAt: new Date()
};


const reportStore: StateCreator<ReportState, [["zustand/immer", never]]> = (set, get) => ({
  document: initDocument,
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


  getDocumentsByOwner: async () => {
    try {
      const result = await GraphQLService.query(GET_DOCUMENT_BY_USER);

      const documents = result.data?.templatesByUser;

      const cleanDocuments = documents.map((doc: any) => adaptApiToDocument(doc));

      set((state) => {
        state.documents = cleanDocuments || [];
      });

      return documents;
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      return [];
    }
  },

  // Document Methods (manteniendo las existentes y agregando nuevas)
  addDocument: async (document: IDocument) => {
    try {
      // const documentInput = pickFields(document, documentFieldsInput);
      const validatedInput = DocumentDTO.parse(document);
      const result = await GraphQLService.mutate(CREATE_DOCUMENT, { input: validatedInput }); //TODO: Mejorar el 

      const created = result.data?.createTemplate;
      const adapted = adaptApiToDocument(created);

      set((state) => {
        // Usar unshift para que aparezca de primero
        state.documents.unshift(adapted);
        state.document = adapted;
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Documento creado!',
        text: `"${document.name}" se ha guardado correctamente`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      return adapted;

    } catch (error) {
      console.error('Error en addDocument:', error);
      if (error instanceof z.ZodError) {
        console.error("Error de validación:", error);
      }
      await Swal.fire({
        icon: 'error',
        title: 'Error al crear documento',
        text: 'No se pudo crear el documento',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  updateDocument: async (updates: Partial<IDocument>) => {
    try {

      // const documentInput = pickFields(updates, documentFieldsInput);
      const validatedInput = DocumentUpdateDTO.parse(updates);
      const result = await GraphQLService.mutate(UPDATE_DOCUMENT, { id: updates.id, input: validatedInput },
        updates.name ? { refetchQueries: ['TemplateVersions'] } : {});

      const updated = result.data?.updateTemplate;
      const adapted = adaptApiToDocument(updated);
      set((state) => {
        state.document = {
          ...state.document,
          ...adapted,
          updatedAt: new Date()
        };

        const docIndex = state.documents.findIndex((d: IDocument) => d.id === state.document.id);
        if (docIndex >= 0) {
          state.documents[docIndex] = state.document;
        }
      });

      // Propagar nombre a todas las versiones hermanas en el store local
      if (updates.name && adapted.documentGroupId) {
        set((state) => {
          state.documents.forEach((doc: IDocument) => {
            if (doc.documentGroupId === adapted.documentGroupId) {
              doc.name = updates.name!;
            }
          });
          state.document.name = updates.name!;
        });
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Documento actualizado!',
        text: `Los cambios se han guardado correctamente`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error en updateDocument:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'No se pudieron guardar los cambios',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  delDocument: async (idDocument: string) => {
    try {
      const response = await GraphQLService.mutate(DELETE_DOCUMENT, { id: idDocument });

      if (response.data?.deleteTemplate) {
        set((state) => {
          state.documents = state.documents.filter((d: IDocument) => d.id !== idDocument);
          state.selectedDocuments = state.selectedDocuments.filter(id => id !== idDocument);
        });

        await Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: `Documento eliminado correctamente`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        return;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: 'No se pudo eliminar el documento',
        confirmButtonText: 'Entendido'
      });

    } catch (error) {
      console.error('Error en delDocuments:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: 'No se pudo eliminar el documento',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  getDocumentById: (id: string) => {
    const { documents } = get();
    return documents.find(doc => doc.id === id) || null;
  },

  addDocuments: (document: IDocument) =>
    set((state) => {
      const exists = state.documents.some((d: IDocument) => d.id === document.id);
      if (!exists) state.documents.unshift(document);
    }),

  setCurrentFolder: (folderId: string | null) =>
    set((state) => {
      state.currentFolderId = folderId;
    }),

  getDocumentsByFolder: (folderId?: string) => {
    const { documents, folders, currentFolderId, searchQuery, sortBy } = get();
    const targetFolderId = folderId || currentFolderId;

    let filteredDocs = documents;

    const folderDocs = documents.filter(doc => doc.folderId === targetFolderId);
    const uniqueByGroup = new Map<string, IDocument>();
    for (const doc of folderDocs) {
      const groupId = doc.documentGroupId || doc.id;
      const existing = uniqueByGroup.get(groupId);
      if (!existing) {
        uniqueByGroup.set(groupId, doc);
      } else {
        const priority = (s: string) => s === 'production' ? 0 : s === 'draft' ? 1 : s === 'qa' ? 2 : 3;
        if (priority(doc.stage) < priority(existing.stage)) {
          uniqueByGroup.set(groupId, doc);
        }
      }
    }
    filteredDocs = Array.from(uniqueByGroup.values());

    // Aplicar ordenamiento
    filteredDocs = [...filteredDocs].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });

    return filteredDocs;
  },

  searchDocuments: (query: string) => {
    const { documents } = get();
    const matching = documents.filter(doc =>
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    const uniqueByGroup = new Map<string, IDocument>();
    for (const doc of matching) {
      const groupId = doc.documentGroupId || doc.id;
      const existing = uniqueByGroup.get(groupId);
      if (!existing) {
        uniqueByGroup.set(groupId, doc);
      } else {
        const priority = (s: string) => s === 'production' ? 0 : s === 'draft' ? 1 : s === 'qa' ? 2 : 3;
        if (priority(doc.stage) < priority(existing.stage)) {
          uniqueByGroup.set(groupId, doc);
        }
      }
    }
    return Array.from(uniqueByGroup.values());
  },

  // Folder Methods
  // En useReportStore.ts - cambiar la firma de addFolder

  getFolders: async () => {
    try {
      const folders_api: IFolder[] = await GraphQLService.query(GET_FOLDERS).then((res: any) => res.data.folders);

      set((state) => {
        state.folders = folders_api;
      });

      return folders_api;
    } catch (error) {
      console.error('Error en getFolders:', error);
      throw error;
    }
  },

  getFoldersByOwner: async () => {
    try {
      const folders_api: IFolder[] = await GraphQLService.query(GET_FOLDERS_BY_USER).then((res: any) => res.data.foldersByUser);

      if (folders_api.length === 0) {
        return [];
      }

      set((state) => {
        state.folders = folders_api;
      });

      return folders_api;
    } catch (error) {
      console.error('Error en getFolders:', error);
      throw error;
    }
  },


  addFolder: async (folderData: Omit<IFolder, 'id'>) => {
    try {
      const newFolder: IFolder = {
        ...folderData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const folderInput = pickFields(newFolder, folderFieldsInput);

      const result = await GraphQLService.mutate(CREATE_FOLDER, { input: folderInput });

      const createdFolder = result.data.createFolder;

      set((state) => {
        state.folders.unshift(createdFolder);
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Carpeta creada!',
        text: `"${folderData.name}" se ha creado correctamente`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error en addFolder:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al crear carpeta',
        text: 'No se pudo crear la carpeta',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  // En useReportStore.ts - corregir updateFolder
  updateFolder: async (folderId: string, updates: Partial<IFolder>) => {
    try {


      const folderInput = pickFields(updates, folderFieldsInput);

      const result = await GraphQLService.mutate(UPDATE_FOLDER, { id: folderId, input: folderInput });

      if (!result.data?.updateFolder) {
        throw new Error('Error al actualizar la carpeta');
      }

      set((state) => {
        const folderIndex = state.folders.findIndex(f => f.id === folderId);
        if (folderIndex >= 0) {
          Object.assign(state.folders[folderIndex]!, updates, {
            updatedAt: new Date() // Cambiar dateUpdated por updatedAt
          });
        }
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Carpeta actualizada!',
        text: `Los cambios se han guardado correctamente`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error en updateFolder:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'No se pudieron guardar los cambios',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  deleteFolder: async (folderId: string) => {
    try {

      const response = await GraphQLService.mutate(DELETE_FOLDER, { id: folderId });

      if (!response.data?.deleteFolder) {
        throw new Error('Error al eliminar la carpeta');
      }

      const { folders } = get();
      const folderToDelete = folders.find(f => f.id === folderId);

      const { documents } = get();
      const updatedDocuments = documents.map(doc => {
        if (doc.folderId === folderId) {
          return { ...doc, folderId: null };
        }
        return doc;
      });

      if (!folderToDelete) return;

      const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar carpeta?',
        text: `La carpeta "${folderToDelete.name}" será eliminada, el contenido de la carpeta se moverá a la carpeta raíz`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (!result.isConfirmed) return;

      set((state) => {
        state.folders = state.folders.filter(f => f.id !== folderId);
        state.documents = updatedDocuments;
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Eliminada!',
        text: `Carpeta eliminada correctamente`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error en deleteFolder:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: 'No se pudo eliminar la carpeta',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  moveDocumentToFolder: async (documentId: string, folderId: string | null) => {
    try {
      const state = get();
      const doc = state.documents.find(d => d.id === documentId);
      if (!doc) throw new Error('Documento no encontrado');

      // Expandir a todos los hermanos del mismo grupo (draft, qa, prod)
      const idsToMove = new Set<string>([documentId]);
      if (doc.documentGroupId) {
        state.documents
          .filter(d =>
            d.documentGroupId === doc.documentGroupId &&
            d.id !== documentId &&
            (d.folderId ?? null) === (doc.folderId ?? null)
          )
          .forEach(d => idsToMove.add(d.id));
      }

      for (const id of idsToMove) {
        const result = await GraphQLService.mutate(MOVE_DOCUMENT_TO_FOLDER, { templateId: id, folderId });
        if (!result.data?.moveTemplate) {
          throw new Error(`Error al mover el documento ${id}`);
        }
      }

      set((state) => {
        for (const id of idsToMove) {
          const docIndex = state.documents.findIndex(d => d.id === id);
          if (docIndex >= 0) {
            state.documents[docIndex]!.folderId = folderId || undefined;
            state.documents[docIndex]!.updatedAt = new Date();
          }
        }
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Documento movido!',
        text: `Se movieron ${idsToMove.size} documento(s) correctamente`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error en moveDocumentToFolder:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al mover documento',
        text: 'No se pudo mover el documento',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  // UI Methods
  setViewMode: (mode: ViewMode) =>
    set((state) => {
      state.viewMode = mode;
    }),

  setSearchQuery: (query: string) =>
    set((state) => {
      state.searchQuery = query;
    }),

  setSortBy: (sort: SortOption) =>
    set((state) => {
      state.sortBy = sort;
    }),

  toggleDocumentSelection: (documentId: string) =>
    set((state) => {
      if (state.selectedDocuments.includes(documentId)) {
        state.selectedDocuments = state.selectedDocuments.filter(id => id !== documentId);
      } else {
        state.selectedDocuments.push(documentId);
      }
    }),

  clearSelection: () =>
    set((state) => {
      state.selectedDocuments = [];
    }),

  moveSelectedDocuments: async (folderId: string | null) => {
    const { selectedMoveDocuments, moveDocumentToFolder } = get();

    try {
      for (const docId of selectedMoveDocuments) {
        await moveDocumentToFolder(docId, folderId);
      }

      set((state) => {
        state.selectedMoveDocuments = [];
      });

    } catch (error) {
      console.error('Error moving documents:', error);
      throw error;
    }
  },

  moveSingleDocument: async (documentId: string, folderId: string | null) => {
    const moveDocumentToFolder = get().moveDocumentToFolder;
    await moveDocumentToFolder(documentId, folderId);
  },

  // Share Methods
  shareFolder: async (folderId: string, users: string[]) => {
    try {
      set((state) => {
        const folderIndex = state.folders.findIndex(f => f.id === folderId);
        if (folderIndex >= 0) {
          state.folders[folderIndex]!.isShared = true;
          state.folders[folderIndex]!.sharedWith = [
            ...(state.folders[folderIndex]!.sharedWith || []),
            ...users
          ];
          state.folders[folderIndex]!.updatedAt = new Date();
        }
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Carpeta compartida!',
        text: `La carpeta se ha compartido con ${users.length} usuario(s)`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error en shareFolder:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al compartir',
        text: 'No se pudo compartir la carpeta',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },

  unshareFolder: async (folderId: string, userId: string) => {
    try {
      set((state) => {
        const folderIndex = state.folders.findIndex(f => f.id === folderId);
        if (folderIndex >= 0) {
          state.folders[folderIndex]!.sharedWith =
            state.folders[folderIndex]!.sharedWith?.filter(user => user !== userId) || [];

          if (state.folders[folderIndex]!.sharedWith?.length === 0) {
            state.folders[folderIndex]!.isShared = false;
          }

          state.folders[folderIndex]!.updatedAt = new Date();
        }
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Compartición removida!',
        text: `El usuario ya no tiene acceso a la carpeta`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error en unshareFolder:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al remover acceso',
        text: 'No se pudo remover el acceso del usuario',
        confirmButtonText: 'Entendido'
      });
      throw error;
    }
  },


  setIsOpenMoveModal: (isOpen: boolean) => set((state) => { state.isOpenMoveModal = isOpen }),

  setSelectedMoveDocuments: (selectedDocuments: string[]) => set((state) => { state.selectedMoveDocuments = [...selectedDocuments] }),

  setIsOpenCreateFolderModal: (isOpen: boolean) => set((state) => { state.isOpenCreateFolderModal = isOpen }),
});


export const useReportStore = create<ReportState>()(
  devtools(
    immer(reportStore),
    { name: 'report-store' }
  )
);
// export const useReportStore = create<ReportState>()(
//   devtools(
//     persist(
//       immer(reportStore),
//       {
//         name: 'report-store',
//         storage: {
//           getItem: (name) => {
//             const item = localStorage.getItem(name);
//             return item ? JSON.parse(item) : null;
//           },
//           setItem: (name, value) => {
//             localStorage.setItem(name, JSON.stringify(value));
//           },
//           removeItem: (name) => {
//             localStorage.removeItem(name);
//           }
//         }
//       }
//     )
//   )
// );
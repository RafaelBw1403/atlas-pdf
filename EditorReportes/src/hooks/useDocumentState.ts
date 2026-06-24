import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReportStore } from "../store/useReportStore";
import { types } from "../types/types";
import { initDocument } from "../store/initOrganization";
import type { IDocument } from "../interfaces/IGeneric";

export const useDocumentState = () => {
  const { operation = types.documentNew, documentId } = useParams();
  const getDocumentById = useReportStore(state => state.getDocumentById);
  const getDocumentsByOwner = useReportStore(state => state.getDocumentsByOwner);
  
  const [documentState, setDocumentState] = useState<IDocument>(initDocument);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Cargar documento existente o resetear para nuevo
  useEffect(() => {
    const loadDocument = async () => {
      if (operation === types.documentEdit && documentId) {
        let existingDocument = getDocumentById(documentId);
        if (!existingDocument) {
          await getDocumentsByOwner();
          existingDocument = getDocumentById(documentId);
        }
        if (existingDocument) {
          setDocumentState(existingDocument);
        }
      } else if (operation === types.documentNew) {
        setDocumentState(initDocument);
      }
    };
    loadDocument();
  }, [documentId, operation, getDocumentById, getDocumentsByOwner]);

  // Detectar cambios no guardados
  useEffect(() => {
    if (operation === types.documentEdit && documentId) {
      const storedDocument = getDocumentById(documentId);
      if (storedDocument) {
        const hasChanges = JSON.stringify(documentState) !== JSON.stringify(storedDocument);
        setHasUnsavedChanges(hasChanges);
      }
    } else if (operation === types.documentNew) {
      const hasChanges = JSON.stringify(documentState) !== JSON.stringify(initDocument);
      setHasUnsavedChanges(hasChanges);
    }
  }, [documentState, documentId, operation, getDocumentById]);

  const updateDocumentState = (updates: Partial<IDocument>) => {
    setDocumentState(prevState => {
      const isReadOnly = prevState.stage !== 'draft' && prevState.stage !== 'qa' && operation !== types.documentNew;
      if (isReadOnly) {
        if (Object.keys(updates).length === 1 && ('name' in updates || 'documentGroupId' in updates)) {
          return { ...prevState, ...updates };
        }
        return prevState;
      }
      return { ...prevState, ...updates };
    });
  };

  return {
    documentState,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isEditingTitle,
    setIsEditingTitle,
    updateDocumentState,
    operation,
    documentId
  };
};
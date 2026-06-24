import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback, useEffect } from 'react';
import {
    GET_TEMPLATE_VERSIONS,
    PUBLISH_TEMPLATE,
    CREATE_DRAFT,
    DELETE_TEMPLATE_VERSION,
    PUBLISH_TO_QA,
} from '../graphql/operations/graphql.operations';
import type { IDocument } from '../interfaces/IGeneric';
import { adaptApiToDocument } from '../utils/documentAdapter';

/**
 * Hook para gestionar el historial de versiones de una plantilla.
 * @param documentGroupId - ID del grupo de versiones (puede ser null si aún no está disponible).
 */
export const useTemplateVersions = (documentGroupId?: string | null) => {

    // ── Queries ──────────────────────────────────────────────────────────────
    const {
        data,
        loading: loadingVersions,
        error: versionsError,
        refetch: refetchVersions
    } = useQuery<{ templateVersions: IDocument[] }>(GET_TEMPLATE_VERSIONS, {
        variables: { documentGroupId },
        skip: !documentGroupId,
        fetchPolicy: 'network-only',
    });

    const versions: IDocument[] = (data?.templateVersions ?? []).map(adaptApiToDocument);

    // ── Mutations ─────────────────────────────────────────────────────────────
    const [publishTemplateMutation, { loading: publishing }] = useMutation(PUBLISH_TEMPLATE, {
        onCompleted: () => refetchVersions(),
    });

    const [createDraftMutation, { loading: creatingDraft }] = useMutation(CREATE_DRAFT, {
        onCompleted: () => refetchVersions(),
    });

    const [deleteVersionMutation, { loading: deletingVersion }] = useMutation(DELETE_TEMPLATE_VERSION, {
        onCompleted: () => refetchVersions(),
    });

    const [publishToQAMutation, { loading: publishingToQA }] = useMutation(PUBLISH_TO_QA, {
        onCompleted: () => refetchVersions(),
    });

    // ── Acciones ──────────────────────────────────────────────────────────────

    /**
     * Publica a producción. Si no se especifica templateId, publica el draft actual.
     * @param comment Comentario obligatorio describiendo los cambios.
     * @param templateId Opcional. ID de la versión específica a publicar (QA, histórica o draft).
     */
    const publishTemplate = useCallback(async (comment: string, templateId?: string): Promise<string> => {
        if (!documentGroupId) throw new Error('documentGroupId is required to publish');
        const result = await publishTemplateMutation({
            variables: { documentGroupId, input: { comment, templateId } },
        });
        const newDocumentGroupId = result.data?.publishTemplate?.documentGroupId as string;
        return newDocumentGroupId;
    }, [documentGroupId, publishTemplateMutation]);

    /**
     * Crea un borrador a partir de cualquier versión.
     * @param templateId ID de la versión origen (producción, histórica o draft).
     * @returns El documento de borrador creado adaptado a IDocument.
     * @throws Error si el backend retorna errores GraphQL.
     */
    const createDraft = useCallback(async (templateId: string) => {
        const result = await createDraftMutation({ variables: { templateId } });
        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
        }
        if (!result.data?.createDraft) {
            throw new Error('No se recibieron datos del borrador. Intenta de nuevo.');
        }
        return adaptApiToDocument(result.data.createDraft) as IDocument;
    }, [createDraftMutation]);

    /**
     * Elimina una versión del historial (no puede ser producción).
     * @param versionId ID del documento de versión a eliminar.
     */
    const deleteVersion = useCallback(async (versionId: string) => {
        await deleteVersionMutation({ variables: { id: versionId } });
    }, [deleteVersionMutation]);

    /**
     * Publica una versión específica en QA.
     * @param templateId ID de la versión a publicar en QA.
     */
    const publishToQA = useCallback(async (templateId: string) => {
        await publishToQAMutation({ variables: { templateId } });
    }, [publishToQAMutation]);

    // ── Derivados ─────────────────────────────────────────────────────────────
    const productionVersion = versions.find(v => v.stage === 'production');
    const draftVersion = versions.find(v => v.stage === 'draft');
    const qaVersion = versions.find(v => v.stage === 'qa');
    const historicalVersions = versions;
    const hasDraft = !!draftVersion;

    return {
        versions,
        productionVersion,
        draftVersion,
        qaVersion,
        historicalVersions,
        hasDraft,
        loadingVersions,
        versionsError,
        publishing,
        creatingDraft,
        deletingVersion,
        publishingToQA,
        refetchVersions,
        publishTemplate,
        createDraft,
        deleteVersion,
        publishToQA,
    };
};
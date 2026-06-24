import { useState, useMemo, useCallback, type ReactNode } from "react";
import { Button, Row, Col, Typography, Space, theme, Modal, Tag, Select } from "antd";
import { HistoryOutlined, SaveOutlined, DownloadOutlined } from "@ant-design/icons";
import { Group, Panel, Separator } from "react-resizable-panels";
import { ProblemsPanel } from "./ProblemsPanel";
import { types } from "../types/types";
import { useReportStore } from "../store/useReportStore";
import { useApiKeyActions } from "../hooks/useApiKeyActions";
import { useDocumentState } from "../hooks/useDocumentState";
import { usePdfExport } from "../hooks/usePdfExport";
import { EditorTabs } from "./EditorTabs";
import { EditorPanel, type PanelContentType } from "./EditorPanel";
import { VersionHistoryPanel } from "./VersionHistoryPanel";
import { useTemplateVersions } from "../hooks/useTemplateVersions";

import { generateFinalHtml } from "../utils/reportEngine";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { DocumentTitle } from "./DocumentTitle";
import type { IDocument } from "../interfaces/IGeneric";

export const EditorStudioComponent = () => {

  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);

  type LayoutMode = 'single' | 'code+code' | 'code+preview' | 'three';

  const PANEL_CONTENTS_DEFAULTS: Record<LayoutMode, PanelContentType[]> = {
    single: [],
    'code+code': ['html', 'css'],
    'code+preview': ['html', 'preview'],
    three: ['html', 'css', 'preview'],
  };

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [panelContents, setPanelContents] = useState<PanelContentType[]>([]);

  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    setPanelContents(PANEL_CONTENTS_DEFAULTS[mode]);
  }, []);

  // ── Modal: "crear borrador" cuando el usuario intenta editar una versión bloqueada ──
  const [createDraftModalOpen, setCreateDraftModalOpen] = useState(false);
  const [pendingDraftSourceId, setPendingDraftSourceId] = useState<string | null>(null);

  const { devApiKey } = useApiKeyActions({ 
    autoFetch: true,
    autoCreateMissing: false
  });

  const {
    documentState,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isEditingTitle,
    setIsEditingTitle,
    updateDocumentState,
    operation,
    documentId
  } = useDocumentState();

  const updateDocument = useReportStore(state => state.updateDocument);
  const addDocument = useReportStore(state => state.addDocument);
  const addDocuments = useReportStore(state => state.addDocuments);
  const { handleExportPdf } = usePdfExport();

  // Hook de versiones (se activa cuando tenemos documentGroupId)
  const documentGroupId = documentState.documentGroupId;
  const { createDraft } = useTemplateVersions(documentGroupId);

  // ── Determinar si el documento actual es editable ─────────────────────────
  // Solo se puede editar si es un draft. Producción e históricas son read-only.
  const isReadOnly = documentState.stage !== 'draft' && documentState.stage !== 'qa' && operation !== types.documentNew;
  

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    Swal.fire({
      title: 'Guardando documento...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    if (isReadOnly && documentState.id) {
      // En readonly solo se permite cambiar el nombre → propagar al grupo
      await updateDocument({ id: documentState.id, name: documentState.name });
    } else if (operation === types.documentNew) {
      const created = await addDocument(documentState);
      navigate(`/app/editor/${types.documentEdit}/${created.id}`);
    } else {
      await updateDocument(documentState);
    }
    
    Swal.close();
    setHasUnsavedChanges(false);
  };

  // ── Intentar editar una versión bloqueada ─────────────────────────────────
  const handleAttemptEditLocked = useCallback(() => {
    if (!documentState.id) return;
    setPendingDraftSourceId(documentState.id);
    setCreateDraftModalOpen(true);
  }, [documentState.id]);

  const handleConfirmCreateDraft = async () => {
    if (!pendingDraftSourceId) return;
    try {
      Swal.fire({ title: 'Creando borrador...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const newDraft = await createDraft(pendingDraftSourceId);
      Swal.close();
      setCreateDraftModalOpen(false);
      setPendingDraftSourceId(null);
      if (newDraft) {
        addDocuments(newDraft);
        navigate(`/app/editor/${types.documentEdit}/${newDraft.id}`);
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el borrador. El servidor no devolvió datos.' });
      }
    } catch (err: any) {
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'No se pudo crear el borrador.' });
    }
  };

  // ── Abrir versión desde el panel de historial ─────────────────────────────
  const handleOpenVersion = useCallback((version: IDocument) => {
    addDocuments(version);
    navigate(`/app/editor/${types.documentEdit}/${version.id}`);
    setVersionPanelOpen(false);
  }, [navigate, addDocuments]);

  // ── Previsualizar PDF de una versión ──────────────────────────────────────
  const handlePreviewVersion = useCallback((version: IDocument) => {
    // Usa el id de la versión directamente (el backend lo resolverá)
    handleExportPdf(devApiKey?.apiKey || '', version.id);
  }, [devApiKey, handleExportPdf]);

  // ── HTML final para vista previa ──────────────────────────────────────────
  const { html: finalReportHtml, error: previewError, errors: compileErrors } = useMemo(() => 
    generateFinalHtml({
      html: documentState.html || "",
      css: documentState.css || "",
      headerHtml: documentState.htmlHeader || "",
      headerCss: documentState.cssHeader || "",
      footerHtml: documentState.htmlFooter || "",
      footerCss: documentState.cssFooter || "",
      data: documentState.sampleData
    }), [documentState]
  );

  const isExportDisabled = hasUnsavedChanges || operation === types.documentNew;

  return (
    <div className="studio-container">
      <Row justify="space-between" align="middle" className="studio-header" style={{ paddingInline: 12, paddingBlock: 6 }}>
        <Col>
          <Space align="center" size={4}>
            <DocumentTitle
              name={documentState.name}
              id={documentState.id}
              documentGroupId={documentState.documentGroupId}
              isEditing={isEditingTitle}
              readOnly={isReadOnly}
              onEditStart={() => setIsEditingTitle(true)}
              onEditEnd={() => setIsEditingTitle(false)}
              onNameChange={(name) => updateDocumentState({ name })}
            />

            {operation === types.documentNew && !documentState.id && (
              <Tag color="orange" style={{ marginLeft: 4, fontSize: 11, lineHeight: '18px' }}>Sin guardar</Tag>
            )}
            {hasUnsavedChanges && operation === types.documentEdit && (
              <Tag color="orange" style={{ marginLeft: 4, fontSize: 11, lineHeight: '18px' }}>Sin guardar</Tag>
            )}

            {documentState.stage === 'draft' && (
              <Tag color="blue" style={{ marginLeft: 2, fontSize: 11, lineHeight: '18px' }}>Borrador</Tag>
            )}
            {documentState.stage === 'production' && (
              <Tag color="green" style={{ marginLeft: 2, fontSize: 11, lineHeight: '18px' }}>Publicado</Tag>
            )}
            {documentState.stage === 'qa' && (
              <Tag color="orange" style={{ marginLeft: 2, fontSize: 11, lineHeight: '18px' }}>QA</Tag>
            )}
          </Space>
        </Col>

        <Col>
          <Space size={4}>
            {documentGroupId && (
              <Button
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => setVersionPanelOpen(true)}
              />
            )}

            <Select
              size="small"
              value={layoutMode}
              onChange={(val) => handleLayoutModeChange(val as LayoutMode)}
              options={[
                { value: 'single', label: 'Simple' },
                { value: 'code+code', label: '2 Paneles' },
                { value: 'code+preview', label: 'Preview' },
                { value: 'three', label: '3 Paneles' },
              ]}
              style={{ width: 110 }}
            />

            <Button
              size="small"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExportPdf(devApiKey?.apiKey || '', documentState.id)}
              disabled={isExportDisabled}
              title={isExportDisabled ? "Debes guardar los cambios antes de exportar a PDF" : "Exportar a PDF"}
            >
              PDF
            </Button>

            <Button 
              size="small"
              type={isExportDisabled ? "primary" : "default"}
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={isReadOnly && !hasUnsavedChanges}
              title={isReadOnly && !hasUnsavedChanges ? "Esta versión es de solo lectura. Crea un borrador para editar." : ""}
            >
              Guardar
            </Button>
          </Space>
        </Col>
      </Row>

      <div className="studio-body" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {layoutMode === 'single' ? (
            <EditorTabs
              documentState={documentState}
              updateDocumentState={updateDocumentState}
              mode="full"
              readOnly={isReadOnly}
              onAttemptEditLocked={handleAttemptEditLocked}
              previewHtml={finalReportHtml}
              previewError={previewError}
            />
          ) : (
            <Group orientation="horizontal" style={{ height: '100%' }}>
              {panelContents.reduce<ReactNode[]>((acc, ct, idx) => {
                if (idx > 0) {
                  acc.push(<Separator key={`handle-${idx}`} className="panel-resize-handle" />);
                }
                acc.push(
                  <Panel key={idx} minSize={20} defaultSize={Math.floor(100 / panelContents.length)}>
                    <EditorPanel
                      contentType={ct}
                      onContentTypeChange={(type) => {
                        setPanelContents((prev) => {
                          const next = [...prev];
                          next[idx] = type;
                          return next;
                        });
                      }}
                      documentState={documentState}
                      updateDocumentState={updateDocumentState}
                      readOnly={isReadOnly}
                      onAttemptEditLocked={handleAttemptEditLocked}
                      previewHtml={finalReportHtml}
                      previewError={previewError}
                    />
                  </Panel>
                );
                return acc;
              }, [])}
            </Group>
          )}
        </div>
        <ProblemsPanel errors={compileErrors} data={documentState.sampleData} collapsible />
      </div>

      {/* Panel de Historial de Versiones */}
      <VersionHistoryPanel
        documentGroupId={documentGroupId}
        open={versionPanelOpen}
        onClose={() => setVersionPanelOpen(false)}
        onOpenVersion={handleOpenVersion}
        onPreviewVersion={handlePreviewVersion}
        currentVersionId={documentState.id}
        onPublishSuccess={(newDocGroupId) => updateDocumentState({ documentGroupId: newDocGroupId })}
      />

      {/* Modal: Crear borrador al intentar editar versión bloqueada */}
      <Modal
        title="¿Crear borrador?"
        open={createDraftModalOpen}
        onCancel={() => { setCreateDraftModalOpen(false); setPendingDraftSourceId(null); }}
        onOk={handleConfirmCreateDraft}
        okText="Sí, crear borrador"
        cancelText="Cancelar"
      >
        <p>
          Se creará un <strong>borrador (Draft)</strong> basado en esta versión para que puedas realizar cambios.
          La versión de producción <strong>no se verá afectada</strong> hasta que decidas publicar el borrador.
        </p>
        <p>¿Deseas continuar?</p>
      </Modal>
    </div>
  );
};
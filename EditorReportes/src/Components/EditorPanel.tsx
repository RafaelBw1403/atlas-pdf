import { Select } from "antd";
import { EditorHtmlComponent } from "./EditorHtmlComponent";
import { EditorCssComponent } from "./EditorCssComponent";
import { EditorJsonComponent } from "./EditorJsonComponent";
import { EditorBaseComponent } from "./EditorBaseComponent";
import { VistaPreviaComponent } from "./VistaPreviaComponent";
import type { IDocument } from "../interfaces/IGeneric";

export type PanelContentType = 'html' | 'css' | 'json' | 'header-html' | 'header-css' | 'footer-html' | 'footer-css' | 'preview';

interface Props {
  contentType: PanelContentType;
  onContentTypeChange: (type: PanelContentType) => void;
  documentState: IDocument;
  updateDocumentState: (updates: Partial<IDocument>) => void;
  readOnly: boolean;
  onAttemptEditLocked: () => void;
  previewHtml: string;
  previewError: string | null;
}

const LABELS: Record<PanelContentType, string> = {
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  'header-html': 'Header HTML',
  'header-css': 'Header CSS',
  'footer-html': 'Footer HTML',
  'footer-css': 'Footer CSS',
  preview: 'Vista Previa',
};

const OPTIONS = Object.entries(LABELS).map(([value, label]) => ({ value, label }));

export const EditorPanel = ({
  contentType,
  onContentTypeChange,
  documentState,
  updateDocumentState,
  readOnly,
  onAttemptEditLocked,
  previewHtml,
  previewError,
}: Props) => {

  const renderContent = () => {
    switch (contentType) {
      case 'html':
        return (
          <EditorHtmlComponent
            htmlCodeprop={documentState.html || ''}
            setHtmlCodeProp={(html) => updateDocumentState({ html })}
            jsonStringProp={documentState.sampleData}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked}
          />
        );
      case 'css':
        return (
          <EditorCssComponent
            cssProp={documentState.css || ''}
            setCssProp={(css) => updateDocumentState({ css })}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked}
          />
        );
      case 'json':
        return (
          <EditorJsonComponent
            jsonProp={JSON.stringify(documentState.sampleData)}
            setJsonProp={(json) => {
              try {
                updateDocumentState({ sampleData: JSON.parse(json) });
              } catch {
                // ignore invalid JSON during editing
              }
            }}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked}
          />
        );
      case 'header-html':
        return (
          <EditorBaseComponent
            key={`header-html-${readOnly}`}
            label="Header HTML"
            value={documentState.htmlHeader || ''}
            onChange={(val) => updateDocumentState({ htmlHeader: val })}
            language="html"
            autocompleteJson={documentState.sampleData}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked}
          />
        );
      case 'header-css':
        return (
          <EditorBaseComponent
            key={`header-css-${readOnly}`}
            label="Header CSS"
            value={documentState.cssHeader || ''}
            onChange={(val) => updateDocumentState({ cssHeader: val })}
            language="css"
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked}
          />
        );
      case 'footer-html':
        return (
          <EditorBaseComponent
            key={`footer-html-${readOnly}`}
            label="Footer HTML"
            value={documentState.htmlFooter || ''}
            onChange={(val) => updateDocumentState({ htmlFooter: val })}
            language="html"
            autocompleteJson={documentState.sampleData}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked}
          />
        );
      case 'footer-css':
        return (
          <EditorBaseComponent
            key={`footer-css-${readOnly}`}
            label="Footer CSS"
            value={documentState.cssFooter || ''}
            onChange={(val) => updateDocumentState({ cssFooter: val })}
            language="css"
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked}
          />
        );
      case 'preview':
        return <VistaPreviaComponent htmlProp={previewHtml || ''} error={previewError} />;
      default:
        return null;
    }
  };

  return (
    <div className="editor-panel">
      <div className="editor-panel-header">
        <Select
          size="small"
          variant="borderless"
          value={contentType}
          onChange={onContentTypeChange}
          options={OPTIONS}
          className="editor-panel-select"
          popupMatchSelectWidth={false}
        />
      </div>
      <div className="editor-panel-body">
        {renderContent()}
      </div>
    </div>
  );
};

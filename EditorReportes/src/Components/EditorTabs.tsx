import { Tabs } from "antd";
import { EditorHtmlComponent } from "./EditorHtmlComponent";
import { EditorCssComponent } from "./EditorCssComponent";
import { EditorJsonComponent } from "./EditorJsonComponent";
import { EditorSectionComponent } from "./EditorSectionComponent";
import PrintSettingsPanel from "./PageConfiguration/PrintSettingsPanel";
import type { IDocument } from "../interfaces/IGeneric";
import { VistaPreviaComponent } from "./VistaPreviaComponent";

interface Props {
  documentState: IDocument;
  updateDocumentState: (updates: Partial<IDocument>) => void;
  mode: 'full' | 'split';
  height?: string;
  readOnly?: boolean;
  onAttemptEditLocked?: () => void;
  previewHtml?: string;
  previewError?: string | null;
}

export const EditorTabs = ({ 
  documentState, 
  updateDocumentState, 
  mode, 
  height = 'calc(100vh - 170px)', 
  readOnly = false, 
  onAttemptEditLocked,
  previewHtml,
  previewError }: Props) => {


  const commonTabs = [
    {
      label: "HTML",
      key: "html",
      children: (
        <div style={{ height }}>
          <EditorHtmlComponent
            htmlCodeprop={documentState.html}
            setHtmlCodeProp={(html:string) => updateDocumentState({ html })}
            jsonStringProp={documentState.sampleData}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked ?? (() => {})}
          />
        </div>
      )
    },
    {
      label: "CSS",
      key: "css",
      children: (
        <div style={{ height }}>
          <EditorCssComponent
            cssProp={documentState.css}
            setCssProp={(css:string) => updateDocumentState({ css })}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked ?? (() => {})}
          />
        </div>
      )
    },
    {
      label: "JSON",
      key: "json",
      children: (
        <div style={{ height }}>
          <EditorJsonComponent
            jsonProp={JSON.stringify(documentState.sampleData)}
            setJsonProp={(json:string) => updateDocumentState({ sampleData: JSON.parse(json) })}
            readOnly={readOnly}
            onAttemptEditLocked={onAttemptEditLocked ?? (() => {})}
          />
        </div>
      )
    },
    {
      label: "Configuración de página",
      key: "config",
      children: (
        <div style={{ height, overflow: 'auto' }}>
          <PrintSettingsPanel
            config={documentState.printConfig}
            setConfig={(newConfig) => updateDocumentState({ printConfig: newConfig })}
            readOnly={readOnly}
          />
        </div>
      )
    },
    {
      label: "Encabezado",
      key: "header",
      children: (
        <EditorSectionComponent
          html={documentState.htmlHeader || ""}
          css={documentState.cssHeader || ""}
          onChangeHtml={(html) => updateDocumentState({ htmlHeader: html })}
          onChangeCss={(css) => updateDocumentState({ cssHeader: css })}
          jsonStringProp={documentState.sampleData}
          readOnly={readOnly}
          onAttemptEditLocked={onAttemptEditLocked ?? (() => {})}
        />
      )
    },
    {
      label: "Pie de página",
      key: "footer",
      children: (
        <EditorSectionComponent
          html={documentState.htmlFooter || ""}
          css={documentState.cssFooter || ""}
          onChangeHtml={(html) => updateDocumentState({ htmlFooter: html })}
          onChangeCss={(css) => updateDocumentState({ cssFooter: css })}
          jsonStringProp={documentState.sampleData}
          readOnly={readOnly}
          onAttemptEditLocked={onAttemptEditLocked ?? (() => {})}
        />
      )
    }
  ];

  const items = [...commonTabs];

  if (mode === 'full') {
    items.push({
      label: "Vista Previa",
      key: "preview",
      children: (
        <div style={{ height: 'calc(100vh - 150px)' }}>
          <VistaPreviaComponent htmlProp={previewHtml || ''} error={previewError} />
        </div>
      )
    });
  }

  return <Tabs defaultActiveKey="html" items={items} />;
};
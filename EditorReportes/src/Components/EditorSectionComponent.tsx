// componente que se utiliza para el pie de pagina y encabezado


import { Tabs } from "antd";
import { EditorHtmlComponent } from "./EditorHtmlComponent";
import { EditorCssComponent } from "./EditorCssComponent";

type Props = {
  html: string;
  css: string;
  onChangeHtml: (val: string) => void;
  onChangeCss: (val: string) => void;
  jsonStringProp?: Record<string, any>;
  readOnly?: boolean;
  onAttemptEditLocked?: () => void;
};

export const EditorSectionComponent = ({ 
  html, 
  css, 
  onChangeHtml, 
  onChangeCss, 
  jsonStringProp,
  readOnly = false,
  onAttemptEditLocked = () => {}
}: Props) => {

  return (
    <Tabs
      type="card"
      items={[
        {
          label: "HTML",
          key: "html",
          children: (
            <div style={{ height: 'calc(100vh - 300px)' }}>
              <EditorHtmlComponent
                htmlCodeprop={html}
                setHtmlCodeProp={onChangeHtml}
                jsonStringProp={jsonStringProp || {}}
                readOnly={readOnly}
                onAttemptEditLocked={onAttemptEditLocked}
              />
            </div>
          ),
        },
        {
          label: "CSS",
          key: "css",
          children: (
            <div style={{ height: 'calc(100vh - 300px)' }}>
              <EditorCssComponent
                cssProp={css}
                setCssProp={onChangeCss}
                readOnly={readOnly}
                onAttemptEditLocked={onAttemptEditLocked}
              />
            </div>
          ),
        },
      ]}
    />
  );
};
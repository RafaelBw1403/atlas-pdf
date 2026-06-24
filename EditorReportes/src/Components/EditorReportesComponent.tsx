import React, { useState } from 'react'
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json as jsonLang } from "@codemirror/lang-json";



const EditorReportesComponent: React.FC = () => {
    const [htmlCode, setHtmlCode] = useState<string>(
        "<h1>Reporte de Ventas</h1><p>Total: ${total}</p>"
      );
      const [cssCode, setCssCode] = useState<string>(
        "h1 { color: blue; } p { font-size: 16px; }"
      );
      const [jsonData, setJsonData] = useState<string>(
        JSON.stringify({ total: "$500" }, null, 2)
      );
    
      // Función para reemplazar variables dinámicas en el HTML
      const processHtml = (html: string, json: string) => {
        try {
          const data = JSON.parse(json);
          let processedHtml = html;
          Object.keys(data).forEach((key) => {
            const regex = new RegExp(`\\$\\{${key}}`, "g");
            processedHtml = processedHtml.replace(regex, data[key]);
          });
          return processedHtml;
        } catch (error) {
          return "<p style='color: red;'>Error en el JSON</p>";
        }
      };
    
      return (
        <div style={{ display: "flex", height: "100vh" }}>
          {/* Editor de Código HTML, CSS y JSON */}
          <div style={{ width: "50%", padding: "10px", overflowY: "auto" }}>
            <h2>Editor HTML</h2>
            <CodeMirror
              value={htmlCode}
              extensions={[html()]}
              onChange={(value) => setHtmlCode(value)}
              theme="dark"
              basicSetup={{
                lineNumbers: true,
              }}
            />
            <h2>Editor CSS</h2>
            <CodeMirror
              value={cssCode}
              extensions={[css()]}
              onChange={(value) => setCssCode(value)}
              theme="dark"
              basicSetup={{
                lineNumbers: true,
              }}
            />
            <h2>Editor JSON</h2>
            <CodeMirror
              value={jsonData}
              extensions={[jsonLang()]}
              onChange={(value) => setJsonData(value)}
              theme="dark"
              basicSetup={{
                lineNumbers: true,
              }}
            />
          </div>
    
          {/* Vista Previa */}
          <div style={{ width: "50%", padding: "10px" }}>
            <h2>Vista Previa</h2>
            <iframe
              title="preview"
              style={{ width: "100%", height: "90%", border: "1px solid #ddd" }}
              srcDoc={`<style>${cssCode}</style>${processHtml(htmlCode, jsonData)}`}
            ></iframe>
          </div>
        </div>
      );
  };
  
  export default EditorReportesComponent;
  
import { Tabs, Typography } from "antd";
import { MarkdownRenderer } from "./MarkdownRenderer";
import intro from "../../docs/01-introduccion.md?raw";
import htmlDoc from "../../docs/02-html.md?raw";
import cssDoc from "../../docs/03-css.md?raw";
import jsonDoc from "../../docs/04-json-datos.md?raw";
import pageConfig from "../../docs/05-configuracion-pagina.md?raw";
import headers from "../../docs/06-encabezados-pies.md?raw";
import variables from "../../docs/07-handlebars-variables.md?raw";
import conditionals from "../../docs/08-handlebars-condicionales.md?raw";
import loops from "../../docs/09-handlebars-ciclos.md?raw";
import helpers from "../../docs/10-handlebars-helpers.md?raw";
import examples from "../../docs/11-ejemplos-completos.md?raw";
import apiConceptos from "../../docs/12-api-conceptos.md?raw";
import apiEndpoints from "../../docs/13-api-endpoints.md?raw";

const { Title } = Typography;

const tabItems = [
  { label: "Introducción", key: "intro", content: intro },
  { label: "HTML", key: "html", content: htmlDoc },
  { label: "CSS", key: "css", content: cssDoc },
  { label: "JSON / Datos", key: "json", content: jsonDoc },
  { label: "Config. Página", key: "config", content: pageConfig },
  { label: "Encabezados y Pies", key: "headers", content: headers },
  { label: "Variables", key: "vars", content: variables },
  { label: "Condicionales", key: "conds", content: conditionals },
  { label: "Ciclos (#each)", key: "loops", content: loops },
  { label: "Helpers", key: "helpers", content: helpers },
  { label: "Ejemplos", key: "examples", content: examples },
  { label: "API Conceptos", key: "api-conceptos", content: apiConceptos },
  { label: "API Llamadas", key: "api-endpoints", content: apiEndpoints },
];

export const DocumentationPage = () => {
  return (
    <div style={{ padding: "24px", height: "calc(100vh - 40px)", display: "flex", flexDirection: "column" }}>
      <Title level={3} style={{ margin: "0 0 16px" }}>
        Documentación del Editor de Reportes
      </Title>
      <Tabs
        tabPosition="left"
        className="scoped-tabs studio-tabs"
        style={{ flex: 1 }}
        items={tabItems.map(({ label, key, content }) => ({
          label,
          key,
          children: (
            <div style={{ paddingRight: "20px", overflow: "auto" }}>
              <MarkdownRenderer content={content} />
            </div>
          ),
        }))}
      />
    </div>
  );
};

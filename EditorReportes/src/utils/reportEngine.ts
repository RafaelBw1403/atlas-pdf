import Handlebars from "handlebars";
import { setupHandlebarsHelpers } from "./handlebarsHelpers";

setupHandlebarsHelpers();

interface ReportParts {
  html: string;
  css: string;
  headerHtml?: string;
  headerCss?: string;
  footerHtml?: string;
  footerCss?: string;
  data: any;
}

export interface CompileErrorDetail {
  part: string;
  message: string;
  template: string;
}

export interface GenerateFinalHtmlResult {
  html: string;
  error: string | null;
  errors: CompileErrorDetail[];
}

const dataKeysSummary = (data: any): string => {
  if (!data || typeof data !== 'object') return 'N/A';
  return Object.keys(data).join(', ');
};

export const generateFinalHtml = ({
  html,
  css,
  headerHtml,
  headerCss,
  footerHtml,
  footerCss,
  data
}: ReportParts): GenerateFinalHtmlResult => {

  const errors: CompileErrorDetail[] = [];

  const compile = (template: string = "", part: string = "body"): string => {
    try {
      return Handlebars.compile(template)(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);

      errors.push({ part, message, template });

      console.group(`❌ Error Handlebars (${part})`);
      console.error('Error:', e);
      console.log('Template completo:', template);
      console.log('Data keys:', dataKeysSummary(data));
      console.log('Data:', JSON.stringify(data, null, 2));
      console.groupEnd();

      return template;
    }
  };

  const processedBody = compile(html, "body");
  const processedHeader = compile(headerHtml || "", "header");
  const processedFooter = compile(footerHtml || "", "footer");

  const error = errors.length > 0
    ? errors.map(e => `[${e.part}] ${e.message}`).join(" | ")
    : null;

  const result = `
    <html>
      <head>
        <style>
          ${css}
          ${headerCss || ""}
          ${footerCss || ""}
          body { background: #f0f0f0; margin: 0; display: flex; flex-direction: column; align-items: center; }
          .paper { background: white; width: 100%; box-sizing: border-box; }
        </style>
      </head>
      <body>
        <header id="report-header">${processedHeader}</header>
        <main class="paper">${processedBody}</main>
        <footer id="report-footer">${processedFooter}</footer>
      </body>
    </html>
  `;

  return { html: result, error, errors };
};
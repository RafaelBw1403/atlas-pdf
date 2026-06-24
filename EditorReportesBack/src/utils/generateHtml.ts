// generateHtml.ts
import Handlebars from 'handlebars';
import { setupHandlebarsHelpers } from '../helpers/handlebars.helpers';
import { SecurityService } from './security';

export interface GenerateHtmlOptions {
  html: string;
  css: string;
  json: Record<string, any>;
}

export const generateHtml = ({ html, css, json }: GenerateHtmlOptions): string => {
  try {

    //Validar entradas
    SecurityService.validateJsonData(json);

    //Configurar los helpers de Handlebars
    setupHandlebarsHelpers();

    //Preparar los datos JSON (añadir campos calculados)
    const preparedData = prepareData(json);

    //Compilar y renderizar el template ANTES de sanitizar
    //para no romper expresiones {{...}} dentro de atributos HTML
    const template = Handlebars.compile(html);
    const renderedHtml = template(preparedData);

    //Combinar HTML renderizado con CSS
    const fullHtml = combineHtmlWithCss(renderedHtml, css);

    //Sanitizar el HTML final (ya sin {{}} de Handlebars)
    const cleanHtml = SecurityService.sanitizeContent(fullHtml);

    return cleanHtml;
  } catch (error) {
    console.error('❌ Error generando HTML:', error);
    throw new Error(`Error al generar HTML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

const prepareData = (jsonData: Record<string, any>): Record<string, any> => {
  const data = { ...jsonData };

  // Calcular taxRatePercentage si existe taxRate
  if (data.taxRate !== undefined) {
    data.taxRatePercentage = data.taxRate * 100;
  }

  // Calcular lineTotal para cada item si no existe
  if (data.items && Array.isArray(data.items)) {
    data.items = data.items.map((item: any) => ({
      ...item,
      lineTotal: item.lineTotal || (item.quantity * item.unitPrice)
    }));
  }

  // Formatear campos monetarios si se necesita
  if (!data.currencyFormat) {
    data.currencyFormat = (amount: number) => 
      new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: data.currencyCode || 'MXN'
      }).format(amount || 0);
  }

  return data;
};

const resolveCssVariables = (css: string): string => {
  const variables: Record<string, string> = {};

  const rootRegex = /:root\s*\{([^}]*)\}/gi;
  let rootMatch;
  while ((rootMatch = rootRegex.exec(css)) !== null) {
    const rootBody = rootMatch[1];
    if (!rootBody) continue;
    const declRegex = /(--[\w-]+)\s*:\s*([^;]+?)\s*(?:!important)?\s*;/gi;
    let declMatch;
    while ((declMatch = declRegex.exec(rootBody)) !== null) {
      const name = declMatch[1];
      const value = declMatch[2];
      if (name && value) {
        variables[name] = value.trim();
      }
    }
  }

  if (Object.keys(variables).length === 0) return css;

  let changed = true;
  while (changed) {
    changed = false;
    for (const name of Object.keys(variables)) {
      const val = variables[name]!;
      const newVal = val.replace(/var\((--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, vn: string, fb?: string) => {
        if (vn in variables) return variables[vn]!;
        return fb !== undefined ? fb.trim() : `var(${vn})`;
      });
      if (newVal !== val) {
        variables[name] = newVal;
        changed = true;
      }
    }
  }

  let result = css;
  let iterations = 0;
  while (result.includes('var(') && iterations < 100) {
    iterations++;
    result = result.replace(/var\((--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, name: string, fallback?: string) => {
      if (name in variables) return variables[name]!;
      return fallback !== undefined ? fallback.trim() : `var(${name})`;
    });
  }

  return result;
};

const combineHtmlWithCss = (html: string, css: string): string => {
  const resolvedCss = resolveCssVariables(css);

  const allStyles = resolvedCss;

  // Buscar la posición de </head> o <head> en el HTML
  const headEndIndex = html.indexOf('</head>');
  
  if (headEndIndex !== -1) {
    // Insertar charset y CSS antes del cierre de </head>
    return html.slice(0, headEndIndex) + 
           `<meta charset="UTF-8">\n  <style>${allStyles}</style>` + 
           html.slice(headEndIndex);
  } else {
    // Si no hay <head>, crear uno básico
    const htmlStartIndex = html.indexOf('<html');
    if (htmlStartIndex !== -1) {
      const headStartIndex = html.indexOf('>', htmlStartIndex) + 1;
      return html.slice(0, headStartIndex) + 
             `<head>\n  <meta charset="UTF-8">\n  <style>${allStyles}</style>\n</head>` + 
             html.slice(headStartIndex);
    } else {
      // Si no hay estructura HTML, envolver en HTML básico
      return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${allStyles}</style>
</head>
<body>
  ${html}
</body>
</html>`;
    }
  }
};
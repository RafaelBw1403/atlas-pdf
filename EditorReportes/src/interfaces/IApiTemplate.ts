// interfaces/IApiTemplate.ts

/**
 * Interfaz que representa la estructura de datos que viene de la API GraphQL
 * Corresponde al fragmento DocumentFields on Template
 */
export interface IApiTemplate {
  // Campos básicos
  id: string;
  name: string;
  html: string;
  css: string;
  
  // Header y Footer (nombres exactos del fragmento)
  htmlHeader?: string | null;
  htmlFooter?: string | null;
  cssHeader?: string | null;
  cssFooter?: string | null;
  
  // Configuración de página (con estructura anidada)
  pageConfig?: {
    format?: string | null;
    height?: number | null;
    landscape?: boolean | null;
    margin?: {
      top?: number | null;
      right?: number | null;
      bottom?: number | null;
      left?: number | null;
    } | null;
    unit?: string | null;
    width?: number | null;
  } | null;
  
  // Datos JSON (vienen como strings)
  jsonSchema?: string | null;
  sampleData?: string | null;
  
  // Metadatos
  owner?: string | null;
  folderId?: string | null;
  status?: string | null; // 'draft' | 'published' | 'unpublished' | 'archived' en la práctica
  tags?: string[] | null;
  
  // Fechas (vienen como strings ISO)
  createdAt?: string | null;
  updatedAt?: string | null;
  userCreated?: string | null;
  userUpdated?: string | null;
}


// También puedes crear tipos parciales para las respuestas de GraphQL
// export type IApiTemplateResponse = {
//   [K in keyof IApiTemplateStrict]: IApiTemplateStrict[K];
// };

// Si quieres el tipo exacto de pageConfig por separado
export interface IApiPageConfig {
  format: string | null;
  height: number | null;
  landscape: boolean | null;
  margin: {
    top: number | null;
    right: number | null;
    bottom: number | null;
    left: number | null;
  } | null;
  unit: string | null;
  width: number | null;
}

// Versión simplificada con tipos más flexibles
export interface IApiTemplateSimple {
  id: string;
  name: string;
  html: string;
  css: string;
  htmlHeader?: string | null;
  htmlFooter?: string | null;
  cssHeader?: string | null;
  cssFooter?: string | null;
  pageConfig?: {
    format?: string | null;
    height?: number | null;
    landscape?: boolean | null;
    margin?: {
      top?: number | null;
      right?: number | null;
      bottom?: number | null;
      left?: number | null;
    };
    unit?: string | null;
    width?: number | null;
  };
  jsonSchema?: string | null;
  sampleData?: string | null;
  owner?: string | null;
  folderId?: string | null;
  status?: string | null;
  tags?: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
  userCreated?: string | null;
  userUpdated?: string | null;
}
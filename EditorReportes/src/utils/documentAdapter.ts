import type { IDocument } from "../interfaces/IGeneric";
import { initDocument } from "../store/initOrganization";

export const adaptApiToDocument = (apiData: any): IDocument => {
  if (!apiData) return initDocument;

  // Si no hay pageConfig, usamos initDocument
  if (!apiData.pageConfig) {
    return {
      ...initDocument,
      ...apiData,
      sampleData: typeof apiData.sampleData === 'string' 
        ? JSON.parse(apiData.sampleData) 
        : apiData.sampleData || {},
    };
  }

  // Mapeo directo de pageConfig a printConfig
  return {
    ...initDocument,
    id: apiData.id || '',
    name: apiData.name || '',
    html: apiData.html || '',
    css: apiData.css || '',
    htmlHeader: apiData.htmlHeader || '',
    cssHeader: apiData.cssHeader || '',
    htmlFooter: apiData.htmlFooter || '',
    cssFooter: apiData.cssFooter || '',
    
    // La única transformación necesaria
    printConfig: {
      layout: {
        format: apiData.pageConfig.format || initDocument.printConfig.layout.format,
        orientation: apiData.pageConfig.landscape ?? initDocument.printConfig.layout.orientation,
        width: apiData.pageConfig.width ?? initDocument.printConfig.layout.width,
        height: apiData.pageConfig.height ?? initDocument.printConfig.layout.height,
        unit: apiData.pageConfig.unit || initDocument.printConfig.layout.unit,
      },
      margin: {
        top: typeof apiData.pageConfig.margin?.top === 'string' ? parseFloat(apiData.pageConfig.margin.top) : (apiData.pageConfig.margin?.top ?? initDocument.printConfig.margin.top),
        right: typeof apiData.pageConfig.margin?.right === 'string' ? parseFloat(apiData.pageConfig.margin.right) : (apiData.pageConfig.margin?.right ?? initDocument.printConfig.margin.right),
        bottom: typeof apiData.pageConfig.margin?.bottom === 'string' ? parseFloat(apiData.pageConfig.margin.bottom) : (apiData.pageConfig.margin?.bottom ?? initDocument.printConfig.margin.bottom),
        left: typeof apiData.pageConfig.margin?.left === 'string' ? parseFloat(apiData.pageConfig.margin.left) : (apiData.pageConfig.margin?.left ?? initDocument.printConfig.margin.left),
      },
      options: initDocument.printConfig.options,
      headerHeight: apiData.pageConfig.headerHeight ?? initDocument.printConfig.headerHeight,
      footerHeight: apiData.pageConfig.footerHeight ?? initDocument.printConfig.footerHeight,
    },
    
    sampleData: typeof apiData.sampleData === 'string' 
      ? JSON.parse(apiData.sampleData) 
      : apiData.sampleData || {},
    
    folderId: apiData.folderId || null,
    tags: Array.isArray(apiData.tags) ? apiData.tags : [],
    owner: apiData.owner || '',
    createdAt: apiData.createdAt ? new Date(apiData.createdAt) : new Date(),
    updatedAt: apiData.updatedAt ? new Date(apiData.updatedAt) : new Date(),
    userCreated: apiData.userCreated || '',
    userUpdated: apiData.userUpdated || '',

    documentGroupId: apiData.documentGroupId || '',
    stage: apiData.stage || 'draft',
    version_tag: apiData.version_tag || '',
    comment: apiData.comment || '',

  };
};

export const adaptDocumentToApi = (document: IDocument) => {
  return {
    id: document.id,
    name: document.name,
    html: document.html,
    css: document.css,
    htmlHeader: document.htmlHeader,
    cssHeader: document.cssHeader,
    htmlFooter: document.htmlFooter,
    cssFooter: document.cssFooter,
    
    // La única transformación necesaria
    pageConfig: {
      format: document.printConfig.layout.format,
      landscape: document.printConfig.layout.orientation,
      width: document.printConfig.layout.width,
      height: document.printConfig.layout.height,
      unit: document.printConfig.layout.unit,
      margin: document.printConfig.margin,
      headerHeight: document.printConfig.headerHeight,
      footerHeight: document.printConfig.footerHeight,
    },
    
    jsonSchema: JSON.stringify(document.jsonSchema || {}),
    sampleData: JSON.stringify(document.sampleData || {}),
    folderId: document.folderId,
    stage: document.stage,
    tags: document.tags,
    owner: document.owner,
    createdAt: document.createdAt?.toISOString(),
    updatedAt: document.updatedAt?.toISOString(),
    userCreated: document.userCreated,
    userUpdated: document.userUpdated,
  };
};
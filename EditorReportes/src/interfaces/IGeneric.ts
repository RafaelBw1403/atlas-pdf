import type { IPrintConfig } from "./IPrintSettings";



export interface IDocument {
  id: string;
  name: string;
  html: string;
  css: string;
  jsonSchema?: Record<string, any>;
  sampleData: Record<string, any>;
  printConfig: IPrintConfig;

  htmlHeader?: string;
  cssHeader?: string;
  htmlFooter?: string;
  cssFooter?: string;
  
  folderId?: string | undefined | null;
  tags?: string[];
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userCreated?: string;
  userUpdated?: string;

  // Sistema de Versiones
  documentGroupId: string;
  stage: 'draft' | 'qa' | 'production' | 'historical';
  version_tag?: string;
  comment?: string;
}

export interface IFolder {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  // idDocuments: string[];
  icon?: string;
  color?: string;
  isShared?: boolean;
  sharedWith?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'date' | 'type';
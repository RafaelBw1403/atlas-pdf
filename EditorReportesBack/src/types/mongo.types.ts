import { Document, ObjectId } from 'mongoose';

export interface ITemplate extends Document {
    // MVP Core
    name: string;
    html: string;
    css: string;

    // Secciones adicionales añadidas en el modelo
    htmlHeader: string;
    cssHeader: string;
    htmlFooter: string;
    cssFooter: string;

    pageConfig: {
        format: string;
        unit: string;
        width: string | number;
        height: string | number;
        landscape: boolean;
        margin: {
            top: string;
            right: string;
            bottom: string;
            left: string;
        };
        headerHeight?: number;
        footerHeight?: number;
    };

    jsonSchema: Record<string, any>;  // Estructura esperada
    sampleData: Record<string, any>;   // Datos de prueba
    owner: ObjectId;                   // Relación con usuario
    folderId?: ObjectId;
    
    // Sistema de Versiones
    documentGroupId: string;
    stage: 'draft' | 'qa' | 'production' | 'historical';
    version_tag?: string;
    comment?: string;
    
    // Preparado para expansión
    projectId?: ObjectId;
    access: {
        isPublic: boolean;
        sharedWith: ObjectId[];
    };
    version: number;
    tags: string[];
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

export interface IFolder extends Document {
    name: string;
    description?: string;
    owner: ObjectId;
    parentId?: ObjectId;  // Para estructura de árbol
    templateIds: ObjectId[];
    icon?: string;
    color?: string;
    isShared: boolean;
    sharedWith: ObjectId[];
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
}
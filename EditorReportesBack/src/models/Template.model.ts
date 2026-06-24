import { Schema, model } from 'mongoose';
import { ITemplate } from '../types/mongo.types';

const TemplateSchema = new Schema<ITemplate>({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    
    html: {
        type: String,
        required: [true, 'HTML content is required'],
    },
    
    css: {
        type: String,
        default: '',
    },
    
    htmlHeader: {
        type: String,
        default: '',
    },
    
    cssHeader: {
        type: String,
        default: '',
    },
    
    htmlFooter: {
        type: String,
        default: '',
    },
    
    cssFooter: {
        type: String,
        default: '',
    },
    
    jsonSchema: {
        type: Schema.Types.Mixed,
        required: [true, 'JSON schema is required'],
    },
    
    sampleData: {
        type: Schema.Types.Mixed,
        required: [true, 'Sample data is required'],
    },

    // Configuración de Página (WeasyPrint)
    pageConfig: {
        format: { type: String, default: 'A4' },
        unit: { type: String, default: 'mm' },
        width: { type: Schema.Types.Mixed },
        height: { type: Schema.Types.Mixed },
        landscape: { type: Boolean, default: false },
        margin: {
            top: { type: String, default: '10mm' },
            right: { type: String, default: '10mm' },
            bottom: { type: String, default: '10mm' },
            left: { type: String, default: '10mm' }
        },
        headerHeight: { type: Number, default: 0 },
        footerHeight: { type: Number, default: 0 }
    },
    
    owner: {
        type: String,
        required: [true, 'Owner is required'],
    },
    
    folderId: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    
    // PREPARADO PARA EXPANSIÓN
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    
    access: {
        isPublic: {
            type: Boolean,
            default: false
        },
        sharedWith: [{
            type: String
        }]
    },
    
    stage: {
        type: String,
        enum: ['draft', 'qa', 'production', 'historical'],
        default: 'draft',
        required: true
    },
    
    documentGroupId: {
        type: String,
        required: true,
        index: true
    },

    version: {
        type: Number,
        default: 1
    },
    
    tags: [{
        type: String,
        trim: true
    }],

    // Sistema de Versiones
    version_tag: {
        type: String,
        default: ''
    },
    comment: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,  // Crea createdAt y updatedAt automáticamente
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para mejor performance
TemplateSchema.index({ owner: 1, createdAt: -1 });
TemplateSchema.index({ folderId: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ stage: 1 });
TemplateSchema.index({ documentGroupId: 1, stage: 1 });

// Virtual para contar usos (para el futuro)
TemplateSchema.virtual('usageCount').get(function() {
    // Esto se puede implementar después con un contador
    return 0;
});

export const Template = model<ITemplate>('Template', TemplateSchema);
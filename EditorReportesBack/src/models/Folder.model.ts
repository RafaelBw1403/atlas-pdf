import { Schema, model } from 'mongoose';
import { IFolder } from '../types/mongo.types';

const FolderSchema = new Schema<IFolder>({
    name: {
        type: String,
        required: [true, 'Folder name is required'],
        trim: true,
        maxlength: [50, 'Folder name cannot exceed 50 characters']
    },

    description: {
        type: String,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },

    owner: {
        type: String,
        required: [true, 'Owner is required'],
    },

    // parentId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Folder',
    //     default: null
    // },

    // templateIds: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Template'
    // }],

    icon: {
        type: String,
        default: '📁'
    },

    color: {
        type: String,
        default: '#3B82F6'
    },

    // isShared: {
    //     type: Boolean,
    //     default: false
    // },

    // sharedWith: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // }]
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

// Índices
FolderSchema.index({ owner: 1, parentId: 1 });
FolderSchema.index({ owner: 1, name: 1 });

// Virtual para templates count
// FolderSchema.virtual('templateCount').get(function () {
//     return this.templateIds.length;
// });

// Virtual para subfolders (para el futuro)
// FolderSchema.virtual('subfolders', {
//     ref: 'Folder',
//     localField: '_id',
//     foreignField: 'parentId'
// });

export const Folder = model<IFolder>('Folder', FolderSchema);
import { gql } from '@apollo/client';
import type { IFolder } from '../../interfaces/IGeneric';
import type { IDocument } from '../../interfaces/IGeneric';
import { DOCUMENT_FIELDS_FRAGMENT, FOLDER_FIELDS_FRAGMENT } from './fragments';


export const folderFieldsInput: (keyof IFolder)[] = ['name', 'description', 'owner', 'icon', 'color'];
export const documentFieldsInput: (keyof IDocument)[] = ['name', 'html', 'css', 'sampleData'];


export const GET_ALLDOCUMENTS = gql`
    query AllTemplates {
        allTemplates {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;

export const GET_DOCUMENT_BY_USER = gql`
    query TemplatesByUser {
        templatesByUser {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;

export const CREATE_DOCUMENT = gql`
    mutation createTemplate($input: TemplateInput!) {
        createTemplate(input: $input) {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;

export const UPDATE_DOCUMENT = gql`
    mutation UpdateDocument($id: ID!, $input: TemplateUpdateInput!) {
        updateTemplate(id: $id, input: $input) {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;

export const DELETE_DOCUMENT = gql`
    mutation DeleteDocument($id: ID!) {
        deleteTemplate(id: $id)
    }
`;

export const MOVE_DOCUMENT_TO_FOLDER = gql`
    mutation MoveTemplate($templateId: ID!, $folderId: ID) {
        moveTemplate(templateId: $templateId, folderId: $folderId)
    }
`;

export const GET_FOLDERS = gql`
    query Folders {
        folders {
            ...FolderFields
        } 
    }
    ${FOLDER_FIELDS_FRAGMENT}
`;

export const GET_FOLDERS_BY_USER = gql`
    query FoldersByUser {
        foldersByUser {
            ...FolderFields
        } 
    }
    ${FOLDER_FIELDS_FRAGMENT}
`;

export const CREATE_FOLDER = gql`
    mutation CreateFolder($input: FolderInput! ) {
        createFolder(input: $input) {
            ...FolderFields
        }
    }
    ${FOLDER_FIELDS_FRAGMENT}
`;

export const UPDATE_FOLDER = gql`
    mutation UpdateFolder($id: ID!, $input: FolderInput!) {
        updateFolder(id: $id, input: $input) {
            ...FolderFields
        }
    }
    ${FOLDER_FIELDS_FRAGMENT}
`;

export const DELETE_FOLDER = gql`
    mutation DeleteFolder($id: ID!) {
        deleteFolder(id: $id)
    }
`;

// ── Sistema de Versiones ─────────────────────────────────────────────────────

export const GET_TEMPLATE_VERSIONS = gql`
    query TemplateVersions($documentGroupId: ID!) {
        templateVersions(documentGroupId: $documentGroupId) {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;

export const PUBLISH_TEMPLATE = gql`
    mutation PublishTemplate($documentGroupId: ID!, $input: PublishTemplateInput!) {
        publishTemplate(documentGroupId: $documentGroupId, input: $input) {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;

export const CREATE_DRAFT = gql`
    mutation CreateDraft($templateId: ID!) {
        createDraft(templateId: $templateId) {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;

export const DELETE_TEMPLATE_VERSION = gql`
    mutation DeleteTemplateVersion($id: ID!) {
        deleteTemplateVersion(id: $id)
    }
`;

export const PUBLISH_TO_QA = gql`
    mutation PublishToQA($templateId: ID!) {
        publishToQA(templateId: $templateId) {
            ...DocumentFields
        }
    }
    ${DOCUMENT_FIELDS_FRAGMENT}
`;
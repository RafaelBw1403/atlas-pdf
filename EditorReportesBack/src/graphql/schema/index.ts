import { readFileSync } from 'fs';
import path from 'path';
import { gql } from 'graphql-tag';

// Función helper para cargar archivos .graphql
const loadSchema = (filePath: string) => {
    return readFileSync(path.join(__dirname, filePath), 'utf-8');
};

// Combinar todos los schemas
export const typeDefs = gql`
    ${loadSchema('base.graphql')}
    ${loadSchema('user.graphql')}
    ${loadSchema('template.graphql')}
    ${loadSchema('folder.graphql')}
    ${loadSchema('apiKey.graphql')}
`;
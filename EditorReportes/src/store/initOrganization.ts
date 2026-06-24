import { v4 as uuidv4 } from "uuid";
import type { IDocument } from "../interfaces/IGeneric";

export const initDocument: IDocument = {
    id: uuidv4(),
    documentGroupId: uuidv4(),
    stage: 'draft',
    name: "Nuevo Documento",
    html: "",
    css: "",
    sampleData: {},
    htmlHeader: "",
    cssHeader: "",
    htmlFooter: "",
    cssFooter: "",
    printConfig: {
        layout: { format: 'A4', orientation: false, width: 210, height: 297, unit: 'mm' },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        options: { scale: 1, printBackground: true, pageNumbers: true },
        headerHeight: 0,
        footerHeight: 0
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    userCreated: "admin",
    userUpdated: "admin"
};
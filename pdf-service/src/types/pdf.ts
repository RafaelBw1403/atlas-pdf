export const PaperFormats = [
    "Letter", "Legal", "Tabloid", "Ledger",
    "A0", "A1", "A2", "A3", "A4", "A5", "A6",
] as const;


export type PaperFormat = typeof PaperFormats[number];

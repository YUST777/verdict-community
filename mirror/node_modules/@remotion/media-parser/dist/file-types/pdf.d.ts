export type PdfType = {
    type: 'pdf';
};
export declare const isPdf: (data: Uint8Array) => PdfType | null;

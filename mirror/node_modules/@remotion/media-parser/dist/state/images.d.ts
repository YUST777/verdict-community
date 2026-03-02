export type MediaParserEmbeddedImage = {
    description: string | null;
    mimeType: string | null;
    data: Uint8Array;
};
export declare const imagesState: () => {
    images: MediaParserEmbeddedImage[];
    addImage: (image: MediaParserEmbeddedImage) => void;
};

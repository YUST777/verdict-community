import type { MediaParserDimensions } from './get-dimensions';
export type ImageType = 'png' | 'jpeg' | 'bmp' | 'webp' | 'gif';
export declare class IsAnImageError extends Error {
    imageType: ImageType;
    dimensions: MediaParserDimensions | null;
    mimeType: string | null;
    sizeInBytes: number | null;
    fileName: string | null;
    constructor({ dimensions, imageType, message, mimeType, sizeInBytes, fileName, }: {
        message: string;
        imageType: ImageType;
        dimensions: MediaParserDimensions | null;
        mimeType: string | null;
        sizeInBytes: number | null;
        fileName: string | null;
    });
}
export declare class IsAPdfError extends Error {
    mimeType: string | null;
    sizeInBytes: number | null;
    fileName: string | null;
    constructor({ message, mimeType, sizeInBytes, fileName, }: {
        message: string;
        mimeType: string | null;
        sizeInBytes: number | null;
        fileName: string | null;
    });
}
export declare class IsAnUnsupportedFileTypeError extends Error {
    mimeType: string | null;
    sizeInBytes: number | null;
    fileName: string | null;
    constructor({ message, mimeType, sizeInBytes, fileName, }: {
        message: string;
        mimeType: string | null;
        sizeInBytes: number | null;
        fileName: string | null;
    });
}
export declare class MediaParserAbortError extends Error {
    constructor(message: string);
}
export declare const hasBeenAborted: (error: unknown) => error is MediaParserAbortError;

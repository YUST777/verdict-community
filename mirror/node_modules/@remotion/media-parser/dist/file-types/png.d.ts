import type { MediaParserDimensions } from '../get-dimensions';
export declare function getPngDimensions(pngData: Uint8Array): {
    width: number;
    height: number;
} | null;
export declare const isPng: (data: Uint8Array) => PngType | null;
export type PngType = {
    type: 'png';
    dimensions: MediaParserDimensions | null;
};

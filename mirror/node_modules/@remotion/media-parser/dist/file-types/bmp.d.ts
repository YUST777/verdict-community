import type { MediaParserDimensions } from '../get-dimensions';
export declare const isBmp: (data: Uint8Array) => BmpType | null;
export type BmpType = {
    type: 'bmp';
    dimensions: MediaParserDimensions | null;
};

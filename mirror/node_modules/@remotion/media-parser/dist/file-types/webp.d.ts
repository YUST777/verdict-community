import type { MediaParserDimensions } from '../get-dimensions';
export declare const isWebp: (data: Uint8Array) => WebpType | null;
export type WebpType = {
    type: 'webp';
    dimensions: MediaParserDimensions | null;
};

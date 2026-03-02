export declare function getJpegDimensions(data: Uint8Array): {
    width: number;
    height: number;
} | null;
export declare const isJpeg: (data: Uint8Array) => JpegType | null;
export type JpegType = {
    type: 'jpeg';
    dimensions: {
        width: number;
        height: number;
    } | null;
};

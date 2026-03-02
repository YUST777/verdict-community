export type XingData = {
    sampleRate: number;
    numberOfFrames: number | null;
    fileSize: number | null;
    tableOfContents: number[] | null;
    vbrScale: number | null;
};
export declare const parseXing: (data: Uint8Array) => XingData;
export declare const getSeekPointInBytes: ({ fileSize, percentBetween0And100, tableOfContents, }: {
    tableOfContents: number[];
    fileSize: number;
    percentBetween0And100: number;
}) => number;
export declare const getTimeFromPosition: ({ position, fileSize, tableOfContents, durationInSeconds, }: {
    position: number;
    fileSize: number;
    tableOfContents: number[];
    durationInSeconds: number;
}) => number;

export declare const postprocessBytes: ({ bytes, bigEndian, chunkSize, }: {
    bytes: Uint8Array;
    bigEndian: boolean;
    chunkSize: number | null;
}) => Uint8Array<ArrayBufferLike>;

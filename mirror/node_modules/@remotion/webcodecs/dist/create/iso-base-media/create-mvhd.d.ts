export declare const createMvhd: ({ timescale, durationInUnits, rate, volume, nextTrackId, matrix, creationTime, modificationTime, }: {
    timescale: number;
    durationInUnits: number;
    rate: number;
    volume: number;
    nextTrackId: number;
    matrix: number[];
    creationTime: number | null;
    modificationTime: number | null;
}) => Uint8Array<ArrayBufferLike>;

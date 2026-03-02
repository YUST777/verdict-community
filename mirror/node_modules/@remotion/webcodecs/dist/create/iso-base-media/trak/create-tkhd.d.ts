export declare const TKHD_FLAGS: {
    TRACK_ENABLED: number;
    TRACK_IN_MOVIE: number;
    TRACK_IN_PREVIEW: number;
    TRACK_IN_POSTER: number;
};
export declare const createTkhdForAudio: ({ creationTime, modificationTime, flags, trackId, duration, volume, timescale, }: {
    creationTime: number | null;
    modificationTime: number | null;
    flags: number;
    trackId: number;
    duration: number;
    volume: number;
    timescale: number;
}) => Uint8Array<ArrayBufferLike>;
export declare const createTkhdForVideo: ({ creationTime, modificationTime, duration, trackId, volume, matrix, width, height, flags, timescale, }: {
    creationTime: number | null;
    modificationTime: number | null;
    trackId: number;
    duration: number;
    volume: number;
    matrix: number[];
    width: number;
    height: number;
    flags: number;
    timescale: number;
}) => Uint8Array<ArrayBufferLike>;

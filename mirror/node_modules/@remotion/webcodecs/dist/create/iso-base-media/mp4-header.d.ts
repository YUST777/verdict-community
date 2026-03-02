import type { IsoBaseMediaTrackData } from './serialize-track';
export declare const createPaddedMoovAtom: ({ durationInUnits, trackInfo, timescale, expectedDurationInSeconds, logLevel, expectedFrameRate, }: {
    durationInUnits: number;
    trackInfo: IsoBaseMediaTrackData[];
    timescale: number;
    expectedDurationInSeconds: number | null;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    expectedFrameRate: number | null;
}) => Uint8Array<ArrayBufferLike>;

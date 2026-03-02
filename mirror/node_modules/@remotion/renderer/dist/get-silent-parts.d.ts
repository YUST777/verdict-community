import type { GetSilentPartsResponse, SilentPart } from './compositor/payloads';
export type { SilentPart };
export declare const getSilentParts: ({ src, noiseThresholdInDecibels: passedNoiseThresholdInDecibels, minDurationInSeconds: passedMinDuration, logLevel, binariesDirectory, }: {
    src: string;
    minDurationInSeconds?: number | undefined;
    logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
    noiseThresholdInDecibels?: number | undefined;
    binariesDirectory?: string | null | undefined;
}) => Promise<GetSilentPartsResponse>;

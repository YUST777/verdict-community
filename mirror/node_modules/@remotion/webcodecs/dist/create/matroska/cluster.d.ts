import type { Writer } from '@remotion/media-parser';
import { type MediaParserAudioSample, type MediaParserVideoSample } from '@remotion/media-parser';
export declare const timestampToClusterTimestamp: (timestamp: number, timescale: number) => number;
export declare const canFitInCluster: ({ clusterStartTimestamp, chunk, timescale, }: {
    clusterStartTimestamp: number;
    chunk: MediaParserAudioSample | MediaParserVideoSample;
    timescale: number;
}) => boolean;
export declare const makeCluster: ({ writer, clusterStartTimestamp, timescale, logLevel, }: {
    writer: Writer;
    clusterStartTimestamp: number;
    timescale: number;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
}) => Promise<{
    addSample: (chunk: MediaParserAudioSample | MediaParserVideoSample, trackNumber: number) => Promise<{
        timecodeRelativeToCluster: number;
    }>;
    shouldMakeNewCluster: ({ isVideo, chunk, newT, }: {
        newT: number;
        chunk: MediaParserAudioSample | MediaParserVideoSample;
        isVideo: boolean;
    }) => boolean;
    startTimestamp: number;
}>;

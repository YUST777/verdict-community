import type { M3uChunk } from '../get-chunks';
export declare const getChunkToSeekTo: ({ chunks, seekToSecondsToProcess, }: {
    chunks: M3uChunk[];
    seekToSecondsToProcess: number;
}) => number;

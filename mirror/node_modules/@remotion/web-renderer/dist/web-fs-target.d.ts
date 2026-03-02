import type { StreamTargetChunk } from 'mediabunny';
export declare const cleanupStaleOpfsFiles: () => Promise<void>;
export declare const createWebFsTarget: () => Promise<{
    stream: WritableStream<StreamTargetChunk>;
    getBlob: () => Promise<File>;
    close: () => Promise<void>;
}>;

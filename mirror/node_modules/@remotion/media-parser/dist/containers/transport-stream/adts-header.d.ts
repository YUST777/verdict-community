export declare const readAdtsHeader: (buffer: Uint8Array) => {
    frameLength: number;
    codecPrivate: Uint8Array<ArrayBufferLike>;
    channelConfiguration: number;
    sampleRate: number;
    audioObjectType: number;
} | null;

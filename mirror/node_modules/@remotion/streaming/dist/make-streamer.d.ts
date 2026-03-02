export declare const streamingKey = "remotion_buffer:";
export declare const makeStreamer: (onMessage: (statusType: "error" | "success", nonce: string, data: Uint8Array<ArrayBufferLike>) => void) => {
    onData: (data: Uint8Array<ArrayBufferLike>) => void;
    getOutputBuffer: () => Uint8Array<ArrayBuffer>;
    clear: () => void;
};
export declare const makeStreamPayloadMessage: ({ status, body, nonce, }: {
    nonce: string;
    status: 0 | 1;
    body: Uint8Array<ArrayBufferLike>;
}) => Uint8Array<ArrayBufferLike>;

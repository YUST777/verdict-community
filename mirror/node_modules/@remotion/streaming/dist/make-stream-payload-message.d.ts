export declare const magicWordStr = "remotion_buffer:";
export declare const makeStreamPayloadMessage: ({ status, body, nonce, }: {
    nonce: string;
    status: 0 | 1;
    body: Uint8Array<ArrayBufferLike>;
}) => Uint8Array<ArrayBufferLike>;

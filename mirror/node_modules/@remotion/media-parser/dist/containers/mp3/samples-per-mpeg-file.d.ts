export declare const getSamplesPerMpegFrame: ({ mpegVersion, layer, }: {
    mpegVersion: 1 | 2;
    layer: number;
}) => 384 | 1152 | 576;

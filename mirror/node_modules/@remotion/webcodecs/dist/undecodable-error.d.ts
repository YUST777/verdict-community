export declare class VideoUndecodableError extends Error {
    config: VideoDecoderConfig;
    constructor({ message, config }: {
        message: string;
        config: VideoDecoderConfig;
    });
}
export declare class AudioUndecodableError extends Error {
    config: AudioDecoderConfig;
    constructor({ message, config }: {
        message: string;
        config: AudioDecoderConfig;
    });
}

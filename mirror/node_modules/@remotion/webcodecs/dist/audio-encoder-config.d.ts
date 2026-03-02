export declare const getAudioEncoderConfig: (config: AudioEncoderConfig & {
    codec: "aac" | "opus" | "wav";
}) => Promise<AudioEncoderConfig | null>;

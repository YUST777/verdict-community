declare const availableAudioCodecs: readonly ["opus", "aac", "wav"];
export declare const getAvailableAudioCodecs: ({ container, }: {
    container: "mp4" | "wav" | "webm";
}) => ("aac" | "opus" | "wav")[];
export type ConvertMediaAudioCodec = (typeof availableAudioCodecs)[number];
export {};

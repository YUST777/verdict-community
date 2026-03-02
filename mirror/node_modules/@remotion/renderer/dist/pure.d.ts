export declare const NoReactAPIs: {
    getExtensionOfFilename: (filename: string | null) => string | null;
    getFileExtensionFromCodec: <T extends "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav">(codec: T, audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null) => import("./file-extensions").FileExtension;
    validateOutputFilename: <T extends "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav">({ codec, audioCodecSetting, extension, preferLossless, separateAudioTo, }: {
        codec: T;
        audioCodecSetting: "aac" | "mp3" | "opus" | "pcm-16" | null;
        extension: string;
        preferLossless: boolean;
        separateAudioTo: string | null;
    }) => void;
    getFramesToRender: (frameRange: [number, number], everyNthFrame: number) => number[];
    codecSupportsMedia: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => {
        video: boolean;
        audio: boolean;
    };
    isAudioCodec: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null | undefined) => codec is "aac" | "mp3" | "wav";
};

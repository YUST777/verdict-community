export declare const validateOutputFilename: <T extends "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav">({ codec, audioCodecSetting, extension, preferLossless, separateAudioTo, }: {
    codec: T;
    audioCodecSetting: "aac" | "mp3" | "opus" | "pcm-16" | null;
    extension: string;
    preferLossless: boolean;
    separateAudioTo: string | null;
}) => void;

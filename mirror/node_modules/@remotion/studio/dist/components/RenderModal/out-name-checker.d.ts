import type { RenderType } from './RenderModalAdvanced';
export declare const validateOutnameGui: ({ outName, codec, audioCodec, renderMode, stillImageFormat, separateAudioTo, }: {
    outName: string;
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    audioCodec: "aac" | "mp3" | "opus" | "pcm-16";
    renderMode: RenderType;
    stillImageFormat: "jpeg" | "pdf" | "png" | "webp" | null;
    separateAudioTo: string | null;
}) => {
    valid: true;
} | {
    valid: false;
    error: Error;
};
export declare const isValidSeparateAudioName: ({ audioCodec, separateAudioTo, }: {
    separateAudioTo: string;
    audioCodec: "aac" | "mp3" | "opus" | "pcm-16";
}) => void;

import type { RenderType } from './RenderModalAdvanced';
export declare const getDefaultCodecs: ({ defaultConfigurationVideoCodec, compositionDefaultVideoCodec, renderType, defaultConfigurationAudioCodec, }: {
    defaultConfigurationVideoCodec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
    defaultConfigurationAudioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null;
    compositionDefaultVideoCodec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
    renderType: RenderType;
}) => {
    initialAudioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null;
    initialVideoCodec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    initialRenderType: RenderType;
    initialVideoCodecForAudioTab: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    initialVideoCodecForVideoTab: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
};

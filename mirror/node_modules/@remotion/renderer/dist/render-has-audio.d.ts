import type { RenderAssetInfo } from './assets/download-map';
export declare const getShouldRenderAudio: ({ codec, assetsInfo, enforceAudioTrack, muted, }: {
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    assetsInfo: RenderAssetInfo | null;
    enforceAudioTrack: boolean;
    muted: boolean;
}) => "maybe" | "no" | "yes";

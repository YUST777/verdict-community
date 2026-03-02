import type { Codec } from '../codec';
export declare const validAudioCodecs: readonly ["pcm-16", "aac", "mp3", "opus"];
export type AudioCodec = (typeof validAudioCodecs)[number];
export declare const supportedAudioCodecs: {
    readonly h264: readonly ["aac", "pcm-16", "mp3"];
    readonly 'h264-mkv': readonly ["pcm-16", "mp3"];
    readonly 'h264-ts': readonly ["pcm-16", "aac"];
    readonly aac: readonly ["aac", "pcm-16"];
    readonly avi: readonly [];
    readonly gif: readonly [];
    readonly h265: readonly ["aac", "pcm-16"];
    readonly mp3: readonly ["mp3", "pcm-16"];
    readonly prores: readonly ["aac", "pcm-16"];
    readonly vp8: readonly ["opus", "pcm-16"];
    readonly vp9: readonly ["opus", "pcm-16"];
    readonly wav: readonly ["pcm-16"];
};
export declare const mapAudioCodecToFfmpegAudioCodecName: (audioCodec: "aac" | "mp3" | "opus" | "pcm-16") => "libfdk_aac" | "libmp3lame" | "libopus" | "pcm_s16le";
export declare const defaultAudioCodecs: {
    [key in Codec]: {
        [_ in 'compressed' | 'lossless']: (typeof supportedAudioCodecs)[key][number] | null;
    };
};
export declare const getExtensionFromAudioCodec: (audioCodec: "aac" | "mp3" | "opus" | "pcm-16") => "aac" | "mp3" | "opus" | "wav";
export declare const resolveAudioCodec: ({ codec, setting, preferLossless, separateAudioTo, }: {
    setting: "aac" | "mp3" | "opus" | "pcm-16" | null;
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    preferLossless: boolean;
    separateAudioTo: string | null;
}) => "aac" | "mp3" | "opus" | "pcm-16" | null;
export declare const getDefaultAudioCodec: ({ codec, preferLossless, }: {
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    preferLossless: boolean;
}) => "aac" | "mp3" | "opus" | "pcm-16" | null;
export declare const audioCodecOption: {
    cliFlag: "audio-codec";
    setConfig: (audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null) => void;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: "aac" | "mp3" | "opus" | "pcm-16";
    } | {
        source: string;
        value: null;
    };
    description: () => string;
    docLink: string;
    name: string;
    ssrName: "audioCodec";
    type: "aac" | "mp3" | "opus" | "pcm-16";
    id: "audio-codec";
};

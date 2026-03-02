import { AudioSampleSource, type Quality } from 'mediabunny';
export declare const createAudioSampleSource: ({ muted, codec, bitrate, }: {
    muted: boolean;
    codec: "aac" | "ac3" | "alaw" | "eac3" | "flac" | "mp3" | "opus" | "pcm-f32" | "pcm-f32be" | "pcm-f64" | "pcm-f64be" | "pcm-s16" | "pcm-s16be" | "pcm-s24" | "pcm-s24be" | "pcm-s32" | "pcm-s32be" | "pcm-s8" | "pcm-u8" | "ulaw" | "vorbis" | null;
    bitrate: number | Quality;
}) => {
    audioSampleSource: AudioSampleSource;
    [Symbol.dispose]: () => void;
} | null;

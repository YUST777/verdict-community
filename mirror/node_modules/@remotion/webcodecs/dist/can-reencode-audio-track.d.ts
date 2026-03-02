import type { MediaParserAudioTrack } from '@remotion/media-parser';
export declare const canReencodeAudioTrack: ({ track, audioCodec, bitrate, sampleRate, }: {
    track: MediaParserAudioTrack;
    audioCodec: "aac" | "opus" | "wav";
    bitrate: number;
    sampleRate: number | null;
}) => Promise<boolean>;

import type { MediaParserAudioCodec, MediaParserVideoCodec } from '@remotion/media-parser';
export declare const isSameVideoCodec: ({ inputVideoCodec, outputCodec, }: {
    inputVideoCodec: MediaParserVideoCodec;
    outputCodec: "h264" | "h265" | "vp8" | "vp9";
}) => boolean;
export declare const isSameAudioCodec: ({ inputAudioCodec, outputCodec, }: {
    inputAudioCodec: MediaParserAudioCodec;
    outputCodec: "aac" | "opus" | "wav";
}) => boolean;

import type { MediaParserAudioCodec, MediaParserContainer } from '@remotion/media-parser';
export declare const canCopyAudioTrack: ({ inputCodec, outputContainer, inputContainer, outputAudioCodec, }: {
    inputCodec: MediaParserAudioCodec;
    outputContainer: "mp4" | "wav" | "webm";
    inputContainer: MediaParserContainer;
    outputAudioCodec: "aac" | "opus" | "wav" | null;
}) => boolean;

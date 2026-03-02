import type { MediaParserContainer, MediaParserVideoTrack } from '@remotion/media-parser';
import type { ResizeOperation } from './resizing/mode';
export declare const canCopyVideoTrack: ({ outputContainer, rotationToApply, inputContainer, resizeOperation, inputTrack, outputVideoCodec, }: {
    inputContainer: MediaParserContainer;
    inputTrack: MediaParserVideoTrack;
    rotationToApply: number;
    outputContainer: "mp4" | "wav" | "webm";
    outputVideoCodec: "h264" | "h265" | "vp8" | "vp9" | null;
    resizeOperation: ResizeOperation | null;
}) => boolean;

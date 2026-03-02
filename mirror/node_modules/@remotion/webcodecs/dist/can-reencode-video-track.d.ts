import type { MediaParserVideoTrack } from '@remotion/media-parser';
import type { ResizeOperation } from './resizing/mode';
export declare const canReencodeVideoTrack: ({ videoCodec, track, resizeOperation, rotate, }: {
    videoCodec: "h264" | "h265" | "vp8" | "vp9";
    track: MediaParserVideoTrack;
    resizeOperation: ResizeOperation | null;
    rotate: number | null;
}) => Promise<boolean>;

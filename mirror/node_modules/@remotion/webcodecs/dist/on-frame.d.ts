import type { MediaParserVideoTrack } from '@remotion/media-parser';
import type { ConvertMediaOnVideoFrame } from './convert-media';
import type { ResizeOperation } from './resizing/mode';
export declare const processFrame: ({ frame: unrotatedFrame, onVideoFrame, track, outputCodec, rotation, resizeOperation, }: {
    frame: VideoFrame;
    onVideoFrame: ConvertMediaOnVideoFrame | null;
    track: MediaParserVideoTrack;
    outputCodec: "h264" | "h265" | "vp8" | "vp9";
    rotation: number;
    resizeOperation: ResizeOperation | null;
}) => Promise<VideoFrame>;

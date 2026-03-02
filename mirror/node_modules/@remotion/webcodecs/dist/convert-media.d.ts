/**
 * Copyright (c) 2025 Remotion AG
 * For licensing, see: https://remotion.dev/docs/webcodecs#license
 */
import type { MediaParserAudioTrack, MediaParserVideoTrack, ParseMediaFields, WriterInterface } from '@remotion/media-parser';
import { type ConvertMediaOnAudioTrackHandler } from './on-audio-track-handler';
import { type ConvertMediaOnVideoTrackHandler } from './on-video-track-handler';
import type { ResizeOperation } from './resizing/mode';
import { type WebCodecsController } from './webcodecs-controller';
export type ConvertMediaProgress = {
    decodedVideoFrames: number;
    decodedAudioFrames: number;
    encodedVideoFrames: number;
    encodedAudioFrames: number;
    bytesWritten: number;
    millisecondsWritten: number;
    expectedOutputDurationInMs: number | null;
    overallProgress: number | null;
};
export type ConvertMediaResult = {
    save: () => Promise<Blob>;
    remove: () => Promise<void>;
    finalState: ConvertMediaProgress;
};
export type ConvertMediaOnProgress = (state: ConvertMediaProgress) => void;
export type ConvertMediaOnVideoFrame = (options: {
    frame: VideoFrame;
    track: MediaParserVideoTrack;
}) => Promise<VideoFrame> | VideoFrame;
export type ConvertMediaOnAudioData = (options: {
    audioData: AudioData;
    track: MediaParserAudioTrack;
}) => Promise<AudioData> | AudioData;
export declare const convertMedia: <F extends Partial<import("@remotion/media-parser").AllOptions<ParseMediaFields>>>({ src, onVideoFrame, onAudioData, onProgress: onProgressDoNotCallDirectly, audioCodec, container, videoCodec, controller, onAudioTrack: userAudioResolver, onVideoTrack: userVideoResolver, reader, fields, logLevel, writer, progressIntervalInMs, rotate, resize, onAudioCodec, onContainer, onDimensions, onDurationInSeconds, onFps, onImages, onInternalStats, onIsHdr, onKeyframes, onLocation, onMetadata, onMimeType, onName, onNumberOfAudioChannels, onRotation, onSampleRate, onSize, onSlowAudioBitrate, onSlowDurationInSeconds, onSlowFps, onSlowKeyframes, onSlowNumberOfFrames, onSlowVideoBitrate, onSlowStructure, onTracks, onUnrotatedDimensions, onVideoCodec, onM3uStreams, selectM3uStream, selectM3uAssociatedPlaylists, expectedDurationInSeconds, expectedFrameRate, seekingHints, ...more }: {
    src: import("@remotion/media-parser").ParseMediaSrc;
    container: "mp4" | "wav" | "webm";
    onVideoFrame?: ConvertMediaOnVideoFrame | undefined;
    onAudioData?: ConvertMediaOnAudioData | undefined;
    onProgress?: ConvertMediaOnProgress | undefined;
    videoCodec?: "h264" | "h265" | "vp8" | "vp9" | undefined;
    audioCodec?: "aac" | "opus" | "wav" | undefined;
    controller?: WebCodecsController | undefined;
    onAudioTrack?: ConvertMediaOnAudioTrackHandler | undefined;
    onVideoTrack?: ConvertMediaOnVideoTrackHandler | undefined;
    selectM3uStream?: import("@remotion/media-parser").SelectM3uStreamFn | undefined;
    selectM3uAssociatedPlaylists?: import("@remotion/media-parser").SelectM3uAssociatedPlaylistsFn | undefined;
    expectedDurationInSeconds?: number | null | undefined;
    expectedFrameRate?: number | null | undefined;
    reader?: import("@remotion/media-parser").MediaParserReaderInterface | undefined;
    logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
    writer?: WriterInterface | undefined;
    progressIntervalInMs?: number | undefined;
    rotate?: number | undefined;
    resize?: ResizeOperation | undefined;
    fields?: F | undefined;
    seekingHints?: import("@remotion/media-parser").SeekingHints | null | undefined;
} & Partial<import("@remotion/media-parser").ParseMediaCallbacksMandatory>) => Promise<ConvertMediaResult>;

import type { MediaParserAudioTrack, MediaParserVideoTrack } from './get-tracks';
import type { MediaParserContainer } from './options';
export type MediaParserOnAudioSample = (sample: MediaParserAudioSample) => void | Promise<OnTrackDoneCallback | void> | Promise<void> | OnTrackDoneCallback;
export type MediaParserOnVideoSample = (sample: MediaParserVideoSample) => void | Promise<OnTrackDoneCallback | void> | Promise<void> | OnTrackDoneCallback;
export type OnTrackDoneCallback = () => void | Promise<void>;
export type MediaParserOnAudioTrackParams = {
    track: MediaParserAudioTrack;
    container: MediaParserContainer;
};
export type MediaParserOnAudioTrack = (options: MediaParserOnAudioTrackParams) => MediaParserOnAudioSample | Promise<MediaParserOnAudioSample | null> | null;
export type MediaParserOnVideoTrackParams = {
    track: MediaParserVideoTrack;
    container: MediaParserContainer;
};
export type MediaParserOnVideoTrack = (options: MediaParserOnVideoTrackParams) => MediaParserOnVideoSample | Promise<MediaParserOnVideoSample | null> | null;
export type MediaParserAudioSample = {
    data: Uint8Array;
    timestamp: number;
    duration: number | undefined;
    type: 'key' | 'delta';
    decodingTimestamp: number;
    offset: number;
};
export type MediaParserAvcKeyframeInfo = {
    type: 'keyframe';
    poc: number | null;
};
export type MediaParserAvcDeltaFrameInfo = {
    type: 'delta-frame';
    isBidirectionalFrame: boolean;
    poc: number | null;
};
export type MediaParserAvcExtraInfo = MediaParserAvcKeyframeInfo | MediaParserAvcDeltaFrameInfo;
export type MediaParserVideoSample = {
    data: Uint8Array;
    timestamp: number;
    type: 'key' | 'delta';
    duration: number | undefined;
    decodingTimestamp: number;
    offset: number;
    avc?: MediaParserAvcExtraInfo;
};

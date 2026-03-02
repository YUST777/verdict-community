import type { MediaParserAudioSample, MediaParserVideoSample } from '../../webcodec-sample-types';
import type { QueuedVideoSample } from './queued-frames';
export declare const riffSampleCounter: () => {
    onAudioSample: (trackId: number, audioSample: MediaParserAudioSample) => void;
    onVideoSample: ({ trackId, videoSample, }: {
        videoSample: MediaParserVideoSample;
        trackId: number;
    }) => void;
    getSampleCountForTrack: ({ trackId }: {
        trackId: number;
    }) => number;
    setSamplesFromSeek: (samples: Record<number, number>) => void;
    riffKeys: {
        addKeyframe: (keyframe: import("./riff-keyframes").RiffKeyframe) => void;
        getKeyframes: () => import("./riff-keyframes").RiffKeyframe[];
        setFromSeekingHints: (keyframesFromHints: import("./riff-keyframes").RiffKeyframe[]) => void;
    };
    setPocAtKeyframeOffset: ({ keyframeOffset, poc, }: {
        keyframeOffset: number;
        poc: number;
    }) => void;
    getPocAtKeyframeOffset: ({ keyframeOffset, }: {
        keyframeOffset: number;
    }) => number[];
    getKeyframeAtOffset: (sample: QueuedVideoSample) => number | null;
};

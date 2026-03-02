import type { VideoConfig } from 'remotion';
export declare const SEQUENCE_BORDER_WIDTH = 1;
export declare const getTimelineSequenceLayout: ({ durationInFrames, startFrom, maxMediaDuration, startFromMedia, video, windowWidth, premountDisplay, postmountDisplay, }: {
    durationInFrames: number;
    startFrom: number;
    startFromMedia: number;
    maxMediaDuration: number | null;
    video: VideoConfig;
    windowWidth: number;
    premountDisplay: number | null;
    postmountDisplay: number | null;
}) => {
    marginLeft: number;
    width: number;
    naturalWidth: number;
    premountWidth: number | null;
    postmountWidth: number | null;
};

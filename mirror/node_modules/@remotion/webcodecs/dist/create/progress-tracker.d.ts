export declare const makeProgressTracker: () => {
    registerTrack: (trackNumber: number) => void;
    getSmallestProgress: () => number;
    updateTrackProgress: (trackNumber: number, progress: number) => void;
    setPossibleLowestTimestamp: (timestamp: number) => void;
};
export type ProgressTracker = ReturnType<typeof makeProgressTracker>;

export declare const movieTimeScaleState: () => {
    getTrackTimescale: () => number | null;
    setTrackTimescale: (timescale: number) => void;
};
export type MovieTimeScaleState = ReturnType<typeof movieTimeScaleState>;

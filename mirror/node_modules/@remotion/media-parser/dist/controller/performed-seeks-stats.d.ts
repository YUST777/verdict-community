export type PerformedSeek = {
    from: number;
    to: number;
    type: 'user-initiated' | 'internal';
};
export declare const performedSeeksStats: () => {
    recordSeek: (seek: PerformedSeek) => void;
    getPerformedSeeks: () => PerformedSeek[];
    markLastSeekAsUserInitiated: () => void;
};
export type PerformedSeeksSignal = ReturnType<typeof performedSeeksStats>;

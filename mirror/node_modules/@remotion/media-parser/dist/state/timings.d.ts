export declare const timingsState: () => {
    timeIterating: number;
    timeReadingData: number;
    timeSeeking: number;
    timeCheckingIfDone: number;
    timeFreeingData: number;
    timeInParseLoop: number;
};
export type TimingsState = ReturnType<typeof timingsState>;

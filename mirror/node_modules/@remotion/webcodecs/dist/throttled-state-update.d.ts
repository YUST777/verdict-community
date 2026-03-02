import type { ConvertMediaOnProgress, ConvertMediaProgress } from './convert-media';
export type ConvertMediaProgressFn = (state: (prevState: ConvertMediaProgress) => ConvertMediaProgress) => void;
type ReturnType = {
    get: () => ConvertMediaProgress;
    update: ConvertMediaProgressFn | null;
    stopAndGetLastProgress: () => void;
};
export declare const throttledStateUpdate: ({ updateFn, everyMilliseconds, signal, }: {
    updateFn: ConvertMediaOnProgress | null;
    everyMilliseconds: number;
    signal: AbortSignal | null;
}) => ReturnType;
export {};

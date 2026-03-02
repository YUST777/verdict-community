import type { MediaParserController } from './controller/media-parser-controller';
import type { ParseMediaOnProgress, ParseMediaProgress } from './options';
export type ThrottledState = {
    get: () => ParseMediaProgress;
    update: ParseMediaProgressFn | null;
    stopAndGetLastProgress: () => void;
};
export type ParseMediaProgressFn = (state: (prevState: ParseMediaProgress) => ParseMediaProgress) => void;
export declare const throttledStateUpdate: ({ updateFn, everyMilliseconds, controller, }: {
    updateFn: ParseMediaOnProgress | null;
    everyMilliseconds: number;
    controller: MediaParserController;
    totalBytes: number | null;
}) => ThrottledState;

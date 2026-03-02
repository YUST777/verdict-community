import type { MediaParserEmitter } from './emitter';
export type SeekSignal = {
    seek: (timeInSeconds: number) => void;
    getSeek: () => number | null;
    clearSeekIfStillSame: (previousSeek: number) => {
        hasChanged: boolean;
    };
};
export declare const makeSeekSignal: (emitter: MediaParserEmitter) => SeekSignal;

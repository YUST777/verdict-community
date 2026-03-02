import type { MediaParserEmitter } from './emitter';
export type PauseSignal = {
    pause: () => void;
    resume: () => void;
    waitUntilResume: () => Promise<void>;
};
export declare const makePauseSignal: (emitter: MediaParserEmitter) => {
    pause: () => void;
    resume: () => void;
    waitUntilResume: () => Promise<void>;
};

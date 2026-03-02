import type { SeekingHints } from '../seeking-hints';
import type { SeekResolution } from '../work-on-seek-request';
import { MediaParserEmitter } from './emitter';
import type { PauseSignal } from './pause-signal';
import type { PerformedSeeksSignal } from './performed-seeks-stats';
import type { SeekSignal } from './seek-signal';
export type MediaParserController = {
    abort: (reason?: any) => void;
    pause: PauseSignal['pause'];
    resume: PauseSignal['resume'];
    seek: SeekSignal['seek'];
    simulateSeek: (seekInSeconds: number) => Promise<SeekResolution>;
    addEventListener: MediaParserEmitter['addEventListener'];
    removeEventListener: MediaParserEmitter['removeEventListener'];
    getSeekingHints: () => Promise<SeekingHints | null>;
    /**
     * @deprecated Not public API
     */
    _internals: {
        signal: AbortSignal;
        checkForAbortAndPause: () => Promise<void>;
        seekSignal: SeekSignal;
        markAsReadyToEmitEvents: () => void;
        performedSeeksSignal: PerformedSeeksSignal;
        attachSeekingHintResolution: (callback: () => Promise<SeekingHints | null>) => void;
        attachSimulateSeekResolution: (callback: (seekInSeconds: number) => Promise<SeekResolution>) => void;
    };
};
export declare const mediaParserController: () => MediaParserController;

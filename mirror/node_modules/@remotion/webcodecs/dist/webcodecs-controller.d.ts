import type { MediaParserController } from '@remotion/media-parser';
export type WebCodecsController = {
    abort: (reason?: any) => void;
    pause: MediaParserController['pause'];
    resume: MediaParserController['resume'];
    addEventListener: MediaParserController['addEventListener'];
    removeEventListener: MediaParserController['removeEventListener'];
    /**
     * @deprecated Not public API
     */
    _internals: {
        _mediaParserController: MediaParserController;
    };
};
export declare const webcodecsController: () => WebCodecsController;

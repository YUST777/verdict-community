import type { TrakBox } from './containers/iso-base-media/trak/trak';
import type { ParserState } from './state/parser-state';
type TimescaleAndDuration = {
    timescale: number;
    duration: number;
};
export declare const trakBoxContainsAudio: (trakBox: TrakBox) => boolean;
export declare const trakBoxContainsVideo: (trakBox: TrakBox) => boolean;
export declare const getTimescaleAndDuration: (trakBox: TrakBox) => TimescaleAndDuration | null;
export declare const getFpsFromMp4TrakBox: (trakBox: TrakBox) => number | null;
export declare const getFps: (state: ParserState) => number | null;
export declare const hasFpsSuitedForSlowFps: (state: ParserState) => boolean;
export declare const hasFps: (state: ParserState) => boolean;
export {};

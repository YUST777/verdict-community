import type { ParserState } from '../../state/parser-state';
import type { XingData } from './parse-xing';
export declare const getDurationFromMp3Xing: ({ xingData, samplesPerFrame, }: {
    xingData: XingData;
    samplesPerFrame: number;
}) => number;
export declare const getDurationFromMp3: (state: ParserState) => number | null;

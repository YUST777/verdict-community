import type { SamplePosition } from '../../get-sample-positions';
import type { MediaParserLogLevel } from '../../log';
import type { MediaSection } from '../../state/video-section';
export declare const findKeyframeBeforeTime: ({ samplePositions, time, timescale, mediaSections, logLevel, startInSeconds, }: {
    samplePositions: SamplePosition[];
    time: number;
    timescale: number;
    mediaSections: MediaSection[];
    logLevel: MediaParserLogLevel;
    startInSeconds: number;
}) => SamplePosition | null;

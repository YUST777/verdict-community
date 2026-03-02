import type { MediaParserKeyframe } from './options';
export declare function findLastKeyframe<T extends MediaParserKeyframe>({ keyframes, timeInSeconds, }: {
    keyframes: T[];
    timeInSeconds: number;
}): T | null;

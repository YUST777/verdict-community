import type { MediaParserKeyframe } from '../../options';
export type RiffKeyframe = MediaParserKeyframe & {
    sampleCounts: Record<number, number>;
};
export declare const riffKeyframesState: () => {
    addKeyframe: (keyframe: RiffKeyframe) => void;
    getKeyframes: () => RiffKeyframe[];
    setFromSeekingHints: (keyframesFromHints: RiffKeyframe[]) => void;
};
export type RiffKeyframesState = ReturnType<typeof riffKeyframesState>;

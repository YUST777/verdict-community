import type { MediaParserKeyframe } from '../options';
export declare const keyframesState: () => {
    addKeyframe: (keyframe: MediaParserKeyframe) => void;
    getKeyframes: () => MediaParserKeyframe[];
    setFromSeekingHints: (keyframesFromHints: MediaParserKeyframe[]) => void;
};
export type KeyframesState = ReturnType<typeof keyframesState>;

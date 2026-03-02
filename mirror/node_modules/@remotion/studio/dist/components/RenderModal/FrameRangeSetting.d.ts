import React from 'react';
export declare const FrameRangeSetting: React.FC<{
    readonly startFrame: number;
    readonly endFrame: number;
    readonly setEndFrame: React.Dispatch<React.SetStateAction<number | null>>;
    readonly setStartFrame: React.Dispatch<React.SetStateAction<number | null>>;
    readonly durationInFrames: number;
}>;

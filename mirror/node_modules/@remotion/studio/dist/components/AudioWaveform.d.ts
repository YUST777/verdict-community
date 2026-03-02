import React from 'react';
export declare const AudioWaveform: React.FC<{
    readonly src: string;
    readonly visualizationWidth: number;
    readonly startFrom: number;
    readonly durationInFrames: number;
    readonly volume: string | number;
    readonly doesVolumeChange: boolean;
    readonly playbackRate: number;
}>;

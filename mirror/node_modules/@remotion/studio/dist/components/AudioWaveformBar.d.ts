import React from 'react';
export declare const WAVEFORM_BAR_LENGTH = 2;
export declare const WAVEFORM_BAR_MARGIN = 1;
/**
 *
 * consider a sinus wave with an amplitude going from [-1, 1].
 * if we sample it infinitely, and convert all negative samples from negative to positive
 * what is the average of all samples?
 *
 * Answer: 2 / Math.PI = 0.6366
 */
export declare const AudioWaveformBar: React.FC<{
    readonly amplitude: number;
}>;

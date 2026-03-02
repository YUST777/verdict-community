import type { AudioCodec } from '@remotion/renderer';
import React from 'react';
export declare const SeparateAudioOptionInput: React.FC<{
    readonly setSeparateAudioTo: React.Dispatch<React.SetStateAction<string | null>>;
    readonly separateAudioTo: string;
    readonly audioCodec: AudioCodec;
}>;
export declare const SeparateAudioOption: React.FC<{
    readonly setSeparateAudioTo: React.Dispatch<React.SetStateAction<string | null>>;
    readonly separateAudioTo: string | null;
    readonly audioCodec: AudioCodec;
    readonly outName: string;
}>;

import type { InlineAudioAsset } from 'remotion/no-react';
import type { CancelSignal } from '../make-cancel-signal';
export declare const makeInlineAudioMixing: (dir: string) => {
    cleanup: () => void;
    addAsset: ({ asset, fps, totalNumberOfFrames, firstFrame, trimLeftOffset, trimRightOffset, }: {
        asset: InlineAudioAsset;
        fps: number;
        totalNumberOfFrames: number;
        firstFrame: number;
        trimLeftOffset: number;
        trimRightOffset: number;
    }) => void;
    getListOfAssets: () => string[];
    finish: ({ binariesDirectory, indent, logLevel, cancelSignal, }: {
        indent: boolean;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        binariesDirectory: string | null;
        cancelSignal: CancelSignal | undefined;
    }) => Promise<void>;
};
export type InlineAudioMixing = ReturnType<typeof makeInlineAudioMixing>;

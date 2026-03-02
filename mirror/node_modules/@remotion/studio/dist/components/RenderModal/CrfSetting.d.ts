import type { AvailableOptions } from '@remotion/renderer/client';
export declare const useCrfState: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => {
    crf: number | null;
    setCrf: import("react").Dispatch<import("react").SetStateAction<number>>;
    minCrf: number;
    maxCrf: number;
};
export declare const CrfSetting: React.FC<{
    crf: number;
    setCrf: React.Dispatch<React.SetStateAction<number>>;
    min: number;
    max: number;
    option: AvailableOptions;
}>;

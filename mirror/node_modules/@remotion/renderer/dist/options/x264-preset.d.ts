export declare const x264PresetOptions: readonly ["ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow", "placebo"];
export type X264Preset = (typeof x264PresetOptions)[number];
export declare const validateSelectedCodecAndPresetCombination: ({ codec, x264Preset, }: {
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    x264Preset: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow" | null;
}) => void;
export declare const x264Option: {
    name: string;
    cliFlag: "x264-preset";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "x264Preset";
    docLink: string;
    type: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow" | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow";
        source: string;
    } | {
        value: null;
        source: string;
    };
    setConfig: (profile: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow" | null) => void;
    id: "x264-preset";
};

export declare const audioLatencyHintOption: {
    name: string;
    cliFlag: "audio-latency-hint";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "audioLatencyHint";
    docLink: string;
    type: AudioContextLatencyCategory;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: AudioContextLatencyCategory;
        source: string;
    } | {
        value: null;
        source: string;
    };
    setConfig: (profile: AudioContextLatencyCategory | null) => void;
    id: "audio-latency-hint";
};

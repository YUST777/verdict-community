export declare const numberOfSharedAudioTagsOption: {
    name: string;
    cliFlag: "number-of-shared-audio-tags";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    type: number;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: number;
        source: string;
    };
    setConfig(value: number): void;
    id: "number-of-shared-audio-tags";
};

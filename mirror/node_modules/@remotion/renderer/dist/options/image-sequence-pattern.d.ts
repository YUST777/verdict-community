export declare const imageSequencePatternOption: {
    name: string;
    cliFlag: "image-sequence-pattern";
    ssrName: string;
    description: () => import("react/jsx-runtime").JSX.Element;
    docLink: null;
    type: string | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: string;
        source: string;
    };
    setConfig: (pattern: string | null) => void;
    id: "image-sequence-pattern";
};

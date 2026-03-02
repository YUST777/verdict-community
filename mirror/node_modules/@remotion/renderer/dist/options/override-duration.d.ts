export declare const overrideDurationOption: {
    name: string;
    cliFlag: "duration";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    type: number | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: number;
    } | {
        source: string;
        value: null;
    };
    setConfig: (duration: number | null) => void;
    id: "duration";
};

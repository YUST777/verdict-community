export declare const versionFlagOption: {
    name: string;
    cliFlag: "version";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: string;
    } | {
        source: string;
        value: null;
    };
    setConfig: () => never;
    type: string | null;
    id: "version";
};

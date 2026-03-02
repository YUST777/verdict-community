export declare const logLevelOption: {
    cliFlag: "log";
    name: string;
    ssrName: string;
    description: () => import("react/jsx-runtime").JSX.Element;
    docLink: string;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: "error" | "info" | "trace" | "verbose" | "warn";
        source: string;
    };
    setConfig: (newLogLevel: "error" | "info" | "trace" | "verbose" | "warn") => void;
    type: "error" | "info" | "trace" | "verbose" | "warn";
    id: "log";
};

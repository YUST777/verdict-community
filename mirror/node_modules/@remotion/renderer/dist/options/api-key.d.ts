export declare const apiKeyOption: {
    name: string;
    cliFlag: "api-key";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "apiKey";
    docLink: string;
    type: string | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: string | null;
    };
    setConfig: (value: string | null) => void;
    id: "api-key";
};

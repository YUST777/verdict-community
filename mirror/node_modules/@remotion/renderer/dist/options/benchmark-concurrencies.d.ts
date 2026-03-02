export declare const benchmarkConcurrenciesOption: {
    name: string;
    cliFlag: "concurrencies";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    type: string | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: string;
        source: string;
    } | {
        value: null;
        source: string;
    };
    setConfig: (value: string | null) => void;
    id: "concurrencies";
};

export type Concurrency = number | string | null;
export declare const concurrencyOption: {
    name: string;
    cliFlag: "concurrency";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "concurrency";
    docLink: string;
    type: Concurrency;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: Concurrency;
    };
    setConfig: (value: Concurrency) => void;
    id: "concurrency";
};

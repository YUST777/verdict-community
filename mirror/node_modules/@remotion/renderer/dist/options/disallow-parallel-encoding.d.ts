export declare const disallowParallelEncodingOption: {
    name: string;
    cliFlag: "disallow-parallel-encoding";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: string;
    docLink: string;
    type: boolean;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: boolean;
        source: string;
    };
    setConfig(value: boolean): void;
    id: "disallow-parallel-encoding";
};

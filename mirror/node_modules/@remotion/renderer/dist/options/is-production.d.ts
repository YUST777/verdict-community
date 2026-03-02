export declare const isProductionOption: {
    name: string;
    cliFlag: "is-production";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "isProduction";
    docLink: string;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: boolean | null;
    };
    setConfig: (value: boolean | null) => void;
    type: boolean | null;
    id: "is-production";
};

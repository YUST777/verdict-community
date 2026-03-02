export declare const enableCrossSiteIsolationOption: {
    name: string;
    cliFlag: "cross-site-isolation";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    type: boolean;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: boolean;
        source: string;
    };
    setConfig(value: boolean): void;
    id: "cross-site-isolation";
};

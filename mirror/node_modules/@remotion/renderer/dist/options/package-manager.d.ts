export declare const packageManagerOption: {
    name: string;
    cliFlag: "package-manager";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "packageManager";
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
    setConfig: (value: string | null) => void;
    type: string | null;
    id: "package-manager";
};

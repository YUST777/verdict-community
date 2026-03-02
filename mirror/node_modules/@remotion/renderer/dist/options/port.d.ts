export declare const portOption: {
    name: string;
    cliFlag: "port";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: number;
    } | {
        source: string;
        value: null;
    };
    setConfig: (value: number | null) => void;
    type: number | null;
    id: "port";
};

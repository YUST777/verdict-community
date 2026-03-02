export declare const runsOption: {
    name: string;
    cliFlag: "runs";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    type: number;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: number;
        source: string;
    };
    setConfig: (value: number) => void;
    id: "runs";
};

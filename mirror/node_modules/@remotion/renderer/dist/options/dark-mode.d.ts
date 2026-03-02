export declare const darkModeOption: {
    name: string;
    cliFlag: "dark-mode";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: string;
    docLink: string;
    type: boolean;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: boolean;
    };
    setConfig: (value: boolean) => void;
    id: "dark-mode";
};

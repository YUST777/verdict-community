export declare const experimentalVisualModeOption: {
    name: string;
    cliFlag: "experimental-visual-mode";
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
    id: "experimental-visual-mode";
};

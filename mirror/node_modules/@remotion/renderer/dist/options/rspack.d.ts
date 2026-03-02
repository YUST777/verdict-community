export declare const rspackOption: {
    name: string;
    cliFlag: "experimental-rspack";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: null;
    type: boolean;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: boolean;
        source: string;
    };
    setConfig(value: boolean): void;
    id: "experimental-rspack";
};

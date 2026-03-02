export declare const experimentalClientSideRenderingOption: {
    name: string;
    cliFlag: "enable-experimental-client-side-rendering";
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
    id: "enable-experimental-client-side-rendering";
};

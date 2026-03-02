export declare const noOpenOption: {
    name: string;
    cliFlag: "no-open";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: null;
    docLink: string;
    type: boolean;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: true;
        source: string;
    } | {
        value: false;
        source: string;
    };
    setConfig: (shouldOpen: boolean) => void;
    id: "no-open";
};

export declare const stillFrameOption: {
    name: string;
    cliFlag: "frame";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "frame";
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
    id: "frame";
};

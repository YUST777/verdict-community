export declare const everyNthFrameOption: {
    name: string;
    cliFlag: "every-nth-frame";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "everyNthFrame";
    docLink: string;
    type: number;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: number;
    };
    setConfig: (value: number) => void;
    id: "every-nth-frame";
};

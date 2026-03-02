export declare const videoImageFormatOption: {
    name: string;
    cliFlag: "image-format";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "imageFormat";
    docLink: string;
    type: "jpeg" | "none" | "png" | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: "jpeg" | "none" | "png";
    } | {
        source: string;
        value: null;
    };
    setConfig: (value: "jpeg" | "none" | "png" | null) => void;
    id: string;
};

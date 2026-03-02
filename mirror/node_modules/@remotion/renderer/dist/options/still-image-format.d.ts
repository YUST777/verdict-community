export declare const stillImageFormatOption: {
    name: string;
    cliFlag: "image-format";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "imageFormat";
    docLink: string;
    type: "jpeg" | "pdf" | "png" | "webp" | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: "jpeg" | "pdf" | "png" | "webp";
    } | {
        source: string;
        value: null;
    };
    setConfig: (value: "jpeg" | "pdf" | "png" | "webp" | null) => void;
    id: string;
};

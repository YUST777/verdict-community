export declare const pixelFormatOption: {
    name: string;
    cliFlag: "pixel-format";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "pixelFormat";
    docLink: string;
    type: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le";
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le";
    };
    setConfig: (value: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le") => void;
    id: "pixel-format";
};

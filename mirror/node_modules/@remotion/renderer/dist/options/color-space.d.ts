export declare const validColorSpaces: readonly ["default", "bt601", "bt709", "bt2020-ncl"];
export type ColorSpace = (typeof validColorSpaces)[number];
export declare const DEFAULT_COLOR_SPACE: "default";
export declare const colorSpaceOption: {
    name: string;
    cliFlag: "color-space";
    description: () => import("react/jsx-runtime").JSX.Element;
    docLink: string;
    ssrName: string;
    type: "bt2020-ncl" | "bt601" | "bt709" | "default" | null;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: "bt2020-ncl" | "bt601" | "bt709" | "default";
    };
    setConfig: (value: "bt2020-ncl" | "bt601" | "bt709" | "default" | null) => void;
    id: "color-space";
};
export declare const validateColorSpace: (option: unknown) => void;

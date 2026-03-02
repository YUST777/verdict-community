export declare const validChromeModeOptions: readonly ["headless-shell", "chrome-for-testing"];
export type ChromeMode = (typeof validChromeModeOptions)[number];
export declare const chromeModeOption: {
    cliFlag: "chrome-mode";
    name: string;
    ssrName: string;
    description: () => import("react/jsx-runtime").JSX.Element;
    docLink: string;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        value: "chrome-for-testing" | "headless-shell";
        source: string;
    };
    setConfig: (newChromeMode: "chrome-for-testing" | "headless-shell") => void;
    type: "chrome-for-testing" | "headless-shell";
    id: "chrome-mode";
};

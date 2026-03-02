import type { BrowserExecutable } from '../browser-executable';
export declare const browserExecutableOption: {
    name: string;
    cliFlag: "browser-executable";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "browserExecutable";
    docLink: string;
    type: BrowserExecutable;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: BrowserExecutable;
    };
    setConfig: (value: BrowserExecutable) => void;
    id: "browser-executable";
};

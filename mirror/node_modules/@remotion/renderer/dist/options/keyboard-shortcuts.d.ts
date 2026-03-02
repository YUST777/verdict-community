export declare const keyboardShortcutsOption: {
    name: string;
    cliFlag: "disable-keyboard-shortcuts";
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
    id: "disable-keyboard-shortcuts";
};

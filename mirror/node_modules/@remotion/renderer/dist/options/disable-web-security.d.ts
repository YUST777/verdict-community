export declare const disableWebSecurityOption: {
    name: string;
    cliFlag: "disable-web-security";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "disableWebSecurity";
    docLink: string;
    type: boolean;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: boolean;
    };
    setConfig: (value: boolean) => void;
    id: "disable-web-security";
};

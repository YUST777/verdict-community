export declare const publicLicenseKeyOption: {
    name: string;
    cliFlag: "public-license-key";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "publicLicenseKey";
    docLink: string;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: string | null;
    };
    setConfig: (value: string | null) => void;
    type: string | null;
    id: "public-license-key";
};

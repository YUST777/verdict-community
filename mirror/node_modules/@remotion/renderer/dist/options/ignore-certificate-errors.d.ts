export declare const ignoreCertificateErrorsOption: {
    name: string;
    cliFlag: "ignore-certificate-errors";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "ignoreCertificateErrors";
    docLink: string;
    type: boolean;
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: boolean;
    };
    setConfig: (value: boolean) => void;
    id: "ignore-certificate-errors";
};

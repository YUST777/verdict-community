export declare const hardwareAccelerationOptions: readonly ["disable", "if-possible", "required"];
export type HardwareAccelerationOption = (typeof hardwareAccelerationOptions)[number];
export declare const getHardwareAcceleration: () => "disable" | "if-possible" | "required" | null;
export declare const hardwareAccelerationOption: {
    name: string;
    cliFlag: "hardware-acceleration";
    description: () => string;
    ssrName: string;
    docLink: string;
    type: "disable" | "if-possible" | "required";
    getValue: ({ commandLine }: {
        commandLine: Record<string, unknown>;
    }) => {
        source: string;
        value: "disable" | "if-possible" | "required";
    };
    setConfig: (value: "disable" | "if-possible" | "required") => void;
    id: "hardware-acceleration";
};

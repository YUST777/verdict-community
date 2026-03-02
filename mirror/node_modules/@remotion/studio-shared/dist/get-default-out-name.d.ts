export declare const getDefaultOutLocation: ({ compositionName, defaultExtension, type, compositionDefaultOutName, outputLocation, }: {
    compositionName: string;
    compositionDefaultOutName: string | null;
    defaultExtension: string;
    type: "asset" | "sequence";
    outputLocation?: string | null | undefined;
}) => string;

export declare const sendUsageEvent: ({ licenseKey, succeeded, apiName, isStill, isProduction, }: {
    licenseKey: string | null;
    succeeded: boolean;
    apiName: string;
    isStill: boolean;
    isProduction: boolean;
}) => Promise<void>;

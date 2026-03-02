export declare const persistVolume: (volume: number, logLevel: "error" | "info" | "trace" | "verbose" | "warn", volumePersistenceKey: string | null) => void;
export declare const getPreferredVolume: (volumePersistenceKey: string | null) => number;

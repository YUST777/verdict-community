type PortStatus = 'available' | 'unavailable';
export declare const testPortAvailableOnMultipleHosts: ({ hosts, port, }: {
    port: number;
    hosts: string[];
}) => Promise<PortStatus>;
export declare const getDesiredPort: ({ desiredPort, from, hostsToTry, to, onPortUnavailable, }: {
    desiredPort: number | undefined;
    from: number;
    to: number;
    hostsToTry: string[];
    onPortUnavailable?: ((port: number) => Promise<"continue" | "stop">) | undefined;
}) => Promise<{
    port: number;
    unlockPort: () => void;
    didUsePort: false;
} | {
    port: number;
    unlockPort: () => void;
    didUsePort: true;
}>;
export {};

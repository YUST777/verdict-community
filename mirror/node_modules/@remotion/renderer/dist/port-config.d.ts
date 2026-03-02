import type { NetworkInterfaceInfo } from 'os';
type PortConfig = {
    host: string;
    hostsToTry: string[];
};
export declare const getPortConfig: (preferIpv4: boolean) => PortConfig;
export declare const getHostToBind: (flattened: NetworkInterfaceInfo[], preferIpv4: boolean) => "0.0.0.0" | "::";
export declare const getHostsToTry: (flattened: NetworkInterfaceInfo[]) => string[];
export declare const flattenNetworkInterfaces: (networkInterfaces: NodeJS.Dict<NetworkInterfaceInfo[]>) => NetworkInterfaceInfo[];
export declare const isIpV6Supported: (flattened: NetworkInterfaceInfo[]) => boolean;
export declare const hasIPv6LoopbackAddress: (flattened: NetworkInterfaceInfo[]) => boolean;
export declare const hasIpv4LoopbackAddress: (flattened: NetworkInterfaceInfo[]) => boolean;
export {};

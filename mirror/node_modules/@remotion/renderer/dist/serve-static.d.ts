import type { DownloadMap } from './assets/download-map';
import type { Compositor } from './compositor/compositor';
export declare const serveStatic: (path: string | null, options: {
    port: number | null;
    downloadMap: DownloadMap;
    remotionRoot: string;
    offthreadVideoThreads: number;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    offthreadVideoCacheSizeInBytes: number | null;
    binariesDirectory: string | null;
    forceIPv4: boolean;
}) => Promise<{
    port: number;
    close: () => Promise<void>;
    compositor: Compositor;
}>;

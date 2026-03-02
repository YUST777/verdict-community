import type { OnBrowserDownload } from '../options/on-browser-download';
export declare const defaultBrowserDownloadProgress: ({ indent, logLevel, api, }: {
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    api: string;
}) => OnBrowserDownload;

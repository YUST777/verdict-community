import type { ChromeMode } from './chrome-mode';
export type DownloadBrowserProgressFn = (progress: {
    alreadyAvailable: boolean;
    percent: number;
    downloadedBytes: number;
    totalSizeInBytes: number;
}) => void;
export type OnBrowserDownload = (options: {
    chromeMode: ChromeMode;
}) => {
    onProgress: DownloadBrowserProgressFn;
    version: string | null;
};
export declare const onBrowserDownloadOption: {
    name: string;
    cliFlag: "on-browser-download";
    description: () => import("react/jsx-runtime").JSX.Element;
    ssrName: "onBrowserDownload";
    docLink: string;
    type: OnBrowserDownload;
    getValue: () => never;
    setConfig: () => never;
    id: "on-browser-download";
};

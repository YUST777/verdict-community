import type { AudioOrVideoAsset } from 'remotion/no-react';
import type { FrameAndAssets } from '../render-frames';
import type { RenderMediaOnDownload } from './download-and-map-assets-to-file';
import type { DownloadMap } from './download-map';
export declare const convertAssetsToFileUrls: ({ assets, onDownload, downloadMap, indent, logLevel, binariesDirectory, }: {
    assets: FrameAndAssets[];
    onDownload: RenderMediaOnDownload;
    downloadMap: DownloadMap;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
}) => Promise<AudioOrVideoAsset[][]>;

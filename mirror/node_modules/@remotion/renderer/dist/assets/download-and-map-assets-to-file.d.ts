import type { AudioOrVideoAsset } from 'remotion/no-react';
import type { CancelSignal } from '../make-cancel-signal';
import type { DownloadMap } from './download-map';
export type RenderMediaOnDownload = (src: string) => ((progress: {
    percent: number | null;
    downloaded: number;
    totalSize: number | null;
}) => void) | undefined | void;
export declare const downloadAsset: ({ src, downloadMap, indent, logLevel, shouldAnalyzeAudioImmediately, binariesDirectory, cancelSignalForAudioAnalysis, audioStreamIndex, }: {
    src: string;
    downloadMap: DownloadMap;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    shouldAnalyzeAudioImmediately: boolean;
    binariesDirectory: string | null;
    cancelSignalForAudioAnalysis: CancelSignal | undefined;
    audioStreamIndex: number | undefined;
}) => Promise<string>;
export declare const markAllAssetsAsDownloaded: (downloadMap: DownloadMap) => void;
export declare const getSanitizedFilenameForAssetUrl: ({ src, downloadDir, contentDisposition, contentType, }: {
    src: string;
    downloadDir: string;
    contentDisposition: string | null;
    contentType: string | null;
}) => string;
export declare const downloadAndMapAssetsToFileUrl: ({ renderAsset, onDownload, downloadMap, logLevel, indent, binariesDirectory, cancelSignalForAudioAnalysis, shouldAnalyzeAudioImmediately, }: {
    renderAsset: AudioOrVideoAsset;
    onDownload: RenderMediaOnDownload | null;
    downloadMap: DownloadMap;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    shouldAnalyzeAudioImmediately: boolean;
    binariesDirectory: string | null;
    cancelSignalForAudioAnalysis: CancelSignal | undefined;
}) => Promise<AudioOrVideoAsset>;
export declare const attachDownloadListenerToEmitter: (downloadMap: DownloadMap, onDownload: RenderMediaOnDownload | null) => () => void;

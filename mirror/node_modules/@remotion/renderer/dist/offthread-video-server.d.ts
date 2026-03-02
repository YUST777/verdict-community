import type { RequestListener } from 'node:http';
import type { DownloadMap } from './assets/download-map';
import type { Compositor } from './compositor/compositor';
export declare const extractUrlAndSourceFromUrl: (url: string) => {
    src: string;
    time: number;
    transparent: boolean;
    toneMapped: boolean;
};
export declare const startOffthreadVideoServer: ({ downloadMap, logLevel, indent, offthreadVideoCacheSizeInBytes, binariesDirectory, offthreadVideoThreads, }: {
    downloadMap: DownloadMap;
    offthreadVideoCacheSizeInBytes: number | null;
    offthreadVideoThreads: number;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    binariesDirectory: string | null;
}) => {
    listener: RequestListener;
    close: () => Promise<void>;
    compositor: Compositor;
};
type DownloadEventPayload = {
    src: string;
};
type ProgressEventPayload = {
    percent: number | null;
    downloaded: number;
    totalSize: number | null;
    src: string;
};
type EventMap = {
    progress: ProgressEventPayload;
    download: DownloadEventPayload;
};
export type EventTypes = keyof EventMap;
export type CallbackListener<T extends EventTypes> = (data: {
    detail: EventMap[T];
}) => void;
type Listeners = {
    [EventType in EventTypes]: CallbackListener<EventType>[];
};
export declare class OffthreadVideoServerEmitter {
    listeners: Listeners;
    addEventListener<Q extends EventTypes>(name: Q, callback: CallbackListener<Q>): () => void;
    removeEventListener<Q extends EventTypes>(name: Q, callback: CallbackListener<Q>): void;
    private dispatchEvent;
    dispatchDownloadProgress(src: string, percent: number | null, downloaded: number, totalSize: number | null): void;
    dispatchDownload(src: string): void;
}
export {};

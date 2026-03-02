import type { StaticFile } from './get-static-files';
type WatcherCallback = (newData: StaticFile | null) => void;
export type WatchRemotionStaticFilesPayload = {
    files: StaticFile[];
};
export declare const watchStaticFile: (fileName: string, callback: WatcherCallback) => {
    cancel: () => void;
};
export {};

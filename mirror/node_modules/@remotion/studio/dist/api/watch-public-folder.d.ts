import { type StaticFile } from './get-static-files';
type WatcherCallback = (newFiles: StaticFile[]) => void;
export declare const WATCH_REMOTION_STATIC_FILES = "remotion_staticFilesChanged";
export declare const watchPublicFolder: (callback: WatcherCallback) => {
    cancel: () => void;
};
export {};

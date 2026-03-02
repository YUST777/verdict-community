export type FrameDatabaseKey = string & {
    __brand: 'FrameDatabaseKey';
};
export declare const makeFrameDatabaseKey: (src: string, timestamp: number) => FrameDatabaseKey;
export declare const getFrameDatabaseKeyPrefix: (src: string) => string;
type VideoFrameAndLastUsed = {
    frame: VideoFrame;
    lastUsed: number;
};
export declare const frameDatabase: Map<FrameDatabaseKey, VideoFrameAndLastUsed>;
export declare const aspectRatioCache: Map<string, number>;
export declare const getTimestampFromFrameDatabaseKey: (key: FrameDatabaseKey) => number;
export declare const getAspectRatioFromCache: (src: string) => number | null;
export declare const clearOldFrames: () => void;
export declare const clearFramesForSrc: (src: string) => void;
export {};

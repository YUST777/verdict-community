import { OffthreadVideoServerEmitter } from '../offthread-video-server';
import type { FrameAndAssets } from '../render-frames';
import type { RenderMediaOnDownload } from './download-and-map-assets-to-file';
import { type InlineAudioMixing } from './inline-audio-mixing';
export type AudioChannelsAndDurationResultCache = {
    channels: number;
    duration: number | null;
    startTime: number | null;
};
export type DownloadMap = {
    id: string;
    emitter: OffthreadVideoServerEmitter;
    downloadListeners: RenderMediaOnDownload[];
    isDownloadingMap: {
        [src: string]: {
            [downloadDir: string]: boolean;
        } | undefined;
    };
    hasBeenDownloadedMap: {
        [src: string]: {
            [downloadDir: string]: string | null;
        } | undefined;
    };
    listeners: {
        [key: string]: {
            [downloadDir: string]: (() => void)[];
        };
    };
    durationOfAssetCache: Record<string, AudioChannelsAndDurationResultCache>;
    downloadDir: string;
    preEncode: string;
    audioMixing: string;
    complexFilter: string;
    audioPreprocessing: string;
    stitchFrames: string;
    assetDir: string;
    compositingDir: string;
    preventCleanup: () => void;
    allowCleanup: () => void;
    isPreventedFromCleanup: () => boolean;
    inlineAudioMixing: InlineAudioMixing;
    cleanupController: AbortController;
};
export type RenderAssetInfo = {
    assets: FrameAndAssets[];
    imageSequenceName: string;
    firstFrameIndex: number;
    downloadMap: DownloadMap;
    chunkLengthInSeconds: number;
    trimLeftOffset: number;
    trimRightOffset: number;
    forSeamlessAacConcatenation: boolean;
};
export declare const makeAndReturn: (dir: string, name: string) => string;
export declare const makeDownloadMap: () => DownloadMap;
export declare const cleanDownloadMap: (downloadMap: DownloadMap) => void;

import type { VideoConfig } from 'remotion/no-react';
import type { RenderMediaOnDownload } from './assets/download-and-map-assets-to-file';
import type { DownloadMap } from './assets/download-map';
import type { Page } from './browser/BrowserPage';
import type { CountType } from './get-frame-padded-index';
import type { CancelSignal } from './make-cancel-signal';
import type { FrameAndAssets, OnArtifact } from './render-frames';
export declare const renderFrame: ({ attempt, binariesDirectory, cancelSignal, imageFormat, indent, logLevel, assets, countType, downloadMap, frameDir, framesToRender, jpegQuality, onArtifact, onDownload, scale, composition, onError, outputDir, stoppedSignal, timeoutInMilliseconds, lastFrame, onFrameBuffer, onFrameUpdate, framesRenderedObj, frame, page, imageSequencePattern, trimLeftOffset, trimRightOffset, allFramesAndExtraFrames, }: {
    attempt: number;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    imageFormat: "jpeg" | "none" | "png";
    cancelSignal: CancelSignal | undefined;
    binariesDirectory: string | null;
    jpegQuality: number;
    frameDir: string;
    scale: number;
    countType: CountType;
    assets: FrameAndAssets[];
    framesToRender: number[];
    onArtifact: OnArtifact | null;
    onDownload: RenderMediaOnDownload | null;
    downloadMap: DownloadMap;
    composition: Omit<VideoConfig, "defaultProps" | "props">;
    onError: (err: Error) => void;
    stoppedSignal: {
        stopped: boolean;
    };
    timeoutInMilliseconds: number;
    outputDir: string | null;
    onFrameBuffer: ((buffer: Buffer, frame: number) => void) | null | undefined;
    lastFrame: number;
    onFrameUpdate: ((framesRendered: number, frameIndex: number, timeToRenderInMilliseconds: number) => void) | null;
    framesRenderedObj: {
        count: number;
    };
    nextFrameToRender: {
        getNextFrame: (_pageIndex: number) => number;
        returnFrame: (frame: number) => void;
    };
    frame: number;
    page: Page;
    imageSequencePattern: string | null;
    trimLeftOffset: number;
    trimRightOffset: number;
    allFramesAndExtraFrames: number[];
}) => Promise<void>;

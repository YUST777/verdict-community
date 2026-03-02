import { type ComponentType } from 'react';
import type { Codec, DelayRenderScope, LogLevel, TRenderAsset } from 'remotion';
import type { $ZodObject } from 'zod/v4/core';
import type { TimeUpdaterRef } from './update-time';
export type ErrorHolder = {
    error: Error | null;
};
export declare function checkForError(errorHolder: ErrorHolder): void;
export declare function createScaffold<Props extends Record<string, unknown>>({ width, height, delayRenderTimeoutInMilliseconds, logLevel, resolvedProps, id, mediaCacheSizeInBytes, durationInFrames, fps, initialFrame, schema, Component, audioEnabled, videoEnabled, defaultCodec, defaultOutName }: {
    width: number;
    height: number;
    delayRenderTimeoutInMilliseconds: number;
    logLevel: LogLevel;
    resolvedProps: Record<string, unknown>;
    id: string;
    mediaCacheSizeInBytes: number | null;
    initialFrame: number;
    durationInFrames: number;
    fps: number;
    schema: $ZodObject | null;
    Component: ComponentType<Props>;
    audioEnabled: boolean;
    videoEnabled: boolean;
    defaultCodec: Codec | null;
    defaultOutName: string | null;
}): {
    delayRenderScope: DelayRenderScope;
    div: HTMLDivElement;
    timeUpdater: React.RefObject<TimeUpdaterRef | null>;
    collectAssets: React.RefObject<{
        collectAssets: () => TRenderAsset[];
    } | null>;
    errorHolder: ErrorHolder;
    [Symbol.dispose]: () => void;
};

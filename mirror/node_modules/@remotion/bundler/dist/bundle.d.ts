import type { GitSource, RenderDefaults } from '@remotion/studio-shared';
import webpack from 'webpack';
import type { WebpackOverrideFn } from './webpack-config';
export type MandatoryLegacyBundleOptions = {
    webpackOverride: WebpackOverrideFn;
    outDir: string | null;
    enableCaching: boolean;
    publicPath: string | null;
    rootDir: string | null;
    publicDir: string | null;
    onPublicDirCopyProgress: (bytes: number) => void;
    onSymlinkDetected: (path: string) => void;
    keyboardShortcutsEnabled: boolean;
    askAIEnabled: boolean;
    rspack: boolean;
};
export type LegacyBundleOptions = Partial<MandatoryLegacyBundleOptions>;
export declare const getConfig: ({ entryPoint, outDir, resolvedRemotionRoot, onProgress, options, bufferStateDelayInMilliseconds, maxTimelineTracks, experimentalClientSideRenderingEnabled, experimentalVisualModeEnabled, }: {
    outDir: string;
    entryPoint: string;
    resolvedRemotionRoot: string;
    bufferStateDelayInMilliseconds: number | null;
    experimentalClientSideRenderingEnabled: boolean;
    experimentalVisualModeEnabled: boolean;
    maxTimelineTracks: number | null;
    onProgress: (progress: number) => void;
    options: MandatoryLegacyBundleOptions;
}) => Promise<[string, webpack.Configuration]> | Promise<[string, import("@rspack/core").RspackOptions]>;
type NewBundleOptions = {
    entryPoint: string;
    onProgress: (progress: number) => void;
    ignoreRegisterRootWarning: boolean;
    onDirectoryCreated: (dir: string) => void;
    gitSource: GitSource | null;
    maxTimelineTracks: number | null;
    bufferStateDelayInMilliseconds: number | null;
    audioLatencyHint: AudioContextLatencyCategory | null;
    experimentalClientSideRenderingEnabled: boolean;
    experimentalVisualModeEnabled: boolean;
    renderDefaults: RenderDefaults | null;
};
type MandatoryBundleOptions = {
    entryPoint: string;
} & NewBundleOptions & MandatoryLegacyBundleOptions;
export type BundleOptions = {
    entryPoint: string;
} & Partial<NewBundleOptions> & LegacyBundleOptions;
type Arguments = [options: BundleOptions] | [
    entryPoint: string,
    onProgress?: (progress: number) => void,
    options?: LegacyBundleOptions
];
export declare const findClosestFolderWithItem: (currentDir: string, file: string) => string | null;
export declare const internalBundle: (actualArgs: MandatoryBundleOptions) => Promise<string>;
export declare function bundle(...args: Arguments): Promise<string>;
export {};

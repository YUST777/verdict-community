import type { CanvasContent } from 'remotion';
import type { Dimensions } from './is-current-selected-still';
export declare const remotion_outputsBase: string;
export type AssetMetadata = {
    type: 'not-found';
} | {
    type: 'found';
    size: number;
    dimensions: Dimensions | 'none' | null;
    fetchedAt: number;
};
export declare const getAssetMetadata: (canvasContent: CanvasContent, addTime: boolean) => Promise<AssetMetadata>;

import type { Size } from '@remotion/player';
import React from 'react';
import type { CanvasContent } from 'remotion';
import type { AssetMetadata } from '../helpers/get-asset-metadata';
import type { Dimensions } from '../helpers/is-current-selected-still';
export type AssetFileType = 'audio' | 'video' | 'image' | 'json' | 'txt' | 'other';
export declare const getPreviewFileType: (fileName: string | null) => AssetFileType;
export declare const VideoPreview: React.FC<{
    readonly canvasSize: Size;
    readonly contentDimensions: Dimensions | 'none' | null;
    readonly canvasContent: CanvasContent;
    readonly assetMetadata: AssetMetadata | null;
}>;

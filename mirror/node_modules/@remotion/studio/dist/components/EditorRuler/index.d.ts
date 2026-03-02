import { type Size } from '@remotion/player';
import React from 'react';
import type { AssetMetadata } from '../../helpers/get-asset-metadata';
import type { Dimensions } from '../../helpers/is-current-selected-still';
export declare const EditorRulers: React.FC<{
    readonly canvasSize: Size;
    readonly contentDimensions: Dimensions | 'none' | null;
    readonly assetMetadata: AssetMetadata | null;
    readonly containerRef: React.RefObject<HTMLDivElement | null>;
}>;

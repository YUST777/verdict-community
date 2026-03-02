import React from 'react';
import type { AssetMetadata } from '../helpers/get-asset-metadata';
import type { AssetFileType } from './Preview';
export declare const FilePreview: React.FC<{
    readonly src: string;
    readonly fileType: AssetFileType;
    readonly currentAsset: string;
    readonly assetMetadata: AssetMetadata | null;
}>;

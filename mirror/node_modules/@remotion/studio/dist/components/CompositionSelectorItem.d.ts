import React from 'react';
import { type _InternalTypes } from 'remotion';
export type CompositionSelectorItemType = {
    key: string;
    type: 'composition';
    composition: _InternalTypes['AnyComposition'];
} | {
    key: string;
    type: 'folder';
    folderName: string;
    parentName: string | null;
    items: CompositionSelectorItemType[];
    expanded: boolean;
};
export declare const CompositionSelectorItem: React.FC<{
    readonly item: CompositionSelectorItemType;
    readonly currentComposition: string | null;
    readonly tabIndex: number;
    readonly selectComposition: (c: _InternalTypes['AnyComposition'], push: boolean) => void;
    readonly toggleFolder: (folderName: string, parentName: string | null) => void;
    readonly level: number;
}>;

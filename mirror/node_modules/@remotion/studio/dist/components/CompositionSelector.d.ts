import React from 'react';
export declare const useCompositionNavigation: () => {
    navigateToNextComposition: () => void;
    navigateToPreviousComposition: () => void;
};
export declare const getKeysToExpand: (initialFolderName: string, parentFolderName: string | null, initial?: string[]) => string[];
export declare const CompositionSelector: React.FC;

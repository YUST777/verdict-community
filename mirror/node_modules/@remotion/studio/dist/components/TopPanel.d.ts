import React from 'react';
export declare const useResponsiveSidebarStatus: () => "collapsed" | "expanded";
export declare const TopPanel: React.FC<{
    readonly readOnlyStudio: boolean;
    readonly onMounted: () => void;
    readonly drawRef: React.RefObject<HTMLDivElement | null>;
    readonly bufferStateDelayInMilliseconds: number;
}>;

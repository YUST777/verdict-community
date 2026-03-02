import React from 'react';
export declare const SPLITTER_HANDLE_SIZE = 3;
export declare const SplitterHandle: React.FC<{
    readonly allowToCollapse: 'right' | 'left' | 'none';
    readonly onCollapse: () => void;
}>;

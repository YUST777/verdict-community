import React from 'react';
export declare const getMaxModalWidth: (width: number) => string;
export declare const getMaxModalHeight: (height: number) => string;
export declare const ModalContainer: React.FC<{
    readonly onEscape: () => void;
    readonly onOutsideClick: () => void;
    readonly children: React.ReactNode;
    readonly noZIndex?: boolean;
}>;

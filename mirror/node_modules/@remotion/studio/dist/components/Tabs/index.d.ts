import React from 'react';
export declare const Tabs: React.FC<{
    readonly children: React.ReactNode;
    readonly style?: React.CSSProperties;
}>;
export declare const Tab: React.FC<{
    readonly children: React.ReactNode;
    readonly onClick: React.MouseEventHandler<HTMLDivElement>;
    readonly style?: React.CSSProperties;
    readonly selected: boolean;
}>;

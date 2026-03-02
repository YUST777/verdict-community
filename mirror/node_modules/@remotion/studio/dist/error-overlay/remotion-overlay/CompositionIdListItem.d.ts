import React from 'react';
export declare const listItemStyle: React.CSSProperties;
export declare const listItemActiveStyle: React.CSSProperties;
export declare const listItemHoverStyle: React.CSSProperties;
export declare const CompositionIdListItem: React.FC<{
    readonly id: string;
    readonly isActive?: boolean;
    readonly onSelect: (id: string) => void;
}>;

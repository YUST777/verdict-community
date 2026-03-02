import type { HTMLAttributes } from 'react';
import React from 'react';
export declare const SPACING_UNIT = 8;
export declare const Spacing: React.FC<{
    readonly x?: number;
    readonly y?: number;
    readonly block?: boolean;
}>;
export declare const Flex: React.FC<{
    readonly children?: React.ReactNode;
}>;
export declare const Row: React.FC<{
    readonly justify?: 'center' | 'flex-start' | 'flex-end';
    readonly align?: 'center';
    readonly style?: React.CSSProperties;
    readonly flex?: number;
    readonly className?: string;
    readonly children: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>>;
export declare const Column: React.FC<{
    readonly justify?: 'center';
    readonly align?: 'center';
    readonly style?: React.CSSProperties;
    readonly className?: string;
    readonly children: React.ReactNode;
}>;

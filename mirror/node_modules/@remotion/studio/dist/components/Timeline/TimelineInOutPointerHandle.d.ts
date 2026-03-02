import React from 'react';
export declare const inPointerHandle: React.RefObject<HTMLDivElement | null>;
export declare const outPointerHandle: React.RefObject<HTMLDivElement | null>;
type Props = {
    readonly dragging: boolean;
    readonly type: 'in' | 'out';
    readonly atFrame: number;
};
export declare const TimelineInOutPointerHandle: React.FC<Props>;
export {};

import type { BorderRadiusCorners } from './border-radius';
export declare const parseOutlineWidth: (value: string) => number;
export declare const parseOutlineOffset: (value: string) => number;
export declare const drawOutline: ({ ctx, rect, borderRadius, computedStyle, }: {
    ctx: OffscreenCanvasRenderingContext2D;
    rect: DOMRect;
    borderRadius: BorderRadiusCorners;
    computedStyle: CSSStyleDeclaration;
}) => void;

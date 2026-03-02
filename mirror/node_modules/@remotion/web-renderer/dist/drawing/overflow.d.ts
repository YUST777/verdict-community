import type { BorderRadiusCorners } from './border-radius';
export declare const setOverflowHidden: ({ ctx, rect, borderRadius, overflowHidden, computedStyle, backgroundClip, }: {
    ctx: OffscreenCanvasRenderingContext2D;
    rect: DOMRect;
    borderRadius: BorderRadiusCorners;
    overflowHidden: boolean;
    computedStyle: CSSStyleDeclaration;
    backgroundClip: string;
}) => () => void;

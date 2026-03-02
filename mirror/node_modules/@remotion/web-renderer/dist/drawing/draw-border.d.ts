import type { BorderRadiusCorners } from './border-radius';
export declare const drawBorder: ({ ctx, rect, borderRadius, computedStyle, }: {
    ctx: OffscreenCanvasRenderingContext2D;
    rect: DOMRect;
    borderRadius: BorderRadiusCorners;
    computedStyle: CSSStyleDeclaration;
}) => void;

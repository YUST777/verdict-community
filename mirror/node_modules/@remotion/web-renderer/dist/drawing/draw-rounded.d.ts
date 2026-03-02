import type { BorderRadiusCorners } from './border-radius';
export declare const drawRoundedRectPath: ({ ctx, x, y, width, height, borderRadius, }: {
    ctx: OffscreenCanvasRenderingContext2D;
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius: BorderRadiusCorners;
}) => void;

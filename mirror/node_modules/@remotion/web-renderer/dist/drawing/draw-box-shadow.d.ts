import type { BorderRadiusCorners } from './border-radius';
import type { ShadowBase } from './parse-shadow';
interface BoxShadow extends ShadowBase {
    inset: boolean;
}
export declare const parseBoxShadow: (boxShadowValue: string) => BoxShadow[];
export declare const drawBorderRadius: ({ ctx, rect, borderRadius, computedStyle, logLevel, }: {
    ctx: OffscreenCanvasRenderingContext2D;
    rect: DOMRect;
    borderRadius: BorderRadiusCorners;
    computedStyle: CSSStyleDeclaration;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
}) => void;
export {};

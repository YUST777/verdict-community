import type { LinearGradientInfo } from './parse-linear-gradient';
export declare const getPrecomposeRectForMask: (element: HTMLElement | SVGElement) => DOMRect;
export declare const handleMask: ({ gradientInfo, rect, precomposeRect, tempContext, scale, }: {
    gradientInfo: LinearGradientInfo;
    rect: DOMRect;
    precomposeRect: DOMRect;
    tempContext: OffscreenCanvasRenderingContext2D;
    scale: number;
}) => void;

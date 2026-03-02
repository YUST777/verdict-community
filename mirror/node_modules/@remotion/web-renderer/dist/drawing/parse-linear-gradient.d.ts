export interface ColorStop {
    color: string;
    position: number;
}
export interface LinearGradientInfo {
    angle: number;
    colorStops: ColorStop[];
}
export declare const parseLinearGradient: (backgroundImage: string) => LinearGradientInfo | null;
export declare const createCanvasGradient: ({ ctx, rect, gradientInfo, offsetLeft, offsetTop, }: {
    ctx: OffscreenCanvasRenderingContext2D;
    rect: DOMRect;
    gradientInfo: LinearGradientInfo;
    offsetLeft: number;
    offsetTop: number;
}) => CanvasGradient;

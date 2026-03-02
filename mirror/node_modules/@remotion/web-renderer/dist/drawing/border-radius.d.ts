export type BorderRadiusCorners = {
    topLeft: {
        horizontal: number;
        vertical: number;
    };
    topRight: {
        horizontal: number;
        vertical: number;
    };
    bottomRight: {
        horizontal: number;
        vertical: number;
    };
    bottomLeft: {
        horizontal: number;
        vertical: number;
    };
};
export declare function parseBorderRadius({ borderRadius, width, height }: {
    borderRadius: string;
    width: number;
    height: number;
}): BorderRadiusCorners;
export declare function setBorderRadius({ ctx, rect, borderRadius, forceClipEvenWhenZero, computedStyle, backgroundClip }: {
    ctx: OffscreenCanvasRenderingContext2D;
    rect: DOMRect;
    borderRadius: BorderRadiusCorners;
    forceClipEvenWhenZero: boolean;
    computedStyle: CSSStyleDeclaration;
    backgroundClip: string;
}): () => void;

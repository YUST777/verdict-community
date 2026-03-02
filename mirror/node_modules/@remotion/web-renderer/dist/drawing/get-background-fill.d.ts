export declare const getBackgroundFill: ({ backgroundColor, backgroundImage, contextToDraw, boundingRect, offsetLeft, offsetTop, }: {
    backgroundImage: string;
    backgroundColor: string;
    contextToDraw: OffscreenCanvasRenderingContext2D;
    boundingRect: DOMRect;
    offsetLeft: number;
    offsetTop: number;
}) => string | CanvasGradient | null;

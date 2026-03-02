/**
 * Parse paint-order CSS property to determine if stroke should be drawn before fill.
 * Default order is: fill, stroke, markers
 * paintOrder can be "normal", "fill", "stroke", "fill stroke", "stroke fill", etc.
 */
export declare const parsePaintOrder: (paintOrder: string) => {
    strokeFirst: boolean;
};

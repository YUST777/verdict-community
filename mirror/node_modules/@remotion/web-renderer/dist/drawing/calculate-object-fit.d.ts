export type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
export type ObjectFitResult = {
    sourceX: number;
    sourceY: number;
    sourceWidth: number;
    sourceHeight: number;
    destX: number;
    destY: number;
    destWidth: number;
    destHeight: number;
};
type ObjectFitParams = {
    containerSize: {
        width: number;
        height: number;
        left: number;
        top: number;
    };
    intrinsicSize: {
        width: number;
        height: number;
    };
};
/**
 * Calculates how to draw an image based on object-fit CSS property.
 *
 * @param objectFit - The CSS object-fit value
 * @param containerSize - The container dimensions (where the image should be drawn)
 * @param intrinsicSize - The natural/intrinsic size of the image
 * @returns Source and destination rectangles for drawImage
 */
export declare const calculateObjectFit: ({ objectFit, containerSize, intrinsicSize, }: {
    objectFit: ObjectFit;
} & ObjectFitParams) => ObjectFitResult;
/**
 * Parse an object-fit CSS value string into our ObjectFit type.
 * Returns 'fill' as the default if the value is not recognized.
 */
export declare const parseObjectFit: (value: string | null | undefined) => ObjectFit;
export {};

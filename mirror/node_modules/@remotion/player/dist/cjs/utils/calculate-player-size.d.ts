import type { Size } from './use-element-size.js';
export declare const calculatePlayerSize: ({ currentSize, width, height, compositionWidth, compositionHeight, }: {
    currentSize: Size | null;
    width: import("csstype").Property.Width<0 | (string & {})> | undefined;
    height: import("csstype").Property.Height<0 | (string & {})> | undefined;
    compositionWidth: number;
    compositionHeight: number;
}) => import("react").CSSProperties;

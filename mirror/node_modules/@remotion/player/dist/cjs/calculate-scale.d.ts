import type { VideoConfig } from 'remotion';
import type { Size } from './utils/use-element-size.js';
type Layout = {
    centerX: number;
    centerY: number;
    xCorrection: number;
    yCorrection: number;
    scale: number;
};
export declare const calculateCanvasTransformation: ({ previewSize, compositionWidth, compositionHeight, canvasSize, }: {
    previewSize: number | "auto";
    compositionWidth: number;
    compositionHeight: number;
    canvasSize: Size;
}) => Layout;
export declare const calculateOuterStyle: ({ config, style, canvasSize, overflowVisible, layout, }: {
    config: VideoConfig | null;
    style: import("react").CSSProperties | undefined;
    canvasSize: Size | null;
    overflowVisible: boolean;
    layout: Layout | null;
}) => import("react").CSSProperties;
export declare const calculateContainerStyle: ({ config, layout, scale, overflowVisible, }: {
    config: VideoConfig | null;
    layout: Layout | null;
    scale: number;
    overflowVisible: boolean;
}) => import("react").CSSProperties;
export declare const calculateOuter: ({ layout, scale, config, overflowVisible, }: {
    layout: Layout | null;
    scale: number;
    config: VideoConfig | null;
    overflowVisible: boolean;
}) => {
    readonly width?: undefined;
    readonly height?: undefined;
    readonly display?: undefined;
    readonly flexDirection?: undefined;
    readonly position?: undefined;
    readonly left?: undefined;
    readonly top?: undefined;
    readonly overflow?: undefined;
} | {
    readonly width: number;
    readonly height: number;
    readonly display: "flex";
    readonly flexDirection: "column";
    readonly position: "absolute";
    readonly overflow: "hidden" | "visible";
    readonly left?: undefined;
    readonly top?: undefined;
} | {
    readonly width: number;
    readonly height: number;
    readonly display: "flex";
    readonly flexDirection: "column";
    readonly position: "absolute";
    readonly left: number;
    readonly top: number;
    readonly overflow: "hidden" | "visible";
};
export {};

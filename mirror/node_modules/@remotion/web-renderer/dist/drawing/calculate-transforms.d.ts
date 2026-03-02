import type { LinearGradientInfo } from './parse-linear-gradient';
export declare const calculateTransforms: ({ element, rootElement, }: {
    element: HTMLElement | SVGElement;
    rootElement: HTMLElement | SVGElement;
}) => {
    dimensions: DOMRect;
    totalMatrix: DOMMatrix;
    [Symbol.dispose]: () => void;
    nativeTransformOrigin: {
        x: number;
        y: number;
    };
    computedStyle: CSSStyleDeclaration;
    opacity: number;
    maskImageInfo: LinearGradientInfo | null;
    precompositing: {
        needs3DTransformViaWebGL: boolean;
        needsMaskImage: LinearGradientInfo | null;
        needsPrecompositing: boolean;
    };
};

import type { LinearGradientInfo } from './parse-linear-gradient';
export declare const getMaskImageValue: (computedStyle: CSSStyleDeclaration) => string | null;
export declare const parseMaskImage: (maskImageValue: string) => LinearGradientInfo | null;

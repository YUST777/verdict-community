import { z } from 'zod';
export declare const REMOTION_COLOR_BRAND = "__remotion-color";
export declare const parseColor: (value: string) => {
    a: number;
    r: number;
    g: number;
    b: number;
};
export declare const zColor: () => z.ZodString;

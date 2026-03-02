import type { RenderMediaOnWebProgressCallback } from './render-media-on-web';
export type ThrottledProgressResult = {
    throttled: RenderMediaOnWebProgressCallback;
    [Symbol.dispose]: () => void;
};
/**
 * Creates a throttled version of a progress callback that ensures it's not called
 * more frequently than the specified interval (default: 250ms)
 */
export declare const createThrottledProgressCallback: (callback: RenderMediaOnWebProgressCallback | null, throttleMs?: number) => ThrottledProgressResult | null;

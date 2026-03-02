import type { Page } from './browser/BrowserPage';
export declare const takeFrame: ({ freePage, imageFormat, jpegQuality, width, height, output, scale, wantsBuffer, timeoutInMilliseconds, }: {
    freePage: Page;
    imageFormat: "jpeg" | "none" | "pdf" | "png" | "webp";
    jpegQuality: number | undefined;
    height: number;
    width: number;
    output: string | null;
    scale: number;
    wantsBuffer: boolean;
    timeoutInMilliseconds: number;
}) => Promise<Buffer | null>;

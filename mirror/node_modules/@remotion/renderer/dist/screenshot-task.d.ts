import type { Page } from './browser/BrowserPage';
export declare const screenshotTask: ({ format, height, omitBackground, page, width, path, jpegQuality, scale, }: {
    page: Page;
    format: "jpeg" | "pdf" | "png" | "webp";
    path?: string | undefined;
    jpegQuality?: number | undefined;
    omitBackground: boolean;
    width: number;
    height: number;
    scale: number;
}) => Promise<Buffer>;

import type { Page } from './browser/BrowserPage';
export declare const screenshot: (options: {
    page: Page;
    type: "jpeg" | "pdf" | "png" | "webp";
    path?: string | undefined;
    jpegQuality?: number | undefined;
    omitBackground: boolean;
    width: number;
    height: number;
    scale: number;
}) => Promise<Buffer>;

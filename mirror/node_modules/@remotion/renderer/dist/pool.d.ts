import type { Page } from './browser/BrowserPage';
export declare class Pool {
    resources: Page[];
    waiters: ((r: Page) => void)[];
    constructor(resources: Page[]);
    acquire(): Promise<Page>;
    release(resource: Page): void;
}

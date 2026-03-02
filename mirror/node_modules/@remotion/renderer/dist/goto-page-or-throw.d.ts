import type { Page } from './browser/BrowserPage';
import type { HTTPResponse } from './browser/HTTPResponse';
export declare const gotoPageOrThrow: (page: Page, urlToVisit: string, actualTimeout: number) => Promise<[null, Error] | [HTTPResponse, null]>;

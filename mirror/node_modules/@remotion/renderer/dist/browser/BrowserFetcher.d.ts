/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { DownloadBrowserProgressFn } from '../options/on-browser-download';
import { TESTED_VERSION } from './get-chrome-download-url';
export { TESTED_VERSION };
interface BrowserFetcherRevisionInfo {
    folderPath: string;
    executablePath: string;
    url: string;
    local: boolean;
}
export declare const readVersionFile: (chromeMode: "chrome-for-testing" | "headless-shell") => string | null;
export declare const downloadBrowser: ({ logLevel, indent, onProgress, version, chromeMode, }: {
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    onProgress: DownloadBrowserProgressFn;
    version: string | null;
    chromeMode: "chrome-for-testing" | "headless-shell";
}) => Promise<BrowserFetcherRevisionInfo | undefined>;
export declare const getRevisionInfo: (chromeMode: "chrome-for-testing" | "headless-shell") => BrowserFetcherRevisionInfo;

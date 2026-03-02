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
import { BrowserLog } from '../browser-log';
import type { LogLevel } from '../log-level';
import type { OnLog, Page } from './BrowserPage';
import type { BrowserRunner } from './BrowserRunner';
import type { Connection } from './Connection';
import { EventEmitter } from './EventEmitter';
import type { Viewport } from './PuppeteerViewport';
import type { SourceMapGetter } from './source-map-getter';
import { Target } from './Target';
interface WaitForTargetOptions {
    timeout?: number;
}
export declare const enum BrowserEmittedEvents {
    TargetChanged = "targetchanged",
    TargetCreated = "targetcreated",
    Closed = "closed",
    ClosedSilent = "closed-silent"
}
export declare class HeadlessBrowser extends EventEmitter {
    #private;
    static create({ defaultViewport, timeout, userDataDir, args, executablePath, logLevel, indent }: {
        defaultViewport: Viewport;
        timeout: number;
        userDataDir: string;
        args: string[];
        executablePath: string;
        logLevel: LogLevel;
        indent: boolean;
    }): Promise<HeadlessBrowser>;
    connection: Connection;
    id: string;
    runner: BrowserRunner;
    get _targets(): Map<string, Target>;
    constructor({ connection, defaultViewport, runner }: {
        connection: Connection;
        defaultViewport: Viewport;
        runner: BrowserRunner;
    });
    browserContexts(): BrowserContext[];
    newPage({ context, logLevel, indent, pageIndex, onBrowserLog, onLog }: {
        context: SourceMapGetter;
        logLevel: LogLevel;
        indent: boolean;
        pageIndex: number;
        onBrowserLog: null | ((log: BrowserLog) => void);
        onLog: OnLog;
    }): Promise<Page>;
    _createPageInContext({ context, logLevel, indent, pageIndex, onBrowserLog, onLog }: {
        context: SourceMapGetter;
        logLevel: LogLevel;
        indent: boolean;
        pageIndex: number;
        onBrowserLog: null | ((log: BrowserLog) => void);
        onLog: OnLog;
    }): Promise<Page>;
    targets(): Target[];
    waitForTarget(predicate: (x: Target) => boolean | Promise<boolean>, options?: WaitForTargetOptions): Promise<Target>;
    pages(): Promise<Page[]>;
    close({ silent }: {
        silent: boolean;
    }): Promise<void>;
    disconnect(): void;
}
export declare class BrowserContext extends EventEmitter {
    #private;
    constructor(browser: HeadlessBrowser);
    targets(): Target[];
    waitForTarget(predicate: (x: Target) => boolean | Promise<boolean>, options?: {
        timeout?: number;
    }): Promise<Target>;
    pages(): Promise<Page[]>;
    newPage({ context, logLevel, indent, pageIndex, onBrowserLog, onLog }: {
        context: SourceMapGetter;
        logLevel: LogLevel;
        indent: boolean;
        pageIndex: number;
        onBrowserLog: null | ((log: BrowserLog) => void);
        onLog: OnLog;
    }): Promise<Page>;
    browser(): HeadlessBrowser;
}
export {};

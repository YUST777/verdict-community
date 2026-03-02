import type { M3uMediaInfo } from './types';
export declare const parseM3uKeyValue: (str: string) => Record<string, string>;
export declare const parseM3uMediaDirective: (str: string) => M3uMediaInfo;

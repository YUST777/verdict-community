import type { WriterInterface } from '@remotion/media-parser';
export declare const autoSelectWriter: (writer: WriterInterface | undefined, logLevel: "error" | "info" | "trace" | "verbose" | "warn") => Promise<WriterInterface>;

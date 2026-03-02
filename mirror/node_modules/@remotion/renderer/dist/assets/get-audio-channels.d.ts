import type { CancelSignal } from '../make-cancel-signal';
import type { AudioChannelsAndDurationResultCache, DownloadMap } from './download-map';
export declare const getAudioChannelsAndDurationWithoutCache: ({ src, indent, logLevel, binariesDirectory, cancelSignal, audioStreamIndex, }: {
    src: string;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    cancelSignal: CancelSignal | undefined;
    audioStreamIndex: number | undefined;
}) => Promise<AudioChannelsAndDurationResultCache>;
export declare const getAudioChannelsAndDuration: ({ downloadMap, src, indent, logLevel, binariesDirectory, cancelSignal, audioStreamIndex, }: {
    downloadMap: DownloadMap;
    src: string;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    cancelSignal: CancelSignal | undefined;
    audioStreamIndex: number | undefined;
}) => Promise<AudioChannelsAndDurationResultCache>;

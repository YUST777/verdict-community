import type { MediaParserLogLevel } from '../log';
import type { ParseMediaMode } from '../options';
import type { OffsetCounter } from './offset-counter';
export declare const bufferManager: ({ initialData, maxBytes, counter, logLevel, }: {
    initialData: Uint8Array;
    maxBytes: number;
    counter: OffsetCounter;
    logLevel: MediaParserLogLevel;
}) => {
    getView: () => DataView<ArrayBufferLike>;
    getUint8Array: () => Uint8Array<ArrayBufferLike>;
    destroy: () => void;
    addData: (newData: Uint8Array) => void;
    skipTo: (offset: number) => void;
    removeBytesRead: (force: boolean, mode: ParseMediaMode) => {
        bytesRemoved: number;
        removedData: Uint8Array<ArrayBuffer> | null;
    };
    replaceData: (newData: Uint8Array, seekTo: number) => void;
};

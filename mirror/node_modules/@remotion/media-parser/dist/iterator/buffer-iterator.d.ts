import type { MediaParserLogLevel } from '../log';
export declare const getArrayBufferIterator: ({ initialData, maxBytes, logLevel, }: {
    initialData: Uint8Array;
    maxBytes: number;
    logLevel: MediaParserLogLevel;
}) => {
    startReadingBits: () => void;
    stopReadingBits: () => void;
    skipTo: (offset: number) => void;
    addData: (newData: Uint8Array) => void;
    counter: {
        getOffset: () => number;
        discardBytes: (bytes: number) => void;
        increment: (bytes: number) => void;
        getDiscardedBytes: () => number;
        setDiscardedOffset: (bytes: number) => void;
        getDiscardedOffset: () => number;
        decrement: (bytes: number) => void;
    };
    peekB: (length: number) => void;
    peekD: (length: number) => void;
    getBits: (bits: number) => number;
    bytesRemaining: () => number;
    leb128: () => number;
    removeBytesRead: (force: boolean, mode: import("../options").ParseMediaMode) => {
        bytesRemoved: number;
        removedData: Uint8Array<ArrayBuffer> | null;
    };
    discard: (length: number) => void;
    getEightByteNumber: (littleEndian?: boolean) => number;
    getFourByteNumber: () => number;
    getSlice: (amount: number) => Uint8Array<ArrayBuffer>;
    getAtom: () => string;
    detectFileType: () => import("../file-types/detect-file-type").FileType;
    getPaddedFourByteNumber: () => number;
    getMatroskaSegmentId: () => string | null;
    getVint: () => number | null;
    getUint8: () => number;
    getEBML: () => number;
    getInt8: () => number;
    getUint16: () => number;
    getUint16Le: () => number;
    getUint24: () => number;
    getInt24: () => number;
    getInt16: () => number;
    getUint32: () => number;
    getUint64: (littleEndian?: boolean) => bigint;
    getInt64: (littleEndian?: boolean) => bigint;
    getFixedPointUnsigned1616Number: () => number;
    getFixedPointSigned1616Number: () => number;
    getFixedPointSigned230Number: () => number;
    getPascalString: () => number[];
    getUint(length: number): number;
    getByteString(length: number, trimTrailingZeroes: boolean): string;
    planBytes: (size: number) => {
        discardRest: () => Uint8Array<ArrayBuffer>;
    };
    getFloat64: () => number;
    readUntilNullTerminator: () => string;
    getFloat32: () => number;
    getUint32Le: () => number;
    getInt32Le: () => number;
    getInt32: () => number;
    destroy: () => void;
    startBox: (size: number) => {
        discardRest: () => void;
        expectNoMoreBytes: () => void;
    };
    readExpGolomb: () => number;
    startCheckpoint: () => {
        returnToCheckpoint: () => void;
    };
    getFlacCodecNumber: () => number;
    readUntilLineEnd: () => string | null;
    getSyncSafeInt32: () => number;
    replaceData: (newData: Uint8Array, seekTo: number) => void;
};
export type BufferIterator = ReturnType<typeof getArrayBufferIterator>;

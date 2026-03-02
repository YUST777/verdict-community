export declare const stringsToUint8Array: (str: string) => Uint8Array<ArrayBuffer>;
export declare const numberTo32BitUIntOrInt: (num: number) => Uint8Array<ArrayBuffer>;
export declare const numberTo64BitUIntOrInt: (num: number | bigint) => Uint8Array<ArrayBuffer>;
export declare const numberTo32BitUIntOrIntLeading128: (num: number) => Uint8Array<ArrayBuffer>;
export declare const numberTo16BitUIntOrInt: (num: number) => Uint8Array<ArrayBuffer>;
export declare const setFixedPointSignedOrUnsigned1616Number: (num: number) => Uint8Array<ArrayBuffer>;
export declare const setFixedPointSigned230Number: (num: number) => Uint8Array<ArrayBuffer>;
export declare const addSize: (arr: Uint8Array<ArrayBufferLike>) => Uint8Array<ArrayBufferLike>;
export declare const addLeading128Size: (arr: Uint8Array<ArrayBufferLike>) => Uint8Array<ArrayBufferLike>;
export declare const floatTo16Point1632Bit: (number: number) => Uint8Array<ArrayBuffer>;
export declare const floatTo16Point16_16Bit: (number: number) => Uint8Array<ArrayBuffer>;
export declare const serializeMatrix: (matrix: number[]) => Uint8Array<ArrayBufferLike>;
export declare const stringToPascalString: (str: string) => Uint8Array<ArrayBuffer>;
export declare const padIsoBaseMediaBytes: (data: Uint8Array<ArrayBufferLike>, totalLength: number) => Uint8Array<ArrayBufferLike>;
type ThreeDMatrix = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
export declare const IDENTITY_MATRIX: ThreeDMatrix;
export {};

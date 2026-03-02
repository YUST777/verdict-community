export declare class ResizableBuffer {
    buffer: ArrayBuffer;
    uintarray: Uint8Array;
    constructor(buffer: ArrayBuffer);
    resize(newLength: number): void;
}

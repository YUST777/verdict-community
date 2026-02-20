if (typeof File === 'undefined') {
    globalThis.File = class File extends Blob {
        name: string;
        lastModified: number;
        constructor(fileBits: any[], fileName: string, options?: any) {
            super(fileBits, options);
            this.name = fileName;
            this.lastModified = options?.lastModified || Date.now();
        }
    } as any;
}

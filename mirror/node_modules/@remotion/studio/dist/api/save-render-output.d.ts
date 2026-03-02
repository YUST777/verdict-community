import type { CompletedClientRender } from '@remotion/studio-shared';
export declare const saveOutputFile: ({ blob, filePath, }: {
    blob: Blob;
    filePath: string;
}) => Promise<void>;
export declare const registerClientRender: (render: CompletedClientRender) => Promise<void>;
export declare const unregisterClientRender: (id: string) => Promise<void>;

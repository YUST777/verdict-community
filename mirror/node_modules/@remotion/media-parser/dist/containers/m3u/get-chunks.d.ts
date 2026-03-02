import type { M3uPlaylist } from './types';
export type M3uChunk = {
    duration: number;
    url: string;
    isHeader: boolean;
};
export declare const getChunks: (playlist: M3uPlaylist) => M3uChunk[];

import type { ParseMediaSrc } from '../../options';
import type { M3uPlaylist, M3uStructure } from './types';
export declare const getAllPlaylists: ({ structure, src, }: {
    structure: M3uStructure;
    src: ParseMediaSrc;
}) => M3uPlaylist[];
export declare const getPlaylist: (structure: M3uStructure, src: string) => M3uPlaylist;
export declare const getDurationFromPlaylist: (playlist: M3uPlaylist) => number;

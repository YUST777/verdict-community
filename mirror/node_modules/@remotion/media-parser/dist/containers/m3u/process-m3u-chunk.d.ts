import type { ParserState } from '../../state/parser-state';
import type { M3uStructure } from './types';
export type PendingSeek = {
    pending: number | null;
};
export declare const processM3uChunk: ({ playlistUrl, state, structure, audioDone, videoDone, }: {
    playlistUrl: string;
    state: ParserState;
    structure: M3uStructure;
    audioDone: boolean;
    videoDone: boolean;
}) => Promise<void>;

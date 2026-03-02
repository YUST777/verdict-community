import type { ParserState } from '../../state/parser-state';
export declare const handleChunk: ({ state, ckId, ckSize, }: {
    state: ParserState;
    ckId: string;
    ckSize: number;
}) => Promise<void>;
export declare const parseMovi: ({ state, }: {
    state: ParserState;
}) => Promise<void>;

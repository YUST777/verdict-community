import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParserState } from '../../state/parser-state';
import type { RiffBox } from './riff-box';
export declare const parseRiffBox: ({ size, id, iterator, stateIfExpectingSideEffects, }: {
    size: number;
    id: string;
    iterator: BufferIterator;
    stateIfExpectingSideEffects: ParserState | null;
}) => Promise<RiffBox>;

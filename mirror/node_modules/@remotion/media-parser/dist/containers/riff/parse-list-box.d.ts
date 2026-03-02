import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParserState } from '../../state/parser-state';
import type { RiffBox } from './riff-box';
export declare const parseListBox: ({ size, iterator, stateIfExpectingSideEffects, }: {
    size: number;
    iterator: BufferIterator;
    stateIfExpectingSideEffects: ParserState | null;
}) => Promise<RiffBox>;

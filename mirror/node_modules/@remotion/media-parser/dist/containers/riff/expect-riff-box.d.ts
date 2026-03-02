import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParserState } from '../../state/parser-state';
import type { RiffBox } from './riff-box';
export type RiffResult = {
    box: RiffBox | null;
};
export declare const postProcessRiffBox: (state: ParserState, box: RiffBox) => Promise<void>;
export declare const expectRiffBox: ({ iterator, stateIfExpectingSideEffects, }: {
    iterator: BufferIterator;
    stateIfExpectingSideEffects: ParserState | null;
}) => Promise<RiffBox | null>;

import type { ParserState } from '../../state/parser-state';
import type { MoovBox } from './moov/moov';
export declare const getMoovAtom: ({ endOfMdat, state, }: {
    state: ParserState;
    endOfMdat: number;
}) => Promise<MoovBox>;

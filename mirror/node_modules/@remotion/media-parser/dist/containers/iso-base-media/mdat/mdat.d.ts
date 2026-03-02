import type { FetchMoreData, Skip } from '../../../skip';
import type { ParserState } from '../../../state/parser-state';
export declare const parseMdatSection: (state: ParserState) => Promise<Skip | FetchMoreData | null>;

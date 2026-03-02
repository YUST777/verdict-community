import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParserState } from '../../state/parser-state';
export declare const getSampleRate: (iterator: BufferIterator, state: ParserState) => number | "uncommon-u8" | "uncommon-u16" | "uncommon-u16-10";

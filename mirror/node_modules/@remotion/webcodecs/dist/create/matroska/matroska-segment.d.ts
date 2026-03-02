import type { BytesAndOffset } from './matroska-utils';
export declare const MATROSKA_SEGMENT_MIN_VINT_WIDTH = 8;
export declare const createMatroskaSegment: (children: BytesAndOffset[]) => BytesAndOffset;

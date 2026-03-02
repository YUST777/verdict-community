import { type SeekHeadSegment } from './segments/all-segments';
export declare const getByteForSeek: ({ seekHeadSegment, offset, }: {
    seekHeadSegment: SeekHeadSegment;
    offset: number;
}) => number | null;

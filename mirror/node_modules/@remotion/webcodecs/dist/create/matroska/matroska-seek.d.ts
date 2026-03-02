import type { MatroskaElement } from '@remotion/media-parser';
export type Seek = {
    hexString: MatroskaElement;
    byte: number;
};
export declare const createMatroskaSeekHead: (seeks: Seek[]) => import("./matroska-utils").BytesAndOffset[];

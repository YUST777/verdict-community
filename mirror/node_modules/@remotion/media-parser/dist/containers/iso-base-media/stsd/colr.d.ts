import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { IccProfile } from '../parse-icc-profile';
type ExtraData = {
    colorType: 'transfer-characteristics';
    primaries: number;
    transfer: number;
    matrixIndex: number;
    fullRangeFlag: boolean;
} | {
    colorType: 'icc-profile';
    profile: Uint8Array;
    parsed: IccProfile;
};
export type ColorParameterBox = {
    type: 'colr-box';
} & ExtraData;
export declare const parseColorParameterBox: ({ iterator, size, }: {
    iterator: BufferIterator;
    size: number;
}) => ColorParameterBox;
export {};

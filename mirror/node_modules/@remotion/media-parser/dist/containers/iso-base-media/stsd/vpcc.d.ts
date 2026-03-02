import type { BufferIterator } from '../../../iterator/buffer-iterator';
export interface VpccBox {
    type: 'vpcc-box';
    profile: number;
    level: number;
    bitDepth: number;
    chromaSubsampling: number;
    videoFullRangeFlag: number;
    videoColorPrimaries: number;
    videoTransferCharacteristics: number;
    videoMatrixCoefficients: number;
    codecInitializationDataSize: number;
    codecInitializationData: Uint8Array;
    codecString: string;
}
export declare const parseVpcc: ({ data, size, }: {
    data: BufferIterator;
    size: number;
}) => VpccBox;

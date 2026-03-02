export type MediaParserMatrixCoefficients = 'rgb' | 'bt709' | 'bt470bg' | 'smpte170m' | 'bt2020-ncl';
export declare const getMatrixCoefficientsFromIndex: (index: number) => MediaParserMatrixCoefficients | null;
export type MediaParserTransferCharacteristics = 'bt709' | 'smpte170m' | 'iec61966-2-1' | 'linear' | 'pq' | 'hlg';
export declare const getTransferCharacteristicsFromIndex: (index: number) => MediaParserTransferCharacteristics | null;
export type MediaParserPrimaries = 'bt709' | 'bt470bg' | 'smpte170m' | 'bt2020' | 'smpte432' | null;
export declare const getPrimariesFromIndex: (index: number) => MediaParserPrimaries | null;

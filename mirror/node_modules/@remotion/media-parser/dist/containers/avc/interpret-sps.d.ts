import type { MediaParserAdvancedColor } from '../../get-tracks';
import type { SpsInfo } from './parse-avc';
export declare const getDimensionsFromSps: (sps: SpsInfo) => {
    height: number;
    width: number;
};
export declare const getSampleAspectRatioFromSps: (sps: SpsInfo) => {
    width: number;
    height: number;
};
export declare const getVideoColorFromSps: (sps: SpsInfo) => MediaParserAdvancedColor;

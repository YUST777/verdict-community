import type { Mp3Info } from '../../../state/mp3';
import { type XingData } from '../parse-xing';
export declare const getSeekPointFromXing: ({ timeInSeconds, xingData, mp3Info, }: {
    timeInSeconds: number;
    xingData: XingData;
    mp3Info: Mp3Info;
}) => number;

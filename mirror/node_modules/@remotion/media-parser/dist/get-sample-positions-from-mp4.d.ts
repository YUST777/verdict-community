import type { TrakBox } from './containers/iso-base-media/trak/trak';
import type { SamplePosition } from './get-sample-positions';
export declare const getGroupedSamplesPositionsFromMp4: ({ trakBox, bigEndian, }: {
    trakBox: TrakBox;
    bigEndian: boolean;
}) => SamplePosition[];

import type { CttsBox } from './containers/iso-base-media/stsd/ctts';
import type { StcoBox } from './containers/iso-base-media/stsd/stco';
import type { StscBox } from './containers/iso-base-media/stsd/stsc';
import type { StssBox } from './containers/iso-base-media/stsd/stss';
import type { StszBox } from './containers/iso-base-media/stsd/stsz';
import type { SttsBox } from './containers/iso-base-media/stsd/stts';
export type SamplePosition = {
    offset: number;
    size: number;
    isKeyframe: boolean;
    decodingTimestamp: number;
    timestamp: number;
    duration: number;
    chunk: number;
    bigEndian: boolean;
    chunkSize: number | null;
};
export declare const getSamplePositions: ({ stcoBox, stszBox, stscBox, stssBox, sttsBox, cttsBox, }: {
    stcoBox: StcoBox;
    stszBox: StszBox;
    stscBox: StscBox;
    stssBox: StssBox | null;
    sttsBox: SttsBox;
    cttsBox: CttsBox | null;
}) => SamplePosition[];

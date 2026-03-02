import type { SamplePosition } from '../../get-sample-positions';
import type { MoofBox } from '../../state/iso-base-media/precomputed-moof';
import type { TrexBox } from './moov/trex';
import type { TrakBox } from './trak/trak';
export declare const getSamplePositionsFromTrack: ({ trakBox, moofBoxes, moofComplete, trexBoxes, }: {
    trakBox: TrakBox;
    moofBoxes: MoofBox[];
    moofComplete: boolean;
    trexBoxes: TrexBox[];
}) => {
    samplePositions: SamplePosition[];
    isComplete: boolean;
};

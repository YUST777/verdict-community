import type { MoofBox } from '../../state/iso-base-media/precomputed-moof';
import type { TrexBox } from './moov/trex';
import type { TkhdBox } from './tkhd';
export declare const collectSamplePositionsFromMoofBoxes: ({ moofBoxes, tkhdBox, isComplete, trexBoxes, }: {
    moofBoxes: MoofBox[];
    tkhdBox: TkhdBox;
    isComplete: boolean;
    trexBoxes: TrexBox[];
}) => {
    samplePositions: {
        isLastFragment: boolean;
        samples: import("../..").SamplePosition[];
    }[];
    isComplete: boolean;
};

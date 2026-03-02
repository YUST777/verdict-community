import type { TrexBox } from './containers/iso-base-media/moov/trex';
import type { SamplePosition } from './get-sample-positions';
import type { MoofBox } from './state/iso-base-media/precomputed-moof';
export declare const getSamplesFromMoof: ({ moofBox, trackId, trexBoxes, }: {
    moofBox: MoofBox;
    trackId: number;
    trexBoxes: TrexBox[];
}) => SamplePosition[];

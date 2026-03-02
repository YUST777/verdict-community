import type { MoofBox } from '../../state/iso-base-media/precomputed-moof';
import type { TfraBox } from './mfra/tfra';
export declare const areSamplesComplete: ({ moofBoxes, tfraBoxes, }: {
    moofBoxes: MoofBox[];
    tfraBoxes: TfraBox[];
}) => boolean;

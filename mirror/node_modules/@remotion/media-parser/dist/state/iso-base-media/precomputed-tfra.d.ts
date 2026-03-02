import type { TfraBox } from '../../containers/iso-base-media/mfra/tfra';
export declare const precomputedTfraState: () => {
    getTfraBoxes: () => TfraBox[];
    setTfraBoxes: (boxes: TfraBox[]) => void;
};
export declare const deduplicateTfraBoxesByOffset: (tfraBoxes: TfraBox[]) => TfraBox[];

import type { IsoBaseMediaBox } from '../../containers/iso-base-media/base-media-box';
export type MoofBox = {
    offset: number;
    size: number;
    trafBoxes: IsoBaseMediaBox[];
};
export declare const precomputedMoofState: () => {
    getMoofBoxes: () => MoofBox[];
    setMoofBoxes: (boxes: MoofBox[]) => void;
};
export declare const toMoofBox: (box: IsoBaseMediaBox) => MoofBox;
export declare const deduplicateMoofBoxesByOffset: (moofBoxes: MoofBox[]) => MoofBox[];

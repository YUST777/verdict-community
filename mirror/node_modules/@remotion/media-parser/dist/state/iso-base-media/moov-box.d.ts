import type { MoovBox } from '../../containers/iso-base-media/moov/moov';
type MoovBoxAndPrecomputed = {
    moovBox: MoovBox;
    precomputed: boolean;
};
export declare const moovState: () => {
    setMoovBox: (moov: MoovBoxAndPrecomputed) => void;
    getMoovBoxAndPrecomputed: () => MoovBoxAndPrecomputed | null;
};
export {};

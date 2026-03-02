type MaxRes = {
    width: number;
    height: number;
    fps: number;
};
interface HEVCLevel {
    level: string;
    maxBitrateMainTier: number;
    maxBitrateHighTier: number | null;
    maxResolutionsAndFrameRates: MaxRes[];
}
export declare const hevcLevels: HEVCLevel[];
export {};

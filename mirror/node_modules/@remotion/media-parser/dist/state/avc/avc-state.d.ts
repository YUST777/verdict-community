import type { SpsInfo } from '../../containers/avc/parse-avc';
export declare const avcState: () => {
    getPrevPicOrderCntLsb(): number;
    getPrevPicOrderCntMsb(): number;
    setPrevPicOrderCntLsb(value: number): void;
    setPrevPicOrderCntMsb(value: number): void;
    setSps(value: SpsInfo): void;
    getSps(): SpsInfo | null;
    getMaxFramesInBuffer(): number | null;
    clear(): void;
};
export type AvcState = ReturnType<typeof avcState>;

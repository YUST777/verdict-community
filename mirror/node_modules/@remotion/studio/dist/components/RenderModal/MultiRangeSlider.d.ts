import type { FC } from 'react';
interface MultiRangeSliderProps {
    readonly min: number;
    readonly max: number;
    readonly start: number;
    readonly end: number;
    readonly step: number;
    readonly onLeftThumbDrag: (newVal: number) => void;
    readonly onRightThumbDrag: (newVal: number) => void;
}
export declare const MultiRangeSlider: FC<MultiRangeSliderProps>;
export {};
